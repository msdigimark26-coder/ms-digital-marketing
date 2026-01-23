import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { servicesSupabase as supabase, isServicesSupabaseConfigured } from "@/integrations/supabase/servicesClient";
import { Card3DTilt } from "@/components/ui/Card3DTilt";

// Fallback data for when Supabase is not configured yet
const FALLBACK_PROJECTS = [
  {
    title: "TechVision Rebrand",
    category: "Branding & UI/UX",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
    description: "Complete brand overhaul for a leading tech startup including new logo, guidelines, and website.",
    tags: ["Strategy", "Design", "Development"]
  },
  {
    title: "EcoLife Campaign",
    category: "Social Media Marketing",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=60",
    description: "Viral social media campaign that increased engagement by 300% across all platforms.",
    tags: ["Content", "Viral", "Strategy"]
  },
  {
    title: "NexGen 3D Product",
    category: "3D Modeling",
    image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&auto=format&fit=crop&q=60",
    description: "Photorealistic 3D rendering for next-generation consumer electronics product launch.",
    tags: ["3D Art", "Animation", "Render"]
  },
  {
    title: "Artistry Portfolio",
    category: "Web Development",
    image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&auto=format&fit=crop&q=60",
    description: "Award-winning portfolio website for a digital artist featuring immersive WebGL effects.",
    tags: ["WebGL", "Design", "React"]
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  "branding": "Branding",
  "web-design": "Web Design",
  "social-media": "Social Media",
  "3d-modeling": "3D Modeling",
  "video-editing": "Video Editing"
};

export const PortfolioSection = () => {
  const [projects, setProjects] = useState<any[]>(FALLBACK_PROJECTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!isServicesSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("portfolio_projects")
          .select("*")
          .eq("is_featured", true)
          .eq("is_active", true)
          .order("order_index", { ascending: true })
          .limit(4);

        if (error) throw error;

        if (data && data.length > 0) {
          setProjects(data.map(p => ({
            ...p,
            image: p.image_url,
            category: CATEGORY_LABELS[p.category] || p.category // Fallback to raw slug if no map
          })));
        }
      } catch (error) {
        console.error("Error fetching featured portfolio:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <section className="py-32 relative overflow-hidden bg-background">
      {/* Background Decorative Elements */}
      <div className="absolute top-[20%] right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[60px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 mb-4"
            >
              <div className="w-10 h-[1px] bg-purple-500"></div>
              <span className="text-purple-400 font-bold uppercase tracking-widest text-sm">Case Studies</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
            >
              Selected <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Works</span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/portfolio">
              <Button size="lg" className="rounded-full h-12 px-8 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white group">
                View All Projects
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {projects.map((project, index) => (
            <motion.div
              key={project.id || project.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className={`group relative ${index % 2 === 1 ? 'md:translate-y-16' : ''}`}
            >
              <Card3DTilt maxTilt={10} glareEnabled={true}>
                <div className="relative overflow-hidden rounded-2xl aspect-[4/3] mb-6">
                  {/* Image Hover Zoom */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500 z-10" />
                  <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 will-change-transform"
                  />

                  {/* Search/Link Icon Overlay */}
                  <a href={project.project_url || "#"} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-20">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <ArrowUpRight className="h-6 w-6 text-black" />
                      </div>
                    </div>
                  </a>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {project.tags && project.tags.map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1 rounded-full border border-white/10 text-xs text-slate-400 uppercase tracking-wider bg-white/[0.02]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-3xl font-bold text-white group-hover:text-purple-400 transition-colors cursor-pointer">
                    {project.title}
                  </h3>

                  <p className="text-slate-400 leading-relaxed max-w-md line-clamp-2">
                    {project.description}
                  </p>
                </div>
              </Card3DTilt>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
