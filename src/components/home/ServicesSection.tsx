import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Share2,
  Target as TargetIcon,
  Code,
  Film,
  Palette,
  Box,
  Sparkles,
  TrendingUp,
  Folder,
  CircleDot
} from 'lucide-react';

const services = [
  {
    title: "SEO & Content Marketing",
    icon: Search,
    description: "Rank #1 on Google with data-driven SEO strategies and high-converting content.",
  },
  {
    title: "Social Media Ads",
    icon: Share2,
    description: "Scale your revenue with targeted Facebook, Instagram, and LinkedIn ad campaigns.",
  },
  {
    title: "Performance Branding",
    icon: TargetIcon,
    description: "Build a brand that doesn't just look good but drives measurable business growth.",
  },
  {
    title: "Web Development",
    icon: Code,
    description: "Fast, responsive, and SEO-optimized websites built to convert visitors into customers.",
  },
  {
    title: "Video Production",
    icon: Film,
    description: "Engaging video content that captures attention and tells your brand mission.",
  },
  {
    title: "UI/UX Design",
    icon: Palette,
    description: "User-centric designs that provide seamless experiences across all digital touchpoints.",
  },
  {
    title: "3D Visualization",
    icon: Box,
    description: "Bring products and concepts to life with photorealistic 3D visualizations.",
  },
];

export const ServicesSection = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-black text-white">
      <div className="container mx-auto px-4 relative">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            What We <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Do Best</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed"
          >
            The MS Digi Mark delivers AI-powered digital marketing services designed
            to bring high-quality traffic and grow your business 10x faster.
          </motion.p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Top Row: Service Pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-24 relative z-10">
            {/* SVG Connection Lines - Top to Center */}
            <div className="absolute top-12 left-0 w-full h-40 pointer-events-none hidden md:block opacity-40">
              <svg className="w-full h-full" viewBox="0 0 1200 100" preserveAspectRatio="none">
                <path d="M600,60 L600,100" stroke="#a855f7" strokeWidth="1.5" fill="none" />
                <path d="M200,60 Q200,80 600,80" stroke="rgba(168,85,247,0.3)" strokeWidth="1" fill="none" />
                <path d="M400,60 Q400,80 600,80" stroke="rgba(168,85,247,0.3)" strokeWidth="1" fill="none" />
                <path d="M800,60 Q800,80 600,80" stroke="rgba(168,85,247,0.3)" strokeWidth="1" fill="none" />
                <path d="M1000,60 Q1000,80 600,80" stroke="rgba(59,130,246,0.3)" strokeWidth="1" fill="none" />
              </svg>
            </div>

            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className="flex items-center gap-3 px-6 py-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-purple-500/50 transition-all cursor-pointer">
                  <service.icon className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-semibold whitespace-nowrap">{service.title}</span>
                </div>

                {/* Content Tooltip/Popup on Hover */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 p-4 glass-card opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50 border-purple-500/30 backdrop-blur-xl">
                  <p className="text-xs text-gray-300 leading-relaxed text-center">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>


          {/* Center Box: Main Goal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10 flex justify-center mb-16"
          >
            <div className="bg-purple-500/10 border border-purple-500/30 px-6 py-3 rounded-xl flex items-center gap-3 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
              <div className="h-6 w-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-purple-300">Creating High Quality Traffic for Conversions</span>
            </div>
          </motion.div>

          {/* Visualization Container */}
          <div className="relative border border-white/10 rounded-[40px] p-8 md:p-16 h-[400px] overflow-hidden bg-gradient-to-b from-transparent via-white/5 to-transparent">

            {/* Background Radial Waves */}
            <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: [0.1, 0.3, 0.1],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 4,
                    delay: i * 0.8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 border border-purple-500/20 rounded-full"
                  style={{ transform: `scale(${i * 0.2})` }}
                />
              ))}
            </div>

            {/* Daily Leads & Sales Conversions */}
            <div className="relative z-10 flex justify-between items-center h-full max-w-3xl mx-auto">
              {/* Left Pillar */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="bg-zinc-900/80 backdrop-blur border border-white/10 px-5 py-2.5 rounded-full flex items-center gap-3"
              >
                <div className="p-1.5 rounded-full bg-purple-500/20">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                </div>
                <span className="text-sm font-medium">Daily Leads</span>
              </motion.div>

              {/* Right Pillar */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="bg-zinc-900/80 backdrop-blur border border-white/10 px-5 py-2.5 rounded-full flex items-center gap-3"
              >
                <div className="p-1.5 rounded-full bg-blue-500/20">
                  <Folder className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-sm font-medium">Sales Conversions</span>
              </motion.div>
            </div>

            {/* Bottom SVG Lines to Brand */}
            <div className="absolute top-1/2 left-0 w-full h-1/2 pointer-events-none opacity-40">
              <svg className="w-full h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
                <path d="M500,0 L500,60" stroke="#a855f7" strokeWidth="2" fill="none" />
                <path d="M300,40 Q300,60 500,60" stroke="#a855f7" strokeWidth="2" fill="none" />
                <path d="M700,40 Q700,60 500,60" stroke="#a855f7" strokeWidth="2" fill="none" />
              </svg>
            </div>

            {/* Bottom Circle: Your Brand */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="w-24 h-24 rounded-full bg-black border-4 border-purple-500 flex flex-col items-center justify-center p-2 shadow-[0_0_50_rgba(168,85,247,0.4)]"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Your</span>
                <span className="text-sm font-black uppercase tracking-tight text-white">Brand</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};