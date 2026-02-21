import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    Plus, Trash2, Edit2, Loader2, Star, X, Save, AlertCircle, MoveUp, MoveDown,
    Code, Search, Share2, Target, Film, Palette, Box, Sparkles, Layers, Eye, EyeOff,
    Upload, Image as ImageIcon, Cpu, Wifi, Database, Cloud, Zap, Globe, Server, HardDrive,
    Radio, Bluetooth, Network, MonitorSmartphone, Binary, CircuitBoard, Webhook,
    Cuboid, BoxSelect, Shapes, Pentagon, Hexagon, Package, Combine, Maximize2, ExternalLink
} from "lucide-react";
import { servicesSupabase as supabase } from "@/integrations/supabase/servicesClient";
import { motion, AnimatePresence } from "framer-motion";

interface ServiceShowcase {
    id: string;
    title: string;
    description: string;
    icon_name: string;
    icon_color: string;
    is_popular: boolean;
    order_index: number;
    is_active: boolean;
    learn_more_url?: string;
    icon_url?: string;
    use_custom_icon?: boolean;
    custom_icon_color?: string;
    use_gradient?: boolean;
    gradient_preset?: string;
    gradient_start_color?: string;
    gradient_end_color?: string;
    created_at?: string;
    updated_at?: string;
}

const ICON_OPTIONS = [
    // Web & Marketing
    { value: "code", label: "Code", Icon: Code },
    { value: "search", label: "Search/SEO", Icon: Search },
    { value: "share2", label: "Social Media", Icon: Share2 },
    { value: "target", label: "Ads/Target", Icon: Target },
    { value: "film", label: "Film/Video", Icon: Film },
    { value: "palette", label: "Design", Icon: Palette },
    { value: "box", label: "3D/Box", Icon: Box },
    { value: "sparkles", label: "Premium", Icon: Sparkles },
    { value: "layers", label: "Layers", Icon: Layers },

    // IoT & Tech Icons
    { value: "cpu", label: "CPU/IoT", Icon: Cpu },
    { value: "wifi", label: "WiFi/Wireless", Icon: Wifi },
    { value: "database", label: "Database", Icon: Database },
    { value: "cloud", label: "Cloud", Icon: Cloud },
    { value: "zap", label: "Electric/Energy", Icon: Zap },
    { value: "globe", label: "Network/Web", Icon: Globe },
    { value: "server", label: "Server", Icon: Server },
    { value: "harddrive", label: "Storage", Icon: HardDrive },
    { value: "radio", label: "IoT Sensor", Icon: Radio },
    { value: "bluetooth", label: "Bluetooth", Icon: Bluetooth },
    { value: "network", label: "Network", Icon: Network },
    { value: "monitor", label: "Smart Device", Icon: MonitorSmartphone },
    { value: "binary", label: "Binary/AI", Icon: Binary },
    { value: "circuit", label: "Circuit/Hardware", Icon: CircuitBoard },
    { value: "webhook", label: "API/Integration", Icon: Webhook },

    // 3D Modeling & Design Icons (NEW)
    { value: "cuboid", label: "3D Cube/Model", Icon: Cuboid },
    { value: "boxselect", label: "3D Selection", Icon: BoxSelect },
    { value: "shapes", label: "3D Shapes", Icon: Shapes },
    { value: "pentagon", label: "Pentagon/Geo", Icon: Pentagon },
    { value: "hexagon", label: "Hexagon/Geo", Icon: Hexagon },
    { value: "package", label: "3D Package", Icon: Package },
    { value: "combine", label: "3D Combine", Icon: Combine },
    { value: "maximize", label: "3D Expand", Icon: Maximize2 },
];

const COLOR_OPTIONS = [
    { value: "pink", label: "Pink", bg: "bg-pink-500", hex: "#ec4899", gradient: "from-pink-500 to-rose-500" },
    { value: "blue", label: "Blue", bg: "bg-blue-500", hex: "#3b82f6", gradient: "from-blue-500 to-cyan-500" },
    { value: "green", label: "Green", bg: "bg-green-500", hex: "#22c55e", gradient: "from-green-500 to-emerald-500" },
    { value: "purple", label: "Purple", bg: "bg-purple-500", hex: "#a855f7", gradient: "from-purple-500 to-pink-500" },
    { value: "red", label: "Red", bg: "bg-red-500", hex: "#ef4444", gradient: "from-red-500 to-orange-500" },
    { value: "yellow", label: "Yellow", bg: "bg-yellow-500", hex: "#eab308", gradient: "from-yellow-500 to-orange-500" },
    { value: "cyan", label: "Cyan", bg: "bg-cyan-500", hex: "#06b6d4", gradient: "from-cyan-500 to-blue-500" },
    { value: "orange", label: "Orange", bg: "bg-orange-500", hex: "#f97316", gradient: "from-orange-500 to-red-500" },
    { value: "teal", label: "Teal", bg: "bg-teal-500", hex: "#14b8a6", gradient: "from-teal-500 to-cyan-500" },
    { value: "indigo", label: "Indigo", bg: "bg-indigo-500", hex: "#6366f1", gradient: "from-indigo-500 to-purple-500" },
];

// Premium Gradient Presets
const GRADIENT_PRESETS = [
    {
        name: "Sunset",
        value: "sunset",
        gradient: "from-orange-500 via-red-500 to-pink-500",
        colors: ["#f97316", "#ef4444", "#ec4899"]
    },
    {
        name: "Ocean",
        value: "ocean",
        gradient: "from-blue-500 via-cyan-500 to-teal-500",
        colors: ["#3b82f6", "#06b6d4", "#14b8a6"]
    },
    {
        name: "Forest",
        value: "forest",
        gradient: "from-green-500 via-emerald-500 to-teal-500",
        colors: ["#22c55e", "#10b981", "#14b8a6"]
    },
    {
        name: "Galaxy",
        value: "galaxy",
        gradient: "from-purple-600 via-indigo-600 to-blue-600",
        colors: ["#9333ea", "#4f46e5", "#2563eb"]
    },
    {
        name: "Fire",
        value: "fire",
        gradient: "from-yellow-500 via-orange-500 to-red-600",
        colors: ["#eab308", "#f97316", "#dc2626"]
    },
    {
        name: "Aurora",
        value: "aurora",
        gradient: "from-green-400 via-blue-500 to-purple-600",
        colors: ["#4ade80", "#3b82f6", "#9333ea"]
    },
    {
        name: "Cotton Candy",
        value: "cotton",
        gradient: "from-pink-400 via-purple-400 to-indigo-400",
        colors: ["#f472b6", "#c084fc", "#818cf8"]
    },
    {
        name: "Neon",
        value: "neon",
        gradient: "from-cyan-400 via-green-400 to-yellow-400",
        colors: ["#22d3ee", "#4ade80", "#facc15"]
    },
];


export const ServicesShowcaseSection = () => {
    const [services, setServices] = useState<ServiceShowcase[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [customIconFile, setCustomIconFile] = useState<File | null>(null);
    const [customIconPreview, setCustomIconPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [form, setForm] = useState({
        title: "",
        description: "",
        icon_name: "code",
        icon_color: "pink",
        custom_icon_color: "",
        use_gradient: true, // Enable gradients by default
        gradient_preset: "pink",
        gradient_start_color: "",
        gradient_end_color: "",
        is_popular: false,
        is_active: true,
        learn_more_url: "",
        use_custom_icon: false,
        icon_url: "",
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const fetchServices = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("services_showcase")
                .select("*")
                .order("order_index", { ascending: true });

            if (error) throw error;
            setServices(data || []);
        } catch (error: any) {
            console.error("Error fetching services showcase:", error);
            toast.error("Failed to fetch services showcase");
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
        } else if (form.description.length < 30) {
            newErrors.description = "Description must be at least 30 characters";
        }

        if (!form.icon_name) {
            newErrors.icon_name = "Please select an icon";
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
                    .from("services_showcase")
                    .update({
                        ...form,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", editingId);

                if (error) throw error;
                toast.success("✨ Service updated successfully!");
            } else {
                // Get the max order_index and add 1
                const maxOrder = services.length > 0
                    ? Math.max(...services.map(s => s.order_index))
                    : 0;

                const { error } = await supabase
                    .from("services_showcase")
                    .insert([{
                        ...form,
                        order_index: maxOrder + 1
                    }]);

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
        setForm({
            title: "",
            description: "",
            icon_name: "code",
            icon_color: "pink",
            custom_icon_color: "",
            use_gradient: true,
            gradient_preset: "pink",
            gradient_start_color: "",
            gradient_end_color: "",
            is_popular: false,
            is_active: true,
            learn_more_url: "",
            use_custom_icon: false,
            icon_url: "",
        });
        setCustomIconFile(null);
        setCustomIconPreview(null);
        setIsAdding(false);
        setEditingId(null);
        setErrors({});
    };

    const handleEdit = (s: ServiceShowcase) => {
        setForm({
            title: s.title,
            description: s.description,
            icon_name: s.icon_name,
            icon_color: s.icon_color,
            custom_icon_color: s.custom_icon_color || "",
            use_gradient: s.use_gradient ?? true,
            gradient_preset: s.gradient_preset || s.icon_color,
            gradient_start_color: s.gradient_start_color || "",
            gradient_end_color: s.gradient_end_color || "",
            is_popular: s.is_popular,
            is_active: s.is_active,
            learn_more_url: s.learn_more_url || "",
            use_custom_icon: s.use_custom_icon || false,
            icon_url: s.icon_url || "",
        });

        if (s.use_custom_icon && s.icon_url) {
            setCustomIconPreview(s.icon_url);
        }

        setEditingId(s.id);
        setIsAdding(true);
        setErrors({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`)) return;

        try {
            const { error } = await supabase
                .from("services_showcase")
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

    const handleReorder = async (id: string, direction: 'up' | 'down') => {
        const currentIndex = services.findIndex(s => s.id === id);
        if (currentIndex === -1) return;

        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= services.length) return;

        try {
            const currentService = services[currentIndex];
            const targetService = services[targetIndex];

            // Swap order_index
            await Promise.all([
                supabase
                    .from("services_showcase")
                    .update({ order_index: targetService.order_index })
                    .eq("id", currentService.id),
                supabase
                    .from("services_showcase")
                    .update({ order_index: currentService.order_index })
                    .eq("id", targetService.id)
            ]);

            toast.success("Order updated");
            fetchServices();
        } catch (error: any) {
            console.error("Error reordering:", error);
            toast.error("Failed to reorder services");
        }
    };

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from("services_showcase")
                .update({ is_active: !currentStatus })
                .eq("id", id);

            if (error) throw error;
            toast.success(currentStatus ? "Service hidden" : "Service activated");
            fetchServices();
        } catch (error: any) {
            console.error("Error toggling active status:", error);
            toast.error("Failed to update status");
        }
    };

    const getIconComponent = (iconName: string) => {
        const found = ICON_OPTIONS.find(opt => opt.value === iconName);
        return found ? found.Icon : Layers;
    };

    const getColorClass = (color: string, useGradient: boolean = true) => {
        if (useGradient) {
            // Use gradient classes
            const gradientMap: { [key: string]: string } = {
                pink: "bg-gradient-to-br from-pink-500 to-rose-500",
                blue: "bg-gradient-to-br from-blue-500 to-cyan-500",
                green: "bg-gradient-to-br from-green-500 to-emerald-500",
                purple: "bg-gradient-to-br from-purple-500 to-pink-500",
                red: "bg-gradient-to-br from-red-500 to-orange-500",
                yellow: "bg-gradient-to-br from-yellow-500 to-orange-500",
                cyan: "bg-gradient-to-br from-cyan-500 to-blue-500",
                orange: "bg-gradient-to-br from-orange-500 to-red-500",
                teal: "bg-gradient-to-br from-teal-500 to-cyan-500",
                indigo: "bg-gradient-to-br from-indigo-500 to-purple-500",
                // Preset gradients
                sunset: "bg-gradient-to-br from-orange-500 via-red-500 to-pink-500",
                ocean: "bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500",
                forest: "bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500",
                galaxy: "bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600",
                fire: "bg-gradient-to-br from-yellow-500 via-orange-500 to-red-600",
                aurora: "bg-gradient-to-br from-green-400 via-blue-500 to-purple-600",
                cotton: "bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400",
                neon: "bg-gradient-to-br from-cyan-400 via-green-400 to-yellow-400",
            };
            return gradientMap[color] || "bg-gradient-to-br from-pink-500 to-purple-500";
        } else {
            // Use solid colors
            const colorMap: { [key: string]: string } = {
                pink: "bg-pink-500",
                blue: "bg-blue-500",
                green: "bg-green-500",
                purple: "bg-purple-500",
                red: "bg-red-500",
                yellow: "bg-yellow-500",
                cyan: "bg-cyan-500",
                orange: "bg-orange-500",
                teal: "bg-teal-500",
                indigo: "bg-indigo-500",
            };
            return colorMap[color] || "bg-pink-500";
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-gradient mb-2">Services Showcase</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage services displayed on your homepage • {services.length} total service{services.length !== 1 ? 's' : ''}
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
                                    {editingId ? "Edit Service Showcase" : "Create New Service Showcase"}
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    {/* Service Title */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">
                                            Service Title <span className="text-red-400">*</span>
                                        </label>
                                        <Input
                                            placeholder="e.g., Web Design & Development"
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
                                            placeholder="Create stunning, high-performance websites that convert visitors into customers..."
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

                                    {/* Learn More URL */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">
                                            Learn More URL (Optional)
                                        </label>
                                        <Input
                                            placeholder="/services/web-design"
                                            value={form.learn_more_url}
                                            onChange={e => setForm({ ...form, learn_more_url: e.target.value })}
                                            className="bg-white/5 border-white/10 focus:border-primary/50 h-12"
                                        />
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    {/* Icon Selection */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">
                                            Icon <span className="text-red-400">*</span>
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {ICON_OPTIONS.map(({ value, Icon }) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => setForm({ ...form, icon_name: value })}
                                                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${form.icon_name === value
                                                        ? 'border-primary bg-primary/10'
                                                        : 'border-white/10 hover:border-white/20'
                                                        }`}
                                                >
                                                    <Icon className="h-6 w-6" />
                                                    <span className="text-xs capitalize">{value}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Color & Style Selection */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-slate-300">
                                                Color Style
                                            </label>
                                            <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-white/10">
                                                <button
                                                    type="button"
                                                    onClick={() => setForm({ ...form, use_gradient: false })}
                                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${!form.use_gradient ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'}`}
                                                >
                                                    Solid
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setForm({ ...form, use_gradient: true })}
                                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${form.use_gradient ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'text-muted-foreground hover:text-white'}`}
                                                >
                                                    Gradient
                                                </button>
                                            </div>
                                        </div>

                                        {form.use_gradient ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                {GRADIENT_PRESETS.map((preset) => (
                                                    <button
                                                        key={preset.value}
                                                        type="button"
                                                        onClick={() => setForm({ ...form, gradient_preset: preset.value })}
                                                        className={`p-2 rounded-lg border-2 transition-all flex items-center gap-3 relative overflow-hidden group ${form.gradient_preset === preset.value
                                                            ? 'border-white/50 ring-1 ring-white/50'
                                                            : 'border-white/5 hover:border-white/20'
                                                            }`}
                                                    >
                                                        <div className={`absolute inset-0 bg-gradient-to-br ${preset.gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
                                                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${preset.gradient} shadow-sm shrink-0`} />
                                                        <span className="text-xs font-medium text-white relative z-10">{preset.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex gap-2 flex-wrap">
                                                {COLOR_OPTIONS.map(({ value, bg }) => (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() => setForm({ ...form, icon_color: value })}
                                                        className={`w-10 h-10 rounded-full ${bg} transition-all ${form.icon_color === value
                                                            ? 'ring-4 ring-white/50 scale-110'
                                                            : 'hover:scale-105'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Toggles */}
                                    <div className="space-y-3 pt-4">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.is_popular}
                                                onChange={e => setForm({ ...form, is_popular: e.target.checked })}
                                                className="w-5 h-5 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                                            />
                                            <div className="flex items-center gap-2">
                                                <Star className="h-4 w-4 text-yellow-500" />
                                                <span className="text-sm font-medium text-slate-300">Mark as Popular</span>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.is_active}
                                                onChange={e => setForm({ ...form, is_active: e.target.checked })}
                                                className="w-5 h-5 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                                            />
                                            <div className="flex items-center gap-2">
                                                <Eye className="h-4 w-4 text-green-500" />
                                                <span className="text-sm font-medium text-slate-300">Active (Visible on homepage)</span>
                                            </div>
                                        </label>
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

            {/* Services Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center py-20">
                        <div className="text-center space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50 mx-auto" />
                            <p className="text-muted-foreground">Loading services...</p>
                        </div>
                    </div>
                ) : services.length === 0 ? (
                    <div className="col-span-full glass-card p-16 text-center border-dashed border-white/10">
                        <Layers className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-xl font-semibold text-muted-foreground mb-2">
                            No services yet
                        </p>
                        <p className="text-sm text-muted-foreground/60">
                            Click 'Add New Service' to create your first service showcase
                        </p>
                    </div>
                ) : (
                    services.map((service, index) => {
                        const Icon = getIconComponent(service.icon_name);
                        return (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`glass-card p-5 md:p-6 flex flex-col gap-4 group hover:border-primary/50 transition-all duration-300 ${!service.is_active ? 'opacity-50' : ''
                                    }`}
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-5">
                                    <div className="flex gap-4 flex-1 w-full">
                                        <div className={`h-14 w-14 rounded-2xl ${getColorClass(service.use_gradient && service.gradient_preset ? service.gradient_preset : service.icon_color, service.use_gradient !== false)} flex items-center justify-center text-white shrink-0 relative shadow-lg shadow-black/20`}>
                                            <Icon className="h-7 w-7" />
                                            {service.is_popular && (
                                                <div className="absolute -top-2 -right-2 bg-yellow-500 text-black px-2 py-0.5 rounded-full text-[9px] font-black shadow-lg">
                                                    POPULAR
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg text-white mb-1 flex items-center gap-2 group-hover:text-primary transition-colors">
                                                <span className="truncate">{service.title}</span>
                                                {!service.is_active && (
                                                    <EyeOff className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                )}
                                            </h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed mb-2 line-clamp-3 sm:line-clamp-2">
                                                {service.description}
                                            </p>
                                            {service.learn_more_url && (
                                                <div className="flex items-center gap-1.5 text-[10px] text-primary/60 font-mono font-bold uppercase tracking-wider">
                                                    <ExternalLink className="h-3 w-3" />
                                                    {service.learn_more_url}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions Bar - Stacks or rows depending on screen */}
                                    <div className="flex sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-white/5 gap-3">
                                        <div className="flex gap-1 bg-black/20 p-1 rounded-lg border border-white/5">
                                            <button
                                                onClick={() => handleReorder(service.id, 'up')}
                                                disabled={index === 0}
                                                className="p-2 hover:bg-white/5 rounded-md text-muted-foreground hover:text-primary transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                                title="Move up"
                                            >
                                                <MoveUp className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleReorder(service.id, 'down')}
                                                disabled={index === services.length - 1}
                                                className="p-2 hover:bg-white/5 rounded-md text-muted-foreground hover:text-primary transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                                title="Move down"
                                            >
                                                <MoveDown className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="flex gap-1 bg-black/20 p-1 rounded-lg border border-white/5">
                                            <button
                                                onClick={() => toggleActive(service.id, service.is_active)}
                                                className="p-2 hover:bg-white/5 rounded-md text-muted-foreground hover:text-primary transition-all"
                                                title={service.is_active ? "Hide" : "Show"}
                                            >
                                                {service.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(service)}
                                                className="p-2 hover:bg-white/5 rounded-md text-muted-foreground hover:text-primary transition-all"
                                                title="Edit service"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(service.id, service.title)}
                                                className="p-2 hover:bg-rose-500/10 rounded-md text-rose-500/50 hover:text-rose-500 transition-all opacity-0 sm:group-hover:opacity-100"
                                                title="Delete service"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <span className="text-[10px] text-muted-foreground/50 font-mono uppercase font-black">
                                        Index #{service.order_index}
                                    </span>
                                    {service.created_at && (
                                        <span className="text-[10px] text-muted-foreground/50 font-mono uppercase font-black">
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
                        Total <span className="text-white font-semibold">{services.length}</span> service{services.length !== 1 ? 's' : ''} •{" "}
                        <span className="text-green-400 font-semibold">{services.filter(s => s.is_active).length}</span> active •{" "}
                        <span className="text-yellow-400 font-semibold">{services.filter(s => s.is_popular).length}</span> popular
                    </p>
                </div>
            )}
        </div>
    );
};
