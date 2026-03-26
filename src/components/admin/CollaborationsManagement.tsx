import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Edit2, Save, X, ExternalLink, RefreshCw, Upload, Image as ImageIcon, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { reelsSupabase } from "@/integrations/supabase/reels-client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { logActivity } from "@/utils/auditLogger";

interface ClientCollaboration {
    id: string;
    client_name: string;
    logo_url: string;
    website_url: string | null;
    is_active: boolean;
    display_order: number;
    created_at: string;
}

export const CollaborationsManagementSection = () => {
    const [clients, setClients] = useState<ClientCollaboration[]>([]);
    const [loading, setLoading] = useState(true);
    const [floatingMode, setFloatingMode] = useState<string>("auto");
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        client_name: "",
        logo_url: "",
        website_url: "",
        display_order: 0,
    });
    const [previewUrl, setPreviewUrl] = useState<string>("");

    const fetchClients = async () => {
        setLoading(true);
        const { data, error } = await reelsSupabase
            .from("client_collaborations")
            .select("*")
            .order("display_order", { ascending: true });

        if (error) {
            toast.error("Failed to load collaborations");
        } else if (data) {
            setClients(data);
        }

        const { data: settingsData } = await reelsSupabase
            .from("collaborations_settings")
            .select("floating_mode")
            .eq("id", 1)
            .single();

        if (settingsData) {
            setFloatingMode(settingsData.floating_mode);
        }

        setLoading(false);
    };

    const updateFloatingMode = async (mode: string) => {
        setFloatingMode(mode);
        try {
            const { error } = await reelsSupabase
                .from("collaborations_settings")
                .upsert({ id: 1, floating_mode: mode });

            if (error) throw error;
            toast.success(`Floating mode set to ${mode.toUpperCase()}`);
        } catch (error: any) {
            toast.error("Failed to update setting");
            fetchClients(); // Revert
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleFileUpload = async (file: File) => {
        if (!file) return;

        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            toast.error("File too large. Maximum size is 2MB.");
            return;
        }

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file.");
            return;
        }

        setUploading(true);
        try {
            const ext = file.name.split(".").pop();
            const fileName = `logo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

            const { error: uploadError } = await reelsSupabase.storage
                .from("client-logos")
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data } = reelsSupabase.storage
                .from("client-logos")
                .getPublicUrl(fileName);

            const publicUrl = data.publicUrl;
            setFormData({ ...formData, logo_url: publicUrl });
            setPreviewUrl(publicUrl);
            toast.success("Logo uploaded successfully");
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(error.message || "Failed to upload logo");
        }
        setUploading(false);
    };

    const handleSave = async () => {
        if (!formData.client_name.trim()) {
            toast.error("Please enter a client name");
            return;
        }
        if (!formData.logo_url.trim()) {
            toast.error("Please upload a logo or enter a logo URL");
            return;
        }

        try {
            if (editingId) {
                const { error } = await reelsSupabase
                    .from("client_collaborations")
                    .update({
                        client_name: formData.client_name,
                        logo_url: formData.logo_url,
                        website_url: formData.website_url || null,
                        display_order: Number(formData.display_order),
                    })
                    .eq("id", editingId);

                if (error) throw error;

                logActivity({
                    adminName: user?.user_metadata?.full_name || user?.email || "Admin",
                    adminEmail: user?.email || "Unknown",
                    actionType: "update",
                    targetType: "collaboration",
                    targetId: editingId,
                    targetData: formData,
                    description: `Updated collaboration: ${formData.client_name}`,
                });

                toast.success("Collaboration updated successfully");
            } else {
                const { error } = await reelsSupabase
                    .from("client_collaborations")
                    .insert([
                        {
                            client_name: formData.client_name,
                            logo_url: formData.logo_url,
                            website_url: formData.website_url || null,
                            display_order: Number(formData.display_order),
                        },
                    ]);

                if (error) throw error;

                logActivity({
                    adminName: user?.user_metadata?.full_name || user?.email || "Admin",
                    adminEmail: user?.email || "Unknown",
                    actionType: "create",
                    targetType: "collaboration",
                    targetData: formData,
                    description: `Added new collaboration: ${formData.client_name}`,
                });

                toast.success("Collaboration added successfully");
            }

            resetForm();
            fetchClients();
        } catch (error: any) {
            toast.error(error.message || "Operation failed");
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            const { error } = await reelsSupabase
                .from("client_collaborations")
                .delete()
                .eq("id", id);

            if (error) throw error;

            logActivity({
                adminName: user?.user_metadata?.full_name || user?.email || "Admin",
                adminEmail: user?.email || "Unknown",
                actionType: "delete",
                targetType: "collaboration",
                targetId: id,
                description: `Deleted collaboration: ${name}`,
            });

            toast.success("Collaboration deleted");
            fetchClients();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete");
        }
    };

    const handleEdit = (client: ClientCollaboration) => {
        setFormData({
            client_name: client.client_name,
            logo_url: client.logo_url,
            website_url: client.website_url || "",
            display_order: client.display_order,
        });
        setPreviewUrl(client.logo_url);
        setEditingId(client.id);
        setIsAdding(true);
    };

    const toggleActive = async (client: ClientCollaboration) => {
        try {
            const { error } = await reelsSupabase
                .from("client_collaborations")
                .update({ is_active: !client.is_active })
                .eq("id", client.id);

            if (error) throw error;
            toast.success(`${client.client_name} ${client.is_active ? "hidden" : "visible"} on site`);
            fetchClients();
        } catch (error: any) {
            toast.error(error.message || "Failed to update");
        }
    };

    const resetForm = () => {
        setFormData({ client_name: "", logo_url: "", website_url: "", display_order: 0 });
        setPreviewUrl("");
        setIsAdding(false);
        setEditingId(null);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
                        Collaborations <span className="text-primary italic">Manager</span>
                    </h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                        Manage client logos and floating animation settings
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={fetchClients}
                        disabled={loading}
                        className="bg-black/20 border-white/5 text-slate-400 hover:text-white h-10 w-10 flex items-center justify-center rounded-xl group transition-all"
                        title="Refresh"
                    >
                        <RefreshCw className={`h-4 w-4 transition-all duration-500 ${loading ? "animate-spin" : "group-active:rotate-180"}`} />
                    </Button>
                    <Button
                        onClick={() => { if (isAdding) resetForm(); else setIsAdding(true); }}
                        className="bg-primary hover:bg-primary/90 text-white font-bold h-10 px-4 rounded-xl flex items-center gap-2"
                    >
                        {isAdding ? "Cancel" : <><Plus className="h-4 w-4" /> Add Client</>}
                    </Button>
                </div>
            </div>

            {/* Settings Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-white font-bold text-sm tracking-tight mb-1">Animation Mode</h3>
                    <p className="text-xs text-slate-500">
                        Control how the logos float across the screen on the public site.
                    </p>
                </div>
                <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 w-full md:w-auto overflow-hidden">
                    <button
                        onClick={() => updateFloatingMode("auto")}
                        className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${floatingMode === "auto" ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                    >
                        Auto (5+ Clients)
                    </button>
                    <button
                        onClick={() => updateFloatingMode("always")}
                        className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${floatingMode === "always" ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                    >
                        Always Float
                    </button>
                    <button
                        onClick={() => updateFloatingMode("never")}
                        className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${floatingMode === "never" ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                    >
                        Never Float
                    </button>
                </div>
            </div>

            {/* Add/Edit Form */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300 uppercase tracking-widest text-[10px]">Client Name *</label>
                                <Input
                                    value={formData.client_name}
                                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                                    placeholder="e.g. Acme Corp"
                                    className="bg-black/40 border-white/10 focus:border-primary/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300 uppercase tracking-widest text-[10px]">Website URL (optional)</label>
                                <Input
                                    value={formData.website_url}
                                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                                    placeholder="https://example.com"
                                    className="bg-black/40 border-white/10 focus:border-primary/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300 uppercase tracking-widest text-[10px]">Display Order</label>
                                <Input
                                    type="number"
                                    value={formData.display_order}
                                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                                    className="bg-black/40 border-white/10 focus:border-primary/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300 uppercase tracking-widest text-[10px]">Logo URL (or upload below)</label>
                                <Input
                                    value={formData.logo_url}
                                    onChange={(e) => { setFormData({ ...formData, logo_url: e.target.value }); setPreviewUrl(e.target.value); }}
                                    placeholder="https://... or upload"
                                    className="bg-black/40 border-white/10 focus:border-primary/50"
                                />
                            </div>
                        </div>

                        {/* Upload + Preview */}
                        <div className="mt-6 flex flex-col md:flex-row items-start gap-6">
                            <div className="flex-1">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    id="collab-logo-upload"
                                    name="logo"
                                    aria-label="Upload collaboration logo"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file);
                                    }}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="w-full border-2 border-dashed border-white/10 hover:border-primary/30 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-white transition-all group bg-black/20"
                                >
                                    {uploading ? (
                                        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                                    ) : (
                                        <Upload className="h-8 w-8 group-hover:text-primary transition-colors" />
                                    )}
                                    <span className="text-xs font-bold uppercase tracking-widest">
                                        {uploading ? "Uploading..." : "Click to upload logo"}
                                    </span>
                                    <span className="text-[10px] text-slate-600">PNG, JPG, SVG • Max 2MB</span>
                                </button>
                            </div>

                            {/* Preview */}
                            {previewUrl && (
                                <div className="w-36 h-36 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                    <img src={previewUrl} alt="Preview" className="w-24 h-24 object-contain" />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <Button
                                variant="outline"
                                onClick={resetForm}
                                className="border-white/10 hover:bg-white/5 text-slate-300"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="bg-primary hover:bg-primary/90 text-white px-8"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {editingId ? "Update Client" : "Save Client"}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Clients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.map((client) => (
                    <motion.div
                        layout
                        key={client.id}
                        className={`bg-white/5 border rounded-2xl p-4 flex items-center gap-4 group hover:border-primary/30 transition-all ${client.is_active ? "border-white/10" : "border-white/5 opacity-50"
                            }`}
                    >
                        {/* Logo thumbnail */}
                        <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {client.logo_url ? (
                                <img src={client.logo_url} alt={client.client_name} className="w-12 h-12 object-contain" />
                            ) : (
                                <ImageIcon className="h-6 w-6 text-slate-600" />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-white font-bold text-sm tracking-tight truncate">{client.client_name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                {client.website_url && (
                                    <a
                                        href={client.website_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[9px] text-primary/70 hover:text-primary transition-colors flex items-center gap-1"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                        Visit
                                    </a>
                                )}
                                <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${client.is_active
                                    ? "text-green-400 bg-green-500/10 border-green-500/20"
                                    : "text-slate-500 bg-white/5 border-white/5"
                                    }`}>
                                    {client.is_active ? "Active" : "Hidden"}
                                </span>
                                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest px-1.5 py-0.5 bg-white/5 rounded border border-white/5">
                                    #{client.display_order}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => toggleActive(client)}
                                className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all"
                                title={client.is_active ? "Hide" : "Show"}
                            >
                                <div className={`w-3 h-3 rounded-full ${client.is_active ? "bg-green-500" : "bg-slate-600"}`} />
                            </button>
                            <button
                                onClick={() => handleEdit(client)}
                                className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all"
                                title="Edit"
                            >
                                <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(client.id, client.client_name)}
                                className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all"
                                title="Delete"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Empty State */}
            {!loading && clients.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                    <ImageIcon className="h-10 w-10 text-white/10 mb-4" />
                    <p className="text-slate-500 text-sm font-medium">No collaborations yet. Click "Add Client" to get started.</p>
                </div>
            )}

            {loading && clients.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                    <RefreshCw className="h-10 w-10 text-white/10 animate-spin mb-4" />
                    <p className="text-slate-500 text-sm font-medium">Loading collaborations...</p>
                </div>
            )}
        </div>
    );
};
