// Messages Section Component
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, Paperclip, X, FileText, Image as ImageIcon, MessageSquare, Mic, Square, Trash2, Play, Pause, Palette, ChevronRight, MoreVertical, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { logActivity } from "@/utils/auditLogger";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
    file_url?: string;
    file_type?: string;
    file_name?: string;
    portal_users: {
        username: string;
        avatar_url: string | null;
    } | null;
}

// iPhone-style "Tri-tone" or similar pleasant notification
const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3";

interface Theme {
    name: string;
    main: string;
    hover: string;
    bubble: string;
    bubbleOther: string;
    glow: string;
    glowSecondary: string;
    accent: string;
    border: string;
    bg: string;
    inputBg: string;
    avatar: string;
    shadow: string;
    text: string;
    textMuted: string;
    isLight?: boolean;
    bgImage?: string;
    bgVideo?: string;
}

const THEMES: Record<string, Theme> = {
    cyberpunk: {
        name: "Cyberpunk",
        main: "from-purple-500 to-indigo-600",
        hover: "hover:from-purple-600 hover:to-indigo-700",
        bubble: "from-purple-600 to-indigo-700",
        bubbleOther: "bg-white/5 text-slate-200 border-white/10",
        glow: "bg-purple-600/10",
        glowSecondary: "bg-blue-600/10",
        accent: "text-purple-400",
        border: "border-purple-500/30",
        bg: "bg-[#0A051A]/40",
        inputBg: "bg-[#130B24]",
        avatar: "from-purple-500 to-indigo-600",
        shadow: "shadow-purple-500/20",
        text: "text-white",
        textMuted: "text-slate-400"
    },
    midnight: {
        name: "Midnight",
        main: "from-blue-600 to-slate-800",
        hover: "hover:from-blue-700 hover:to-slate-900",
        bubble: "from-blue-700 to-slate-900",
        bubbleOther: "bg-white/5 text-slate-200 border-white/10",
        glow: "bg-blue-600/10",
        glowSecondary: "bg-indigo-600/10",
        accent: "text-blue-400",
        border: "border-blue-500/30",
        bg: "bg-[#020617]/40",
        inputBg: "bg-[#0F172A]",
        avatar: "from-blue-500 to-slate-700",
        shadow: "shadow-blue-500/20",
        text: "text-white",
        textMuted: "text-slate-400"
    },
    emerald: {
        name: "Emerald",
        main: "from-emerald-500 to-teal-700",
        hover: "hover:from-emerald-600 hover:to-teal-800",
        bubble: "from-emerald-600 to-teal-800",
        bubbleOther: "bg-white/5 text-slate-200 border-white/10",
        glow: "bg-emerald-600/10",
        glowSecondary: "bg-cyan-600/10",
        accent: "text-emerald-400",
        border: "border-emerald-500/30",
        bg: "bg-[#061A11]/40",
        inputBg: "bg-[#0B241C]",
        avatar: "from-emerald-500 to-teal-600",
        shadow: "shadow-emerald-500/20",
        text: "text-white",
        textMuted: "text-slate-400"
    },
    sunset: {
        name: "Sunset",
        main: "from-orange-500 to-rose-600",
        hover: "hover:from-orange-600 hover:to-rose-700",
        bubble: "from-orange-600 to-rose-700",
        bubbleOther: "bg-white/5 text-slate-200 border-white/10",
        glow: "bg-rose-600/10",
        glowSecondary: "bg-orange-600/10",
        accent: "text-rose-400",
        border: "border-rose-500/30",
        bg: "bg-[#1A0505]/40",
        inputBg: "bg-[#240B0B]",
        avatar: "from-orange-500 to-rose-600",
        shadow: "shadow-rose-500/20",
        text: "text-white",
        textMuted: "text-slate-400"
    },
    light: {
        name: "Minimal White",
        main: "from-indigo-500 to-blue-600",
        hover: "hover:from-indigo-600 hover:to-blue-700",
        bubble: "from-indigo-600 to-blue-700",
        bubbleOther: "bg-slate-100 text-slate-800 border-slate-200",
        glow: "bg-indigo-500/5",
        glowSecondary: "bg-blue-500/5",
        accent: "text-indigo-600",
        border: "border-slate-200",
        bg: "bg-white",
        inputBg: "bg-slate-50",
        avatar: "from-indigo-400 to-blue-500",
        shadow: "shadow-indigo-500/10",
        text: "text-slate-900",
        textMuted: "text-slate-500",
        isLight: true
    },
    photo: {
        name: "Cosmic Photo",
        main: "from-cyan-500 to-blue-600",
        hover: "hover:from-cyan-600 hover:to-blue-700",
        bubble: "from-cyan-600/80 to-blue-700/80",
        bubbleOther: "bg-black/30 text-white border-white/10 backdrop-blur-md",
        glow: "bg-cyan-500/10",
        glowSecondary: "bg-blue-500/10",
        accent: "text-cyan-400",
        border: "border-white/10",
        bg: "bg-black/60",
        inputBg: "bg-black/40",
        avatar: "from-cyan-400 to-blue-500",
        shadow: "shadow-cyan-500/20",
        text: "text-white",
        textMuted: "text-slate-300",
        bgImage: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&q=80&w=1974"
    },
    photo2: {
        name: "Deep Forest",
        main: "from-emerald-600 to-green-700",
        hover: "hover:from-emerald-700 hover:to-green-800",
        bubble: "from-emerald-600/80 to-green-700/80",
        bubbleOther: "bg-black/20 text-white border-white/10 backdrop-blur-md",
        glow: "bg-emerald-500/10",
        glowSecondary: "bg-green-500/10",
        accent: "text-emerald-300",
        border: "border-white/10",
        bg: "bg-black/40",
        inputBg: "bg-black/30",
        avatar: "from-emerald-500 to-green-600",
        shadow: "shadow-emerald-500/20",
        text: "text-white",
        textMuted: "text-slate-300",
        bgImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2560"
    },
    photo3: {
        name: "Neon City",
        main: "from-fuchsia-500 to-purple-800",
        hover: "hover:from-fuchsia-600 hover:to-purple-900",
        bubble: "from-fuchsia-600/80 to-purple-800/80",
        bubbleOther: "bg-black/30 text-white border-white/10 backdrop-blur-md",
        glow: "bg-fuchsia-500/10",
        glowSecondary: "bg-purple-500/10",
        accent: "text-fuchsia-300",
        border: "border-white/10",
        bg: "bg-black/50",
        inputBg: "bg-black/40",
        avatar: "from-fuchsia-400 to-purple-600",
        shadow: "shadow-fuchsia-500/20",
        text: "text-white",
        textMuted: "text-slate-300",
        bgImage: "https://images.unsplash.com/photo-1449156006079-4781ca293108?auto=format&fit=crop&q=80&w=2560"
    },
    photo4: {
        name: "Tropical Bay",
        main: "from-sky-400 to-blue-600",
        hover: "hover:from-sky-500 hover:to-blue-700",
        bubble: "from-sky-500/80 to-blue-600/80",
        bubbleOther: "bg-black/20 text-white border-white/10 backdrop-blur-md",
        glow: "bg-sky-400/10",
        glowSecondary: "bg-blue-400/10",
        accent: "text-sky-300",
        border: "border-white/10",
        bg: "bg-black/30",
        inputBg: "bg-black/20",
        avatar: "from-sky-400 to-blue-500",
        shadow: "shadow-sky-500/20",
        text: "text-white",
        textMuted: "text-slate-200",
        bgImage: "https://images.unsplash.com/photo-1505118380757-91f5f45d8de8?auto=format&fit=crop&q=80&w=2560"
    },
    photo5: {
        name: "Arctic Peak",
        main: "from-zinc-100 to-slate-400",
        hover: "hover:from-white hover:to-slate-500",
        bubble: "from-white/20 to-slate-400/20",
        bubbleOther: "bg-black/10 text-white border-white/20 backdrop-blur-xl",
        glow: "bg-white/10",
        glowSecondary: "bg-slate-300/10",
        accent: "text-white shadow-sm",
        border: "border-white/20",
        bg: "bg-black/20",
        inputBg: "bg-black/10",
        avatar: "from-white to-slate-300",
        shadow: "shadow-white/20",
        text: "text-white",
        textMuted: "text-slate-100",
        bgImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2560"
    },
    anime1: {
        name: "Neo Tokyo (Live)",
        main: "from-violet-500 to-magenta-600",
        hover: "hover:from-violet-600 hover:to-magenta-700",
        bubble: "from-violet-600/80 to-magenta-700/80",
        bubbleOther: "bg-black/40 text-white border-white/10 backdrop-blur-xl",
        glow: "bg-violet-500/20",
        glowSecondary: "bg-magenta-500/20",
        accent: "text-violet-400",
        border: "border-white/10",
        bg: "bg-black/60",
        inputBg: "bg-black/40",
        avatar: "from-violet-400 to-magenta-500",
        shadow: "shadow-violet-500/20",
        text: "text-white",
        textMuted: "text-slate-300",
        bgVideo: "https://cdn.pixabay.com/video/2023/10/21/185934-877239109_large.mp4",
        bgImage: "https://images.unsplash.com/photo-1578632738908-48c104e8d67c?auto=format&fit=crop&q=80&w=2000"
    },
    anime2: {
        name: "Lofi Dream (Live)",
        main: "from-orange-400 to-purple-600",
        hover: "hover:from-orange-500 hover:to-purple-700",
        bubble: "from-orange-500/70 to-purple-600/70",
        bubbleOther: "bg-black/30 text-white border-white/10 backdrop-blur-xl",
        glow: "bg-orange-400/20",
        glowSecondary: "bg-purple-400/20",
        accent: "text-orange-300",
        border: "border-white/10",
        bg: "bg-black/50",
        inputBg: "bg-black/40",
        avatar: "from-orange-400 to-purple-500",
        shadow: "shadow-orange-500/20",
        text: "text-white",
        textMuted: "text-slate-300",
        bgVideo: "https://cdn.pixabay.com/video/2022/10/24/136113-763445353_large.mp4",
        bgImage: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=2000"
    }
};

export const MessagesSection = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const { user: authUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [adminSession, setAdminSession] = useState<any>(null);
    const [attachment, setAttachment] = useState<File | null>(null);
    const [activeTheme, setActiveTheme] = useState<keyof typeof THEMES>(() => {
        const saved = localStorage.getItem("ms-chat-theme");
        return (saved && saved in THEMES) ? (saved as keyof typeof THEMES) : "cyberpunk";
    });
    const theme = THEMES[activeTheme];
    const [showThemeMenu, setShowThemeMenu] = useState(false);

    useEffect(() => {
        localStorage.setItem("ms-chat-theme", activeTheme);
    }, [activeTheme]);
    const [showScrollBottom, setShowScrollBottom] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
        setShowScrollBottom(!isNearBottom);
    };

    // Message Interaction States
    const [deletedMessageIds, setDeletedMessageIds] = useState<string[]>(() => {
        const saved = localStorage.getItem("ms-deleted-messages");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem("ms-deleted-messages", JSON.stringify(deletedMessageIds));
    }, [deletedMessageIds]);

    const handleDeleteForMe = (id: string) => {
        setDeletedMessageIds(prev => [...prev, id]);
        toast.success("Message hidden for you");
    };

    const handleDeleteForEveryone = async (id: string) => {
        try {
            // 1. Get message details to check for files
            const { data: msg } = await supabase
                .from("admin_messages")
                .select("file_url")
                .eq("id", id)
                .single();

            if (msg?.file_url) {
                const fileName = msg.file_url.split('/').pop();
                if (fileName) {
                    await supabase.storage
                        .from('chat_attachments')
                        .remove([fileName]);
                }
            }

            // 2. Delete message from DB
            const { error } = await supabase
                .from("admin_messages")
                .delete()
                .eq("id", id);

            if (error) throw error;

            // Log message deletion
            logActivity({
                adminName: authUser?.user_metadata?.full_name || authUser?.email || "Admin",
                adminEmail: authUser?.email || "Unknown",
                actionType: 'delete',
                targetType: 'admin_message',
                targetId: id,
                description: `Deleted an administrative message (ID: ${id})`
            });

            toast.success("Message deleted for everyone");
            await fetchMessages(); // Proactive fetch
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete message");
        }
    };

    const handleClearAllMessages = async () => {
        if (!window.confirm("CRITICAL: This will PERMANENTLY delete ALL messages and stored attachments. Proceed?")) return;

        try {
            setIsLoading(true);

            // 1. Clear local state immediately for instant UI feedback
            setMessages([]);
            setDeletedMessageIds([]);
            localStorage.removeItem("ms-deleted-messages");

            // 2. Fetch files to clear storage
            const { data: messagesWithFiles } = await supabase
                .from("admin_messages")
                .select("file_url")
                .not("file_url", "is", null);

            if (messagesWithFiles && messagesWithFiles.length > 0) {
                const filePaths = messagesWithFiles
                    .map(m => m.file_url?.split('/').pop())
                    .filter(Boolean) as string[];

                if (filePaths.length > 0) {
                    await supabase.storage
                        .from('chat_attachments')
                        .remove(filePaths);
                }
            }

            // 3. Wipe DB using a broad filter
            // .neq('sender_id', '00000000-0000-0000-0000-000000000000') is usually safer
            // Or use .not('id', 'is', null) which is the standard Supabase "delete all"
            const { error: dbError } = await supabase
                .from("admin_messages")
                .delete()
                .not("id", "is", null);

            if (dbError) throw dbError;

            // Log system wipe
            logActivity({
                adminName: authUser?.user_metadata?.full_name || authUser?.email || "Admin",
                adminEmail: authUser?.email || "Unknown",
                actionType: 'delete',
                targetType: 'admin_messages_full_wipe',
                description: `PERFORMED A FULL SYSTEM WIPE OF ALL ADMINISTRATIVE MESSAGES`
            });

            toast.success("SYSTEM WIPE COMPLETE - All data destroyed");
        } catch (err) {
            console.error(err);
            toast.error("Full wipe failed - Check console for details");
            // Reload if it fails to restore valid state
            fetchMessages();
        } finally {
            setIsLoading(false);
        }
    };

    // Filter messages for local deletion
    const visibleMessages = messages.filter(m => !deletedMessageIds.includes(m.id));

    // Voice Recording States
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Init Audio
        audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
        if (audioRef.current) {
            audioRef.current.volume = 0.5;
        }

        const session = sessionStorage.getItem("ms-admin-session");
        if (session) {
            setAdminSession(JSON.parse(session));
        }

        cleanupOldMessages();
        fetchMessages();

        const channel = supabase
            .channel('admin_messages_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_messages' }, payload => {
                if (payload.eventType === 'INSERT') {
                    const newMsg = payload.new as Message;
                    const sessionData = sessionStorage.getItem("ms-admin-session");
                    const myId = sessionData ? JSON.parse(sessionData).id : null;

                    if (newMsg.sender_id !== myId) {
                        playSound();
                        triggerVibration();
                    }
                }
                fetchMessages();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const cleanupOldMessages = async () => {
        const { error } = await supabase.rpc('delete_old_admin_messages');
        if (error) console.error("Cleanup error:", error);
    };

    const playSound = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log("Audio play failed", e));
        }
    };

    const triggerVibration = () => {
        if (navigator.vibrate) {
            navigator.vibrate([50, 30, 50, 30, 100]);
        }
    };

    const fetchMessages = async () => {
        try {
            const { data, error } = await supabase
                .from("admin_messages")
                .select(`
                    *,
                    portal_users (
                        username,
                        avatar_url
                    )
                `)
                .order("created_at", { ascending: true });

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 20 * 1024 * 1024) {
                toast.error("File size must be under 20MB");
                return;
            }
            setAttachment(file);
        }
    };

    // Voice Recording Logic
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = async () => {
                const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                const fileName = `voice_${Date.now()}.webm`;
                const file = new File([audioBlob], fileName, { type: 'audio/webm' });

                // Automatically send after stopping
                await sendFileMessage(file);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordingDuration(0);

            recordingIntervalRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

            if (navigator.vibrate) navigator.vibrate(100);
        } catch (err) {
            console.error("Mic access denied:", err);
            toast.error("Microphone access denied");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            setIsRecording(false);
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
        }
    };

    const cancelRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.onstop = () => {
                mediaRecorder.stream.getTracks().forEach(track => track.stop());
            };
            mediaRecorder.stop();
            setIsRecording(false);
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
            toast.info("Recording cancelled");
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const sendFileMessage = async (file: File) => {
        if (!adminSession) return;
        setIsLoading(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('chat_attachments')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('chat_attachments')
                .getPublicUrl(filePath);

            const { error } = await supabase
                .from("admin_messages")
                .insert({
                    content: "",
                    sender_id: adminSession.id,
                    file_url: publicUrl,
                    file_type: file.type,
                    file_name: file.name
                });

            if (error) throw error;
        } catch (error) {
            console.error("Error sending file:", error);
            toast.error("Failed to upload recording");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !attachment)) return;
        if (!adminSession) return;

        setIsLoading(true);
        if (navigator.vibrate) navigator.vibrate(50);

        try {
            let fileData = { url: null as string | null, type: null as string | null, name: null as string | null };

            if (attachment) {
                const fileExt = attachment.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('chat_attachments')
                    .upload(filePath, attachment);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('chat_attachments')
                    .getPublicUrl(filePath);

                fileData = {
                    url: publicUrl,
                    type: attachment.type,
                    name: attachment.name
                };
            }

            const { error } = await supabase
                .from("admin_messages")
                .insert({
                    content: newMessage,
                    sender_id: adminSession.id,
                    file_url: fileData.url,
                    file_type: fileData.type,
                    file_name: fileData.name
                });

            if (error) throw error;

            // Log message sent
            logActivity({
                adminName: authUser?.user_metadata?.full_name || authUser?.email || "Admin",
                adminEmail: authUser?.email || "Unknown",
                actionType: 'create',
                targetType: 'admin_message',
                description: `Sent an administrative message${attachment ? ' with an attachment' : ''}`
            });

            setNewMessage("");
            setAttachment(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            fetchMessages();
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
        } finally {
            setIsLoading(false);
        }
    };

    const isImage = (type?: string) => type?.startsWith('image/');
    const isAudio = (type?: string) => type?.startsWith('audio/');

    const groupMessagesByDate = (messages: Message[]) => {
        const groups: { [key: string]: Message[] } = {};
        messages.forEach(msg => {
            const date = new Date(msg.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
            if (!groups[date]) groups[date] = [];
            groups[date].push(msg);
        });
        return groups;
    };

    const shouldGroup = (currentMsg: Message, previousMsg: Message | null) => {
        if (!previousMsg) return false;
        if (currentMsg.sender_id !== previousMsg.sender_id) return false;
        const timeDiff = new Date(currentMsg.created_at).getTime() - new Date(previousMsg.created_at).getTime();
        return timeDiff < 5 * 60 * 1000;
    };

    const messageGroups = groupMessagesByDate(visibleMessages);

    return (
        <div
            className={`glass-card p-0 h-[calc(100vh-140px)] flex flex-col relative overflow-hidden transition-all duration-500 ${theme.bg} ${theme.text} backdrop-blur-xl border-white/5 shadow-2xl rounded-3xl`}
        >
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Image Background with Ken Burns */}
                <AnimatePresence mode="wait">
                    {theme.bgImage && !theme.bgVideo && (
                        <motion.div
                            key={theme.bgImage}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-0"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0"
                                style={{
                                    backgroundImage: `url(${theme.bgImage})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Video Background */}
                <AnimatePresence mode="wait">
                    {theme.bgVideo && (
                        <motion.div
                            key={theme.bgVideo}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0 z-0"
                        >
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            >
                                <source src={theme.bgVideo} type="video/mp4" />
                            </video>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className={`absolute -top-24 -right-24 w-64 h-64 ${theme.glow} rounded-full blur-[100px] transition-colors duration-500 animate-pulse`} />
                <div className={`absolute -bottom-24 -left-24 w-64 h-64 ${theme.glowSecondary} rounded-full blur-[100px] transition-colors duration-500 animate-pulse`} />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
                {(theme.bgImage || theme.bgVideo) && <div className="absolute inset-0 bg-black/40 z-[1]" />}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 z-[1]" />
            </div>

            {/* Header */}
            <div className="relative z-30 flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02] backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="relative group/logo">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${theme.avatar} flex items-center justify-center shadow-lg transition-all duration-500 ${theme.shadow} overflow-hidden`}>
                            <img src="/logo-new.png" alt="Portal Logo" className="w-8 h-8 object-contain drop-shadow-md group-hover/logo:scale-110 transition-transform duration-500" />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 ${theme.isLight ? 'border-white' : 'border-slate-900'} rounded-full shadow-sm`} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className={`text-xl font-bold tracking-tight transition-colors duration-500`}>Team Hub</h2>
                            {adminSession?.role === 'superadmin' && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleClearAllMessages}
                                    className="h-8 w-8 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                    title="Wipe All Data (Superadmin)"
                                >
                                    <ShieldAlert className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <p className={`text-[10px] font-bold ${theme.textMuted} uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full transition-colors duration-500`}>Secure Sync</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Theme Switch Button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowThemeMenu(!showThemeMenu)}
                            className={`flex items-center gap-2 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all ${theme.accent} ${showThemeMenu ? 'bg-white/10 border-white/20' : ''} shadow-lg backdrop-blur-md ring-1 ring-white/5`}
                        >
                            <Palette className="h-4 w-4" />
                            <span className="text-[11px] font-black uppercase tracking-widest hidden sm:block">UI Engine</span>
                        </button>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                            {showThemeMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-[90]"
                                        onClick={() => setShowThemeMenu(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-2 z-[100]"
                                    >
                                        <div className="bg-[#0A051A]/95 border border-white/10 rounded-3xl p-4 shadow-[0_0_50px_rgba(0,0,0,0.6)] backdrop-blur-xl ring-1 ring-white/10 flex gap-4 min-w-[350px] overflow-x-auto custom-scrollbar scroll-smooth">
                                            {Object.entries(THEMES).map(([key, t]) => (
                                                <button
                                                    key={key}
                                                    onClick={() => {
                                                        setActiveTheme(key as keyof typeof THEMES);
                                                        setShowThemeMenu(false);
                                                    }}
                                                    className={`flex-none w-24 flex flex-col items-center gap-2.5 p-2.5 rounded-2xl transition-all duration-300 ${activeTheme === key
                                                        ? 'bg-white/15 ring-2 ring-white/30 shadow-2xl scale-105'
                                                        : 'hover:bg-white/10 opacity-50 hover:opacity-100 hover:scale-105'
                                                        }`}
                                                >
                                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${t.bgImage ? 'from-slate-700 to-slate-900' : t.avatar} shadow-lg relative overflow-hidden group/thumb border border-white/10`}
                                                        style={t.bgImage ? { backgroundImage: `url(${t.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                                                    >
                                                        {t.bgVideo && (
                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                                                                <Play className="h-4 w-4 text-white fill-current opacity-80" />
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
                                                    </div>
                                                    <span className={`text-[10px] font-black ${activeTheme === key ? 'text-white' : 'text-slate-400'} text-center leading-tight uppercase tracking-tighter`}>{t.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="hidden md:flex flex-col items-end">
                        <p className={`text-[10px] font-bold ${theme.accent} uppercase tracking-widest transition-colors duration-500`}>Self Destruct</p>
                        <p className="text-[11px] text-slate-500">Active • 24h cycle</p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-6 py-8 space-y-8 custom-scrollbar relative z-10 scroll-smooth"
            >
                <AnimatePresence initial={false}>
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
                                <MessageSquare className={`h-10 w-10 ${theme.accent}`} />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-lg font-semibold text-slate-400">Establish Connection</p>
                                <p className="text-sm text-slate-600">Secure link active. Start your transmission.</p>
                            </div>
                        </div>
                    )}

                    {Object.entries(messageGroups).map(([date, msgs]) => (
                        <div key={date} className="relative">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                                <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        {date}
                                    </p>
                                </div>
                                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
                            </div>

                            <div className="space-y-4">
                                {msgs.map((message, idx) => {
                                    const isMe = message.sender_id === adminSession?.id;
                                    const previousMsg = idx > 0 ? msgs[idx - 1] : null;
                                    const isGrouped = shouldGroup(message, previousMsg);

                                    return (
                                        <motion.div
                                            key={message.id}
                                            initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`flex gap-4 ${isMe ? "flex-row-reverse" : "flex-row"} ${isGrouped ? "mt-1" : "mt-6"}`}
                                        >
                                            <div className="w-10 shrink-0">
                                                {!isGrouped && (
                                                    <Avatar className="h-10 w-10 border-2 border-white/10 shadow-xl rounded-2xl">
                                                        <AvatarImage src={message.portal_users?.avatar_url || ""} />
                                                        <AvatarFallback className={`text-xs font-bold transition-all duration-500 ${isMe ? `bg-gradient-to-br ${theme.avatar} text-white` : "bg-[#1F1730] text-slate-300"}`}>
                                                            {message.portal_users?.username?.substring(0, 2).toUpperCase() || "AD"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                            </div>

                                            <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}>
                                                {!isGrouped && (
                                                    <div className={`flex items-center gap-2 mb-2 px-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                                        <span className="text-xs font-bold text-slate-200 tracking-tight">
                                                            {message.portal_users?.username || "Agent"}
                                                        </span>
                                                        <span className="text-[10px] font-medium text-slate-500 opacity-70">
                                                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                )}

                                                <div
                                                    className={`relative px-6 py-4 rounded-[2rem] text-[13.5px] leading-relaxed shadow-xl group/bubble transition-all duration-300 transform-gpu ${isMe
                                                        ? `bg-gradient-to-br ${theme.bubble} text-white selection:bg-white/30 border-t border-l border-white/10`
                                                        : `${theme.bubbleOther} border shadow-sm selection:bg-purple-500/30`
                                                        } ${isGrouped ? "rounded-[2rem]" : (isMe ? "rounded-tr-none" : "rounded-tl-none")}`}
                                                    style={{ backdropFilter: isMe ? 'none' : 'blur(8px)' }}
                                                >
                                                    {/* Message Options */}
                                                    <div className={`absolute top-2 ${isMe ? "right-full mr-2" : "left-full ml-2"} opacity-0 group-hover/bubble:opacity-100 transition-opacity`}>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/10">
                                                                    <MoreVertical className="h-4 w-4 text-slate-400" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align={isMe ? "end" : "start"} className="bg-[#1F1730] border-white/10 text-white">
                                                                <DropdownMenuItem onClick={() => handleDeleteForMe(message.id)} className="hover:bg-white/5 cursor-pointer flex gap-2">
                                                                    <X className="h-4 w-4" /> Delete for me
                                                                </DropdownMenuItem>
                                                                {(isMe || adminSession?.role === 'superadmin') && (
                                                                    <DropdownMenuItem onClick={() => handleDeleteForEveryone(message.id)} className="text-red-400 hover:bg-white/5 cursor-pointer flex gap-2">
                                                                        <Trash2 className="h-4 w-4" /> Delete for everyone
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                    {message.file_url && (
                                                        <div className="mb-3">
                                                            {isImage(message.file_type) ? (
                                                                <a
                                                                    href={message.file_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="block rounded-xl overflow-hidden border border-white/20 shadow-2xl transition-transform hover:scale-[1.02]"
                                                                >
                                                                    <img
                                                                        src={message.file_url}
                                                                        alt="Transmission Data"
                                                                        className="max-w-full max-h-[300px] object-cover"
                                                                    />
                                                                </a>
                                                            ) : isAudio(message.file_type) ? (
                                                                <div className={`p-2 rounded-xl flex items-center gap-3 ${isMe ? "bg-black/20" : "bg-white/5"} min-w-[200px]`}>
                                                                    <audio
                                                                        src={message.file_url}
                                                                        controls
                                                                        className="h-8 max-w-full custom-audio-player"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <a
                                                                    href={message.file_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={`flex items-center gap-3 p-3 rounded-xl transition-all border ${isMe
                                                                        ? "bg-black/20 border-white/10 hover:bg-black/30"
                                                                        : "bg-white/5 border-white/10 hover:bg-white/10"
                                                                        }`}
                                                                >
                                                                    <div className={`p-2 rounded-lg ${isMe ? "bg-white/10" : "bg-purple-500/20"}`}>
                                                                        <FileText className="h-4 w-4 shrink-0 text-white" />
                                                                    </div>
                                                                    <div className="flex flex-col min-w-0">
                                                                        <span className="text-xs font-bold truncate max-w-[200px]">
                                                                            {message.file_name}
                                                                        </span>
                                                                        <span className="text-[9px] opacity-60 uppercase font-black">Open Resource</span>
                                                                    </div>
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                    {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}

                                                    {/* Bubble Micro-reflection */}
                                                    {isMe && <div className="absolute top-0 left-0 right-0 h-px bg-white/20 rounded-t-2xl pointer-events-none" />}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Wrapper */}
            <div className="relative mt-auto p-6 md:p-8 bg-gradient-to-t from-[#0A051A] to-transparent">
                {/* Floating Preview */}
                <AnimatePresence>
                    {attachment && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`absolute bottom-full left-8 right-8 mb-4 bg-[#1F1730]/90 border ${theme.border} backdrop-blur-2xl rounded-2xl p-4 flex items-center justify-between shadow-2xl ring-1 ring-white/5 transition-all duration-500`}
                        >
                            <div className="flex items-center gap-4 overflow-hidden">
                                <div className="h-14 w-14 bg-black/40 rounded-xl flex items-center justify-center shrink-0 border border-white/10 overflow-hidden">
                                    {attachment.type.startsWith('image/') ? (
                                        <img src={URL.createObjectURL(attachment)} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <FileText className={`h-6 w-6 ${theme.accent}`} />
                                    )}
                                </div>
                                <div className="truncate">
                                    <p className="text-sm font-bold text-white truncate px-1">{attachment.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[10px] font-black ${theme.accent} uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md`}>Queueing</span>
                                        <p className="text-[10px] text-slate-500">{(attachment.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setAttachment(null);
                                    if (fileInputRef.current) fileInputRef.current.value = "";
                                }}
                                className="h-10 w-10 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Input Controls */}
                <form onSubmit={handleSendMessage} className="flex gap-4 items-end max-w-5xl mx-auto">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                    />

                    <AnimatePresence mode="wait">
                        {isRecording ? (
                            <motion.div
                                key="recording"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex-1 flex items-center gap-4 bg-red-500/10 border border-red-500/30 rounded-2xl px-6 py-3 backdrop-blur-md"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                    <span className="text-sm font-bold text-red-400 tracking-widest tabular-nums">
                                        {formatDuration(recordingDuration)}
                                    </span>
                                </div>
                                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-red-500/50"
                                        animate={{ width: ["0%", "100%"] }}
                                        transition={{ duration: 60, ease: "linear" }}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={cancelRecording}
                                        className="h-10 w-10 text-slate-400 hover:text-white hover:bg-white/5"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={stopRecording}
                                        className="h-10 w-10 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 active:scale-95"
                                    >
                                        <Square className="h-4 w-4 fill-current" />
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="input"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex-1 flex gap-4 items-end"
                            >
                                <div className="flex-1 group relative">
                                    <div className={`absolute inset-0 ${theme.glow} rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none`} />
                                    <div className={`relative flex items-end ${theme.inputBg} border border-white/10 focus-within:border-white/20 rounded-2xl shadow-inner transition-all duration-500 overflow-hidden ring-1 ring-white/5`}>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`h-14 w-14 rounded-r-none hover:bg-white/5 text-slate-400 hover:${theme.accent} shrink-0 transition-colors border-r border-white/5`}
                                        >
                                            <Paperclip className="h-5 w-5" />
                                        </Button>

                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage(e);
                                                }
                                            }}
                                            placeholder="Secure transmission..."
                                            className={`flex-1 bg-transparent border-none focus:ring-0 py-4 px-5 text-[14px] placeholder:text-slate-600 ${theme.isLight ? 'text-slate-900' : 'text-slate-200'} resize-none max-h-32 min-h-[56px] custom-scrollbar leading-relaxed`}
                                            rows={1}
                                        />
                                    </div>
                                </div>

                                {(!newMessage.trim() && !attachment) ? (
                                    <Button
                                        type="button"
                                        onClick={startRecording}
                                        className={`bg-white/5 hover:bg-white/10 h-14 w-14 rounded-2xl border border-white/10 ${theme.accent} transition-all duration-500 hover:scale-105 active:scale-95 group`}
                                    >
                                        <Mic className="h-6 w-6 transform group-hover:scale-110 transition-transform" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`bg-gradient-to-br ${theme.main} ${theme.hover} h-14 w-14 rounded-2xl p-0 shrink-0 shadow-lg transition-all duration-500 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 group ${theme.shadow}`}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        ) : (
                                            <div className="relative">
                                                <Send className="h-6 w-6 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                            </div>
                                        )}
                                    </Button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>

                <style>{`
                .custom-audio-player {
                    filter: invert(1) hue-rotate(180deg) brightness(1.5);
                    height: 32px;
                }
                .custom-audio-player::-webkit-media-controls-panel {
                    background-color: transparent;
                }
            `}</style>
            </div>
        </div>
    );
};

