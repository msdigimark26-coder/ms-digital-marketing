import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, BarChart2, Users, CheckCircle2, Target, Globe, Zap, Link as LinkIcon, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const SEOServices = () => {
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
                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-purple-400 text-sm font-bold uppercase tracking-widest mb-8 backdrop-blur-sm">
                                <Zap className="h-4 w-4" />
                                <span>Rank Higher, Grow Faster</span>
                            </div>

                            <h1 className="font-display text-6xl md:text-8xl font-bold mb-8 leading-tight">
                                SEO <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-white">
                                    Services
                                </span>
                            </h1>

                            <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                                Dominate search rankings with data-driven SEO strategies that drive organic traffic, boost visibility, and deliver measurable ROI.
                            </p>

                            <Link to="/contact">
                                <Button size="lg" className="h-14 px-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full font-bold text-lg shadow-lg shadow-purple-900/20 transition-all hover:scale-105">
                                    Start Your Project <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </motion.div>

                        {/* Abstract Ranking Progress Visual (Simplified CSS version of the chart in image) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="absolute top-1/2 right-0 lg:-right-20 -translate-y-1/2 hidden xl:block pointer-events-none"
                        >
                            <div className="relative w-64 h-40 bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs text-slate-400 font-semibold">Ranking Progress</span>
                                    <ArrowRight className="h-3 w-3 text-green-400 -rotate-45" />
                                </div>
                                <div className="flex items-end gap-2 h-20">
                                    {[20, 35, 30, 45, 60, 55, 75, 90].map((h, i) => (
                                        <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-purple-600 to-pink-500 opacity-80" style={{ height: `${h}%` }} />
                                    ))}
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
                                { icon: Search, label: "Keywords Ranked", value: "500+" },
                                { icon: BarChart2, label: "Traffic Growth", value: "10X" },
                                { icon: Users, label: "Client Retention", value: "95%" },
                                { icon: CheckCircle2, label: "Projects Completed", value: "150+" }
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

                {/* The SEO Journey Process */}
                <section className="py-32 container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">The SEO Journey</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg">A proven methodology that delivers consistent ranking improvements and sustainable growth.</p>
                    </motion.div>

                    <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden lg:block absolute top-[2.5rem] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-purple-900 via-purple-500 to-purple-900 opacity-30" />

                        {[
                            { title: "Audit", step: "Deep Analysis", desc: "Complete website audit to identify SEO issues and opportunities.", features: ["Site Health Score", "Competitor Gap", "Technical fixes"] },
                            { title: "Strategy", step: "Custom Roadmap", desc: "Tailored SEO strategy based on your business goals and market.", features: ["Keyword Mapping", "Content Calendar", "Link Strategy"] },
                            { title: "Execute", step: "Implementation", desc: "Execute on-page, off-page, and technical optimizations.", features: ["Content Creation", "Link Acquisition", "Tech Updates"] },
                            { title: "Scale", step: "Growth & Optimize", desc: "Continuous optimization based on data and algorithm updates.", features: ["Rank Tracking", "Traffic Analysis", "CRO"] },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="relative"
                            >
                                <div className="w-20 h-10 rounded-full bg-black border border-purple-500/30 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-purple-400 mx-auto mb-8 relative z-10">
                                    {item.title}
                                </div>

                                <div className="bg-[#110C1D] border border-white/10 rounded-2xl p-8 hover:border-purple-500/30 transition-all duration-300 h-full group">
                                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">{item.step}</h3>
                                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">{item.desc}</p>
                                    <ul className="space-y-3">
                                        {item.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center text-sm text-slate-500">
                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-3" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* SEO Arsenal */}
                <section className="py-24 bg-white/[0.02]">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-center mb-20"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">Our SEO <span className="text-purple-400">Arsenal</span></h2>
                            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Comprehensive solutions that cover every aspect of search engine optimization.</p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { icon: Globe, title: "Technical SEO Audit", desc: "Comprehensive analysis of your website's technical health and performance." },
                                { icon: Target, title: "Keyword Research", desc: "Data-driven keyword strategies that target high-intent searches in your niche.", featured: true },
                                { icon: LinkIcon, title: "Link Building", desc: "High-quality backlink acquisition from authoritative domains." },
                                { icon: FileText, title: "Content Optimization", desc: "Strategic content improvements that align with search intent." },
                                { icon: CheckCircle2, title: "Local SEO", desc: "Dominate local search results and Google Maps to capture nearby." },
                                { icon: BarChart2, title: "Performance Tracking", desc: "Real-time monitoring and detailed reports on your SEO progress." },
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
                                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-purple-500 rounded-tr-lg" />
                                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-purple-500 rounded-bl-lg" />
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

                {/* CTA Section */}
                <section className="py-32 container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="max-w-4xl mx-auto bg-gradient-to-b from-[#110C1D] to-black border border-white/10 rounded-3xl p-16 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 text-purple-400 text-sm font-bold uppercase tracking-widest mb-8">
                                <Zap className="h-4 w-4" />
                                <span>Start Ranking Today</span>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                                Ready to <span className="text-purple-400">Dominate Search</span> Results?
                            </h2>
                            <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
                                Get a free SEO audit and discover how we can help your business achieve top rankings and drive organic growth.
                            </p>

                            <Link to="/contact">
                                <Button size="lg" className="h-14 px-12 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-bold text-lg shadow-xl shadow-purple-500/25 transition-all hover:scale-105">
                                    Start Your Project <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </section>

            </div>
        </Layout>
    );
};

export default SEOServices;
