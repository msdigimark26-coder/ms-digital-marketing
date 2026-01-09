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

            const dismissedIds = JSON.parse(localStorage.getItem("msdigimark_dismissed_notifications_v2") || "[]");

            const filtered = (data || [])
                .filter(n => !dismissedIds.includes(n.id))
                .map(n => ({
                    id: n.id,
                    title: n.title,
                    message: n.message,
                    image: n.image || undefined,
                    timestamp: n.created_at ? new Date(n.created_at).getTime() : Date.now()
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
        const dismissedIds = JSON.parse(localStorage.getItem("msdigimark_dismissed_notifications_v2") || "[]");
        dismissedIds.push(currentNotif.id);
        localStorage.setItem("msdigimark_dismissed_notifications_v2", JSON.stringify(dismissedIds));

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

    return (
        <>
            <div className="fixed bottom-24 right-4 z-[9999] max-w-sm w-full pointer-events-none">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentNotif.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.9 }}
                        onClick={handleViewDetails}
                        className="bg-[#1a1625] p-4 relative overflow-hidden group border border-white/10 rounded-xl shadow-lg pointer-events-auto cursor-pointer hover:border-purple-500/50 transition-all active:scale-[0.98]"
                    >
                        {/* Control Buttons Container */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={toggleMute}
                                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            >
                                {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                            </button>
                            <button
                                onClick={dismiss}
                                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>

                        <div className="flex gap-4">
                            {currentNotif.image && (
                                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 bg-black/20">
                                    <img
                                        src={currentNotif.image}
                                        alt="Notification"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="flex-1 min-w-0 pr-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <Bell className="h-3.5 w-3.5 text-purple-400" />
                                    <h4 className="font-semibold text-sm text-white truncate">{currentNotif.title}</h4>
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                    {currentNotif.message}
                                </p>
                                <div className="mt-2 flex items-center gap-1 text-[10px] text-purple-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span>Read more</span>
                                    <ExternalLink className="h-2.5 w-2.5" />
                                </div>
                            </div>
                        </div>

                        {notifications.length > 1 && !isDetailsOpen && (
                            <div className="absolute bottom-0 left-0 h-0.5 bg-white/10 w-full overflow-hidden rounded-b-xl">
                                <motion.div
                                    key={`progress-${currentNotif.id}`}
                                    initial={{ x: "-100%" }}
                                    animate={{ x: "0%" }}
                                    transition={{ duration: 5, ease: "linear" }}
                                    className="h-full bg-purple-500"
                                />
                            </div>
                        )}
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
