import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { careersSupabase, JobOpening } from "@/integrations/supabase/careersClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Briefcase,
    MapPin,
    Clock,
    DollarSign,
    ArrowLeft,
    Loader2,
    CheckCircle2,
    Building2,
    FileText,
    Link as LinkIcon,
    Upload,
} from "lucide-react";

export const JobDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [job, setJob] = useState<JobOpening | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [resumeFile, setResumeFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        portfolio_url: "",
        cover_letter: "",
    });

    useEffect(() => {
        fetchJobDetail();
    }, [id]);

    const fetchJobDetail = async () => {
        try {
            const { data, error } = await careersSupabase
                .from("job_openings")
                .select("*")
                .eq("id", id)
                .eq("status", "Active")
                .single();

            if (error) throw error;
            setJob(data);
        } catch (error) {
            console.error("Error fetching job:", error);
            toast.error("Job not found");
            navigate("/careers");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Please upload a PDF or DOC file");
            return;
        }

        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("File size must be less than 2MB");
            return;
        }

        setResumeFile(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!resumeFile) {
            toast.error("Please upload your resume");
            return;
        }

        setSubmitting(true);

        try {
            // 1. Upload resume to Supabase Storage
            const fileExt = resumeFile.name.split('.').pop();
            const fileName = `${Date.now()}_${(formData.full_name || 'candidate').replace(/\s+/g, '_')}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data: uploadData, error: uploadError } = await careersSupabase
                .storage
                .from('resumes')
                .upload(filePath, resumeFile);

            if (uploadError) throw uploadError;

            // 2. Get public URL for the uploaded resume
            const { data: urlData } = careersSupabase
                .storage
                .from('resumes')
                .getPublicUrl(filePath);

            // 3. Insert application data into database
            const { error: insertError } = await careersSupabase
                .from("job_applications")
                .insert([{
                    job_opening_id: id,
                    full_name: formData.full_name,
                    email: formData.email,
                    phone: formData.phone,
                    resume_url: urlData.publicUrl,
                    portfolio_url: formData.portfolio_url || null,
                    cover_letter: formData.cover_letter || null,
                    status: 'Applied',
                }]);

            if (insertError) throw insertError;

            setSubmitted(true);
            toast.success("Application submitted successfully!");
        } catch (error: any) {
            console.error("Error submitting application:", error);
            toast.error(error.message || "Failed to submit application");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-[#070510] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
            </Layout>
        );
    }

    if (!job) {
        return null;
    }

    if (submitted) {
        return (
            <Layout>
                <div className="min-h-screen bg-[#070510] pt-20 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md text-center"
                    >
                        <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">Application Submitted!</h2>
                        <p className="text-slate-300 mb-8">
                            Thank you for your interest in the {job.title} position. We'll review your application
                            and get back to you soon.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button
                                onClick={() => navigate("/careers")}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                View All Openings
                            </Button>
                            <Button variant="outline" onClick={() => navigate("/")}>
                                Go Home
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-[#070510] pt-20">
                {/* Job Header */}
                <section className="py-12 bg-gradient-to-b from-purple-500/5 to-transparent">
                    <div className="container mx-auto px-4">
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/careers")}
                            className="text-slate-400 hover:text-white mb-6"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Careers
                        </Button>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-4xl"
                        >
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                                    <Briefcase className="h-8 w-8 text-purple-400" />
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-4xl font-display font-bold text-white mb-3">{job.title}</h1>
                                    <div className="flex flex-wrap items-center gap-4 text-slate-300 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-5 w-5 text-slate-500" />
                                            {job.department}
                                        </div>
                                        <span className="text-slate-600">•</span>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-slate-500" />
                                            {job.location}
                                        </div>
                                        <span className="text-slate-600">•</span>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-5 w-5 text-slate-500" />
                                            {job.experience_level} Level
                                        </div>
                                        {job.salary_range && (
                                            <>
                                                <span className="text-slate-600">•</span>
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="h-5 w-5 text-slate-500" />
                                                    {job.salary_range}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {job.focus_areas.map((area, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-sm text-purple-300 font-medium"
                                            >
                                                {area}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <span className="px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold border border-emerald-500/30">
                                    {job.job_type}
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Job Content */}
                <section className="py-12">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Job Details */}
                            <div className="lg:col-span-2 space-y-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white/5 border border-white/10 rounded-2xl p-8"
                                >
                                    <h2 className="text-2xl font-bold text-white mb-4">About the Role</h2>
                                    <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                                        {job.description}
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white/5 border border-white/10 rounded-2xl p-8"
                                >
                                    <h2 className="text-2xl font-bold text-white mb-4">Requirements</h2>
                                    <div className="text-slate-300 leading-relaxed whitespace-pre-line">
                                        {job.requirements}
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-8"
                                >
                                    <h2 className="text-2xl font-bold text-white mb-4">Why Join MS DIGIMARK?</h2>
                                    <ul className="space-y-3 text-slate-300">
                                        <li className="flex items-start gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-purple-400 mt-0.5 shrink-0" />
                                            <span>Work on innovative digital marketing projects for diverse clients</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-purple-400 mt-0.5 shrink-0" />
                                            <span>Collaborative and creative work environment</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-purple-400 mt-0.5 shrink-0" />
                                            <span>Continuous learning and professional development opportunities</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-purple-400 mt-0.5 shrink-0" />
                                            <span>Flexible work arrangements and modern tech stack</span>
                                        </li>
                                    </ul>
                                </motion.div>
                            </div>

                            {/* Application Form */}
                            <div className="lg:col-span-1">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24"
                                >
                                    <h3 className="text-xl font-bold text-white mb-6">Apply for this Position</h3>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                Full Name *
                                            </label>
                                            <Input
                                                required
                                                placeholder="John Doe"
                                                value={formData.full_name}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, full_name: e.target.value })
                                                }
                                                className="bg-black/40 border-white/5"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                Email *
                                            </label>
                                            <Input
                                                required
                                                type="email"
                                                placeholder="john@example.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="bg-black/40 border-white/5"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                Phone Number *
                                            </label>
                                            <Input
                                                required
                                                placeholder="+91 98765 43210"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="bg-black/40 border-white/5"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                                <FileText className="h-3 w-3" />
                                                Resume (PDF/DOC) *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    id="resume-upload"
                                                    required
                                                />
                                                <label
                                                    htmlFor="resume-upload"
                                                    className="flex items-center justify-center gap-2 w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm cursor-pointer hover:bg-black/60 transition-colors"
                                                >
                                                    <Upload className="h-4 w-4" />
                                                    {resumeFile ? resumeFile.name : "Choose file"}
                                                </label>
                                            </div>
                                            <p className="text-xs text-slate-500">Max 2MB - PDF or DOC format</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                                <LinkIcon className="h-3 w-3" />
                                                Portfolio / GitHub (Optional)
                                            </label>
                                            <Input
                                                type="url"
                                                placeholder="https://yourportfolio.com"
                                                value={formData.portfolio_url}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, portfolio_url: e.target.value })
                                                }
                                                className="bg-black/40 border-white/5"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                Cover Letter (Optional)
                                            </label>
                                            <textarea
                                                rows={4}
                                                placeholder="Tell us why you're a great fit..."
                                                value={formData.cover_letter}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, cover_letter: e.target.value })
                                                }
                                                className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-white outline-none resize-none"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-12"
                                        >
                                            {submitting ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                "Submit Application"
                                            )}
                                        </Button>

                                        <p className="text-xs text-slate-500 text-center">
                                            By applying, you agree to our terms and conditions
                                        </p>
                                    </form>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default JobDetail;
