
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Plus,
    Trash2,
    Edit2,
    Link as LinkIcon,
    Award,
    Eye,
    EyeOff,
    Upload,
    Save,
    X,
    ShieldCheck,
    CheckCircle2,
    ToggleLeft,
    ToggleRight,
    Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { careersSupabase, Certification, SiteSection } from "@/integrations/supabase/careersClient";

export const CertificationsManagementSection = () => {
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [visibility, setVisibility] = useState<SiteSection | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCert, setEditingCert] = useState<Certification | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        issuer: "",
        verification_link: "",
        logo_file: null as File | null,
        cert_image_file: null as File | null,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch certifications
            const { data: certs, error: certsError } = await careersSupabase
                .from('certifications')
                .select('*')
                .order('created_at', { ascending: false });

            if (certsError) throw certsError;
            setCertifications(certs || []);

            // Fetch section visibility
            const { data: section, error: sectionError } = await careersSupabase
                .from('site_sections')
                .select('*')
                .eq('section_key', 'certifications_home')
                .single();

            if (!sectionError) {
                setVisibility(section);
            }
        } catch (err: any) {
            console.error("Error fetching admin certifications:", err);
            toast.error("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleGlobalVisibility = async () => {
        if (!visibility) return;
        const newState = !visibility.is_visible;

        try {
            const { error } = await careersSupabase
                .from('site_sections')
                .update({ is_visible: newState })
                .eq('section_key', 'certifications_home');

            if (error) throw error;
            setVisibility({ ...visibility, is_visible: newState });
            toast.success(`Home section ${newState ? 'enabled' : 'disabled'}`);
        } catch (err: any) {
            toast.error("Failed to update visibility");
        }
    };

    const handleToggleCertStatus = async (cert: Certification) => {
        try {
            const { error } = await careersSupabase
                .from('certifications')
                .update({ is_active: !cert.is_active })
                .eq('id', cert.id);

            if (error) throw error;
            setCertifications(certifications.map(c =>
                c.id === cert.id ? { ...c, is_active: !c.is_active } : c
            ));
            toast.success(`Certification ${!cert.is_active ? 'activated' : 'deactivated'}`);
        } catch (err: any) {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (cert: Certification) => {
        if (!confirm("Are you sure? This will remove the certification permanently.")) return;

        try {
            // 1. Delete record
            const { error } = await careersSupabase
                .from('certifications')
                .delete()
                .eq('id', cert.id);

            if (error) throw error;

            // 2. Try to delete the file from storage if it's our URL
            if (cert.logo_url.includes('payment_evidence') || cert.logo_url.includes('certifications')) {
                const urlParts = cert.logo_url.split('/');
                const fileName = urlParts[urlParts.length - 1];
                await careersSupabase.storage
                    .from('certifications')
                    .remove([`logos/${fileName}`]);
            }

            setCertifications(certifications.filter(c => c.id !== cert.id));
            toast.success("Certification deleted");
        } catch (err: any) {
            toast.error("Failed to delete certification");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let logoUrl = editingCert?.logo_url || "";
            let certImageUrl = editingCert?.certificate_image_url || "";

            // Handle logo file upload
            if (formData.logo_file) {
                const fileExt = formData.logo_file.name.split('.').pop();
                const fileName = `logo_${Date.now()}.${fileExt}`;
                const filePath = `logos/${fileName}`;

                const { error: uploadError } = await careersSupabase.storage
                    .from('certifications')
                    .upload(filePath, formData.logo_file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = careersSupabase.storage
                    .from('certifications')
                    .getPublicUrl(filePath);

                logoUrl = publicUrl;
            }

            // Handle certificate image file upload
            if (formData.cert_image_file) {
                const fileExt = formData.cert_image_file.name.split('.').pop();
                const fileName = `cert_${Date.now()}.${fileExt}`;
                const filePath = `images/${fileName}`;

                const { error: uploadError } = await careersSupabase.storage
                    .from('certifications')
                    .upload(filePath, formData.cert_image_file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = careersSupabase.storage
                    .from('certifications')
                    .getPublicUrl(filePath);

                certImageUrl = publicUrl;
            }

            if (!logoUrl) throw new Error("Logo is required");

            const submissionData = {
                title: formData.title,
                issuer: formData.issuer,
                verification_link: formData.verification_link,
                logo_url: logoUrl,
                certificate_image_url: certImageUrl,
                is_active: true
            };

            if (editingCert) {
                const { error } = await careersSupabase
                    .from('certifications')
                    .update(submissionData)
                    .eq('id', editingCert.id);

                if (error) throw error;
                toast.success("Certification updated");
            } else {
                const { error } = await careersSupabase
                    .from('certifications')
                    .insert(submissionData);

                if (error) throw error;
                toast.success("Certification added");
            }

            setFormData({ title: "", issuer: "", verification_link: "", logo_file: null, cert_image_file: null });
            setShowAddModal(false);
            setEditingCert(null);
            fetchData();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to save certification");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header with Global Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Award className="h-8 w-8 text-primary" />
                        Certifications & Badges
                    </h2>
                    <p className="text-slate-400">Manage industry credentials displayed on the homepage.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-2xl border border-white/5">
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Home Visibility</span>
                        <button
                            onClick={handleToggleGlobalVisibility}
                            className="transition-colors duration-300"
                        >
                            {visibility?.is_visible ? (
                                <ToggleRight className="h-8 w-8 text-emerald-500" aria-label="Disable home visibility" />
                            ) : (
                                <ToggleLeft className="h-8 w-8 text-slate-600" aria-label="Enable home visibility" />
                            )}
                        </button>
                    </div>
                    <Button
                        onClick={() => {
                            setEditingCert(null);
                            setFormData({ title: "", issuer: "", verification_link: "", logo_file: null, cert_image_file: null });
                            setShowAddModal(true);
                        }}
                        className="bg-primary hover:bg-primary/90 text-white gap-2 font-bold px-6 h-12 rounded-2xl shadow-lg shadow-primary/20"
                    >
                        <Plus className="h-5 w-5" />
                        Add New
                    </Button>
                </div>
            </div>

            {/* Grid of Certs */}
            {isLoading ? (
                <div className="flex items-center justify-center p-20">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
            ) : certifications.length === 0 ? (
                <div className="text-center p-20 glass-card rounded-3xl border-dashed border-2 border-white/10">
                    <Award className="h-16 w-16 text-slate-600 mx-auto mb-4 opacity-20" />
                    <p className="text-slate-400">No certifications found. Add your first one!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {certifications.map((cert) => (
                            <motion.div
                                key={cert.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`group relative bg-[#0a0515]/60 border border-white/10 rounded-[2rem] p-6 transition-all duration-300 hover:border-primary/40 hover:bg-[#0f0a1f] ${!cert.is_active ? 'opacity-50 grayscale shadow-none' : 'shadow-2xl shadow-black/40'}`}
                            >
                                <div className="flex flex-col md:flex-row gap-8">
                                    {/* Dual Preview Area */}
                                    <div className="flex gap-4 shrink-0">
                                        {/* Logo Section */}
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block text-center">Logo</span>
                                            <div className="w-20 h-20 bg-black/40 rounded-2xl p-4 flex items-center justify-center border border-white/5 group-hover:border-primary/20 transition-colors">
                                                <img src={cert.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
                                            </div>
                                        </div>

                                        {/* Cert Preview */}
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block text-center">Full View</span>
                                            <div className="w-32 h-20 bg-black/40 rounded-2xl overflow-hidden border border-white/5 relative group/img cursor-zoom-in">
                                                {cert.certificate_image_url ? (
                                                    <img src={cert.certificate_image_url} alt="Full" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                                                        <ImageIcon className="h-5 w-5" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content & Actions */}
                                    <div className="flex-1 flex flex-col justify-between min-w-0">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="min-w-0">
                                                <h4 className="text-xl font-bold text-white truncate group-hover:text-primary transition-colors">{cert.title}</h4>
                                                <p className="text-slate-400 text-sm font-medium">{cert.issuer}</p>
                                            </div>

                                            <div className="flex gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
                                                <button
                                                    onClick={() => handleToggleCertStatus(cert)}
                                                    className={`p-2 rounded-lg transition-all ${cert.is_active ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-slate-500 hover:bg-white/5'}`}
                                                    title={cert.is_active ? "Deactivate" : "Activate"}
                                                    aria-label={cert.is_active ? "Deactivate certification" : "Activate certification"}
                                                >
                                                    {cert.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingCert(cert);
                                                        setFormData({
                                                            title: cert.title,
                                                            issuer: cert.issuer,
                                                            verification_link: cert.verification_link || "",
                                                            logo_file: null,
                                                            cert_image_file: null,
                                                        });
                                                        setShowAddModal(true);
                                                    }}
                                                    className="p-2 rounded-lg text-blue-400 hover:bg-blue-400/10 transition-all"
                                                    aria-label="Edit certification"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cert)}
                                                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all"
                                                    aria-label="Delete certification"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 mt-4 md:mt-0">
                                            {cert.verification_link ? (
                                                <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500/80 uppercase tracking-widest bg-emerald-500/5 px-2.5 py-1 rounded-md border border-emerald-500/10">
                                                    <ShieldCheck className="h-3 w-3" />
                                                    Link Verified
                                                </div>
                                            ) : (
                                                <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-md">
                                                    No Link
                                                </div>
                                            )}

                                            <span className="text-[9px] font-black text-slate-500 uppercase">
                                                Added: {new Date(cert.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setShowAddModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#0f0a1f] border border-white/10 p-8 rounded-3xl w-full max-w-xl relative shrink-0 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                    {editingCert ? <Edit2 className="h-6 w-6 text-primary" /> : <Plus className="h-6 w-6 text-primary" />}
                                    {editingCert ? "Edit Certification" : "Add New Certification"}
                                </h3>
                                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition-colors">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Title</label>
                                    <Input
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="bg-black/40 border-white/10 h-12 rounded-xl"
                                        placeholder="e.g. Google Ads Expert"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Issuer</label>
                                    <Input
                                        value={formData.issuer}
                                        onChange={e => setFormData({ ...formData, issuer: e.target.value })}
                                        className="bg-black/40 border-white/10 h-12 rounded-xl"
                                        placeholder="e.g. Google Digital Academy"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Verification Link</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <Input
                                            value={formData.verification_link}
                                            onChange={e => setFormData({ ...formData, verification_link: e.target.value })}
                                            className="bg-black/40 border-white/10 h-12 rounded-xl pl-12"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Logo / Badge</label>
                                        <div
                                            className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all ${formData.logo_file ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-white/20 bg-black/40'}`}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                const file = e.dataTransfer.files[0];
                                                if (file && file.type.startsWith('image/')) setFormData({ ...formData, logo_file: file });
                                            }}
                                        >
                                            <input
                                                type="file"
                                                id="cert-logo-upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => e.target.files && setFormData({ ...formData, logo_file: e.target.files[0] })}
                                            />
                                            <label htmlFor="cert-logo-upload" className="cursor-pointer space-y-1 block">
                                                {formData.logo_file ? (
                                                    <div className="text-emerald-400 text-xs font-bold truncate">{formData.logo_file.name}</div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Upload className="h-4 w-4 text-slate-500" />
                                                        <p className="text-slate-500 text-[10px]">Upload Badge</p>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Full Cert Image</label>
                                        <div
                                            className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all ${formData.cert_image_file ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-white/20 bg-black/40'}`}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                const file = e.dataTransfer.files[0];
                                                if (file && file.type.startsWith('image/')) setFormData({ ...formData, cert_image_file: file });
                                            }}
                                        >
                                            <input
                                                type="file"
                                                id="cert-image-upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => e.target.files && setFormData({ ...formData, cert_image_file: e.target.files[0] })}
                                            />
                                            <label htmlFor="cert-image-upload" className="cursor-pointer space-y-1 block">
                                                {formData.cert_image_file ? (
                                                    <div className="text-emerald-400 text-xs font-bold truncate">{formData.cert_image_file.name}</div>
                                                ) : editingCert?.certificate_image_url ? (
                                                    <div className="text-primary text-[10px] font-bold">Image exists</div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <ImageIcon className="h-4 w-4 text-slate-500" />
                                                        <p className="text-slate-500 text-[10px]">Upload Cert</p>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-14 bg-gradient-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 gap-3"
                                    disabled={isSubmitting}
                                    type="submit"
                                >
                                    {isSubmitting ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="h-5 w-5" />}
                                    {editingCert ? "Update Certification" : "Add Certification"}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
