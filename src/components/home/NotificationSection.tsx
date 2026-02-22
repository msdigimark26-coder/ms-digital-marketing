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
            <div className="fixed top-1/2 -translate-y-1/2 right-6 z-[9999] max-w-[320px] md:max-w-[420px] pointer-events-none">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentNotif.id}
                        initial={{ opacity: 0, x: 40, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, x: 40, transition: { duration: 0.2 } }}
                        onClick={handleViewDetails}
                        className="relative group pointer-events-auto cursor-pointer will-change-[transform,opacity]"
                    >
                        {/* Apple-style Glass Container */}
                        <div className="relative overflow-hidden bg-[#1a1a24]/70 backdrop-blur-2xl border border-white/20 rounded-[2rem] shadow-[0_15px_35px_rgba(0,0,0,0.4)] p-4 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]">
                            <div className="flex gap-4 items-start">
                                {/* iOS Icon Style */}
                                <div className="relative flex-shrink-0">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border border-white/10 overflow-hidden shadow-lg">
                                        {currentNotif.image ? (
                                            <img src={currentNotif.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Bell className="h-6 w-6 text-white" />
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col pt-0.5">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <h4 className="text-sm md:text-base font-bold text-white truncate pr-2">
                                            {currentNotif.title}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                                {formatRelativeTime(currentNotif.timestamp)}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={toggleMute}
                                                    className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                                                >
                                                    {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                                                </button>
                                                <button
                                                    onClick={dismiss}
                                                    className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-[12px] md:text-[14px] text-slate-300 line-clamp-2 leading-snug">
                                        {currentNotif.message}
                                    </p>
                                </div>
                            </div>
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
