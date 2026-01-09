import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    ArrowRight, Search, BarChart2, Target, Zap, MousePointer,
    Settings, CheckCircle2, DollarSign, PieChart, Clock, LayoutDashboard,
    Youtube, ShoppingCart, Image as ImageIcon, MapPin, Smartphone, HelpCircle, ChevronDown, ChevronUp
} from "lucide-react";
import { Link } from "react-router-dom";

const GoogleAds = () => {
    const [activeTab, setActiveTab] = useState("search");

    return (
        <Layout>
            <div className="min-h-screen bg-[#05030e] text-white relative overflow-hidden">
                {/* Ambient Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-[20%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-[20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
                </div>

                {/* Hero Section with Search Simulator */}
                <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="relative z-10"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-purple-400 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-sm">
                                <Search className="h-3 w-3" />
                                <span>Google Partner Certified</span>
                            </div>

                            <h1 className="font-display text-5xl md:text-7xl font-bold mb-8 leading-tight">
                                Google Ads <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-white">
                                    Management
                                </span>
                            </h1>

                            <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed max-w-xl">
                                Capture high-intent traffic and maximize ROI. We manage your Google Ads campaigns to put your brand in front of customers actively searching for your services.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Link to="/contact">
                                    <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full font-bold text-lg shadow-lg shadow-purple-900/20 transition-all hover:scale-105">
                                        Start Your Project <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Search Simulator Visual */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="relative hidden lg:block"
                        >
                            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-500 to-blue-500 opacity-20 blur-xl" />
                            <div className="relative bg-[#0A051A] border border-white/10 rounded-3xl p-6 backdrop-blur-md overflow-hidden">
                                <div className="flex items-center gap-2 mb-6 bg-white/5 p-3 rounded-full w-fit px-6 border border-white/5">
                                    <Search className="h-4 w-4 text-purple-400" />
                                    <span className="text-slate-400 text-sm">Best Digital Marketing Agency</span>
                                </div>

                                {/* Sponsored Result (Our Client) */}
                                <div className="mb-6 bg-purple-900/10 p-5 rounded-xl border border-purple-500/20 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-2 bg-green-500 text-[10px] font-bold text-black rounded-bl-lg">Position #1</div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-white text-xs">Ad</span>
                                        <span className="text-xs text-slate-400">www.yourbusiness.com</span>
                                    </div>
                                    <h3 className="text-xl text-purple-400 font-medium hover:underline cursor-pointer mb-1">Grow Your Business | #1 Digital Agency</h3>
                                    <p className="text-sm text-slate-300">Expert solutions tailored to your needs. Trusted by 1000+ customers. Free business consultation available today. Contact us now!</p>
                                    <div className="mt-3 flex gap-4 text-xs text-blue-400">
                                        <span className="hover:underline cursor-pointer">Our Services</span>
                                        <span className="hover:underline cursor-pointer">Case Studies</span>
                                        <span className="hover:underline cursor-pointer">Get a Quote</span>
                                    </div>
                                </div>

                                {/* Competitor Results */}
                                <div className="space-y-4 opacity-50 blur-[1px]">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="p-4 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs text-slate-500">www.competitor{i}.com</span>
                                            </div>
                                            <h3 className="text-lg text-blue-800/70 font-medium mb-1">Generic Competitor Result #{i}</h3>
                                            <p className="text-sm text-slate-600">Standard service description that doesn't stand out as much as the sponsored ad above...</p>
                                        </div>
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
                                { icon: BarChart2, label: "Average ROAS", value: "500%" },
                                { icon: DollarSign, label: "Lower CPA", value: "65%" },
                                { icon: PieChart, label: "Ad Spend Managed", value: "$2M+" },
                                { icon: CheckCircle2, label: "Successful Campaigns", value: "200+" }
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

                {/* Campaign Types */}
                <section className="py-24 container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Google Ads <span className="text-purple-400">Campaign Types</span></h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">We manage all types of Google Ads campaigns to meet your specific business objectives.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: Search, title: "Search Ads", desc: "Appear at the top of search results when potential customers look for your products." },
                            { icon: ImageIcon, title: "Display Ads", desc: "Visual banner ads that appear across millions of websites and apps." },
                            { icon: ShoppingCart, title: "Shopping Ads", desc: "Showcase your product inventory with image, price, and store name right in search." },
                            { icon: Youtube, title: "YouTube Ads", desc: "Video ads that play before or during YouTube videos to capture attention." },
                            { icon: Smartphone, title: "App Campaigns", desc: "Promote your mobile app across Search, Play, YouTube, and more." },
                            { icon: MapPin, title: "Local Ads", desc: "Drive foot traffic to your physical store locations with location-based ads." },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-[#110C1D] border border-white/5 rounded-2xl p-8 hover:border-purple-500/30 transition-all hover:bg-white/[0.02]"
                            >
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 text-purple-400">
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Why Invest Grid */}
                <section className="py-24 bg-white/[0.02]">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">Why Invest in <span className="text-purple-400">Google Ads?</span></h2>
                            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Unmatched advantages for businesses looking to grow their online presence quickly.</p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { icon: Target, title: "Precision Targeting", desc: "Reach the right audience at the exact moment they are searching for what you offer." },
                                { icon: DollarSign, title: "Cost-Effective", desc: "Pay only when someone clicks on your ad. Control your budget completely." },
                                { icon: BarChart2, title: "Measurable Results", desc: "Track every click, impression, and conversion with detailed transparent analytics." },
                                { icon: Zap, title: "Instant Visibility", desc: "Unlike SEO, start appearing on page 1 of Google immediately after launch." },
                                { icon: Settings, title: "Complete Control", desc: "Pause, adjust, or scale your campaigns anytime based on performance." },
                                { icon: CheckCircle2, title: "High Buying Intent", desc: "Target users who are ready to buy, leading to higher conversion rates." },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-8 rounded-3xl border border-white/5 bg-[#0A051A] hover:bg-purple-900/5 transition-colors"
                                >
                                    <div className="p-3 bg-white/5 rounded-lg w-fit mb-6 text-blue-400">
                                        <item.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                                    <p className="text-slate-400 text-sm">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Management Process */}
                <section className="py-32 container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-center mb-20"
                    >
                        <div className="inline-block p-1 px-3 rounded-full border border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Our Methodology</div>
                        <h2 className="text-3xl md:text-5xl font-bold">Google Ads <span className="text-purple-400">Management Process</span></h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { step: "01", title: "Audit & Strategy", desc: "We analyze your landscape and build a custom roadmap." },
                            { step: "02", title: "Setup & Tracking", desc: "Structure account and implement conversion tracking pixels." },
                            { step: "03", title: "Ad Creation", desc: "Write compelling copy and design high-converting visuals." },
                            { step: "04", title: "Launch & Monitor", desc: "Go live with careful budget monitoring and bid adjustments." },
                            { step: "05", title: "Optimize & A/B Test", desc: "Continuous testing of keywords, ads, and landing pages." },
                            { step: "06", title: "Scale & Report", desc: "Increase budget on winners and provide transparent reporting." }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="relative group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/20"
                            >
                                <span className="absolute top-6 right-6 text-4xl font-bold text-white/5 group-hover:text-purple-500/10 transition-colors">{item.step}</span>
                                <h3 className="text-xl font-bold text-white mb-2 relative z-10">{item.title}</h3>
                                <p className="text-slate-400 text-sm relative z-10">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-20 lg:py-32 max-w-4xl mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Frequently Asked <span className="text-purple-400">Questions</span></h2>
                    <div className="space-y-4">
                        {[
                            { q: "How much does Google Ads management cost?", a: "Our management fees are based on your ad spend percentage or a flat monthly fee, whichever is suitable. We offer custom packages tailored to your budget." },
                            { q: "How long does it take to see results?", a: "Unlike SEO, Google Ads can generate traffic almost immediately after launch. However, optimal campaign performance and ROI stabilization typically take 1-3 months of data gathering and refinement." },
                            { q: "What is the difference between SEO and Google Ads?", a: "SEO is a long-term strategy for organic rankings, while Google Ads is paid advertising for immediate visibility. We recommend a hybrid approach for best results." },
                            { q: "Do I own my ad account?", a: "Yes, absolutely. You retain full ownership and administrative access to your Google Ads account at all times." },
                            { q: "Can you audit my existing account?", a: "Yes! We offer a free preliminary audit to identify wasted spend and missed opportunities in your current campaigns." }
                        ].map((faq, i) => (
                            <FAQItem key={i} question={faq.q} answer={faq.a} />
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="max-w-5xl mx-auto bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                                Drive Qualified Traffic & <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Maximize ROI</span>
                            </h2>
                            <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
                                Transform your business with expert Google Ads management today.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/contact">
                                    <Button size="lg" className="h-14 px-10 bg-white text-black hover:bg-slate-200 rounded-full font-bold text-lg transition-transform hover:scale-105 w-full sm:w-auto">
                                        Start Your Campaign
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </section>
            </div>
        </Layout>
    );
};

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-white/10 rounded-xl bg-white/[0.02] overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
            >
                <span className="font-semibold text-lg text-white">{question}</span>
                {isOpen ? <ChevronUp className="h-5 w-5 text-purple-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 pt-0 text-slate-400 leading-relaxed border-t border-white/5">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default GoogleAds;
