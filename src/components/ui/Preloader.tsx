import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Preloader = ({ logo = "/preload-logo.png" }: { logo?: string }) => {
    const [loading, setLoading] = useState(true);
    const [show, setShow] = useState(true);

    useEffect(() => {
        const playGlitchSfx = () => {
            try {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                if (!AudioContext) return;
                const ctx = new AudioContext();
                const now = ctx.currentTime;

                // Master Gain
                const masterGain = ctx.createGain();
                masterGain.gain.setValueAtTime(0, now);
                masterGain.gain.linearRampToValueAtTime(0.2, now + 0.01);
                masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
                masterGain.connect(ctx.destination);

                // LAYER 1: The "Digital Snap" (Start)
                const snap = ctx.createOscillator();
                const snapGain = ctx.createGain();
                snap.type = 'square';
                snap.frequency.setValueAtTime(2400, now);
                snap.frequency.exponentialRampToValueAtTime(40, now + 0.1);
                snapGain.gain.setValueAtTime(0.3, now);
                snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                snap.connect(snapGain);
                snapGain.connect(masterGain);
                snap.start(now);
                snap.stop(now + 0.1);

                // LAYER 2: The "Cyber Swell" (Middle)
                const swell = ctx.createOscillator();
                const swellGain = ctx.createGain();
                swell.type = 'sawtooth';
                swell.frequency.setValueAtTime(100, now + 0.1);
                swell.frequency.exponentialRampToValueAtTime(800, now + 0.5);
                swellGain.gain.setValueAtTime(0, now + 0.1);
                swellGain.gain.linearRampToValueAtTime(0.15, now + 0.3);
                swellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
                swell.connect(swellGain);
                swellGain.connect(masterGain);
                swell.start(now + 0.1);
                swell.stop(now + 0.6);

                // LAYER 3: The "Matrix Pulse" (Rhythmic Core)
                [0, 0.1, 0.2, 0.3, 0.4].forEach(offset => {
                    const p = ctx.createOscillator();
                    const pg = ctx.createGain();
                    p.type = 'square';
                    p.frequency.setValueAtTime(1200 - (offset * 1000), now + offset);
                    pg.gain.setValueAtTime(0.05, now + offset);
                    pg.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.05);
                    p.connect(pg);
                    pg.connect(masterGain);
                    p.start(now + offset);
                    p.stop(now + offset + 0.05);
                });

                // LAYER 4: The "Sub Impact" (End)
                const sub = ctx.createOscillator();
                const subGain = ctx.createGain();
                sub.type = 'sine';
                sub.frequency.setValueAtTime(60, now + 0.5);
                sub.frequency.exponentialRampToValueAtTime(30, now + 1.2);
                subGain.gain.setValueAtTime(0, now + 0.5);
                subGain.gain.linearRampToValueAtTime(0.4, now + 0.6);
                subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
                sub.connect(subGain);
                subGain.connect(masterGain);
                sub.start(now + 0.5);
                sub.stop(now + 1.2);

            } catch (e) {
                console.warn("Audio Context blocked or failed:", e);
            }
        };

        // Play SFX
        playGlitchSfx();

        const timer = setTimeout(() => {
            setLoading(false);
            setTimeout(() => setShow(false), 800);
        }, 1300);
        return () => clearTimeout(timer);
    }, []);

    if (!show) return null;

    return (
        <AnimatePresence>
            {loading && (
                <div className="fixed inset-0 z-[10000] overflow-hidden flex flex-col items-center justify-center bg-[#05010a] font-display">

                    {/* Background: Digital Rain / Matrix Data Streams */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ top: "-20%" }}
                                animate={{ top: "120%" }}
                                transition={{
                                    duration: 1.5 + Math.random() * 2,
                                    repeat: Infinity,
                                    ease: "linear",
                                    delay: Math.random() * 2
                                }}
                                className="absolute w-[1px] h-[20vh] bg-gradient-to-b from-transparent via-primary to-transparent"
                                style={{ left: `${(i / 20) * 100}%` }}
                            />
                        ))}
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        {/* The Glitch Core Logo Reveal */}
                        <div className="relative flex items-center justify-center">

                            {/* Main Solid Logo */}
                            <motion.img
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                src={logo}
                                alt="MS DIGIMARK"
                                className="w-48 md:w-64 lg:w-72 h-auto object-contain relative z-10 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                            />

                            {/* Glitch Slices Over Logo */}
                            {[...Array(3)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        top: [
                                            `${Math.random() * 100}%`,
                                            `${Math.random() * 100}%`,
                                            `${Math.random() * 100}%`
                                        ],
                                        opacity: [0, 0.8, 0]
                                    }}
                                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.2 }}
                                    className="absolute inset-x-0 h-1 bg-primary/30 z-20 mix-blend-overlay"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Elite Horizontal Split / Curtain Exit Reveal */}
                    {!loading && (
                        <div className="absolute inset-0 z-[10001] pointer-events-none flex flex-col">
                            <motion.div
                                initial={{ y: "0%" }}
                                animate={{ y: "-100%" }}
                                transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                                className="flex-1 bg-[#000] border-b border-primary/20"
                            />
                            <motion.div
                                initial={{ y: "0%" }}
                                animate={{ y: "100%" }}
                                transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                                className="flex-1 bg-[#000] border-t border-primary/20"
                            />
                        </div>
                    )}
                </div>
            )}
        </AnimatePresence>
    );
};
