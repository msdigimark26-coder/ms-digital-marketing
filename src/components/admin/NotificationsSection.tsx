import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Bell, Image as ImageIcon, Loader2, X, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
    id: string;
    title: string;
    message: string;
    image: string | null;
    created_at: string;
}

export const NotificationsSection = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ title: "", message: "", image: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            setNotifications(data || []);
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        setUploading(true);

        try {
            const { error: uploadError } = await supabase.storage
                .from('notification-images')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('notification-images')
                .getPublicUrl(filePath);

            setForm({ ...form, image: publicUrl });
            toast.success("Image uploaded successfully");
        } catch (error: any) {
            console.error('Error uploading image:', error);
            toast.error("Error uploading image");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.message) {
            toast.error("Title and Message are required");
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingId) {
                const { error } = await supabase
                    .from("notifications")
                    .update({
                        title: form.title,
                        message: form.message,
                        image: form.image || null,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", editingId);
                if (error) throw error;
                toast.success("Notification updated successfully");
            } else {
                const { error } = await supabase
                    .from("notifications")
                    .insert([{
                        title: form.title,
                        message: form.message,
                        image: form.image || null
                    }]);
                if (error) throw error;
                toast.success("Notification broadcasted successfully");
            }

            setForm({ title: "", message: "", image: "" });
            setIsAdding(false);
            setEditingId(null);
            fetchNotifications();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this notification?")) return;

        try {
            const { error } = await supabase
                .from("notifications")
                .delete()
                .eq("id", id);
            if (error) throw error;
            toast.success("Notification removed");
            fetchNotifications();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleEdit = (n: Notification) => {
        setForm({
            title: n.title,
            message: n.message,
            image: n.image || ""
        });
        setEditingId(n.id);
        setIsAdding(true);
    };

    const cancelEdit = () => {
        setIsAdding(false);
        setEditingId(null);
        setForm({ title: "", message: "", image: "" });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-white tracking-tight">System Notifications</h2>
                    <p className="text-muted-foreground text-sm mt-1">Manage global alerts and messages for all users.</p>
                </div>
                <Button
                    onClick={() => isAdding ? cancelEdit() : setIsAdding(true)}
                    className={`${isAdding ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-primary hover:bg-primary/90'} h-9 px-4 rounded-lg font-medium text-sm transition-all`}
                >
                    {isAdding ? <><X className="mr-2 h-3.5 w-3.5" /> Cancel</> : <><Plus className="mr-2 h-3.5 w-3.5" /> New Alert</>}
                </Button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className="overflow-hidden"
                    >
                        <form onSubmit={handleSave} className="bg-[#110C1D] border border-white/5 rounded-xl p-6 space-y-6 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 ml-0.5">Alert Title</label>
                                    <Input
                                        placeholder="Enter a catchy title..."
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        className="bg-black/20 border-white/5 focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/20 h-10 rounded-lg text-sm text-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 ml-0.5">Cover Image (Optional)</label>
                                    <div className="flex items-center gap-4">
                                        {form.image ? (
                                            <div className="relative group rounded-lg overflow-hidden h-10 w-16 border border-white/10">
                                                <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setForm({ ...form, image: "" })}
                                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-4 w-4 text-white" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    id="file-upload"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleFileUpload}
                                                    disabled={uploading}
                                                />
                                                <label
                                                    htmlFor="file-upload"
                                                    className={`flex items-center gap-2 cursor-pointer bg-black/20 border border-white/5 hover:border-white/10 text-slate-400 hover:text-white px-4 py-2.5 rounded-lg text-xs font-medium transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                                    {uploading ? 'Uploading...' : 'Upload Image'}
                                                </label>
                                            </div>
                                        )}
                                        {form.image && (
                                            <div className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                Uploaded
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 ml-0.5">Detailed Message</label>
                                <Textarea
                                    placeholder="What would you like to tell your users?"
                                    value={form.message}
                                    onChange={e => setForm({ ...form, message: e.target.value })}
                                    className="bg-black/20 border-white/5 focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/20 min-h-[100px] rounded-lg text-sm resize-none text-slate-200"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={cancelEdit}
                                    className="h-9 px-4 rounded-lg font-medium hover:bg-white/5 text-sm text-slate-400 hover:text-white"
                                >
                                    Discard
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || uploading}
                                    className="h-9 px-6 rounded-lg font-medium bg-purple-600 hover:bg-purple-700 text-white text-sm"
                                >
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Update Alert" : "Broadcast Alert"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-[#110C1D] rounded-xl border border-white/5">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-500 mb-4" />
                    <p className="text-slate-500 text-sm font-medium">Synchronizing notifications...</p>
                </div>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-[#110C1D] rounded-xl border border-dashed border-white/5">
                    <div className="h-12 w-12 bg-white/[0.03] rounded-xl flex items-center justify-center mb-4">
                        <Bell className="h-6 w-6 text-slate-600" />
                    </div>
                    <p className="text-slate-500 text-sm font-medium">No active notifications found.</p>
                    <Button variant="link" onClick={() => setIsAdding(true)} className="text-purple-400 font-semibold mt-1 text-xs">Create your first alert</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {notifications.map(n => (
                        <motion.div
                            layout
                            key={n.id}
                            className="bg-[#110C1D] border border-white/5 rounded-xl overflow-hidden group hover:border-white/10 transition-all duration-300 shadow-sm"
                        >
                            <div className="flex flex-col sm:flex-row h-full">
                                {n.image && (
                                    <div className="w-full sm:w-40 h-40 sm:h-auto overflow-hidden relative border-b sm:border-b-0 sm:border-r border-white/5">
                                        <img
                                            src={n.image}
                                            alt={n.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 p-5 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-md bg-purple-500/10 border border-purple-500/10 text-purple-400">
                                                    <Bell className="h-3 w-3" />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">System Alert</span>
                                            </div>

                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(n)}
                                                    className="p-1.5 hover:bg-white/5 rounded-md text-slate-500 hover:text-white transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(n.id)}
                                                    className="p-1.5 hover:bg-rose-500/10 rounded-md text-rose-500 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="text-base font-semibold text-slate-200 mb-2 leading-tight">{n.title}</h3>
                                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                                            {n.message}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="text-[10px] text-slate-500 font-medium">
                                            {new Date(n.created_at).toLocaleDateString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
                                            <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};
