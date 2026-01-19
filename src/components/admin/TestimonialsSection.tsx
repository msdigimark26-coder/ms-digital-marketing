import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Star, User, Image as ImageIcon, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
    id: string;
    name: string;
    role: string;
    content: string;
    rating: number;
    image_url?: string;
}

export const TestimonialsSection = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<{
        name: string;
        role: string;
        content: string;
        rating: number;
        image_url?: string;
    }>({ name: "", role: "", content: "", rating: 5 });
    const [uploading, setUploading] = useState(false);

    const fetchTestimonials = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
            if (error) throw error;
            setTestimonials(data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTestimonials(); }, []);

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
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('testimonial-images')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('testimonial-images')
                .getPublicUrl(filePath);

            setForm(prev => ({ ...prev, image_url: publicUrl }));
            toast.success("Image uploaded successfully");
        } catch (error: any) {
            toast.error("Error uploading image: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                const { error } = await supabase
                    .from("testimonials")
                    .update(form)
                    .eq("id", editingId);
                if (error) throw error;
                toast.success("Testimonial updated");
            } else {
                const { error } = await supabase.from("testimonials").insert([form]);
                if (error) throw error;
                toast.success("Testimonial added");
            }
            setForm({ name: "", role: "", content: "", rating: 5, image_url: undefined });
            setIsAdding(false);
            setEditingId(null);
            fetchTestimonials();
        } catch (error: any) { toast.error(error.message); }
    };

    const handleEdit = (t: Testimonial) => {
        setForm({ name: t.name, role: t.role, content: t.content, rating: t.rating, image_url: t.image_url });
        setEditingId(t.id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this testimonial?")) return;
        try {
            const { error } = await supabase.from("testimonials").delete().eq("id", id);
            if (error) throw error;
            toast.success("Testimonial deleted");
            fetchTestimonials();
        } catch (error: any) { toast.error(error.message); }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white tracking-tight">Client Testimonials</h2>
                <Button
                    onClick={() => {
                        if (isAdding) {
                            setIsAdding(false);
                            setEditingId(null);
                            setForm({ name: "", role: "", content: "", rating: 5, image_url: undefined });
                        } else {
                            setIsAdding(true);
                        }
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-900/20"
                >
                    {isAdding ? "Cancel" : <><Plus className="mr-2 h-4 w-4" /> Add Testimonial</>}
                </Button>
            </div>

            {isAdding && (
                <div className="bg-[#110C1D] border border-white/5 rounded-xl p-6 space-y-4 shadow-sm">
                    <div className="flex gap-6 items-start">
                        {/* Image Upload Area */}
                        <div className="w-24 h-24 flex-shrink-0 relative group">
                            <div className="w-full h-full rounded-full overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
                                {form.image_url ? (
                                    <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="h-8 w-8 text-slate-500" />
                                )}
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <Loader2 className="h-6 w-6 text-purple-500 animate-spin" />
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-purple-600 hover:bg-purple-500 cursor-pointer shadow-lg transition-colors">
                                <ImageIcon className="h-3 w-3 text-white" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                />
                            </label>
                            {form.image_url && (
                                <button
                                    onClick={() => setForm(prev => ({ ...prev, image_url: undefined }))}
                                    className="absolute -top-1 -right-1 p-1 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-sm"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    placeholder="Client Name"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="bg-black/20 border-white/5 focus:border-purple-500/30 text-slate-200"
                                />
                                <Input
                                    placeholder="Client Role (e.g. CEO)"
                                    value={form.role}
                                    onChange={e => setForm({ ...form, role: e.target.value })}
                                    className="bg-black/20 border-white/5 focus:border-purple-500/30 text-slate-200"
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-semibold text-slate-400">Rating:</span>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button key={s} onClick={() => setForm({ ...form, rating: s })} className={`text-xl transition-colors ${form.rating >= s ? 'text-amber-500' : 'text-slate-700 hover:text-amber-500/50'}`}>★</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Textarea
                        placeholder="Content"
                        value={form.content}
                        onChange={e => setForm({ ...form, content: e.target.value })}
                        className="min-h-[100px] bg-black/20 border-white/5 focus:border-purple-500/30 text-slate-200 resize-none"
                    />
                    <Button onClick={handleSave} disabled={uploading} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                        {editingId ? "Update Testimonial" : "Save Testimonial"}
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map(t => (
                    <div key={t.id} className="bg-[#110C1D] border border-white/5 rounded-xl p-6 flex flex-col justify-between group hover:border-white/10 transition-all duration-300 shadow-sm">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-12 w-12 rounded-full overflow-hidden bg-purple-500/10 flex items-center justify-center border border-purple-500/10">
                                    {t.image_url ? (
                                        <img src={t.image_url} alt={t.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-lg font-bold text-purple-400">{t.name.charAt(0)}</div>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className={`h-3 w-3 ${i < t.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-700'}`} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 italic mb-4 leading-relaxed line-clamp-4">"{t.content}"</p>
                        </div>
                        <div className="flex justify-between items-end border-t border-white/5 pt-4 mt-auto">
                            <div>
                                <div className="font-semibold text-sm tracking-tight text-white">{t.name}</div>
                                <div className="text-[10px] text-purple-400 uppercase font-bold">{t.role}</div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(t)}
                                    className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors"
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(t.id)}
                                    className="p-1.5 hover:bg-rose-500/10 rounded-lg text-rose-500 transition-colors"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
