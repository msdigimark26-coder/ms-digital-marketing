import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Layers, Loader2, Star, Search, Share2, Code, Palette, Film, Box, X, Save, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { servicesSupabase, isServicesSupabaseConfigured } from "@/integrations/supabase/servicesClient";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { logActivity } from "@/utils/auditLogger";

interface Service {
    id: string;
    title: string;
    description: string;
    category: string;
    price: string;
    created_at?: string;
    updated_at?: string;
}

const CATEGORY_OPTIONS = [
    { value: "marketing", label: "Digital Marketing", icon: Share2 },
    { value: "seo", label: "SEO Services", icon: Search },
    { value: "web-development", label: "Web Development", icon: Code },
    { value: "design", label: "UI/UX Design", icon: Palette },
    { value: "video-production", label: "Video Production", icon: Film },
    { value: "3d-modeling", label: "3D Modeling", icon: Box },
    { value: "social-media", label: "Social Media", icon: Share2 },
    { value: "other", label: "Other Services", icon: Layers },
];

const ServiceCard = React.memo(({
    service,
    index,
    onEdit,
    onDelete,
    getIconForCategory,
    getCategoryLabel
}: {
    service: Service,
    index: number,
    onEdit: (s: Service) => void,
    onDelete: (id: string, title: string) => void,
    getIconForCategory: (cat: string) => any,
    getCategoryLabel: (cat: string) => string
}) => {
    const Icon = getIconForCategory(service.category);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-6 flex flex-col gap-4 group hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]"
        >
            <div className="flex justify-between items-start gap-4">
                <div className="flex gap-4 flex-1">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary border border-primary/20 shrink-0 group-hover:scale-110 transition-transform">
                        <Icon className="h-7 w-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-white mb-1 line-clamp-1">
                            {service.title}
                        </h3>
                        <p className="text-[10px] text-primary uppercase font-black tracking-widest mb-2">
                            {getCategoryLabel(service.category)}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                            {service.description}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 shrink-0">
                    <button
                        onClick={() => onEdit(service)}
                        className="p-2.5 hover:bg-white/5 rounded-xl text-muted-foreground hover:text-primary transition-all border border-transparent hover:border-primary/20"
                        title="Edit service"
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onDelete(service.id, service.title)}
                        className="p-2.5 hover:bg-rose-500/10 rounded-xl text-rose-500/50 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-rose-500/20"
                        title="Delete service"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-primary font-bold">
                    <Star className="h-4 w-4 fill-primary" />
                    <span className="text-sm">{service.price}</span>
                </div>
                {service.created_at && (
                    <span className="text-xs text-muted-foreground/50">
                        Added {new Date(service.created_at).toLocaleDateString()}
                    </span>
                )}
            </div>
        </motion.div>
    );
});

ServiceCard.displayName = "ServiceCard";

export const ServicesSection = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "marketing",
        price: ""
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const fetchServices = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const client = isServicesSupabaseConfigured ? servicesSupabase : supabase;
            const { data, error } = await client
                .from("services")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setServices(data || []);
        } catch (error: any) {
            console.error("Error fetching services:", error);
            toast.error("Failed to fetch services");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!form.title.trim()) newErrors.title = "Service title is required";
        if (!form.description.trim()) {
            newErrors.description = "Description is required";
        } else if (form.description.length < 20) {
            newErrors.description = "Description must be at least 20 characters";
        }
        if (!form.category) newErrors.category = "Please select a category";
        if (!form.price.trim()) newErrors.price = "Price information is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Please fix the errors before saving");
            return;
        }

        setSaving(true);
        try {
            const client = isServicesSupabaseConfigured ? servicesSupabase : supabase;
            if (editingId) {
                const { error } = await client
                    .from("services")
                    .update({ ...form })
                    .eq("id", editingId);
                if (error) throw error;

                // Log the update
                logActivity({
                    adminName: user?.user_metadata?.full_name || user?.email || "Admin",
                    adminEmail: user?.email || "Unknown",
                    actionType: 'update',
                    targetType: 'service',
                    targetId: editingId,
                    targetData: form,
                    description: `Updated service: ${form.title}`
                });

                toast.success("✨ Service updated successfully!");
            } else {
                const { error } = await client
                    .from("services")
                    .insert([form]);
                if (error) throw error;

                // Log the creation
                logActivity({
                    adminName: user?.user_metadata?.full_name || user?.email || "Admin",
                    adminEmail: user?.email || "Unknown",
                    actionType: 'create',
                    targetType: 'service',
                    description: `Created new service: ${form.title}`,
                    targetData: form
                });

                toast.success("🎉 New service added successfully!");
            }
            resetForm();
            fetchServices(false);
        } catch (error: any) {
            toast.error(`Failed to save service: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const resetForm = useCallback(() => {
        setForm({ title: "", description: "", category: "marketing", price: "" });
        setIsAdding(false);
        setEditingId(null);
        setErrors({});
    }, []);

    const handleEdit = useCallback((s: Service) => {
        setForm({
            title: s.title,
            description: s.description,
            category: s.category,
            price: s.price
        });
        setEditingId(s.id);
        setIsAdding(true);
        setErrors({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleDelete = useCallback(async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
        try {
            const client = isServicesSupabaseConfigured ? servicesSupabase : supabase;
            const { error } = await client.from("services").delete().eq("id", id);
            if (error) throw error;

            // Log the deletion
            logActivity({
                adminName: user?.user_metadata?.full_name || user?.email || "Admin",
                adminEmail: user?.email || "Unknown",
                actionType: 'delete',
                targetType: 'service',
                targetId: id,
                description: `Deleted service: ${title}`
            });

            toast.success("Service deleted successfully");
            setServices(prev => prev.filter(s => s.id !== id));
        } catch (error: any) {
            toast.error(`Failed to delete service: ${error.message}`);
        }
    }, []);

    const getIconForCategory = useCallback((category: string) => {
        const found = CATEGORY_OPTIONS.find(opt => opt.value === category);
        return found ? found.icon : Layers;
    }, []);

    const getCategoryLabel = useCallback((category: string) => {
        const found = CATEGORY_OPTIONS.find(opt => opt.value === category);
        return found ? found.label : category;
    }, []);

    const filteredServices = services.filter(service =>
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-gradient mb-2">Services Management</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage your service offerings • {services.length} total services
                    </p>
                </div>
                <Button onClick={() => isAdding ? resetForm() : setIsAdding(true)} className="bg-gradient-primary hover:opacity-90 shadow-lg">
                    {isAdding ? <><X className="mr-2 h-4 w-4" /> Cancel</> : <><Plus className="mr-2 h-4 w-4" /> Add New Service</>}
                </Button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                        <form onSubmit={handleSave} className="glass-card p-8 space-y-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                            <h3 className="text-xl font-bold text-white border-l-4 border-primary pl-3">
                                {editingId ? "Edit Service" : "Create New Service"}
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Service Title *</label>
                                    <Input value={form.title} onChange={e => { setForm({ ...form, title: e.target.value }); if (errors.title) setErrors({ ...errors, title: "" }); }} className={`bg-white/5 border-white/10 ${errors.title ? 'border-red-500' : ''}`} placeholder="e.g., Advanced SEO" />
                                    {errors.title && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.title}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Description *</label>
                                    <Textarea value={form.description} onChange={e => { setForm({ ...form, description: e.target.value }); if (errors.description) setErrors({ ...errors, description: "" }); }} className={`bg-white/5 border-white/10 min-h-[120px] ${errors.description ? 'border-red-500' : ''}`} placeholder="Details..." />
                                    {errors.description && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.description}</p>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Category *</label>
                                        <select value={form.category} onChange={e => { setForm({ ...form, category: e.target.value }); if (errors.category) setErrors({ ...errors, category: "" }); }} className={`w-full h-12 px-4 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:ring-2 focus:ring-primary/20 ${errors.category ? 'border-red-500' : ''}`}>
                                            {CATEGORY_OPTIONS.map(cat => <option key={cat.value} value={cat.value} className="bg-[#0A051A]">{cat.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Price Range *</label>
                                        <Input value={form.price} onChange={e => { setForm({ ...form, price: e.target.value }); if (errors.price) setErrors({ ...errors, price: "" }); }} className={`bg-white/5 border-white/10 ${errors.price ? 'border-red-500' : ''}`} placeholder="e.g., $500 - $2,000" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" disabled={saving} className="flex-1 bg-gradient-primary h-12 text-base font-semibold shadow-lg">
                                    {saving ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</> : <><Save className="mr-2 h-5 w-5" /> {editingId ? "Update" : "Create"}</>}
                                </Button>
                                <Button type="button" onClick={resetForm} variant="outline" className="px-6 h-12">Cancel</Button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {services.length > 0 && (
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Search services..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-12 bg-white/5 border-white/10 h-12" />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-50 mx-auto" /><p className="text-muted-foreground mt-4">Loading...</p></div>
                ) : filteredServices.length === 0 ? (
                    <div className="col-span-full glass-card p-16 text-center border-dashed border-white/10"><Layers className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" /><p className="text-xl font-semibold text-muted-foreground">No services found</p></div>
                ) : (
                    filteredServices.map((service, index) => (
                        <ServiceCard key={service.id} service={service} index={index} onEdit={handleEdit} onDelete={handleDelete} getIconForCategory={getIconForCategory} getCategoryLabel={getCategoryLabel} />
                    ))
                )}
            </div>
        </div>
    );
};
