import { motion } from "framer-motion";
import { LightCard } from "@/components/ui/LightCard";

interface GalleryItem {
  title: string;
  description: string;
  image: string;
}

interface GallerySectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  items: GalleryItem[];
  columns?: 1 | 2 | 3 | 4;
}

export const GallerySection = ({
  title,
  subtitle = "GALLERY",
  description,
  items,
  columns = 3,
}: GallerySectionProps) => {
  const gridClass = {
    1: "grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-primary font-medium mb-4"
            >
              {subtitle}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold"
            >
              <span className="text-gradient">{title}</span>
            </motion.h2>
          </div>
          {description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg max-w-sm"
            >
              {description}
            </motion.p>
          )}
        </div>

        {/* Gallery Grid */}
        <div className={`grid grid-cols-1 ${gridClass} gap-8`}>
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >
              <LightCard
                imageSrc={item.image}
                altText={item.title}
                title={item.title}
                description={item.description}
                className="h-full"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
