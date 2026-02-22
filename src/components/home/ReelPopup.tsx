import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, VolumeX, Maximize2, Minimize2, ChevronRight, ChevronUp, ChevronDown, Bell, Play, Pause } from "lucide-react";
import { reelsSupabase as supabase } from "@/integrations/supabase/reels-client";
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
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [direction, setDirection] = useState(0);
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
        setIsFullScreen(false);
        setTimeout(() => setIsDismissed(true), 500);
    };

    const toggleFullScreen = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFullScreen(!isFullScreen);
        if (!isFullScreen && isMuted) {
            setIsMuted(false);
            if (videoRef.current) videoRef.current.muted = false;
        }
        setIsPaused(false);
    };

    const togglePlayPause = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIsPaused(!isPaused);
    };

    const nextReel = useCallback(() => {
        if (reels.length > 1) {
            setDirection(1);
            setCurrentIndex(prev => (prev < reels.length - 1 ? prev + 1 : 0));
            setIsPaused(false);
        }
    }, [reels.length]);

    const prevReel = useCallback(() => {
        if (reels.length > 1) {
            setDirection(-1);
            setCurrentIndex(prev => (prev > 0 ? prev - 1 : reels.length - 1));
            setIsPaused(false);
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
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isFullScreen) {
                if (e.key === 'Escape') setIsFullScreen(false);
                if (e.key === 'ArrowDown') nextReel();
                if (e.key === 'ArrowUp') prevReel();
            }
        };

        const container = containerRef.current;
        if (container && !isFullScreen) container.addEventListener('wheel', handleWheel, { passive: false });
        if (isFullScreen) window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            container?.removeEventListener('wheel', handleWheel);
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isVisible, isMinimized, isDismissed, isFullScreen, reels.length, nextReel, prevReel]);

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (videoRef.current) videoRef.current.muted = !isMuted;
    };

    useEffect(() => {
        if (videoRef.current) {
            if (isPaused) videoRef.current.pause();
            else videoRef.current.play().catch(() => { });
        }
    }, [isPaused, currentIndex]);

    if (!sectionKey || isDismissed || reels.length === 0 || isAutoHidden || !reels[currentIndex]) return null;

    const currentReel = reels[currentIndex];
    const isLandscape = currentReel.aspect_ratio === '16:9';

    return (
        <AnimatePresence>
            {isVisible && !isFullScreen && (
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
                                <button onClick={toggleFullScreen} className="h-6 w-6 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:bg-black/60 transition-all shadow-lg">
                                    <Maximize2 className="h-3.5 w-3.5" />
                                </button>
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

            {/* Immersive Full Screen Overlay */}
            <AnimatePresence>
                {isFullScreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] bg-black flex items-center justify-center overflow-hidden"
                    >
                        {/* Background Blur Effect */}
                        <div className="absolute inset-0 opacity-40 blur-3xl pointer-events-none overflow-hidden">
                            <video
                                src={currentReel.video_url}
                                className="w-full h-full object-cover scale-150"
                                autoPlay
                                loop
                                muted
                                playsInline
                            />
                        </div>

                        <div className="relative w-full h-full max-w-[500px] flex flex-col justify-center items-center">
                            {/* Video Container */}
                            <motion.div
                                drag="y"
                                dragConstraints={{ top: 0, bottom: 0 }}
                                dragElastic={0.15}
                                onDragEnd={(_, info) => {
                                    if (info.offset.y < -60) nextReel();
                                    if (info.offset.y > 60) prevReel();
                                }}
                                className={`relative w-full h-full md:h-[90vh] md:rounded-2xl overflow-hidden shadow-2xl bg-black ${isLandscape ? 'aspect-video' : 'aspect-[9/16]'}`}
                            >
                                <AnimatePresence mode="wait" custom={direction}>
                                    <motion.div
                                        key={currentReel.id}
                                        custom={direction}
                                        initial={{ y: direction * 400, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: direction * -400, opacity: 0 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 30,
                                            opacity: { duration: 0.2 }
                                        }}
                                        className="w-full h-full"
                                    >
                                        <video
                                            key={`fs-${currentReel.id}`}
                                            ref={videoRef}
                                            src={currentReel.video_url}
                                            className="w-full h-full object-contain cursor-pointer"
                                            autoPlay
                                            loop={reels.length === 1}
                                            muted={isMuted}
                                            playsInline
                                            onEnded={() => reels.length > 1 && nextReel()}
                                            onClick={togglePlayPause}
                                        />
                                        <AnimatePresence>
                                            {isPaused && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.5 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 1.5 }}
                                                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                                >
                                                    <div className="h-20 w-20 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl">
                                                        <Pause className="h-10 w-10 text-white fill-white" />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Controls Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

                                <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-50 pointer-events-auto">
                                    <div className="bg-black/20 backdrop-blur-xl border border-white/20 p-2.5 rounded-2xl flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                                            <Bell className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none">MS DIGIMARK</p>
                                            <p className="text-white text-xs font-medium">Official Account</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsFullScreen(false)}
                                        className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-rose-500 transition-all shadow-xl group"
                                    >
                                        <X className="h-5 w-5 md:h-6 md:w-6 group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>

                                {/* Right Side Interaction Stack */}
                                <div className="absolute right-4 bottom-32 flex flex-col gap-6 z-50 pointer-events-auto">
                                    <button onClick={toggleMute} className="flex flex-col items-center gap-1 group">
                                        <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white group-hover:bg-white/20 transition-all shadow-lg active:scale-90">
                                            {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                                        </div>
                                        <span className="text-[10px] font-bold text-white/80 uppercase tracking-tighter shadow-sm">{isMuted ? 'Muted' : 'Unmuted'}</span>
                                    </button>

                                    <button onClick={togglePlayPause} className="flex flex-col items-center gap-1 group">
                                        <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white group-hover:bg-white/20 transition-all shadow-lg active:scale-90">
                                            {isPaused ? <Play className="h-6 w-6 fill-white" /> : <Pause className="h-6 w-6 fill-white" />}
                                        </div>
                                        <span className="text-[10px] font-bold text-white/80 uppercase tracking-tighter shadow-sm">{isPaused ? 'Resume' : 'Pause'}</span>
                                    </button>

                                    <div className="flex flex-col items-center gap-4 py-6 px-1 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
                                        <button onClick={prevReel} className="h-8 w-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
                                            <ChevronUp className="h-6 w-6" />
                                        </button>
                                        <div className="flex flex-col gap-2">
                                            {reels.map((_, i) => (
                                                <div
                                                    key={i}
                                                    onClick={() => setCurrentIndex(i)}
                                                    className={`w-1 rounded-full cursor-pointer transition-all duration-300 ${i === currentIndex ? 'h-6 bg-primary shadow-[0_0_12px_rgba(168,85,247,0.8)]' : 'h-2 bg-white/20 hover:bg-white/40'}`}
                                                />
                                            ))}
                                        </div>
                                        <button onClick={nextReel} className="h-8 w-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
                                            <ChevronDown className="h-6 w-6" />
                                        </button>
                                    </div>
                                </div>

                                {/* Title & Progress Bar - Bottom */}
                                <div className="absolute bottom-10 left-6 right-20 z-40 pointer-events-none">
                                    <motion.h4
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        key={currentReel.id + '-title'}
                                        className="text-white font-extrabold text-lg md:text-xl mb-3 leading-tight drop-shadow-lg"
                                    >
                                        {currentReel.title}
                                    </motion.h4>
                                    <div className="flex gap-1.5 h-1 md:h-1.5">
                                        {reels.map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className={`h-full flex-1 rounded-full transition-all duration-500 overflow-hidden ${i === currentIndex ? 'bg-primary shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-white/20'}`}
                                            >
                                                {i === currentIndex && (
                                                    <motion.div
                                                        initial={{ scaleX: 0 }}
                                                        animate={{ scaleX: 1 }}
                                                        transition={{ duration: 2.5, ease: "linear" }}
                                                        className="h-full bg-white origin-left"
                                                    />
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AnimatePresence>
    );
};
