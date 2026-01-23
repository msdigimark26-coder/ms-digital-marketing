import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Loader2,
    Plus,
    Search,
    FileText,
    Pencil,
    Trash2,
    Eye,
    Image as ImageIcon,
    Calendar,
    MoreVertical,
    BarChart
} from "lucide-react";
import { blogSupabase as supabase } from "@/integrations/supabase/blogClient";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { BlogEditorDialog } from "./BlogEditorDialog";

// Interface for Blog Post
interface BlogPost {
    id: string;
    title: string;
    slug: string;
    category: string;
    excerpt: string;
    content: string;
    featured_image: string | null;
    status: 'draft' | 'published';
    view_count: number;
    likes_count: number;
    last_viewed_at: string | null;
    created_at: string;
    updated_at: string;
}

export const BlogSection = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

    // Initial Fetch
    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            console.error("Error fetching posts:", error);
            toast.error("Failed to load blog posts: " + ((error as any).message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, imageUrl: string | null) => {
        if (!confirm("Are you sure you want to delete this article?")) return;

        try {
            // 1. Delete image if exists
            if (imageUrl) {
                const imagePath = imageUrl.split('/').pop();
                if (imagePath) {
                    await supabase.storage
                        .from('blog_images')
                        .remove([imagePath]);
                }
            }

            // 2. Delete record
            const { error } = await supabase
                .from('articles')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success("Article deleted successfully");
            fetchPosts();
        } catch (error: any) {
            toast.error("Error deleting article: " + error.message);
        }
    };

    const handleCopyUrl = (slug: string) => {
        const url = `${window.location.origin}/blog/${slug}`;
        navigator.clipboard.writeText(url);
        toast.success("Post URL copied to clipboard");
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-white tracking-tight">
                        Blog <span className="text-purple-400">Management</span>
                    </h2>
                    <p className="text-slate-400 text-sm font-medium mt-1">
                        Create and manage tech articles and updates.
                    </p>
                </div>
                <Button
                    onClick={() => {
                        setEditingPost(null);
                        setIsEditorOpen(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Article
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0B0816] border border-white/5 rounded-xl p-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Articles</p>
                            <h3 className="text-2xl font-bold text-white mt-1">{posts.length}</h3>
                        </div>
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <FileText className="h-5 w-5 text-purple-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#0B0816] border border-white/5 rounded-xl p-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Views</p>
                            <h3 className="text-2xl font-bold text-white mt-1">
                                {posts.reduce((sum, post) => sum + (post.view_count || 0), 0)}
                            </h3>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Eye className="h-5 w-5 text-blue-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#0B0816] border border-white/5 rounded-xl p-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Likes</p>
                            <h3 className="text-2xl font-bold text-white mt-1">
                                {posts.reduce((sum, post) => sum + (post.likes_count || 0), 0)}
                            </h3>
                        </div>
                        <div className="p-2 bg-rose-500/10 rounded-lg">
                            <span className="text-rose-400">❤️</span>
                        </div>
                    </div>
                </div>
                <div className="bg-[#0B0816] border border-white/5 rounded-xl p-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Published</p>
                            <h3 className="text-2xl font-bold text-white mt-1">
                                {posts.filter(p => p.status === 'published').length}
                            </h3>
                        </div>
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <BarChart className="h-5 w-5 text-emerald-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search articles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-[#0B0816] border-white/10"
                    />
                </div>
            </div>

            {/* Articles List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="text-center py-20 bg-[#0B0816] border border-white/5 rounded-xl border-dashed">
                    <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white">No articles found</h3>
                    <p className="text-slate-400 text-sm mt-1">Get started by creating your first blog post.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence>
                        {filteredPosts.map((post) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group bg-[#0B0816] border border-white/5 hover:border-purple-500/30 rounded-xl p-4 transition-all flex flex-col md:flex-row gap-4 items-start md:items-center"
                            >
                                {/* Image / Placeholder */}
                                <div className="h-20 w-32 shrink-0 bg-white/5 rounded-lg overflow-hidden border border-white/5">
                                    {post.featured_image ? (
                                        <img
                                            src={post.featured_image}
                                            alt={post.title}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                            <ImageIcon className="h-8 w-8 text-white/10" />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className={`
                                            ${post.status === 'published'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}
                                        `}>
                                            {post.status}
                                        </Badge>
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </span>
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            <Eye className="h-3 w-3" />
                                            {post.view_count} views
                                        </span>
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            <span className="text-[10px]">❤️</span>
                                            {post.likes_count} likes
                                        </span>
                                    </div>
                                    <h3 className="text-base font-bold text-white truncate group-hover:text-purple-400 transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-sm text-slate-400 truncate mt-1">
                                        {post.excerpt || "No excerpt..."}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 self-end md:self-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                                        onClick={() => handleCopyUrl(post.slug)}
                                        title="Copy Link"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                        onClick={() => {
                                            setEditingPost(post);
                                            setIsEditorOpen(true);
                                        }}
                                        title="Edit"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                                        onClick={() => handleDelete(post.id, post.featured_image)}
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Blog Editor Dialog - Importing dynamically would be better but simple conditional render is fine */}
            {isEditorOpen && (
                <BlogEditorDialog
                    post={editingPost}
                    isOpen={isEditorOpen}
                    onClose={() => {
                        setIsEditorOpen(false);
                        setEditingPost(null);
                    }}
                    onSuccess={() => {
                        setIsEditorOpen(false);
                        setEditingPost(null);
                        fetchPosts();
                    }}
                />
            )}
        </div>
    );
};

