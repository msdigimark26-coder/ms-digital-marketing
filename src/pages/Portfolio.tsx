import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Filter, Sparkles, Layers, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

// Type definition for projects
interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  tags: string[];
  link?: string;
  color: string;
}

const categories = ["All", "Branding", "Web Design", "Social Media", "3D Modeling", "Video Editing"];

const projects: Project[] = [
  {
    id: "1",
    title: "TechVision Rebrand",
    category: "Branding",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
    description: "Complete visual identity overhaul for a leading AI startup.",
    tags: ["Logo", "Identity", "Guidelines"],
    color: "from-purple-500 to-blue-500"
  },
  {
    id: "2",
    title: "EcoLife Campaign",
    category: "Social Media",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800",
    description: "Viral sustainability campaign reaching 2M+ organic impressions.",
    tags: ["Strategy", "Content", "Viral"],
    color: "from-green-400 to-emerald-600"
  },
  {
    id: "3",
    title: "NexGen 3D Product",
    category: "3D Modeling",
    image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800",
    description: "Photorealistic product visualizations for pre-launch marketing.",
    tags: ["Blender", "Product", "Animation"],
    color: "from-orange-400 to-red-500"
  },
  {
    id: "4",
    title: "Artistry Portfolio",
    category: "Web Design",
    image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800",
    description: "Award-winning immersive website experience for a digital artist.",
    tags: ["React", "WebGL", "UX"],
    color: "from-pink-500 to-rose-500"
  },
  {
    id: "5",
    title: "Future Finance App",
    category: "Web Design",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
    description: "Clean, intuitive dashboard design for a fintech platform.",
    tags: ["UI/UX", "Fintech", "Mobile"],
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "6",
    title: "Neon Nights",
    category: "Video Editing",
    image: "https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=800",
    description: "High-energy promotional video for a cyberpunk event.",
    tags: ["After Effects", "Rhythm", "Color Grading"],
    color: "from-fuchsia-500 to-purple-600"
  },
];

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  const filteredProjects = projects.filter(p =>
    activeCategory === "All" || p.category === activeCategory
  );

  return (
    <Layout>
      <div className="min-h-screen bg-[#05030e] relative overflow-hidden">
        {/* Background Ambient Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]" />
        </div>

        <section className="relative pt-32 pb-12 md:pt-40 md:pb-24">
          <div className="container mx-auto px-4">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto mb-20"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-purple-400 text-xs font-bold uppercase tracking-widest mb-6">
                <Layers className="h-3 w-3" />
                <span>Selected Works</span>
              </div>

              <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
                We Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-white">Digital Legacies.</span>
              </h1>

              <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Explore our curated collection of projects where strategy meets stunning design. Each piece is crafted to drive results and capture attention.
              </p>
            </motion.div>

            {/* Filter Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-2 mb-16"
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${activeCategory === cat
                    ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>

            {/* Projects Grid */}
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project) => (
                  <motion.div
                    layout
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="group relative"
                    onMouseEnter={() => setHoveredProject(project.id)}
                    onMouseLeave={() => setHoveredProject(null)}
                  >
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
                      {/* Image */}
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />

                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                      {/* Content Overlay */}
                      <div className="absolute inset-0 p-6 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="mb-auto flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                          <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <ArrowUpRight className="h-5 w-5 text-white" />
                          </div>
                        </div>

                        <div className="relative">
                          <div className={`h-1 w-12 mb-4 rounded-full bg-gradient-to-r ${project.color}`} />
                          <span className="text-xs font-bold uppercase tracking-wider text-white/70 mb-2 block">
                            {project.category}
                          </span>
                          <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                          <p className="text-slate-300 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-0 group-hover:h-auto overflow-hidden">
                            {project.description}
                          </p>

                          {/* Tags */}
                          <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 transform translate-y-4 group-hover:translate-y-0">
                            {project.tags.map(tag => (
                              <span key={tag} className="text-[10px] px-2 py-1 rounded bg-white/10 text-white border border-white/10 backdrop-blur-sm">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {filteredProjects.length === 0 && (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4">
                  <Search className="h-6 w-6 text-slate-500" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">No projects found</h3>
                <p className="text-slate-400">Try selecting a different category.</p>
              </div>
            )}

            {/* CTA Section */}
            <div className="mt-32 text-center">
              <p className="text-slate-400 mb-6">Have a project in mind?</p>
              <Link to="/contact">
                <Button size="lg" className="bg-white text-black hover:bg-slate-200 rounded-full h-12 px-8 font-bold">
                  Let's Work Together
                </Button>
              </Link>
            </div>

          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Portfolio;
