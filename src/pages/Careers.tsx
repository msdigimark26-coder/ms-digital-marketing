import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { careersSupabase, JobOpening, isCareersSupabaseConfigured } from "@/integrations/supabase/careersClient";
import { Link } from "react-router-dom";
import {
    Briefcase,
    MapPin,
    Clock,
    DollarSign,
    ArrowRight,
    Loader2,
    Search,
    Building2,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export const Careers = () => {
    const [jobs, setJobs] = useState<JobOpening[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchActiveJobs();
    }, []);

    const fetchActiveJobs = async () => {
        if (!isCareersSupabaseConfigured) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await careersSupabase
                .from("job_openings")
                .select("*")
                .eq("status", "Active")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setJobs(data || []);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = jobs.filter(
        (job) =>
            job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.focus_areas.some((area) =>
                area.toLowerCase().includes(searchTerm.toLowerCase())
            )
    );

    return (
        <Layout>
            <div className="min-h-screen bg-[#070510] pt-20">
                {/* Hero Section */}
                <section className="relative py-20 overflow-hidden">
                    {/* Background Effects */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px]" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="max-w-3xl mx-auto text-center"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
                                <Briefcase className="h-4 w-4 text-purple-400" />
                                <span className="text-sm text-purple-300 font-medium">Join Our Team</span>
                            </div>

                            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6">
                                Build Your Career at{" "}
                                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                                    MS DIGIMARK
                                </span>
                            </h1>

                            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                                We're looking for talented individuals who are passionate about digital marketing,
                                design, and innovation. Explore open positions and join us in shaping the future.
                            </p>

                            {/* Search Bar */}
                            <div className="relative max-w-xl mx-auto">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                <Input
                                    placeholder="Search jobs by title, department, or skills..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 h-14 bg-white/5 border-white/10 text-white text-lg rounded-2xl"
                                />
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Job Listings */}
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                            </div>
                        ) : filteredJobs.length === 0 ? (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
                                <Briefcase className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {searchTerm ? "No Matching Jobs Found" : "No Open Positions"}
                                </h3>
                                <p className="text-slate-400">
                                    {searchTerm
                                        ? "Try adjusting your search criteria"
                                        : "Check back soon for new opportunities!"}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredJobs.map((job, index) => (
                                    <motion.div
                                        key={job.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="group"
                                    >
                                        <Link to={`/careers/${job.id}`}>
                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 h-full flex flex-col">
                                                {/* Job Header */}
                                                <div className="mb-4">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                                            <Briefcase className="h-6 w-6 text-purple-400" />
                                                        </div>
                                                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                                                            {job.job_type}
                                                        </span>
                                                    </div>

                                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                                                        {job.title}
                                                    </h3>

                                                    <div className="flex items-center gap-3 text-sm text-slate-400 mb-3">
                                                        <div className="flex items-center gap-1">
                                                            <Building2 className="h-4 w-4" />
                                                            {job.department}
                                                        </div>
                                                        <span>•</span>
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="h-4 w-4" />
                                                            {job.location}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {job.focus_areas.slice(0, 3).map((area, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded-md text-xs text-purple-300"
                                                            >
                                                                {area}
                                                            </span>
                                                        ))}
                                                        {job.focus_areas.length > 3 && (
                                                            <span className="px-2 py-1 bg-white/5 rounded-md text-xs text-slate-400">
                                                                +{job.focus_areas.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Job Description */}
                                                <p className="text-sm text-slate-400 mb-6 line-clamp-3 flex-1">
                                                    {job.description}
                                                </p>

                                                {/* Job Footer */}
                                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {job.experience_level}
                                                        </div>
                                                        {job.salary_range && (
                                                            <>
                                                                <span>•</span>
                                                                <div className="flex items-center gap-1">
                                                                    <DollarSign className="h-3 w-3" />
                                                                    {job.salary_range}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-1 text-sm text-purple-400 font-medium group-hover:gap-2 transition-all">
                                                        View Details
                                                        <ArrowRight className="h-4 w-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Why Join Us Section */}
                <section className="py-20 bg-gradient-to-b from-transparent to-purple-500/5">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <motion.h2
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="text-4xl font-display font-bold text-white text-center mb-12"
                            >
                                Why Join{" "}
                                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    MS DIGIMARK?
                                </span>
                            </motion.h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    {
                                        title: "Innovation First",
                                        description:
                                            "Work with cutting-edge technologies and modern digital marketing strategies.",
                                    },
                                    {
                                        title: "Growth Opportunities",
                                        description:
                                            "Continuous learning, skill development, and clear career progression paths.",
                                    },
                                    {
                                        title: "Flexible Work Culture",
                                        description:
                                            "Remote-first approach with flexible hours and work-life balance.",
                                    },
                                    {
                                        title: "Collaborative Team",
                                        description:
                                            "Work with talented professionals in a supportive and creative environment.",
                                    },
                                ].map((benefit, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-white/5 border border-white/10 rounded-xl p-6"
                                    >
                                        <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                                        <p className="text-slate-400">{benefit.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default Careers;
