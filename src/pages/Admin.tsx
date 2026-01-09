import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    LayoutDashboard,
    Users,
    Briefcase,
    MessageSquare,
    Layers,
    Calendar,
    CreditCard,
    Image as ImageIcon,
    Settings,
    LogOut,
    Bell,
    Search,
    ChevronRight,
    Loader2,
    Monitor,
    Shield,
    Eye,
    EyeOff,
    Menu,
    X,
    Package
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { FaceAuthModal } from "@/components/admin/auth/FaceAuthModal";
import { DashboardSection } from "@/components/admin/DashboardSection";
import { SettingsSection } from "@/components/admin/SettingsSection";
import { LeadsSection } from "@/components/admin/LeadsSection";
import { PortfolioSection } from "@/components/admin/PortfolioSection";
import { ServicesSection } from "@/components/admin/ServicesSection";
import { TestimonialsSection } from "@/components/admin/TestimonialsSection";
import { NotificationsSection } from "@/components/admin/NotificationsSection";
import { BookingsSection } from "@/components/admin/BookingsSection";
import { PaymentsSection } from "@/components/admin/PaymentsSection";
import { MessagesSection } from "@/components/admin/MessagesSection";
import { AuditLogsSection } from "@/components/admin/AuditLogsSection";
import { AssetsSection } from "@/components/admin/AssetsSection";



const Admin = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isLoading, setIsLoading] = useState(false);
    const [showFaceAuth, setShowFaceAuth] = useState(false);
    const [pendingUser, setPendingUser] = useState<any>(null);
    // Track current session log ID
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionStorage.getItem("ms-admin-session-id"));
    const [showPassword, setShowPassword] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const playAlertSound = () => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

            const beep = (startTime: number, freq: number, type: 'square' | 'sawtooth' = 'square') => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, startTime);
                gain.gain.setValueAtTime(0.1, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(startTime);
                osc.stop(startTime + 0.15);
            };

            // Urgent double high-pitch beep
            beep(ctx.currentTime, 880, 'sawtooth');
            beep(ctx.currentTime + 0.2, 880, 'sawtooth');
            beep(ctx.currentTime + 0.4, 660, 'square');
        } catch (e) {
            console.error("Audio playback error:", e);
        }
    };

    useEffect(() => {
        // Initial Intro Timer
        const timer = setTimeout(() => {
            setShowIntro(false);
        }, 2200);

        const checkSession = () => {
            const session = sessionStorage.getItem("ms-admin-session");
            if (session) {
                const user = JSON.parse(session);
                setIsLoggedIn(true);
                setCurrentUser(user);
            }
        };

        checkSession();

        const handleProfileUpdate = () => {
            checkSession();
        };

        window.addEventListener('user-profile-updated', handleProfileUpdate);
        return () => {
            window.removeEventListener('user-profile-updated', handleProfileUpdate);
            clearTimeout(timer);
        };
    }, []);

    // Monitor for failed login attempts (Security Alert)
    useEffect(() => {
        if (!isLoggedIn || !currentUser || !['super_admin', 'superadmin'].includes(currentUser.role)) return;

        const channel = supabase
            .channel('security_alerts')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'admin_login_logs', filter: 'status=eq.failed' },
                (payload) => {
                    const newLog = payload.new;
                    console.warn("Security Alert Received:", newLog);

                    playAlertSound();

                    toast.error("SECURITY ALERT: UNAUTHORIZED LOGIN ATTEMPT!", {
                        description: `A failed login attempt was detected at ${new Date(newLog.created_at).toLocaleTimeString()}. Check Audit Logs immediately.`,
                        duration: 8000,
                        position: "top-center",
                        action: {
                            label: "View Evidence",
                            onClick: () => setActiveTab("audit")
                        },
                        style: {
                            background: "#450a0a",
                            border: "1px solid #ef4444",
                            color: "#fecaca"
                        }
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isLoggedIn, currentUser]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data, error } = await supabase
                .from("portal_users")
                .select("*")
                .or(`username.eq.${loginForm.identifier},email.eq.${loginForm.identifier}`)
                .eq("password", loginForm.password)
                .single();

            if (data && !error) {
                // Check user role
                if (['super_admin', 'superadmin'].includes(data.role)) {
                    // BYPASS FACE AUTH FOR SUPER ADMIN
                    setIsLoggedIn(true);
                    setCurrentUser(data);
                    sessionStorage.setItem("ms-admin-session", JSON.stringify(data));
                    toast.success(`Welcome back Super Admin, ${data.username}`);

                    // Create audit log entry for Super Admin (no image)
                    const { data: logData } = await supabase
                        .from('admin_login_logs')
                        .insert({
                            user_id: data.id,
                            status: 'success',
                            captured_image_url: null, // No image for super admin
                            login_time: new Date().toISOString()
                        })
                        .select()
                        .single();

                    if (logData) {
                        setCurrentSessionId(logData.id);
                        sessionStorage.setItem("ms-admin-session-id", logData.id);
                    }

                } else {
                    // NORMAL ADMIN - REQUIRE FACE AUTH
                    setPendingUser(data);
                    setShowFaceAuth(true);
                }
            } else {
                toast.error("Invalid credentials. Please contact main admin.");
            }
        } catch (err) {
            console.error("Login error:", err);
            toast.error("Login service unavailable.");
        }

        setIsLoading(false);
    };

    const handleLogout = async () => {
        // Update logout time if we have a session ID
        if (currentSessionId) {
            console.log("Logging out session:", currentSessionId);
            const { error } = await supabase
                .from('admin_login_logs')
                .update({ logout_time: new Date().toISOString() })
                .eq('id', currentSessionId);

            if (error) {
                console.error("Failed to update logout time:", error);
                // We still proceed with logout on frontend
            } else {
                console.log("Logout time updated successfully");
            }

            sessionStorage.removeItem("ms-admin-session-id");
            setCurrentSessionId(null);
        }

        setIsLoggedIn(false);
        setCurrentUser(null);
        sessionStorage.removeItem("ms-admin-session");
        toast.info("Signed out successfully");
    };

    // Attempt to capture logout on tab close/unload
    useEffect(() => {
        const handleUnload = () => {
            if (currentSessionId && import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
                // Use fetch with keepalive as it's more reliable than sendBeacon for JSON APIs that might not accept text/plain
                const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/admin_login_logs?id=eq.${currentSessionId}`;
                const headers = {
                    'Content-Type': 'application/json',
                    'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                    'Prefer': 'return=minimal'
                };

                const body = JSON.stringify({ logout_time: new Date().toISOString() });

                fetch(url, {
                    method: 'PATCH',
                    headers,
                    body,
                    keepalive: true
                }).catch(err => console.error("Unload logout update failed", err));
            }
        };

        window.addEventListener('beforeunload', handleUnload);
        // Also capture visibility change to hidden (often happens on mobile before unload)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && currentSessionId) {
                // We don't want to log out just because they switched tabs, so maybe this is too aggressive.
                // The user strictly asked for "update logout time" which usually implies "when the session ends".
                // Session end is explicit logout or tab close. "hidden" tab is not necessarily logout.
                // So we will stick to beforeunload.
            }
        };

        return () => window.removeEventListener('beforeunload', handleUnload);
    }, [currentSessionId]);

    if (showIntro) {
        return (
            <div className="fixed inset-0 bg-[#05030e] z-[100] flex flex-col items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full animate-pulse" />
                    <img
                        src="/favicon.png"
                        alt="Logo"
                        className="w-24 h-24 object-contain relative z-10 drop-shadow-[0_0_25px_rgba(168,85,247,0.5)]"
                    />
                </motion.div>

                <div className="mt-8 flex flex-col items-center gap-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-white/80 font-display tracking-[0.2em] text-sm uppercase"
                    >
                        Initializing Portal
                    </motion.div>

                    <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="w-1/2 h-full bg-gradient-to-r from-transparent via-primary to-transparent"
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-[#0A051A] flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#0f0a1f] border border-white/10 p-8 w-full max-w-[400px] relative z-10 rounded-2xl shadow-2xl shadow-black/50"
                >
                    <div className="flex flex-col items-center mb-8">
                        <img
                            src="/favicon.png"
                            alt="Logo"
                            className="w-16 h-16 object-contain mb-4 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                        />
                        <h1 className="text-2xl font-semibold text-white mb-1">Admin Portal</h1>
                        <p className="text-muted-foreground text-sm">Sign in to manage your workspace</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-0.5">Email or Username</label>
                            <Input
                                type="text"
                                value={loginForm.identifier}
                                onChange={e => setLoginForm({ ...loginForm, identifier: e.target.value })}
                                placeholder="name@msdigimark.org"
                                className="bg-black/20 border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all h-10 text-sm rounded-lg"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-300 ml-0.5">Password</label>
                            </div>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={loginForm.password}
                                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                                    placeholder="Enter your password"
                                    className="bg-black/20 border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all h-10 text-sm rounded-lg pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-white h-10 rounded-lg font-medium shadow-sm transition-all text-sm mt-2"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Sign in"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-[10px] text-muted-foreground/40 font-medium">Secured by MS Digi Mark Systems</p>
                    </div>

                    <FaceAuthModal
                        isOpen={showFaceAuth}
                        onClose={() => {
                            setShowFaceAuth(false);
                            setPendingUser(null);
                            setIsLoading(false);
                        }}
                        onSuccess={(imageUrl, logId) => {
                            setShowFaceAuth(false);
                            setIsLoggedIn(true);
                            setCurrentUser(pendingUser);
                            sessionStorage.setItem("ms-admin-session", JSON.stringify(pendingUser));
                            toast.success(`Welcome back, ${pendingUser?.username}`);

                            if (logId) {
                                setCurrentSessionId(logId);
                                sessionStorage.setItem("ms-admin-session-id", logId);
                            }
                        }}
                        adminImage={pendingUser?.avatar_url}
                        userId={pendingUser?.id}
                    />
                </motion.div>
            </div>
        );
    }

    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "leads", label: "Leads", icon: Users },
        { id: "portfolio", label: "Portfolio", icon: Briefcase },
        { id: "testimonials", label: "Testimonials", icon: MessageSquare },
        { id: "services", label: "Services", icon: Layers },
        { id: "bookings", label: "Bookings", icon: Calendar },
        { id: "payments", label: "Payments", icon: CreditCard },
        { id: "assets", label: "Assets", icon: Package },
        { id: "messages", label: "Messages", icon: MessageSquare },
        { id: "settings", label: "Settings", icon: Settings },
        // Only show Audit Log if super admin
        ...(['super_admin', 'superadmin'].includes(currentUser?.role) ? [{ id: "audit", label: "Audit Logs", icon: Shield }] : []),
    ];

    return (
        <div className="min-h-screen bg-[#070510] text-slate-200 flex font-sans">
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`w-64 bg-[#0B0816] border-r border-white/5 flex flex-col fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 relative">
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="absolute right-4 top-6 md:hidden text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-3 mb-8 px-2">
                        <img src="/favicon.png" alt="Logo" className="h-8 w-8 rounded-lg object-contain bg-white/5 p-1 ring-1 ring-white/10 shadow-sm" />
                        <div className="font-semibold text-lg text-white tracking-tight">Portal</div>
                    </div>

                    <nav className="space-y-1">
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all group relative overflow-hidden text-sm font-medium ${activeTab === item.id
                                    ? 'bg-white/5 text-white'
                                    : 'text-muted-foreground hover:bg-white/5 hover:text-slate-200'
                                    }`}
                            >
                                <item.icon className={`h-4 w-4 ${activeTab === item.id ? 'text-primary' : 'text-muted-foreground group-hover:text-slate-300'}`} />
                                <span>{item.label}</span>
                                {activeTab === item.id && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-r-full" />
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-white/5">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 mb-3">
                        {currentUser?.avatar_url ? (
                            <img
                                src={currentUser.avatar_url}
                                alt={currentUser.username}
                                className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10"
                            />
                        ) : (
                            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px] text-white ring-1 ring-white/10">
                                {currentUser?.username?.substring(0, 2).toUpperCase() || "AD"}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-white truncate">{currentUser?.username || "Admin"}</div>
                            <div className="text-[10px] text-muted-foreground truncate font-medium">Administrator</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors group font-medium text-xs"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-64 bg-[#070510] min-h-screen transition-all duration-300 flex flex-col">
                {/* Header */}
                <header className="h-16 px-4 md:px-6 border-b border-white/5 flex items-center justify-between sticky top-0 z-20 bg-[#070510]/95 backdrop-blur-sm">
                    <div className="flex items-center gap-3 md:gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden text-slate-400 hover:text-white transition-colors p-1 -ml-1"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-widest">
                            {activeTab.replace('_', ' ')}
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Search..."
                                className="bg-[#110C1D] border-white/5 focus:border-purple-500/30 pl-9 h-9 w-64 rounded-md text-sm transition-all placeholder:text-slate-600 text-slate-300"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setActiveTab("notifications")}
                                className="relative h-9 w-9 rounded-md hover:bg-white/5 text-slate-400 hover:text-white"
                            >
                                <Bell className="h-4 w-4" />
                                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-[#070510]" />
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => window.open("/", "_blank")}
                                className="bg-transparent border-white/10 hover:bg-white/5 text-slate-300 rounded-md h-9 text-xs px-3 font-medium"
                            >
                                View Site
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Section Content */}
                <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full pb-20 md:pb-6">
                    <AnimatePresence mode="wait">
                        {activeTab === "dashboard" && (
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="mb-8">
                                    <h1 className="text-2xl font-semibold text-white tracking-tight">Overview</h1>
                                    <p className="text-muted-foreground text-sm mt-1">Key performance metrics and activity.</p>
                                </div>
                                <DashboardSection />
                            </motion.div>
                        )}

                        {activeTab === "leads" && (
                            <motion.div
                                key="leads"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <LeadsSection />
                            </motion.div>
                        )}

                        {activeTab === "portfolio" && (
                            <motion.div
                                key="portfolio"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <PortfolioSection />
                            </motion.div>
                        )}

                        {activeTab === "testimonials" && (
                            <motion.div
                                key="testimonials"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <TestimonialsSection />
                            </motion.div>
                        )}

                        {activeTab === "services" && (
                            <motion.div
                                key="services"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ServicesSection />
                            </motion.div>
                        )}

                        {activeTab === "settings" && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <SettingsSection />
                            </motion.div>
                        )}

                        {activeTab === "notifications" && (
                            <motion.div
                                key="notifications"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <NotificationsSection />
                            </motion.div>
                        )}

                        {activeTab === "bookings" && (
                            <motion.div
                                key="bookings"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <BookingsSection />
                            </motion.div>
                        )}

                        {activeTab === "payments" && (
                            <motion.div
                                key="payments"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <PaymentsSection />
                            </motion.div>
                        )}



                        {activeTab === "messages" && (
                            <motion.div
                                key="messages"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <MessagesSection />
                            </motion.div>
                        )}

                        {activeTab === "audit" && ['super_admin', 'superadmin'].includes(currentUser?.role) && (
                            <motion.div
                                key="audit"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <AuditLogsSection />
                            </motion.div>
                        )}

                        {activeTab === "assets" && (
                            <motion.div
                                key="assets"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <AssetsSection />
                            </motion.div>
                        )}

                        {/* Fallback for other tabs until implemented */}
                        {!["dashboard", "leads", "portfolio", "testimonials", "services", "settings", "notifications", "bookings", "payments", "messages", "audit", "assets"].includes(activeTab) && (
                            <motion.div
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-[60vh] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl"
                            >
                                <Loader2 className="h-10 w-10 animate-spin text-white/20 mb-4" />
                                <h2 className="text-lg font-medium text-muted-foreground">{activeTab}</h2>
                                <p className="text-muted-foreground/50 text-xs mt-1">Under development</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default Admin;

