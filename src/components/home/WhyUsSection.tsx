import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Zap, Users, TrendingUp, ShieldCheck, Clock } from "lucide-react";

const features = [
    {
        icon: Target,
        title: "Data-Driven Strategy",
        description: "Every campaign is backed by deep analytics and market research to maximize your ROI."
    },
    {
        icon: Zap,
        title: "Fast Execution",
        description: "We move quickly without compromising quality—launch campaigns within days, not weeks."
    },
    {
        icon: Users,
        title: "Dedicated Team",
        description: "Get a committed team that treats your business like their own, available when you need them."
    },
    {
        icon: TrendingUp,
        title: "Scalable Growth",
        description: "Our strategies are designed to grow with you—from startup budgets to enterprise scale."
    },
    {
        icon: ShieldCheck,
        title: "Transparent Reporting",
        description: "Clear, honest communication with detailed reports—no hidden metrics or confusing jargon."
    },
    {
        icon: Clock,
        title: "Proven Experience",
        description: "Over a decade of navigating digital trends and delivering results across industries."
    }
];

export const WhyUsSection = () => {
    return (
        <section className="py-24 relative overflow-hidden bg-background">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left Side: Content */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="inline-block px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-medium mb-6"
                        >
                            Why Us
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
                        >
                            Why Brands <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Trust Us</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-400 text-lg mb-10 leading-relaxed max-w-lg"
                        >
                            We don't just run ads—we build growth engines. Our approach combines creativity with data, delivering measurable results that actually move your business forward.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <Button
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-purple-500/25"
                                onClick={() => window.open('https://topmate.io/ms_digimark/1868704', '_blank')}
                            >
                                Book 1:1 Quick Call
                            </Button>

                            <Link to="/portfolio">
                                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-full px-8 h-12 text-base">
                                    View Case Studies
                                </Button>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Right Side: Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 + (index * 0.1) }}
                                className="p-6 rounded-2xl bg-[#0F0A1F] border border-white/5 hover:border-purple-500/30 transition-colors group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                                    <feature.icon className="h-5 w-5 text-purple-400" />
                                </div>
                                <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};
