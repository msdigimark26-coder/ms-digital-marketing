import React, { useState, useEffect } from 'react';
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
  Layers,
  Loader2,
  Cpu, Wifi, Database, Cloud, Zap, Globe, Server, HardDrive,
  Radio, Bluetooth, Network, MonitorSmartphone, Binary, CircuitBoard, Webhook,
  Cuboid, BoxSelect, Shapes, Pentagon, Hexagon, Package, Combine, Maximize2
} from 'lucide-react';
import { supabase, isConfigured as isSupabaseConfigured } from '@/integrations/supabase/client';
import { servicesSupabase, isServicesSupabaseConfigured } from '@/integrations/supabase/servicesClient';
import { toast } from 'sonner';

interface ServiceShowcase {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  icon_color: string;
  is_popular: boolean;
  order_index: number;
  is_active: boolean;
  learn_more_url?: string;
}

// Fallback static services for when Supabase is not configured
const fallbackServices = [
  {
    title: "SEO & Content Marketing",
    icon: Search,
    description: "Rank #1 on Google with data-driven SEO strategies and high-converting content.",
    iconColor: "blue",
    isPopular: true
  },
  {
    title: "Social Media Ads",
    icon: Share2,
    description: "Scale your revenue with targeted Facebook, Instagram, and LinkedIn ad campaigns.",
    iconColor: "pink",
    isPopular: false
  },
  {
    title: "Performance Branding",
    icon: TargetIcon,
    description: "Build a brand that doesn't just look good but drives measurable business growth.",
    iconColor: "green",
    isPopular: false
  },
  {
    title: "Web Development",
    icon: Code,
    description: "Fast, responsive, and SEO-optimized websites built to convert visitors into customers.",
    iconColor: "pink",
    isPopular: false
  },
  {
    title: "Video Production",
    icon: Film,
    description: "Engaging video content that captures attention and tells your brand mission.",
    iconColor: "red",
    isPopular: false
  },
  {
    title: "UI/UX Design",
    icon: Palette,
    description: "User-centric designs that provide seamless experiences across all digital touchpoints.",
    iconColor: "purple",
    isPopular: false
  },
  {
    title: "3D Visualization",
    icon: Box,
    description: "Bring products and concepts to life with photorealistic 3D visualizations.",
    iconColor: "cyan",
    isPopular: false
  },
];

const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    code: Code,
    search: Search,
    share2: Share2,
    target: TargetIcon,
    film: Film,
    palette: Palette,
    box: Box,
    sparkles: Sparkles,
    layers: Layers,
    // IoT & Tech
    cpu: Cpu,
    wifi: Wifi,
    database: Database,
    cloud: Cloud,
    zap: Zap,
    globe: Globe,
    server: Server,
    harddrive: HardDrive,
    radio: Radio,
    bluetooth: Bluetooth,
    network: Network,
    monitor: MonitorSmartphone,
    binary: Binary,
    circuit: CircuitBoard,
    webhook: Webhook,
    // 3D Modeling
    cuboid: Cuboid,
    boxselect: BoxSelect,
    shapes: Shapes,
    pentagon: Pentagon,
    hexagon: Hexagon,
    package: Package,
    combine: Combine,
    maximize: Maximize2,
  };
  return iconMap[iconName] || Layers;
};

const getColorClass = (color: string): string => {
  const colorMap: { [key: string]: string } = {
    pink: 'text-pink-400',
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    cyan: 'text-cyan-400',
  };
  return colorMap[color] || 'text-purple-400';
};

const getCardGlow = (color: string): string => {
  const map: { [key: string]: string } = {
    pink: 'hover:bg-pink-500/10 hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]',
    blue: 'hover:bg-blue-500/10 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    green: 'hover:bg-green-500/10 hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]',
    purple: 'hover:bg-purple-500/10 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    red: 'hover:bg-red-500/10 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]',
    yellow: 'hover:bg-yellow-500/10 hover:border-yellow-500/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]',
    cyan: 'hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]',
  };
  return map[color] || map.purple;
};

export const ServicesSection = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(!isSupabaseConfigured);
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      // Use fallback services if neither Supabase client is configured
      if (!isSupabaseConfigured && !isServicesSupabaseConfigured) {
        setServices(fallbackServices);
        setUseFallback(true);
        setLoading(false);
        return;
      }

      try {
        const client = isServicesSupabaseConfigured ? servicesSupabase : supabase;
        const { data, error } = await client
          .from('services_showcase')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          // Map database services to component format
          const mappedServices = data.map((service: ServiceShowcase) => ({
            title: service.title,
            icon: getIconComponent(service.icon_name),
            description: service.description,
            iconColor: service.icon_color,
            isPopular: service.is_popular,
            learnMoreUrl: service.learn_more_url
          }));
          setServices(mappedServices);
          setUseFallback(false);
        } else {
          // No services in database, use fallback
          setServices(fallbackServices);
          setUseFallback(true);
        }
      } catch (error: any) {
        console.error('Error fetching services:', error);
        setServices(fallbackServices);
        setUseFallback(true);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();

    // Set up real-time subscription for live updates
    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('services_showcase_changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'services_showcase'
          },
          (payload) => {
            console.log('Services changed:', payload);
            // Refetch services when any change occurs
            fetchServices();
          }
        )
        .subscribe();

      // Cleanup subscription on unmount
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);


  if (loading) {
    return (
      <section className="py-24 relative overflow-hidden bg-black text-white">
        <div className="container mx-auto px-4 relative">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

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
            MS Digi Mark delivers AI-powered digital marketing services designed
            to bring high-quality traffic and grow your business 10x faster.
          </motion.p>
        </div>

        <div className="relative max-w-6xl mx-auto z-10 mt-16 pb-20 font-sans pointer-events-none">

          {/* Top Row: Service Pills */}
          <div className="w-full relative z-20 pointer-events-auto before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-4 md:before:w-8 before:bg-gradient-to-r before:from-black before:to-transparent before:z-10 before:pointer-events-none md:before:hidden after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-4 md:after:w-8 after:bg-gradient-to-l after:from-black after:to-transparent after:z-10 after:pointer-events-none md:after:hidden">
            <div className="flex flex-nowrap md:flex-wrap overflow-x-auto md:overflow-visible pb-4 md:pb-0 justify-start md:justify-center gap-3 md:gap-4 px-4 md:px-0 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {/* spacer for left padding on mobile scroll to make it look like px-4 but allow scrolling past it */}
              <div className="w-1 flex-shrink-0 md:hidden" />

              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onMouseEnter={() => setHoveredService(service.title)}
                  onMouseLeave={() => setHoveredService(null)}
                  className="group relative flex-shrink-0 snap-center first:ml-4 last:mr-4 md:first:ml-0 md:last:mr-0 z-10 hover:z-50"
                >
                  <div className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/10 bg-[#0e0a17] transition-all duration-300 cursor-pointer text-slate-200 hover:text-white ${getCardGlow(service.iconColor)}`}>
                    <service.icon className={`h-4 w-4 ${getColorClass(service.iconColor)} group-hover:scale-110 transition-transform duration-300`} />
                    <span className="text-[13px] font-bold tracking-wide whitespace-nowrap">{service.title}</span>
                    {service.isPopular && (
                      <motion.span
                        animate={{ boxShadow: ['0 0 0px rgba(217,70,239,0)', '0 0 8px rgba(217,70,239,0.5)', '0 0 0px rgba(217,70,239,0)'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ml-1"
                      >
                        POPULAR
                      </motion.span>
                    )}
                  </div>

                  {/* Tooltip */}
                  <AnimatePresence>
                    {hoveredService === service.title && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+12px)] w-[280px] z-[100] pointer-events-none"
                      >
                        <div className="bg-[#110A1F]/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8),0_0_20px_rgba(168,85,247,0.2)]">
                          <p className="text-sm text-slate-300 leading-relaxed mb-4">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-2 text-primary text-xs font-semibold tracking-wide pointer-events-auto cursor-pointer hover:text-purple-300 transition-colors w-fit">
                            Learn more
                            <motion.span
                              animate={{ x: [0, 4, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            >
                              →
                            </motion.span>
                          </div>
                        </div>
                        {/* Tooltip Arrow pointing up */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#110A1F]/95 border-t border-l border-purple-500/30 rotate-45 transform origin-center" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}

              {/* spacer for right padding on mobile scroll */}
              <div className="w-1 flex-shrink-0 md:hidden" />
            </div>
          </div>

          {/* SVG Connection Lines from Pills to Hub */}
          <div className="w-full flex-col items-center relative z-10 opacity-50 hidden md:flex -mt-4 mb-2">
            <div className="w-[80%] h-24 border-b border-l border-r border-primary/30 rounded-b-[100px]" />
            <div className="w-0.5 h-12 bg-primary/40" />
          </div>
          {/* Mobile spacing fallback */}
          <div className="h-10 md:h-0" />

          {/* Main Visualization Container */}
          <div className="relative w-full max-w-5xl mx-auto aspect-[3/4] md:aspect-auto md:h-[550px] mt-8 bg-[#05020a]/80 backdrop-blur-sm rounded-3xl md:rounded-[40px] shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/[0.02] flex items-center justify-center pointer-events-none">

            <div className="absolute inset-0 bg-primary/5 blur-3xl pointer-events-none rounded-3xl md:rounded-[40px]" />

            {/* Top Hub Label connected to the line */}
            <div className="absolute -top-5 md:-top-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto w-[90%] md:w-auto flex justify-center">
              <div className="bg-[#0a0514] border border-white/5 px-4 md:px-6 py-2.5 rounded-xl flex items-center gap-2.5 shadow-[0_0_30px_rgba(168,85,247,0.15)] ring-1 ring-primary/20 hover:ring-primary/40 transition-shadow overflow-hidden">
                <div className="h-6 w-6 flex-shrink-0 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-[11px] md:text-[14px] font-bold text-white tracking-wide truncate">Creating High Quality Traffic for Conversions</span>
              </div>
            </div>

            {/* Geometric SVG Connections Map */}
            <svg viewBox="0 0 1000 550" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <linearGradient id="line-left" x1="1" y1="0" x2="0" y2="0">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="line-right" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="curve-left" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="curve-right" x1="1" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              <path d="M 500 0 L 500 160" stroke="#8b5cf6" strokeOpacity="1" strokeWidth="1.5" fill="none" />
              <path d="M 250 160 L 500 160" stroke="url(#line-left)" strokeWidth="1.5" fill="none" />
              <path d="M 500 160 L 750 160" stroke="url(#line-right)" strokeWidth="1.5" fill="none" />
              <path d="M 250 160 L 250 280" stroke="#3b82f6" strokeOpacity="0.8" strokeWidth="1.5" fill="none" />
              <path d="M 750 160 L 750 280" stroke="#a855f7" strokeOpacity="0.8" strokeWidth="1.5" fill="none" />
              <path d="M 250 280 Q 250 440 450 440" stroke="url(#curve-left)" strokeWidth="1.5" fill="none" />
              <path d="M 750 280 Q 750 440 550 440" stroke="url(#curve-right)" strokeWidth="1.5" fill="none" />

              <circle r="5" fill="#ffffff" filter="drop-shadow(0 0 8px #ffffff)">
                <animateMotion path="M 500 -10 L 500 160 L 250 160 L 250 280 Q 250 440 450 440" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.1;0.5;0.9;1" dur="3s" repeatCount="indefinite" />
              </circle>

              <circle r="4" fill="#60a5fa" filter="drop-shadow(0 0 6px #60a5fa)">
                <animateMotion path="M 500 -10 L 500 160 L 250 160 L 250 280 Q 250 440 450 440" dur="3s" repeatCount="indefinite" begin="1s" />
                <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.1;0.5;0.9;1" dur="3s" repeatCount="indefinite" begin="1s" />
              </circle>

              <circle r="5" fill="#ffffff" filter="drop-shadow(0 0 8px #ffffff)">
                <animateMotion path="M 500 -10 L 500 160 L 750 160 L 750 280 Q 750 440 550 440" dur="3s" repeatCount="indefinite" begin="0.5s" />
                <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.1;0.5;0.9;1" dur="3s" repeatCount="indefinite" begin="0.5s" />
              </circle>

              <circle r="4" fill="#c084fc" filter="drop-shadow(0 0 6px #c084fc)">
                <animateMotion path="M 500 -10 L 500 160 L 750 160 L 750 280 Q 750 440 550 440" dur="3s" repeatCount="indefinite" begin="1.5s" />
                <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.1;0.5;0.9;1" dur="3s" repeatCount="indefinite" begin="1.5s" />
              </circle>
            </svg>

            {/* Daily Leads Node */}
            <div className="absolute top-[51%] left-[25%] -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-auto">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-[#0a0514]/90 backdrop-blur-md border border-white/10 pl-1.5 pr-4 md:pl-2 md:pr-6 py-1.5 md:py-2 rounded-full flex flex-col md:flex-row items-center gap-1.5 md:gap-3 shadow-[0_0_30px_rgba(59,130,246,0.2)] ring-1 ring-blue-500/30 hover:ring-blue-500/60 hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] cursor-pointer whitespace-nowrap transition-all duration-300">
                <div className="h-6 w-6 md:h-8 md:w-8 flex-shrink-0 rounded-full bg-blue-500/20 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-blue-500/40 rounded-full blur-md animate-pulse" />
                  <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-blue-400 relative z-10" />
                </div>
                <span className="text-[10px] md:text-sm font-bold text-white tracking-wide">Daily Leads</span>
              </motion.div>
            </div>

            {/* Sales Conversions Node */}
            <div className="absolute top-[51%] left-[75%] -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-auto">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="bg-[#0a0514]/90 backdrop-blur-md border border-white/10 pl-1.5 pr-4 md:pl-2 md:pr-6 py-1.5 md:py-2 rounded-full flex flex-col md:flex-row items-center gap-1.5 md:gap-3 shadow-[0_0_30px_rgba(168,85,247,0.2)] ring-1 ring-primary/30 hover:ring-primary/60 hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] cursor-pointer whitespace-nowrap transition-all duration-300">
                <div className="h-6 w-6 md:h-8 md:w-8 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-primary/40 rounded-full blur-md animate-pulse" />
                  <Folder className="h-3 w-3 md:h-4 md:w-4 text-primary relative z-10" />
                </div>
                <span className="text-[10px] md:text-sm font-bold text-white tracking-wide">Sales Conversions</span>
              </motion.div>
            </div>

            {/* Your Brand Node */}
            <div className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto">
              <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.5, type: 'spring' }} className="w-20 h-20 md:w-[120px] md:h-[120px] rounded-full bg-[#05020a] border-[2px] md:border-[3px] border-[#9333ea] flex flex-col items-center justify-center p-2 shadow-[0_0_60px_rgba(147,51,234,0.6)] hover:scale-110 transition-all duration-500 ring-2 md:ring-4 ring-[#9333ea]/30 ring-offset-4 md:ring-offset-8 ring-offset-[#05020a] cursor-pointer group hover:shadow-[0_0_80px_rgba(147,51,234,0.8)] relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full animate-pulse" />
                <div className="absolute -inset-2 md:-inset-3 rounded-full border border-[#9333ea]/40 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute -inset-4 md:-inset-6 rounded-full border border-[#9333ea]/20 pointer-events-none group-hover:scale-120 transition-transform duration-700 delay-75" />
                <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-[#9333ea] mb-0.5 md:mb-1 relative z-10">Your</span>
                <span className="text-sm md:text-2xl font-black uppercase tracking-tight text-white leading-none relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">Brand</span>
              </motion.div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};