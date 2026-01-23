import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Video, Loader2, Upload, Eye, EyeOff, LayoutGrid, Smartphone, MapPin } from "lucide-react";
import { reelsSupabase as supabase } from "@/integrations/supabase/reels-client";
import { motion, AnimatePresence } from "framer-motion";

interface Reel {
    id: string;
    title: string;
    description: string;
    video_url: string;
    aspect_ratio: '9:16' | '16:9';
    page_section: string[];
    is_active: boolean;
    created_at: string;
}

const PAGE_SECTIONS = [
    { id: 'home', label: 'Home Page' },
    { id: 'web-design', label: 'Web Design' },
    { id: 'seo', label: 'SEO Services' },
    { id: 'meta-ads', label: 'Meta Ads' },
    { id: 'google-ads', label: 'Google Ads' },
    { id: 'video-editing', label: 'Video & Photo Editing' },
    { id: '3d-modeling', label: '3D Modeling' }
];

export const ReelsSection = () => {
    const [reels, setReels] = useState<Reel[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [previewVideo, setPreviewVideo] = useState<string | null>(null);

    // Form State
    const [form, setForm] = useState({
        title: "",
        description: "",
        video_url: "",
        aspect_ratio: '9:16' as '9:16' | '16:9',
        page_section: ['home'] as string[],
        is_active: true
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchReels = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("reels")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setReels(data || []);
        } catch (error: any) {
            console.error("Error fetching reels:", error);
            toast.error("Failed to load reels");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReels(); }, []);

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (!file) return;

            if (!file.type.startsWith('video/')) {
                toast.error("Please upload a video file");
                return;
            }

            if (file.size > 100 * 1024 * 1024) {
                toast.error("Video size should be less than 100MB");
                return;
            }

            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('reels')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('reels')
                .getPublicUrl(filePath);

            setForm(prev => ({ ...prev, video_url: data.publicUrl }));
            setPreviewVideo(data.publicUrl);
            toast.success("Video uploaded successfully");
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error("Upload failed: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.video_url) {
            toast.error("Video is required");
            return;
        }

        try {
            const reelData = {
                title: form.title,
                description: form.description,
                video_url: form.video_url,
                aspect_ratio: form.aspect_ratio,
                page_section: form.page_section,
                is_active: form.is_active,
                updated_at: new Date().toISOString()
            };

            if (editingId) {
                const { error } = await supabase
                    .from("reels")
                    .update(reelData)
                    .eq("id", editingId);
                if (error) throw error;
                toast.success("Reel updated successfully");
            } else {
                const { error } = await supabase
                    .from("reels")
                    .insert([reelData]);
                if (error) throw error;
                toast.success("Reel created successfully");
            }

            resetForm();
            fetchReels();
        } catch (error: any) {
            console.error("Save error:", error);
            toast.error(error.message);
        }
    };

    const resetForm = () => {
        setForm({ title: "", description: "", video_url: "", aspect_ratio: '9:16', page_section: ['home'], is_active: true });
        setPreviewVideo(null);
        setIsAdding(false);
        setEditingId(null);
    };

    const handleEdit = (reel: Reel) => {
        setForm({
            title: reel.title || "",
            description: reel.description || "",
            video_url: reel.video_url,
            aspect_ratio: reel.aspect_ratio || '9:16',
            page_section: Array.isArray(reel.page_section) ? reel.page_section : [reel.page_section || 'home'],
            is_active: reel.is_active
        });
        setPreviewVideo(reel.video_url);
        setEditingId(reel.id);
        setIsAdding(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this reel?")) return;
        try {
            const { error } = await supabase
                .from("reels")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast.success("Reel deleted");
            setReels(prev => prev.filter(r => r.id !== id));
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const toggleStatus = async (reel: Reel) => {
        try {
            const { error } = await supabase
                .from("reels")
                .update({ is_active: !reel.is_active })
                .eq("id", reel.id);

            if (error) throw error;
            setReels(prev => prev.map(r => r.id === reel.id ? { ...r, is_active: !r.is_active } : r));
            toast.success(`Reel ${!reel.is_active ? 'activated' : 'deactivated'}`);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-gradient">Auto Reel Management</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Upload and manage promotional reels for different pages.</p>
                </div>
                <Button
                    onClick={() => isAdding ? resetForm() : setIsAdding(true)}
                    className="bg-gradient-primary w-full md:w-auto shadow-lg shadow-primary/20"
                >
                    {isAdding ? "Cancel" : <><Plus className="mr-2 h-4 w-4" /> New Reel</>}
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
                                {editingId ? <Edit2 className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                                {editingId ? "Edit Reel" : "Upload New Reel"}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reel Title</label>
                                        <Input
                                            placeholder="e.g. Winter Special Offer"
                                            value={form.title}
                                            onChange={e => setForm({ ...form, title: e.target.value })}
                                            className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:border-primary/50 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</label>
                                        <Textarea
                                            placeholder="Mention what this reel is about..."
                                            value={form.description}
                                            onChange={e => setForm({ ...form, description: e.target.value })}
                                            className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:border-primary/50 min-h-[100px] transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assign to Pages</label>
                                        <div className="flex flex-wrap gap-2 p-3 bg-black/20 border border-white/10 rounded-xl">
                                            {PAGE_SECTIONS.map(s => {
                                                const isSelected = form.page_section.includes(s.id);
                                                return (
                                                    <button
                                                        key={s.id}
                                                        type="button"
                                                        onClick={() => {
                                                            const newSections = isSelected
                                                                ? form.page_section.filter(id => id !== s.id)
                                                                : [...form.page_section, s.id];
                                                            // Ensure at least one is selected
                                                            if (newSections.length > 0) {
                                                                setForm({ ...form, page_section: newSections });
                                                            } else {
                                                                toast.error("At least one section must be selected");
                                                            }
                                                        }}
                                                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${isSelected
                                                            ? 'bg-primary text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                                                            : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
                                                            }`}
                                                    >
                                                        {s.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-white">Status</div>
                                                <div className="text-[10px] text-slate-500">{form.is_active ? 'Visible' : 'Hidden'}</div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setForm({ ...form, is_active: !form.is_active })}
                                                className={`h-6 w-11 rounded-full p-1 transition-all duration-300 ${form.is_active ? 'bg-primary shadow-[0_0_10px_rgba(168,85,247,0.4)]' : 'bg-slate-700'}`}
                                            >
                                                <div className={`h-4 w-4 rounded-full bg-white transition-transform duration-300 ${form.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </button>
                                        </div>

                                        <div className="space-y-2 flex flex-col justify-center">
                                            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Orientation</label>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setForm({ ...form, aspect_ratio: '9:16' })}
                                                    className={`p-2 rounded-lg border transition-all ${form.aspect_ratio === '9:16' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                                                    title="Vertical 9:16"
                                                >
                                                    <Smartphone className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setForm({ ...form, aspect_ratio: '16:9' })}
                                                    className={`p-2 rounded-lg border transition-all ${form.aspect_ratio === '16:9' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                                                    title="Horizontal 16:9"
                                                >
                                                    <LayoutGrid className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Video Source *</label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`border-2 border-dashed border-white/10 rounded-2xl p-4 hover:bg-white/5 transition-all cursor-pointer flex flex-col items-center justify-center relative group overflow-hidden bg-black/20 ${form.aspect_ratio === '9:16' ? 'aspect-[9/16] min-h-[350px]' : 'aspect-[16/9] min-h-[200px]'}`}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="video/*"
                                            onChange={handleVideoUpload}
                                        />

                                        {previewVideo ? (
                                            <div className="absolute inset-0 w-full h-full">
                                                <video
                                                    src={previewVideo}
                                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                                                    muted
                                                    loop
                                                    autoPlay
                                                    playsInline
                                                />
                                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="h-12 w-12 bg-primary/80 rounded-full flex items-center justify-center backdrop-blur-md mb-2 shadow-lg">
                                                        <Video className="h-6 w-6 text-white" />
                                                    </div>
                                                    <span className="text-sm text-white font-medium">Click to replace</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-center p-8">
                                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                                                    {uploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Upload className="h-8 w-8" />}
                                                </div>
                                                <div className="text-base font-semibold text-slate-300">
                                                    {uploading ? "Uploading..." : "Click to Upload Video"}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-2 max-w-[200px]">
                                                    MP4, MOV supported. Max 100MB.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-white/5">
                                <Button variant="ghost" onClick={resetForm} className="text-slate-400 hover:text-white hover:bg-white/5 rounded-lg pr-6 pl-6">Cancel</Button>
                                <Button
                                    onClick={handleSave}
                                    className="bg-gradient-primary w-44 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95"
                                    disabled={uploading || !form.video_url}
                                >
                                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingId ? "Update Reel" : "Publish Reel")}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {loading ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="glass-card aspect-[9/16] animate-pulse bg-white/5 rounded-2xl" />
                    ))
                ) : reels.length === 0 ? (
                    <div className="col-span-full py-24 text-center flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
                        <Video className="h-16 w-16 mb-4 opacity-10" />
                        <h3 className="text-xl font-medium text-slate-300">Start by creating a reel</h3>
                        <p className="text-sm text-slate-500 mt-2 max-w-sm">Bring your homepage to life with promotional videos and brand stories.</p>
                        <Button onClick={() => setIsAdding(true)} className="bg-primary/20 text-primary border border-primary/30 mt-6 hover:bg-primary/30 pr-8 pl-8">Create Reel</Button>
                    </div>
                ) : (
                    reels.map((reel) => (
                        <motion.div
                            key={reel.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card group relative flex flex-col bg-[#0B0816]/70 border-white/5 hover:border-primary/30 transition-all duration-500 rounded-2xl overflow-hidden shadow-xl"
                        >
                            {/* Card Header with Icons */}
                            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-xl border ${reel.is_active
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                                    : 'bg-rose-500/20 text-rose-400 border-rose-500/20'
                                    }`}>
                                    <div className={`h-1.5 w-1.5 rounded-full ${reel.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                                    {reel.is_active ? 'Active' : 'Private'}
                                </div>
                                <div className="px-2 py-1 rounded-md bg-black/40 backdrop-blur-md border border-white/10 text-white/60">
                                    {reel.aspect_ratio === '9:16' ? <Smartphone className="h-3 w-3" /> : <LayoutGrid className="h-3 w-3" />}
                                </div>
                            </div>

                            {/* Options Menu (Top Right) */}
                            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                <button
                                    onClick={() => toggleStatus(reel)}
                                    className="h-8 w-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-primary/80 transition-all shadow-lg"
                                    title={reel.is_active ? "Hide" : "Show"}
                                >
                                    {reel.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                </button>
                                <button
                                    onClick={() => handleEdit(reel)}
                                    className="h-8 w-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-emerald-500/80 transition-all shadow-lg"
                                    title="Edit"
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(reel.id)}
                                    className="h-8 w-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                                    title="Delete"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            {/* Video Display Area */}
                            <div className={`relative bg-black w-full overflow-hidden ${reel.aspect_ratio === '9:16' ? 'aspect-[9/16]' : 'aspect-[16/9]'}`}>
                                <video
                                    src={reel.video_url}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    muted
                                    loop
                                    playsInline
                                    onMouseOver={(e) => e.currentTarget.play()}
                                    onMouseOut={(e) => e.currentTarget.pause()}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                            </div>

                            {/* Text Info */}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {reel.page_section.slice(0, 3).map(sid => (
                                        <div key={sid} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                                            <MapPin className="h-2 w-2 text-primary" />
                                            <span className="text-[8px] font-bold uppercase tracking-wider text-primary">
                                                {PAGE_SECTIONS.find(s => s.id === sid)?.label || sid}
                                            </span>
                                        </div>
                                    ))}
                                    {reel.page_section.length > 3 && (
                                        <span className="text-[8px] font-bold text-slate-500">+{reel.page_section.length - 3}</span>
                                    )}
                                </div>
                                <h4 className="text-white font-bold text-base mb-1 line-clamp-1">{reel.title || "Untitled Reel"}</h4>
                                <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed h-8">{reel.description || "No description provided."}</p>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <style>{`
                .text-gradient {
                    background: linear-gradient(to right, #ffffff, #a855f7);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}</style>
        </div>
    );
};
