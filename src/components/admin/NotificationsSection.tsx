import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Plus,
    Trash2,
    Edit2,
    Search,
    Bell,
    Loader2,
    X,
    Image as ImageIcon,
    Save,
    AlertCircle,
    Upload
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { logActivity } from "@/utils/auditLogger";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

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
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingNotif, setEditingNotif] = useState<Notification | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        message: "",
        image: ""
    });
    const { user } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setNotifications(data || []);
        } catch (error: any) {
            console.error("Error fetching notifications:", error);
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (!file) return;

            // Basic validation
            if (!file.type.startsWith('image/')) {
                toast.error("Please upload an image file");
                return;
            }
            if (file.size > 50 * 1024 * 1024) {
                toast.error("File size should be less than 50MB");
                return;
            }

            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `broadcasts/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('notification-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('notification-images')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, image: data.publicUrl }));
            toast.success("Image uploaded successfully");
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error("Upload failed: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, image: "" }));
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleOpenAdd = () => {
        setEditingNotif(null);
        setFormData({ title: "", message: "", image: "" });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (notif: Notification) => {
        setEditingNotif(notif);
        setFormData({
            title: notif.title,
            message: notif.message,
            image: notif.image || ""
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this notification? Users will no longer see it.")) return;
        try {
            const { error } = await supabase
                .from("notifications")
                .delete()
                .eq("id", id);

            if (error) throw error;

            // Log deletion
            logActivity({
                adminName: user?.user_metadata?.full_name || user?.email || "Admin",
                adminEmail: user?.email || "Unknown",
                actionType: 'delete',
                targetType: 'notification',
                targetId: id,
                description: `Deleted notification broadcast: ${id}`
            });

            toast.success("Notification deleted");
            fetchNotifications();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editingNotif) {
                const { error } = await supabase
                    .from("notifications")
                    .update({
                        title: formData.title,
                        message: formData.message,
                        image: formData.image || null,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", editingNotif.id);

                if (error) throw error;

                // Log update
                logActivity({
                    adminName: user?.user_metadata?.full_name || user?.email || "Admin",
                    adminEmail: user?.email || "Unknown",
                    actionType: 'update',
                    targetType: 'notification',
                    targetId: editingNotif.id,
                    targetData: formData,
                    description: `Updated notification broadcast: ${formData.title}`
                });

                toast.success("Notification updated");
            } else {
                const { error } = await supabase
                    .from("notifications")
                    .insert({
                        title: formData.title,
                        message: formData.message,
                        image: formData.image || null
                    });

                if (error) throw error;

                // Log creation
                logActivity({
                    adminName: user?.user_metadata?.full_name || user?.email || "Admin",
                    adminEmail: user?.email || "Unknown",
                    actionType: 'create',
                    targetType: 'notification',
                    targetData: formData,
                    description: `Broadcasted new notification: ${formData.title}`
                });

                toast.success("Notification broadcasted");
            }

            setIsDialogOpen(false);
            fetchNotifications();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredNotifications = notifications.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Notification Hub</h2>
                    <p className="text-slate-500 mt-1 text-sm font-medium">Broadcast updates and alerts to all platform users</p>
                </div>
                <Button
                    onClick={handleOpenAdd}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-900/20"
                >
                    <Plus className="mr-2 h-4 w-4" /> New Broadcast
                </Button>
            </div>

            <div className="bg-[#110C1D] border border-white/5 rounded-xl p-6 flex flex-col md:flex-row gap-4 items-center shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search broadcasts..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 bg-black/20 border-white/5 text-slate-200 h-10 rounded-lg focus:ring-1 focus:ring-purple-500/20 focus:border-purple-500/30"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-purple-500 opacity-20" />
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="bg-[#110C1D] border border-white/5 rounded-xl p-20 text-center text-slate-500 italic border-dashed">
                        {searchTerm ? "No notifications match your search." : "No active broadcasts found."}
                    </div>
                ) : (
                    filteredNotifications.map((notif) => (
                        <motion.div
                            layout
                            key={notif.id}
                            className="bg-[#110C1D] border border-white/5 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-white/10 transition-all shadow-sm"
                        >
                            <div className="flex flex-col md:flex-row gap-6 flex-1 min-w-0">
                                <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/10 flex items-center justify-center flex-shrink-0">
                                    <Bell className="h-6 w-6 text-purple-400" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-lg text-slate-200 group-hover:text-white transition-colors truncate">{notif.title}</h3>
                                        <span className="text-[10px] text-slate-600 font-mono">
                                            {new Date(notif.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-400 line-clamp-2 leading-relaxed italic">
                                        {notif.message}
                                    </p>
                                    {notif.image && (
                                        <div className="mt-3 flex items-center gap-2 text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                                            <ImageIcon className="h-3 w-3" /> Includes Image Attachment
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenEdit(notif)}
                                    className="text-slate-400 hover:text-white hover:bg-white/5"
                                >
                                    <Edit2 className="h-4 w-4 mr-2" /> Edit
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(notif.id)}
                                    className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/5"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </Button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px] bg-[#0F0A1F] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            {editingNotif ? <Edit2 className="h-5 w-5 text-purple-400" /> : <Plus className="h-5 w-5 text-purple-400" />}
                            {editingNotif ? "Update Broadcast" : "New System Broadcast"}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Create a notification that will appear for all users across the platform.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Broadcast Title</label>
                            <Input
                                required
                                placeholder="E.g., System Maintenance"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="bg-black/40 border-white/5 focus:border-purple-500/50 rounded-lg"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Message Content</label>
                            <textarea
                                required
                                rows={4}
                                placeholder="What would you like to tell your users?"
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                className="w-full bg-black/40 border border-white/5 focus:border-purple-500/50 rounded-lg p-3 text-sm outline-none resize-none custom-scrollbar"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Image Attachment (Optional)</label>
                            <div
                                onClick={() => !uploading && fileInputRef.current?.click()}
                                className={`border-2 border-dashed border-white/10 rounded-xl p-6 hover:bg-white/5 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[160px] relative group overflow-hidden ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                />

                                {formData.image ? (
                                    <>
                                        <img src={formData.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-20 transition-opacity" />
                                        <div className="relative z-10 flex flex-col items-center">
                                            <div className="h-10 w-10 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm mb-2 group-hover:bg-rose-500/20 transition-colors"
                                                onClick={(e) => { e.stopPropagation(); removeImage(); }}
                                            >
                                                <X className="h-5 w-5 text-white" />
                                            </div>
                                            <span className="text-[10px] text-white font-bold uppercase tracking-widest">Click to Remove</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-3 text-purple-400 group-hover:scale-110 transition-transform">
                                            {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                                        </div>
                                        <div className="text-sm font-bold text-slate-300">
                                            {uploading ? "Uploading..." : "Click to upload image"}
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-1 font-medium">PNG, JPG, WEBP up to 50MB</div>
                                    </>
                                )}
                            </div>

                            {/* Keep the URL input as a backup fallback if needed, or hide it if uploading is preferred */}
                            <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-2">
                                <ImageIcon className="h-3 w-3" />
                                <span>Or paste image URL below:</span>
                            </div>
                            <Input
                                placeholder="https://images.unsplash.com/..."
                                value={formData.image}
                                onChange={e => setFormData({ ...formData, image: e.target.value })}
                                className="bg-black/40 border-white/5 focus:border-purple-500/50 rounded-lg text-xs h-8"
                            />
                        </div>

                        <div className="bg-purple-500/5 border border-purple-500/10 rounded-lg p-4 flex gap-3">
                            <AlertCircle className="h-5 w-5 text-purple-400 shrink-0" />
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                                <span className="text-purple-400 font-bold uppercase">Note:</span> Broadcasting will send this alert to all active users immediately. Ensure the information is accurate.
                            </p>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsDialogOpen(false)}
                                className="text-slate-400 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting || uploading}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-8 h-10 rounded-lg font-bold shadow-lg shadow-purple-900/20"
                            >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editingNotif ? "Update Broadcast" : "Deploy Broadcast"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};
