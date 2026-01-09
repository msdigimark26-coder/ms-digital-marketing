import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar, Clock, User, Phone, Mail, ChevronRight, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Booking {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    booking_date: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    notes: string | null;
    created_at: string;
    services?: {
        title: string;
    };
}

export const BookingsSection = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("bookings")
                .select("*, services(title)")
                .order("booking_date", { ascending: false });
            if (error) throw error;
            setBookings(data || []);
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from("bookings")
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq("id", id);
            if (error) throw error;
            toast.success(`Booking status updated to ${newStatus}`);
            fetchBookings();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const filteredBookings = bookings.filter(b => filter === 'all' || b.status === filter);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-white tracking-tight">Client <span className="text-gradient">Bookings</span></h2>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Manage appointments and service requests.</p>
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    {['all', 'pending', 'confirmed', 'completed'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${filter === tab ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-white/5">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground font-medium">Synchronizing bookings...</p>
                </div>
            ) : filteredBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <Calendar className="h-12 w-12 text-muted-foreground/20 mb-4" />
                    <p className="text-muted-foreground font-medium">No bookings found for this category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredBookings.map((b) => (
                        <motion.div
                            layout
                            key={b.id}
                            className="glass-card p-6 border-white/10 hover:border-primary/50 transition-all group"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex flex-col items-center justify-center border border-primary/20">
                                        <span className="text-[10px] font-bold uppercase text-primary/60">{new Date(b.booking_date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                        <span className="text-2xl font-bold font-display leading-none">{new Date(b.booking_date).getDate()}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{b.name}</h3>
                                        <div className="flex flex-wrap gap-4 mt-2">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                                <Mail className="h-3 w-3 text-primary" /> {b.email || 'No email'}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                                <Phone className="h-3 w-3 text-primary" /> {b.phone || 'No phone'}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
                                                <Clock className="h-3 w-3" /> {new Date(b.booking_date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 border-t lg:border-t-0 pt-4 lg:pt-0">
                                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 min-w-[140px]">
                                        <div className="text-[8px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Service Requested</div>
                                        <div className="text-xs font-bold text-white truncate">{b.services?.title || 'General Service'}</div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {b.status === 'pending' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => updateStatus(b.id, 'confirmed')}
                                                    className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 rounded-lg h-10 px-4 font-bold"
                                                >
                                                    Confirm
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => updateStatus(b.id, 'cancelled')}
                                                    className="bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/20 rounded-lg h-10 px-4 font-bold"
                                                >
                                                    Cancel
                                                </Button>
                                            </>
                                        )}
                                        {b.status === 'confirmed' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => updateStatus(b.id, 'completed')}
                                                className="bg-blue-500/10 border-blue-500/20 text-blue-500 hover:bg-blue-500/20 rounded-lg h-10 px-4 font-bold"
                                            >
                                                Mark Completed
                                            </Button>
                                        )}
                                        <div className={`h-10 px-4 rounded-lg flex items-center justify-center text-[10px] font-bold uppercase tracking-widest border border-white/10 ${b.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' :
                                            b.status === 'cancelled' ? 'bg-rose-500/20 text-rose-500 border-rose-500/30' :
                                                b.status === 'confirmed' ? 'bg-blue-500/20 text-blue-500 border-blue-500/30' :
                                                    'bg-amber-500/20 text-amber-500 border-amber-500/30'
                                            }`}>
                                            {b.status}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {b.notes && (
                                <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-muted-foreground leading-relaxed italic">
                                    "{b.notes}"
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};
