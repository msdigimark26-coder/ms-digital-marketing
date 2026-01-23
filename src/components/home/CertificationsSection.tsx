
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { careersSupabase, Certification, SiteSection } from "@/integrations/supabase/careersClient";
import { ExternalLink, Award, ShieldCheck, X } from "lucide-react";
import { FadeUp } from "../ui/FadeUp";
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

                if (sectionError) {
                    console.error("Error fetching section visibility:", sectionError);
                    setLoading(false);
                    return;
                }

                if (!sectionData?.is_visible) {
                    setIsVisible(false);
                    setLoading(false);
                    return;
                }

                setIsVisible(true);

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
    }, []);

    if (loading || !isVisible || certifications.length === 0) return null;

    return (
        <section className="py-24 bg-black relative overflow-hidden">
            {/* Subtle Grid Background */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <FadeUp className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
                        <Award className="h-3 w-3" />
                        <span>Trust & Credibility</span>
                    </div>
                    <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-white">
                        Global <span className="text-gradient">Certifications</span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        We maintain the highest industry standards to deliver exceptional value and security for our partners.
                    </p>
                </FadeUp>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {certifications.map((cert, index) => (
                        <motion.div
                            key={cert.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative"
                        >
                            {/* Certificate Card Design */}
                            <div className="glass-card aspect-[1.414/1] overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] transition-all duration-500 group-hover:border-primary/50 group-hover:bg-primary/[0.03] group-hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)]">
                                {cert.certificate_image_url ? (
                                    <div className="relative w-full h-full p-3 h-full">
                                        <div className="absolute inset-2 border border-primary/20 rounded-lg pointer-events-none z-10 opactiy-50" />
                                        <img
                                            src={cert.certificate_image_url}
                                            alt={cert.title}
                                            className="w-full h-full object-cover rounded-md transform group-hover:scale-[1.02] transition-transform duration-700"
                                            loading="lazy"
                                        />
                                        {/* Overlay for depth */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>
                                ) : (
                                    <div className="w-full h-full p-8 flex flex-col items-center justify-center">
                                        <div className="relative w-20 h-20 mb-4 flex items-center justify-center filter grayscale group-hover:grayscale-0 transition-all duration-500 bg-white/5 rounded-2xl p-4">
                                            <img
                                                src={cert.logo_url}
                                                alt={cert.title}
                                                className="max-w-full max-h-full object-contain transform group-hover:scale-110 transition-transform duration-500"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 border border-white/10 rounded-2xl group-hover:border-primary/20 pointer-events-none" />
                                        </div>
                                        <Award className="h-6 w-6 text-primary/30" />
                                    </div>
                                )}
                            </div>

                            {/* Info Section below card */}
                            <div className="mt-4 px-2 space-y-1">
                                <h3 className="text-white font-bold text-sm tracking-tight line-clamp-1">{cert.title}</h3>
                                <div className="flex items-center justify-between gap-4">
                                    <p className="text-muted-foreground text-[10px] uppercase font-black tracking-widest">{cert.issuer}</p>

                                    <div className="flex gap-2">
                                        {cert.verification_link && (
                                            <a
                                                href={cert.verification_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1 rounded-md bg-white/5 text-primary hover:bg-primary hover:text-white transition-all duration-300"
                                                title="Verify"
                                            >
                                                <ShieldCheck className="h-3 w-3" />
                                            </a>
                                        )}
                                        {cert.certificate_image_url && (
                                            <button
                                                onClick={() => setSelectedCert(cert)}
                                                className="p-1 rounded-md bg-white/5 text-white/40 hover:bg-white hover:text-black transition-all duration-300"
                                                title="Full View"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Certificate Modal */}
            <AnimatePresence>
                {selectedCert && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                            onClick={() => setSelectedCert(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-5xl aspect-[1.414/1] bg-white/5 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                        >
                            <img
                                src={selectedCert.certificate_image_url}
                                alt={`Certificate for ${selectedCert.title}`}
                                className="w-full h-full object-contain"
                            />
                            <button
                                onClick={() => setSelectedCert(null)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-white hover:text-black transition-all"
                            >
                                <X className="h-6 w-6" />
                            </button>

                            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                <h3 className="text-xl font-bold text-white">{selectedCert.title}</h3>
                                <p className="text-white/60 text-sm">{selectedCert.issuer}</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Bottom Glow */}
            <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        </section>
    );
};
