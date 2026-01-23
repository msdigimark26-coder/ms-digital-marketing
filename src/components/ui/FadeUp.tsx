
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FadeUpProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export const FadeUp = ({ children, className = "", delay = 0 }: FadeUpProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
                duration: 0.8,
                delay: delay,
                ease: [0.21, 0.47, 0.32, 0.98]
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};
