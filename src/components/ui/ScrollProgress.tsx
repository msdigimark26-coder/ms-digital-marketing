import { motion, useScroll, useSpring } from "framer-motion";

/**
 * ScrollProgress - A visual indicator showing page scroll progress
 * Displays a gradient bar at the top of the page that fills as user scrolls
 */
export const ScrollProgress = () => {
    const { scrollYProgress } = useScroll();

    // Add spring physics for smooth animation
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-1 z-[10000] origin-left"
            style={{
                scaleX,
                background: "linear-gradient(90deg, #a855f7 0%, #ec4899 50%, #3b82f6 100%)",
                transformOrigin: "0%"
            }}
        />
    );
};
