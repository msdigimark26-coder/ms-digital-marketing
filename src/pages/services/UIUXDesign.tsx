import { Layout } from "@/components/layout/Layout";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useState } from "react";
import {
    Palette,
    Users,
    Zap,
    MousePointer2,
    ArrowRight,
    CheckCircle2,
    Sparkles,
    Layers,
    PenTool,
    Smartphone,
    Monitor,
    Tablet,
    Eye,
    Heart,
    TrendingUp,
    Award,
    Target,
    Layout as LayoutIcon,
    Figma,
    Download,
    Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const services = [
    {
        icon: PenTool,
        title: "User Research",
        description: "Deep dive into user behavior, needs, and pain points to create data-driven design solutions.",
        features: ["User Interviews", "Persona Development", "Journey Mapping", "Usability Testing"]
    },
    {
        icon: LayoutIcon,
        title: "Wireframing & Prototyping",
        description: "Transform ideas into interactive prototypes that bring your vision to life before development.",
        features: ["Low-Fi Wireframes", "High-Fi Mockups", "Interactive Prototypes", "Design Systems"]
    },
    {
        icon: Palette,
        title: "Visual Design",
        description: "Create stunning, on-brand interfaces that captivate users and enhance your digital presence.",
        features: ["UI Design", "Brand Integration", "Iconography", "Color Theory"]
    },
    {
        icon: Smartphone,
        title: "Mobile App Design",
        description: "Native iOS and Android designs optimized for touch interactions and mobile experiences.",
        features: ["iOS Design", "Android Design", "Touch Gestures", "Responsive Layouts"]
    },
    {
        icon: Monitor,
        title: "Web App Design",
        description: "Responsive web applications that work seamlessly across all devices and screen sizes.",
        features: ["Responsive Design", "Progressive Web Apps", "Dashboard Design", "SaaS Platforms"]
    },
    {
        icon: MousePointer2,
        title: "Interaction Design",
        description: "Micro-interactions and animations that delight users and improve overall user experience.",
        features: ["Micro-interactions", "Animation Design", "Feedback Systems", "Loading States"]
    }
];

const stats = [
    { number: "250+", label: "Designs Delivered", icon: Award },
    { number: "98%", label: "Client Satisfaction", icon: Heart },
    { number: "3.5x", label: "Conversion Increase", icon: TrendingUp },
    { number: "24/7", label: "Design Support", icon: Eye }
];

const process = [
    {
        number: "01",
        icon: Users,
        title: "Discover",
        description: "Understanding your users, business goals, and competitive landscape"
    },
    {
        number: "02",
        icon: Target,
        title: "Define",
        description: "Creating user personas, journey maps, and defining design requirements"
    },
    {
        number: "03",
        icon: Layers,
        title: "Design",
        description: "Crafting wireframes, prototypes, and high-fidelity visual designs"
    },
    {
        number: "04",
        icon: Zap,
        title: "Develop",
        description: "Collaborating with developers to ensure pixel-perfect implementation"
    },
    {
        number: "05",
        icon: TrendingUp,
        title: "Deliver",
        description: "Testing, iterating, and launching designs that exceed expectations"
    }
];

const platforms = [
    { name: "Mobile", icon: Smartphone, description: "iOS & Android" },
    { name: "Web", icon: Monitor, description: "Responsive" },
    { name: "Tablet", icon: Tablet, description: "iPad & Android" },
    { name: "Desktop", icon: Monitor, description: "Windows & Mac" }
];

// Census App Project Images
const censusAppImages = [
    {
        path: "/projects/census-app/Group 13.png",
        title: "Login Screen",
        description: "Clean authentication interface"
    },
    {
        path: "/projects/census-app/Sign Up Page.png",
        title: "Sign Up Flow",
        description: "Intuitive registration process"
    },
    {
        path: "/projects/census-app/sing up page 2.png",
        title: "User Onboarding",
        description: "Seamless user experience"
    },
    {
        path: "/projects/census-app/Census Form.png",
        title: "Census Form",
        description: "Complex form made simple"
    },
    {
        path: "/projects/census-app/Form Sumbit.png",
        title: "Success State",
        description: "Delightful confirmation"
    },
    {
        path: "/projects/census-app/Public user.png",
        title: "User Dashboard",
        description: "Information architecture"
    },
    {
        path: "/projects/census-app/Group 15.png",
        title: "Data Collection",
        description: "Smart form design"
    },
    {
        path: "/projects/census-app/Group 16.png",
        title: "App Navigation",
        description: "Intuitive user flow"
    }
];

const UIUXDesign = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const [hoveredImage, setHoveredImage] = useState<number | null>(null);

    // Parallax effects
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -300]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, 300]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.2]);
    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.6], [1, 0.5, 0]);

    // Smooth spring animation
    const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
    const scaleSpring = useSpring(scale, springConfig);

    return (
        <Layout>
            <div ref={containerRef}>
                {/* Hero Section with Parallax */}
                <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                    <div className="absolute inset-0 bg-[#05030e]">
                        {/* Animated Grid */}
                        <motion.div
                            style={{ y: y1 }}
                            className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
                        ></motion.div>

                        {/* Dynamic Gradients */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_20%_30%,#a855f715,transparent)]"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_80%_70%,#ec489915,transparent)]"></div>

                        {/* Floating 3D Shapes */}
                        <div className="absolute inset-0">
                            <motion.div
                                animate={{
                                    y: [0, -30, 0],
                                    rotate: [0, 10, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl backdrop-blur-sm border border-purple-500/30 rotate-12"
                                style={{ transform: "perspective(1000px) rotateX(20deg)" }}
                            ></motion.div>
                            <motion.div
                                animate={{
                                    y: [0, 20, 0],
                                    rotate: [0, -10, 0],
                                    scale: [1, 1.2, 1]
                                }}
                                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full backdrop-blur-sm border border-pink-500/30"
                            ></motion.div>
                            <motion.div
                                animate={{
                                    y: [0, -40, 0],
                                    x: [0, 20, 0],
                                    rotate: [0, 15, 0]
                                }}
                                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                                className="absolute top-1/2 right-1/3 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl backdrop-blur-sm border border-purple-500/30 -rotate-12"
                            ></motion.div>
                        </div>

                        {/* Floating Icons */}
                        <div className="absolute inset-0 opacity-10">
                            {[Palette, PenTool, MousePointer2, Layers, Figma, Star].map((Icon, index) => (
                                <motion.div
                                    key={index}
                                    animate={{
                                        y: [0, index % 2 === 0 ? -20 : 20, 0],
                                        rotate: [0, index % 2 === 0 ? 5 : -5, 0],
                                        opacity: [0.3, 0.6, 0.3]
                                    }}
                                    transition={{
                                        duration: 5 + index,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: index * 0.5
                                    }}
                                    className="absolute"
                                    style={{
                                        top: `${20 + index * 12}%`,
                                        left: `${10 + index * 15}%`
                                    }}
                                >
                                    <Icon className="w-16 h-16 text-purple-500" />
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="container px-4 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                            className="text-center max-w-5xl mx-auto"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 text-sm font-medium mb-8"
                            >
                                <Sparkles className="w-4 h-4 animate-pulse" />
                                Design That Converts
                            </motion.div>

                            <motion.h1
                                className="font-display text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-tight"
                                style={{ scale: scaleSpring, opacity }}
                            >
                                UI/UX <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 relative inline-block">
                                    <motion.span
                                        animate={{
                                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                                        }}
                                        transition={{ duration: 5, repeat: Infinity }}
                                        style={{
                                            backgroundSize: "200% 200%"
                                        }}
                                        className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 text-transparent bg-clip-text"
                                    >
                                        Design
                                    </motion.span>
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [0.3, 0.6, 0.3]
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute -inset-2 blur-3xl bg-purple-500/20 -z-10 rounded-full"
                                    ></motion.div>
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 font-light"
                            >
                                Craft intuitive interfaces users love. We design user-centric digital experiences that delight and convert.
                            </motion.p>

                            {/* Platform Pills */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="flex flex-wrap justify-center gap-4 mb-12"
                            >
                                {platforms.map((platform, index) => (
                                    <motion.div
                                        key={platform.name}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.8 + index * 0.1, type: "spring" }}
                                        whileHover={{ scale: 1.1, y: -5 }}
                                        className="group px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all cursor-pointer backdrop-blur-sm"
                                    >
                                        <div className="flex items-center gap-2">
                                            <platform.icon className="w-5 h-5 text-purple-400 group-hover:text-pink-400 transition-colors" />
                                            <div>
                                                <div className="text-sm font-semibold text-white">{platform.name}</div>
                                                <div className="text-xs text-slate-400">{platform.description}</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 }}
                                className="flex flex-col sm:flex-row items-center justify-center gap-6"
                            >
                                <Link to="/">
                                    <Button variant="outline" size="lg" className="border-purple-500/30 text-white hover:bg-purple-500/10 text-lg h-14 px-8 rounded-full font-medium transition-all group">
                                        <ArrowRight className="mr-2 h-5 w-5 rotate-180 group-hover:-translate-x-1 transition-transform" /> Back to Home
                                    </Button>
                                </Link>
                                <Link to="/contact">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button size="lg" className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white hover:opacity-90 text-lg h-14 px-8 rounded-full font-bold shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all relative overflow-hidden group">
                                            <motion.div
                                                animate={{
                                                    x: ["-100%", "100%"]
                                                }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                            />
                                            <span className="relative">Let's Create Magic <Sparkles className="ml-2 h-5 w-5 inline" /></span>
                                        </Button>
                                    </motion.div>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Animated Scroll Indicator */}
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    >
                        <div className="w-6 h-10 border-2 border-purple-500 rounded-full flex justify-center p-1">
                            <motion.div
                                animate={{ y: [0, 16, 0], opacity: [1, 0, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-1 h-3 bg-purple-500 rounded-full"
                            ></motion.div>
                        </div>
                    </motion.div>
                </section>

                {/* Stats Section with Parallax */}
                <section className="py-20 bg-[#070510] border-y border-white/5 relative overflow-hidden">
                    <motion.div style={{ y: y2 }} className="absolute inset-0 opacity-30">
                        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
                    </motion.div>

                    <div className="container px-4 relative z-10">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    whileHover={{ scale: 1.05, y: -10 }}
                                    className="text-center group cursor-pointer"
                                >
                                    <motion.div
                                        className="flex justify-center mb-3"
                                        whileHover={{ rotate: 360 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all">
                                            <stat.icon className="w-6 h-6 text-purple-400" />
                                        </div>
                                    </motion.div>
                                    <motion.div
                                        className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2"
                                        whileHover={{ scale: 1.1 }}
                                    >
                                        {stat.number}
                                    </motion.div>
                                    <div className="text-slate-400 text-sm md:text-base font-light">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Recent Work - Census App Showcase */}
                <section className="py-32 bg-[#05030e] relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_1000px_at_50%_50%,#a855f708,transparent)]"></div>

                    <div className="container px-4 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-20"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 text-sm font-medium mb-6">
                                <Award className="w-4 h-4" />
                                Featured Project
                            </div>
                            <h2 className="font-display text-4xl md:text-6xl font-bold mb-6">
                                Recent <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Work</span>
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                Census App - A comprehensive mobile application designed to simplify data collection with beautiful, intuitive interfaces.
                            </p>
                        </motion.div>

                        {/* Image Gallery with 3D Effects */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
                            {censusAppImages.map((image, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 50, rotateY: -15 }}
                                    whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.6 }}
                                    viewport={{ once: true }}
                                    whileHover={{
                                        scale: 1.05,
                                        rotateY: 5,
                                        z: 50,
                                        transition: { duration: 0.3 }
                                    }}
                                    onHoverStart={() => setHoveredImage(index)}
                                    onHoverEnd={() => setHoveredImage(null)}
                                    className="group relative cursor-pointer"
                                    style={{
                                        perspective: "1000px",
                                        transformStyle: "preserve-3d"
                                    }}
                                >
                                    <div className="relative rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/30 transition-all shadow-lg hover:shadow-[0_20px_50px_-10px_rgba(168,85,247,0.3)] bg-gradient-to-br from-purple-500/5 to-pink-500/5 backdrop-blur-sm">
                                        {/* Image */}
                                        <div className="aspect-[9/16] overflow-hidden">
                                            <motion.img
                                                src={image.path}
                                                alt={image.title}
                                                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                                                whileHover={{ scale: 1.1 }}
                                            />
                                        </div>

                                        {/* Overlay */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: hoveredImage === index ? 1 : 0 }}
                                            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4"
                                        >
                                            <h3 className="text-white font-bold text-sm mb-1">{image.title}</h3>
                                            <p className="text-slate-300 text-xs">{image.description}</p>
                                        </motion.div>

                                        {/* Animated Border Glow */}
                                        <motion.div
                                            animate={{
                                                opacity: hoveredImage === index ? [0.5, 1, 0.5] : 0
                                            }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute inset-0 rounded-2xl border-2 border-purple-500/50 pointer-events-none"
                                        />
                                    </div>

                                    {/* 3D Shadow Effect */}
                                    <motion.div
                                        animate={{
                                            opacity: hoveredImage === index ? 0.6 : 0,
                                            scale: hoveredImage === index ? 1.02 : 1
                                        }}
                                        className="absolute -inset-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl -z-10"
                                    />
                                </motion.div>
                            ))}
                        </div>

                        {/* Download Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mt-16"
                        >
                            <Link to="/portfolio">
                                <Button size="lg" variant="outline" className="border-purple-500/30 text-white hover:bg-purple-500/10 text-lg h-14 px-8 rounded-full font-medium transition-all group">
                                    View Full Portfolio <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* Services Grid */}
                <section className="py-32 bg-[#070510] relative">
                    <div className="container px-4">
                        <div className="text-center mb-24">
                            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                                Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">UI/UX Services</span>
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                Comprehensive design solutions that transform ideas into delightful digital experiences.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((service, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    whileHover={{
                                        y: -10,
                                        transition: { duration: 0.3 }
                                    }}
                                    className="group p-8 rounded-2xl bg-[#0f0a1f] border border-white/5 hover:border-purple-500/30 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.2)] relative overflow-hidden"
                                >
                                    {/* Animated Background */}
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0, 0.1, 0]
                                        }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl"
                                    />

                                    <div className="relative">
                                        <motion.div
                                            whileHover={{ rotate: 360, scale: 1.2 }}
                                            transition={{ duration: 0.6 }}
                                            className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6 border border-purple-500/30"
                                        >
                                            <service.icon className="w-7 h-7 text-purple-400" />
                                        </motion.div>

                                        <h3 className="text-xl font-bold text-white mb-4">{service.title}</h3>
                                        <p className="text-slate-400 leading-relaxed font-light mb-6">
                                            {service.description}
                                        </p>

                                        <div className="space-y-2">
                                            {service.features.map((feature, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    viewport={{ once: true }}
                                                    className="flex items-center gap-2 text-sm text-slate-500"
                                                >
                                                    <CheckCircle2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Process Section */}
                <section className="py-32 bg-[#05030e] relative overflow-hidden">
                    <div className="container px-4 relative z-10">
                        <div className="text-center mb-24">
                            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                                Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Design Process</span>
                            </h2>
                            <p className="text-muted-foreground text-lg">
                                A proven methodology that delivers exceptional results.
                            </p>
                        </div>

                        <div className="max-w-5xl mx-auto">
                            <div className="relative">
                                {/* Connecting Line */}
                                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/50 via-pink-500/50 to-purple-500/50 hidden md:block -translate-x-1/2"></div>

                                <div className="space-y-12">
                                    {process.map((step, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.6, delay: index * 0.1 }}
                                            viewport={{ once: true }}
                                            className={`flex flex-col md:flex-row items-start md:items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                                                }`}
                                        >
                                            {/* Content */}
                                            <div className={`flex-1 ${index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                                                <motion.div
                                                    whileHover={{ scale: 1.05, y: -5 }}
                                                    className={`p-6 rounded-2xl bg-[#0f0a1f] border border-white/5 hover:border-purple-500/20 transition-all group ${index % 2 === 0 ? 'md:ml-auto' : 'md:mr-auto'
                                                        } max-w-md`}
                                                >
                                                    <div className={`flex items-center gap-3 mb-3 ${index % 2 === 0 ? 'md:justify-end' : ''}`}>
                                                        <motion.div
                                                            whileHover={{ rotate: 360 }}
                                                            transition={{ duration: 0.6 }}
                                                            className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30"
                                                        >
                                                            <step.icon className="w-5 h-5 text-purple-400" />
                                                        </motion.div>
                                                        <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                                                    </div>
                                                    <p className="text-slate-400 font-light">{step.description}</p>
                                                </motion.div>
                                            </div>

                                            {/* Center Circle */}
                                            <div className="relative z-10 flex-shrink-0 hidden md:block">
                                                <motion.div
                                                    whileHover={{ scale: 1.2, rotate: 180 }}
                                                    transition={{ duration: 0.6 }}
                                                    className="w-16 h-16 rounded-full bg-[#05030e] border-2 border-purple-500 flex items-center justify-center shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)]"
                                                >
                                                    <span className="text-purple-400 font-bold text-lg">{step.number}</span>
                                                </motion.div>
                                            </div>

                                            {/* Empty Side */}
                                            <div className="flex-1 hidden md:block"></div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section with 3D Effect */}
                <section className="py-32 bg-[#070510] relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_50%,#a855f715,transparent)]"></div>

                    {/* Animated Orbs */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute top-20 left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                        className="absolute bottom-20 right-20 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl"
                    />

                    <div className="container px-4 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="max-w-4xl mx-auto text-center"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 text-sm font-medium mb-8">
                                <Sparkles className="w-4 h-4" />
                                Ready to Transform Your Digital Presence?
                            </div>

                            <h2 className="font-display text-4xl md:text-6xl font-bold mb-6">
                                Let's Create Something <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Extraordinary Together</span>
                            </h2>

                            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-light">
                                Partner with our award-winning design team to create interfaces that users love and businesses thrive on.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/contact">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button size="lg" className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white hover:opacity-90 text-lg h-14 px-10 rounded-full font-bold shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all relative overflow-hidden group">
                                            <motion.div
                                                animate={{ x: ["-100%", "100%"] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                            />
                                            <span className="relative">Start Your Project <ArrowRight className="ml-2 h-5 w-5 inline" /></span>
                                        </Button>
                                    </motion.div>
                                </Link>
                                <Link to="/portfolio">
                                    <Button variant="outline" size="lg" className="border-purple-500/30 text-white hover:bg-purple-500/10 text-lg h-14 px-10 rounded-full font-medium transition-all">
                                        View More Work
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default UIUXDesign;
