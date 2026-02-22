import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    IdCard,
    Search,
    Shield,
    ShieldAlert,
    ShieldCheck,
    RefreshCw,
    User,
    MoreVertical,
    FileText,
    Eye,
    Power,
    X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { IDCard as IDCardVisual } from "./IDCard";
import { useAuth } from "@/hooks/useAuth";
import { logActivity } from "@/utils/auditLogger";

interface PortalUser {
    id: string;
    username: string;
    full_name?: string;
    email: string;
    role: string;
    avatar_url?: string;
    employee_id?: string;
    department?: string;
    id_card_status?: string;
    id_card_issued_at?: string;
    biometric_enabled?: boolean;
}

export const IDCardsSection = () => {
    const [users, setUsers] = useState<PortalUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<PortalUser | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const { user: currentUser } = useAuth();
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({
        full_name: "",
        employee_id: "",
        department: "",
        biometric_enabled: false,
        id_card_status: "Active"
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("portal_users")
                .select("*")
                .order("created_at", { ascending: true });

            if (error) throw error;
            setUsers(data || []);
        } catch (error: any) {
            console.error("Error fetching users for ID cards:", error);
            toast.error("Failed to load employee data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleUpdateIDCard = async (userId: string) => {
        try {
            const { error } = await supabase
                .from("portal_users")
                .update({
                    full_name: editForm.full_name,
                    employee_id: editForm.employee_id,
                    department: editForm.department,
                    biometric_enabled: editForm.biometric_enabled,
                    id_card_status: editForm.id_card_status,
                    updated_at: new Date().toISOString()
                })
                .eq("id", userId);

            if (error) throw error;

            // Log update
            logActivity({
                adminName: currentUser?.user_metadata?.full_name || currentUser?.email || "Admin",
                adminEmail: currentUser?.email || "Unknown",
                actionType: 'update',
                targetType: 'employee_id_details',
                targetId: userId,
                targetData: editForm,
                description: `Updated ID card details for user: ${userId}`
            });

            toast.success("Employee ID details updated");
            setIsEditing(null);
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleReissue = async (userId: string) => {
        if (!confirm("Are you sure you want to reissue this ID card? This will update the issue date.")) return;
        try {
            const { error } = await supabase
                .from("portal_users")
                .update({
                    id_card_issued_at: new Date().toISOString(),
                    id_card_status: 'Active',
                    updated_at: new Date().toISOString()
                })
                .eq("id", userId);

            if (error) throw error;

            // Log reissue
            logActivity({
                adminName: currentUser?.user_metadata?.full_name || currentUser?.email || "Admin",
                adminEmail: currentUser?.email || "Unknown",
                actionType: 'update',
                targetType: 'employee_id_reissue',
                targetId: userId,
                description: `Reissued ID card for user: ${userId}`
            });

            toast.success("ID Card reissued successfully");
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleToggleStatus = async (user: PortalUser) => {
        const nextStatus = user.id_card_status === 'Active' ? 'Suspended' : 'Active';
        try {
            const { error } = await supabase
                .from("portal_users")
                .update({ id_card_status: nextStatus })
                .eq("id", user.id);
            if (error) throw error;

            // Log toggle status
            logActivity({
                adminName: currentUser?.user_metadata?.full_name || currentUser?.email || "Admin",
                adminEmail: currentUser?.email || "Unknown",
                actionType: 'update',
                targetType: 'employee_id_status',
                targetId: user.id,
                description: `Toggled ID card status for user ${user.id} to: ${nextStatus}`
            });

            toast.success(`ID Card ${nextStatus === 'Active' ? 'activated' : 'suspended'}`);
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (u.employee_id?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <IdCard className="text-purple-400 h-6 w-6" />
                        ID Card Management
                    </h2>
                    <p className="text-slate-500 mt-1 text-sm">Create, manage, and verify digital employee identification</p>
                </div>

                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                    <Input
                        placeholder="Search ID, Name or Username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-[#110C1D] border-white/5 pl-10 focus:ring-purple-500/20 focus:border-purple-500/30 text-slate-200"
                    />
                </div>
            </div>

            {/* List View */}
            <div className="bg-[#110C1D] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/[0.02] uppercase text-[10px] tracking-widest font-bold text-slate-500 border-b border-white/5">
                        <tr>
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4">Employee ID</th>
                            <th className="px-6 py-4">Biometrics</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-white/[0.01] transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-white/5">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-600">
                                                    {user.username.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white tracking-tight">{user.full_name || user.username}</div>
                                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{user.department || 'No Dept'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-mono text-xs text-slate-400">{user.employee_id || 'NOT_ISSUED'}</span>
                                </td>
                                <td className="px-6 py-4">
                                    {user.biometric_enabled ? (
                                        <div className="flex items-center gap-1.5 text-green-500 bg-green-500/10 px-2 py-1 rounded-full w-fit">
                                            <ShieldCheck className="h-3.5 w-3.5" />
                                            <span className="text-[10px] font-bold uppercase tracking-tighter">Enabled</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-slate-500 bg-white/5 px-2 py-1 rounded-full w-fit">
                                            <ShieldAlert className="h-3.5 w-3.5 opacity-50" />
                                            <span className="text-[10px] font-bold uppercase tracking-tighter">Disabled</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${user.id_card_status === 'Active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                        'bg-red-500/10 text-red-500 border border-red-500/20'
                                        }`}>
                                        {user.id_card_status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setIsPreviewOpen(true);
                                            }}
                                            className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors border border-white/5"
                                            title="View ID Card"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(user.id);
                                                setEditForm({
                                                    full_name: user.full_name || user.username,
                                                    employee_id: user.employee_id || "",
                                                    department: user.department || "",
                                                    biometric_enabled: user.biometric_enabled || false,
                                                    id_card_status: user.id_card_status || "Active"
                                                });
                                            }}
                                            className="p-2 hover:bg-purple-500/10 rounded-lg text-purple-400 hover:text-purple-300 transition-colors border border-purple-500/20"
                                            title="Edit ID Details"
                                        >
                                            <User className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(user)}
                                            className={`p-2 rounded-lg transition-colors border ${user.id_card_status === 'Active'
                                                ? 'hover:bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                : 'hover:bg-green-500/10 text-green-500 border-green-500/20'
                                                }`}
                                            title={user.id_card_status === 'Active' ? 'Suspend Card' : 'Activate Card'}
                                        >
                                            <Power className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleReissue(user.id)}
                                            className="p-2 hover:bg-white/5 rounded-lg text-blue-400 hover:text-blue-300 transition-colors border border-white/5"
                                            title="Reissue Card"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Quick Stats Overlay (Optional) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#110C1D] border border-white/5 rounded-2xl p-6">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Digital IDs</div>
                    <div className="text-3xl font-bold text-white mb-4">{users.length}</div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-full"></div>
                    </div>
                </div>
                <div className="bg-[#110C1D] border border-white/5 rounded-2xl p-6">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Biometric Secure</div>
                    <div className="text-3xl font-bold text-white mb-4">{users.filter(u => u.biometric_enabled).length}</div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${(users.filter(u => u.biometric_enabled).length / users.length) * 100}%` }}></div>
                    </div>
                </div>
                <div className="bg-[#110C1D] border border-white/5 rounded-2xl p-6">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Active Status</div>
                    <div className="text-3xl font-bold text-white mb-4">{users.filter(u => u.id_card_status === 'Active').length}</div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${(users.filter(u => u.id_card_status === 'Active').length / users.length) * 100}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditing && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditing(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#110C1D] border border-white/10 rounded-2xl p-8 w-full max-w-lg relative z-10 shadow-2xl"
                        >
                            <h3 className="text-xl font-bold text-white mb-6">Edit ID Card Details</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-1.5 block">Full Name</label>
                                    <Input
                                        value={editForm.full_name}
                                        onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                                        className="bg-black/20 border-white/5 h-12"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-1.5 block">Employee ID</label>
                                        <Input
                                            value={editForm.employee_id}
                                            onChange={e => setEditForm({ ...editForm, employee_id: e.target.value })}
                                            placeholder="e.g. ID0345"
                                            className="bg-black/20 border-white/5 h-12 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-1.5 block">Department</label>
                                        <select
                                            className="w-full bg-black/20 border border-white/5 rounded-lg h-12 px-3 text-sm outline-none text-slate-200"
                                            value={editForm.department}
                                            onChange={e => setEditForm({ ...editForm, department: e.target.value })}
                                        >
                                            <option value="">Select Dept</option>
                                            <option value="Executive">Executive</option>
                                            <option value="Development">Development</option>
                                            <option value="Digital Marketing">Digital Marketing</option>
                                            <option value="HR & Admin">HR & Admin</option>
                                            <option value="Sales">Sales</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-white tracking-wide">Face Biometric</div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Enable login verification</div>
                                    </div>
                                    <button
                                        onClick={() => setEditForm({ ...editForm, biometric_enabled: !editForm.biometric_enabled })}
                                        className={`w-12 h-6 rounded-full transition-all relative ${editForm.biometric_enabled ? 'bg-purple-600' : 'bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editForm.biometric_enabled ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-1.5 block">Card Status</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Active', 'Suspended', 'Revoked'].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => setEditForm({ ...editForm, id_card_status: status })}
                                                className={`py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-tighter border transition-all ${editForm.id_card_status === status
                                                    ? 'bg-purple-600/20 border-purple-500 text-white'
                                                    : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'
                                                    }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <Button
                                    onClick={() => handleUpdateIDCard(isEditing!)}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold h-12"
                                >
                                    Update Identity
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsEditing(null)}
                                    className="flex-1 border border-white/5 text-slate-500 hover:text-white"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Preview Modal */}
            <AnimatePresence>
                {isPreviewOpen && selectedUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsPreviewOpen(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative z-10"
                        >
                            <IDCardVisual user={selectedUser} onReissue={() => handleReissue(selectedUser.id)} />
                            <button
                                onClick={() => setIsPreviewOpen(false)}
                                className="absolute -top-12 -right-12 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
