import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Briefcase, ExternalLink, Loader2, CheckCircle2, Clock, PlayCircle, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { servicesSupabase, isServicesSupabaseConfigured } from "@/integrations/supabase/servicesClient";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { logActivity } from "@/utils/auditLogger";

interface Project {
    id: string;
    title: string;
    description: string;
    client: string;
    status: string;
    progress: number;
    created_at: string;
}

const ProjectCard = React.memo(({
    project,
    index,
    onEdit,
    onDelete
}: {
    project: Project,
    index: number,
    onEdit: (p: Project) => void,
    onDelete: (id: string) => void
}) => {
    const statusIcon = useMemo(() => {
        switch (project.status) {
            case 'completed': return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
            case 'in_progress': return <PlayCircle className="h-4 w-4 text-primary" />;
            default: return <Clock className="h-4 w-4 text-amber-400" />;
        }
    }, [project.status]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="glass-card overflow-hidden group border-white/5 hover:border-primary/40 transition-all duration-500 flex flex-col h-full bg-[#0B0816]/50"
        >
            <div className="h-40 bg-gradient-to-br from-primary/20 to-neon-blue/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 grid grid-cols-6 grid-rows-4 opacity-30">
                    {Array.from({ length: 24 }).map((_, i) => (
                        <div key={i} className="border border-white/5" />
                    ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Briefcase className="h-12 w-12 text-primary/40 group-hover:scale-110 group-hover:text-primary transition-all duration-700" />
                </div>
                <div className="absolute top-4 left-4 z-10">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white">
                        {statusIcon}
                        {project.status?.replace('_', ' ') || 'Unknown'}
                    </div>
                </div>
                <div className="absolute bottom-4 right-4 z-10">
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(project)}
                            className="p-2 bg-black/60 backdrop-blur-md hover:bg-primary border border-white/10 rounded-lg text-white transition-all shadow-lg"
                            title="Edit Project"
                        >
                            <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onDelete(project.id)}
                            className="p-2 bg-black/60 backdrop-blur-md hover:bg-rose-500 border border-white/10 rounded-lg text-rose-400 hover:text-white transition-all shadow-lg"
                            title="Delete Project"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
                <div className="mb-2">
                    <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors line-clamp-1">{project.title}</h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{project.client || "Self Initiated"}</p>
                </div>

                <p className="text-sm text-slate-400 line-clamp-2 h-10 mb-6 font-medium leading-relaxed italic">
                    {project.description || "No description provided for this work."}
                </p>

                <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-slate-500">
                        <span>Current Progress</span>
                        <span className="text-primary">{project.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${project.progress}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-primary shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                    <Button
                        onClick={() => onEdit(project)}
                        variant="link"
                        size="sm"
                        className="text-[10px] font-bold uppercase tracking-widest h-8 px-0 text-primary hover:text-white transition-all"
                    >
                        <Edit2 className="mr-2 h-3 w-3" /> Update
                    </Button>
                    <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest h-8 px-3 hover:bg-primary/10 hover:text-primary rounded-lg border border-transparent hover:border-primary/20">
                        Details <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
});

ProjectCard.displayName = "ProjectCard";

export const PortfolioSection = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const { user } = useAuth();
    const [form, setForm] = useState({ title: "", client: "", description: "", status: "in_progress", progress: 0 });

    const fetchProjects = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const client = isServicesSupabaseConfigured ? servicesSupabase : supabase;
            const { data, error } = await client
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
    }, [isServicesSupabaseConfigured]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                const client = isServicesSupabaseConfigured ? servicesSupabase : supabase;
                const { error } = await client
                    .from("projects")
                    .update({ ...form, updated_at: new Date().toISOString() })
                    .eq("id", editingId);
                if (error) throw error;

                // Log the update
                logActivity({
                    adminName: user?.user_metadata?.full_name || user?.email || "Admin",
                    adminEmail: user?.email || "Unknown",
                    actionType: 'update',
                    targetType: 'portfolio_project_tracker',
                    targetId: editingId,
                    targetData: form,
                    description: `Updated internal project: ${form.title}`
                });

                toast.success("Project updated successfully");
            } else {
                const client = isServicesSupabaseConfigured ? servicesSupabase : supabase;
                const { error } = await client
                    .from("projects")
                    .insert([form]);
                if (error) throw error;

                // Log the creation
                logActivity({
                    adminName: user?.user_metadata?.full_name || user?.email || "Admin",
                    adminEmail: user?.email || "Unknown",
                    actionType: 'create',
                    targetType: 'portfolio_project_tracker',
                    targetData: form,
                    description: `Added new internal project: ${form.title}`
                });

                toast.success("Project added to portfolio tracker");
            }
            resetForm();
            fetchProjects(false);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const resetForm = useCallback(() => {
        setForm({ title: "", client: "", description: "", status: "in_progress", progress: 0 });
        setIsAdding(false);
        setEditingId(null);
    }, []);

    const handleEdit = useCallback((p: Project) => {
        setForm({ title: p.title, client: p.client || "", description: p.description || "", status: p.status, progress: p.progress });
        setEditingId(p.id);
        setIsAdding(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const deleteProject = useCallback(async (id: string) => {
        if (!confirm("Are you sure you want to remove this project?")) return;
        try {
            setProjects(prev => prev.filter(p => p.id !== id));
            const client = isServicesSupabaseConfigured ? servicesSupabase : supabase;
            const { error } = await client.from("projects").delete().eq("id", id);
            if (error) throw error;

            // Log deletion
            logActivity({
                adminName: user?.user_metadata?.full_name || user?.email || "Admin",
                adminEmail: user?.email || "Unknown",
                actionType: 'delete',
                targetType: 'portfolio_project_tracker',
                targetId: id,
                description: `Deleted internal project tracker entry ID: ${id}`
            });

            toast.success("Project removed");
        } catch (error: any) {
            toast.error(error.message);
            fetchProjects(false);
        }
    }, [fetchProjects]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-display font-bold text-gradient">Project Tracker</h2>
                    <p className="text-muted-foreground mt-1 text-sm font-medium italic">Track internal delivery progress and client milestones</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => fetchProjects(true)}
                        disabled={loading}
                        className="border-white/10 hover:bg-white/5 text-slate-400 group h-10 w-10 flex items-center justify-center rounded-xl"
                        title="Refresh projects"
                    >
                        <RefreshCw className={`h-4 w-4 transition-all duration-500 ${loading ? 'animate-spin' : 'group-active:rotate-180'}`} />
                    </Button>
                    <Button
                        onClick={() => isAdding ? resetForm() : setIsAdding(true)}
                        className="bg-gradient-primary rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all text-white h-10 px-4"
                    >
                        {isAdding ? "Close Editor" : <><Plus className="mr-2 h-4 w-4" /> Add Project</>}
                    </Button>
                </div>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="glass-card p-8 border-primary/20 bg-primary/5 shadow-2xl shadow-primary/5">
                            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-primary/70 block">Project Title</label>
                                        <Input
                                            value={form.title}
                                            onChange={e => setForm({ ...form, title: e.target.value })}
                                            placeholder="e.g. Website Overhaul"
                                            className="bg-black/20 border-white/10 h-12 text-white focus:ring-1 focus:ring-primary/40"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-primary/70 block">Client / Brand</label>
                                        <Input
                                            value={form.client}
                                            onChange={e => setForm({ ...form, client: e.target.value })}
                                            placeholder="e.g. Acme Corp"
                                            className="bg-black/20 border-white/10 h-12 text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-primary/70 block">Internal Description</label>
                                        <Textarea
                                            value={form.description}
                                            onChange={e => setForm({ ...form, description: e.target.value })}
                                            placeholder="Key details for the team..."
                                            className="bg-black/20 border-white/10 min-h-[100px] text-white resize-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col h-full space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-primary/70 block">Status</label>
                                            <select
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-primary outline-none h-12"
                                                value={form.status}
                                                onChange={e => setForm({ ...form, status: e.target.value })}
                                            >
                                                <option value="in_progress" className="bg-[#0A051A]">In-Progress</option>
                                                <option value="completed" className="bg-[#0A051A]">Completed</option>
                                                <option value="waiting_client" className="bg-[#0A051A]">Client Feedback</option>
                                                <option value="on_hold" className="bg-[#0A051A]">On Hold</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-primary/70 block">Progress %</label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={form.progress}
                                                onChange={e => setForm({ ...form, progress: parseInt(e.target.value) || 0 })}
                                                className="bg-black/20 border-white/10 h-12 text-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Form Feedback */}
                                    <div className="flex-1 p-4 bg-white/5 rounded-xl border border-white/5 flex items-start gap-3">
                                        <AlertCircle className="h-4 w-4 text-primary/60 shrink-0 mt-0.5" />
                                        <p className="text-[10px] leading-relaxed text-slate-400 font-medium">
                                            Internal projects help the team stay aligned. Status updates appear on the dashboard overview for the management team.
                                        </p>
                                    </div>

                                    <div className="mt-auto">
                                        <Button type="submit" className="w-full bg-gradient-primary h-14 rounded-xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all text-white text-base">
                                            {editingId ? "Update Project" : "Publish to Tracker"}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading && projects.length === 0 ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="glass-card h-[350px] animate-pulse bg-white/5" />
                    ))
                ) : projects.length === 0 ? (
                    <div className="col-span-full glass-card p-20 text-center text-muted-foreground italic border-dashed border-white/10">
                        No active projects currently being tracked.
                    </div>
                ) : (
                    projects.map((project, i) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            index={i}
                            onEdit={handleEdit}
                            onDelete={deleteProject}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
