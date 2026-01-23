import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Quote, Loader2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card3DTilt } from "@/components/ui/Card3DTilt";

interface Testimonial {
  id?: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  image_url?: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    name: "Arjun Mehta",
    role: "Founder & CEO, GrowthNest (India)",
    content: "MS DIGI MARK completely transformed our online presence. Our website traffic grew by over 250% within just a few months.",
    rating: 5,
  },
  {
    name: "Priya Nair",
    role: "Marketing Head, BrandSphere (India)",
    content: "The team's digital strategy and execution were spot on. From SEO to social media, everything delivered real results.",
    rating: 5,
  },
  {
    name: "Rahul Verma",
    role: "Product Lead, VisionCraft Studio (India)",
    content: "Their 3D modeling and design work added a whole new dimension to our product presentations. Truly impressive quality.",
    rating: 5,
  },
  {
    name: "Karthik Ramesh",
    role: "CTO, NextWave Solutions (India)",
    content: "Outstanding web development service. Our website is now faster, cleaner, and optimized for conversions.",
    rating: 5,
  },
  {
    name: "Sarah Thompson",
    role: "CEO, Elevate Digital (USA)",
    content: "MS DIGI MARK understands digital marketing at a global level. Their creative approach helped us scale our campaigns effectively.",
    rating: 5,
  },
  {
    name: "Daniel Brooks",
    role: "Marketing Director, UrbanEdge Media (UK)",
    content: "From video editing to branding, the quality exceeded expectations. Professional, reliable, and results-driven.",
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          setTestimonials(data.map(t => ({
            id: t.id,
            name: t.name,
            role: t.role || "",
            content: t.content,
            rating: t.rating || 5,
            image_url: t.image_url
          })));
        } else {
          setTestimonials(defaultTestimonials);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        setTestimonials(defaultTestimonials);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <section className="py-32 relative overflow-hidden bg-background">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.08),transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-purple-400 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <MessageSquare className="h-3 w-3" />
            <span>Testimonials</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-6xl font-bold mb-6 text-white"
          >
            Client <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Love</span>
          </motion.h2>

          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "100px" }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-purple-500 to-transparent mx-auto rounded-full mb-6"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Don't just take our word for it. Here's what our partners have to say about their journey with us.
          </motion.p>
        </div>

        {/* Testimonials Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name + index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="break-inside-avoid"
              >
                <Card3DTilt maxTilt={8} glareEnabled={true}>
                  <div className="relative p-8 rounded-2xl bg-[#110C1D] border border-white/5 hover:border-purple-500/30 hover:bg-white/[0.02] transition-all duration-300 group">
                    {/* Decorative Quote Mark */}
                    <div className="absolute top-6 right-8 text-6xl text-white/5 font-serif leading-none group-hover:text-purple-500/10 transition-colors">
                      "
                    </div>

                    {/* Rating Stars */}
                    <div className="flex gap-1 mb-6">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-700 text-gray-700"}`}
                        />
                      ))}
                    </div>

                    {/* Content */}
                    <p className="text-slate-300 text-base leading-relaxed mb-8 relative z-10">
                      {testimonial.content}
                    </p>

                    {/* Author Info */}
                    <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0">
                        {testimonial.image_url ? (
                          <img src={testimonial.image_url} alt={testimonial.name} className="w-full h-full object-cover" />
                        ) : (
                          testimonial.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{testimonial.name}</h4>
                        <p className="text-xs text-slate-500">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </Card3DTilt>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
