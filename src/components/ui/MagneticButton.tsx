import { useRef, useState, ReactNode } from "react";
import { motion, useSpring } from "framer-motion";

interface MagneticButtonProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    strength?: number; // How strong the magnetic effect is (default: 0.3)
}

/**
 * MagneticButton - A button that follows the cursor with a magnetic effect
 * Creates an engaging micro-interaction that improves user experience
 */
export const MagneticButton = ({
    children,
    className = "",
    onClick,
    strength = 0.3
}: MagneticButtonProps) => {
    const ref = useRef<HTMLButtonElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Spring animation for smooth, physics-based movement
    const x = useSpring(0, { stiffness: 150, damping: 15 });
    const y = useSpring(0, { stiffness: 150, damping: 15 });

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate distance from cursor to button center
        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;

        // Apply magnetic effect with strength multiplier
        x.set(distanceX * strength);
        y.set(distanceY * strength);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    return (
        <motion.button
            ref={ref}
            className={className}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{ x, y }}
            whileTap={{ scale: 0.95 }}
        >
            <motion.div
                animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
            >
                {children}
            </motion.div>
        </motion.button>
    );
};
