import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Calendar, Clock, User, Mail, Phone, MessageSquare, Send, CheckCircle, Sparkles, ArrowRight, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { servicesSupabase, isServicesSupabaseConfigured } from "@/integrations/supabase/servicesClient";

// Hardcoded services list
const SERVICES = [
    "Web Design & Development",
    "SEO & Content Marketing",
    "Social Media Marketing",
    "PPC & Paid Advertising",
    "Video & Photo Editing",
    "UI/UX Design",
    "3D Modeling",
    "Meta Ads",
    "Google Ads"
];

const BookAppointment = () => {
    const [loading, setLoading] = useState(false);
    const [selectedService, setSelectedService] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const form = e.currentTarget;
        const formData = new FormData(form);

        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const phone = formData.get("phone") as string;
        const service = formData.get("service") as string;
        const bookingDate = formData.get("date") as string;
        const bookingTime = formData.get("time") as string;
        const budget = formData.get("budget") as string;
        const notes = formData.get("notes") as string;

        // Combine date and time
        const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);

        try {
            // Insert booking into Supabase
            const client = isServicesSupabaseConfigured ? servicesSupabase : supabase;
            const { error } = await client
                .from("bookings")
                .insert([
                    {
                        name,
                        email,
                        phone,
                        service_name: service,
                        booking_date: bookingDateTime.toISOString(),
                        status: "pending",
                        budget,
                        notes,
                    },
                ])
                .select();

            if (error) throw error;

            // Success!
            form.reset();
            setSelectedService("");
            toast.success("🎉 Booking submitted successfully! We'll contact you soon.");
        } catch (error: any) {
            console.error("Booking error:", error);
            toast.error(error.message || "Failed to submit booking. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Get minimum date (today)
    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // Get minimum time if today is selected
    const getMinTime = (selectedDate: string) => {
        const today = new Date();
        const selected = new Date(selectedDate);

        if (selected.toDateString() === today.toDateString()) {
            const hours = today.getHours().toString().padStart(2, '0');
            const minutes = today.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        }
        return "09:00";
    };

    return (
        <Layout>
            <div className="min-h-screen bg-[#05030e] relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-pink-600/10 rounded-full blur-[120px]" />
                </div>

                <section className="relative pt-32 pb-24">
                    <div className="container mx-auto px-4">
                        {/* Hero Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center max-w-3xl mx-auto mb-16"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-purple-400 text-xs font-bold uppercase tracking-widest mb-6">
                                <Calendar className="h-3 w-3" />
                                <span>Book an Appointment</span>
                            </div>

                            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
                                Schedule Your{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                                    Free Consultation
                                </span>
                            </h1>

                            <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                                Let's discuss your project goals and create a strategy that drives results. Book a time that works for you.
                            </p>
                        </motion.div>

                        {/* Booking Form */}
                        <div className="max-w-4xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                            >
                                <form
                                    onSubmit={handleSubmit}
                                    className="bg-[#110C1D] border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden"
                                >
                                    {/* Glow Effect */}
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
                                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/5 rounded-full blur-[100px] pointer-events-none" />

                                    <div className="relative z-10 space-y-8">
                                        {/* Section 1: Personal Information */}
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                                <User className="h-5 w-5 text-purple-400" />
                                                Personal Information
                                            </h3>
                                            <p className="text-sm text-slate-500 mb-6">Tell us about yourself</p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
                                                        Full Name *
                                                    </label>
                                                    <Input
                                                        name="name"
                                                        placeholder="John Doe"
                                                        required
                                                        className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 h-12 rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
                                                        Email Address *
                                                    </label>
                                                    <Input
                                                        name="email"
                                                        type="email"
                                                        placeholder="john@example.com"
                                                        required
                                                        className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 h-12 rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
                                                        Phone Number *
                                                    </label>
                                                    <Input
                                                        name="phone"
                                                        type="tel"
                                                        placeholder="+91 12345 67890"
                                                        required
                                                        className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 h-12 rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section 2: Service & Schedule */}
                                        <div className="pt-6 border-t border-white/5">
                                            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                                <Sparkles className="h-5 w-5 text-pink-400" />
                                                Service & Schedule
                                            </h3>
                                            <p className="text-sm text-slate-500 mb-6">Choose a service and preferred time</p>

                                            <div className="space-y-6">
                                                {/* Service Selection */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
                                                        Required Services *
                                                    </label>
                                                    <select
                                                        name="service"
                                                        value={selectedService}
                                                        onChange={(e) => setSelectedService(e.target.value)}
                                                        required
                                                        className="w-full bg-black/20 border border-white/10 text-white h-12 rounded-xl px-4 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all"
                                                    >
                                                        <option value="" className="bg-[#110C1D]">Select a service...</option>
                                                        {SERVICES.map((service) => (
                                                            <option
                                                                key={service}
                                                                value={service}
                                                                className="bg-[#110C1D]"
                                                            >
                                                                {service}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Date & Time */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
                                                            Preferred Date *
                                                        </label>
                                                        <Input
                                                            name="date"
                                                            type="date"
                                                            min={getMinDate()}
                                                            required
                                                            className="bg-black/20 border-white/10 text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 h-12 rounded-xl"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
                                                            Preferred Time *
                                                        </label>
                                                        <Input
                                                            name="time"
                                                            type="time"
                                                            required
                                                            className="bg-black/20 border-white/10 text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 h-12 rounded-xl"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section 3: Budget & Additional Details */}
                                        <div className="pt-6 border-t border-white/5">
                                            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                                <MessageSquare className="h-5 w-5 text-blue-400" />
                                                Budget & Additional Details
                                            </h3>
                                            <p className="text-sm text-slate-500 mb-6">Share your budget and requirements</p>

                                            <div className="space-y-6">
                                                {/* Expected Budget */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
                                                        Expected Budget *
                                                    </label>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                                        <Input
                                                            name="budget"
                                                            type="text"
                                                            placeholder="e.g., $500 - $2000 or ₹50,000"
                                                            required
                                                            className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 h-12 rounded-xl pl-11"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Notes */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
                                                        Notes / Requirements
                                                    </label>
                                                    <Textarea
                                                        name="notes"
                                                        placeholder="Tell us more about your project, specific requirements, or any questions you have..."
                                                        rows={5}
                                                        className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 resize-none rounded-xl p-4"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="pt-6">
                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white font-bold h-14 rounded-xl shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.02] text-base"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="mr-2 h-5 w-5" />
                                                        Book Appointment
                                                        <ArrowRight className="ml-2 h-5 w-5" />
                                                    </>
                                                )}
                                            </Button>
                                            <p className="text-center text-xs text-slate-500 mt-4">
                                                We'll confirm your appointment within 24 hours
                                            </p>
                                        </div>
                                    </div>
                                </form>
                            </motion.div>
                        </div>

                        {/* Info Cards */}
                        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center"
                            >
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/10 text-purple-400 mb-4">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <h4 className="text-white font-bold mb-2">Quick Response</h4>
                                <p className="text-sm text-slate-400">We'll confirm within 24 hours</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center"
                            >
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pink-500/10 text-pink-400 mb-4">
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                                <h4 className="text-white font-bold mb-2">Free Consultation</h4>
                                <p className="text-sm text-slate-400">No commitment required</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center"
                            >
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 mb-4">
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <h4 className="text-white font-bold mb-2">Expert Guidance</h4>
                                <p className="text-sm text-slate-400">Tailored to your needs</p>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default BookAppointment;
