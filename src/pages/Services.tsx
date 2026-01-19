import { useRef, useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import {
  Search, Share2, Target, Code, Film, Palette, Box, ArrowRight, Sparkles, Zap, Globe, Layers, Loader2,
  Cpu, Wifi, Database, Cloud, Server, HardDrive, Radio, Bluetooth, Network, MonitorSmartphone,
  Binary, CircuitBoard, Webhook, Cuboid, BoxSelect, Shapes, Pentagon, Hexagon, Package, Combine, Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { servicesSupabase, isServicesSupabaseConfigured } from "@/integrations/supabase/servicesClient";

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

// Icon mapping
const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    code: Code,
    search: Search,
    share2: Share2,
    target: Target,
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

// Color gradient mapping
const getColorGradient = (color: string): string => {
  const colorMap: { [key: string]: string } = {
    pink: 'from-purple-500 via-pink-500 to-red-500',
    blue: 'from-blue-400 via-cyan-400 to-teal-400',
    green: 'from-green-400 via-emerald-500 to-teal-500',
    purple: 'from-violet-500 via-purple-500 to-indigo-500',
    red: 'from-pink-500 via-rose-500 to-red-500',
    yellow: 'from-orange-400 via-yellow-400 to-amber-400',
    cyan: 'from-cyan-400 via-blue-500 to-indigo-500',
  };
  return colorMap[color] || 'from-purple-500 via-pink-500 to-red-500';
};

// Fallback static services for when Supabase is not configured
const fallbackServices = [
  {
    id: "web",
    icon: Code,
    title: "Web Design & Development",
    desc: "Create stunning, high-performance websites that convert visitors into customers. Custom designs tailored to your brand.",
    color: "from-purple-500 via-pink-500 to-red-500",
    link: "/services/web-design",
    badge: "Popular"
  },
  {
    id: "seo",
    icon: Search,
    title: "SEO & Content Marketing",
    desc: "Dominate search rankings with data-driven strategies and compelling content that drives organic traffic.",
    color: "from-blue-400 via-cyan-400 to-teal-400",
    link: "/contact"
  },
  {
    id: "social",
    icon: Share2,
    title: "Social Media Marketing",
    desc: "Build engaged communities across platforms. We handle strategy, content creation, and community management.",
    color: "from-orange-400 via-pink-500 to-purple-500",
    link: "/contact"
  },
  {
    id: "ppc",
    icon: Target,
    title: "PPC & Paid Advertising",
    desc: "Maximize ROI with precision-targeted campaigns on Google, Facebook, LinkedIn and more.",
    color: "from-green-400 via-emerald-500 to-teal-500",
    link: "/contact"
  },
  {
    id: "media",
    icon: Film,
    title: "Video & Photo Editing",
    desc: "Transform footage into cinematic masterpieces. Professional editing, color grading, and motion graphics.",
    color: "from-pink-500 via-rose-500 to-red-500",
    link: "/contact"
  },
  {
    id: "uiux",
    icon: Palette,
    title: "UI/UX Design",
    desc: "Craft intuitive interfaces users love. We design user-centric digital experiences that delight and convert.",
    color: "from-violet-500 via-purple-500 to-indigo-500",
    link: "/contact"
  },
  {
    id: "3d",
    icon: Box,
    title: "3D Modeling",
    desc: "Photorealistic 3D visualizations for products, architecture, and creative projects.",
    color: "from-cyan-400 via-blue-500 to-indigo-500",
    link: "/contact"
  },
];

const ServiceCard = ({ s, i }: { s: any; i: number }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = ({ currentTarget, clientX, clientY }: React.MouseEvent) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.1, duration: 0.5 }}
      onMouseMove={handleMouseMove}
      className="group relative rounded-3xl border border-white/10 bg-white/5 px-8 py-10 hover:border-white/20 transition-colors overflow-hidden"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(147, 51, 234, 0.15),
              transparent 80%
            )
          `,
        }}
      />

      <div className="relative z-10 h-full flex flex-col">
        <div className="mb-6 flex items-center justify-between">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${s.color} bg-opacity-10 w-fit`}>
            <s.icon className="h-8 w-8 text-white drop-shadow-md" />
          </div>
          {s.badge && (
            <span className="px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 animate-pulse">
              {s.badge}
            </span>
          )}
        </div>

        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all duration-300">
          {s.title}
        </h3>

        <p className="text-slate-400 leading-relaxed mb-8 flex-grow">
          {s.desc}
        </p>

        <Link to={s.link} className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white transition-colors group-hover:translate-x-1 duration-300">
          Learn more <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
    </motion.div>
  );
};

const Services = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      if (!isServicesSupabaseConfigured) {
        // Use fallback services
        const mappedFallback = fallbackServices;
        setServices(mappedFallback);
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
            id: service.id,
            icon: getIconComponent(service.icon_name),
            title: service.title,
            desc: service.description,
            color: getColorGradient(service.icon_color),
            link: service.learn_more_url || '/contact',
            badge: service.is_popular ? 'Popular' : undefined
          }));
          setServices(mappedServices);
        } else {
          // No services in database, use fallback
          setServices(fallbackServices);
        }
      } catch (error: any) {
        console.error('Error fetching services:', error);
        setServices(fallbackServices);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();

    // Set up real-time subscription for live updates
    if (isServicesSupabaseConfigured) {
      const channel = servicesSupabase
        .channel('services_showcase_changes_page')
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
      <Layout>
        <div className="min-h-screen bg-[#05030e] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-slate-400">Loading services...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#05030e] relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[60%] h-[60%] bg-primary/5 rounded-full blur-[150px]" />
        </div>

        <section className="relative py-24 lg:py-32">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto mb-20"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-purple-400 text-xs font-bold uppercase tracking-widest mb-6">
                <Sparkles className="h-3 w-3" />
                <span>Our Expertise</span>
              </div>

              <h1 className="font-display text-5xl md:text-7xl font-bold mb-8">
                Digital Solutions for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-slate-400">
                  Modern Growth.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                We combine creativity with technical expertise to deliver transformative digital experiences that elevate your brand.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {services.map((s, i) => (
                <ServiceCard key={s.id} s={s} i={i} />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-32 text-center relative z-10"
            >
              <div className="bg-gradient-to-b from-[#110C1D] to-black border border-white/10 rounded-3xl p-12 md:p-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:linear-gradient(to_bottom,transparent,black)]" />
                <div className="relative z-10 max-w-2xl mx-auto">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to start your project?</h2>
                  <p className="text-slate-400 mb-8 text-lg">
                    Let's collaborate to build something extraordinary. Our team is ready to bring your vision to life.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/contact">
                      <Button size="lg" className="h-12 px-8 bg-white text-black hover:bg-slate-200 rounded-full font-bold text-base transition-transform hover:scale-105">
                        Start a Conversation
                      </Button>
                    </Link>
                    <Link to="/portfolio">
                      <Button size="lg" variant="outline" className="h-12 px-8 border-white/20 text-white hover:bg-white/10 rounded-full font-bold text-base bg-transparent">
                        View Our Work
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Services;

