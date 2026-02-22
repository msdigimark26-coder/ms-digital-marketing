import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, CreditCard, Bell, ChevronDown, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

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
					const lastDismissedAt = dismissedStore[n.id];
					if (!lastDismissedAt) return true;

					// If updated since last dismissal, show again
					const updatedAt = n.updated_at ? new Date(n.updated_at).getTime() : 0;
					return updatedAt > lastDismissedAt;
				})
				.map(n => ({
					id: n.id,
					title: n.title,
					message: n.message,
					image: n.image || undefined,
					timestamp: n.updated_at ? new Date(n.updated_at).getTime() : (n.created_at ? new Date(n.created_at).getTime() : Date.now())
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
		const dismissedStore = JSON.parse(localStorage.getItem("msdigimark_dismissed_notifications_v3") || "{}");
		dismissedStore[id] = Date.now();
		localStorage.setItem("msdigimark_dismissed_notifications_v3", JSON.stringify(dismissedStore));

		const updated = notifications.filter(n => n.id !== id);
		setNotifications(updated);
	};

	return (
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
								className="p-2 text-foreground/70 hover:text-primary transition-colors relative"
								aria-label="Toggle notifications"
							>
								<Bell className="h-5 w-5" />
								{notifications.length > 0 && (
									<span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
								)}
							</button>

							<AnimatePresence>
								{showNotifications && (
									<motion.div
										initial={{ opacity: 0, y: 10, scale: 0.95 }}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										exit={{ opacity: 0, y: 10, scale: 0.95 }}
										className="absolute right-0 mt-4 w-80 glass-card p-4 shadow-2xl z-50 border-primary/20"
									>
										<div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
											<h3 className="font-semibold">Notifications</h3>
											<span className="text-xs text-muted-foreground">{notifications.length} New</span>
										</div>
										<div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
											{notifications.length === 0 ? (
												<div className="text-center py-8 text-muted-foreground italic">
													No new notifications
												</div>
											) : (
												notifications.map(n => (
													<div key={n.id} className="flex gap-3 group/item">
														{n.image && (
															<img src={n.image} className="w-10 h-10 rounded object-cover flex-shrink-0" />
														)}
														<div className="flex-1 min-w-0">
															<h4 className="text-xs font-bold truncate text-primary">{n.title}</h4>
															<p className="text-[10px] text-muted-foreground line-clamp-2">{n.message}</p>
															<span className="text-[8px] text-muted-foreground/50 mt-1 block">
																{new Date(n.timestamp).toLocaleDateString()}
															</span>
														</div>
														<button
															onClick={() => clearNotification(n.id)}
															className="opacity-0 group-hover/item:opacity-100 p-1 hover:text-primary transition-all text-muted-foreground"
															title="Dismiss"
														>
															<X className="h-3 w-3" />
														</button>
													</div>
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
	);
};
