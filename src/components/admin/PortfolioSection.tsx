import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Layout, Briefcase, ExternalLink, Filter, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface Project {
    id: string;
    title: string;
    description: string;
    status: string;
    progress: number;
    created_at: string;
}

export const PortfolioSection = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ title: "", description: "", status: "in_progress", progress: 0 });

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("projects")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setProjects(data || []);
        } catch (error: any) {
            console.error("Error fetching projects:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                const { error } = await supabase
                    .from("projects")
                    .update(form)
                    .eq("id", editingId);
                if (error) throw error;
                toast.success("Project updated");
            } else {
                const { error } = await supabase
                    .from("projects")
                    .insert([form]);
                if (error) throw error;
                toast.success("Project added to portfolio");
            }
            setForm({ title: "", description: "", status: "in_progress", progress: 0 });
            setIsAdding(false);
            setEditingId(null);
            fetchProjects();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleEdit = (p: Project) => {
        setForm({ title: p.title, description: p.description, status: p.status, progress: p.progress });
        setEditingId(p.id);
        setIsAdding(true);
    };

    const deleteProject = async (id: string) => {
        if (!confirm("Are you sure you want to remove this project from your portfolio?")) return;
        try {
            const { error } = await supabase
                .from("projects")
                .delete()
                .eq("id", id);
            if (error) throw error;
            toast.success("Project removed");
            fetchProjects();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-display font-bold text-gradient">Portfolio Management</h2>
                    <p className="text-muted-foreground mt-1 text-sm font-medium">Showcase your best work and track active deliveries</p>
                </div>
                <Button
                    onClick={() => {
                        if (isAdding) {
                            setIsAdding(false);
                            setEditingId(null);
                            setForm({ title: "", description: "", status: "in_progress", progress: 0 });
                        } else {
                            setIsAdding(true);
                        }
                    }}
                    className="bg-gradient-primary rounded-xl font-bold shadow-lg shadow-primary/20"
                >
                    {isAdding ? "Cancel" : <><Plus className="mr-2 h-4 w-4" /> Add Project</>}
                </Button>
            </div>

            {isAdding && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="glass-card p-8 border-primary/20"
                >
                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold uppercase tracking-widest text-primary/70 mb-1 block">Project Title</label>
                                <Input
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g. MS DIGI Website Revamp"
                                    className="bg-white/5 border-white/10 h-12"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold uppercase tracking-widest text-primary/70 mb-1 block">Description</label>
                                <Input
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    placeholder="Brief overview of the work done..."
                                    className="bg-white/5 border-white/10 h-12"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold uppercase tracking-widest text-primary/70 mb-1 block">Status</label>
                                    <select
                                        className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none h-12"
                                        value={form.status}
                                        onChange={e => setForm({ ...form, status: e.target.value })}
                                    >
                                        <option value="in_progress" className="bg-[#0A051A]">In-Progress</option>
                                        <option value="completed" className="bg-[#0A051A]">Completed</option>
                                        <option value="waiting_client" className="bg-[#0A051A]">Waiting for Client</option>
                                        <option value="on_hold" className="bg-[#0A051A]">On Hold</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-bold uppercase tracking-widest text-primary/70 mb-1 block">Progress %</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={form.progress}
                                        onChange={e => setForm({ ...form, progress: parseInt(e.target.value) })}
                                        className="bg-white/5 border-white/10 h-12"
                                    />
                                </div>
                            </div>
                            <div className="flex items-end h-full mt-auto">
                                <Button type="submit" className="w-full bg-gradient-primary h-12 font-bold shadow-lg shadow-primary/20">
                                    {editingId ? "Update Project" : "Publish to Portfolio"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                        <span className="text-sm text-muted-foreground mt-4 font-medium uppercase tracking-widest">Loading Portfolio...</span>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="col-span-full glass-card p-20 text-center text-muted-foreground italic border-dashed border-white/10">
                        No projects found in the portfolio. Let's showcase some work!
                    </div>
                ) : (
                    projects.map((project, i) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            key={project.id}
                            className="glass-card overflow-hidden group border-white/5 hover:border-primary/40 transition-all duration-500 flex flex-col h-full"
                        >
                            <div className="h-40 bg-gradient-to-br from-primary/20 to-neon-blue/10 relative overflow-hidden">
                                <div className="absolute inset-0 bg-white/5 grid grid-cols-6 grid-rows-4 opacity-30">
                                    {Array.from({ length: 24 }).map((_, i) => (
                                        <div key={i} className="border border-white/10" />
                                    ))}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Briefcase className="h-12 w-12 text-primary/40 group-hover:scale-110 group-hover:text-primary/60 transition-all duration-500" />
                                </div>
                                <div className="absolute bottom-4 left-4">
                                    <span className={`px-2 py-0.5 rounded-[4px] text-[8px] uppercase font-bold tracking-widest shadow-xl border ${project.status === 'completed' ? 'bg-teal-500/80 text-white border-teal-400' :
                                        project.status === 'in_progress' ? 'bg-primary/80 text-white border-primary-foreground/20' :
                                            'bg-white/10 text-white/50 border-white/10'
                                        }`}>
                                        {project.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-6 font-medium leading-relaxed">
                                    {project.description || "No description provided for this masterpiece."}
                                </p>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                                        <span>Current Progress</span>
                                        <span className="text-primary">{project.progress}%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${project.progress}%` }}
                                            className="h-full bg-gradient-primary shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(project)}
                                            className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-primary transition-all"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteProject(project.id)}
                                            className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-500 transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest h-8 px-3 hover:bg-primary/10 hover:text-primary">
                                        Details <ExternalLink className="ml-2 h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

