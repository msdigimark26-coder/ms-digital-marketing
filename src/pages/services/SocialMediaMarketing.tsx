import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import {
    MessageCircle,
    Users,
    TrendingUp,
    Target,
    Calendar,
    BarChart3,
    ArrowRight,
    CheckCircle2,
    Rocket,
    Sparkles,
    Heart,
    Share2,
    Instagram,
    Facebook,
    Twitter,
    Linkedin,
    Youtube
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const platforms = [
    { icon: Instagram, name: "Instagram", color: "from-purple-500 to-pink-500" },
    { icon: Facebook, name: "Facebook", color: "from-blue-600 to-blue-400" },
    { icon: Twitter, name: "Twitter", color: "from-sky-500 to-blue-400" },
    { icon: Linkedin, name: "LinkedIn", color: "from-blue-700 to-blue-500" },
    { icon: Youtube, name: "YouTube", color: "from-red-600 to-red-400" }
];

const services = [
    {
        icon: Target,
        title: "Strategic Planning",
        description: "Data-driven social media strategies tailored to your brand's unique voice and business objectives.",
        features: ["Audience Research", "Competitor Analysis", "Content Calendar", "Platform Selection"]
    },
    {
        icon: Sparkles,
        title: "Content Creation",
        description: "Engaging, scroll-stopping content designed to captivate your audience and drive meaningful interactions.",
        features: ["Graphic Design", "Video Production", "Copywriting", "Hashtag Strategy"]
    },
    {
        icon: Users,
        title: "Community Management",
        description: "Build authentic relationships with your audience through active engagement and responsive communication.",
        features: ["24/7 Monitoring", "Response Management", "Reputation Control", "Crisis Management"]
    },
    {
        icon: TrendingUp,
        title: "Growth Campaigns",
        description: "Accelerate your social presence with targeted campaigns that convert followers into loyal customers.",
        features: ["Influencer Outreach", "Paid Advertising", "Viral Campaigns", "User-Generated Content"]
    },
    {
        icon: BarChart3,
        title: "Analytics & Reporting",
        description: "Comprehensive insights and actionable metrics to measure success and optimize performance.",
        features: ["Performance Tracking", "ROI Analytics", "Audience Insights", "Custom Reports"]
    },
    {
        icon: Calendar,
        title: "Social Calendar",
        description: "Never miss a moment with organized, strategic content scheduling across all your platforms.",
        features: ["Content Planning", "Auto-Scheduling", "Peak Time Posting", "Campaign Coordination"]
    }
];

const stats = [
    { number: "500%", label: "Average Engagement Increase" },
    { number: "10M+", label: "Content Impressions Generated" },
    { number: "95%", label: "Client Retention Rate" },
    { number: "24/7", label: "Community Support" }
];

const processSteps = [
    {
        number: "01",
        icon: Target,
        title: "Audit & Strategy",
        description: "We analyze your current presence and craft a customized roadmap for success"
    },
    {
        number: "02",
        icon: Sparkles,
        title: "Content Creation",
        description: "Our creative team develops stunning, on-brand content that resonates"
    },
    {
        number: "03",
        icon: Calendar,
        title: "Schedule & Deploy",
        description: "Strategic posting at optimal times for maximum reach and engagement"
    },
    {
        number: "04",
        icon: Users,
        title: "Engage & Grow",
        description: "Active community management to build authentic relationships"
    },
    {
        number: "05",
        icon: BarChart3,
        title: "Analyze & Optimize",
        description: "Continuous monitoring and refinement for sustained growth"
    }
];

const SocialMediaMarketing = () => {
    return (
        <Layout>
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
                <div className="absolute inset-0 bg-[#05030e]">
                    {/* Animated Grid Background */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                    {/* Multiple Radial Gradients for depth */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_30%_20%,#7c3aed0a,transparent)]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_70%_60%,#ec48990a,transparent)]"></div>

                    {/* Floating Social Icons */}
                    <div className="absolute inset-0 overflow-hidden opacity-10">
                        <motion.div
                            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                            transition={{ duration: 5, repeat: Infinity }}
                            className="absolute top-1/4 left-1/4"
                        >
                            <Heart className="w-16 h-16 text-pink-500" />
                        </motion.div>
                        <motion.div
                            animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                            transition={{ duration: 6, repeat: Infinity }}
                            className="absolute top-1/3 right-1/4"
                        >
                            <Share2 className="w-20 h-20 text-purple-500" />
                        </motion.div>
                        <motion.div
                            animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
                            transition={{ duration: 7, repeat: Infinity }}
                            className="absolute bottom-1/3 left-1/3"
                        >
                            <MessageCircle className="w-18 h-18 text-blue-500" />
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
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 text-sm font-medium mb-8"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Social Media Excellence
                        </motion.div>

                        <h1 className="font-display text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-tight">
                            Social Media <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 relative">
                                Marketing
                                <div className="absolute -inset-1 blur-2xl bg-purple-500/20 -z-10 rounded-full"></div>
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 font-light">
                            Build engaged communities across platforms. We handle strategy, content creation, and community management.
                        </p>

                        {/* Platform Icons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex justify-center gap-4 mb-12 flex-wrap"
                        >
                            {platforms.map((platform, index) => (
                                <motion.div
                                    key={platform.name}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:border-purple-500/30 transition-all cursor-pointer group"
                                >
                                    <platform.icon className={`w-6 h-6 text-white/60 group-hover:text-white transition-colors`} />
                                </motion.div>
                            ))}
                        </motion.div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link to="/">
                                <Button variant="outline" size="lg" className="border-purple-500/30 text-white hover:bg-purple-500/10 text-lg h-14 px-8 rounded-full font-medium transition-all group">
                                    <ArrowRight className="mr-2 h-5 w-5 rotate-180 group-hover:-translate-x-1 transition-transform" /> Back to Home
                                </Button>
                            </Link>
                            <Link to="/contact">
                                <Button size="lg" className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white hover:opacity-90 text-lg h-14 px-8 rounded-full font-bold shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all">
                                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-slate-500 rounded-full flex justify-center p-1">
                        <div className="w-1 h-3 bg-purple-500 rounded-full animate-scroll"></div>
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
                                className="text-center"
                            >
                                <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
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
                            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Services</span>
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Comprehensive social media solutions to elevate your brand's digital presence.
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
                                className="group p-8 rounded-2xl bg-[#0f0a1f] border border-white/5 hover:border-purple-500/30 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.2)] relative overflow-hidden"
                            >
                                {/* Background Icon */}
                                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                                    <service.icon className="w-24 h-24 text-purple-500" />
                                </div>

                                <div className="relative">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <service.icon className="w-7 h-7 text-purple-400" />
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-4">{service.title}</h3>
                                    <p className="text-slate-400 leading-relaxed font-light mb-6">
                                        {service.description}
                                    </p>

                                    <div className="space-y-2">
                                        {service.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm text-slate-500">
                                                <CheckCircle2 className="w-4 h-4 text-purple-500" />
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

            {/* Process Section */}
            <section className="py-32 bg-[#070510] relative overflow-hidden">
                <div className="container px-4 relative z-10">
                    <div className="text-center mb-24">
                        <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Process</span>
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            A proven methodology for social media success.
                        </p>
                    </div>

                    <div className="max-w-5xl mx-auto">
                        <div className="relative">
                            {/* Connecting Line */}
                            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/50 via-pink-500/50 to-blue-500/50 hidden md:block -translate-x-1/2"></div>

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
                                            <div className={`p-6 rounded-2xl bg-[#0f0a1f] border border-white/5 hover:border-purple-500/20 transition-all group ${index % 2 === 0 ? 'md:ml-auto' : 'md:mr-auto'
                                                } max-w-md`}>
                                                <div className={`flex items-center gap-3 mb-3 ${index % 2 === 0 ? 'md:justify-end' : ''}`}>
                                                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <step.icon className="w-5 h-5 text-purple-400" />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                                                </div>
                                                <p className="text-slate-400 font-light">{step.description}</p>
                                            </div>
                                        </div>

                                        {/* Center Circle */}
                                        <div className="relative z-10 flex-shrink-0 hidden md:block">
                                            <div className="w-16 h-16 rounded-full bg-[#05030e] border-2 border-purple-500 flex items-center justify-center shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)]">
                                                <span className="text-purple-400 font-bold text-lg">{step.number}</span>
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
                        <div className="inline-block p-1 rounded-full bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-blue-500/50">
                            <Link to="/contact">
                                <Button size="lg" className="bg-[#05030e] hover:bg-[#0f0a1f] text-white border border-transparent hover:border-purple-500/30 h-14 px-10 rounded-full text-lg font-medium transition-all group">
                                    Start Growing Today <Rocket className="ml-2 w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 bg-[#05030e] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_50%,#7c3aed15,transparent)]"></div>

                <div className="container px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 text-sm font-medium mb-8">
                            <Sparkles className="w-4 h-4" />
                            Ready to Transform Your Social Presence?
                        </div>

                        <h2 className="font-display text-4xl md:text-6xl font-bold mb-6">
                            Let's Build Something <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Extraordinary Together</span>
                        </h2>

                        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-light">
                            Join hundreds of brands that trust us to manage their social media presence and drive real business results.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/contact">
                                <Button size="lg" className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white hover:opacity-90 text-lg h-14 px-10 rounded-full font-bold shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all">
                                    Schedule a Consultation <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link to="/portfolio">
                                <Button variant="outline" size="lg" className="border-purple-500/30 text-white hover:bg-purple-500/10 text-lg h-14 px-10 rounded-full font-medium transition-all">
                                    View Our Work
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </Layout>
    );
};

export default SocialMediaMarketing;
