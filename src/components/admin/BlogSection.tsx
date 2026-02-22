import React, { useState, useEffect, useCallback, useMemo } from "react";
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
    BarChart,
    RefreshCw
} from "lucide-react";
import { blogSupabase as supabase } from "@/integrations/supabase/blogClient";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { BlogEditorDialog } from "./BlogEditorDialog";
import { useAuth } from "@/hooks/useAuth";
import { logActivity } from "@/utils/auditLogger";

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

const BlogRow = React.memo(({
    post,
    onEdit,
    onDelete,
    onCopyUrl
}: {
    post: BlogPost,
    onEdit: (p: BlogPost) => void,
    onDelete: (id: string, img: string | null) => void,
    onCopyUrl: (slug: string) => void
}) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group bg-[#0B0816] border border-white/5 hover:border-purple-500/30 rounded-xl p-4 transition-all flex flex-col md:flex-row gap-4 items-start md:items-center"
    >
        <div className="h-20 w-32 shrink-0 bg-white/5 rounded-lg overflow-hidden border border-white/5">
            {post.featured_image ? (
                <img src={post.featured_image} alt={post.title} className="h-full w-full object-cover" />
            ) : (
                <div className="h-full w-full flex items-center justify-center"><ImageIcon className="h-8 w-8 text-white/10" /></div>
            )}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={post.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}>{post.status}</Badge>
                <span className="text-xs text-slate-500 flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(post.created_at).toLocaleDateString()}</span>
                <span className="text-xs text-slate-500 flex items-center gap-1"><Eye className="h-3 w-3" /> {post.view_count} views</span>
                <span className="text-xs text-slate-500 flex items-center gap-1"><span className="text-[10px]">❤️</span> {post.likes_count} likes</span>
            </div>
            <h3 className="text-base font-bold text-white truncate group-hover:text-purple-400 transition-colors">{post.title}</h3>
            <p className="text-sm text-slate-400 truncate mt-1">{post.excerpt || "No excerpt..."}</p>
        </div>
        <div className="flex items-center gap-2 self-end md:self-center">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400" onClick={() => onCopyUrl(post.slug)}><MoreVertical className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-400 hover:bg-blue-500/10" onClick={() => onEdit(post)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-400 hover:bg-rose-500/10" onClick={() => onDelete(post.id, post.featured_image)}><Trash2 className="h-4 w-4" /></Button>
        </div>
    </motion.div>
));

BlogRow.displayName = "BlogRow";

export const BlogSection = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const { user } = useAuth();
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

    const fetchPosts = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const { data, error } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setPosts(data || []);
        } catch (error: any) { toast.error("Failed to load blog posts: " + error.message); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    const handleDelete = useCallback(async (id: string, imageUrl: string | null) => {
        if (!confirm("Delete this article?")) return;
        try {
            if (imageUrl) {
                const imagePath = imageUrl.split('/').pop();
                if (imagePath) await supabase.storage.from('blog_images').remove([imagePath]);
            }
            const { error } = await supabase.from('articles').delete().eq('id', id);
            if (error) throw error;

            // Log deletion
            logActivity({
                adminName: user?.user_metadata?.full_name || user?.email || "Admin",
                adminEmail: user?.email || "Unknown",
                actionType: 'delete',
                targetType: 'blog_post',
                targetId: id,
                description: `Deleted blog article (ID: ${id})`
            });

            toast.success("Article deleted");
            setPosts(prev => prev.filter(p => p.id !== id));
        } catch (error: any) { toast.error(error.message); }
    }, []);

    const handleCopyUrl = useCallback((slug: string) => {
        const url = `${window.location.origin}/blog/${slug}`;
        navigator.clipboard.writeText(url);
        toast.success("URL copied");
    }, []);

    const handleEdit = useCallback((post: BlogPost) => {
        setEditingPost(post);
        setIsEditorOpen(true);
    }, []);

    const filteredPosts = useMemo(() => {
        return posts.filter(post =>
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [posts, searchTerm]);

    const stats = useMemo(() => ({
        total: posts.length,
        views: posts.reduce((sum, p) => sum + (p.view_count || 0), 0),
        likes: posts.reduce((sum, p) => sum + (p.likes_count || 0), 0),
        published: posts.filter(p => p.status === 'published').length
    }), [posts]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-white tracking-tight">Blog <span className="text-purple-400">Management</span></h2>
                    <p className="text-slate-400 text-sm font-medium mt-1">Manage tech articles and updates.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => fetchPosts(true)}
                        disabled={loading}
                        className="h-10 w-10 text-slate-400 hover:text-white rounded-lg group transition-all"
                        title="Refresh articles"
                    >
                        <RefreshCw className={`h-4 w-4 transition-all duration-500 ${loading ? 'animate-spin' : 'group-active:rotate-180'}`} />
                    </Button>
                    <Button onClick={() => { setEditingPost(null); setIsEditorOpen(true); }} className="bg-purple-600 hover:bg-purple-700 text-white h-10"><Plus className="mr-2 h-4 w-4" /> New Article</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#0B0816] border border-white/5 rounded-xl p-5 flex justify-between items-start">
                    <div><p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Articles</p><h3 className="text-2xl font-bold text-white mt-1">{stats.total}</h3></div>
                    <div className="p-2 bg-purple-500/10 rounded-lg"><FileText className="h-5 w-5 text-purple-400" /></div>
                </div>
                <div className="bg-[#0B0816] border border-white/5 rounded-xl p-5 flex justify-between items-start">
                    <div><p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Views</p><h3 className="text-2xl font-bold text-white mt-1">{stats.views}</h3></div>
                    <div className="p-2 bg-blue-500/10 rounded-lg"><Eye className="h-5 w-5 text-blue-400" /></div>
                </div>
                <div className="bg-[#0B0816] border border-white/5 rounded-xl p-5 flex justify-between items-start">
                    <div><p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Likes</p><h3 className="text-2xl font-bold text-white mt-1">{stats.likes}</h3></div>
                    <div className="p-2 bg-rose-500/10 rounded-lg"><span className="text-rose-400">❤️</span></div>
                </div>
                <div className="bg-[#0B0816] border border-white/5 rounded-xl p-5 flex justify-between items-start">
                    <div><p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Published</p><h3 className="text-2xl font-bold text-white mt-1">{stats.published}</h3></div>
                    <div className="p-2 bg-emerald-500/10 rounded-lg"><BarChart className="h-5 w-5 text-emerald-400" /></div>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input placeholder="Search articles..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-[#0B0816] border-white/10" />
            </div>

            {loading && posts.length === 0 ? (
                <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-purple-500" /></div>
            ) : filteredPosts.length === 0 ? (
                <div className="text-center py-20 bg-[#0B0816] border border-white/5 rounded-xl border-dashed"><FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" /><h3 className="text-lg font-medium text-white">No articles found</h3></div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence>
                        {filteredPosts.map((post) => (
                            <BlogRow key={post.id} post={post} onEdit={handleEdit} onDelete={handleDelete} onCopyUrl={handleCopyUrl} />
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {isEditorOpen && (
                <BlogEditorDialog post={editingPost} isOpen={isEditorOpen} onClose={() => { setIsEditorOpen(false); setEditingPost(null); }} onSuccess={() => { setIsEditorOpen(false); setEditingPost(null); fetchPosts(false); }} />
            )}
        </div>
    );
};
