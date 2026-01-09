/**
 * LightCard Component - Usage Examples
 * 
 * This file demonstrates various ways to use the LightCard component
 * throughout your MS DIGI MARK website.
 */

// ============================================================================
// EXAMPLE 1: Basic Single Card
// ============================================================================
import { LightCard } from "@/components/ui/LightCard";

export function BasicCardExample() {
  return (
    <LightCard
      imageSrc="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe"
      altText="Project showcase"
      title="Amazing Project"
      description="Web Design & Development"
    />
  );
}

// ============================================================================
// EXAMPLE 2: Portfolio Grid
// ============================================================================
export function PortfolioGridExample() {
  const projects = [
    {
      id: 1,
      title: "TechVision Rebrand",
      category: "Branding & UI/UX",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
    },
    {
      id: 2,
      title: "EcoLife Campaign",
      category: "Social Media Marketing",
      image: "https://images.unsplash.com/photo-1557804506-669a67965ba0",
    },
    {
      id: 3,
      title: "NexGen 3D Product",
      category: "3D Modeling",
      image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2",
    },
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-12">Featured Portfolio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <LightCard
              key={project.id}
              imageSrc={project.image}
              altText={project.title}
              title={project.title}
              description={project.category}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// EXAMPLE 3: Hero Section with Large Card
// ============================================================================
export function HeroCardExample() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <LightCard
            imageSrc="https://images.unsplash.com/photo-1557804506-669a67965ba0"
            altText="Hero showcase"
            title="Our Latest Campaign"
            description="Revolutionary marketing approach"
            className="aspect-video"
          />
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// EXAMPLE 4: Using GallerySection Component
// ============================================================================
import { GallerySection } from "@/components/home/GallerySection";

export function GallerySectionExample() {
  const galleryItems = [
    {
      title: "Project 1",
      description: "Category A",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
    },
    {
      title: "Project 2",
      description: "Category B",
      image: "https://images.unsplash.com/photo-1557804506-669a67965ba0",
    },
    {
      title: "Project 3",
      description: "Category C",
      image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2",
    },
    {
      title: "Project 4",
      description: "Category D",
      image: "https://images.unsplash.com/photo-1547658719-da2b51169166",
    },
  ];

  return (
    <GallerySection
      title="Featured Work"
      subtitle="PORTFOLIO"
      description="Showcase of our creative excellence and innovative solutions"
      items={galleryItems}
      columns={3}
    />
  );
}

// ============================================================================
// EXAMPLE 5: Responsive Grid with Different Column Counts
// ============================================================================
export function ResponsiveGridExample() {
  const items = [
    {
      title: "Item 1",
      description: "Desc 1",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
    },
    {
      title: "Item 2",
      description: "Desc 2",
      image: "https://images.unsplash.com/photo-1557804506-669a67965ba0",
    },
    {
      title: "Item 3",
      description: "Desc 3",
      image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2",
    },
    {
      title: "Item 4",
      description: "Desc 4",
      image: "https://images.unsplash.com/photo-1547658719-da2b51169166",
    },
  ];

  return (
    <div>
      {/* 2-column gallery */}
      <GallerySection
        title="Two Column Layout"
        items={items}
        columns={2}
      />

      {/* 4-column gallery */}
      <GallerySection
        title="Four Column Layout"
        items={items}
        columns={4}
      />
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Custom Styled Grid
// ============================================================================
export function CustomStyledGridExample() {
  const images = [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
    "https://images.unsplash.com/photo-1557804506-669a67965ba0",
    "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2",
    "https://images.unsplash.com/photo-1547658719-da2b51169166",
    "https://images.unsplash.com/photo-1561070791-2526d30994b5",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <LightCard
              key={index}
              imageSrc={image}
              altText={`Gallery item ${index + 1}`}
              className="rounded-lg overflow-hidden"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// EXAMPLE 7: Integration with Framer Motion
// ============================================================================
import { motion } from "framer-motion";

export function AnimatedGalleryExample() {
  const items = [
    { title: "A", description: "Type 1", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe" },
    { title: "B", description: "Type 2", image: "https://images.unsplash.com/photo-1557804506-669a67965ba0" },
    { title: "C", description: "Type 3", image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2" },
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                title={item.title}
                description={item.description}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// EXAMPLE 8: Square Cards (for Galleries)
// ============================================================================
export function SquareCardsExample() {
  const items = [
    { title: "Work 1", desc: "Photography", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe" },
    { title: "Work 2", desc: "Design", image: "https://images.unsplash.com/photo-1557804506-669a67965ba0" },
    { title: "Work 3", desc: "3D", image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2" },
    { title: "Work 4", desc: "Video", image: "https://images.unsplash.com/photo-1547658719-da2b51169166" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <LightCard
          key={item.title}
          imageSrc={item.image}
          altText={item.title}
          title={item.title}
          description={item.desc}
          className="aspect-square"
        />
      ))}
    </div>
  );
}

// ============================================================================
// EXAMPLE 9: Full Integration in Layout
// ============================================================================
import { Layout } from "@/components/layout/Layout";

export function FullPageExample() {
  return (
    <Layout>
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold mb-6">Our Amazing Work</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore our portfolio of creative projects with interactive light effects
            </p>
          </motion.div>

          <GallerySection
            title="Featured Projects"
            subtitle="PORTFOLIO"
            items={[
              // Your items here
            ]}
            columns={3}
          />
        </div>
      </section>
    </Layout>
  );
}

// ============================================================================
// STYLING TIPS
// ============================================================================
/*
  Use these Tailwind classes with LightCard for different effects:

  1. Aspect Ratios:
     - className="aspect-video"    (16:9)
     - className="aspect-square"   (1:1)
     - className="aspect-[5/7]"    (Custom)

  2. Rounded Corners:
     - className="rounded-lg"
     - className="rounded-2xl"
     - className="rounded-full"

  3. Sizing:
     - className="w-full"
     - className="h-full"
     - className="max-w-sm"
     - className="h-[400px]"

  4. Combining:
     - className="aspect-square rounded-2xl w-full"
     - className="h-[300px] md:h-[400px] rounded-lg"
*/

export default {
  BasicCardExample,
  PortfolioGridExample,
  HeroCardExample,
  GallerySectionExample,
  ResponsiveGridExample,
  CustomStyledGridExample,
  AnimatedGalleryExample,
  SquareCardsExample,
  FullPageExample,
};
