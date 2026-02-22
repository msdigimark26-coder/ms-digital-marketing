
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { careersSupabase, Certification, SiteSection } from "@/integrations/supabase/careersClient";
import { ExternalLink, Award, ShieldCheck, X } from "lucide-react";
import { FadeUp } from "../ui/FadeUp";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AnimatePresence } from "framer-motion";

export const CertificationsSection = () => {
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const [selectedCert, setSelectedCert] = useState<Certification | null>(null);

    useEffect(() => {
        const fetchCertData = async () => {
            try {
                // 1. Check if section is visible
                const { data: sectionData, error: sectionError } = await careersSupabase
                    .from('site_sections')
                    .select('is_visible')
                    .eq('section_key', 'certifications_home')
                    .single();

                if (sectionError && sectionError.code !== 'PGRST116') {
                    console.error("Error fetching section visibility:", sectionError);
                }

                if (sectionData) {
                    setIsVisible(sectionData.is_visible);
                } else {
                    // Fallback if record doesn't exist
                    setIsVisible(true);
                }

                // 2. Fetch active certifications
                const { data: certsData, error: certsError } = await careersSupabase
                    .from('certifications')
                    .select('*')
                    .eq('is_active', true)
                    .order('created_at', { ascending: true });

                if (certsError) throw certsError;
                setCertifications(certsData || []);
            } catch (err) {
                console.error("Error loading certifications:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCertData();

        // 3. Real-time subscription
        const channel = careersSupabase
            .channel('certifications_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'certifications' }, () => {
                fetchCertData();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'site_sections' }, () => {
                fetchCertData();
            })
            .subscribe();

        return () => {
            careersSupabase.removeChannel(channel);
        };
    }, []);

    if (loading || !isVisible || certifications.length === 0) return null;

    return (
        <section className="py-32 bg-black relative overflow-hidden">
            {/* Background: Cyber Grid & Data Streams */}
            <div className="absolute inset-0 bg-[#05010a]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            <div className="container mx-auto px-4 relative z-10">
                <FadeUp className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-8 animate-pulse-glow">
                        <Award className="h-3 w-3" />
                        <span>Corporate Verification</span>
                    </div>
                    <h2 className="font-display text-5xl md:text-7xl font-bold mb-8 text-white tracking-tighter">
                        Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-blue-500">Certifications</span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed opacity-80">
                        Maintaining elite industry standards through rigorous validation from global technology and marketing leaders.
                    </p>
                </FadeUp>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {certifications.map((cert, index) => (
                        <motion.div
                            key={cert.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.8 }}
                            className="group relative"
                            onClick={() => setSelectedCert(cert)}
                        >
                            {/* Card Shell */}
                            <div className="relative aspect-[1.414/1] bg-[#0A0714] rounded-2xl border border-white/5 overflow-hidden transition-all duration-700 group-hover:border-primary/40 group-hover:translate-z-10 group-hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)] cursor-pointer translate-z-0 perspective-1000">

                                {/* Background Scanning Line */}
                                <motion.div
                                    animate={{ top: ['-10%', '110%'] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent z-10 pointer-events-none"
                                />

                                {/* Corner Accents */}
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/20 group-hover:border-primary/60 transition-colors duration-500 rounded-tl-2xl z-20 pointer-events-none" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/20 group-hover:border-primary/60 transition-colors duration-500 rounded-br-2xl z-20 pointer-events-none" />

                                {cert.certificate_image_url ? (
                                    <div className="relative w-full h-full">
                                        <img
                                            src={cert.certificate_image_url}
                                            alt={cert.title}
                                            className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-all duration-1000 group-hover:scale-105"
                                            loading="lazy"
                                        />

                                        {/* Digital Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0714] via-transparent to-transparent opacity-80" />

                                        {/* Dynamic Scanlines */}
                                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,#fff_1px,#fff_2px)] bg-[size:100%_2px]" />
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5">
                                        <div className="relative p-6 rounded-3xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-all duration-500 translate-z-10">
                                            <img
                                                src={cert.logo_url}
                                                alt={cert.title}
                                                className="w-16 h-16 object-contain filter brightness-125 transition-transform duration-700 group-hover:scale-110"
                                                loading="lazy"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Hover Reveal Info */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-primary/10 backdrop-blur-[2px]">
                                    <div className="p-4 rounded-full bg-white text-black scale-0 group-hover:scale-100 transition-transform duration-500 delay-100">
                                        <ExternalLink className="h-6 w-6" />
                                    </div>
                                    <span className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-white animate-pulse">Preview Certificate</span>
                                </div>
                            </div>

                            {/* Info Label Panel */}
                            <div className="mt-6 flex items-start justify-between gap-4 group">
                                <div className="space-y-1">
                                    <h3 className="text-white font-bold text-base tracking-tight group-hover:text-primary transition-colors duration-300">
                                        {cert.title}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="h-1 w-1 rounded-full bg-primary" />
                                        <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest leading-none">
                                            {cert.issuer}
                                        </p>
                                    </div>
                                </div>

                                {cert.verification_link && (
                                    <motion.a
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        href={cert.verification_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="mt-1 p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/5"
                                        title="Verify Credential"
                                    >
                                        <ShieldCheck className="h-4 w-4" />
                                    </motion.a>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Matrix-Style Premium Modal */}
            <AnimatePresence>
                {selectedCert && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 py-12 md:p-12 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-xl transition-opacity"
                            onClick={() => setSelectedCert(null)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-5xl mx-auto my-auto bg-[#0A0714]/90 border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_100px_-20px_rgba(168,85,247,0.3)] flex flex-col md:flex-row z-10"
                        >
                            {/* Certificate/Logo Area */}
                            <div className="relative flex-1 flex items-center justify-center p-8 md:p-16 min-h-[40vh] md:min-h-[60vh] bg-gradient-to-br from-[#110C1D] to-[#0A0714] overflow-hidden group">
                                {/* Cyber Grid Background */}
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                                {/* Scanning line effect */}
                                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                    <motion.div
                                        animate={{ top: ['-20%', '120%'] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_20px_rgba(168,85,247,0.5)] z-20"
                                    />
                                </div>

                                <div className="absolute top-6 left-6 z-20">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                        </span>
                                        <p className="text-[10px] font-bold tracking-widest text-primary uppercase">Secure Viewport</p>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="relative z-10 w-full h-full flex items-center justify-center">
                                    {selectedCert.certificate_image_url ? (
                                        <img
                                            src={selectedCert.certificate_image_url}
                                            alt={selectedCert.title}
                                            className="max-w-full max-h-full object-contain drop-shadow-[0_0_40px_rgba(168,85,247,0.3)] rounded-lg transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="relative p-12 md:p-20 rounded-full border border-white/5 bg-white/5 backdrop-blur-xl shadow-[0_0_60px_-15px_rgba(168,85,247,0.4)] transition-transform duration-500 group-hover:scale-105">
                                            <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse blur-2xl" />
                                            <img
                                                src={selectedCert.logo_url}
                                                alt={selectedCert.title}
                                                className="relative z-10 w-32 h-32 md:w-48 md:h-48 object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                                loading="lazy"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Info Sidebar */}
                            <div className="md:w-[400px] bg-black/40 backdrop-blur-2xl border-t md:border-t-0 md:border-l border-white/5 p-8 md:p-10 flex flex-col relative z-20">
                                <button
                                    onClick={() => setSelectedCert(null)}
                                    className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                <div className="flex-1 mt-6 md:mt-12 flex flex-col justify-center">
                                    <div className="mb-8 space-y-6">
                                        <h3 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight leading-tight">{selectedCert.title}</h3>

                                        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/5">
                                            <div className="p-3 rounded-xl bg-primary/20">
                                                <Award className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Issuing Authority</p>
                                                <p className="text-lg font-medium text-slate-200">{selectedCert.issuer}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedCert.verification_link && (
                                        <Button
                                            onClick={() => window.open(selectedCert.verification_link, '_blank')}
                                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 rounded-xl items-center justify-center gap-2 text-base shadow-[0_4px_20px_-5px_rgba(168,85,247,0.5)] hover:shadow-[0_8px_25px_-5px_rgba(168,85,247,0.6)] hover:-translate-y-0.5 transition-all"
                                        >
                                            <ShieldCheck className="h-5 w-5" />
                                            Verify Credential
                                        </Button>
                                    )}
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/10">
                                    <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-black flex items-center justify-center gap-2">
                                        <ShieldCheck className="h-3 w-3 text-primary" />
                                        Authenticity Verified
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Persistent Global Glows */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-64 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        </section>
    );
};
