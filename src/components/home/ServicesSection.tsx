import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  return colorMap[color] || 'text-pink-400';
};

export const ServicesSection = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(!isServicesSupabaseConfigured);

  useEffect(() => {
    const fetchServices = async () => {
      if (!isServicesSupabaseConfigured) {
        // Use fallback services
        setServices(fallbackServices);
        setUseFallback(true);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await servicesSupabase
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
    if (isServicesSupabaseConfigured) {
      const channel = servicesSupabase
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
        servicesSupabase.removeChannel(channel);
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
                <div className="flex items-center gap-3 px-6 py-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-purple-500/50 transition-[background-color,border-color] duration-300 cursor-pointer will-change-[background-color,border-color]">
                  <service.icon className={`h-4 w-4 ${getColorClass(service.iconColor)}`} />
                  <span className="text-sm font-semibold whitespace-nowrap">{service.title}</span>
                  {service.isPopular && (
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      POPULAR
                    </span>
                  )}
                </div>

                {/* Content Tooltip/Popup on Hover */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 p-4 glass-card opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 z-50 border-purple-500/30 backdrop-blur-xl will-change-opacity">
                  <p className="text-xs text-gray-300 leading-relaxed text-center">
                    {service.description}
                  </p>
                  {service.learnMoreUrl && (
                    <p className="text-xs text-primary mt-2 text-center">
                      Learn more →
                    </p>
                  )}
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
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: [0.1, 0.2, 0.1],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 5,
                    delay: i * 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 border border-purple-500/10 rounded-full will-change-transform"
                  style={{ transform: `scale(${i * 0.3})` }}
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