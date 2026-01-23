import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import {
    Target,
    TrendingUp,
    DollarSign,
    BarChart3,
    Zap,
    Search,
    ArrowRight,
    CheckCircle2,
    Rocket,
    Sparkles,
    TrendingDown,
    MousePointer2,
    Eye,
    Users,
    Megaphone,
    LineChart,
    Settings,
    Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const platforms = [
    { name: "Google Ads", icon: Search, color: "from-blue-500 to-green-500", description: "Search & Display" },
    { name: "Facebook Ads", icon: Users, color: "from-blue-600 to-blue-400", description: "Social Campaigns" },
    { name: "LinkedIn Ads", icon: Megaphone, color: "from-blue-700 to-blue-500", description: "B2B Marketing" },
    { name: "Instagram Ads", icon: Eye, color: "from-purple-500 to-pink-500", description: "Visual Stories" }
];

const services = [
    {
        icon: Target,
        title: "Campaign Strategy",
        description: "Data-driven strategies tailored to your business goals, ensuring every dollar spent works harder for your ROI.",
        features: ["Competitor Analysis", "Audience Research", "Budget Planning", "Goal Setting"]
    },
    {
        icon: Search,
        title: "Search Advertising",
        description: "Dominate search results with precision-targeted Google Ads campaigns that capture high-intent customers.",
        features: ["Keyword Research", "Ad Copywriting", "Bid Management", "Quality Score Optimization"]
    },
    {
        icon: Users,
        title: "Social Media Ads",
        description: "Engage your ideal audience across Facebook, Instagram, and LinkedIn with scroll-stopping creative.",
        features: ["Audience Targeting", "Creative Development", "A/B Testing", "Retargeting Campaigns"]
    },
    {
        icon: Eye,
        title: "Display Advertising",
        description: "Build brand awareness and capture attention with visually stunning display ads across premium networks.",
        features: ["Banner Design", "Programmatic Buying", "Placement Strategy", "Creative Optimization"]
    },
    {
        icon: BarChart3,
        title: "Analytics & Tracking",
        description: "Comprehensive tracking and reporting to measure every metric that matters for your business growth.",
        features: ["Conversion Tracking", "Custom Dashboards", "ROI Analysis", "Performance Reports"]
    },
    {
        icon: Settings,
        title: "Campaign Optimization",
        description: "Continuous testing and refinement to maximize performance and drive down cost-per-acquisition.",
        features: ["Landing Page Tests", "Bid Optimization", "Ad Copy Testing", "Audience Refinement"]
    }
];

const stats = [
    { number: "450%", label: "Average ROI Increase", icon: TrendingUp },
    { number: "68%", label: "Lower Cost Per Click", icon: TrendingDown },
    { number: "$50M+", label: "Ad Spend Managed", icon: DollarSign },
    { number: "98%", label: "Client Satisfaction", icon: Award }
];

const benefits = [
    {
        icon: DollarSign,
        title: "Maximize ROI",
        description: "Every campaign is optimized for maximum return on your advertising investment."
    },
    {
        icon: Target,
        title: "Precision Targeting",
        description: "Reach exactly who you want, when you want, with laser-focused audience segmentation."
    },
    {
        icon: Zap,
        title: "Instant Results",
        description: "See immediate traffic and conversions, unlike organic marketing strategies."
    },
    {
        icon: LineChart,
        title: "Scalable Growth",
        description: "Scale your campaigns up or down based on performance and business needs."
    },
    {
        icon: BarChart3,
        title: "Full Transparency",
        description: "Real-time dashboards and detailed reports keep you informed every step of the way."
    },
    {
        icon: MousePointer2,
        title: "Expert Management",
        description: "Certified specialists managing your campaigns with years of proven expertise."
    }
];

const processSteps = [
    {
        number: "01",
        icon: Target,
        title: "Discovery & Audit",
        description: "We analyze your business, competitors, and current advertising efforts to identify opportunities"
    },
    {
        number: "02",
        icon: Settings,
        title: "Strategy Development",
        description: "Create a customized PPC roadmap with clear KPIs, budgets, and performance targets"
    },
    {
        number: "03",
        icon: Rocket,
        title: "Campaign Launch",
        description: "Build and deploy high-performing campaigns across your selected advertising platforms"
    },
    {
        number: "04",
        icon: LineChart,
        title: "Monitor & Optimize",
        description: "Continuous testing, tracking, and refinement to maximize your return on ad spend"
    },
    {
        number: "05",
        icon: BarChart3,
        title: "Report & Scale",
        description: "Transparent reporting with actionable insights to grow your advertising success"
    }
];

const PPCPaidAdvertising = () => {
    return (
        <Layout>
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
                <div className="absolute inset-0 bg-[#05030e]">
                    {/* Animated Grid Background */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                    {/* Multiple Radial Gradients */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_20%_30%,#10b98115,transparent)]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_80%_70%,#7c3aed0a,transparent)]"></div>

                    {/* Floating Icons */}
                    <div className="absolute inset-0 overflow-hidden opacity-10">
                        <motion.div
                            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                            transition={{ duration: 5, repeat: Infinity }}
                            className="absolute top-1/4 left-1/4"
                        >
                            <Target className="w-16 h-16 text-emerald-500" />
                        </motion.div>
                        <motion.div
                            animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                            transition={{ duration: 6, repeat: Infinity }}
                            className="absolute top-1/3 right-1/4"
                        >
                            <TrendingUp className="w-20 h-20 text-purple-500" />
                        </motion.div>
                        <motion.div
                            animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
                            transition={{ duration: 7, repeat: Infinity }}
                            className="absolute bottom-1/3 left-1/3"
                        >
                            <DollarSign className="w-18 h-18 text-green-500" />
                        </motion.div>
                    </div>
                </div>

                <div className="container px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-5xl mx-auto"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-sm font-medium mb-8"
                        >
                            <Target className="w-4 h-4" />
                            Results-Driven Advertising
                        </motion.div>

                        <h1 className="font-display text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-tight">
                            PPC & Paid <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-purple-400 relative">
                                Advertising
                                <div className="absolute -inset-1 blur-2xl bg-emerald-500/20 -z-10 rounded-full"></div>
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 font-light">
                            Maximize ROI with precision-targeted campaigns on Google, Facebook, LinkedIn and more.
                        </p>

                        {/* Platform Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto"
                        >
                            {platforms.map((platform, index) => (
                                <motion.div
                                    key={platform.name}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all cursor-pointer group"
                                >
                                    <platform.icon className="w-8 h-8 text-white/60 group-hover:text-emerald-400 transition-colors mx-auto mb-2" />
                                    <div className="text-sm font-semibold text-white">{platform.name}</div>
                                    <div className="text-xs text-slate-400">{platform.description}</div>
                                </motion.div>
                            ))}
                        </motion.div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link to="/">
                                <Button variant="outline" size="lg" className="border-emerald-500/30 text-white hover:bg-emerald-500/10 text-lg h-14 px-8 rounded-full font-medium transition-all group">
                                    <ArrowRight className="mr-2 h-5 w-5 rotate-180 group-hover:-translate-x-1 transition-transform" /> Back to Home
                                </Button>
                            </Link>
                            <Link to="/contact">
                                <Button size="lg" className="bg-gradient-to-r from-emerald-600 via-green-600 to-purple-600 text-white hover:opacity-90 text-lg h-14 px-8 rounded-full font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all">
                                    Start Your Campaign <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-slate-500 rounded-full flex justify-center p-1">
                        <div className="w-1 h-3 bg-emerald-500 rounded-full animate-scroll"></div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-[#070510] border-y border-white/5">
                <div className="container px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center group"
                            >
                                <div className="flex justify-center mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <stat.icon className="w-6 h-6 text-emerald-400" />
                                    </div>
                                </div>
                                <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400 mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-slate-400 text-sm md:text-base font-light">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-32 relative bg-[#05030e]">
                <div className="container px-4">
                    <div className="text-center mb-24">
                        <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">PPC Services</span>
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Comprehensive paid advertising solutions designed to drive measurable results and maximize your ROI.
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
                                className="group p-8 rounded-2xl bg-[#0f0a1f] border border-white/5 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.2)] relative overflow-hidden"
                            >
                                {/* Background Icon */}
                                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                                    <service.icon className="w-24 h-24 text-emerald-500" />
                                </div>

                                <div className="relative">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <service.icon className="w-7 h-7 text-emerald-400" />
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-4">{service.title}</h3>
                                    <p className="text-slate-400 leading-relaxed font-light mb-6">
                                        {service.description}
                                    </p>

                                    <div className="space-y-2">
                                        {service.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm text-slate-500">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-32 bg-[#070510] relative overflow-hidden">
                <div className="container px-4">
                    <div className="text-center mb-24">
                        <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                            Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">PPC Advertising?</span>
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Proven benefits that deliver immediate impact and sustainable growth for your business.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="p-6 rounded-xl bg-[#0f0a1f]/50 border border-white/5 hover:border-emerald-500/20 transition-all group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                        <benefit.icon className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                                        <p className="text-slate-400 text-sm font-light">{benefit.description}</p>
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
                            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">Process</span>
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            A systematic approach to PPC success that drives results.
                        </p>
                    </div>

                    <div className="max-w-5xl mx-auto">
                        <div className="relative">
                            {/* Connecting Line */}
                            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/50 via-green-500/50 to-purple-500/50 hidden md:block -translate-x-1/2"></div>

                            <div className="space-y-12">
                                {processSteps.map((step, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className={`flex flex-col md:flex-row items-start md:items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                                            }`}
                                    >
                                        {/* Content Side */}
                                        <div className={`flex-1 ${index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                                            <div className={`p-6 rounded-2xl bg-[#0f0a1f] border border-white/5 hover:border-emerald-500/20 transition-all group ${index % 2 === 0 ? 'md:ml-auto' : 'md:mr-auto'
                                                } max-w-md`}>
                                                <div className={`flex items-center gap-3 mb-3 ${index % 2 === 0 ? 'md:justify-end' : ''}`}>
                                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <step.icon className="w-5 h-5 text-emerald-400" />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                                                </div>
                                                <p className="text-slate-400 font-light">{step.description}</p>
                                            </div>
                                        </div>

                                        {/* Center Circle */}
                                        <div className="relative z-10 flex-shrink-0 hidden md:block">
                                            <div className="w-16 h-16 rounded-full bg-[#05030e] border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)]">
                                                <span className="text-emerald-400 font-bold text-lg">{step.number}</span>
                                            </div>
                                        </div>

                                        {/* Empty Side for spacing */}
                                        <div className="flex-1 hidden md:block"></div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-24">
                        <div className="inline-block p-1 rounded-full bg-gradient-to-r from-emerald-500/50 via-green-500/50 to-purple-500/50">
                            <Link to="/contact">
                                <Button size="lg" className="bg-[#05030e] hover:bg-[#0f0a1f] text-white border border-transparent hover:border-emerald-500/30 h-14 px-10 rounded-full text-lg font-medium transition-all group">
                                    Launch Your Campaign <Rocket className="ml-2 w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 bg-[#070510] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_50%,#10b98115,transparent)]"></div>

                <div className="container px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-sm font-medium mb-8">
                            <Sparkles className="w-4 h-4" />
                            Ready to Grow Your Business?
                        </div>

                        <h2 className="font-display text-4xl md:text-6xl font-bold mb-6">
                            Stop Wasting Ad Budget. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">Start Scaling Smart.</span>
                        </h2>

                        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-light">
                            Partner with certified PPC experts who have managed over $50M in ad spend and delivered exceptional results for hundreds of clients.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/contact">
                                <Button size="lg" className="bg-gradient-to-r from-emerald-600 via-green-600 to-purple-600 text-white hover:opacity-90 text-lg h-14 px-10 rounded-full font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all">
                                    Get Free Campaign Audit <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link to="/portfolio">
                                <Button variant="outline" size="lg" className="border-emerald-500/30 text-white hover:bg-emerald-500/10 text-lg h-14 px-10 rounded-full font-medium transition-all">
                                    View Success Stories
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </Layout>
    );
};

export default PPCPaidAdvertising;
