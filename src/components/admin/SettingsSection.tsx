import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Shield, UserPlus, Users, ImagePlus, Lock, Unlock, Globe, EyeOff, Zap, Type, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { reelsSupabase } from "@/integrations/supabase/reels-client";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { logActivity } from "@/utils/auditLogger";

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
    const { user } = useAuth();
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [siteSettings, setSiteSettings] = useState<any[]>([]);
    const [settingsLoading, setSettingsLoading] = useState(false);

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

    const fetchSettings = async () => {
        setSettingsLoading(true);
        try {
            const { data, error } = await reelsSupabase
                .from("site_settings")
                .select("*");
            if (error) throw error;
            setSiteSettings(data || []);
        } catch (error) {
            console.error("Error fetching settings from Reels DB:", error);
        } finally {
            setSettingsLoading(false);
        }
    };

    const updateSetting = async (key: string, value: any) => {
        try {
            const { error } = await reelsSupabase
                .from("site_settings")
                .update({
                    value: JSON.stringify(value),
                    updated_at: new Date().toISOString()
                })
                .eq("key", key);

            if (error) throw error;

            toast.success(`Setting updated`);
            fetchSettings();

            // Log activity
            logActivity({
                adminName: user?.user_metadata?.full_name || user?.email || "Admin",
                adminEmail: user?.email || "Unknown",
                actionType: 'update',
                targetType: 'site_setting',
                description: `Updated site setting: ${key} to ${value}`
            });
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchAdmins();
        fetchSettings();
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

                // Log update
                logActivity({
                    adminName: user?.user_metadata?.full_name || user?.email || "Admin",
                    adminEmail: user?.email || "Unknown",
                    actionType: 'update',
                    targetType: 'admin_user',
                    targetId: isEditing,
                    targetData: { username: form.username, email: form.email, role: form.role },
                    description: `Updated admin account: ${form.username}`
                });

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

                // Log creation
                logActivity({
                    adminName: user?.user_metadata?.full_name || user?.email || "Admin",
                    adminEmail: user?.email || "Unknown",
                    actionType: 'create',
                    targetType: 'admin_user',
                    targetData: { username: form.username, email: form.email, role: form.role },
                    description: `Created new admin account: ${form.username}`
                });

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

            // Log deletion
            logActivity({
                adminName: user?.user_metadata?.full_name || user?.email || "Admin",
                adminEmail: user?.email || "Unknown",
                actionType: 'delete',
                targetType: 'admin_user',
                targetId: id,
                description: `Deleted admin account: ${username}`
            });

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
                    <h2 className="text-2xl font-bold text-white tracking-tight">Portal Configuration</h2>
                    <p className="text-slate-500 mt-1 text-sm">Manage site-wide settings and administrative users</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-[#110C1D] border border-white/5 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
                        <Globe className="text-blue-400 h-4 w-4" />
                        <span className="text-sm font-medium text-slate-300">Live Status: Active</span>
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
            </div>

            <Tabs defaultValue="admins" className="w-full">
                <TabsList className="bg-[#110C1D] border border-white/5 p-1 mb-8">
                    <TabsTrigger value="admins" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all px-8">Admin Accounts</TabsTrigger>
                    <TabsTrigger value="site" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all px-8">Site Shield Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="admins">
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

                                                            try {
                                                                const fileExt = file.name.split('.').pop();
                                                                const filePath = `${Math.random()}.${fileExt}`;

                                                                const { error: uploadError } = await supabase.storage
                                                                    .from('portal-avatars')
                                                                    .upload(filePath, file);

                                                                if (uploadError) {
                                                                    if (uploadError.message?.includes('Bucket not found')) {
                                                                        toast.error("Storage Error: 'portal-avatars' bucket not found. Please refer to the implementation plan to create it.");
                                                                    } else {
                                                                        throw uploadError;
                                                                    }
                                                                    return;
                                                                }

                                                                const { data: { publicUrl } } = supabase.storage
                                                                    .from('portal-avatars')
                                                                    .getPublicUrl(filePath);

                                                                setForm({ ...form, avatar_url: publicUrl });
                                                                toast.success("Avatar uploaded");
                                                            } catch (error: any) {
                                                                toast.error("Upload failed: " + error.message);
                                                            }
                                                        }}
                                                        className="pl-10 cursor-pointer text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/5 file:text-slate-300 hover:file:bg-white/10 bg-black/20 border-white/5 text-slate-400 h-10 rounded-lg"
                                                    />
                                                </div>
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
                                                            <img src={admin.avatar_url} alt={admin.username} className="h-8 w-8 rounded-full object-cover ring-2 ring-white/10" />
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
                                                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${admin.role === 'superadmin' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                                                        {admin.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-muted-foreground">
                                                    {admin.updated_at ? new Date(admin.updated_at).toLocaleDateString() : new Date(admin.created_at).toLocaleDateString()}
                                                </td>
                                                {isSuperAdmin && (
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => { setIsEditing(admin.id); setForm({ username: admin.username, email: admin.email, password: admin.password || "", role: admin.role, avatar_url: admin.avatar_url || "" }); }} className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-colors border border-primary/20"><Edit2 className="h-3.5 w-3.5" /></button>
                                                            <button onClick={() => handleDelete(admin.id, admin.username)} className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-colors border border-destructive/20"><Trash2 className="h-3.5 w-3.5" /></button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="site">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 pb-12">
                        {/* Right Click Protection Setting */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[#110C1D] border border-white/5 rounded-2xl p-8 shadow-xl relative overflow-hidden group h-full"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Lock className="h-24 w-24 text-white" />
                            </div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="bg-red-500/10 h-14 w-14 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
                                    <Shield className="h-7 w-7 text-red-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Right-Click Protection</h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">
                                    Block right-clicks, text selection, and copy-paste across all public pages to prevent content theft.
                                </p>

                                <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5 mt-auto">
                                    <div className="flex items-center gap-3">
                                        {JSON.parse(siteSettings.find(s => s.key === 'content_protection_enabled')?.value || 'false') ? (
                                            <Lock className="h-4 w-4 text-red-400" />
                                        ) : (
                                            <Unlock className="h-4 w-4 text-green-400" />
                                        )}
                                        <span className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                                            {JSON.parse(siteSettings.find(s => s.key === 'content_protection_enabled')?.value || 'false') ? 'Protected' : 'Unprotected'}
                                        </span>
                                    </div>
                                    <Switch
                                        checked={JSON.parse(siteSettings.find(s => s.key === 'content_protection_enabled')?.value || 'false')}
                                        onCheckedChange={(checked) => updateSetting('content_protection_enabled', checked)}
                                        className="data-[state=checked]:bg-red-500"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Stealth Mode (DevTools Protection) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-[#110C1D] border border-white/5 rounded-2xl p-8 shadow-xl relative overflow-hidden group h-full"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <EyeOff className="h-24 w-24 text-white" />
                            </div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="bg-purple-500/10 h-14 w-14 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
                                    <Zap className="h-7 w-7 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Stealth Mode</h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">
                                    Detects if browser developer tools (Inspect Element) are opened and restricts access to the site content.
                                </p>

                                <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5 mt-auto">
                                    <div className="flex items-center gap-3">
                                        <RefreshCw className={`h-4 w-4 ${JSON.parse(siteSettings.find(s => s.key === 'devtools_protection_enabled')?.value || 'false') ? 'text-purple-400 animate-spin-slow' : 'text-slate-500'}`} />
                                        <span className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                                            {JSON.parse(siteSettings.find(s => s.key === 'devtools_protection_enabled')?.value || 'false') ? 'Active' : 'Disabled'}
                                        </span>
                                    </div>
                                    <Switch
                                        checked={JSON.parse(siteSettings.find(s => s.key === 'devtools_protection_enabled')?.value || 'false')}
                                        onCheckedChange={(checked) => updateSetting('devtools_protection_enabled', checked)}
                                        className="data-[state=checked]:bg-purple-500"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Anti-Screenshot (Focus Blur) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-[#110C1D] border border-white/5 rounded-2xl p-8 shadow-xl relative overflow-hidden group h-full"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <RefreshCw className="h-24 w-24 text-white" />
                            </div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="bg-blue-500/10 h-14 w-14 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                                    <EyeOff className="h-7 w-7 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Anti-Screenshot</h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">
                                    Automatically blurs the entire website when the user clicks away or tries to focus on external capture tools.
                                </p>

                                <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5 mt-auto">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2 w-2 rounded-full ${JSON.parse(siteSettings.find(s => s.key === 'focus_blur_enabled')?.value || 'false') ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`} />
                                        <span className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                                            {JSON.parse(siteSettings.find(s => s.key === 'focus_blur_enabled')?.value || 'false') ? 'Monitoring' : 'Inactive'}
                                        </span>
                                    </div>
                                    <Switch
                                        checked={JSON.parse(siteSettings.find(s => s.key === 'focus_blur_enabled')?.value || 'false')}
                                        onCheckedChange={(checked) => updateSetting('focus_blur_enabled', checked)}
                                        className="data-[state=checked]:bg-blue-500"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Dynamic Watermark */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="bg-[#110C1D] border border-white/5 rounded-2xl p-8 shadow-xl relative overflow-hidden group h-full"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Type className="h-24 w-24 text-white" />
                            </div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="bg-pink-500/10 h-14 w-14 rounded-2xl flex items-center justify-center mb-6 border border-pink-500/20">
                                    <Type className="h-7 w-7 text-pink-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Floating Watermark</h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">
                                    Injects a dynamic, floating "MS Digi Mark" watermark overlay across all media to prevent content redistribution.
                                </p>

                                <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5 mt-auto">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-4 w-4 rounded border-2 border-dashed ${JSON.parse(siteSettings.find(s => s.key === 'watermark_enabled')?.value || 'false') ? 'border-pink-400' : 'border-slate-600'}`} />
                                        <span className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                                            {JSON.parse(siteSettings.find(s => s.key === 'watermark_enabled')?.value || 'false') ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                    <Switch
                                        checked={JSON.parse(siteSettings.find(s => s.key === 'watermark_enabled')?.value || 'false')}
                                        onCheckedChange={(checked) => updateSetting('watermark_enabled', checked)}
                                        className="data-[state=checked]:bg-pink-500"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
