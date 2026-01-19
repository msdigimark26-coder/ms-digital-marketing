import { useState, useEffect, useRef } from "react";
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

export const AssetsSection = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [form, setForm] = useState({
        title: "",
        link: "",
        description: "",
        cover_image_url: "" as string | null
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("assets")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setAssets(data || []);
        } catch (error: any) {
            console.error("Error fetching assets:", error);
            toast.error("Failed to load assets");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAssets(); }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (!file) return;

            if (file.size > 50 * 1024 * 1024) {
                toast.error("File size should be less than 50MB");
                return;
            }

            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('asset_covers')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('asset_covers')
                .getPublicUrl(filePath);

            setForm(prev => ({ ...prev, cover_image_url: data.publicUrl }));
            toast.success("Cover image uploaded");
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error("Upload failed: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.link) {
            toast.error("Title and Link are required");
            return;
        }

        try {
            const assetData = {
                title: form.title,
                link: form.link,
                description: form.description,
                cover_image_url: form.cover_image_url
            };

            if (editingId) {
                const { error } = await supabase
                    .from("assets")
                    .update(assetData)
                    .eq("id", editingId);
                if (error) throw error;
                toast.success("Asset updated successfully");
            } else {
                const { error } = await supabase
                    .from("assets")
                    .insert([assetData]);
                if (error) throw error;
                toast.success("Asset created successfully");
            }

            // Reset and refresh
            setForm({ title: "", link: "", description: "", cover_image_url: null });
            setIsAdding(false);
            setEditingId(null);
            fetchAssets();
        } catch (error: any) {
            console.error("Save error:", error);
            toast.error(error.message);
        }
    };

    const handleEdit = (asset: Asset) => {
        setForm({
            title: asset.title,
            link: asset.link,
            description: asset.description || "",
            cover_image_url: asset.cover_image_url
        });
        setEditingId(asset.id);
        setIsAdding(true);
        // Scroll to top of form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this asset?")) return;
        try {
            const { error } = await supabase
                .from("assets")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast.success("Asset deleted");
            setAssets(prev => prev.filter(a => a.id !== id));
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-gradient">Asset Library</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Manage digital assets and external resources.</p>
                </div>
                <Button
                    onClick={() => {
                        if (isAdding) {
                            setIsAdding(false);
                            setEditingId(null);
                            setForm({ title: "", link: "", description: "", cover_image_url: null });
                        } else {
                            setIsAdding(true);
                        }
                    }}
                    className="bg-gradient-primary w-full md:w-auto"
                >
                    {isAdding ? "Cancel" : <><Plus className="mr-2 h-4 w-4" /> New Asset</>}
                </Button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="glass-card p-6 border-primary/20 bg-primary/5">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                {editingId ? <Edit2 className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                                {editingId ? "Edit Asset" : "Create New Asset"}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Asset Title *</label>
                                        <Input
                                            placeholder="e.g. Brand Guidelines 2026"
                                            value={form.title}
                                            onChange={e => setForm({ ...form, title: e.target.value })}
                                            className="bg-black/20 border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Asset Link *</label>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                            <Input
                                                placeholder="https://..."
                                                value={form.link}
                                                onChange={e => setForm({ ...form, link: e.target.value })}
                                                className="bg-black/20 border-white/10 pl-9"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</label>
                                        <Textarea
                                            placeholder="Brief description of this asset..."
                                            value={form.description}
                                            onChange={e => setForm({ ...form, description: e.target.value })}
                                            className="bg-black/20 border-white/10 min-h-[100px]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cover Image (Optional)</label>
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-white/10 rounded-xl p-8 hover:bg-white/5 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[200px] relative group overflow-hidden"
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                            />

                                            {form.cover_image_url ? (
                                                <>
                                                    <img src={form.cover_image_url} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                                                    <div className="relative z-10 flex flex-col items-center">
                                                        <div className="h-10 w-10 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm mb-2">
                                                            <Edit2 className="h-5 w-5 text-white" />
                                                        </div>
                                                        <span className="text-xs text-white font-medium shadow-black drop-shadow-md">Click to replace</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary">
                                                        {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                                                    </div>
                                                    <div className="text-sm font-medium text-slate-300">
                                                        {uploading ? "Uploading..." : "Click to upload cover"}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1">PNG, JPG up to 50MB</div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
                                <Button variant="ghost" onClick={() => setIsAdding(false)} className="hover:bg-white/5">Cancel</Button>
                                <Button onClick={handleSave} className="bg-gradient-primary w-32" disabled={uploading}>
                                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingId ? "Update" : "Create Asset")}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Assets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="glass-card h-[300px] animate-pulse bg-white/5" />
                    ))
                ) : assets.length === 0 ? (
                    <div className="col-span-full py-20 text-center flex flex-col items-center justify-center text-muted-foreground border border-dashed border-white/10 rounded-xl">
                        <Package className="h-12 w-12 mb-4 opacity-20" />
                        <p>No assets in the library yet.</p>
                        <Button variant="link" onClick={() => setIsAdding(true)} className="text-primary mt-2">Create your first asset</Button>
                    </div>
                ) : (
                    assets.map((asset) => (
                        <motion.div
                            key={asset.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card group overflow-hidden flex flex-col h-full hover:border-primary/50 transition-all duration-300"
                        >
                            {/* Card Image */}
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

                                {/* Overlay Actions */}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(asset)}
                                        className="h-8 w-8 bg-black/60 backdrop-blur-md rounded-lg flex items-center justify-center text-white hover:bg-primary hover:text-white transition-colors"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(asset.id)}
                                        className="h-8 w-8 bg-black/60 backdrop-blur-md rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="font-bold text-lg text-white mb-2 line-clamp-1" title={asset.title}>{asset.title}</h3>
                                <p className="text-sm text-slate-400 line-clamp-2 mb-6 flex-1">{asset.description || "No description provided."}</p>

                                <a
                                    href={asset.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-semibold text-primary transition-all group-hover:bg-primary/10"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    Open Asset
                                </a>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};
