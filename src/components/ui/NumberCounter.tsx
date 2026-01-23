import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface NumberCounterProps {
    value: number;
    duration?: number; // Duration in seconds
    suffix?: string;
    prefix?: string;
    decimals?: number;
    className?: string;
    startOnView?: boolean; // Start counting when scrolled into view
}

/**
 * NumberCounter - Animated counter that counts up to a target number
 * Perfect for statistics, metrics, and achievement displays
 */
export const NumberCounter = ({
    value,
    duration = 2,
    suffix = "",
    prefix = "",
    decimals = 0,
    className = "",
    startOnView = true
}: NumberCounterProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const [count, setCount] = useState(0);
    const [hasStarted, setHasStarted] = useState(!startOnView);

    useEffect(() => {
        if (startOnView && isInView && !hasStarted) {
            setHasStarted(true);
        }
    }, [isInView, startOnView, hasStarted]);

    useEffect(() => {
        if (!hasStarted) return;

        let startTime: number | null = null;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

            // Easing function for smooth count-up
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentCount = easeOutQuart * value;

            setCount(currentCount);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCount(value);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [value, duration, hasStarted]);

    const formattedValue = count.toFixed(decimals);

    return (
        <motion.span
            ref={ref}
            className={className}
            initial={{ opacity: 0 }}
            animate={{ opacity: hasStarted ? 1 : 0 }}
        >
            {prefix}{formattedValue}{suffix}
        </motion.span>
    );
};
