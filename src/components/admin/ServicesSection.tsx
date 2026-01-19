import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Layers, Loader2, Star, Check, Search, Share2, Code, Palette, Film, Box, X, Save, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

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

export const ServicesSection = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "marketing",
        price: ""
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const fetchServices = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
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
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!form.title.trim()) {
            newErrors.title = "Service title is required";
        }

        if (!form.description.trim()) {
            newErrors.description = "Description is required";
        } else if (form.description.length < 20) {
            newErrors.description = "Description must be at least 20 characters";
        }

        if (!form.category) {
            newErrors.category = "Please select a category";
        }

        if (!form.price.trim()) {
            newErrors.price = "Price information is required";
        }

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
            if (editingId) {
                const { error } = await supabase
                    .from("services")
                    .update({
                        ...form,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", editingId);

                if (error) throw error;
                toast.success("✨ Service updated successfully!");
            } else {
                const { error } = await supabase
                    .from("services")
                    .insert([form]);

                if (error) throw error;
                toast.success("🎉 New service added successfully!");
            }

            resetForm();
            fetchServices();
        } catch (error: any) {
            console.error("Error saving service:", error);
            toast.error(`Failed to save service: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setForm({ title: "", description: "", category: "marketing", price: "" });
        setIsAdding(false);
        setEditingId(null);
        setErrors({});
    };

    const handleEdit = (s: Service) => {
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
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`)) return;

        try {
            const { error } = await supabase
                .from("services")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast.success("Service deleted successfully");
            fetchServices();
        } catch (error: any) {
            console.error("Error deleting service:", error);
            toast.error(`Failed to delete service: ${error.message}`);
        }
    };

    const getIconForCategory = (category: string) => {
        const found = CATEGORY_OPTIONS.find(opt => opt.value === category);
        return found ? found.icon : Layers;
    };

    const getCategoryLabel = (category: string) => {
        const found = CATEGORY_OPTIONS.find(opt => opt.value === category);
        return found ? found.label : category;
    };

    const filteredServices = services.filter(service =>
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-gradient mb-2">Services Management</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage your service offerings • {services.length} total service{services.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Button
                    onClick={() => {
                        if (isAdding) {
                            resetForm();
                        } else {
                            setIsAdding(true);
                        }
                    }}
                    className="bg-gradient-primary hover:opacity-90 shadow-lg"
                >
                    {isAdding ? (
                        <>
                            <X className="mr-2 h-4 w-4" /> Cancel
                        </>
                    ) : (
                        <>
                            <Plus className="mr-2 h-4 w-4" /> Add New Service
                        </>
                    )}
                </Button>
            </div>

            {/* Add/Edit Form */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <form onSubmit={handleSave} className="glass-card p-8 space-y-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-1 h-8 bg-primary rounded-full"></div>
                                <h3 className="text-xl font-bold text-white">
                                    {editingId ? "Edit Service" : "Create New Service"}
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {/* Service Title */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">
                                        Service Title <span className="text-red-400">*</span>
                                    </label>
                                    <Input
                                        placeholder="e.g., Advanced SEO Optimization"
                                        value={form.title}
                                        onChange={e => {
                                            setForm({ ...form, title: e.target.value });
                                            if (errors.title) setErrors({ ...errors, title: "" });
                                        }}
                                        className={`bg-white/5 border-white/10 focus:border-primary/50 h-12 ${errors.title ? 'border-red-500' : ''}`}
                                    />
                                    {errors.title && (
                                        <p className="text-xs text-red-400 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> {errors.title}
                                        </p>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">
                                        Description <span className="text-red-400">*</span>
                                    </label>
                                    <Textarea
                                        placeholder="Provide a detailed description of the service, its benefits, and what makes it unique..."
                                        value={form.description}
                                        onChange={e => {
                                            setForm({ ...form, description: e.target.value });
                                            if (errors.description) setErrors({ ...errors, description: "" });
                                        }}
                                        className={`bg-white/5 border-white/10 focus:border-primary/50 min-h-[120px] resize-none ${errors.description ? 'border-red-500' : ''}`}
                                    />
                                    <div className="flex justify-between items-center">
                                        {errors.description ? (
                                            <p className="text-xs text-red-400 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> {errors.description}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">
                                                {form.description.length} characters
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Category and Price Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Category */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">
                                            Category <span className="text-red-400">*</span>
                                        </label>
                                        <select
                                            value={form.category}
                                            onChange={e => {
                                                setForm({ ...form, category: e.target.value });
                                                if (errors.category) setErrors({ ...errors, category: "" });
                                            }}
                                            className={`w-full h-12 px-4 rounded-lg bg-white/5 border border-white/10 focus:border-primary/50 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${errors.category ? 'border-red-500' : ''}`}
                                        >
                                            {CATEGORY_OPTIONS.map(cat => (
                                                <option key={cat.value} value={cat.value} className="bg-[#0A051A] text-white">
                                                    {cat.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category && (
                                            <p className="text-xs text-red-400 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> {errors.category}
                                            </p>
                                        )}
                                    </div>

                                    {/* Price */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">
                                            Price Range <span className="text-red-400">*</span>
                                        </label>
                                        <Input
                                            placeholder="e.g., $500 - $2,000"
                                            value={form.price}
                                            onChange={e => {
                                                setForm({ ...form, price: e.target.value });
                                                if (errors.price) setErrors({ ...errors, price: "" });
                                            }}
                                            className={`bg-white/5 border-white/10 focus:border-primary/50 h-12 ${errors.price ? 'border-red-500' : ''}`}
                                        />
                                        {errors.price && (
                                            <p className="text-xs text-red-400 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> {errors.price}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-gradient-primary hover:opacity-90 h-12 text-base font-semibold shadow-lg"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-5 w-5" />
                                            {editingId ? "Update Service" : "Create Service"}
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={resetForm}
                                    variant="outline"
                                    className="px-6 h-12 border-white/10 hover:bg-white/5"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search Bar */}
            {services.length > 0 && (
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search services by title, description, or category..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-12 bg-white/5 border-white/10 h-12 focus:border-primary/50"
                    />
                </div>
            )}

            {/* Services Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center py-20">
                        <div className="text-center space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50 mx-auto" />
                            <p className="text-muted-foreground">Loading services...</p>
                        </div>
                    </div>
                ) : filteredServices.length === 0 ? (
                    <div className="col-span-full glass-card p-16 text-center border-dashed border-white/10">
                        <Layers className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-xl font-semibold text-muted-foreground mb-2">
                            {searchQuery ? "No services found" : "No services yet"}
                        </p>
                        <p className="text-sm text-muted-foreground/60">
                            {searchQuery
                                ? "Try adjusting your search terms"
                                : "Click 'Add New Service' to create your first service offering"
                            }
                        </p>
                    </div>
                ) : (
                    filteredServices.map((service, index) => {
                        const Icon = getIconForCategory(service.category);
                        return (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
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
                                            onClick={() => handleEdit(service)}
                                            className="p-2.5 hover:bg-white/5 rounded-xl text-muted-foreground hover:text-primary transition-all border border-transparent hover:border-primary/20"
                                            title="Edit service"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(service.id, service.title)}
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
                    })
                )}
            </div>

            {/* Footer Stats */}
            {!loading && services.length > 0 && (
                <div className="glass-card p-4 flex items-center justify-between border-primary/10">
                    <p className="text-sm text-muted-foreground">
                        Showing <span className="text-white font-semibold">{filteredServices.length}</span> of{" "}
                        <span className="text-white font-semibold">{services.length}</span> service{services.length !== 1 ? 's' : ''}
                    </p>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                        >
                            <X className="h-3 w-3" /> Clear search
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
