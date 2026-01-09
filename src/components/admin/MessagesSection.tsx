// Messages Section Component
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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

export const MessagesSection = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [attachment, setAttachment] = useState<File | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Init Audio
        audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
        if (audioRef.current) {
            audioRef.current.volume = 0.5; // 50% volume
        }

        // Get current user from storage
        const session = sessionStorage.getItem("ms-admin-session");
        if (session) {
            setCurrentUser(JSON.parse(session));
        }

        // Clean up old messages on load
        cleanupOldMessages();
        fetchMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel('admin_messages_channel')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_messages' }, payload => {
                const newMsg = payload.new as Message;

                // Play sound and vibrate if it's NOT me
                const myId = JSON.parse(sessionStorage.getItem("ms-admin-session") || '{}').id;

                if (newMsg.sender_id !== myId) {
                    playSound();
                    triggerVibration();
                }

                // Ideally fetch to get user details
                fetchMessages();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const cleanupOldMessages = async () => {
        // Call the cleanup function we defined in SQL
        const { error } = await supabase.rpc('delete_old_admin_messages');
        if (error) console.error("Cleanup error (might need SQL function):", error);
    };

    const playSound = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log("Audio play failed (interaction needed)", e));
        }
    };

    const triggerVibration = () => {
        if (navigator.vibrate) {
            // "Emotional sign" vibration pattern
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
            // toast.error("Failed to load conversation.");
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 20 * 1024 * 1024) { // 20MB
                toast.error("File size must be under 20MB");
                return;
            }
            setAttachment(file);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !attachment)) return;

        if (!currentUser) {
            toast.error("You must be logged in to send messages");
            return;
        }

        setIsLoading(true);
        // Haptic feedback on send
        if (navigator.vibrate) navigator.vibrate(50);

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(currentUser.id)) {
            console.error("Invalid user ID format:", currentUser.id);
            toast.error("Session invalid. Please logout and login again.");
            return;
        }

        try {
            let fileData = { url: null as string | null, type: null as string | null, name: null as string | null };

            // Upload file if exists
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
                    sender_id: currentUser.id,
                    file_url: fileData.url,
                    file_type: fileData.type,
                    file_name: fileData.name
                });

            if (error) throw error;
            setNewMessage("");
            setAttachment(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error(`Failed to send message: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const isImage = (type?: string) => type?.startsWith('image/');

    // Group messages by date
    const groupMessagesByDate = (messages: Message[]) => {
        const groups: { [key: string]: Message[] } = {};
        messages.forEach(msg => {
            const date = new Date(msg.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            if (!groups[date]) groups[date] = [];
            groups[date].push(msg);
        });
        return groups;
    };

    // Check if messages should be grouped (within 5 minutes, same sender)
    const shouldGroup = (currentMsg: Message, previousMsg: Message | null) => {
        if (!previousMsg) return false;
        if (currentMsg.sender_id !== previousMsg.sender_id) return false;
        const timeDiff = new Date(currentMsg.created_at).getTime() - new Date(previousMsg.created_at).getTime();
        return timeDiff < 5 * 60 * 1000; // 5 minutes
    };

    const messageGroups = groupMessagesByDate(messages);

    return (
        <div className="glass-card p-0 h-[calc(100vh-140px)] flex flex-col relative overflow-hidden">
            {/* Simple Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.01]">
                <div>
                    <h2 className="text-xl font-semibold text-white">Team Chat</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Secure • Auto-clears in 24h</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {messages.length === 0 && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center text-slate-500 max-w-xs">
                                <p className="text-sm">No messages yet</p>
                                <p className="text-xs mt-1">Start a conversation with your team</p>
                            </div>
                        </div>
                    )}

                    {Object.entries(messageGroups).map(([date, msgs]) => (
                        <div key={date} className="mb-6">
                            {/* Date Separator */}
                            <div className="flex items-center justify-center my-6">
                                <div className="px-3 py-1 bg-white/[0.03] border border-white/5 rounded-full">
                                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                                        {date}
                                    </p>
                                </div>
                            </div>

                            {/* Messages for this date */}
                            {msgs.map((message, idx) => {
                                const isMe = message.sender_id === currentUser?.id;
                                const previousMsg = idx > 0 ? msgs[idx - 1] : null;
                                const isGrouped = shouldGroup(message, previousMsg);

                                return (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"} ${isGrouped ? "mt-1" : "mt-6"}`}
                                    >
                                        {/* Avatar - only show if not grouped */}
                                        <div className="w-8 shrink-0">
                                            {!isGrouped && (
                                                <Avatar className="h-8 w-8 border border-white/5">
                                                    <AvatarImage src={message.portal_users?.avatar_url || ""} />
                                                    <AvatarFallback className={`text-xs font-medium ${isMe ? "bg-purple-600 text-white" : "bg-[#1F1730] text-slate-300"}`}>
                                                        {message.portal_users?.username?.substring(0, 2).toUpperCase() || "AD"}
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                        </div>

                                        {/* Message Content */}
                                        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[65%]`}>
                                            {/* Username and Time - only show if not grouped */}
                                            {!isGrouped && (
                                                <div className={`flex items-baseline gap-2 mb-1.5 px-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                                    <span className="text-xs font-medium text-slate-300">
                                                        {message.portal_users?.username || "Unknown"}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500">
                                                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Message Bubble */}
                                            <div
                                                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe
                                                    ? "bg-purple-600 text-white"
                                                    : "bg-[#1F1730] text-slate-200 border border-white/5"
                                                    } ${isGrouped ? "" : (isMe ? "rounded-tr-md" : "rounded-tl-md")}`}
                                            >
                                                {/* File Attachment Display */}
                                                {message.file_url && (
                                                    <div className="mb-2">
                                                        {isImage(message.file_type) ? (
                                                            <a
                                                                href={message.file_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="block rounded-lg overflow-hidden border border-white/10 hover:opacity-90 transition-opacity"
                                                            >
                                                                <img
                                                                    src={message.file_url}
                                                                    alt="Attachment"
                                                                    className="max-w-full max-h-[240px] object-cover"
                                                                />
                                                            </a>
                                                        ) : (
                                                            <a
                                                                href={message.file_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={`flex items-center gap-2 p-2.5 rounded-lg transition-colors border ${isMe
                                                                    ? "bg-purple-700/30 border-purple-500/30 hover:bg-purple-700/50"
                                                                    : "bg-white/5 border-white/5 hover:bg-white/10"
                                                                    }`}
                                                            >
                                                                <FileText className="h-4 w-4 shrink-0" />
                                                                <span className="text-xs truncate max-w-[180px] underline decoration-dotted">
                                                                    {message.file_name || "Attachment"}
                                                                </span>
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                                {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Attachment Preview */}
            {attachment && (
                <div className="mx-6 mb-2 bg-[#1F1730] rounded-xl p-3 border border-white/10 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-12 w-12 bg-white/5 rounded-lg flex items-center justify-center shrink-0 border border-white/5">
                            {attachment.type.startsWith('image/') ? (
                                <img src={URL.createObjectURL(attachment)} alt="Preview" className="h-full w-full object-cover rounded-lg" />
                            ) : (
                                <FileText className="h-5 w-5 text-slate-400" />
                            )}
                        </div>
                        <div className="truncate">
                            <p className="text-sm font-medium text-white truncate">{attachment.name}</p>
                            <p className="text-xs text-slate-500">{(attachment.size / 1024).toFixed(1)} KB</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setAttachment(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="h-8 w-8 hover:bg-white/10 text-slate-400 hover:text-white"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Input Area - More Prominent */}
            <div className="px-6 py-4 border-t border-white/5 bg-white/[0.01]">
                <form onSubmit={handleSendMessage} className="flex gap-2.5 items-end">
                    <Input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-11 w-11 rounded-xl border border-white/5 hover:bg-white/5 hover:border-white/10 text-slate-400 hover:text-white shrink-0 transition-all"
                    >
                        <Paperclip className="h-5 w-5" />
                    </Button>

                    <div className="flex-1 relative">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="bg-[#1F1730] border-white/5 focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/20 h-11 rounded-xl px-4 text-sm placeholder:text-slate-600 text-slate-200"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading || (!newMessage.trim() && !attachment)}
                        className="bg-purple-600 hover:bg-purple-700 h-11 w-11 rounded-xl p-0 shrink-0 shadow-md shadow-purple-900/20 transition-all disabled:opacity-50 disabled:shadow-none active:scale-95"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                </form>
            </div>
        </div>
    );
};
