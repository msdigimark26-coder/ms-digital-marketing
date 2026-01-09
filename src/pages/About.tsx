import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Users, Target, Award, Rocket, Sparkles, CheckCircle2, ArrowRight, Heart } from "lucide-react";
import { TeamSection } from "@/components/home/TeamSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const About = () => {
  const stats = [
    { icon: Users, title: "6+", desc: "Creative Experts", color: "text-purple-400" },
    { icon: CheckCircle2, title: "50+", desc: "Projects Delivered", color: "text-blue-400" },
    { icon: Award, title: "10+", desc: "Industry Awards", color: "text-pink-400" },
    { icon: Rocket, title: "2+", desc: "Years Experience", color: "text-amber-400" },
  ];

  const values = [
    { title: "Innovation", desc: "We push boundaries and explore new technologies to keep your brand ahead of the curve." },
    { title: "Excellence", desc: "We are committed to delivering the highest quality work in every pixel and line of code." },
    { title: "Collaboration", desc: "We believe in close partnership with our clients, treating their goals as our own." },
    { title: "Integrity", desc: "We operate with transparency and honesty, building trust that lasts." },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-[#05030e] relative overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
        </div>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto mb-20"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-purple-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles className="h-3 w-3" />
              <span>Who We Are</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold mb-8">
              We Craft Digital <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-white">
                Experiences.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
              MS Digi Mark is a full-service digital agency dedicated to transforming brands through creative design, innovative technology, and data-driven marketing.
            </p>
          </motion.div>

          {/* Image/Video Placeholder or Gradient Decor */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden aspect-[21/9] bg-gradient-to-br from-[#1A103C] to-[#0A051A] border border-white/10 flex items-center justify-center group"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80')] bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity duration-700 md:scale-105 group-hover:scale-100" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05030e] via-transparent to-transparent" />

            <div className="relative z-10 text-center p-8">
              <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-6 border border-white/20">
                <Heart className="h-10 w-10 text-white fill-white/20 animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Driven by Passion</h2>
              <p className="text-slate-300">Creating impact through digital innovation</p>
            </div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y border-white/5 bg-white/[0.02]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className={`mx-auto mb-4 w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${item.color}`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-4xl font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values & Mission */}
        <section className="py-24 container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Our Mission & <span className="text-purple-400">Values</span></h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                We don't just build websites or run ads; we build digital ecosystems that help businesses thrive. Our approach is rooted in a deep understanding of user behavior and market dynamics.
              </p>

              <div className="space-y-6">
                {values.map((val, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex-shrink-0 flex items-center justify-center border border-purple-500/20">
                      <span className="text-purple-400 font-bold text-lg">{i + 1}</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">{val.title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{val.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 translate-y-12">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm h-64 flex flex-col justify-end">
                    <Target className="h-8 w-8 text-blue-400 mb-4" />
                    <h3 className="text-xl font-bold text-white">Strategic Vision</h3>
                  </div>
                  <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-6 rounded-3xl h-48 flex flex-col justify-center text-center">
                    <h3 className="text-3xl font-bold text-white">100%</h3>
                    <p className="text-white/80">Commitment</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-6 rounded-3xl h-48 flex flex-col justify-center text-center">
                    <Award className="h-10 w-10 text-white mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-white">Award Winning</h3>
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm h-64 flex flex-col justify-end">
                    <Users className="h-8 w-8 text-green-400 mb-4" />
                    <h3 className="text-xl font-bold text-white">People First</h3>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Team Section Integration */}
        <section className="py-24 bg-gradient-to-b from-[#110C1D] to-black border-t border-white/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-purple-400 font-bold tracking-widest text-sm uppercase mb-4 block">Meet The Squad</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white">The Minds Behind <br /> the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Magic</span></h2>
            </motion.div>

            <TeamSection showHeader={false} />
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-32 text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Want to join our journey?</h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              We are always looking for talented individuals to join our team, or partners to collaborate with.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/contact">
                <Button size="lg" className="h-12 px-8 bg-white text-black hover:bg-slate-200 rounded-full font-bold">
                  Start a Project
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-12 px-8 border-white/20 text-white hover:bg-white/10 rounded-full bg-transparent">
                View Openings
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;
