import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import {
    Box,
    Layers3,
    Building2,
    Package,
    Lightbulb,
    Eye,
    Ruler,
    ArrowRight,
    Rocket,
    Sparkles,
    Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const deliverables = [
    {
        icon: Package,
        title: "Product Visualization",
        description: "Photorealistic 3D models of products for marketing, e-commerce, and presentations."
    },
    {
        icon: Building2,
        title: "Architectural Renders",
        description: "Stunning architectural visualizations for real estate, interior design, and construction."
    },
    {
        icon: Layers3,
        title: "3D Animation",
        description: "Dynamic 3D animations that bring concepts to life with cinematic quality."
    },
    {
        icon: Eye,
        title: "Virtual Tours",
        description: "Immersive 360° virtual tours for showcasing spaces and environments."
    },
    {
        icon: Lightbulb,
        title: "Concept Design",
        description: "Transform ideas into visual reality with conceptual 3D modeling and prototyping."
    },
    {
        icon: Ruler,
        title: "Technical Modeling",
        description: "Precision engineering models with accurate measurements and specifications."
    }
];

const processSteps = [
    {
        number: "01",
        title: "Briefing",
        description: "Understanding project requirements, references, and desired output"
    },
    {
        number: "02",
        title: "Modeling",
        description: "Creating detailed 3D geometry with precision and accuracy"
    },
    {
        number: "03",
        title: "Texturing",
        description: "Applying materials, colors, and surface details for realism"
    },
    {
        number: "04",
        title: "Lighting & Rendering",
        description: "Setting up scenes with photorealistic lighting and cameras"
    },
    {
        number: "05",
        title: "Post-Processing",
        description: "Final touches, compositing, and delivery in required formats"
    }
];

const ThreeDModeling = () => {
    return (
        <Layout>
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
                <div className="absolute inset-0 bg-[#05030e]">
                    {/* Grid Background */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                    {/* Radial Gradient */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_50%,#a855f70a,transparent)]"></div>
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
                            <Box className="w-4 h-4" />
                            3D Visualization Services
                        </motion.div>

                        <h1 className="font-display text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-tight">
                            3D Modeling & <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 relative">
                                Visualization
                                <div className="absolute -inset-1 blur-2xl bg-purple-500/20 -z-10 rounded-full"></div>
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 font-light">
                            Photorealistic 3D visualizations for products, architecture, and creative projects that captivate and convert.
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
                            What We <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Create</span>
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Professional 3D modeling and visualization services that bring imagination to reality with pixel-perfect detail.
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

            {/* Use Cases Section */}
            <section className="py-32 bg-[#05030e] relative overflow-hidden">
                <div className="container px-4 relative z-10">
                    <div className="text-center mb-24">
                        <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                            Industry <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Applications</span>
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                            Our 3D visualization services power diverse industries—from e-commerce and real estate to manufacturing and entertainment.
                        </p>
                    </div>

                    {/* Industry Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
                        {[
                            { title: "E-Commerce", metric: "360° Product Views" },
                            { title: "Real Estate", metric: "Virtual Property Tours" },
                            { title: "Manufacturing", metric: "Technical Prototypes" },
                            { title: "Entertainment", metric: "3D Character Design" }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="relative group"
                            >
                                <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10 p-6 flex flex-col items-center justify-center hover:border-purple-500/30 transition-all">
                                    <Maximize2 className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                                    <h3 className="text-lg font-bold text-white mb-2 text-center">{item.title}</h3>
                                    <p className="text-purple-400 font-semibold text-sm text-center">{item.metric}</p>
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
                            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Workflow</span>
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            From concept to final render—precision at every step.
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
                                    Bring Your Vision to Life <Rocket className="ml-2 w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </Layout>
    );
};

export default ThreeDModeling;
