import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Plus,
    Trash2,
    Edit2,
    Search,
    Briefcase,
    Loader2,
    Users,
    ToggleLeft,
    ToggleRight,
    ExternalLink,
    Download,
    Eye,
    FileText,
    Star,
    Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { careersSupabase, isCareersSupabaseConfigured, JobOpening, JobApplication } from "@/integrations/supabase/careersClient";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    ATSFilters,
    ATSScoreBadge,
    NotesDialog,
    exportApplicationsToCSV,
    calculateATSScore,
} from "./ATSComponents";

export const CareersSection = () => {
    const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<JobOpening | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [applicationsCounts, setApplicationsCounts] = useState<Record<string, number>>({});
    const [activeTab, setActiveTab] = useState("openings");
    const [coverLetterDialog, setCoverLetterDialog] = useState<{ open: boolean; letter: string }>({ open: false, letter: "" });

    // ATS Features State
    const [atsFilters, setAtsFilters] = useState({
        status: "all",
        scoreMin: 0,
        scoreMax: 100,
        starred: false,
        search: "",
    });
    const [notesDialog, setNotesDialog] = useState<{
        open: boolean;
        appId: string;
        appName: string;
    }>({ open: false, appId: "", appName: "" });

    const [formData, setFormData] = useState({
        title: "",
        department: "",
        focus_areas: "",
        description: "",
        requirements: "",
        experience_level: "Mid",
        location: "Remote",
        job_type: "Full-time",
        status: "Active",
        salary_range: "",
    });

    const fetchJobOpenings = async () => {
        if (!isCareersSupabaseConfigured) {
            toast.error("Careers database not configured");
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await careersSupabase
                .from("job_openings")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setJobOpenings(data || []);

            // Fetch application counts for each job
            if (data && data.length > 0) {
                const counts: Record<string, number> = {};
                for (const job of data) {
                    const { count, error: countError } = await careersSupabase
                        .from("job_applications")
                        .select("*", { count: "exact", head: true })
                        .eq("job_opening_id", job.id);

                    if (!countError) {
                        counts[job.id] = count || 0;
                    }
                }
                setApplicationsCounts(counts);
            }
        } catch (error: any) {
            console.error("Error fetching job openings:", error);
            toast.error("Failed to load job openings");
        } finally {
            setLoading(false);
        }
    };

    const fetchApplications = async () => {
        try {
            const { data, error } = await careersSupabase
                .from("job_applications")
                .select(`
                    *,
                    job_openings (
                        title
                    )
                `)
                .order("applied_at", { ascending: false });

            if (error) throw error;
            setApplications(data || []);
        } catch (error: any) {
            console.error("Error fetching applications:", error);
        }
    };

    const updateApplicationStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await careersSupabase
                .from("job_applications")
                .update({
                    status: newStatus,
                    reviewed_at: new Date().toISOString()
                })
                .eq("id", id);

            if (error) throw error;
            toast.success(`Application marked as ${newStatus}`);
            fetchApplications();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const deleteApplication = async (id: string, resumeUrl: string) => {
        if (!confirm("Are you sure you want to delete this application? This cannot be undone.")) return;

        try {
            // Extract file path from resume URL
            const urlParts = resumeUrl.split('/resumes/');
            if (urlParts.length > 1) {
                const filePath = urlParts[1].split('?')[0]; // Remove query params

                // Delete resume from storage
                const { error: storageError } = await careersSupabase
                    .storage
                    .from('resumes')
                    .remove([filePath]);

                if (storageError) {
                    console.error("Error deleting resume:", storageError);
                }
            }

            // Delete application from database
            const { error } = await careersSupabase
                .from("job_applications")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast.success("Application deleted successfully");
            fetchApplications();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // ATS: Toggle Star
    const toggleStar = async (id: string, starred: boolean) => {
        try {
            const { error } = await careersSupabase
                .from("job_applications")
                .update({ starred })
                .eq("id", id);

            if (error) throw error;
            toast.success(starred ? "Application starred" : "Star removed");
            fetchApplications();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // ATS: Apply Filters
    const filteredApplications = applications.filter(app => {
        // Status filter
        if (atsFilters.status !== "all" && app.status !== atsFilters.status) return false;

        // Score filter
        const score = app.ats_score || 0;
        if (score < atsFilters.scoreMin || score > atsFilters.scoreMax) return false;

        // Starred filter
        if (atsFilters.starred && !app.starred) return false;

        // Search filter
        if (atsFilters.search) {
            const searchLower = atsFilters.search.toLowerCase();
            return (
                app.full_name.toLowerCase().includes(searchLower) ||
                app.email.toLowerCase().includes(searchLower) ||
                app.phone.includes(atsFilters.search)
            );
        }

        return true;
    });

    useEffect(() => {
        fetchJobOpenings();
        fetchApplications();
    }, []);

    const handleOpenAdd = () => {
        setEditingJob(null);
        setFormData({
            title: "",
            department: "",
            focus_areas: "",
            description: "",
            requirements: "",
            experience_level: "Mid",
            location: "Remote",
            job_type: "Full-time",
            status: "Active",
            salary_range: "",
        });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (job: JobOpening) => {
        setEditingJob(job);
        setFormData({
            title: job.title,
            department: job.department,
            focus_areas: job.focus_areas.join(", "),
            description: job.description,
            requirements: job.requirements,
            experience_level: job.experience_level,
            location: job.location,
            job_type: job.job_type,
            status: job.status,
            salary_range: job.salary_range || "",
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this job opening? All associated applications will also be deleted.")) return;

        try {
            const { error } = await careersSupabase
                .from("job_openings")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast.success("Job opening deleted successfully");
            fetchJobOpenings();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Convert comma-separated focus areas to array
            const focusAreasArray = formData.focus_areas
                .split(",")
                .map((area) => area.trim())
                .filter((area) => area.length > 0);

            const jobData = {
                title: formData.title,
                department: formData.department,
                focus_areas: focusAreasArray,
                description: formData.description,
                requirements: formData.requirements,
                experience_level: formData.experience_level,
                location: formData.location,
                job_type: formData.job_type,
                status: formData.status,
                salary_range: formData.salary_range || null,
            };

            if (editingJob) {
                const { error } = await careersSupabase
                    .from("job_openings")
                    .update(jobData)
                    .eq("id", editingJob.id);

                if (error) throw error;
                toast.success("Job opening updated successfully");
            } else {
                const { error } = await careersSupabase
                    .from("job_openings")
                    .insert([jobData]);

                if (error) throw error;
                toast.success("Job opening created successfully");
            }

            setIsDialogOpen(false);
            fetchJobOpenings();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const toggleStatus = async (job: JobOpening) => {
        try {
            const newStatus = job.status === "Active" ? "Inactive" : "Active";
            const { error } = await careersSupabase
                .from("job_openings")
                .update({ status: newStatus })
                .eq("id", job.id);

            if (error) throw error;
            toast.success(`Job opening ${newStatus.toLowerCase()}`);
            fetchJobOpenings();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const filteredJobs = jobOpenings.filter((job) => {
        const matchesSearch =
            job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.department.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || job.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: jobOpenings.length,
        active: jobOpenings.filter((j) => j.status === "Active").length,
        inactive: jobOpenings.filter((j) => j.status === "Inactive").length,
        totalApplications: Object.values(applicationsCounts).reduce((a, b) => a + b, 0),
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        );
    }

    if (!isCareersSupabaseConfigured) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
                <h3 className="text-lg font-bold text-red-400 mb-2">Careers Database Not Configured</h3>
                <p className="text-sm text-red-300">Please configure VITE_CAREERS_SUPABASE_URL and VITE_CAREERS_SUPABASE_KEY in your environment variables.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Tabs for Openings and Applications */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                    <div>
                        <h2 className="text-3xl font-display font-bold text-white tracking-tight">
                            Careers <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Management</span>
                        </h2>
                        <p className="text-slate-400 text-sm font-medium mt-1">Manage job openings and candidate applications</p>
                    </div>
                    <TabsList className="grid w-full md:w-auto grid-cols-2 bg-[#110C1D]">
                        <TabsTrigger value="openings" className="data-[state=active]:bg-purple-600">
                            Job Openings ({stats.total})
                        </TabsTrigger>
                        <TabsTrigger value="applications" className="data-[state=active]:bg-purple-600">
                            Applications ({applications.length})
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Job Openings Tab */}
                <TabsContent value="openings" className="mt-0">
                    <div className="space-y-6">
                        {/* Post New Opening Button */}
                        <div className="flex justify-end">
                            <Button
                                onClick={handleOpenAdd}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg shadow-purple-900/20"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Post New Opening
                            </Button>
                        </div>

                        {/* Statistics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-[#1A1429] to-[#110C1D] border border-white/10 rounded-2xl p-5 shadow-xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                        <Briefcase className="h-5 w-5 text-purple-400" />
                                    </div>
                                </div>
                                <div className="text-3xl font-black text-white tracking-tight">{stats.total}</div>
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Total Openings</div>
                            </div>

                            <div className="bg-gradient-to-br from-[#1A1429] to-[#110C1D] border border-white/10 rounded-2xl p-5 shadow-xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                        <ToggleRight className="h-5 w-5 text-emerald-400" />
                                    </div>
                                </div>
                                <div className="text-3xl font-black text-white tracking-tight">{stats.active}</div>
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Active Jobs</div>
                            </div>

                            <div className="bg-gradient-to-br from-[#1A1429] to-[#110C1D] border border-white/10 rounded-2xl p-5 shadow-xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                        <ToggleLeft className="h-5 w-5 text-amber-400" />
                                    </div>
                                </div>
                                <div className="text-3xl font-black text-white tracking-tight">{stats.inactive}</div>
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Inactive</div>
                            </div>

                            <div className="bg-gradient-to-br from-[#1A1429] to-[#110C1D] border border-white/10 rounded-2xl p-5 shadow-xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                        <Users className="h-5 w-5 text-blue-400" />
                                    </div>
                                </div>
                                <div className="text-3xl font-black text-white tracking-tight">{stats.totalApplications}</div>
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Applications</div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <Input
                                    placeholder="Search by title or department..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-[#110C1D] border-white/5 text-slate-200 focus:ring-purple-500/20 focus:border-purple-500/30"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-48 bg-[#110C1D] border-white/5">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                    <SelectItem value="Closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Job Openings List */}
                        <div className="grid grid-cols-1 gap-4">
                            <AnimatePresence>
                                {filteredJobs.length === 0 ? (
                                    <div className="bg-[#110C1D] border border-white/5 rounded-xl p-20 text-center text-slate-500 italic">
                                        {searchTerm || statusFilter !== "all" ? "No matching job openings found." : "No job openings available. Create your first opening!"}
                                    </div>
                                ) : (
                                    filteredJobs.map((job) => (
                                        <motion.div
                                            key={job.id}
                                            layout
                                            className="bg-[#110C1D] border border-white/5 rounded-xl p-6 hover:border-white/10 transition-all group"
                                        >
                                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                                            <Briefcase className="h-5 w-5 text-purple-400" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-bold text-white">{job.title}</h3>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="text-sm text-slate-400">{job.department}</span>
                                                                <span className="text-slate-600">•</span>
                                                                <span className="text-sm text-slate-400">{job.location}</span>
                                                                <span className="text-slate-600">•</span>
                                                                <span className="text-sm text-slate-400">{job.job_type}</span>
                                                            </div>
                                                        </div>
                                                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${job.status === "Active"
                                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                            : job.status === "Inactive"
                                                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                                                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                                            }`}>
                                                            {job.status}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {job.focus_areas.map((area, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded-md text-xs text-purple-300"
                                                            >
                                                                {area}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    <p className="text-sm text-slate-400 line-clamp-2">{job.description}</p>

                                                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                                                        <span>{job.experience_level} Level</span>
                                                        {job.salary_range && (
                                                            <>
                                                                <span>•</span>
                                                                <span>{job.salary_range}</span>
                                                            </>
                                                        )}
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Users className="h-3 w-3" />
                                                            {applicationsCounts[job.id] || 0} Applications
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-row md:flex-col gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleStatus(job)}
                                                        className="text-slate-400 hover:text-white hover:bg-white/5"
                                                    >
                                                        {job.status === "Active" ? (
                                                            <ToggleRight className="h-4 w-4" />
                                                        ) : (
                                                            <ToggleLeft className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleOpenEdit(job)}
                                                        className="text-slate-400 hover:text-white hover:bg-white/5"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(job.id)}
                                                        className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/5"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Create/Edit Dialog */}
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogContent className="sm:max-w-[700px] bg-[#0F0A1F] border-white/10 text-white max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold">
                                        {editingJob ? "Edit Job Opening" : "Create New Job Opening"}
                                    </DialogTitle>
                                </DialogHeader>

                                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Job Title *</label>
                                            <Input
                                                required
                                                placeholder="e.g., Full Stack Developer"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="bg-black/40 border-white/5"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Department *</label>
                                            <Input
                                                required
                                                placeholder="e.g., Engineering"
                                                value={formData.department}
                                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                                className="bg-black/40 border-white/5"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Focus Areas (comma-separated) *</label>
                                        <Input
                                            required
                                            placeholder="e.g., React, Node.js, TypeScript, System Design"
                                            value={formData.focus_areas}
                                            onChange={(e) => setFormData({ ...formData, focus_areas: e.target.value })}
                                            className="bg-black/40 border-white/5"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Job Description *</label>
                                        <textarea
                                            required
                                            rows={4}
                                            placeholder="Describe the role and responsibilities..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm outline-none resize-none text-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Requirements *</label>
                                        <textarea
                                            required
                                            rows={4}
                                            placeholder="List qualifications and requirements (use bullet points with •)"
                                            value={formData.requirements}
                                            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                            className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm outline-none resize-none text-white"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Experience Level *</label>
                                            <Select
                                                value={formData.experience_level}
                                                onValueChange={(value: any) => setFormData({ ...formData, experience_level: value })}
                                            >
                                                <SelectTrigger className="bg-black/40 border-white/5">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Entry">Entry Level</SelectItem>
                                                    <SelectItem value="Mid">Mid Level</SelectItem>
                                                    <SelectItem value="Senior">Senior Level</SelectItem>
                                                    <SelectItem value="Lead">Lead/Principal</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Location *</label>
                                            <Select
                                                value={formData.location}
                                                onValueChange={(value: any) => setFormData({ ...formData, location: value })}
                                            >
                                                <SelectTrigger className="bg-black/40 border-white/5">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Remote">Remote</SelectItem>
                                                    <SelectItem value="Onsite">Onsite</SelectItem>
                                                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Job Type *</label>
                                            <Select
                                                value={formData.job_type}
                                                onValueChange={(value: any) => setFormData({ ...formData, job_type: value })}
                                            >
                                                <SelectTrigger className="bg-black/40 border-white/5">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Full-time">Full-time</SelectItem>
                                                    <SelectItem value="Part-time">Part-time</SelectItem>
                                                    <SelectItem value="Internship">Internship</SelectItem>
                                                    <SelectItem value="Contract">Contract</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Status *</label>
                                            <Select
                                                value={formData.status}
                                                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                                            >
                                                <SelectTrigger className="bg-black/40 border-white/5">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Active">Active</SelectItem>
                                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                                    <SelectItem value="Closed">Closed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Salary Range (Optional)</label>
                                        <Input
                                            placeholder="e.g., ₹8-12 LPA or $80,000-$120,000"
                                            value={formData.salary_range}
                                            onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                                            className="bg-black/40 border-white/5"
                                        />
                                    </div>

                                    <DialogFooter className="gap-2 pt-4">
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
                                            disabled={submitting}
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-8"
                                        >
                                            {submitting ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : editingJob ? (
                                                "Update Opening"
                                            ) : (
                                                "Create Opening"
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </TabsContent>

                {/* Applications Tab - ATS ENHANCED */}
                <TabsContent value="applications" className="mt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* LEFT: ATS Filters Sidebar */}
                        <div className="lg:col-span-1 space-y-4">
                            <ATSFilters onFilterChange={setAtsFilters} />

                            {/* Export CSV Button */}
                            <Button
                                onClick={() => exportApplicationsToCSV(filteredApplications)}
                                className="w-full bg-emerald-600 hover:bg-emerald-700"
                                disabled={filteredApplications.length === 0}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export to CSV ({filteredApplications.length})
                            </Button>
                        </div>

                        {/* RIGHT: Applications Table */}
                        <div className="lg:col-span-3">
                            <div className="bg-[#110C1D] border border-white/5 rounded-xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-black/40">
                                            <tr>
                                                <th className="px-4 py-4 text-left text-xs font-bold text-slate-400 uppercase">Star</th>
                                                <th className="px-4 py-4 text-left text-xs font-bold text-slate-400 uppercase">Score</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Candidate</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Applied Role</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Contact</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Resume</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Applied On</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Status</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {filteredApplications.length === 0 ? (
                                                <tr>
                                                    <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                                                        {atsFilters.search || atsFilters.status !== "all" || atsFilters.starred
                                                            ? "No applications match your filters"
                                                            : "No applications received yet"}
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredApplications.map((app) => (
                                                    <tr key={app.id} className="hover:bg-white/5 transition-colors">
                                                        {/* STAR COLUMN */}
                                                        <td className="px-4 py-4">
                                                            <button
                                                                onClick={() => toggleStar(app.id, !app.starred)}
                                                                className="text-yellow-500 hover:text-yellow-400 transition-colors"
                                                                title={app.starred ? "Unstar" : "Star this candidate"}
                                                            >
                                                                <Star className={`h-5 w-5 ${app.starred ? "fill-current" : ""}`} />
                                                            </button>
                                                        </td>

                                                        {/* SCORE COLUMN */}
                                                        <td className="px-4 py-4">
                                                            <ATSScoreBadge score={app.ats_score || 0} />
                                                        </td>

                                                        {/* Candidate */}
                                                        <td className="px-6 py-4">
                                                            <div>
                                                                <div className="font-medium text-white">{app.full_name}</div>
                                                                {app.portfolio_url && (
                                                                    <a
                                                                        href={app.portfolio_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-xs text-purple-400 hover:underline flex items-center gap-1"
                                                                    >
                                                                        Portfolio <ExternalLink className="h-3 w-3" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Applied Role */}
                                                        <td className="px-6 py-4 text-sm text-slate-300">
                                                            {app.job_openings?.title || 'N/A'}
                                                        </td>

                                                        {/* Contact */}
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm">
                                                                <div className="text-slate-300">{app.email}</div>
                                                                <div className="text-slate-500 text-xs">{app.phone}</div>
                                                            </div>
                                                        </td>

                                                        {/* Resume */}
                                                        <td className="px-6 py-4">
                                                            <a
                                                                href={app.resume_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                                                            >
                                                                <Download className="h-4 w-4" />
                                                                View Resume
                                                            </a>
                                                        </td>

                                                        {/* Applied On */}
                                                        <td className="px-6 py-4 text-sm text-slate-400">
                                                            {new Date(app.applied_at).toLocaleDateString()}
                                                        </td>

                                                        {/* Status */}
                                                        <td className="px-6 py-4">
                                                            <Select
                                                                value={app.status}
                                                                onValueChange={(value) => updateApplicationStatus(app.id, value)}
                                                            >
                                                                <SelectTrigger className={`w-36 h-8 text-xs ${app.status === 'Applied' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                                                    app.status === 'Reviewed' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                                                        app.status === 'Shortlisted' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                                                                            app.status === 'Interviewed' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' :
                                                                                app.status === 'Hired' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                                                                    'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                                                    }`}>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="Applied">Applied</SelectItem>
                                                                    <SelectItem value="Reviewed">Reviewed</SelectItem>
                                                                    <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                                                                    <SelectItem value="Interviewed">Interviewed</SelectItem>
                                                                    <SelectItem value="Hired">Hired</SelectItem>
                                                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </td>

                                                        {/* ACTIONS with Notes Button */}
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                {/* NOTES BUTTON */}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => setNotesDialog({
                                                                        open: true,
                                                                        appId: app.id,
                                                                        appName: app.full_name
                                                                    })}
                                                                    className="text-slate-400 hover:text-white hover:bg-white/5"
                                                                    title="Add Notes"
                                                                >
                                                                    <FileText className="h-4 w-4" />
                                                                </Button>

                                                                {/* Cover Letter */}
                                                                {app.cover_letter && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => setCoverLetterDialog({ open: true, letter: app.cover_letter })}
                                                                        className="text-slate-400 hover:text-white hover:bg-white/5"
                                                                        title="View Cover Letter"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                )}

                                                                {/* Delete */}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => deleteApplication(app.id, app.resume_url)}
                                                                    className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/5"
                                                                    title="Delete Application"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Cover Letter Dialog */}
            <Dialog open={coverLetterDialog.open} onOpenChange={(open) => setCoverLetterDialog({ open, letter: "" })}>
                <DialogContent className="bg-[#0F0A1F] border-white/10 text-white max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Cover Letter</DialogTitle>
                    </DialogHeader>
                    <div className="bg-black/40 border border-white/5 rounded-lg p-6 max-h-96 overflow-y-auto">
                        <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {coverLetterDialog.letter}
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Notes Dialog - ATS Feature */}
            <NotesDialog
                applicationId={notesDialog.appId}
                applicantName={notesDialog.appName}
                isOpen={notesDialog.open}
                onClose={() => setNotesDialog({ open: false, appId: "", appName: "" })}
            />
        </div>
    );
};
