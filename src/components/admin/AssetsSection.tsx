import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Link as LinkIcon, Image as ImageIcon, Loader2, Upload, ExternalLink, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Asset {
    id: string;
    title: string;
    link: string;
    description: string;
    cover_image_url: string | null;
}

const AssetCard = React.memo(({
    asset,
    onEdit,
    onDelete
}: {
    asset: Asset,
    onEdit: (a: Asset) => void,
    onDelete: (id: string) => void
}) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="glass-card group overflow-hidden flex flex-col h-full hover:border-primary/50 transition-all duration-300"
    >
        <div className="relative h-40 bg-black/40 border-b border-white/5 overflow-hidden">
            {asset.cover_image_url ? (
                <img
                    src={asset.cover_image_url}
                    alt={asset.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
                    <ImageIcon className="h-10 w-10 text-white/10" />
                </div>
            )}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onEdit(asset)}
                    className="h-8 w-8 bg-black/60 backdrop-blur-md rounded-lg flex items-center justify-center text-white hover:bg-primary hover:text-white transition-colors"
                    title="Edit"
                >
                    <Edit2 className="h-4 w-4" />
                </button>
                <button
                    onClick={() => onDelete(asset.id)}
                    className="h-8 w-8 bg-black/60 backdrop-blur-md rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                    title="Delete"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
            <h3 className="font-bold text-lg text-white mb-2 line-clamp-1" title={asset.title}>{asset.title}</h3>
            <p className="text-sm text-slate-400 line-clamp-2 mb-6 flex-1">{asset.description || "No description provided."}</p>
            <a
                href={asset.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-semibold text-primary transition-all group-hover:bg-primary/10"
            >
                <ExternalLink className="h-3 w-3" /> Open Asset
            </a>
        </div>
    </motion.div>
));

AssetCard.displayName = "AssetCard";

export const AssetsSection = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({ title: "", link: "", description: "", cover_image_url: "" as string | null });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchAssets = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const { data, error } = await supabase.from("assets").select("*").order("created_at", { ascending: false });
            if (error) throw error;
            setAssets(data || []);
        } catch (error: any) { console.error(error); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchAssets(); }, [fetchAssets]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 50 * 1024 * 1024) { toast.error("File limit 50MB"); return; }
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('asset_covers').upload(fileName, file);
            if (uploadError) throw uploadError;
            const { data } = supabase.storage.from('asset_covers').getPublicUrl(fileName);
            setForm(prev => ({ ...prev, cover_image_url: data.publicUrl }));
            toast.success("Cover uploaded");
        } catch (error: any) { toast.error(error.message); }
        finally { setUploading(false); }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.link) { toast.error("Required fields missing"); return; }
        try {
            if (editingId) {
                const { error } = await supabase.from("assets").update(form).eq("id", editingId);
                if (error) throw error;
                toast.success("Asset updated");
            } else {
                const { error } = await supabase.from("assets").insert([form]);
                if (error) throw error;
                toast.success("Asset created");
            }
            resetForm();
            fetchAssets(false);
        } catch (error: any) { toast.error(error.message); }
    };

    const resetForm = useCallback(() => {
        setForm({ title: "", link: "", description: "", cover_image_url: null });
        setIsAdding(false);
        setEditingId(null);
    }, []);

    const handleEdit = useCallback((asset: Asset) => {
        setForm({ title: asset.title, link: asset.link, description: asset.description || "", cover_image_url: asset.cover_image_url });
        setEditingId(asset.id);
        setIsAdding(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        if (!confirm("Delete this asset?")) return;
        try {
            const { error } = await supabase.from("assets").delete().eq("id", id);
            if (error) throw error;
            toast.success("Asset deleted");
            setAssets(prev => prev.filter(a => a.id !== id));
        } catch (error: any) { toast.error(error.message); }
    }, []);

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-3xl font-display font-bold text-gradient">Asset Library</h2>
                <Button onClick={() => isAdding ? resetForm() : setIsAdding(true)} className="bg-gradient-primary">
                    {isAdding ? "Cancel" : <><Plus className="mr-2 h-4 w-4" /> New Asset</>}
                </Button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                        <form onSubmit={handleSave} className="glass-card p-6 border-primary/20 bg-primary/5 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <Input placeholder="Asset Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                                    <Input placeholder="Asset Link *" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} required />
                                    <Textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                                </div>
                                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/10 rounded-xl p-8 hover:bg-white/5 cursor-pointer min-h-[200px] flex items-center justify-center relative overflow-hidden group">
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    {form.cover_image_url ? (
                                        <img src={form.cover_image_url} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                                    ) : (
                                        <div className="text-center">{uploading ? <Loader2 className="animate-spin mb-2 mx-auto" /> : <Upload className="mb-2 mx-auto" />}<span>Upload Cover</span></div>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                <Button variant="ghost" onClick={resetForm}>Cancel</Button>
                                <Button type="submit" className="bg-gradient-primary w-32" disabled={uploading}>{editingId ? "Update" : "Create"}</Button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading && assets.length === 0 ? (
                    [...Array(4)].map((_, i) => <div key={i} className="glass-card h-64 animate-pulse" />)
                ) : assets.length === 0 ? (
                    <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-xl">No assets found.</div>
                ) : (
                    assets.map(asset => <AssetCard key={asset.id} asset={asset} onEdit={handleEdit} onDelete={handleDelete} />)
                )}
            </div>
        </div>
    );
};
