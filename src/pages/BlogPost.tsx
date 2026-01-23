import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { blogSupabase as supabase } from "@/integrations/supabase/blogClient";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    ArrowLeft,
    Clock,
    Share2,
    Eye,
    Tag,
    ChevronRight,
    Loader2,
    Sun,
    Moon,
    Heart,
    BookOpen,
    X,
    Type
} from "lucide-react";
import { toast } from "sonner";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    category: string;
    excerpt: string;
    content: string;
    featured_image: string | null;
    created_at: string;
    view_count: number;
    likes_count: number;
    author_name?: string;
    theme_color?: string;
    font_family?: string;
}

const themeColorMap: Record<string, { primary: string, bg: string, border: string, text: string, shadow: string, isGradient?: boolean }> = {
    // Solid Themes
    purple: { primary: 'bg-purple-600', bg: 'bg-purple-900/40', border: 'border-purple-500/20', text: 'text-purple-400', shadow: 'shadow-purple-500/10' },
    blue: { primary: 'bg-blue-600', bg: 'bg-blue-900/40', border: 'border-blue-500/20', text: 'text-blue-400', shadow: 'shadow-blue-500/10' },
    emerald: { primary: 'bg-emerald-600', bg: 'bg-emerald-900/40', border: 'border-emerald-500/20', text: 'text-emerald-400', shadow: 'shadow-emerald-500/10' },
    rose: { primary: 'bg-rose-600', bg: 'bg-rose-900/40', border: 'border-rose-500/20', text: 'text-rose-400', shadow: 'shadow-rose-500/10' },
    amber: { primary: 'bg-amber-600', bg: 'bg-amber-900/40', border: 'border-amber-500/20', text: 'text-amber-400', shadow: 'shadow-amber-500/10' },
    slate: { primary: 'bg-slate-700', bg: 'bg-slate-900/40', border: 'border-slate-500/20', text: 'text-slate-400', shadow: 'shadow-slate-500/10' },
    cyan: { primary: 'bg-cyan-600', bg: 'bg-cyan-900/40', border: 'border-cyan-500/20', text: 'text-cyan-400', shadow: 'shadow-cyan-500/10' },
    indigo: { primary: 'bg-indigo-600', bg: 'bg-indigo-900/40', border: 'border-indigo-500/20', text: 'text-indigo-400', shadow: 'shadow-indigo-500/10' },
    white: { primary: 'bg-white text-black', bg: 'bg-white/20', border: 'border-white/30', text: 'text-white', shadow: 'shadow-white/20' },
    black: { primary: 'bg-slate-900 text-white', bg: 'bg-black/60', border: 'border-white/10', text: 'text-slate-200', shadow: 'shadow-black/40' },

    // Gradient Themes
    sunset: { isGradient: true, primary: 'bg-gradient-to-r from-orange-600 to-rose-600', bg: 'bg-rose-900/40', border: 'border-rose-500/20', text: 'text-rose-400', shadow: 'shadow-rose-500/10' },
    ocean: { isGradient: true, primary: 'bg-gradient-to-r from-blue-600 to-emerald-600', bg: 'bg-emerald-900/40', border: 'border-emerald-500/20', text: 'text-emerald-400', shadow: 'shadow-emerald-500/10' },
    nebula: { isGradient: true, primary: 'bg-gradient-to-r from-purple-600 to-blue-600', bg: 'bg-blue-900/40', border: 'border-blue-500/20', text: 'text-blue-400', shadow: 'shadow-blue-500/10' },
    midnight: { isGradient: true, primary: 'bg-gradient-to-r from-slate-800 to-purple-900', bg: 'bg-purple-900/40', border: 'border-purple-500/20', text: 'text-purple-400', shadow: 'shadow-purple-500/10' },
    aurora: { isGradient: true, primary: 'bg-gradient-to-r from-emerald-500 to-indigo-600', bg: 'bg-indigo-900/40', border: 'border-indigo-500/20', text: 'text-indigo-400', shadow: 'shadow-indigo-500/10' },
};

const fontMap: Record<string, string> = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
    display: 'font-display',
    poppins: 'font-poppins',
    playfair: 'font-playfair',
};

const BlogPost = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem("blog-theme");
        return saved ? saved === "dark" : true;
    });
    const [isReadingMode, setIsReadingMode] = useState(false);
    const [fontSize, setFontSize] = useState(1.125); // rem

    useEffect(() => {
        localStorage.setItem("blog-theme", isDarkMode ? "dark" : "light");
    }, [isDarkMode]);

    useEffect(() => {
        if (slug) {
            fetchPost();
        }
    }, [slug]);

    const fetchPost = async () => {
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('slug', slug)
                .eq('status', 'published')
                .single();

            if (error) throw error;
            setPost(data);

            if (data?.id) {
                await supabase.rpc('increment_article_view', { article_id: data.id });
            }

        } catch (error) {
            console.error("Error fetching post:", error);
            toast.error("Article not found");
            navigate("/blog");
        } finally {
            setLoading(false);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
    };

    if (loading) {
        return (
            <Layout>
                <div className={`min-h-screen transition-colors duration-500 flex items-center justify-center ${isDarkMode ? "bg-[#070510]" : "bg-slate-50"}`}>
                    <Loader2 className={`h-10 w-10 animate-spin ${isDarkMode ? "text-purple-500" : "text-purple-600"}`} />
                </div>
            </Layout>
        );
    }

    if (!post) return null;

    const theme = themeColorMap[post.theme_color || 'purple'] || themeColorMap.purple;
    const articleFont = fontMap[post.font_family || 'sans'] || 'font-sans';

    return (
        <Layout>
            <article className={`min-h-screen transition-colors duration-500 pt-20 ${isDarkMode ? "bg-[#070510]" : "bg-white"}`}>

                {/* Floating Controls Overlay - Bottom Left */}
                <div className="fixed bottom-8 left-8 z-[100] flex flex-col gap-3">
                    {/* Theme Toggle */}
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

                    {/* Reading Mode Toggle */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsReadingMode(true)}
                        className={`p-4 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all duration-300 ${isDarkMode
                            ? "bg-white/10 border-white/10 text-purple-400"
                            : "bg-white border-slate-200 text-purple-600 shadow-slate-300"
                            }`}
                        title="Enter Reading Mode"
                    >
                        <BookOpen className="h-6 w-6" />
                    </motion.button>
                </div>

                {/* Reading Mode Overlay */}
                <AnimatePresence>
                    {isReadingMode && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`fixed inset-0 z-[1000] overflow-y-auto px-4 py-8 md:py-16 ${isDarkMode ? "bg-[#070510]" : "bg-[#fdfbf6]"
                                } font-serif`}
                        >
                            <div className="max-w-3xl mx-auto relative">
                                {/* Reading Mode Toolbar */}
                                <div className={`sticky top-0 z-[1001] mb-8 flex items-center justify-between p-4 rounded-2xl backdrop-blur-md border transition-all duration-300 ${isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900 shadow-sm"
                                    }`}>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setFontSize(prev => Math.max(0.8, prev - 0.1))}
                                            className="p-2 rounded-lg hover:bg-black/5"
                                        >
                                            <Type className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setFontSize(prev => Math.min(2.5, prev + 0.1))}
                                            className="p-2 rounded-lg hover:bg-black/5"
                                        >
                                            <Type className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setIsDarkMode(!isDarkMode)}
                                            className={isDarkMode ? "text-yellow-400" : "text-slate-600"}
                                        >
                                            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                                        </button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsReadingMode(false)}
                                            className="gap-2"
                                        >
                                            <X className="h-4 w-4" /> Exit
                                        </Button>
                                    </div>
                                </div>

                                {/* Reading Mode Article */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className={`prose prose-lg max-w-none transition-all duration-500 ${isDarkMode ? "prose-invert" : "prose-slate"
                                        }`}
                                    style={{ fontSize: `${fontSize}rem`, lineHeight: '1.8' }}
                                >
                                    <h1 className="text-4xl md:text-5xl font-bold mb-8 font-display">
                                        {post.title}
                                    </h1>

                                    <div className="flex items-center gap-4 mb-12 opacity-60">
                                        <div className={`w-10 h-10 rounded-full ${theme.primary} flex items-center justify-center font-bold text-white shadow-lg`}>
                                            {(post.author_name || 'M')[0]}
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-bold">{post.author_name || 'MS DigiMark Team'}</p>
                                            <p>{new Date(post.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="whitespace-pre-wrap">
                                        {post.content}
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Article UI */}
                <div className="relative h-[65vh] min-h-[450px] w-full overflow-hidden">
                    {/* Background Image */}
                    {post.featured_image ? (
                        <>
                            <div className={`absolute inset-0 transition-opacity duration-500 z-10 ${isDarkMode ? "bg-black/70" : "bg-black/40"}`} />
                            <img
                                src={post.featured_image}
                                alt={post.title}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </>
                    ) : (
                        <div className={`absolute inset-0 ${theme.bg} via-transparent to-transparent z-0`} />
                    )}

                    <div className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent z-20 ${isDarkMode ? "from-[#070510]" : "from-white"}`} />

                    <div className="relative z-30 container mx-auto px-4 h-full flex flex-col justify-end pb-12">
                        <Link to="/blog" className={`inline-flex items-center mb-8 transition-colors w-fit group font-bold tracking-wider uppercase text-xs ${isDarkMode ? "text-slate-300 hover:text-white" : "text-slate-500 hover:text-slate-900"
                            }`}>
                            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Blog
                        </Link>

                        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm font-medium">
                            <span className={`px-4 py-1.5 ${theme.primary} text-white rounded-full text-xs font-bold tracking-wider uppercase shadow-lg shadow-black/20`}>
                                {post.category || "Tech"}
                            </span>
                            <span className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${isDarkMode ? "text-slate-300 bg-white/5 border-white/5" : "text-slate-500 bg-slate-50 border-slate-100"
                                }`}>
                                <Calendar className="h-4 w-4 opacity-70" />
                                {new Date(post.created_at).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                            <span className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${isDarkMode ? "text-slate-300 bg-white/5 border-white/5" : "text-slate-500 bg-slate-50 border-slate-100"
                                }`}>
                                <Clock className="h-4 w-4 opacity-70" />
                                {Math.ceil((post.content?.split(' ').length || 0) / 200)} min read
                            </span>
                        </div>

                        <h1 className={`text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-8 leading-[1.1] max-w-5xl tracking-tight transition-colors duration-500 ${isDarkMode ? "text-white" : "text-slate-900"
                            }`}>
                            {post.title}
                        </h1>

                        <div className="flex items-center gap-4 mb-8">
                            <div className={`w-12 h-12 rounded-full ${theme.primary} flex items-center justify-center text-lg font-bold text-white shadow-lg`}>
                                {(post.author_name || 'M')[0]}
                            </div>
                            <div>
                                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Article by</p>
                                <p className={`font-bold transition-colors ${isDarkMode ? "text-white" : "text-slate-900"}`}>{post.author_name || 'MS DigiMark Team'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-8">
                            <div className={`prose prose-lg max-w-none transition-colors duration-500 ${isDarkMode
                                ? "prose-invert prose-p:text-slate-300 prose-headings:text-white prose-strong:text-white"
                                : "prose-slate prose-p:text-slate-700 prose-headings:text-slate-900 prose-strong:text-slate-900"
                                } ${articleFont}`}>
                                <div className="whitespace-pre-wrap text-lg leading-relaxed space-y-8">
                                    {post.content}
                                </div>
                            </div>

                            <div className={`w-full h-px my-12 transition-colors ${isDarkMode ? "bg-white/10" : "bg-slate-100"}`} />

                            <div className="flex flex-wrap items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={async () => {
                                            if (!post) return;
                                            if (navigator.vibrate) navigator.vibrate(50);
                                            try {
                                                const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3");
                                                audio.volume = 0.5;
                                                audio.play().catch(() => { /* Silent fail */ });
                                            } catch (e) { /* Silent fail */ }

                                            try {
                                                const { error } = await supabase.rpc('increment_article_likes', { article_id: post.id });
                                                if (error) throw error;
                                                setPost({ ...post, likes_count: (post.likes_count || 0) + 1 });
                                                toast.success("Article liked!");
                                            } catch (err: any) {
                                                toast.error("Could not record like");
                                            }
                                        }}
                                        className={`gap-2 border transition-all duration-300 ${isDarkMode
                                            ? "border-white/10 hover:bg-white/5 text-slate-300 hover:text-white"
                                            : "border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-sm"
                                            }`}
                                    >
                                        <Heart className={`h-4 w-4 ${isDarkMode ? "group-hover:fill-rose-500" : ""}`} />
                                        {post.likes_count || 0}
                                    </Button>
                                    <div className={`flex items-center gap-2 text-sm font-medium transition-colors ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                                        <Eye className="h-4 w-4 opacity-70" />
                                        {post.view_count || 0} views
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={handleShare}
                                        className={`gap-2 border transition-all duration-300 ${isDarkMode
                                            ? "border-white/10 hover:bg-white/5 text-slate-300"
                                            : "border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm"
                                            }`}
                                    >
                                        <Share2 className="h-4 w-4" /> Copy Link
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-8">
                            <div className={`border rounded-[2rem] p-8 sticky top-24 overflow-hidden group/cta transition-all duration-500 ${isDarkMode
                                ? `bg-[#0B0816] ${theme.border} shadow-2xl ${theme.shadow}`
                                : "bg-slate-50 border-slate-100 shadow-xl shadow-slate-200/50"
                                }`}>
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent blur-3xl`} />
                                <div className={`p-4 ${theme.primary} bg-opacity-10 rounded-2xl w-fit mb-6`}>
                                    <Tag className={`h-6 w-6 shadow-xl ${isDarkMode ? theme.text : theme.text.replace('400', '600')}`} />
                                </div>
                                <h3 className={`text-2xl font-bold mb-4 transition-colors ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                    Need expert help?
                                </h3>
                                <p className={`text-sm mb-8 leading-relaxed transition-colors ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                                    Ready to implement these strategies? Our specialized team is here to help your brand dominate the digital landscape.
                                </p>
                                <Button className={`w-full ${theme.primary} hover:opacity-90 text-white h-12 font-bold uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-lg shadow-black/10`} onClick={() => navigate('/contact')}>
                                    Start Your Project <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </Layout>
    );
};

export default BlogPost;
