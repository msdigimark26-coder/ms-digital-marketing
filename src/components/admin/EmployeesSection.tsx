import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    Plus,
    Trash2,
    Edit2,
    User,
    Image as ImageIcon,
    Loader2,
    X,
    MoveUp,
    MoveDown,
    Eye,
    EyeOff
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { logActivity } from "@/utils/auditLogger";

interface Employee {
    id: string;
    name: string;
    title: string;
    description: string;
    image_url: string;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

const EmployeeCard = React.memo(({
    employee,
    onToggleActive,
    onEdit,
    onDelete,
    onMove,
    isFirst,
    isLast
}: {
    employee: Employee,
    onToggleActive: (e: Employee) => void,
    onEdit: (e: Employee) => void,
    onDelete: (id: string) => void,
    onMove: (e: Employee, dir: 'up' | 'down') => void,
    isFirst: boolean,
    isLast: boolean
}) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className={`bg-[#110C1D] border ${employee.is_active ? 'border-white/5' : 'border-rose-500/20'} rounded-xl p-4 flex flex-col group hover:border-white/10 transition-all duration-300 shadow-sm relative`}
    >
        {/* Active/Inactive Badge */}
        <div className="absolute top-2 right-2 z-10">
            <button
                onClick={() => onToggleActive(employee)}
                className={`p-1.5 rounded-lg transition-colors ${employee.is_active
                    ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                    : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                    }`}
                title={employee.is_active ? 'Active' : 'Inactive'}
            >
                {employee.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>
        </div>

        {/* Employee Image */}
        <div className="w-full aspect-square rounded-lg overflow-hidden bg-black/40 mb-3 flex items-center justify-center">
            <img
                src={employee.image_url}
                alt={employee.name}
                className="w-full h-full object-contain"
                loading="lazy"
            />
        </div>

        {/* Employee Info */}
        <div className="flex-1">
            <h3 className="font-semibold text-sm text-white mb-1 truncate">
                {employee.name}
            </h3>
            <p className="text-xs text-purple-400 mb-2 line-clamp-2">
                {employee.title}
            </p>
            <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                {employee.description}
            </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-3">
            <div className="flex gap-1">
                <button
                    onClick={() => onEdit(employee)}
                    className="p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-purple-400 transition-all"
                    title="Edit"
                >
                    <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                    onClick={() => onDelete(employee.id)}
                    className="p-1.5 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all"
                    title="Delete"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
            <div className="flex gap-1">
                <button
                    onClick={() => onMove(employee, 'up')}
                    disabled={isFirst}
                    className="p-1.5 rounded hover:bg-white/5 text-slate-500 hover:text-white transition-all disabled:opacity-10 disabled:cursor-not-allowed"
                    title="Move Up"
                >
                    <MoveUp className="h-3 w-3" />
                </button>
                <button
                    onClick={() => onMove(employee, 'down')}
                    disabled={isLast}
                    className="p-1.5 rounded hover:bg-white/5 text-slate-500 hover:text-white transition-all disabled:opacity-10 disabled:cursor-not-allowed"
                    title="Move Down"
                >
                    <MoveDown className="h-3 w-3" />
                </button>
            </div>
        </div>
    </motion.div>
));

EmployeeCard.displayName = "EmployeeCard";

export const EmployeesSection = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInactive, setShowInactive] = useState(true);
    const [actionId, setActionId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const { user } = useAuth();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<{
        name: string;
        title: string;
        description: string;
        image_url: string;
        is_active: boolean;
    }>({ name: "", title: "", description: "", image_url: "", is_active: true });
    const [uploading, setUploading] = useState(false);

    const fetchEmployees = useCallback(async () => {
        if (employees.length === 0) setLoading(true);
        try {
            const { data, error } = await supabase
                .from("employees")
                .select("*")
                .order("display_order", { ascending: true });
            if (error) throw error;
            setEmployees(data || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch employees");
        } finally {
            setLoading(false);
        }
    }, [employees.length]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

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
                .from('employee-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('employee-images')
                .getPublicUrl(filePath);

            setForm(prev => ({ ...prev, image_url: publicUrl }));
            toast.success("Profile image uploaded successfully");
        } catch (error: any) {
            toast.error("Error uploading image: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.title || !form.description || !form.image_url) {
            toast.error("All fields are required");
            return;
        }

        try {
            if (editingId) {
                const { data, error } = await supabase
                    .from("employees")
                    .update({
                        name: form.name,
                        title: form.title,
                        description: form.description,
                        image_url: form.image_url,
                        is_active: form.is_active
                    })
                    .eq("id", editingId)
                    .select();

                if (error) throw error;
                if (data?.[0]) {
                    setEmployees(prev => prev.map(e => e.id === editingId ? data[0] : e));

                    // Log the update
                    logActivity({
                        adminName: user?.user_metadata?.full_name || user?.email || "Admin",
                        adminEmail: user?.email || "Unknown",
                        actionType: 'update',
                        targetType: 'employee',
                        targetId: editingId,
                        targetData: data[0],
                        description: `Updated employee: ${form.name}`
                    });
                }
                toast.success("Employee updated successfully");
            } else {
                const { data: maxOrderData } = await supabase
                    .from("employees")
                    .select("display_order")
                    .order("display_order", { ascending: false })
                    .limit(1);

                const nextOrder = maxOrderData && maxOrderData.length > 0
                    ? maxOrderData[0].display_order + 1
                    : 1;

                const { data, error } = await supabase
                    .from("employees")
                    .insert([{
                        name: form.name,
                        title: form.title,
                        description: form.description,
                        image_url: form.image_url,
                        is_active: form.is_active,
                        display_order: nextOrder
                    }])
                    .select();

                if (error) throw error;
                if (data?.[0]) {
                    setEmployees(prev => [...prev, data[0]]);

                    // Log the creation
                    logActivity({
                        adminName: user?.user_metadata?.full_name || user?.email || "Admin",
                        adminEmail: user?.email || "Unknown",
                        actionType: 'create',
                        targetType: 'employee',
                        targetId: data[0].id,
                        targetData: data[0],
                        description: `Added new employee: ${form.name}`
                    });
                }
                toast.success("Employee added successfully");
            }
            setForm({ name: "", title: "", description: "", image_url: "", is_active: true });
            setIsAdding(false);
            setEditingId(null);
        } catch (error: any) {
            toast.error(`Error: ${error.message || 'Failed to save employee'}`);
        }
    };

    const handleEdit = useCallback((e: Employee) => {
        setForm({
            name: e.name,
            title: e.title,
            description: e.description,
            image_url: e.image_url,
            is_active: e.is_active
        });
        setEditingId(e.id);
        setIsAdding(true);
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        if (!confirm("Are you sure you want to delete this employee?")) return;
        try {
            const { error } = await supabase.from("employees").delete().eq("id", id);
            if (error) throw error;

            // Log the deletion
            logActivity({
                adminName: user?.user_metadata?.full_name || user?.email || "Admin",
                adminEmail: user?.email || "Unknown",
                actionType: 'delete',
                targetType: 'employee',
                targetId: id,
                description: `Deleted employee with ID: ${id}`
            });

            toast.success("Employee deleted successfully");
            setEmployees(prev => prev.filter(e => e.id !== id));
        } catch (error: any) {
            toast.error(error.message);
            fetchEmployees();
        }
    }, [fetchEmployees]);

    const toggleActive = useCallback(async (employee: Employee) => {
        if (actionId) return;
        try {
            setActionId(employee.id);
            const newStatus = !employee.is_active;

            setEmployees(prev => prev.map(e => e.id === employee.id ? { ...e, is_active: newStatus } : e));

            const { data, error } = await supabase
                .from("employees")
                .update({ is_active: newStatus })
                .eq("id", employee.id)
                .select();

            if (error) throw error;
            if (!data || data.length === 0) {
                throw new Error("Update failed: No rows affected.");
            }

            // Log status toggle
            logActivity({
                adminName: user?.user_metadata?.full_name || user?.email || "Admin",
                adminEmail: user?.email || "Unknown",
                actionType: 'update',
                targetType: 'employee_status',
                targetId: employee.id,
                description: `${newStatus ? 'Activated' : 'Deactivated'} employee: ${employee.name}`
            });

            toast.success(`Employee ${newStatus ? 'activated' : 'deactivated'}`);
        } catch (error: any) {
            toast.error(error.message || "Failed to sync status");
            fetchEmployees();
        } finally {
            setActionId(null);
        }
    }, [actionId, fetchEmployees]);

    const moveEmployee = useCallback(async (employee: Employee, direction: 'up' | 'down') => {
        const currentIndex = employees.findIndex(e => e.id === employee.id);
        if (
            (direction === 'up' && currentIndex === 0) ||
            (direction === 'down' && currentIndex === employees.length - 1)
        ) return;

        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        const targetEmployee = employees[targetIndex];

        // Optimistic update
        const newEmployees = [...employees];
        newEmployees[currentIndex] = { ...targetEmployee, display_order: employee.display_order };
        newEmployees[targetIndex] = { ...employee, display_order: targetEmployee.display_order };
        setEmployees(newEmployees);

        try {
            await Promise.all([
                supabase.from("employees").update({ display_order: targetEmployee.display_order }).eq("id", employee.id),
                supabase.from("employees").update({ display_order: employee.display_order }).eq("id", targetEmployee.id)
            ]);
            toast.success("Order updated");
        } catch (error) {
            toast.error("Failed to update order");
            fetchEmployees();
        }
    }, [employees, fetchEmployees]);

    if (loading && employees.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        );
    }

    const filteredEmployees = employees.filter(e => showInactive || e.is_active);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Team Members</h2>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-slate-400">Manage employee visibility and details</p>
                        <span className="text-slate-600">|</span>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => setShowInactive(true)}
                                className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded transition-all ${showInactive ? 'bg-purple-500/20 text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                All Members
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowInactive(false)}
                                className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded transition-all ${!showInactive ? 'bg-purple-500/20 text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Active Only
                            </button>
                        </div>
                    </div>
                </div>
                <Button
                    onClick={() => {
                        if (isAdding) {
                            setIsAdding(false);
                            setEditingId(null);
                            setForm({ name: "", title: "", description: "", image_url: "", is_active: true });
                        } else {
                            setIsAdding(true);
                        }
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-900/20"
                >
                    {isAdding ? "Cancel" : <><Plus className="mr-2 h-4 w-4" /> Add Employee</>}
                </Button>
            </div>

            {isAdding && (
                <div className="bg-[#110C1D] border border-white/5 rounded-xl p-6 space-y-4 shadow-sm">
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="flex gap-6 items-start">
                            <div className="w-32 h-32 flex-shrink-0 relative group">
                                <div className="w-full h-full rounded-lg overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
                                    {form.image_url ? (
                                        <img
                                            src={form.image_url}
                                            alt="Preview"
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <User className="h-12 w-12 text-slate-500" />
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 p-2 rounded-full bg-purple-600 hover:bg-purple-500 cursor-pointer shadow-lg transition-colors">
                                    <ImageIcon className="h-4 w-4 text-white" />
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
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, image_url: "" }))}
                                        className="absolute -top-2 -right-2 p-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-sm"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        placeholder="Employee Name"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="bg-black/20 border-white/5 focus:border-purple-500/30 text-slate-200"
                                        required
                                    />
                                    <Input
                                        placeholder="Job Title"
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        className="bg-black/20 border-white/5 focus:border-purple-500/30 text-slate-200"
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={form.is_active}
                                        onChange={e => setForm({ ...form, is_active: e.target.checked })}
                                        className="rounded border-white/10 bg-black/20 text-purple-600 focus:ring-purple-500"
                                    />
                                    <label htmlFor="is_active" className="text-sm text-slate-300">
                                        Active (visible on website)
                                    </label>
                                </div>
                            </div>
                        </div>

                        <Textarea
                            placeholder="Description (use • to separate skills)"
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="min-h-[80px] bg-black/20 border-white/5 focus:border-purple-500/30 text-slate-200 resize-none"
                            required
                        />

                        <Button
                            type="submit"
                            disabled={uploading || !form.image_url}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            {editingId ? "Update Employee" : "Save Employee"}
                        </Button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredEmployees.map((employee, index) => (
                    <EmployeeCard
                        key={employee.id}
                        employee={employee}
                        onToggleActive={toggleActive}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onMove={moveEmployee}
                        isFirst={index === 0}
                        isLast={index === filteredEmployees.length - 1}
                    />
                ))}
            </div>

            {employees.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                    <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No employees added yet. Click "Add Employee" to get started.</p>
                </div>
            )}
        </div>
    );
};
