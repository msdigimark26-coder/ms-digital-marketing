import { motion } from "framer-motion";

export const MarqueeSection = () => {
  const clients = [
    { id: "google", name: "Google" },
    { id: "amazon", name: "Amazon" },
    { id: "microsoft", name: "Microsoft" },
    { id: "apple", name: "Apple" },
    { id: "meta", name: "Meta" },
    { id: "netflix", name: "Netflix" },
    { id: "spotify", name: "Spotify" },
    { id: "tesla", name: "Tesla" },
  ];

  const ClientLogo = ({ client }: { client: typeof clients[0] }) => (
    <div className="flex items-center justify-center h-24 px-8 py-4 bg-muted/50 rounded-lg backdrop-blur-sm border border-border/20 hover:border-primary/50 transition-all duration-300 flex-shrink-0 min-w-max">
      <span className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">
        {client.name}
      </span>
    </div>
  );

  return (
    <div className="w-full overflow-hidden bg-gradient-to-b from-background via-muted/30 to-background">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-16 md:py-24"
      >
        <div className="container mx-auto px-4">
          {/* Marquee Container */}
          <div className="relative overflow-hidden rounded-2xl">
            {/* Horizontal Marquee */}
            <div className="flex gap-4 animate-scroll-x">
              {[...clients, ...clients].map((client, idx) => (
                <ClientLogo key={`${client.id}-${idx}`} client={client} />
              ))}
            </div>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-background via-transparent to-background" />
          </div>
        </div>
      </motion.section>

      <style>{`
        @keyframes scroll-x {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 2));
          }
        }

        .animate-scroll-x {
          animation: scroll-x 30s linear infinite;
          will-change: transform;
          backface-visibility: hidden;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-scroll-x {
            animation: none;
            overflow-x: auto;
          }
        }

        @media (max-width: 768px) {
          .animate-scroll-x {
            animation-duration: 20s;
          }
        }
      `}</style>
    </div>
  );
};
