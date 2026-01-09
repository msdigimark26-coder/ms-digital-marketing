
import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import {
    Palette,
    Code2,
    Zap,
    LayoutTemplate,
    MonitorSmartphone,
    Database,
    ArrowRight,
    MousePointer2,
    CheckCircle2,
    Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const deliverables = [
    {
        icon: Palette,
        title: "UI/UX Design",
        description: "Stunning interfaces that captivate users and drive engagement with cutting-edge design principles."
    },
    {
        icon: Code2,
        title: "Custom Development",
        description: "Scalable, high-performance websites built with modern technologies and clean code architecture."
    },
    {
        icon: Zap,
        title: "Speed Optimization",
        description: "Lightning-fast load times with advanced performance techniques for maximum conversions."
    },
    {
        icon: Database,
        title: "CMS Integration",
        description: "Seamless content management systems that empower you to control your digital presence."
    },
    {
        icon: LayoutTemplate,
        title: "Desktop Experience",
        description: "Immersive desktop interfaces with smooth animations and intuitive navigation."
    },
    {
        icon: MonitorSmartphone,
        title: "Mobile-First Design",
        description: "Responsive designs that deliver exceptional experiences across all devices and screen sizes."
    }
];

const processSteps = [
    {
        number: "01",
        title: "Discovery",
        description: "Deep dive into your brand, goals, and target audience"
    },
    {
        number: "02",
        title: "Strategy",
        description: "Create a comprehensive roadmap for your digital presence"
    },
    {
        number: "03",
        title: "Design",
        description: "Craft stunning visuals and intuitive user experiences"
    },
    {
        number: "04",
        title: "Development",
        description: "Build with cutting-edge technology and clean code"
    },
    {
        number: "05",
        title: "Launch",
        description: "Deploy and optimize for maximum performance"
    }
];

const WebDesign = () => {
    return (
        <Layout>
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
                <div className="absolute inset-0 bg-[#05030e]">
                    {/* Grid Background */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                    {/* Radial Gradient */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_50%,#7c3aed0a,transparent)]"></div>
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
                            <MonitorSmartphone className="w-4 h-4" />
                            Premium Web Solutions
                        </motion.div>



                        <h1 className="font-display text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-tight">
                            Webdesign & <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 relative">
                                Development
                                <div className="absolute -inset-1 blur-2xl bg-purple-500/20 -z-10 rounded-full"></div>
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 font-light">
                            We craft stunning, high-performance websites that transform visitors into customers and elevate your brand's digital presence.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link to="/">
                                <Button variant="outline" size="lg" className="border-purple-500/30 text-white hover:bg-purple-500/10 text-lg h-14 px-8 rounded-full font-medium transition-all group">
                                    <ArrowRight className="mr-2 h-5 w-5 rotate-180 group-hover:-translate-x-1 transition-transform" /> Back to Home
                                </Button>
                            </Link>
                            <Link to="/contact">
                                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 text-lg h-14 px-8 rounded-full font-bold shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all">
                                    Start Your Project <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <div className="animate-bounce mt-8 sm:mt-0">
                                <div className="w-6 h-10 border-2 border-slate-500 rounded-full flex justify-center p-1">
                                    <div className="w-1 h-3 bg-purple-500 rounded-full animate-scroll"></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Deliverables Section */}
            <section className="py-32 relative bg-[#070510]">
                <div className="container px-4">
                    <div className="text-center mb-24">
                        <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                            What We <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Deliver</span>
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Comprehensive web solutions designed to make your business stand out in the digital landscape.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {deliverables.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="group p-8 rounded-2xl bg-[#0f0a1f] border border-white/5 hover:border-purple-500/30 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.2)] relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                                    <item.icon className="w-24 h-24 text-purple-500" />
                                </div>

                                <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <item.icon className="w-7 h-7 text-purple-500" />
                                </div>

                                <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                                <p className="text-slate-400 leading-relaxed font-light">
                                    {item.description}
                                </p>
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
                            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Process</span>
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            A systematic approach to building exceptional digital experiences.
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 hidden md:block -translate-x-1/2"></div>

                        {processSteps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className={`flex flex-col md:flex-row items-center gap-8 md:gap-0 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                                    }`}
                            >
                                {/* Text Side */}
                                <div className={`flex-1 text-center md:text-left ${index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                                    <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
                                    <p className="text-slate-400 font-light">{step.description}</p>
                                </div>

                                {/* Center Circle */}
                                <div className="relative z-10 flex-shrink-0">
                                    <div className="w-16 h-16 rounded-full bg-[#05030e] border-2 border-purple-500 flex items-center justify-center shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)]">
                                        <span className="text-purple-400 font-bold text-lg">{step.number}</span>
                                    </div>
                                </div>

                                {/* Empty Side for spacing */}
                                <div className="flex-1 hidden md:block"></div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-center mt-24">
                        <div className="inline-block p-1 rounded-full bg-gradient-to-r from-purple-500/50 to-pink-500/50">
                            <Link to="/contact">
                                <Button size="lg" className="bg-[#05030e] hover:bg-[#0f0a1f] text-white border border-transparent hover:border-purple-500/30 h-14 px-10 rounded-full text-lg font-medium transition-all group">
                                    Ready to Start? <Rocket className="ml-2 w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </Layout>
    );
};

export default WebDesign;
