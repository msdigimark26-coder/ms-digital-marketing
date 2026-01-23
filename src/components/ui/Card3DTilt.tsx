import { useRef, useState, MouseEvent as ReactMouseEvent } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { ReactNode } from "react";

interface Card3DTiltProps {
    children: ReactNode;
    className?: string;
    maxTilt?: number; // Maximum tilt in degrees (default: 15)
    glareEnabled?: boolean; // Enable shine/glare effect
}

/**
 * Card3DTilt - Creates a 3D tilt effect on cards based on mouse position
 * Adds a premium, interactive feel to card components
 */
export const Card3DTilt = ({
    children,
    className = "",
    maxTilt = 15,
    glareEnabled = true
}: Card3DTiltProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Spring animations for smooth, physics-based tilting
    const rotateX = useSpring(0, { stiffness: 200, damping: 30 });
    const rotateY = useSpring(0, { stiffness: 200, damping: 30 });
    const glareX = useSpring(50, { stiffness: 200, damping: 30 });
    const glareY = useSpring(50, { stiffness: 200, damping: 30 });

    // Transform for glare opacity
    const glareOpacity = useTransform(
        [rotateX, rotateY],
        ([x, y]: number[]) => {
            const total = Math.abs(x as number) + Math.abs(y as number);
            return Math.min(total / (maxTilt * 2), 0.3);
        }
    );

    const glareBackground = useTransform(
        [glareX, glareY],
        ([x, y]: number[]) =>
            `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.15) 0%, transparent 60%)`
    );

    const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate mouse position relative to card center (-1 to 1)
        const mouseX = (e.clientX - centerX) / (rect.width / 2);
        const mouseY = (e.clientY - centerY) / (rect.height / 2);

        // Apply tilt based on mouse position
        rotateY.set(mouseX * maxTilt);
        rotateX.set(-mouseY * maxTilt);

        // Update glare position (percentage)
        glareX.set((mouseX + 1) * 50);
        glareY.set((mouseY + 1) * 50);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        rotateX.set(0);
        rotateY.set(0);
        glareX.set(50);
        glareY.set(50);
    };

    return (
        <motion.div
            ref={ref}
            className={`relative ${className} will-change-transform`}
            style={{
                perspective: 1000,
                transformStyle: "preserve-3d"
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
        >
            <motion.div
                className="transform-gpu"
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d"
                }}
            >
                {children}

                {/* Glare overlay effect - optimized */}
                {glareEnabled && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none rounded-inherit z-50 overflow-hidden"
                        style={{
                            background: glareBackground,
                            opacity: glareOpacity
                        }}
                    />
                )}
            </motion.div>
        </motion.div>
    );
};
