import { useState, useEffect } from "react";
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

export const EmployeesSection = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<{
        name: string;
        title: string;
        description: string;
        image_url: string;
        is_active: boolean;
    }>({ name: "", title: "", description: "", image_url: "", is_active: true });
    const [uploading, setUploading] = useState(false);

    const fetchEmployees = async () => {
        setLoading(true);
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
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

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

            if (uploadError) {
                throw uploadError;
            }

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

        console.log("Attempting to save employee:", form);

        try {
            if (editingId) {
                console.log("Updating employee with ID:", editingId);
                const updateData = {
                    name: form.name,
                    title: form.title,
                    description: form.description,
                    image_url: form.image_url,
                    is_active: form.is_active
                };
                console.log("Update data:", updateData);

                const { data, error } = await supabase
                    .from("employees")
                    .update(updateData)
                    .eq("id", editingId)
                    .select();

                if (error) {
                    console.error("Update error:", error);
                    throw error;
                }

                console.log("Update response:", data);
                toast.success("Employee updated successfully");
            } else {
                console.log("Creating new employee");
                // Get the max display_order
                const { data: maxOrderData } = await supabase
                    .from("employees")
                    .select("display_order")
                    .order("display_order", { ascending: false })
                    .limit(1);

                const nextOrder = maxOrderData && maxOrderData.length > 0
                    ? maxOrderData[0].display_order + 1
                    : 1;

                const insertData = {
                    name: form.name,
                    title: form.title,
                    description: form.description,
                    image_url: form.image_url,
                    is_active: form.is_active,
                    display_order: nextOrder
                };
                console.log("Insert data:", insertData);

                const { data, error } = await supabase
                    .from("employees")
                    .insert([insertData])
                    .select();

                if (error) {
                    console.error("Insert error:", error);
                    throw error;
                }

                console.log("Insert response:", data);
                toast.success("Employee added successfully");
            }
            setForm({ name: "", title: "", description: "", image_url: "", is_active: true });
            setIsAdding(false);
            setEditingId(null);
            fetchEmployees();
        } catch (error: any) {
            console.error("Save error:", error);
            toast.error(`Error: ${error.message || 'Failed to save employee'}`);
        }
    };

    const handleEdit = (employee: Employee) => {
        setForm({
            name: employee.name,
            title: employee.title,
            description: employee.description,
            image_url: employee.image_url,
            is_active: employee.is_active,
        });
        setEditingId(employee.id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this employee?")) return;
        try {
            const { error } = await supabase.from("employees").delete().eq("id", id);
            if (error) throw error;
            toast.success("Employee deleted successfully");
            fetchEmployees();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const toggleActive = async (employee: Employee) => {
        try {
            const { error } = await supabase
                .from("employees")
                .update({ is_active: !employee.is_active })
                .eq("id", employee.id);
            if (error) throw error;
            toast.success(`Employee ${!employee.is_active ? 'activated' : 'deactivated'}`);
            fetchEmployees();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const moveEmployee = async (employee: Employee, direction: 'up' | 'down') => {
        const currentIndex = employees.findIndex(e => e.id === employee.id);
        if (
            (direction === 'up' && currentIndex === 0) ||
            (direction === 'down' && currentIndex === employees.length - 1)
        ) {
            return;
        }

        const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        const swapEmployee = employees[swapIndex];

        try {
            // Swap display orders
            await supabase
                .from("employees")
                .update({ display_order: swapEmployee.display_order })
                .eq("id", employee.id);

            await supabase
                .from("employees")
                .update({ display_order: employee.display_order })
                .eq("id", swapEmployee.id);

            toast.success("Order updated");
            fetchEmployees();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Team Members</h2>
                    <p className="text-sm text-slate-400 mt-1">Manage employee details displayed in the About section</p>
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
                            {/* Profile Image Upload Area */}
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
                                {form.image_url && !uploading && (
                                    <div className="absolute -bottom-6 left-0 right-0 text-center">
                                        <span className="text-xs text-green-500 font-medium">✓ Uploaded</span>
                                    </div>
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
                {employees.map((employee, index) => (
                    <div
                        key={employee.id}
                        className={`bg-[#110C1D] border ${employee.is_active ? 'border-white/5' : 'border-rose-500/20'
                            } rounded-xl p-4 flex flex-col group hover:border-white/10 transition-all duration-300 shadow-sm relative`}
                    >
                        {/* Active/Inactive Badge */}
                        <div className="absolute top-2 right-2 z-10">
                            <button
                                onClick={() => toggleActive(employee)}
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
                                    onClick={() => moveEmployee(employee, 'up')}
                                    disabled={index === 0}
                                    className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Move up"
                                >
                                    <MoveUp className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => moveEmployee(employee, 'down')}
                                    disabled={index === employees.length - 1}
                                    className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Move down"
                                >
                                    <MoveDown className="h-3.5 w-3.5" />
                                </button>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleEdit(employee)}
                                    className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors"
                                    title="Edit"
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(employee.id)}
                                    className="p-1.5 hover:bg-rose-500/10 rounded-lg text-rose-500 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Display Order Badge */}
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/40 rounded text-xs text-slate-400">
                            #{employee.display_order}
                        </div>
                    </div>
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
