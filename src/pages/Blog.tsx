import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { blogSupabase as supabase } from "@/integrations/supabase/blogClient";
import { Link } from "react-router-dom";
import {
    Calendar,
    ArrowRight,
    Loader2,
    Search,
    FileText,
    Eye,
    Heart,
    Sun,
    Moon
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
    font_family?: string;
}

const themeColorMap: Record<string, { primary: string, border: string, text: string, shadow: string, isGradient?: boolean }> = {
    // Solid Themes
    purple: { primary: 'bg-purple-600', border: 'border-purple-500/20', text: 'text-purple-400', shadow: 'shadow-purple-500/10' },
    blue: { primary: 'bg-blue-600', border: 'border-blue-500/20', text: 'text-blue-400', shadow: 'shadow-blue-500/10' },
    emerald: { primary: 'bg-emerald-600', border: 'border-emerald-500/20', text: 'text-emerald-400', shadow: 'shadow-emerald-500/10' },
    rose: { primary: 'bg-rose-600', border: 'border-rose-500/20', text: 'text-rose-400', shadow: 'shadow-rose-500/10' },
    amber: { primary: 'bg-amber-600', border: 'border-amber-500/20', text: 'text-amber-400', shadow: 'shadow-amber-500/10' },
    slate: { primary: 'bg-slate-700', border: 'border-slate-500/20', text: 'text-slate-400', shadow: 'shadow-slate-500/10' },
    cyan: { primary: 'bg-cyan-600', border: 'border-cyan-500/20', text: 'text-cyan-400', shadow: 'shadow-cyan-500/10' },
    indigo: { primary: 'bg-indigo-600', border: 'border-indigo-500/20', text: 'text-indigo-400', shadow: 'shadow-indigo-500/10' },
    white: { primary: 'bg-white text-black', border: 'border-white/30', text: 'text-white', shadow: 'shadow-white/20' },
    black: { primary: 'bg-slate-900 text-white', border: 'border-white/10', text: 'text-slate-200', shadow: 'shadow-black/40' },

    // Gradient Themes
    sunset: { isGradient: true, primary: 'bg-gradient-to-r from-orange-600 to-rose-600', border: 'border-rose-500/20', text: 'text-rose-400', shadow: 'shadow-rose-500/10' },
    ocean: { isGradient: true, primary: 'bg-gradient-to-r from-blue-600 to-emerald-600', border: 'border-emerald-500/20', text: 'text-emerald-400', shadow: 'shadow-emerald-500/10' },
    nebula: { isGradient: true, primary: 'bg-gradient-to-r from-purple-600 to-blue-600', border: 'border-blue-500/20', text: 'text-blue-400', shadow: 'shadow-blue-500/10' },
    midnight: { isGradient: true, primary: 'bg-gradient-to-r from-slate-800 to-purple-900', border: 'border-purple-500/20', text: 'text-purple-400', shadow: 'shadow-purple-500/10' },
    aurora: { isGradient: true, primary: 'bg-gradient-to-r from-emerald-500 to-indigo-600', border: 'border-indigo-500/20', text: 'text-indigo-400', shadow: 'shadow-indigo-500/10' },
};

const Blog = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem("blog-theme");
        return saved ? saved === "dark" : true;
    });

    useEffect(() => {
        localStorage.setItem("blog-theme", isDarkMode ? "dark" : "light");
    }, [isDarkMode]);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('status', 'published')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const categories = Array.from(new Set(posts.map(p => p.category).filter(Boolean)));

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? post.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    return (
        <Layout>
            <div className={`min-h-screen transition-colors duration-500 pt-20 ${isDarkMode ? "bg-[#070510]" : "bg-slate-50"}`}>

                {/* Floating Theme Toggle - Bottom Left */}
                <div className="fixed bottom-8 left-8 z-[100]">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`p-4 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all duration-300 ${isDarkMode
                            ? "bg-white/10 border-white/10 text-yellow-400"
                            : "bg-white border-slate-200 text-slate-700 shadow-slate-300"
                            }`}
                        title="Toggle Theme"
                    >
                        {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                    </motion.button>
                </div>

                {/* Hero Section */}
                <section className="relative py-24 overflow-hidden">
                    {/* Background Effects */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] transition-opacity duration-1000 ${isDarkMode ? "bg-purple-500/10 opacity-100" : "bg-purple-200/40 opacity-50"}`} />
                        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] transition-opacity duration-1000 ${isDarkMode ? "bg-blue-500/10 opacity-100" : "bg-blue-200/40 opacity-50"}`} />
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="max-w-4xl mx-auto text-center"
                        >
                            <Badge className={`px-4 py-1.5 rounded-full mb-8 uppercase tracking-widest text-[10px] font-bold transition-colors ${isDarkMode
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                : "bg-purple-100 text-purple-600 border-purple-200 shadow-sm"
                                }`}>
                                Knowledge & Insights
                            </Badge>

                            <h1 className={`text-5xl md:text-7xl font-display font-bold mb-8 leading-[1.1] transition-colors duration-500 ${isDarkMode ? "text-white" : "text-slate-900"
                                }`}>
                                Explore the <span className="text-purple-600">Digital</span> <br />
                                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isDarkMode ? "from-blue-400 via-purple-400 to-rose-400" : "from-blue-600 via-purple-600 to-rose-600"}`}>Masterclass</span>
                            </h1>

                            <p className={`text-xl mb-12 max-w-2xl mx-auto leading-relaxed transition-colors duration-500 ${isDarkMode ? "text-slate-400" : "text-slate-600"
                                }`}>
                                Strategies, trends, and breakthroughs in marketing, technology, and branding to help you lead the market.
                            </p>

                            {/* Search & Filter */}
                            <div className="max-w-2xl mx-auto space-y-8">
                                <div className="relative group">
                                    <div className={`absolute -inset-1 rounded-2xl blur opacity-25 transition duration-500 group-hover:opacity-40 bg-gradient-to-r ${isDarkMode ? "from-purple-600 to-blue-600" : "from-purple-400 to-blue-400"}`} />
                                    <div className="relative">
                                        <Search className={`absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${isDarkMode ? "text-slate-500 group-focus-within:text-purple-400" : "text-slate-400"}`} />
                                        <Input
                                            placeholder="Search our catalog of insights..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className={`pl-14 h-16 text-lg rounded-2xl transition-all shadow-2xl border-none ${isDarkMode
                                                ? "bg-[#0B0816] text-white focus:ring-1 focus:ring-purple-500/30"
                                                : "bg-white text-slate-800 focus:ring-1 focus:ring-purple-200"
                                                }`}
                                        />
                                    </div>
                                </div>

                                {categories.length > 0 && (
                                    <div className="flex flex-wrap justify-center gap-3">
                                        <button
                                            onClick={() => setSelectedCategory(null)}
                                            className={`px-6 py-2 rounded-xl text-sm font-bold tracking-wider transition-all border ${selectedCategory === null
                                                ? "bg-purple-600 border-transparent text-white shadow-lg shadow-purple-600/20 scale-105"
                                                : isDarkMode
                                                    ? "bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                                                    : "bg-white border-slate-200 text-slate-500 hover:border-purple-200 hover:text-purple-600 shadow-sm"
                                                }`}
                                        >
                                            ALL TOPICS
                                        </button>
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`px-6 py-2 rounded-xl text-sm font-bold tracking-wider transition-all border ${selectedCategory === cat
                                                    ? "bg-purple-600 border-transparent text-white shadow-lg shadow-purple-600/20 scale-105"
                                                    : isDarkMode
                                                        ? "bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                                                        : "bg-white border-slate-200 text-slate-500 hover:border-purple-200 hover:text-purple-600 shadow-sm"
                                                    }`}
                                            >
                                                {cat?.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Articles Grid */}
                <section className="py-20 pb-32">
                    <div className="container mx-auto px-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className={`h-12 w-12 animate-spin ${isDarkMode ? "text-purple-500" : "text-purple-600"}`} />
                                <p className={`font-medium animate-pulse uppercase tracking-[0.2em] text-xs ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Loading Knowledge</p>
                            </div>
                        ) : filteredPosts.length === 0 ? (
                            <div className={`text-center py-20 rounded-3xl border border-dashed transition-colors ${isDarkMode ? "bg-white/2 border-white/10" : "bg-slate-100/50 border-slate-200"
                                }`}>
                                <FileText className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? "text-slate-700" : "text-slate-300"}`} />
                                <p className={`text-lg ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>No articles found matching your search.</p>
                                <button onClick={() => { setSearchTerm(""); setSelectedCategory(null); }} className="text-purple-600 mt-4 font-bold border-b border-purple-600/30 hover:border-purple-600 transition-all">Clear Filters</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {filteredPosts.map((post, index) => {
                                    const theme = themeColorMap[post.theme_color || 'purple'] || themeColorMap.purple;
                                    return (
                                        <motion.div
                                            key={post.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group"
                                        >
                                            <Link to={`/blog/${post.slug}`} className={`block h-full transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border flex flex-col rounded-[2rem] overflow-hidden ${isDarkMode
                                                ? `bg-[#0B0816] border-white/5 hover:border-white/20 ${theme.shadow}`
                                                : "bg-white border-slate-100 hover:border-purple-100 shadow-xl shadow-slate-200/50"
                                                }`}>
                                                {/* Image */}
                                                <div className="aspect-[16/10] overflow-hidden relative">
                                                    {post.featured_image ? (
                                                        <img
                                                            src={post.featured_image}
                                                            alt={post.title}
                                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                        />
                                                    ) : (
                                                        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${isDarkMode ? "from-white/5 to-transparent" : "from-slate-50 to-slate-100"}`}>
                                                            <FileText className={`h-14 w-14 ${isDarkMode ? "text-white/5" : "text-slate-200"}`} />
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-6 left-6">
                                                        <span className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md rounded-full border shadow-lg ${isDarkMode
                                                            ? `text-white ${theme.primary} border-white/10 shadow-black/40`
                                                            : `${theme.primary} text-white border-transparent shadow-purple-200`
                                                            }`}>
                                                            {post.category}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-8 flex flex-col flex-1 relative">
                                                    <div className={`flex flex-wrap items-center gap-4 text-[10px] mb-6 uppercase tracking-[0.15em] font-bold transition-colors ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${isDarkMode ? "bg-white/5" : "bg-slate-50"}`}>
                                                            <Calendar className="h-3 w-3 opacity-60" />
                                                            {new Date(post.created_at).toLocaleDateString(undefined, {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Eye className="h-3 w-3 opacity-60" />
                                                            {post.view_count || 0}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Heart className="h-3 w-3 opacity-60" />
                                                            {post.likes_count || 0}
                                                        </div>
                                                    </div>

                                                    <h3 className={`text-2xl font-bold mb-4 leading-tight group-hover:text-purple-600 transition-colors line-clamp-2 font-display ${isDarkMode ? "text-white" : "text-slate-800"
                                                        }`}>
                                                        {post.title}
                                                    </h3>

                                                    <p className={`text-sm leading-relaxed mb-8 line-clamp-3 transition-colors ${isDarkMode ? "text-slate-400 opacity-80" : "text-slate-600"
                                                        }`}>
                                                        {post.excerpt}
                                                    </p>

                                                    <div className={`mt-auto flex items-center text-xs font-bold uppercase tracking-[0.2em] group-hover:gap-3 transition-all duration-300 ${isDarkMode ? theme.text : "text-purple-600"
                                                        }`}>
                                                        View Case Study <ArrowRight className="h-4 w-4 ml-1" />
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default Blog;
