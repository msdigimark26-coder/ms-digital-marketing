import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    Loader2,
    X,
    Upload,
    Image as ImageIcon,
    Save,
    Globe,
    Type,
    Palette,
    Pencil,
    Plus
} from "lucide-react";
import { blogSupabase as supabase } from "@/integrations/supabase/blogClient";
import { useAuth } from "@/hooks/useAuth";
import { logActivity } from "@/utils/auditLogger";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    category: string;
    excerpt: string;
    content: string;
    featured_image: string | null;
    status: 'draft' | 'published';
}

interface BlogEditorDialogProps {
    post: BlogPost | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const BlogEditorDialog = ({ post, isOpen, onClose, onSuccess }: BlogEditorDialogProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(post?.featured_image || null);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        category: "Web Design & Development",
        excerpt: "",
        content: "",
        status: "draft" as "draft" | "published",
        author_name: "MS DigiMark Team",
        theme_color: "purple",
        font_family: "sans",
        meta_description: ""
    });

    useEffect(() => {
        if (post) {
            setFormData({
                title: post.title || "",
                slug: post.slug || "",
                category: post.category || "Web Design & Development",
                excerpt: post.excerpt || "",
                content: post.content || "",
                status: post.status || "draft",
                author_name: (post as any).author_name || "MS DigiMark Team",
                theme_color: (post as any).theme_color || "purple",
                font_family: (post as any).font_family || "sans",
                meta_description: post.excerpt || ""
            });
            setImagePreview(post.featured_image);
        } else {
            setFormData({
                title: "",
                slug: "",
                category: "Web Design & Development",
                excerpt: "",
                content: "",
                status: "draft",
                author_name: "MS DigiMark Team",
                theme_color: "purple",
                font_family: "sans",
                meta_description: ""
            });
            setImagePreview(null);
            setImageFile(null);
        }
    }, [post, isOpen]);

    // Auto-generate slug from title
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            slug: !post ? (title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : prev.slug
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 5MB Limit
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be smaller than 5MB");
            return;
        }

        setImageFile(file);
        // Create local preview
        const url = URL.createObjectURL(file);
        setImagePreview(url);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let featured_image_url = post?.featured_image || null;

            // 1. Upload Image if changed
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Date.now()}_${(formData.author_name || 'user').replace(/\s+/g, '_')}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('blog_images')
                    .upload(filePath, imageFile);

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('blog_images')
                    .getPublicUrl(filePath);

                featured_image_url = urlData.publicUrl;
            }

            // 2. Save Article
            const articleData = {
                title: formData.title,
                slug: formData.slug,
                category: formData.category,
                excerpt: formData.excerpt,
                content: formData.content,
                status: formData.status,
                featured_image: featured_image_url,
                author_name: formData.author_name,
                theme_color: formData.theme_color,
                font_family: formData.font_family,
                meta_description: formData.excerpt,
                updated_at: new Date().toISOString()
            };

            if (post) {
                // Update
                const { error } = await supabase
                    .from('articles')
                    .update(articleData)
                    .eq('id', post.id);
                if (error) throw error;

                // Log update
                logActivity({
                    adminName: user?.user_metadata?.full_name || user?.email || "Admin",
                    adminEmail: user?.email || "Unknown",
                    actionType: 'update',
                    targetType: 'blog_post',
                    targetId: post.id,
                    targetData: articleData,
                    description: `Updated blog article: ${formData.title}`
                });

                toast.success("Article updated successfully");
            } else {
                // Create
                const { error } = await supabase
                    .from('articles')
                    .insert([articleData]);
                if (error) throw error;

                // Log creation
                logActivity({
                    adminName: user?.user_metadata?.full_name || user?.email || "Admin",
                    adminEmail: user?.email || "Unknown",
                    actionType: 'create',
                    targetType: 'blog_post',
                    targetData: articleData,
                    description: `Published new blog article: ${formData.title}`
                });

                toast.success("Article published successfully");
            }

            onSuccess();
        } catch (error: any) {
            console.error("Save error:", error);
            toast.error("Failed to save article: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const solidThemes = [
        { id: 'purple', class: 'bg-purple-500' },
        { id: 'blue', class: 'bg-blue-500' },
        { id: 'emerald', class: 'bg-emerald-500' },
        { id: 'rose', class: 'bg-rose-500' },
        { id: 'amber', class: 'bg-amber-500' },
        { id: 'slate', class: 'bg-slate-700' },
        { id: 'cyan', class: 'bg-cyan-500' },
        { id: 'indigo', class: 'bg-indigo-600' },
        { id: 'white', class: 'bg-slate-100 border-white/50' },
        { id: 'black', class: 'bg-black border-white/20' }
    ];

    const gradientThemes = [
        { id: 'sunset', class: 'bg-gradient-to-r from-orange-400 to-rose-500' },
        { id: 'ocean', class: 'bg-gradient-to-r from-blue-400 to-emerald-500' },
        { id: 'nebula', class: 'bg-gradient-to-r from-purple-500 to-blue-500' },
        { id: 'midnight', class: 'bg-gradient-to-r from-slate-900 to-purple-900' },
        { id: 'aurora', class: 'bg-gradient-to-r from-emerald-400 to-indigo-600' }
    ];

    const fonts = [
        { id: 'sans', name: 'Standard Sans', class: 'font-sans' },
        { id: 'serif', name: 'Classic Serif', class: 'font-serif' },
        { id: 'mono', name: 'Tech Mono', class: 'font-mono' },
        { id: 'display', name: 'Modern Display', class: 'font-display' },
        { id: 'poppins', name: 'Geometric Poppins', class: 'font-poppins' },
        { id: 'playfair', name: 'Elegant Playfair', class: 'font-playfair' }
    ];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl bg-[#0B0816] border border-white/10 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        {post ? <Pencil className="h-5 w-5 text-blue-400" /> : <Plus className="h-5 w-5 text-purple-400" />}
                        {post ? 'Edit Article' : 'Create New Article'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* LEFT COLUMN: Main Content */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-slate-400">Article Title</Label>
                                <Input
                                    required
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    placeholder="e.g., The Future of Digital Marketing in 2026"
                                    className="bg-black/20 border-white/10 text-lg font-bold h-12 focus:ring-purple-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-400">Slug (URL)</Label>
                                <div className="flex items-center gap-2 text-slate-400 text-sm bg-black/20 p-3 rounded-lg border border-white/10 focus-within:border-purple-500/50">
                                    <Globe className="h-4 w-4" />
                                    <span>msdigimark.org/blog/</span>
                                    <input
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="bg-transparent border-none outline-none text-white flex-1 font-medium"
                                        placeholder="post-url-slug"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-400">Excerpt (Short Summary)</Label>
                                <Textarea
                                    rows={3}
                                    required
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    placeholder="Brief introduction for the card preview..."
                                    className="bg-black/20 border-white/10 resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label className="text-slate-400">Main Content</Label>
                                    <span className="text-[10px] text-purple-500 font-bold uppercase tracking-wider">Markdown Supported</span>
                                </div>
                                <Textarea
                                    rows={15}
                                    required
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Write your article here. Use paragraphs, ensuring readability."
                                    className="bg-black/20 border-white/10 font-mono text-sm leading-relaxed"
                                />
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Metadata & Settings */}
                        <div className="space-y-6">
                            {/* Status */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Publishing</Label>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Status</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold transition-colors ${formData.status === 'published' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                            {formData.status === 'published' ? 'LIVE' : 'DRAFT'}
                                        </span>
                                        <Switch
                                            checked={formData.status === 'published'}
                                            onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 'published' : 'draft' })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Organization & Style */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Organization & Style</Label>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Author/Team</Label>
                                        <Input
                                            value={formData.author_name}
                                            onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                                            placeholder="e.g. MS DigiMark Team"
                                            className="bg-black/20 border-white/10 h-8 text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs">Category</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(val) => setFormData({ ...formData, category: val })}
                                        >
                                            <SelectTrigger className="bg-black/20 border-white/10 h-8 text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#0B0816] border-white/10 text-white">
                                                <SelectItem value="Web Design & Development">Web Design & Development</SelectItem>
                                                <SelectItem value="SEO & Content Marketing">SEO & Content Marketing</SelectItem>
                                                <SelectItem value="Social Media Marketing">Social Media Marketing</SelectItem>
                                                <SelectItem value="PPC & Paid Advertising">PPC & Paid Advertising</SelectItem>
                                                <SelectItem value="Video Production">Video Production</SelectItem>
                                                <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                                                <SelectItem value="AI Tools">AI Tools</SelectItem>
                                                <SelectItem value="Tech Updates">Tech Updates</SelectItem>
                                                <SelectItem value="Business Growth">Business Growth</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs flex items-center gap-1">
                                            <Type className="h-3 w-3" /> Article Font
                                        </Label>
                                        <Select
                                            value={formData.font_family}
                                            onValueChange={(val) => setFormData({ ...formData, font_family: val })}
                                        >
                                            <SelectTrigger className="bg-black/20 border-white/10 h-8 text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#0B0816] border-white/10 text-white">
                                                {fonts.map(font => (
                                                    <SelectItem key={font.id} value={font.id} className={font.class}>
                                                        {font.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs flex items-center gap-1">
                                            <Palette className="h-3 w-3" /> Theme & Gradients
                                        </Label>
                                        <Tabs defaultValue="solid" className="w-full">
                                            <TabsList className="grid w-full grid-cols-2 bg-black/40 h-7 p-0.5">
                                                <TabsTrigger value="solid" className="text-[10px] h-full transition-all data-[state=active]:bg-white/10">SOLID</TabsTrigger>
                                                <TabsTrigger value="gradient" className="text-[10px] h-full transition-all data-[state=active]:bg-white/10">GRADIENT</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="solid" className="mt-3">
                                                <div className="grid grid-cols-4 gap-2">
                                                    {solidThemes.map((color) => (
                                                        <button
                                                            key={color.id}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, theme_color: color.id })}
                                                            className={`h-7 rounded-md border transition-all ${color.class} ${formData.theme_color === color.id ? 'border-white ring-1 ring-white/50 scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                                            title={color.id}
                                                        />
                                                    ))}
                                                </div>
                                            </TabsContent>
                                            <TabsContent value="gradient" className="mt-3">
                                                <div className="grid grid-cols-3 gap-2">
                                                    {gradientThemes.map((color) => (
                                                        <button
                                                            key={color.id}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, theme_color: color.id })}
                                                            className={`h-7 rounded-md border transition-all ${color.class} ${formData.theme_color === color.id ? 'border-white ring-1 ring-white/50 scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                                            title={color.id}
                                                        />
                                                    ))}
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                </div>
                            </div>

                            {/* Featured Image */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Featured Image</Label>

                                <div className="aspect-video w-full bg-black/40 rounded-lg overflow-hidden border border-white/10 relative group">
                                    {imagePreview ? (
                                        <>
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setImagePreview(null)}
                                                    className="text-white hover:text-rose-400"
                                                >
                                                    <X className="h-6 w-6" />
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                                            <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                                            <span className="text-xs font-medium">No image selected</span>
                                        </div>
                                    )}
                                </div>

                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="featured-image-upload"
                                    />
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 h-9"
                                    >
                                        <label htmlFor="featured-image-upload" className="cursor-pointer text-xs font-bold">
                                            <Upload className="mr-2 h-4 w-4" />
                                            UPLOAD IMAGE
                                        </label>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="bg-transparent hover:bg-white/5 text-slate-400 font-bold text-xs"
                        >
                            CANCEL
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-purple-600 hover:bg-purple-700 text-white min-w-[150px] font-bold text-xs tracking-widest"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            {post ? 'UPDATE ARTICLE' : 'PUBLISH ARTICLE'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
