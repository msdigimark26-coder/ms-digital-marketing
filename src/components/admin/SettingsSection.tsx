import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Shield, UserPlus, Users, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface PortalAdmin {
    id: string;
    username: string;
    email: string;
    password?: string;
    role: string;
    avatar_url?: string;
    created_at: string;
    updated_at?: string;
}

export const SettingsSection = () => {
    const [admins, setAdmins] = useState<PortalAdmin[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ username: "", email: "", password: "", role: "admin", avatar_url: "" });
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("portal_users")
                .select("*")
                .order("created_at", { ascending: true });

            if (error) throw error;
            setAdmins(data || []);
        } catch (error: any) {
            console.error("Error fetching admins:", error);
            // Fallback for demo if table doesn't exist yet
            setAdmins([
                { id: "1", username: "msdigimark", email: "headofms@msdigimark.org", role: "superadmin", created_at: new Date().toISOString() }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
        const session = sessionStorage.getItem("ms-admin-session");
        if (session) {
            const user = JSON.parse(session);
            setIsSuperAdmin(['superadmin', 'super_admin'].includes(user.role));
        }
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const now = new Date().toISOString();

            if (isEditing) {
                const { error } = await supabase
                    .from("portal_users")
                    .update({
                        username: form.username,
                        email: form.email,
                        password: form.password,
                        role: form.role,
                        avatar_url: form.avatar_url,
                        updated_at: now
                    })
                    .eq("id", isEditing);

                if (error) {
                    // If error is about missing column, retry without it
                    if (error.message?.includes('updated_at')) {
                        const { error: retryError } = await supabase
                            .from("portal_users")
                            .update({
                                username: form.username,
                                email: form.email,
                                password: form.password,
                                role: form.role,
                                avatar_url: form.avatar_url
                            })
                            .eq("id", isEditing);
                        if (retryError) throw retryError;
                    } else {
                        throw error;
                    }
                }
                toast.success("Admin updated successfully");

                // Check if we updated the currently logged-in user
                const session = sessionStorage.getItem("ms-admin-session");
                if (session) {
                    const currentUser = JSON.parse(session);
                    if (currentUser.id === isEditing) {
                        const newSession = { ...currentUser, ...form, id: isEditing, updated_at: now };
                        sessionStorage.setItem("ms-admin-session", JSON.stringify(newSession));
                        window.dispatchEvent(new Event('user-profile-updated'));
                    }
                }

            } else {
                // Ensure we don't send updated_at during create to avoid schema issues if missing
                const { error } = await supabase
                    .from("portal_users")
                    .insert([{
                        username: form.username,
                        email: form.email,
                        password: form.password,
                        role: form.role,
                        avatar_url: form.avatar_url
                    }]);
                if (error) throw error;
                toast.success("New admin created successfully");
            }
            setForm({ username: "", email: "", password: "", role: "admin", avatar_url: "" });
            setIsEditing(null);
            fetchAdmins();
        } catch (error: any) {
            console.error("Save error:", error);
            toast.error(error.message || "Failed to save user details");
        }
    };

    const handleDelete = async (id: string, username: string) => {
        if (username === "msdigimark") return toast.error("Cannot delete the main admin");
        if (!confirm(`Are you sure you want to delete admin ${username}?`)) return;

        try {
            const { error } = await supabase
                .from("portal_users")
                .delete()
                .eq("id", id);
            if (error) throw error;
            toast.success("Admin deleted");
            fetchAdmins();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Settings</h2>
                    <p className="text-slate-500 mt-1 text-sm">Manage admin portal users and permissions</p>
                </div>
                <div className="bg-[#110C1D] border border-white/5 rounded-xl px-6 py-3 flex items-center gap-4 shadow-sm">
                    <div className="bg-purple-500/10 p-2 rounded-lg">
                        <Users className="text-purple-400 h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-2xl font-bold text-white">{admins.length}</span>
                        <span className="text-xs text-slate-500 ml-2">Total Admins</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Admin user management form */}
                <div className="lg:col-span-1">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#110C1D] border border-white/5 rounded-xl p-6 shadow-sm"
                    >
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-white">
                            {isEditing ? <Edit2 className="h-4 w-4 text-purple-400" /> : <UserPlus className="h-4 w-4 text-purple-400" />}
                            {isEditing ? "Edit Admin" : "Create New Admin"}
                        </h3>

                        {/* Only Superadmin can create/edit users */}
                        {!isSuperAdmin ? (
                            <div className="text-center py-8 text-slate-500 bg-white/5 rounded-xl border border-white/5">
                                <Shield className="h-8 w-8 mx-auto mb-3 opacity-20" />
                                <p className="font-semibold text-sm">Restricted Access</p>
                                <p className="text-xs mt-1">Only Superverify Admins can manage users.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block ml-0.5">Username</label>
                                    <Input
                                        value={form.username}
                                        onChange={e => setForm({ ...form, username: e.target.value })}
                                        placeholder="e.g. jdoe"
                                        required
                                        className="bg-black/20 border-white/5 focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/20 h-10 rounded-lg text-sm text-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block ml-0.5">Email Address</label>
                                    <Input
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        placeholder="admin@msdigimark.org"
                                        required
                                        className="bg-black/20 border-white/5 focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/20 h-10 rounded-lg text-sm text-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block ml-0.5">Password</label>
                                    <Input
                                        type="text"
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        placeholder="Set temporary password"
                                        required={!isEditing}
                                        className="bg-black/20 border-white/5 focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/20 h-10 rounded-lg text-sm text-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block ml-0.5">Profile Image</label>
                                    <div className="relative space-y-2">
                                        {form.avatar_url && (
                                            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/10">
                                                <img src={form.avatar_url} alt="Preview" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        // Optionally delete from storage
                                                        try {
                                                            if (form.avatar_url) {
                                                                const fileName = form.avatar_url.split('/').pop();
                                                                if (fileName) {
                                                                    await supabase.storage
                                                                        .from('admin-avatars')
                                                                        .remove([fileName]);
                                                                }
                                                            }
                                                        } catch (error) {
                                                            console.error('Error removing old avatar:', error);
                                                        }
                                                        setForm({ ...form, avatar_url: "" });
                                                    }}
                                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white text-xs"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                        <div className="relative">
                                            <ImagePlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;

                                                    // Validate file type
                                                    if (!file.type.startsWith('image/')) {
                                                        toast.error("Please select a valid image file");
                                                        e.target.value = ''; // Reset input
                                                        return;
                                                    }

                                                    // Validate file size (max 5MB)
                                                    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
                                                    if (file.size > maxSize) {
                                                        toast.error("File size must be less than 5MB");
                                                        e.target.value = ''; // Reset input
                                                        return;
                                                    }

                                                    const loadingToast = toast.loading("Uploading image...");

                                                    try {
                                                        // Generate unique filename with timestamp
                                                        const fileExt = file.name.split('.').pop();
                                                        const timestamp = Date.now();
                                                        const randomStr = Math.random().toString(36).substring(2, 15);
                                                        const fileName = `avatar_${timestamp}_${randomStr}.${fileExt}`;
                                                        const filePath = fileName;

                                                        // Delete old avatar if exists
                                                        if (form.avatar_url) {
                                                            try {
                                                                const oldFileName = form.avatar_url.split('/').pop();
                                                                if (oldFileName) {
                                                                    await supabase.storage
                                                                        .from('admin-avatars')
                                                                        .remove([oldFileName]);
                                                                }
                                                            } catch (error) {
                                                                console.error('Error removing old avatar:', error);
                                                            }
                                                        }

                                                        // Upload new file
                                                        const { error: uploadError, data } = await supabase.storage
                                                            .from('admin-avatars')
                                                            .upload(filePath, file, {
                                                                cacheControl: '3600',
                                                                upsert: false
                                                            });

                                                        if (uploadError) {
                                                            console.error('Upload error:', uploadError);
                                                            throw uploadError;
                                                        }

                                                        // Get public URL
                                                        const { data: { publicUrl } } = supabase.storage
                                                            .from('admin-avatars')
                                                            .getPublicUrl(filePath);

                                                        setForm({ ...form, avatar_url: publicUrl });
                                                        toast.dismiss(loadingToast);
                                                        toast.success("Image uploaded successfully!");
                                                        e.target.value = ''; // Reset input for future uploads
                                                    } catch (error: any) {
                                                        console.error("Upload error details:", error);
                                                        toast.dismiss(loadingToast);

                                                        // Provide helpful error messages
                                                        let errorMessage = "Error uploading image";
                                                        if (error.message?.includes('row-level security')) {
                                                            errorMessage = "Permission denied. Please contact administrator to fix storage bucket permissions.";
                                                        } else if (error.message?.includes('Bucket not found')) {
                                                            errorMessage = "Storage bucket not configured. Please contact administrator.";
                                                        } else if (error.message) {
                                                            errorMessage = `Upload failed: ${error.message}`;
                                                        }

                                                        toast.error(errorMessage);
                                                        e.target.value = ''; // Reset input
                                                    }
                                                }}
                                                className="pl-10 cursor-pointer text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/5 file:text-slate-300 hover:file:bg-white/10 bg-black/20 border-white/5 text-slate-400 h-10 rounded-lg"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-600 ml-0.5">Max file size: 5MB. Supported: JPG, PNG, GIF, WebP</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block ml-0.5">Role</label>
                                    <select
                                        className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/20 outline-none text-slate-200"
                                        value={form.role}
                                        onChange={e => setForm({ ...form, role: e.target.value })}
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="manager">Manager</option>
                                        <option value="superadmin">Super Admin</option>
                                    </select>
                                </div>
                                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 mt-4 h-10 rounded-lg text-white font-medium shadow-md shadow-purple-900/20">
                                    {isEditing ? "Update Admin Account" : "Add Admin Employee"}
                                </Button>
                                {isEditing && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full border border-white/5 text-slate-400 hover:text-white h-10 rounded-lg"
                                        onClick={() => {
                                            setIsEditing(null);
                                            setForm({ username: "", email: "", password: "", role: "admin", avatar_url: "" });
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </form>
                        )}
                    </motion.div>
                </div>

                {/* Admins List */}
                <div className="lg:col-span-2">
                    <div className="bg-[#110C1D] border border-white/5 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.02] uppercase text-[10px] tracking-widest font-bold text-slate-500 border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4">Admin User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Last Updated</th>
                                    {isSuperAdmin && <th className="px-6 py-4 text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {admins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {admin.avatar_url ? (
                                                    <img
                                                        src={admin.avatar_url}
                                                        alt={admin.username}
                                                        className="h-8 w-8 rounded-full object-cover ring-2 ring-white/10"
                                                    />
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center text-xs font-bold ring-2 ring-purple-500/20 text-purple-400">
                                                        {admin.username.substring(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-semibold text-sm">{admin.username}</div>
                                                    <div className="text-xs text-muted-foreground">{admin.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${admin.role === 'superadmin' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                'bg-primary/10 text-primary border border-primary/20'
                                                }`}>
                                                {admin.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-muted-foreground">
                                            {admin.updated_at ? new Date(admin.updated_at).toLocaleDateString() + ' ' + new Date(admin.updated_at).toLocaleTimeString() : new Date(admin.created_at).toLocaleDateString()}
                                        </td>
                                        {isSuperAdmin && (
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            setIsEditing(admin.id);
                                                            setForm({
                                                                username: admin.username,
                                                                email: admin.email,
                                                                password: admin.password || "",
                                                                role: admin.role,
                                                                avatar_url: admin.avatar_url || ""
                                                            });
                                                        }}
                                                        className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-colors border border-primary/20"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(admin.id, admin.username)}
                                                        className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-colors border border-destructive/20"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                {admins.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={isSuperAdmin ? 4 : 3} className="px-6 py-12 text-center text-muted-foreground italic">
                                            No admin users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
