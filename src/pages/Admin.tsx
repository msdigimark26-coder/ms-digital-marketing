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
    RefreshCw,
    Package,
    Video,
    IdCard,
    FileText,
    Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { FaceAuthModal } from "@/components/admin/auth/FaceAuthModal";
import { IDScannerModal } from "@/components/admin/auth/IDScannerModal";
import { DashboardSection } from "@/components/admin/DashboardSection";
import { SettingsSection } from "@/components/admin/SettingsSection";
import { LeadsSection } from "@/components/admin/LeadsSection";
import { PortfolioSection } from "@/components/admin/PortfolioSection";
import { PortfolioFrontSection } from "@/components/admin/PortfolioFrontSection";
import { ServicesSection } from "@/components/admin/ServicesSection";
import { ServicesShowcaseSection } from "@/components/admin/ServicesShowcaseSection";
import { TestimonialsSection } from "@/components/admin/TestimonialsSection";
import { NotificationsSection } from "@/components/admin/NotificationsSection";
import { BookingsSection } from "@/components/admin/BookingsSection";
import { PaymentsSection } from "@/components/admin/PaymentsSection";
import { MessagesSection } from "@/components/admin/MessagesSection";
import { AuditLogsSection } from "@/components/admin/AuditLogsSection";
import { AssetsSection } from "@/components/admin/AssetsSection";
import { ReelsSection } from "@/components/admin/ReelsSection";
import { EmployeesSection } from "@/components/admin/EmployeesSection";
import { IDCardsSection } from "@/components/admin/IDCardsSection";
import { CareersSection } from "@/components/admin/CareersSection";
import { BlogSection } from "@/components/admin/BlogSection";
import { IDCardSidebar, IDCardModal } from "@/components/admin/IDCard";
import { CertificationsManagementSection } from "@/components/admin/CertificationsSection";
import { isCareersSupabaseConfigured, careersSupabase } from "@/integrations/supabase/careersClient";
import { isServicesSupabaseConfigured, servicesSupabase } from "@/integrations/supabase/servicesClient";
import { isConfigured as isSupabaseConfigured } from "@/integrations/supabase/client";
import { AlertCircle, Globe } from "lucide-react";
import { Preloader } from "@/components/ui/Preloader";
import { ClientNetworkManagementSection } from "@/components/admin/ClientNetworkManagement";

const Admin = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem("ms-admin-active-tab") || "dashboard";
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showFaceAuth, setShowFaceAuth] = useState(false);
    const [showIDScanner, setShowIDScanner] = useState(false);
    const [pendingUser, setPendingUser] = useState<any>(null);
    // Track current session log ID
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionStorage.getItem("ms-admin-session-id"));
    const [showPassword, setShowPassword] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showIDCard, setShowIDCard] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error' | 'mock'>('checking');
    const [connectionError, setConnectionError] = useState<string>("");

    useEffect(() => {
        const checkConnection = async () => {
            if (!isLoggedIn) return;

            // Check if client is configured with URL
            if (!isSupabaseConfigured) {
                setConnectionStatus('mock');
                return;
            }

            try {
                // Try a lightweight query to verify connectivity on the main account
                const { error: mainError } = await supabase.from('portal_users').select('id').limit(1);

                // If main fails with anything other than "table not found", it's a real connection error
                if (mainError && mainError.code !== '42P01') {
                    throw mainError;
                }

                // Also check services account if configured
                if (isServicesSupabaseConfigured) {
                    const { error: servicesError } = await servicesSupabase.from('leads').select('id').limit(1);
                    if (servicesError && servicesError.code !== '42P01') {
                        throw servicesError;
                    }
                }

                setConnectionStatus('connected');
            } catch (err: any) {
                console.error("DB Connection Check Failed:", err);
                setConnectionStatus('error');
                setConnectionError(err.message || "Unknown error connecting to Supabase");
            }
        };

        checkConnection();
    }, [isLoggedIn]);

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
        }, 1800);

        const checkSession = async () => {
            const session = sessionStorage.getItem("ms-admin-session");
            if (session) {
                const sessionUser = JSON.parse(session);

                // Fetch fresh data for the user to ensure roles/ID info are correct
                try {
                    const { data, error } = await supabase
                        .from("portal_users")
                        .select("*")
                        .eq("id", sessionUser.id)
                        .single();

                    if (data && !error) {
                        setIsLoggedIn(true);
                        setCurrentUser(data);
                        sessionStorage.setItem("ms-admin-session", JSON.stringify(data));
                    } else {
                        // If user doesn't exist anymore or error, clear session
                        setIsLoggedIn(false);
                        setCurrentUser(null);
                        sessionStorage.removeItem("ms-admin-session");
                    }
                } catch (err) {
                    // Fallback to session data if fetch fails
                    setIsLoggedIn(true);
                    setCurrentUser(sessionUser);
                }
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

    // Auto-popup ID card for 15 seconds on login
    useEffect(() => {
        if (isLoggedIn && currentUser && currentUser.id_card_status === 'Active') {
            // Check if we've already shown it in this session to avoid annoying the user on tab switches
            const hasShownPopup = sessionStorage.getItem(`id-popup-shown-${currentUser.id}`);
            if (!hasShownPopup) {
                setShowIDCard(true);
                sessionStorage.setItem(`id-popup-shown-${currentUser.id}`, 'true');
                const popupTimer = setTimeout(() => {
                    setShowIDCard(false);
                }, 15000);
                return () => clearTimeout(popupTimer);
            }
        }
    }, [isLoggedIn, currentUser?.id, currentUser?.id_card_status]);

    // Refresh current user data if changed in DB (Realtime)
    useEffect(() => {
        if (!isLoggedIn || !currentUser?.id) return;

        const channel = supabase
            .channel(`user-updates-${currentUser.id}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'portal_users', filter: `id=eq.${currentUser.id}` },
                (payload) => {
                    console.log("Current user updated in DB, syncing state:", payload.new);
                    setCurrentUser(payload.new);
                    sessionStorage.setItem("ms-admin-session", JSON.stringify(payload.new));
                    toast.info("Your profile information has been updated.");
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isLoggedIn, currentUser?.id]);

    // Monitor for failed login attempts (Security Alert)
    useEffect(() => {
        if (!isLoggedIn || !currentUser || !['super_admin', 'superadmin', 'Administrator', 'administrator'].includes(currentUser.role)) return;

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
                            onClick: () => {
                                setActiveTab("audit");
                                localStorage.setItem("ms-admin-active-tab", "audit");
                            }
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

    // REALTIME NOTIFICATION: New Bookings
    useEffect(() => {
        if (!isLoggedIn) return;

        const client = isServicesSupabaseConfigured ? servicesSupabase : supabase;
        const channel = client
            .channel('realtime_bookings')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'bookings' },
                (payload) => {
                    const newBooking = payload.new;
                    console.log("New booking received:", newBooking);

                    playAlertSound();

                    toast.success("NEW APPOINTMENT BOOKING!", {
                        description: `${newBooking.name} has booked an appointment for ${newBooking.service_name || 'a service'}.`,
                        duration: 10000,
                        position: "top-right",
                        action: {
                            label: "View Booking",
                            onClick: () => {
                                setActiveTab("bookings");
                                localStorage.setItem("ms-admin-active-tab", "bookings");
                            }
                        }
                    });
                }
            )
            .subscribe();

        return () => {
            client.removeChannel(channel);
        };
    }, [isLoggedIn]);

    // REALTIME NOTIFICATION: New Job Applications
    useEffect(() => {
        if (!isLoggedIn || !isCareersSupabaseConfigured) return;

        const channel = careersSupabase
            .channel('realtime_applications')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'job_applications' },
                (payload) => {
                    const newApp = payload.new;
                    console.log("New job application received:", newApp);

                    playAlertSound();

                    toast.info("NEW JOB APPLICATION RECEIVED!", {
                        description: `${newApp.full_name} has applied for a position.`,
                        duration: 10000,
                        position: "top-right",
                        action: {
                            label: "View Application",
                            onClick: () => {
                                setActiveTab("careers");
                                localStorage.setItem("ms-admin-active-tab", "careers");
                            }
                        }
                    });
                }
            )
            .subscribe();

        return () => {
            careersSupabase.removeChannel(channel);
        };
    }, [isLoggedIn]);

    // REALTIME NOTIFICATION: New Leads (Contact Form / Manual)
    useEffect(() => {
        if (!isLoggedIn) return;

        const channel = supabase
            .channel('realtime_leads')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'leads' },
                (payload) => {
                    const newLead = payload.new;
                    console.log("New lead received:", newLead);

                    playAlertSound();

                    toast.info("NEW LEAD CAPTURED!", {
                        description: `${newLead.name} has submitted a new inquiry.`,
                        duration: 10000,
                        position: "top-right",
                        action: {
                            label: "View Lead",
                            onClick: () => {
                                setActiveTab("leads");
                                localStorage.setItem("ms-admin-active-tab", "leads");
                            }
                        }
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isLoggedIn]);

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
                if (['super_admin', 'superadmin', 'Administrator', 'administrator'].includes(data.role)) {
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
        setActiveTab("dashboard");
        sessionStorage.removeItem("ms-admin-session");
        localStorage.removeItem("ms-admin-active-tab");
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

    const renderContent = () => {
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
                                src="/logo-new.png"
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
                                setShowIDScanner(true);
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

                        <IDScannerModal
                            isOpen={showIDScanner}
                            onClose={() => {
                                setShowIDScanner(false);
                                setPendingUser(null);
                                setIsLoading(false);
                            }}
                            onSuccess={(userData) => {
                                setIsLoggedIn(true);
                                setCurrentUser(userData);
                                sessionStorage.setItem("ms-admin-session", JSON.stringify(userData));
                                toast.success(`Welcome back ${userData.username} (ID Verified)`);
                                setShowIDScanner(false);
                                setPendingUser(null);
                            }}
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
            { id: "portfolio", label: "Project Tracker", icon: Briefcase },
            { id: "portfolio-front", label: "Portfolio Front", icon: ImageIcon },
            { id: "testimonials", label: "Testimonials", icon: MessageSquare },
            { id: "services", label: "Services Old", icon: Layers },
            { id: "services-showcase", label: "Services Showcase", icon: Monitor },
            { id: "blog", label: "Blog Articles", icon: FileText },
            { id: "bookings", label: "Bookings", icon: Calendar },
            { id: "careers", label: "Careers", icon: Briefcase },
            { id: "payments", label: "Payments", icon: CreditCard },
            { id: "assets", label: "Assets", icon: Package },
            { id: "reels", label: "Reels", icon: Video },
            { id: "messages", label: "Messages", icon: MessageSquare },
            { id: "settings", label: "Settings", icon: Settings },
            // Management sections for Super Admin
            ...(['super_admin', 'superadmin', 'Administrator', 'administrator'].includes(currentUser?.role) ? [
                { id: "team", label: "Team", icon: Users },
                { id: "id-cards", label: "ID Cards", icon: IdCard },
                { id: "certifications", label: "Certifications", icon: Award },
                { id: "global-network", label: "Global Network", icon: Globe },
                { id: "audit", label: "Audit Logs", icon: Shield }
            ] : [])
        ];

        return (
            <>
                {/* Global preloader in App.tsx handles the initial load */}
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
                        <div className="p-6 relative flex-1 flex flex-col overflow-hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="absolute right-4 top-6 md:hidden text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <div className="flex items-center gap-3 mb-8 px-2 shrink-0">
                                <img src="/logo-new.png" alt="Logo" className="h-8 w-8 rounded-lg object-contain bg-white/5 p-1 ring-1 ring-white/10 shadow-sm" />
                                <div className="font-semibold text-lg text-white tracking-tight">Portal</div>
                            </div>

                            <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
                                {menuItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActiveTab(item.id);
                                            localStorage.setItem("ms-admin-active-tab", item.id);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden text-sm font-bold ${activeTab === item.id
                                            ? 'bg-white/5 text-white ring-1 ring-white/10 shadow-[0_4px_20px_-10px_rgba(255,255,255,0.1)]'
                                            : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                                            }`}
                                    >
                                        <div className={`flex items-center justify-center h-5 w-5 shrink-0 transition-colors duration-300 ${activeTab === item.id ? 'text-primary' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                            <item.icon className="h-4 w-4" />
                                        </div>
                                        <span className="truncate whitespace-nowrap overflow-hidden text-left flex-1 min-w-0">{item.label}</span>

                                        {activeTab === item.id && (
                                            <>
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
                                                <div className="absolute inset-x-0 inset-y-0 border border-white/5 rounded-xl pointer-events-none" />
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                            </>
                                        )}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="mt-auto border-t border-white/5 px-4 py-6 space-y-6 bg-black/20 shrink-0">
                            <button
                                onClick={() => setShowIDCard(true)}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 rounded-xl transition-all group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <IdCard className="h-5 w-5 text-slate-400 group-hover:text-purple-400 transition-colors" />
                                <span className="text-sm font-bold text-slate-500 group-hover:text-white transition-colors uppercase tracking-tight">Access ID</span>
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500 group-hover:animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                            </button>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/5">
                                    {currentUser?.avatar_url ? (
                                        <img
                                            src={currentUser.avatar_url}
                                            alt={currentUser.username}
                                            className="h-10 w-10 rounded-lg object-cover ring-1 ring-white/10 shadow-lg"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center font-bold text-xs text-white ring-1 ring-white/10">
                                            {currentUser?.username?.substring(0, 2).toUpperCase() || "AD"}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-white truncate leading-none mb-1">{currentUser?.username || "Admin"}</div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none">Root</div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all group font-bold text-sm border border-transparent hover:border-rose-500/20"
                                >
                                    <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 md:ml-64 bg-[#070510] min-h-screen transition-all duration-300 flex flex-col">

                        {/* DIAGNOSTIC BANNER */}
                        {isLoggedIn && connectionStatus === 'mock' && (
                            <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 flex items-center justify-center gap-3 text-amber-200 text-sm font-medium animate-in slide-in-from-top-2">
                                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                                <div className="flex flex-col md:flex-row md:items-center gap-1">
                                    <span>Started in <strong>Offline Mode</strong>. Real data is hidden because Env Vars are missing/invalid.</span>
                                    <span className="opacity-70 text-xs md:ml-2">Fix VITE_SERVICES_SUPABASE_URL in Netlify.</span>
                                </div>
                            </div>
                        )}

                        {isLoggedIn && connectionStatus === 'error' && (
                            <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-3 flex items-center justify-center gap-3 text-red-200 text-sm font-medium animate-in slide-in-from-top-2">
                                <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                                <div>
                                    <span className="font-bold">Database Connection Error:</span> {connectionError}
                                    <div className="text-xs opacity-70 mt-0.5">Check CORS settings in Supabase or URL format in Netlify.</div>
                                </div>
                            </div>
                        )}

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
                                    {activeTab?.replace('_', ' ') || ''}
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
                                        onClick={() => window.location.reload()}
                                        className="h-9 w-9 rounded-md hover:bg-white/5 text-slate-400 hover:text-white group"
                                        title="Refresh current page"
                                    >
                                        <RefreshCw className="h-4 w-4 group-active:-rotate-180 transition-transform duration-500 ease-out" />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setActiveTab("notifications");
                                            localStorage.setItem("ms-admin-active-tab", "notifications");
                                        }}
                                        className="relative h-9 w-9 rounded-md hover:bg-white/5 text-slate-400 hover:text-white"
                                        title="View Notifications"
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

                                {activeTab === "portfolio-front" && (
                                    <motion.div
                                        key="portfolio-front"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <PortfolioFrontSection />
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

                                {activeTab === "services-showcase" && (
                                    <motion.div
                                        key="services-showcase"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ServicesShowcaseSection />
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


                                {activeTab === "blog" && (
                                    <motion.div
                                        key="blog"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <BlogSection />
                                    </motion.div>
                                )}

                                {activeTab === "careers" && (
                                    <motion.div
                                        key="careers"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <CareersSection />
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

                                {activeTab === "audit" && ['super_admin', 'superadmin', 'Administrator', 'administrator'].includes(currentUser?.role) && (
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

                                {activeTab === "reels" && (
                                    <motion.div
                                        key="reels"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ReelsSection />
                                    </motion.div>
                                )}

                                {activeTab === "team" && (
                                    <motion.div
                                        key="team"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <EmployeesSection />
                                    </motion.div>
                                )}

                                {activeTab === "id-cards" && (
                                    <motion.div
                                        key="id-cards"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <IDCardsSection />
                                    </motion.div>
                                )}

                                {activeTab === "certifications" && (
                                    <motion.div
                                        key="certifications"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <CertificationsManagementSection />
                                    </motion.div>
                                )}

                                {activeTab === "global-network" && (
                                    <motion.div
                                        key="global-network"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ClientNetworkManagementSection />
                                    </motion.div>
                                )}

                                {/* Fallback for other tabs until implemented */}
                                {!["dashboard", "leads", "portfolio", "portfolio-front", "testimonials", "services", "services-showcase", "settings", "notifications", "bookings", "payments", "messages", "audit", "assets", "reels", "team", "id-cards", "careers", "blog", "certifications", "global-network"].includes(activeTab) && (
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

                    <IDCardModal
                        isOpen={showIDCard}
                        onClose={() => setShowIDCard(false)}
                        user={currentUser}
                    />
                </div>
            </>
        );
    };

    return (
        <>
            <AnimatePresence>
                {showIntro && <Preloader />}
            </AnimatePresence>
            {renderContent()}
        </>
    );
};

export default Admin;
