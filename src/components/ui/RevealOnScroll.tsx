import { useEffect, useRef, ReactNode } from "react";
import { motion, useInView, useAnimation, Variants } from "framer-motion";

interface RevealOnScrollProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: "up" | "down" | "left" | "right";
    duration?: number;
}

/**
 * RevealOnScroll - Reveals content with animation when scrolled into view
 * Uses Intersection Observer for performance-optimized scroll animations
 */
export const RevealOnScroll = ({
    children,
    className = "",
    delay = 0,
    direction = "up",
    duration = 0.6
}: RevealOnScrollProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const controls = useAnimation();

    useEffect(() => {
        if (isInView) {
            controls.start("visible");
        }
    }, [isInView, controls]);

    // Define animation variants based on direction
    const getVariants = (): Variants => {
        const distance = 60;

        const directions = {
            up: { y: distance, x: 0 },
            down: { y: -distance, x: 0 },
            left: { x: distance, y: 0 },
            right: { x: -distance, y: 0 }
        };

        return {
            hidden: {
                opacity: 0,
                ...directions[direction]
            },
            visible: {
                opacity: 1,
                x: 0,
                y: 0,
                transition: {
                    duration,
                    delay,
                    ease: "easeOut"
                }
            }
        };
    };

    return (
        <motion.div
            ref={ref}
            className={`${className} will-change-transform transform-gpu`}
            initial="hidden"
            animate={controls}
            variants={getVariants()}
        >
            {children}
        </motion.div>
    );
};

/**
 * StaggerChildren - Wrapper for staggered reveal animations
 */
interface StaggerChildrenProps {
    children: ReactNode;
    className?: string;
    staggerDelay?: number;
}

export const StaggerChildren = ({
    children,
    className = "",
    staggerDelay = 0.1
}: StaggerChildrenProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: staggerDelay,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <motion.div
            ref={ref}
            className={className}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={containerVariants}
        >
            {Array.isArray(children)
                ? children.map((child, i) => (
                    <motion.div key={i} variants={itemVariants}>
                        {child}
                    </motion.div>
                ))
                : children
            }
        </motion.div>
    );
};
