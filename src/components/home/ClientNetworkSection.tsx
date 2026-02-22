import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, MapPin, Network as NetworkIcon } from "lucide-react";
import { reelsSupabase } from "@/integrations/supabase/reels-client";

interface ClientLocation {
    id: string;
    name: string;
    x_position: number;
    y_position: number;
    connection_id?: string;
}

export const ClientNetworkSection = () => {
    const [locations, setLocations] = useState<ClientLocation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLocations = async () => {
            const { data, error } = await reelsSupabase
                .from("client_network_locations")
                .select("*")
                .eq("is_active", true)
                .order("created_at", { ascending: true });

            if (!error && data) {
                setLocations(data);
            }
            setLoading(false);
        };

        fetchLocations();

        const channel = reelsSupabase
            .channel('client_network_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'client_network_locations' }, () => {
                fetchLocations();
            })
            .subscribe();

        return () => {
            reelsSupabase.removeChannel(channel);
        };
    }, []);

    if (loading || locations.length === 0) return null;

    const getX = (p: ClientLocation) => p.x_position * 21;
    const getY = (p: ClientLocation) => p.y_position * 9;

    // Create a smooth continuous path through all points
    const sortedLocations = [...locations].sort((a, b) => a.x_position - b.x_position);
    const generatePath = () => {
        if (sortedLocations.length < 2) return "";
        let pathD = "";
        for (let i = 0; i < sortedLocations.length - 1; i++) {
            const p0 = i === 0 ? sortedLocations[0] : sortedLocations[i - 1];
            const p1 = sortedLocations[i];
            const p2 = sortedLocations[i + 1];
            const p3 = i + 2 < sortedLocations.length ? sortedLocations[i + 2] : p2;
            const tension = 0.25; // Smooth cubic curve tension
            const cp1x = getX(p1) + (getX(p2) - getX(p0)) * tension;
            const cp1y = getY(p1) + (getY(p2) - getY(p0)) * tension;
            const cp2x = getX(p2) - (getX(p3) - getX(p1)) * tension;
            const cp2y = getY(p2) - (getY(p3) - getY(p1)) * tension;

            if (i === 0) pathD += `M ${getX(p1)} ${getY(p1)}`;
            pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${getX(p2)} ${getY(p2)}`;
        }
        return pathD;
    };

    return (
        <section className="py-24 bg-black relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[#05010a]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-6 animate-pulse-glow"
                    >
                        <Globe className="h-3 w-3" />
                        <span>Global Expansion</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tighter"
                    >
                        Our Worldwide Clientele <span className="text-primary">Network</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 max-w-2xl mx-auto text-lg"
                    >
                        A diverse network of brands worldwide who trust us to scale their digital presence with precision and performance.
                    </motion.p>
                </div>

                <div className="relative aspect-[21/9] w-full max-w-6xl mx-auto mt-12 overflow-visible">
                    {/* Stylized World Map Background and Rotating Orbit */}
                    <div className="absolute inset-0 flex items-center justify-center -z-10">
                        {/* Large Rotating Global Circle */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                            className="w-[120%] aspect-square border-2 border-dashed border-primary/5 rounded-full blur-[1px] absolute opacity-50"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                            className="w-[140%] aspect-square border border-primary/10 rounded-full absolute opacity-20"
                        />
                    </div>

                    <svg
                        viewBox="0 0 1000 480"
                        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                    >
                        {/* Map paths remain the same ... */}
                        <path
                            className="text-primary/40"
                            d="M164.5,134.1c-1.3-1-3.6-2.5-6.5-1.1c-1.4,0.7-2.3,2.2-2,3.7c0.4,1.8,2,2.8,3.7,2.8c1.3,0,2.5-0.6,3.3-1.6 C165.7,136.6,165.8,135.1,164.5,134.1z M221.7,117.1c-2,0-3.9,0.5-5.6,1.4c-2.3,1.3-3.6,3.7-3.3,6.3c0.4,4,3.7,7.1,7.7,7.1 c2,0,3.9-0.5,5.6-1.4c2.3-1.3,3.6-3.7,3.3-6.3C229,120.2,225.7,117.1,221.7,117.1z M117.5,152.1c-1.2-4.1-5-7.1-9.3-7.1 c-2.4,0-4.6,0.9-6.3,2.5c-3.1,2.8-3.9,7.4-1.9,11.2c1.9,3.5,5.6,5.5,9.5,5c3.2-0.4,5.9-2.5,7.3-5.4 C117.7,156.4,117.8,154.2,117.5,152.1z M864.5,127.1c-1.2-4.1-5-7.1-9.3-7.1c-2.4,0-4.6,0.9-6.3,2.5c-3.1,2.8-3.9,7.4-1.9,11.2 c1.9,3.5,5.6,5.5,9.5,5c3.2-0.4,5.9-2.5,7.3-5.4C864.7,131.4,864.8,129.2,864.5,127.1z"
                            fill="currentColor"
                        />
                        <g className="text-white/5">
                            <path d="M150,120 L180,110 L220,115 L250,140 L240,180 L200,220 L160,200 L140,160 Z" fill="currentColor" opacity="0.5" />
                            <path d="M300,280 L350,260 L380,300 L360,380 L300,420 L270,380 L280,320 Z" fill="currentColor" opacity="0.5" />
                            <path d="M480,100 L550,80 L600,100 L620,150 L580,200 L500,180 L470,140 Z" fill="currentColor" opacity="0.5" />
                            <path d="M500,220 L580,210 L650,250 L630,350 L550,400 L480,350 L470,280 Z" fill="currentColor" opacity="0.5" />
                            <path d="M650,100 L850,80 L920,150 L880,300 L750,350 L680,200 Z" fill="currentColor" opacity="0.5" />
                            <path d="M780,380 L850,370 L880,420 L820,450 L770,430 Z" fill="currentColor" opacity="0.5" />
                        </g>
                        {Array.from({ length: 30 }).map((_, i) => (
                            <line key={`grid-h-${i}`} x1="0" y1={i * 20} x2="1000" y2={i * 20} stroke="white" strokeOpacity="0.03" strokeWidth="0.5" />
                        ))}
                    </svg>

                    {/* SVG Connections Layer */}
                    <svg viewBox="0 0 2100 900" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                        <motion.path
                            d={generatePath()}
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            className="text-primary drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                            initial={{ pathLength: 0, opacity: 0 }}
                            whileInView={{ pathLength: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 2.5, ease: "easeInOut" }}
                        />
                    </svg>

                    {/* Nodes Layer */}
                    <AnimatePresence>
                        {locations.map((loc, index) => (
                            <motion.div
                                key={loc.id}
                                initial={{ opacity: 0, scale: 0 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5 + (index * 0.1), type: "spring", stiffness: 200 }}
                                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                                style={{ top: `${loc.y_position}%`, left: `${loc.x_position}%` }}
                            >
                                {/* The Dot */}
                                <div className="relative">
                                    <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_rgba(168,85,247,0.8)] relative z-20 group-hover:scale-125 transition-transform" />
                                    <div className="absolute -inset-2 bg-primary/40 rounded-full animate-ping z-10" />
                                </div>

                                {/* The Label */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-3 pb-1 opacity-100 group-hover:scale-110 transition-transform whitespace-nowrap">
                                    <div className="px-4 py-1.5 rounded-full bg-[#070510] border border-white/20 text-white text-[11px] font-semibold tracking-wide shadow-xl">
                                        {loc.name}
                                    </div>
                                    <div className="w-2 h-2 bg-[#070510] border-r border-b border-white/20 rotate-45 mx-auto -mt-1" />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Ambient Glows */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
        </section>
    );
};
