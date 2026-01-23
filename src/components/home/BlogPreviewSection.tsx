import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { blogSupabase as supabase } from "@/integrations/supabase/blogClient";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, Calendar, Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    category: string;
    excerpt: string;
    featured_image: string | null;
    created_at: string;
    view_count: number;
    likes_count: number;
    theme_color?: string;
}

export const BlogPreviewSection = () => {
    const [latestPost, setLatestPost] = useState<BlogPost | null>(null);

    useEffect(() => {
        fetchLatestPost();
    }, []);

    const fetchLatestPost = async () => {
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('status', 'published')
                .order('updated_at', { ascending: false })
                .limit(1)
                .single();

            if (error) throw error;
            setLatestPost(data);
        } catch (error) {
            console.error("Error fetching latest post:", error);
        }
    };

    if (!latestPost) return null;

    const accentColorMap: Record<string, string> = {
        purple: 'text-purple-400 border-purple-500/30 bg-purple-500/10 hover:text-purple-300',
        blue: 'text-blue-400 border-blue-500/30 bg-blue-500/10 hover:text-blue-300',
        emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:text-emerald-300',
        rose: 'text-rose-400 border-rose-500/30 bg-rose-500/10 hover:text-rose-300',
        amber: 'text-amber-400 border-amber-500/30 bg-amber-500/10 hover:text-amber-300',
    };

    const themeClass = accentColorMap[latestPost.theme_color || 'purple'];

    return (
        <section className="py-24 bg-[#070510] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px]" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-5xl font-display font-bold text-white">
                            Latest <span className="text-purple-400">Insights</span>
                        </h2>
                        <p className="text-slate-400 mt-4 max-w-xl">
                            Our most recent update on the digital ecosystem and industry trends.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <Link to="/blog">
                            <Button variant="outline" className="border-white/10 hover:bg-white/5 text-slate-300">
                                View Blog <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative"
                >
                    <Link to={`/blog/${latestPost.slug}`} className="block group">
                        <div className="bg-[#0B0816] border border-white/5 rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-500 flex flex-col md:flex-row items-stretch min-h-[400px]">
                            {/* Image Container */}
                            <div className="md:w-1/2 relative overflow-hidden">
                                {latestPost.featured_image ? (
                                    <img
                                        src={latestPost.featured_image}
                                        alt={latestPost.title}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/10 to-blue-900/10">
                                        <FileText className="h-16 w-16 text-white/5" />
                                    </div>
                                )}
                                <div className="absolute top-6 left-6">
                                    <span className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur-md rounded-full border ${themeClass}`}>
                                        {latestPost.category}
                                    </span>
                                </div>
                            </div>

                            {/* Content Container */}
                            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
                                <div className="flex flex-wrap items-center gap-4 text-slate-500 text-[10px] mb-6 uppercase tracking-[0.2em] font-bold">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(latestPost.created_at).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Eye className="h-3 w-3" />
                                        {latestPost.view_count || 0}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Heart className="h-3 w-3" />
                                        {latestPost.likes_count || 0}
                                    </div>
                                </div>

                                <h3 className="text-2xl md:text-4xl font-bold text-white mb-6 leading-tight group-hover:text-purple-400 transition-colors">
                                    {latestPost.title}
                                </h3>

                                <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-8 line-clamp-3">
                                    {latestPost.excerpt}
                                </p>

                                <div className="flex items-center">
                                    <div className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider ${themeClass} group-hover:gap-4 transition-all duration-300`}>
                                        Read Full Article <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>

                                {/* Floating Action Button / Corner indicator */}
                                <div className="absolute top-8 right-8 md:top-12 md:right-12">
                                    <div className={`p-4 rounded-2xl border ${themeClass.split(' ')[1]} backdrop-blur-xl opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-500`}>
                                        <FileText className="h-6 w-6" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};
