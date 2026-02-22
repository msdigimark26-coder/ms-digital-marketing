import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, CreditCard, Bell, ChevronDown, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

const navLinks = [
	{ name: "Home", path: "/" },
	{ name: "About Us", path: "/about" },
	{
		name: "Services",
		path: "/services",
		subLinks: [
			{ name: "Web Design", path: "/services/web-design" },
			{ name: "SEO Services", path: "/services/seo-services" },
			{ name: "Meta Ads", path: "/services/meta-ads" },
			{ name: "Google Ads", path: "/services/google-ads" },
			{ name: "Video & Photo Editing", path: "/services/video-photo-editing" },
			{ name: "3D Modeling", path: "/services/3d-modeling" },
			{ name: "Social Media Marketing", path: "/services/social-media-marketing" },
			{ name: "PPC & Paid Advertising", path: "/services/ppc-paid-advertising" },
			{ name: "UI/UX Design", path: "/services/uiux-design" }
		]
	},
	{ name: "Portfolio", path: "/portfolio" },
	{ name: "Testimonials", path: "/testimonials" },
	{ name: "Blog", path: "/blog" },
	{ name: "Careers", path: "/careers" },
	{ name: "Contact", path: "/contact" },
];

interface Notification {
	id: string;
	title: string;
	message: string;
	image?: string;
	timestamp: number;
}

const LogoImage = () => {
	return (
		<img
			src="/logo-new.png"
			alt="MS DIGIMARK"
			className="h-5 md:h-7 lg:h-8 w-auto object-contain"
			decoding="async"
			loading="eager"
			role="img"
			aria-hidden={false}
			style={{ display: "block" }}
		/>
	);
};

export const Header = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [showNotifications, setShowNotifications] = useState(false);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
	const location = useLocation();
	const { user, signOut } = useAuth();

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
					const dismissedAt = dismissedStore[n.id];
					if (!dismissedAt) return true;

					// Version check: only show if the DB timestamp is strictly newer than what was dismissed
					const currentVersion = new Date(n.updated_at || n.created_at).getTime();
					return currentVersion > dismissedAt;
				})
				.map(n => ({
					id: n.id,
					title: n.title,
					message: n.message,
					image: n.image || undefined,
					timestamp: new Date(n.updated_at || n.created_at).getTime()
				}));

			setNotifications(filtered);
		} catch (error) {
			console.error("Error loading notifications:", error);
		}
	};

	useEffect(() => {
		let ticking = false;
		const handleScroll = () => {
			if (!ticking) {
				window.requestAnimationFrame(() => {
					setScrolled(window.scrollY > 50);
					ticking = false;
				});
				ticking = true;
			}
		};
		window.addEventListener("scroll", handleScroll, { passive: true });

		loadNotifications();

		const channel = supabase
			.channel('header_notifications')
			.on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
				loadNotifications();
			})
			.subscribe();

		return () => {
			window.removeEventListener("scroll", handleScroll);
			supabase.removeChannel(channel);
		};
	}, []);

	const clearNotification = (id: string) => {
		const notifToClear = notifications.find(n => n.id === id);
		if (!notifToClear) return;

		const dismissedStore = JSON.parse(localStorage.getItem("msdigimark_dismissed_notifications_v3") || "{}");
		// Use the notification's own timestamp as the "version" we've dismissed
		dismissedStore[id] = notifToClear.timestamp;
		localStorage.setItem("msdigimark_dismissed_notifications_v3", JSON.stringify(dismissedStore));

		const updated = notifications.filter(n => n.id !== id);
		setNotifications(updated);
	};

	const handleViewDetails = (n: Notification) => {
		setSelectedNotif(n);
		setIsDetailsOpen(true);
		setShowNotifications(false); // Close dropdown when opening details
	};

	return (
		<>
			<motion.header
				initial={{ y: -100 }}
				animate={{ y: 0 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
				className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass py-3" : "bg-transparent py-6"
					}`}
			>
				<div className="container mx-auto px-4">
					<nav className="flex items-center justify-center gap-8 relative">
						{/* Logo - positioned left */}
						<Link to="/" className="flex items-center gap-2 group absolute left-0">
							<motion.div
								whileHover={{ scale: 1.05 }}
								className="relative flex items-center gap-3"
							>
								<LogoImage />
								<span className="sr-only">MS DIGIMARK</span>
								<div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300" />
							</motion.div>
						</Link>

						{/* Desktop Navigation - Centered */}
						<div className="hidden lg:flex items-center gap-8">
							{navLinks.map((link) => (
								<div key={link.path} className="relative group">
									<Link to={link.path} className="flex items-center gap-1 py-4">
										<span
											className={`text-[13px] font-medium transition-colors duration-300 ${location.pathname === link.path || (link.subLinks && location.pathname.startsWith(link.path))
												? "text-primary"
												: "text-foreground/70 group-hover:text-foreground"
												}`}
										>
											{link.name}
										</span>
										{link.subLinks && (
											<ChevronDown className={`h-4 w-4 transition-transform duration-300 group-hover:rotate-180 ${location.pathname.startsWith(link.path) ? "text-primary" : "text-foreground/70"}`} />
										)}
										<span
											className={`absolute bottom-3 left-0 h-0.5 bg-gradient-primary transition-all duration-300 ${location.pathname === link.path
												? "w-full"
												: "w-0 group-hover:w-full"
												}`}
										/>
									</Link>

									{/* Dropdown Menu */}
									{link.subLinks && (
										<div className="absolute top-full left-0 w-48 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
											<div className="glass-card p-2 rounded-xl border border-white/10 shadow-xl bg-[#0A051A]/95 backdrop-blur-md">
												{link.subLinks.map((subLink) => (
													<Link
														key={subLink.path}
														to={subLink.path}
														className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
													>
														{subLink.name}
													</Link>
												))}
											</div>
										</div>
									)}
								</div>
							))}
						</div>

						{/* Right Side Actions */}
						<div className="absolute right-0 flex items-center gap-1 sm:gap-4">
							{/* Notification Bell */}
							<div className="relative">
								<button
									onClick={() => setShowNotifications(!showNotifications)}
									className={`p-2.5 rounded-xl transition-all duration-300 relative group/bell ${showNotifications
										? "bg-primary/20 text-primary border border-primary/30"
										: "text-foreground/70 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
										}`}
									aria-label="Toggle notifications"
								>
									<Bell className={`h-5 w-5 transition-transform duration-500 ${showNotifications ? "scale-110" : "group-hover/bell:rotate-12"}`} />
									{notifications.length > 0 && (
										<span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-[#0A051A] shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
									)}
								</button>

								<AnimatePresence>
									{showNotifications && (
										<motion.div
											initial={{ opacity: 0, y: 15, scale: 0.95 }}
											animate={{ opacity: 1, y: 0, scale: 1 }}
											exit={{ opacity: 0, y: 15, scale: 0.95 }}
											className="fixed md:absolute right-4 left-4 md:right-0 md:left-auto mt-4 w-[calc(100vw-2rem)] md:w-[380px] bg-[#1a1a24]/85 backdrop-blur-2xl border border-white/20 rounded-[1.5rem] md:rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 md:p-6 z-[100] overflow-hidden"
										>
											{/* Header Area */}
											<div className="flex items-center justify-between mb-4 md:mb-5 px-1">
												<h3 className="font-bold text-base md:text-lg text-white">Notifications</h3>
												{notifications.length > 0 && (
													<span className="text-[9px] md:text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 md:px-2.5 py-0.5 md:py-1 rounded-full border border-purple-500/20">
														{notifications.length} New
													</span>
												)}
											</div>

											{/* List Area */}
											<div className="space-y-2.5 md:space-y-3 max-h-[60vh] md:max-h-[420px] overflow-y-auto pr-1 custom-scrollbar scroll-smooth">
												{notifications.length === 0 ? (
													<div className="text-center py-8 md:py-12 px-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5">
														<Bell className="h-6 w-6 md:h-8 md:w-8 text-slate-600 mx-auto mb-2 md:mb-3 opacity-50" />
														<p className="text-xs md:text-sm text-slate-400 font-medium italic">No new notifications</p>
													</div>
												) : (
													notifications.map(n => (
														<motion.div
															key={n.id}
															initial={{ opacity: 0, x: -10 }}
															animate={{ opacity: 1, x: 0 }}
															onClick={() => handleViewDetails(n)}
															className="flex gap-3 md:gap-4 p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 group/item cursor-pointer relative"
														>
															<div className="relative flex-shrink-0">
																<div className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border border-white/10 overflow-hidden shadow-md">
																	{n.image ? (
																		<img src={n.image} className="w-full h-full object-cover" />
																	) : (
																		<Bell className="h-4 w-4 md:h-6 md:w-6 text-white" />
																	)}
																</div>
															</div>

															<div className="flex-1 min-w-0 pr-6">
																<h4 className="text-[11px] md:text-sm font-bold text-white truncate mb-0.5 group-hover/item:text-purple-300 transition-colors">
																	{n.title}
																</h4>
																<p className="text-[10px] md:text-xs text-slate-400 line-clamp-2 leading-snug">
																	{n.message}
																</p>
																<div className="mt-1.5 md:mt-2 flex items-center gap-2">
																	<span className="text-[8px] md:text-[9px] font-medium text-slate-500">
																		{new Date(n.timestamp).toLocaleDateString(undefined, {
																			month: 'short',
																			day: 'numeric'
																		})}
																	</span>
																</div>
															</div>

															<button
																onClick={(e) => {
																	e.stopPropagation();
																	clearNotification(n.id);
																}}
																className="absolute top-2.5 md:top-3 right-2.5 md:right-3 opacity-0 md:group-hover/item:opacity-100 p-1 md:p-1.5 rounded-full bg-white/5 hover:bg-white/20 text-slate-400 hover:text-white transition-all shadow-sm"
																title="Dismiss"
															>
																<X className="h-2.5 w-2.5 md:h-3 md:w-3" />
															</button>
														</motion.div>
													))
												)}
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>

							{/* Book Appointment Button */}
							<Link to="/book-appointment">
								<Button size="sm" className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hidden sm:flex">
									<Calendar className="h-4 w-4" />
									Book Now
								</Button>
							</Link>

							{/* Payments Button */}
							<Link to="/payments">
								<Button size="sm" className="gap-2 bg-gradient-primary hover:opacity-90 text-white hidden sm:flex">
									<CreditCard className="h-4 w-4" />
									Payments
								</Button>
							</Link>
							<Link to="/payments" className="sm:hidden">
								<Button size="icon" className="h-9 w-9 bg-gradient-primary hover:opacity-90 text-white">
									<CreditCard className="h-4 w-4" />
								</Button>
							</Link>

							{user && (
								<Button
									variant="outline"
									size="sm"
									onClick={signOut}
									className="gap-2 border-primary/50 hover:border-primary hidden lg:flex"
								>
									<LogOut className="h-4 w-4" />
									Sign Out
								</Button>
							)}


							{/* Mobile Menu Button */}
							<button
								onClick={() => setIsOpen(!isOpen)}
								className="lg:hidden p-2 text-foreground hover:text-primary transition-colors"
								aria-label="Toggle menu"
							>
								{isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
							</button>
						</div>
					</nav>
				</div>

				{/* Mobile Menu */}
				<AnimatePresence>
					{isOpen && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.3 }}
							className="lg:hidden glass border-t border-border/50 overflow-hidden"
						>
							<div className="container mx-auto px-4 py-6 space-y-2">
								{navLinks.map((link) => (
									<div key={link.path}>
										<Link
											to={link.path}
											onClick={() => !link.subLinks && setIsOpen(false)}
											className={`block py-2 text-lg font-medium transition-colors ${location.pathname === link.path
												? "text-primary"
												: "text-foreground/70"
												}`}
										>
											{link.name}
										</Link>
										{/* Mobile Sublinks */}
										{link.subLinks && (
											<div className="pl-4 space-y-2 mt-1 border-l-2 border-white/10 ml-2">
												{link.subLinks.map((subLink) => (
													<Link
														key={subLink.path}
														to={subLink.path}
														onClick={() => setIsOpen(false)}
														className={`block py-1.5 text-base text-slate-400 hover:text-white transition-colors ${location.pathname === subLink.path ? "text-primary" : ""
															}`}
													>
														{subLink.name}
													</Link>
												))}
											</div>
										)}
									</div>
								))}
								<div className="pt-4 border-t border-border/50 space-y-3 mt-4">
									<Link to="/payments" onClick={() => setIsOpen(false)}>
										<Button className="w-full gap-2 bg-gradient-primary text-white">
											<CreditCard className="h-4 w-4" />
											Payments
										</Button>
									</Link>
									{user && (
										<Button
											variant="ghost"
											className="w-full gap-2"
											onClick={() => {
												signOut();
												setIsOpen(false);
											}}
										>
											<LogOut className="h-4 w-4" />
											Sign Out
										</Button>
									)}
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</motion.header>

			{/* Notification Detail Dialog */}
			<Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
				<DialogContent className="sm:max-w-xl bg-[#0F0A1F] border-white/10 p-0 overflow-hidden shadow-2xl z-[9999]">
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
						<div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
							<p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm md:text-base">
								{selectedNotif?.message}
							</p>
						</div>

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
