import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    Plus, Trash2, Edit2, Loader2, Star, X, Save, AlertCircle, MoveUp, MoveDown,
    Eye, EyeOff, Upload, Image as ImageIcon, ExternalLink, Tag as TagIcon, Briefcase,
    LayoutGrid, Check, Search
} from "lucide-react";
import { servicesSupabase as supabase, isServicesSupabaseConfigured } from "@/integrations/supabase/servicesClient";
import { motion, AnimatePresence } from "framer-motion";

interface PortfolioProject {
    id: string;
    title: string;
    description: string;
    category: string;
    client: string;
    tags: string[];
    image_url: string;
    thumbnail_url?: string;
    project_url?: string;
    is_featured: boolean;
    is_active: boolean;
    order_index: number;
    views_count: number;
    created_at?: string;
    updated_at?: string;
}

const CATEGORY_OPTIONS = [
    { value: "branding", label: "Branding", color: "from-pink-500 to-rose-500", text: "text-pink-400" },
    { value: "web-design", label: "Web Design", color: "from-blue-500 to-cyan-500", text: "text-blue-400" },
    { value: "social-media", label: "Social Media", color: "from-purple-500 to-pink-500", text: "text-purple-400" },
    { value: "3d-modeling", label: "3D Modeling", color: "from-orange-500 to-red-500", text: "text-orange-400" },
    { value: "video-editing", label: "Video Editing", color: "from-green-500 to-emerald-500", text: "text-green-400" },
];

const COMMON_TAGS = [
    "BRANDING", "DESIGN", "DEVELOPMENT", "UI/UX", "FIGMA", "REACT",
    "SOCIAL", "CAMPAIGN", "CONTENT", "3D ART", "ANIMATION", "PRODUCT",
    "VIDEO EDITING", "MOTION", "COLOR", "MOBILE", "WEB"
];

export const PortfolioFrontSection = () => {
    const [projects, setProjects] = useState<PortfolioProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "branding",
        client: "",
        tags: [] as string[],
        image_url: "",
        project_url: "",
        is_featured: false,
        is_active: true,
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [newTag, setNewTag] = useState("");

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("portfolio_projects")
                .select("*")
                .order("order_index", { ascending: true });

            if (error) throw error;
            setProjects(data || []);
        } catch (error: any) {
            console.error("Error fetching portfolio:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!form.title.trim()) newErrors.title = "Project title is required";
        if (!form.category) newErrors.category = "Category is required";
        if (!form.image_url && !imageFile) newErrors.image_url = "Project image is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const uploadImage = async (file: File): Promise<string | null> => {
        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `project-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data, error } = await supabase.storage
                .from('portfolio-images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('portfolio-images')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error: any) {
            console.error('Error uploading image:', error);
            toast.error(`Upload failed: ${error.message}`);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error("Please upload an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be under 5MB");
            return;
        }

        setImageFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setSaving(true);

        try {
            let imageUrl = form.image_url;

            if (imageFile) {
                const uploadedUrl = await uploadImage(imageFile);
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                } else {
                    setSaving(false);
                    return;
                }
            }

            const projectData = {
                ...form,
                image_url: imageUrl,
                updated_at: new Date().toISOString()
            };

            if (editingId) {
                const { data, error } = await supabase
                    .from("portfolio_projects")
                    .update(projectData)
                    .eq("id", editingId)
                    .select();

                if (error) throw error;
                if (!data || data.length === 0) {
                    throw new Error("Update failed: Database permission denied or record missing.");
                }
                toast.success("Project updated successfully!");
            } else {
                const maxOrder = projects.length > 0 ? Math.max(...projects.map(p => p.order_index)) : 0;
                const { error } = await supabase
                    .from("portfolio_projects")
                    .insert([{ ...projectData, order_index: maxOrder + 1 }]);

                if (error) throw error;
                toast.success("Project created successfully!");
            }

            resetForm();
            fetchProjects();
        } catch (error: any) {
            toast.error(`Failed to save project: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

        try {
            const { error } = await supabase
                .from("portfolio_projects")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast.success("Project deleted successfully");
            fetchProjects();
        } catch (error: any) {
            toast.error(`Failed to delete project: ${error.message}`);
        }
    };

    const handleMove = async (id: string, direction: "up" | "down") => {
        const index = projects.findIndex(p => p.id === id);
        if (index === -1) return;
        if (direction === "up" && index === 0) return;
        if (direction === "down" && index === projects.length - 1) return;

        const newIndex = direction === "up" ? index - 1 : index + 1;
        const updatedProjects = [...projects];
        [updatedProjects[index], updatedProjects[newIndex]] = [updatedProjects[newIndex], updatedProjects[index]];

        try {
            await Promise.all([
                supabase.from("portfolio_projects").update({ order_index: newIndex }).eq("id", projects[index].id),
                supabase.from("portfolio_projects").update({ order_index: index }).eq("id", projects[newIndex].id)
            ]);
            fetchProjects();
        } catch (error: any) {
            toast.error("Failed to reorder projects");
        }
    };

    const resetForm = () => {
        setForm({
            title: "",
            description: "",
            category: "branding",
            client: "",
            tags: [],
            image_url: "",
            project_url: "",
            is_featured: false,
            is_active: true,
        });
        setImageFile(null);
        setImagePreview(null);
        setIsAdding(false);
        setEditingId(null);
        setErrors({});
    };

    const handleEdit = (project: PortfolioProject) => {
        setForm({
            title: project.title,
            description: project.description,
            category: project.category,
            client: project.client,
            tags: project.tags || [],
            image_url: project.image_url,
            project_url: project.project_url || "",
            is_featured: project.is_featured,
            is_active: project.is_active,
        });
        setImagePreview(project.image_url);
        setEditingId(project.id);
        setIsAdding(true);
        setErrors({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const addTag = (tag: string) => {
        const trimmedTag = tag.trim().toUpperCase();
        if (trimmedTag && !form.tags.includes(trimmedTag)) {
            setForm({ ...form, tags: [...form.tags, trimmedTag] });
            setNewTag("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setForm({ ...form, tags: form.tags.filter(t => t !== tagToRemove) });
    };

    const filteredProjects = projects.filter(project => {
        const matchesCategory = filterCategory === "all" || project.category === filterCategory;
        const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (!isServicesSupabaseConfigured) {
        return (
            <div className="glass-card p-16 text-center border-dashed border-red-500/30">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Supabase Not Configured</h3>
                <p className="text-muted-foreground mb-4">
                    Please configure the Services Supabase credentials in your .env file to manage the portfolio.
                </p>
                <div className="text-left max-w-md mx-auto bg-black/50 p-4 rounded-lg font-mono text-xs space-y-1 text-slate-400">
                    <p>VITE_SERVICES_SUPABASE_URL</p>
                    <p>VITE_SERVICES_SUPABASE_KEY</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in relative">
            {/* Background Flair */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-display font-bold text-gradient">Portfolio Showcase</h2>
                    <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-primary" />
                        Manage your public portfolio projects • {projects.length} Total
                    </p>
                </div>
                <Button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-gradient-primary rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95"
                >
                    {isAdding ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                    {isAdding ? "Close Editor" : "Add New Project"}
                </Button>
            </div>

            {/* Add/Edit Form */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="glass-card p-6 md:p-8 border-primary/20 relative overflow-hidden">
                            {/* Decorative Form Background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10" />

                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center border border-primary/20">
                                        {editingId ? <Edit2 className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">
                                            {editingId ? "Edit Project" : "Create New Project"}
                                        </h3>
                                        <p className="text-xs text-muted-foreground">Fill in the details below to showcase your work.</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {/* Toggles - Segmented Control Style */}
                                    <div className="flex items-center bg-black/40 p-1 rounded-lg border border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, is_active: !form.is_active })}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${form.is_active ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'text-slate-400 hover:text-white'}`}
                                        >
                                            {form.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                            {form.is_active ? "Visible" : "Hidden"}
                                        </button>
                                        <div className="w-px h-4 bg-white/10 mx-1" />
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, is_featured: !form.is_featured })}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${form.is_featured ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20' : 'text-slate-400 hover:text-white'}`}
                                        >
                                            <Star className={`h-3 w-3 ${form.is_featured ? "fill-current" : ""}`} />
                                            Featured
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Left Column: Media */}
                                <div className="lg:col-span-4 space-y-6">
                                    <div className="space-y-4">
                                        <label className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between">
                                            Project Cover <span className="text-red-400 text-xs normal-case font-normal">*Required</span>
                                        </label>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />

                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer group flex flex-col items-center justify-center overflow-hidden aspect-video ${errors.image_url ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 hover:border-primary/50 hover:bg-white/5'}`}
                                        >
                                            {imagePreview ? (
                                                <>
                                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                                                        <ImageIcon className="h-8 w-8 text-white mb-2" />
                                                        <span className="text-xs font-medium text-white px-3 py-1.5 bg-white/10 rounded-full border border-white/20">Change Image</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center p-6 space-y-4">
                                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 border border-white/5 group-hover:border-primary/20 group-hover:bg-primary/10">
                                                        <Upload className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-200">Click to upload image</p>
                                                        <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or GIF (Max 5MB)</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {errors.image_url && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.image_url}</p>}
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-bold uppercase tracking-widest text-slate-400">Category</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {CATEGORY_OPTIONS.map(cat => (
                                                <button
                                                    key={cat.value}
                                                    type="button"
                                                    onClick={() => setForm({ ...form, category: cat.value })}
                                                    className={`px-3 py-3 rounded-lg text-xs font-medium transition-all border text-left relative overflow-hidden group ${form.category === cat.value ? 'border-primary bg-primary/10 text-white' : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'}`}
                                                >
                                                    <div className={`absolute inset-0 bg-gradient-to-r ${cat.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                                                    <span className="relative z-10">{cat.label}</span>
                                                    {form.category === cat.value && (
                                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Details */}
                                <div className="lg:col-span-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold uppercase tracking-widest text-slate-400">Project Title</label>
                                            <div className="relative">
                                                <Input
                                                    value={form.title}
                                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                                    className={`bg-white/5 border-white/10 focus:border-primary/50 text-white h-11 pl-4 ${errors.title ? 'border-red-500/50' : ''}`}
                                                    placeholder="e.g. Neon Cyberpunk Branding"
                                                />
                                                {errors.title && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold uppercase tracking-widest text-slate-400">Client Name</label>
                                            <Input
                                                value={form.client}
                                                onChange={e => setForm({ ...form, client: e.target.value })}
                                                className="bg-white/5 border-white/10 focus:border-primary/50 text-white h-11 pl-4"
                                                placeholder="e.g. TechCorp Inc."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold uppercase tracking-widest text-slate-400">Description</label>
                                        <Textarea
                                            value={form.description}
                                            onChange={e => setForm({ ...form, description: e.target.value })}
                                            className="bg-white/5 border-white/10 focus:border-primary/50 min-h-[120px] text-white resize-none leading-relaxed p-4"
                                            placeholder="Describe the project, challenges, and solutions..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                            Live Project URL <span className="text-muted-foreground text-xs normal-case font-normal">(Optional)</span>
                                        </label>
                                        <div className="relative">
                                            <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                            <Input
                                                value={form.project_url}
                                                onChange={e => setForm({ ...form, project_url: e.target.value })}
                                                className="bg-white/5 border-white/10 focus:border-primary/50 text-white h-11 pl-10 font-mono text-sm"
                                                placeholder="https://example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                            <TagIcon className="h-3 w-3" /> Tags
                                        </label>

                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                            <div className="flex gap-2 flex-wrap mb-4 min-h-[30px]">
                                                {form.tags.length === 0 && <span className="text-sm text-slate-500 italic">No tags selected</span>}
                                                {form.tags.map(tag => (
                                                    <span key={tag} className="pl-3 pr-2 py-1.5 bg-primary/20 text-primary border border-primary/20 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 group hover:bg-primary/30 transition-colors">
                                                        {tag}
                                                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-white transition-colors">
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex gap-2 border-t border-white/5 pt-4">
                                                <div className="relative flex-1">
                                                    <Input
                                                        value={newTag}
                                                        onChange={e => setNewTag(e.target.value)}
                                                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag(newTag))}
                                                        className="bg-black/20 border-white/10 focus:border-primary/50 h-9 text-sm"
                                                        placeholder="Type tag and press Enter"
                                                    />
                                                </div>
                                                <Button type="button" onClick={() => addTag(newTag)} size="sm" className="bg-white/10 hover:bg-white/20 text-white h-9 px-4">
                                                    Add
                                                </Button>
                                            </div>

                                            <div className="flex gap-2 flex-wrap mt-3">
                                                <span className="text-[10px] text-slate-500 uppercase font-bold py-1">Suggestions:</span>
                                                {COMMON_TAGS.filter(t => !form.tags.includes(t)).slice(0, 6).map(tag => (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        onClick={() => addTag(tag)}
                                                        className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 text-[10px] text-slate-400 hover:text-white rounded transition-all"
                                                    >
                                                        + {tag}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-12 flex items-center gap-4 pt-6 mt-2 border-t border-white/5">
                                    <Button type="submit" disabled={saving} className="bg-gradient-primary h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                                        {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                                        {saving ? "Saving..." : editingId ? "Update Project" : "Create Project"}
                                    </Button>
                                    <Button type="button" onClick={resetForm} variant="ghost" className="h-12 px-6 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filters & Toolbar */}
            <div className="sticky top-20 z-20 glass-card p-2 md:p-3 flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-xl border-white/10">
                <div className="flex gap-1 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide mask-fade-right">
                    <button
                        onClick={() => setFilterCategory("all")}
                        className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap overflow-hidden group ${filterCategory === "all" ? "text-white" : "text-slate-400 hover:text-white"}`}
                    >
                        {filterCategory === "all" && (
                            <motion.div layoutId="activeCat" className="absolute inset-0 bg-white/10 rounded-lg border border-white/10" transition={{ duration: 0.2 }} />
                        )}
                        <span className="relative z-10">All</span>
                    </button>
                    {CATEGORY_OPTIONS.map(cat => (
                        <button
                            key={cat.value}
                            onClick={() => setFilterCategory(cat.value)}
                            className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap overflow-hidden group ${filterCategory === cat.value ? "text-white" : "text-slate-400 hover:text-white"}`}
                        >
                            {filterCategory === cat.value && (
                                <motion.div layoutId="activeCat" className={`absolute inset-0 bg-gradient-to-r ${cat.color} opacity-20 rounded-lg border border-white/10`} transition={{ duration: 0.2 }} />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                {cat.label}
                                {filterCategory === cat.value && <div className={`w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_5px_currentColor] ${cat.text}`} />}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-auto group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                    <Input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search projects..."
                        className="pl-10 bg-black/20 border-white/5 focus:border-primary/50 w-full md:w-64 h-10 transition-all focus:w-full md:focus:w-72 rounded-xl"
                    />
                </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-32 space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                            <Loader2 className="relative h-12 w-12 animate-spin text-primary" />
                        </div>
                        <span className="text-sm text-slate-400 uppercase tracking-widest font-bold animate-pulse">Loading Projects...</span>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="col-span-full glass-card p-20 text-center border-dashed border-white/10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <LayoutGrid className="h-10 w-10 text-slate-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">No projects found</h3>
                        <p className="text-slate-400 max-w-md mx-auto mb-8">
                            We couldn't find any projects matching your filters. Try adjusting your search or add a new project.
                        </p>
                        <Button
                            onClick={() => { setFilterCategory("all"); setSearchQuery(""); setIsAdding(true); }}
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/10"
                        >
                            Reset filters & Add Project
                        </Button>
                    </div>
                ) : (
                    filteredProjects.map((project, index) => {
                        const category = CATEGORY_OPTIONS.find(c => c.value === project.category);
                        return (
                            <motion.div
                                key={project.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05, duration: 0.4 }}
                                className={`group relative bg-[#0f0a1f] border border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 ${!project.is_active ? 'opacity-60 grayscale-[0.8]' : ''}`}
                            >
                                {/* Active/Features Badges */}
                                <div className="absolute top-3 left-3 z-20 flex gap-2">
                                    {!project.is_active && (
                                        <div className="bg-black/80 backdrop-blur-md text-slate-300 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-white/10">
                                            <EyeOff className="h-3 w-3" /> Hidden
                                        </div>
                                    )}
                                    {project.is_featured && (
                                        <div className="bg-yellow-500/90 backdrop-blur-md text-black px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-yellow-500/20">
                                            <Star className="h-3 w-3 fill-current" /> Featured
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons Overlay */}
                                <div className="absolute top-3 right-3 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEdit(project); }}
                                        className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-colors"
                                        title="Edit"
                                        aria-label="Edit project"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(project.id, project.title); }}
                                        className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                                        title="Delete"
                                        aria-label="Delete project"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Image Area */}
                                <div className="relative h-64 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0f0a1f] z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
                                    <img
                                        src={project.image_url}
                                        alt={project.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                    />
                                    <div className="absolute bottom-0 left-0 p-5 z-20 w-full translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                        <div className={`text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2 ${category?.text || "text-slate-400"}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full bg-current`}></span>
                                            {category?.label}
                                        </div>
                                        <h3 className="text-xl font-bold text-white leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                            {project.title}
                                        </h3>
                                        <p className="text-sm text-slate-400 font-medium truncate">
                                            {project.client || "Self Initiated"}
                                        </p>
                                    </div>
                                </div>

                                {/* Sorting & Quick Stats */}
                                <div className="px-5 pb-5 pt-2 flex justify-between items-center border-t border-white/5 bg-[#0f0a1f]">
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleMove(project.id, "up")}
                                            disabled={index === 0}
                                            className="h-6 w-6 text-slate-600 hover:text-white hover:bg-white/5"
                                            aria-label="Move up"
                                        >
                                            <MoveUp className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleMove(project.id, "down")}
                                            disabled={index === filteredProjects.length - 1}
                                            className="h-6 w-6 text-slate-600 hover:text-white hover:bg-white/5"
                                            aria-label="Move down"
                                        >
                                            <MoveDown className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <div className="text-[10px] text-slate-600 font-mono">
                                        #{project.order_index}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Minimal Footer */}
            <div className="border-t border-white/5 pt-8 text-center text-slate-500 text-xs font-mono">
                {projects.length} Total Projects • Sorted by display order
            </div>
        </div>
    );
};
