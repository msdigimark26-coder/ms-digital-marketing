import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, ExternalLink, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export interface Notification {
    id: string;
    title: string;
    message: string;
    image?: string;
    timestamp: number;
}

export const NotificationSection = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
    const [isMuted, setIsMuted] = useState(() => {
        const saved = localStorage.getItem("msdigimark_notification_muted");
        return saved ? JSON.parse(saved) : false;
    });
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const loadNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            const dismissedStore = JSON.parse(localStorage.getItem("msdigimark_dismissed_notifications_v3") || "{}");

            const filtered = (data || [])
                .filter(n => {
                    const lastDismissedAt = dismissedStore[n.id];
                    if (!lastDismissedAt) return true;

                    // If the notification has been updated since last dismissal, show it again
                    const updatedAt = n.updated_at ? new Date(n.updated_at).getTime() : 0;
                    return updatedAt > lastDismissedAt;
                })
                .map(n => ({
                    id: n.id,
                    title: n.title,
                    message: n.message,
                    image: n.image || undefined,
                    timestamp: n.updated_at ? new Date(n.updated_at).getTime() : (n.created_at ? new Date(n.created_at).getTime() : Date.now()),
                    updatedAt: n.updated_at ? new Date(n.updated_at).getTime() : 0
                }));

            setNotifications(filtered);
        } catch (error) {
            console.error("Error loading notifications:", error);
        }
    };

    useEffect(() => {
        loadNotifications();

        // Initialize audio
        audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
        audioRef.current.volume = 0.5;

        const channel = supabase
            .channel('notifications_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
                loadNotifications();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        if (notifications.length > 0 && !isDetailsOpen) {
            const interval = setInterval(() => {
                setCurrentIndex(prev => (prev + 1) % notifications.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [notifications.length, isDetailsOpen]);

    useEffect(() => {
        if (notifications.length > 0 && !isMuted) {
            audioRef.current?.play().catch(() => {
                console.log("Audio playback was blocked or failed. User interaction might be required.");
            });
        }
    }, [currentIndex, notifications.length, isMuted]);

    if (notifications.length === 0) return null;

    const currentNotif = notifications[currentIndex];

    // Safety check - if no current notification, use the first one
    if (!currentNotif && notifications.length > 0) {
        setCurrentIndex(0);
        return null;
    }

    if (!currentNotif) return null;

    const dismiss = (e: React.MouseEvent) => {
        e.stopPropagation();
        const dismissedStore = JSON.parse(localStorage.getItem("msdigimark_dismissed_notifications_v3") || "{}");
        // Store the current update time so we know when it was dismissed
        dismissedStore[currentNotif.id] = Date.now();
        localStorage.setItem("msdigimark_dismissed_notifications_v3", JSON.stringify(dismissedStore));

        const updated = notifications.filter(n => n.id !== currentNotif.id);
        setNotifications(updated);
        if (currentIndex >= updated.length) {
            setCurrentIndex(0);
        }
    };

    const handleViewDetails = () => {
        setSelectedNotif(currentNotif);
        setIsDetailsOpen(true);
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMuted(prev => {
            const newState = !prev;
            localStorage.setItem("msdigimark_notification_muted", JSON.stringify(newState));
            return newState;
        });
    };

    const formatRelativeTime = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    return (
        <>
            <div className="fixed bottom-[130px] md:bottom-24 left-4 right-4 md:left-auto md:right-4 z-[9999] max-w-[320px] md:max-w-[380px] ml-auto mr-auto md:mr-0 pointer-events-none">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentNotif.id}
                        initial={{ opacity: 0, y: 40, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }}
                        onClick={handleViewDetails}
                        className="relative group pointer-events-auto cursor-pointer will-change-[transform,opacity]"
                    >
                        {/* Premium Glass Container */}
                        <div className="relative overflow-hidden bg-[#0d0d15]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-3 md:p-5 transition-all duration-300 hover:border-purple-500/30 active:scale-[0.98]">

                            {/* Inner Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />

                            {/* Control Buttons Container */}
                            <div className="absolute top-2 right-2 flex items-center gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={toggleMute}
                                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                                >
                                    {isMuted ? <VolumeX className="h-3 w-3 md:h-3.5 md:w-3.5" /> : <Volume2 className="h-3 w-3 md:h-3.5 md:w-3.5" />}
                                </button>
                                <button
                                    onClick={dismiss}
                                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                                >
                                    <X className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                </button>
                            </div>

                            <div className="flex gap-3 md:gap-5">
                                {/* Glowing Icon Container */}
                                <div className="relative flex-shrink-0">
                                    <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center border border-white/10 relative z-10 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 opacity-20" />
                                        {currentNotif.image ? (
                                            <img src={currentNotif.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Bell className="h-5 w-5 md:h-7 md:w-7 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                                        )}
                                    </div>
                                    {/* Pulse Ring */}
                                    <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl md:rounded-2xl blur-md opacity-20 animate-pulse" />
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="mb-0.5">
                                        <h4 className="text-sm md:text-base font-bold bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent truncate">
                                            {currentNotif.title}
                                        </h4>
                                    </div>

                                    <p className="text-[11px] md:text-sm text-slate-300 line-clamp-2 leading-tight">
                                        {currentNotif.message}
                                    </p>

                                    <div className="mt-1 md:mt-2 flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-[9px] md:text-[10px] text-purple-400 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span>Read update</span>
                                            <ExternalLink className="h-2 w-2 md:h-2.5 md:w-2.5" />
                                        </div>
                                        <span className="text-[9px] text-slate-500 font-medium">
                                            {formatRelativeTime(currentNotif.timestamp)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress bar at the bottom */}
                            {notifications.length > 1 && !isDetailsOpen && (
                                <div className="absolute bottom-0 left-0 h-[3px] bg-white/5 w-full overflow-hidden">
                                    <motion.div
                                        key={`progress-${currentNotif.id}`}
                                        initial={{ x: "-100%" }}
                                        animate={{ x: "0%" }}
                                        transition={{ duration: 5, ease: "linear" }}
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-xl bg-[#0F0A1F] border-white/10 p-0 overflow-hidden shadow-2xl">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="flex items-center gap-3 text-xl font-bold text-white">
                            {selectedNotif?.title}
                        </DialogTitle>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] uppercase tracking-wider text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">Official Update</span>
                            <span className="text-xs text-slate-500">
                                {selectedNotif?.timestamp && new Date(selectedNotif.timestamp).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                    </DialogHeader>

                    <div className="px-6 pb-6 space-y-4">
                        {/* Content First */}
                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                                {selectedNotif?.message}
                            </p>
                        </div>

                        {/* Image displayed with support for poster aspect ratios (2:3, 3:4, 4:5) */}
                        {selectedNotif?.image && (
                            <div className="relative mt-4 rounded-xl overflow-hidden border border-white/10 bg-black/20 flex justify-center">
                                <img
                                    src={selectedNotif.image}
                                    alt={selectedNotif.title}
                                    className="max-h-[60vh] w-auto h-auto object-contain shadow-lg"
                                />
                            </div>
                        )}

                        <div className="flex justify-end pt-4 border-t border-white/5">
                            <button
                                onClick={() => setIsDetailsOpen(false)}
                                className="px-6 py-2 rounded-lg bg-white/5 text-slate-300 text-sm font-medium hover:bg-white/10 transition-colors border border-white/5"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
