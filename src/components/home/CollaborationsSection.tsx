import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Handshake, ExternalLink } from "lucide-react";
import { reelsSupabase } from "@/integrations/supabase/reels-client";

interface ClientCollaboration {
    id: string;
    client_name: string;
    logo_url: string;
    website_url: string | null;
    display_order: number;
}

export const CollaborationsSection = () => {
    const [clients, setClients] = useState<ClientCollaboration[]>([]);
    const [floatingMode, setFloatingMode] = useState<string>("auto");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClients = async () => {
            const { data, error } = await reelsSupabase
                .from("client_collaborations")
                .select("*")
                .eq("is_active", true)
                .order("display_order", { ascending: true });

            if (!error && data) {
                setClients(data);
            }

            // Fetch settings
            const { data: settingsData } = await reelsSupabase
                .from("collaborations_settings")
                .select("floating_mode")
                .eq("id", 1)
                .single();

            if (settingsData) {
                setFloatingMode(settingsData.floating_mode);
            }

            setLoading(false);
        };
        fetchClients();
    }, []);

    if (loading || clients.length === 0) return null;

    // Ensure there are enough items to fill the full width of the screen twice over.
    // By calculating an even number of repeats, translating to -50% will always be a seamless loop.
    let evenRepeats = 1;
    if (floatingMode === 'always' || (floatingMode === 'auto' && clients.length >= 5)) {
        const minItems = 16;
        const requiredRepeats = Math.max(2, Math.ceil(minItems / clients.length));
        evenRepeats = requiredRepeats % 2 === 0 ? requiredRepeats : requiredRepeats + 1;
    }

    const isFloating = evenRepeats > 1;
    const displayClients = isFloating ? Array(evenRepeats).fill(clients).flat() : clients;

    return (
        <section className="relative py-20 md:py-28 overflow-hidden bg-[#070510]">
            {/* Background effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
                        <Handshake className="h-3.5 w-3.5" />
                        Trusted Partners
                    </div>
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight mb-4">
                        Our Successful{" "}
                        <span className="bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">
                            Collaborations
                        </span>
                    </h2>
                    <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                        We are proud to work with amazing brands and businesses across multiple industries.
                        Our collaborations reflect the trust our clients place in our creativity, strategy, and digital expertise.
                    </p>
                </motion.div>
            </div>

            {/* Floating Marquee Row 1 - Left to Right (Full Width) */}
            <div className="relative mb-6 overflow-hidden w-full max-w-[100vw] px-0 py-16">
                {/* Gradient fades on sides */}
                <div className="absolute left-0 top-0 bottom-0 w-24 md:w-56 bg-gradient-to-r from-[#070510] to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-24 md:w-56 bg-gradient-to-l from-[#070510] to-transparent z-10 pointer-events-none" />

                <div className={`flex gap-5 md:gap-8 w-max px-8 ${isFloating ? 'animate-marquee-left' : 'mx-auto justify-center flex-wrap'}`}>
                    {displayClients.map((client, index) => (
                        <LogoCard key={`r1-${client.id}-${index}`} client={client} />
                    ))}
                </div>
            </div>

            {/* Inline keyframes for marquee */}
            <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-left {
          animation: marquee-left 25s linear infinite;
        }
        .animate-marquee-left:hover {
          animation-play-state: paused;
        }
      `}</style>
        </section>
    );
};

/* ——— Single Logo Card ——— */
const LogoCard = ({ client }: { client: ClientCollaboration }) => {
    const handleClick = () => {
        if (client.website_url) {
            window.open(client.website_url, "_blank", "noopener,noreferrer");
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`
        group relative flex-shrink-0 w-36 h-36 md:w-44 md:h-44
        rounded-full border border-white/[0.06]
        bg-gradient-to-br from-white/[0.04] to-white/[0.01]
        backdrop-blur-sm
        flex items-center justify-center
        transition-all duration-500 ease-out
        hover:border-primary/30 hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)]
        hover:scale-105
        ${client.website_url ? "cursor-pointer" : "cursor-default"}
      `}
        >
            {/* Inner glow on hover */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/0 to-blue-500/0 group-hover:from-primary/5 group-hover:to-blue-500/5 transition-all duration-500" />

            {/* Logo */}
            <img
                src={client.logo_url}
                alt={client.client_name}
                loading="lazy"
                className="w-20 h-20 md:w-24 md:h-24 object-contain relative z-10 transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
            />

            {/* Tooltip */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:-bottom-8 transition-all duration-300 z-20 pointer-events-none">
                <div className="bg-black/90 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg shadow-2xl whitespace-nowrap flex items-center gap-1.5">
                    <span className="text-white text-xs font-semibold">{client.client_name}</span>
                    {client.website_url && <ExternalLink className="h-3 w-3 text-primary" />}
                </div>
            </div>

            {/* Subtle floating particle effect */}
            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary/40 transition-colors animate-pulse" />
        </div>
    );
};
