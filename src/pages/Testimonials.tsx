import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Star, Quote, MessageSquare, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  image?: string;
  company?: string;
  flag?: string; // Optional country flag emoji
}

const defaultTestimonials: Testimonial[] = [
  {
    name: "Arjun Mehta",
    role: "Founder & CEO",
    company: "GrowthNest",
    content: "MS DIGI MARK completely transformed our online presence. Our website traffic grew by over 250% within just a few months. The ROI has been incredible.",
    rating: 5,
    flag: "🇮🇳",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
  },
  {
    name: "Sarah Thompson",
    role: "Marketing Director",
    company: "Elevate Digital",
    content: "They understand digital marketing at a global level. Their creative approach helped us scale our campaigns effectively across multiple regions.",
    rating: 5,
    flag: "🇺🇸",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
  },
  {
    name: "Karthik Ramesh",
    role: "CTO",
    company: "NextWave Solutions",
    content: "Outstanding web development service. Our website is now faster, cleaner, and optimized for conversions. The team is technically very sound.",
    rating: 5,
    flag: "🇮🇳",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
  },
  {
    name: "Daniel Brooks",
    role: "Creative Lead",
    company: "UrbanEdge Media",
    content: "From video editing to branding, the quality exceeded expectations. Professional, reliable, and results-driven. A true partner in growth.",
    rating: 5,
    flag: "🇬🇧",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
  },
  {
    name: "Priya Nair",
    role: "Head of Digital",
    company: "BrandSphere",
    content: "The team's digital strategy was spot on. From SEO to social media, everything delivered real impact. Highly recommended!",
    rating: 5,
    flag: "🇮🇳",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
  },
  {
    name: "Rahul Verma",
    role: "Product Manager",
    company: "VisionCraft Studio",
    content: "Their 3D modeling work added a whole new dimension to our product presentations. The attention to detail is truly impressive.",
    rating: 5,
    flag: "🇮🇳",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
  },
];

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    // Check for saved testimonials or use default
    const saved = localStorage.getItem("msdigimark_testimonials");
    if (saved) {
      try {
        setTestimonials(JSON.parse(saved));
      } catch (e) {
        setTestimonials(defaultTestimonials);
      }
    } else {
      setTestimonials(defaultTestimonials);
    }
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-[#05030e] relative overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        </div>

        <section className="relative pt-32 pb-24">
          <div className="container mx-auto px-4">

            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto mb-20"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-purple-400 text-xs font-bold uppercase tracking-widest mb-6">
                <MessageSquare className="h-3 w-3" />
                <span>Client Success</span>
              </div>

              <h1 className="font-display text-5xl md:text-7xl font-bold mb-8">
                Trusted by <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-slate-400">
                  Global Leaders.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                Don't just take our word for it. Here's what founders, CTOs, and marketing leaders say about working with us.
              </p>
            </motion.div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name + i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="group relative p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] hover:border-purple-500/30 transition-all duration-300"
                >
                  {/* Decorative Quote */}
                  <Quote className="absolute top-6 right-8 h-12 w-12 text-white/5 group-hover:text-purple-500/20 transition-colors duration-300 rotate-180" />

                  {/* Rating */}
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: t.rating || 5 }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400 drop-shadow-sm" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-slate-300 leading-relaxed mb-8 min-h-[80px]">
                    "{t.content}"
                  </p>

                  <div className="mt-auto flex items-center gap-4 pt-6 border-t border-white/5">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-purple-500/50 transition-all">
                        {t.image ? (
                          <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-purple-900/50 flex items-center justify-center text-purple-200 font-bold">
                            {t.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      {/* Optional Flag Badge */}
                      {t.flag && (
                        <span className="absolute -bottom-1 -right-1 text-sm filter drop-shadow-md grayscale group-hover:grayscale-0 transition-all delay-100">
                          {t.flag}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors">
                        {t.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {t.role}
                        {t.company ? <span className="text-slate-600"> @ {t.company}</span> : null}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-32 text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 mb-8 animate-pulse">
                <Globe className="h-10 w-10 text-white/80" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Join our global network</h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Ready to become our next success story? Let's discuss how we can help your business grow.
              </p>
              <Link to="/contact">
                <Button size="lg" className="h-12 px-8 bg-white text-black hover:bg-slate-200 rounded-full font-bold text-base transition-transform hover:scale-105">
                  Start Your Project <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Testimonials;
