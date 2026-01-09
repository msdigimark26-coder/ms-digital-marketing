import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe, ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("https://formspree.io/f/xzdbqdaz", {
        method: "POST",
        headers: { 'Accept': 'application/json' },
        body: formData,
      });

      if (res.ok) {
        form.reset();
        toast.success("Message sent! We'll get back to you soon.");
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Could not send message. Please try again later.");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#05030e] relative overflow-hidden">
        {/* Background Ambient Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
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
                <span>Get in Touch</span>
              </div>

              <h1 className="font-display text-5xl md:text-7xl font-bold mb-8">
                Let's Build Something <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-slate-400">
                  Extraordinary.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                Have a project in mind or just want to explore what's possible? We're here to help translate your vision into reality.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 max-w-6xl mx-auto">

              {/* Contact Info Side */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="space-y-8"
              >
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                  <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
                  <div className="space-y-6">
                    <a href="mailto:Msdigimark26@gmail.com" className="flex items-start gap-4 group p-4 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                        <Mail className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-semibold text-white mb-1">Email Us</div>
                        <div className="text-slate-400 group-hover:text-purple-300 transition-colors">Msdigimark26@gmail.com</div>
                      </div>
                    </a>

                    <a href="tel:+916382422115" className="flex items-start gap-4 group p-4 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                        <Phone className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-semibold text-white mb-1">Call Us</div>
                        <div className="text-slate-400 group-hover:text-blue-300 transition-colors">+91 6382 422 115</div>
                      </div>
                    </a>

                    <div className="flex items-start gap-4 p-4 rounded-xl">
                      <div className="p-3 rounded-lg bg-pink-500/10 text-pink-400">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-semibold text-white mb-1">Our Location</div>
                        <div className="text-slate-400">Trichy, India</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consultation Card */}
                <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 rounded-3xl p-8 text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:linear-gradient(to_bottom,transparent,black)]" />
                  <div className="relative z-10">
                    <div className="inline-flex p-3 rounded-full bg-white/10 text-white mb-4">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Book a Free Strategy Call</h3>
                    <p className="text-slate-400 mb-6 text-sm">
                      Get expert advice on your digital strategy. No commitment required.
                    </p>
                    <Button
                      onClick={() => window.open('https://topmate.io/ms_digimark/1868704', '_blank')}
                      className="w-full bg-white text-black hover:bg-slate-200 font-bold h-12 rounded-xl"
                    >
                      Schedule Consultation <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Form Side */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <form onSubmit={handleSubmit} className="bg-[#110C1D] border border-white/10 rounded-3xl p-8 lg:p-10 shadow-2xl relative overflow-hidden" noValidate>
                  {/* Glow Effect */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />

                  <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Send us a message</h3>
                  <p className="text-slate-500 mb-8 text-sm relative z-10">Fill out the form below and we'll reply within 24 hours.</p>

                  <div className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Name</label>
                        <Input
                          name="name"
                          placeholder="John Doe"
                          required
                          className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Email</label>
                        <Input
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          required
                          className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 h-12 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Subject</label>
                      <Input
                        name="subject"
                        placeholder="Project Inquiry"
                        required
                        className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 h-12 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Message</label>
                      <Textarea
                        name="message"
                        placeholder="Tell us about your project goals and requirements..."
                        rows={6}
                        required
                        className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 resize-none rounded-xl p-4"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-purple-900/20 transition-all hover:scale-[1.02]"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send Message"}
                      <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Floating Action Button for mobile mostly, but visible everywhere for easy access if they scroll past the card */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="fixed bottom-6 right-6 z-50 md:hidden"
        >
          <Button
            className="rounded-full h-14 w-14 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black shadow-lg shadow-orange-500/20 p-0 flex items-center justify-center"
            onClick={() => window.open('https://topmate.io/ms_digimark/1868704', '_blank')}
          >
            <Calendar className="h-6 w-6" />
          </Button>
        </motion.div>

      </div>
    </Layout>
  );
};

export default Contact;
