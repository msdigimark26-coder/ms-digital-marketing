import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Layers, Loader2, Star, Check, Search, Share2, Code, Palette, Film, Box } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface Service {
    id: string;
    title: string;
    description: string;
    category: string;
    price: string;
}

export const ServicesSection = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ title: "", description: "", category: "marketing", price: "" });

    const fetchServices = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from("services").select("*").order("created_at", { ascending: false });
            if (error) throw error;
            setServices(data || []);
        } catch (error: any) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchServices(); }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                const { error } = await supabase
                    .from("services")
                    .update(form)
                    .eq("id", editingId);
                if (error) throw error;
                toast.success("Service updated");
            } else {
                const { error } = await supabase.from("services").insert([form]);
                if (error) throw error;
                toast.success("Service added");
            }
            setForm({ title: "", description: "", category: "marketing", price: "" });
            setIsAdding(false);
            setEditingId(null);
            fetchServices();
        } catch (error: any) { toast.error(error.message); }
    };

    const handleEdit = (s: Service) => {
        setForm({ title: s.title, description: s.description, category: s.category, price: s.price });
        setEditingId(s.id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this service?")) return;
        try {
            const { error } = await supabase.from("services").delete().eq("id", id);
            if (error) throw error;
            toast.success("Service deleted");
            fetchServices();
        } catch (error: any) { toast.error(error.message); }
    };

    const getIconForCategory = (category: string) => {
        const c = category.toLowerCase();
        if (c.includes('seo') || c.includes('search')) return Search;
        if (c.includes('social') || c.includes('marketing')) return Share2;
        if (c.includes('web') || c.includes('dev') || c.includes('code')) return Code;
        if (c.includes('design') || c.includes('ui') || c.includes('ux')) return Palette;
        if (c.includes('video') || c.includes('film') || c.includes('photo')) return Film;
        if (c.includes('3d') || c.includes('model')) return Box;
        return Layers;
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-display font-bold text-gradient">Services List</h2>
                <Button
                    onClick={() => {
                        if (isAdding) {
                            setIsAdding(false);
                            setEditingId(null);
                            setForm({ title: "", description: "", category: "marketing", price: "" });
                        } else {
                            setIsAdding(true);
                        }
                    }}
                    className="bg-gradient-primary"
                >
                    {isAdding ? "Cancel" : <><Plus className="mr-2 h-4 w-4" /> Add Service</>}
                </Button>
            </div>

            {isAdding && (
                <div className="glass-card p-6 space-y-4 border-primary/20">
                    <Input placeholder="Service Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-white/5 border-white/10" />
                    <Textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-white/5 border-white/10" />
                    <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="bg-white/5 border-white/10" />
                        <Input placeholder="Price Range (e.g. $500 - $1000)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="bg-white/5 border-white/10" />
                    </div>
                    <Button onClick={handleSave} className="w-full bg-gradient-primary">
                        {editingId ? "Update Service" : "Save Service"}
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                    </div>
                ) : services.length === 0 ? (
                    <div className="col-span-full glass-card p-20 text-center text-muted-foreground italic border-dashed border-white/10">
                        No services listed yet.
                    </div>
                ) : (
                    services.map(service => {
                        const Icon = getIconForCategory(service.category);
                        return (
                            <div key={service.id} className="glass-card p-6 flex justify-between items-start group hover:border-primary/50 transition-all">
                                <div className="flex gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-white">{service.title}</h3>
                                        <p className="text-[10px] text-primary uppercase font-bold tracking-widest mb-1">{service.category}</p>
                                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{service.description}</p>
                                        <p className="text-primary font-bold mt-4 flex items-center gap-2">
                                            <Star className="h-3 w-3 fill-primary" />
                                            {service.price}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(service)}
                                        className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-white transition-all"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(service.id)}
                                        className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

