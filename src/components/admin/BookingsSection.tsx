import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
    Calendar,
    Clock,
    User,
    Phone,
    Mail,
    Search,
    Filter,
    X,
    ChevronRight,
    CheckCircle,
    XCircle,
    Loader2,
    Eye,
    CalendarDays,
    TrendingUp,
    AlertCircle,
    BarChart3,
    Grid3x3,
    List,
    MapPin,
    MessageSquare,
    Download,
    RefreshCw,
    DollarSign,
    Trash2
} from "lucide-react";
import { servicesSupabase as supabase, isServicesSupabaseConfigured } from "@/integrations/supabase/servicesClient";
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
    service_id?: string;
    service_name?: string;
    budget?: string;
    services?: {
        title: string;
    };
}

export const BookingsSection = () => {
    const { user } = useAuth(); // Get current authenticated user
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("bookings")
                .select("*")
                .order("booking_date", { ascending: false });
            if (error) throw error;
            setBookings(data || []);
        } catch (err: any) {
            console.error("Error loading bookings:", err);
            toast.error("Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isServicesSupabaseConfigured) {
            fetchBookings();
        } else {
            setLoading(false);
            toast.error("Secondary Supabase project not configured. Please check your environment variables.");
        }
    }, []);

    const updateBookingStatus = async (id: string, newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
        try {
            const booking = bookings.find(b => b.id === id);

            const { error } = await supabase
                .from("bookings")
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq("id", id);

            if (error) throw error;

            // Create audit log entry
            const auditLogEntry = {
                admin_user_id: user?.id || null,
                admin_email: user?.email || 'Unknown',
                admin_name: user?.user_metadata?.full_name || user?.email || 'Unknown Admin',
                action_type: 'update',
                target_type: 'booking_status',
                target_id: id,
                target_data: {
                    booking_id: id,
                    old_status: booking?.status,
                    new_status: newStatus,
                    updated_at: new Date().toISOString()
                },
                description: `Updated status of booking for ${booking?.name} to ${newStatus}`,
                ip_address: null,
                user_agent: navigator.userAgent
            };

            await supabase
                .from("admin_activity_logs")
                .insert([auditLogEntry]);

            toast.success(`Booking status updated to ${newStatus}`);
            fetchBookings();
        } catch (error: any) {
            console.error("Update error:", error);
            toast.error(error.message);
        }
    };

    const deleteBooking = async (id: string) => {
        if (!confirm("Are you sure you want to delete this booking?")) return;

        try {
            // First, get the full booking data for audit log
            const bookingToDelete = bookings.find(b => b.id === id);
            if (!bookingToDelete) {
                toast.error("Booking not found");
                return;
            }

            // Create audit log entry BEFORE deletion
            const auditLogEntry = {
                admin_user_id: user?.id || null,
                admin_email: user?.email || 'Unknown',
                admin_name: user?.user_metadata?.full_name || user?.email || 'Unknown Admin',
                action_type: 'delete',
                target_type: 'booking',
                target_id: id,
                target_data: {
                    ...bookingToDelete,
                    deleted_at: new Date().toISOString()
                },
                description: `Deleted booking for ${bookingToDelete.name} - ${bookingToDelete.service_name || bookingToDelete.services?.title || 'Unknown Service'} (${new Date(bookingToDelete.booking_date).toLocaleDateString()})`,
                ip_address: null, // Could be captured if needed
                user_agent: navigator.userAgent
            };

            // Insert audit log
            const { error: logError } = await supabase
                .from("admin_activity_logs")
                .insert([auditLogEntry]);

            if (logError) {
                console.error("Failed to create audit log:", logError);
                // Continue with deletion even if audit log fails
            }

            // Now delete the booking
            const { error } = await supabase
                .from("bookings")
                .delete()
                .eq("id", id);

            if (error) throw error;

            toast.success("Booking deleted successfully and logged");
            setShowModal(false);
            fetchBookings();
        } catch (error: any) {
            console.error("Delete error:", error);
            toast.error(error.message || "Failed to delete booking");
        }
    };

    // Filter bookings by status and date
    const getFilteredBookings = () => {
        let filtered = bookings;

        // Status filter
        if (filter !== 'all') {
            filtered = filtered.filter(b => b.status === filter);
        }

        // Date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            filtered = filtered.filter(b => {
                const bookingDate = new Date(b.booking_date);
                if (dateFilter === 'today') {
                    return bookingDate.toDateString() === now.toDateString();
                } else if (dateFilter === 'week') {
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return bookingDate >= weekAgo;
                } else if (dateFilter === 'month') {
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    return bookingDate >= monthAgo;
                }
                return true;
            });
        }

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(b =>
                b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.phone?.includes(searchQuery) ||
                b.services?.title?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    };

    const filteredBookings = getFilteredBookings();

    // Calculate statistics
    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'emerald';
            case 'cancelled': return 'rose';
            case 'confirmed': return 'blue';
            case 'pending': return 'amber';
            default: return 'slate';
        }
    };

    const BookingModal = ({ booking }: { booking: Booking }) => (
        <AnimatePresence>
            {showModal && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                        onClick={() => setShowModal(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#110C1D] border border-white/10 rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-[#110C1D]/95 backdrop-blur-xl border-b border-white/5 p-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-white">Booking Details</h3>
                                <p className="text-sm text-slate-400 mt-1">ID: {booking.id.slice(0, 8)}...</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Status Badge */}
                            <div className="flex items-center justify-between">
                                <div className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm uppercase tracking-wider border ${booking.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' :
                                    booking.status === 'cancelled' ? 'bg-rose-500/20 text-rose-500 border-rose-500/30' :
                                        booking.status === 'confirmed' ? 'bg-blue-500/20 text-blue-500 border-blue-500/30' :
                                            'bg-amber-500/20 text-amber-500 border-amber-500/30'
                                    }`}>
                                    {booking.status === 'completed' && <CheckCircle className="h-4 w-4" />}
                                    {booking.status === 'cancelled' && <XCircle className="h-4 w-4" />}
                                    {booking.status === 'pending' && <AlertCircle className="h-4 w-4" />}
                                    {booking.status === 'confirmed' && <CheckCircle className="h-4 w-4" />}
                                    {booking.status}
                                </div>
                                <div className="text-xs text-slate-500">
                                    Booked {formatDate(booking.created_at)}
                                </div>
                            </div>

                            {/* Client Information */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-purple-400/80 mb-2">Client Profile</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center gap-4 group/item">
                                        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 group-hover/item:bg-purple-500/20 transition-all">
                                            <User className="h-5 w-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Full Name</div>
                                            <div className="text-base font-bold text-white tracking-tight">{booking.name}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 group/item">
                                        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover/item:bg-blue-500/20 transition-all">
                                            <Mail className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Email Address</div>
                                            <div className="text-base font-bold text-white tracking-tight break-all">{booking.email || 'Not provided'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 group/item">
                                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group-hover/item:bg-emerald-500/20 transition-all">
                                            <Phone className="h-5 w-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Phone Number</div>
                                            <div className="text-base font-bold text-white tracking-tight">{booking.phone || 'Not provided'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Appointment Details */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-rose-400/80 mb-2">Service Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center gap-4 group/item">
                                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 group-hover/item:bg-rose-500/20 transition-all">
                                            <Calendar className="h-5 w-5 text-rose-400" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Scheduled Date</div>
                                            <div className="text-base font-bold text-white tracking-tight">{formatDate(booking.booking_date)}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 group/item">
                                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 group-hover/item:bg-amber-500/20 transition-all">
                                            <Clock className="h-5 w-5 text-amber-400" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Preferred Time</div>
                                            <div className="text-base font-bold text-white tracking-tight">{formatTime(booking.booking_date)}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 md:col-span-2 group/item">
                                        <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 group-hover/item:bg-violet-500/20 transition-all">
                                            <BarChart3 className="h-5 w-5 text-violet-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Required Service</div>
                                            <div className="text-base font-bold text-white tracking-tight">{booking.service_name || booking.services?.title || 'General Service'}</div>
                                        </div>
                                    </div>
                                    {booking.budget && (
                                        <div className="flex items-center gap-4 md:col-span-2 group/item">
                                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group-hover/item:bg-emerald-500/20 transition-all">
                                                <DollarSign className="h-5 w-5 text-emerald-400" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Project Budget</div>
                                                <div className="text-base font-bold text-emerald-400 tracking-tight">{booking.budget}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notes */}
                            {booking.notes && (
                                <div className="bg-white/5 border border-white/5 rounded-xl p-5 space-y-3">
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        Client Notes
                                    </h4>
                                    <p className="text-sm text-slate-300 leading-relaxed italic">"{booking.notes}"</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap gap-3 pt-4 border-t border-white/5">
                                {booking.status === 'pending' && (
                                    <>
                                        <Button
                                            onClick={() => {
                                                updateBookingStatus(booking.id, 'confirmed');
                                                setShowModal(false);
                                            }}
                                            className="flex-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/30"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Confirm Booking
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                updateBookingStatus(booking.id, 'cancelled');
                                                setShowModal(false);
                                            }}
                                            className="flex-1 bg-rose-500/20 border border-rose-500/30 text-rose-500 hover:bg-rose-500/30"
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Cancel Booking
                                        </Button>
                                    </>
                                )}
                                {booking.status === 'confirmed' && (
                                    <Button
                                        onClick={() => {
                                            updateBookingStatus(booking.id, 'completed');
                                            setShowModal(false);
                                        }}
                                        className="flex-1 bg-blue-500/20 border border-blue-500/30 text-blue-500 hover:bg-blue-500/30"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Mark as Completed
                                    </Button>
                                )}
                                <Button
                                    onClick={() => deleteBooking(booking.id)}
                                    variant="outline"
                                    className="border-white/10 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-white tracking-tight">
                        Client <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Bookings</span>
                    </h2>
                    <p className="text-slate-400 text-sm font-medium mt-1">Manage appointments and service requests</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-[#1A1429] to-[#110C1D] border border-white/10 rounded-2xl p-5 hover:border-purple-500/50 transition-all group relative overflow-hidden shadow-xl"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-purple-500/10 transition-colors" />
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 transition-all group-hover:scale-110">
                                <CalendarDays className="h-5 w-5 text-purple-400" />
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <TrendingUp className="h-3 w-3 text-emerald-400" />
                                <span className="text-[10px] font-bold text-emerald-400">Stable</span>
                            </div>
                        </div>
                        <div className="text-3xl font-black text-white tracking-tight relative z-10">{stats.total}</div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 relative z-10">Total Bookings</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="bg-gradient-to-br from-[#1A1429] to-[#110C1D] border border-white/10 rounded-2xl p-5 hover:border-amber-500/50 transition-all group relative overflow-hidden shadow-xl"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-amber-500/10 transition-colors" />
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 group-hover:bg-amber-500/20 transition-all group-hover:scale-110">
                                <AlertCircle className="h-5 w-5 text-amber-400" />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-white tracking-tight relative z-10">{stats.pending}</div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 relative z-10">Pending</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-[#1A1429] to-[#110C1D] border border-white/10 rounded-2xl p-5 hover:border-blue-500/50 transition-all group relative overflow-hidden shadow-xl"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-blue-500/10 transition-colors" />
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition-all group-hover:scale-110">
                                <CheckCircle className="h-5 w-5 text-blue-400" />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-white tracking-tight relative z-10">{stats.confirmed}</div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 relative z-10">Confirmed</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-gradient-to-br from-[#1A1429] to-[#110C1D] border border-white/10 rounded-2xl p-5 hover:border-emerald-500/50 transition-all group relative overflow-hidden shadow-xl"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-emerald-500/10 transition-colors" />
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all group-hover:scale-110">
                                <CheckCircle className="h-5 w-5 text-emerald-400" />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-white tracking-tight relative z-10">{stats.completed}</div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 relative z-10">Completed</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-[#1A1429] to-[#110C1D] border border-white/10 rounded-2xl p-5 hover:border-rose-500/50 transition-all group relative overflow-hidden shadow-xl"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-rose-500/10 transition-colors" />
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 group-hover:bg-rose-500/20 transition-all group-hover:scale-110">
                                <XCircle className="h-5 w-5 text-rose-400" />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-white tracking-tight relative z-10">{stats.cancelled}</div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 relative z-10">Cancelled</div>
                    </motion.div>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <Input
                                type="text"
                                placeholder="Search by name, email, phone, or service..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-[#110C1D] border-white/10 text-white placeholder:text-slate-500 h-11 rounded-xl"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* View Mode & Refresh - Grouped on mobile */}
                        <div className="flex gap-2">
                            <div className="flex bg-[#110C1D] p-1.5 rounded-xl border border-white/10 gap-1 flex-1 md:flex-none">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`flex-1 md:flex-none p-2 rounded-lg transition-all flex justify-center ${viewMode === 'list'
                                        ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                                        : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`flex-1 md:flex-none p-2 rounded-lg transition-all flex justify-center ${viewMode === 'grid'
                                        ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                                        : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    <Grid3x3 className="h-4 w-4" />
                                </button>
                            </div>

                            <Button
                                onClick={fetchBookings}
                                variant="outline"
                                className="bg-[#110C1D] border-white/10 hover:bg-white/5 h-11 w-11 p-0 rounded-xl shrink-0"
                            >
                                <RefreshCw className="h-4 w-4 text-slate-400" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Status Filter */}
                        <div className="flex-1 overflow-x-auto no-scrollbar mask-fade-right -mx-4 px-4 sm:mx-0 sm:px-0">
                            <div className="flex bg-[#110C1D] p-1.5 rounded-xl border border-white/10 gap-1 min-w-max sm:min-w-0">
                                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setFilter(tab)}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${filter === tab
                                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date Filter */}
                        <div className="flex-1 overflow-x-auto no-scrollbar mask-fade-right -mx-4 px-4 sm:mx-0 sm:px-0">
                            <div className="flex bg-[#110C1D] p-1.5 rounded-xl border border-white/10 gap-1 min-w-max sm:min-w-0">
                                {['all', 'today', 'week', 'month'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setDateFilter(tab as any)}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${dateFilter === tab
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bookings List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-[#110C1D] rounded-2xl border border-white/5">
                    <Loader2 className="h-10 w-10 animate-spin text-purple-500 mb-4" />
                    <p className="text-slate-400 font-medium">Loading bookings...</p>
                </div>
            ) : filteredBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-[#110C1D] rounded-2xl border border-dashed border-white/10">
                    <Calendar className="h-16 w-16 text-slate-600 mb-4" />
                    <p className="text-slate-400 font-medium text-lg">No bookings found</p>
                    <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search query</p>
                </div>
            ) : (
                <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                    <AnimatePresence mode="popLayout">
                        {filteredBookings.map((booking, index) => (
                            <motion.div
                                key={booking.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.03 }}
                                className={`bg-[#110C1D] border border-white/5 rounded-2xl hover:border-purple-500/40 transition-all group overflow-hidden ${viewMode === 'grid' ? 'p-6' : 'p-4'
                                    }`}
                                onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowModal(true);
                                }}
                            >
                                {viewMode === 'list' ? (
                                    // List View
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            {/* Date Badge */}
                                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 flex flex-col items-center justify-center border border-purple-500/20 shrink-0 shadow-lg shadow-purple-500/5">
                                                <span className="text-[10px] font-bold uppercase text-purple-400">
                                                    {new Date(booking.booking_date).toLocaleDateString('en-US', { month: 'short' })}
                                                </span>
                                                <span className="text-xl font-black text-white leading-none">
                                                    {new Date(booking.booking_date).getDate()}
                                                </span>
                                            </div>

                                            {/* Client Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base md:text-lg font-bold text-white truncate group-hover:text-purple-400 transition-colors">
                                                    {booking.name}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <Mail className="h-3 w-3 text-purple-400/70" />
                                                        <span className="truncate max-w-[140px] md:max-w-none">{booking.email || 'No email'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <Phone className="h-3 w-3 text-purple-400/70" />
                                                        {booking.phone || 'No phone'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Service & Status */}
                                        <div className="flex items-center justify-between sm:justify-end gap-3 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                                            <div className="flex items-center gap-2">
                                                <div className="hidden lg:block px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 max-w-[150px]">
                                                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Service</div>
                                                    <div className="text-xs font-medium text-white truncate">
                                                        {booking.services?.title || 'General'}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end sm:items-center sm:flex-row gap-2">
                                                    <div className="flex items-center gap-1.5 text-xs text-purple-400 font-bold px-2 py-1 rounded-lg bg-purple-500/5 border border-purple-500/10">
                                                        <Clock className="h-3 w-3" />
                                                        {formatTime(booking.booking_date)}
                                                    </div>

                                                    {/* Status Badge */}
                                                    <div className={`px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${booking.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-lg shadow-emerald-500/5' :
                                                        booking.status === 'cancelled' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-lg shadow-rose-500/5' :
                                                            booking.status === 'confirmed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-lg shadow-blue-500/5' :
                                                                'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-lg shadow-amber-500/5'
                                                        }`}>
                                                        {booking.status}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quick Actions */}
                                            <div className="flex items-center gap-1.5">
                                                {booking.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                updateBookingStatus(booking.id, 'confirmed');
                                                            }}
                                                            className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all sm:opacity-0 group-hover:opacity-100"
                                                            title="Confirm"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                updateBookingStatus(booking.id, 'cancelled');
                                                            }}
                                                            className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all sm:opacity-0 group-hover:opacity-100"
                                                            title="Cancel"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {booking.status === 'confirmed' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateBookingStatus(booking.id, 'completed');
                                                        }}
                                                        className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all sm:opacity-0 group-hover:opacity-100"
                                                        title="Mark Completed"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {(booking.status === 'completed' || booking.status === 'cancelled') && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteBooking(booking.id);
                                                        }}
                                                        className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all sm:opacity-0 group-hover:opacity-100"
                                                        title="Delete Booking"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedBooking(booking);
                                                        setShowModal(true);
                                                    }}
                                                    className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-all"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // Grid View
                                    <div className="space-y-4">
                                        {/* Header with Date */}
                                        <div className="flex items-start justify-between">
                                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/10 flex flex-col items-center justify-center border border-purple-500/20">
                                                <span className="text-[9px] font-bold uppercase text-purple-400">
                                                    {new Date(booking.booking_date).toLocaleDateString('en-US', { month: 'short' })}
                                                </span>
                                                <span className="text-lg font-bold text-white leading-none">
                                                    {new Date(booking.booking_date).getDate()}
                                                </span>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${booking.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                booking.status === 'cancelled' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                                    booking.status === 'confirmed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                }`}>
                                                {booking.status}
                                            </div>
                                        </div>

                                        {/* Client Name */}
                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                                                {booking.name}
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                                <Clock className="h-3 w-3 text-purple-400" />
                                                {formatTime(booking.booking_date)}
                                            </p>
                                        </div>

                                        {/* Contact Info */}
                                        <div className="space-y-2 pt-3 border-t border-white/5">
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <Mail className="h-3 w-3 text-purple-400 shrink-0" />
                                                <span className="truncate">{booking.email || 'No email'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <Phone className="h-3 w-3 text-purple-400 shrink-0" />
                                                <span>{booking.phone || 'No phone'}</span>
                                            </div>
                                        </div>

                                        {/* Service */}
                                        <div className="pt-3 border-t border-white/5">
                                            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Service</div>
                                            <div className="text-sm font-medium text-white">
                                                {booking.services?.title || 'General Service'}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-2">
                                            {booking.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateBookingStatus(booking.id, 'confirmed');
                                                        }}
                                                        className="flex-1 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-xs font-medium"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateBookingStatus(booking.id, 'cancelled');
                                                        }}
                                                        className="flex-1 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors text-xs font-medium"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                            {booking.status === 'confirmed' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        updateBookingStatus(booking.id, 'completed');
                                                    }}
                                                    className="flex-1 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors text-xs font-medium"
                                                >
                                                    Complete
                                                </button>
                                            )}
                                            {/* Delete button for completed/cancelled bookings */}
                                            {(booking.status === 'completed' || booking.status === 'cancelled') && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteBooking(booking.id);
                                                    }}
                                                    className="flex-1 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors text-xs font-medium flex items-center justify-center gap-2"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Booking Detail Modal */}
            {selectedBooking && <BookingModal booking={selectedBooking} />}
        </div>
    );
};
