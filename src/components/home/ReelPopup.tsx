import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, VolumeX, Maximize2, Minimize2, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

interface Reel {
    id: string;
    title: string;
    video_url: string;
    aspect_ratio: '9:16' | '16:9';
    page_section: string[];
    is_active: boolean;
}

export const ReelPopup = () => {
    const [reels, setReels] = useState<Reel[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isDismissed, setIsDismissed] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isAutoHidden, setIsAutoHidden] = useState(false);
    const [dragY, setDragY] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const location = useLocation();

    // Mapping of URLs to specific reel categories
    const sectionKey = useMemo(() => {
        const path = location.pathname;
        if (path === '/') return 'home';
        if (path.includes('web-design')) return 'web-design';
        if (path.includes('seo-services')) return 'seo';
        if (path.includes('meta-ads')) return 'meta-ads';
        if (path.includes('google-ads')) return 'google-ads';
        if (path.includes('video-photo-editing')) return 'video-editing';
        if (path.includes('3d-modeling')) return '3d-modeling';
        return null;
    }, [location.pathname]);

    // Precise scroll triggers as requested by USER
    const triggers = useMemo(() => ({
        'home': { show: 'Do Best', hide: 'Trust Us' },
        'web-design': { show: 'What We Deliver', hide: 'Our Process' },
        'seo': { show: 'The SEO Journey', hide: 'SEO Arsenal' },
        'meta-ads': { show: 'Andromeda Algorithm', hide: 'Ad Formats We Master' },
        'google-ads': { show: 'Campaign Types', hide: 'Management Process' },
        'video-editing': { show: 'What We Deliver', hide: 'Raw to Remarkable' },
        '3d-modeling': { show: 'What We Create', hide: 'Industry Application' }
    }), []);

    const fetchActiveReels = useCallback(async () => {
        if (!sectionKey) {
            setReels([]);
            return;
        }

        try {
            const { data, error } = await supabase
                .from("reels")
                .select("*")
                .eq("is_active", true)
                .contains("page_section", [sectionKey])
                .order("created_at", { ascending: false });

            if (data && !error) {
                setReels(data);
            } else {
                setReels([]);
            }
            setCurrentIndex(0);
        } catch (err) {
            console.error("Error fetching reels:", err);
            setReels([]);
        }
    }, [sectionKey]);

    useEffect(() => {
        // Reset state on page/section change
        setIsVisible(false);
        setIsDismissed(false);
        setIsAutoHidden(false);
        setReels([]);
        fetchActiveReels();

        if (!sectionKey) return;

        let startNode: Element | null = null;
        let endNode: Element | null = null;
        const currentTrigger = (triggers as any)[sectionKey];

        if (currentTrigger) {
            const startText = currentTrigger.show.toLowerCase();
            const endText = currentTrigger.hide.toLowerCase();
            const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, span, p'));
            startNode = elements.find(el => el.textContent?.toLowerCase().trim().includes(startText)) || null;
            endNode = elements.find(el => el.textContent?.toLowerCase().trim().includes(endText)) || null;
        }

        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    // LOGIC FOR SHOWING (STARTS AT SECTION)
                    if (startNode) {
                        const rect = startNode.getBoundingClientRect();
                        if (rect.top < window.innerHeight * 0.85) {
                            setIsVisible(true);
                        } else {
                            setIsVisible(false);
                        }
                    } else if (sectionKey === 'home' && window.scrollY > 800) {
                        setIsVisible(true);
                    }

                    // LOGIC FOR HIDING (HIDES AFTER WE PASS SECTION)
                    if (endNode) {
                        const rect = endNode.getBoundingClientRect();
                        if (rect.top < -50) {
                            setIsAutoHidden(true);
                        } else {
                            setIsAutoHidden(false);
                        }
                    } else {
                        if (window.scrollY > 5000) setIsAutoHidden(true);
                        else setIsAutoHidden(false);
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        // Delay to allow DOM rendering for first check
        const initTimer = setTimeout(handleScroll, 800);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(initTimer);
        };
    }, [fetchActiveReels, sectionKey, triggers]);

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(() => setIsDismissed(true), 500);
    };

    const nextReel = useCallback(() => {
        if (reels.length > 1) {
            setCurrentIndex(prev => (prev < reels.length - 1 ? prev + 1 : 0));
        }
    }, [reels.length]);

    const prevReel = useCallback(() => {
        if (reels.length > 1) {
            setCurrentIndex(prev => (prev > 0 ? prev - 1 : reels.length - 1));
        }
    }, [reels.length]);

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (isVisible && !isMinimized && !isDismissed && reels.length > 1) {
                if (Math.abs(e.deltaY) > 50) {
                    if (e.deltaY > 0) nextReel();
                    else prevReel();
                    e.preventDefault();
                }
            }
        };
        const container = containerRef.current;
        if (container) container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container?.removeEventListener('wheel', handleWheel);
    }, [isVisible, isMinimized, isDismissed, reels.length, nextReel, prevReel]);

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (videoRef.current) videoRef.current.muted = !isMuted;
    };

    if (!sectionKey || isDismissed || reels.length === 0 || isAutoHidden || !reels[currentIndex]) return null;

    const currentReel = reels[currentIndex];
    const isLandscape = currentReel.aspect_ratio === '16:9';

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ x: -400, opacity: 0 }}
                    animate={{
                        x: isMinimized ? -180 : 0,
                        opacity: 1,
                        scale: isMinimized ? 0.6 : 1
                    }}
                    exit={{ x: -400, opacity: 0 }}
                    drag="x"
                    dragConstraints={{ left: -400, right: isMinimized ? 120 : 0 }}
                    dragElastic={0.05}
                    onDragEnd={(_, info) => {
                        if (info.offset.x < -60) handleDismiss();
                        if (isMinimized && info.offset.x > 30) setIsMinimized(false);
                    }}
                    className={`fixed bottom-24 left-4 z-[99] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isLandscape ? 'w-[200px] md:w-[280px]' : 'w-[120px] md:w-[160px]'}`}
                >
                    <div
                        ref={containerRef}
                        className={`group relative rounded-[1.5rem] overflow-hidden shadow-[0_20px_50px_-10px_rgba(0,0,0,0.6)] border border-white/10 bg-black/90 backdrop-blur-2xl ${isLandscape ? 'aspect-[16/9]' : 'aspect-[9/16]'}`}
                    >
                        <motion.div
                            drag="y"
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={0.1}
                            onDrag={(_, info) => setDragY(info.offset.y)}
                            onDragEnd={(_, info) => {
                                setDragY(0);
                                if (info.offset.y < -40) nextReel();
                                if (info.offset.y > 40) prevReel();
                            }}
                            className="w-full h-full relative"
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentReel.id}
                                    initial={{ y: dragY > 0 ? -120 : 120, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: dragY > 0 ? 120 : -120, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 450, damping: 45 }}
                                    className="w-full h-full absolute inset-0"
                                >
                                    <video
                                        ref={videoRef}
                                        src={currentReel.video_url}
                                        className="w-full h-full object-cover pointer-events-none"
                                        autoPlay
                                        loop={reels.length === 1}
                                        muted={isMuted}
                                        playsInline
                                        onEnded={() => reels.length > 1 && nextReel()}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                        <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-center z-50">
                            <button onClick={toggleMute} className="h-6 w-6 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:bg-black/60 transition-all">
                                {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                            </button>
                            <div className="flex gap-1">
                                <button onClick={() => setIsMinimized(!isMinimized)} className="h-6 w-6 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:bg-black/60 transition-all">
                                    {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                                </button>
                                <button onClick={handleDismiss} className="h-6 w-6 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:bg-rose-500 transition-all">
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        </div>

                        {reels.length > 1 && (
                            <div className="absolute right-2 inset-y-0 flex flex-col justify-center gap-1.5 z-40">
                                {reels.map((_, i) => (
                                    <div key={i} onClick={() => setCurrentIndex(i)} className={`w-0.5 transition-all duration-300 rounded-full cursor-pointer ${i === currentIndex ? 'h-4 bg-primary shadow-[0_0_8px_rgba(168,85,247,0.6)]' : 'h-1.5 bg-white/20'}`} />
                                ))}
                            </div>
                        )}

                        <div className="absolute bottom-2.5 left-2.5 right-8 z-40 pointer-events-none">
                            <h4 className="text-white font-bold text-[8px] md:text-[10px] mb-0.5 line-clamp-1 opacity-90">{currentReel.title}</h4>
                            <div className="flex gap-0.5">
                                {reels.map((_, i) => (
                                    <div key={i} className={`h-[1.5px] flex-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-primary' : 'bg-white/10'}`} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {isMinimized && (
                        <motion.div
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -right-5 top-1/2 -translate-y-1/2 h-7 w-7 bg-primary rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer z-[100]"
                            onClick={() => setIsMinimized(false)}
                        >
                            <ChevronRight className="h-3.5 w-3.5" />
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};
