import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Target, TrendingUp, Zap, BarChart2, MessageCircle, ShoppingBag, Video, Image as ImageIcon, Layers, Smartphone, Sparkles, CheckCircle2, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const MetaAds = () => {
    return (
        <Layout>
            <div className="min-h-screen bg-[#05030e] text-white relative overflow-hidden">
                {/* Background Ambient Effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-[20%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-[20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
                </div>

                {/* Hero Section */}
                <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-left relative z-10"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-purple-400 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-sm">
                                <Sparkles className="h-3 w-3" />
                                <span>Powered by Andromeda AI</span>
                            </div>

                            <h1 className="font-display text-5xl md:text-7xl font-bold mb-8 leading-tight">
                                META Ads <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-white">
                                    Services
                                </span>
                            </h1>

                            <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed max-w-xl">
                                Harness the power of Meta's 3.2 billion users with AI-driven campaigns optimized by the latest Andromeda algorithm updates.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Link to="/contact">
                                    <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full font-bold text-lg shadow-lg shadow-purple-900/20 transition-all hover:scale-105">
                                        Start Your Project <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Live Campaign Visual */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="relative hidden lg:block"
                        >
                            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 blur-xl animate-pulse" />
                            <div className="relative bg-[#0A051A]/80 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                        <span className="font-semibold text-green-500 text-sm uppercase tracking-wider">Live Campaign</span>
                                    </div>
                                    <Zap className="h-5 w-5 text-yellow-400" />
                                </div>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">ROAS</span>
                                        <span className="text-2xl font-bold text-white font-mono">8.4X</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 w-[84%]" />
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-slate-400">Conversions</span>
                                        <span className="text-2xl font-bold text-white font-mono">2,847</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-purple-400 to-pink-500 w-[72%]" />
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-slate-400">CPA</span>
                                        <span className="text-2xl font-bold text-white font-mono">₹48</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 w-[45%]" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Stats Grid */}
                <section className="py-20 border-y border-white/5 bg-white/[0.02]">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                            {[
                                { icon: Users, label: "Monthly Active Users", value: "3.2B" },
                                { icon: TrendingUp, label: "Average ROAS", value: "8.4X" },
                                { icon: Video, label: "Lower CPA", value: "65%" },
                                { icon: Layers, label: "Campaigns Managed", value: "200+" }
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="text-center group"
                                >
                                    <div className="inline-flex p-4 rounded-2xl bg-white/5 mb-4 group-hover:bg-purple-500/10 transition-colors">
                                        <stat.icon className="h-8 w-8 text-purple-400" />
                                    </div>
                                    <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                                    <div className="text-sm font-semibold uppercase tracking-wider text-slate-500">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Andromeda Algorithm */}
                <section className="py-32 container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-widest mb-6">
                            <Zap className="h-3 w-3" />
                            <span>Latest Algorithm Update</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Meta's <span className="text-purple-400">Andromeda</span> Algorithm</h2>
                        <p className="text-slate-400 max-w-3xl mx-auto text-lg leading-relaxed">
                            Meta's Andromeda is their most advanced AI retrieval system, processing billions of ads in milliseconds to find the perfect match between advertisers and users. Here's how we leverage it for your campaigns.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div className="space-y-6">
                            {[
                                { title: "10,000+ Targeting Signals", desc: "Andromeda processes over 10,000 data signals per user including browsing behavior, purchase history, and engagement patterns." },
                                { title: "Real-Time Optimization", desc: "The algorithm adjusts bidding and targeting every millisecond based on live auction dynamics and user intent signals." },
                                { title: "Cross-Platform Intelligence", desc: "Unified insights across Facebook, Instagram, WhatsApp, and Messenger for holistic audience understanding." },
                                { title: "Predictive Conversion Modeling", desc: "AI predicts which users are most likely to convert, even with limited data, using advanced machine learning." }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-[#110C1D] border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 transition-colors"
                                >
                                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-400 text-sm pl-5">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                        <div className="relative h-[500px] flex items-center justify-center">
                            {/* Conceptual Abstract Visualization of AI */}
                            <div className="absolute inset-0 bg-gradient-radial from-purple-500/20 to-transparent opacity-50 blur-3xl" />
                            <div className="relative w-80 h-80 rounded-full border border-white/10 flex items-center justify-center animate-[spin_10s_linear_infinite]">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_20px_rgba(168,85,247,1)]" />
                            </div>
                            <div className="absolute w-60 h-60 rounded-full border border-white/10 flex items-center justify-center animate-[spin_15s_linear_infinite_reverse]">
                                <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-3 h-3 bg-pink-500 rounded-full shadow-[0_0_20px_rgba(236,72,153,1)]" />
                            </div>
                            <div className="absolute z-10 p-6 bg-black/50 backdrop-blur-xl border border-white/20 rounded-full">
                                <Sparkles className="h-12 w-12 text-white" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Arsenal Grid */}
                <section className="py-24 bg-white/[0.02]">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">Our META Ads <span className="text-purple-400">Arsenal</span></h2>
                            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Full-funnel advertising solutions across Facebook, Instagram, WhatsApp & Messenger.</p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { icon: Target, title: "Advantage+ Campaigns", desc: "AI-powered campaign optimization using Meta's latest Advantage+ suite for maximum performance and ROAS.", featured: true },
                                { icon: Sparkles, title: "Andromeda AI Targeting", desc: "Leverage Meta's Andromeda algorithm that analyzes 10,000+ signals per user for precision targeting." },
                                { icon: Users, title: "Custom & Lookalike Audiences", desc: "Build high-converting audiences from your customer data and find similar high-value prospects." },
                                { icon: Video, title: "Reels & Video Ads", desc: "Capture attention with engaging Reels ads that get 22% more engagement than static content." },
                                { icon: ShoppingBag, title: "Catalog & Shopping Ads", desc: "Dynamic product ads that automatically show relevant products to interested shoppers." },
                                { icon: MessageCircle, title: "Messenger & WhatsApp Ads", desc: "Direct conversation ads that drive instant engagement and lead generation." },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`group relative p-8 rounded-2xl border transition-all duration-300 ${item.featured
                                            ? "bg-purple-900/10 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)]"
                                            : "bg-[#110C1D] border-white/5 hover:border-white/10"
                                        }`}
                                >
                                    {/* Corner Accents for Featured */}
                                    {item.featured && (
                                        <>
                                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-purple-500 rounded-tl-lg" />
                                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-purple-500 rounded-br-lg" />
                                        </>
                                    )}

                                    <div className={`inline-flex p-3 rounded-xl mb-6 ${item.featured ? 'bg-purple-500 text-white' : 'bg-white/5 text-purple-400'}`}>
                                        <item.icon className="h-6 w-6" />
                                    </div>

                                    <h3 className={`text-xl font-bold mb-4 ${item.featured ? 'text-white' : 'text-slate-200'}`}>
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-400 leading-relaxed text-sm">
                                        {item.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Ad Formats */}
                <section className="py-24 container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Ad Formats We <span className="text-purple-400">Master</span></h2>
                        <p className="text-slate-400">Every format, every placement, optimized for maximum impact.</p>
                    </motion.div>

                    <div className="flex flex-wrap justify-center gap-4">
                        {[
                            { icon: ImageIcon, title: "Image Ads", subtitle: "High-impact visuals" },
                            { icon: Video, title: "Video Ads", subtitle: "Engaging storytelling" },
                            { icon: Layers, title: "Carousel Ads", subtitle: "Multiple products" },
                            { icon: ShoppingBag, title: "Collection Ads", subtitle: "Immersive shopping" },
                            { icon: Smartphone, title: "Stories Ads", subtitle: "Full-screen vertical" },
                            { icon: Sparkles, title: "Reels Ads", subtitle: "Short-form content" },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="w-40 bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors cursor-default"
                            >
                                <item.icon className="h-8 w-8 mx-auto mb-3 text-purple-400" />
                                <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
                                <p className="text-[10px] text-slate-400">{item.subtitle}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-32 container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="max-w-4xl mx-auto bg-gradient-to-b from-[#110C1D] to-black border border-white/10 rounded-3xl p-16 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 text-green-400 text-sm font-bold uppercase tracking-widest mb-8">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Ready to Scale with META Ads?</span>
                            </div>

                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                                Get a free <span className="text-purple-400">campaign audit</span>
                            </h2>
                            <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
                                Discover how we can improve your ROAS by up to 8X using the latest Andromeda optimizations.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/contact">
                                    <Button size="lg" className="h-14 px-10 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-bold text-lg shadow-xl shadow-purple-500/25 transition-all hover:scale-105 w-full sm:w-auto">
                                        Get Free Audit
                                    </Button>
                                </Link>
                                <Button
                                    onClick={() => window.open('https://topmate.io/ms_digimark/1868704', '_blank')}
                                    size="lg"
                                    variant="outline"
                                    className="h-14 px-10 border-white/20 text-white hover:bg-white/10 bg-transparent rounded-full font-bold text-lg w-full sm:w-auto"
                                >
                                    Schedule a Call
                                    <Phone className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </section>

            </div>
        </Layout>
    );
};

export default MetaAds;
