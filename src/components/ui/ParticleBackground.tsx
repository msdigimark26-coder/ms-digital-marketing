import { useEffect, useRef } from "react";

interface ParticleBackgroundProps {
    particleCount?: number;
    className?: string;
    color?: string;
}

/**
 * ParticleBackground - Creates an interactive particle system background
 * Particles move and connect based on proximity, creating a dynamic effect
 */
export const ParticleBackground = ({
    particleCount = 50,
    className = "",
    color = "147, 51, 234" // RGB for purple
}: ParticleBackgroundProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const particlesRef = useRef<Particle[]>([]);

    class Particle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        radius: number;

        constructor(width: number, height: number) {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2 + 1;
        }

        update(width: number, height: number) {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Keep within bounds
            this.x = Math.max(0, Math.min(width, this.x));
            this.y = Math.max(0, Math.min(height, this.y));
        }

        draw(ctx: CanvasRenderingContext2D, color: string) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color}, 0.5)`;
            ctx.fill();
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size
        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        // Initialize particles
        particlesRef.current = Array.from(
            { length: particleCount },
            () => new Particle(canvas.width, canvas.height)
        );

        // Mouse move handler
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };
        canvas.addEventListener("mousemove", handleMouseMove);

        // Animation loop
        let animationFrameId: number;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and draw particles
            particlesRef.current.forEach((particle) => {
                particle.update(canvas.width, canvas.height);
                particle.draw(ctx, color);
            });

            // Draw connections
            particlesRef.current.forEach((particle, i) => {
                particlesRef.current.slice(i + 1).forEach((otherParticle) => {
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(${color}, ${0.2 * (1 - distance / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.stroke();
                    }
                });

                // Connect to mouse
                const dx = particle.x - mouseRef.current.x;
                const dy = particle.y - mouseRef.current.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(${color}, ${0.3 * (1 - distance / 150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
                    ctx.stroke();
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener("resize", resize);
            canvas.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [particleCount, color]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 pointer-events-none ${className}`}
            style={{ opacity: 0.4 }}
        />
    );
};
