# LightCard Animation - Implementation Guide

## Overview

The `LightCard` component provides an interactive light-effect animation with SVG filters that creates a specular lighting effect following the mouse cursor. This creates a premium, interactive user experience perfect for portfolio items, gallery sections, and featured content.

## Features

- 🎯 Mouse-tracking specular lighting effect
- ✨ SVG filter-based 3D lighting simulation
- 📱 Fully responsive design
- 🎨 Customizable styling with Tailwind CSS
- 🔄 Smooth transitions and hover effects
- ♿ Accessible with proper alt text support
- ⚡ GPU-optimized performance

## Components Available

### 1. LightCard Component

The base reusable card component with interactive light effect.

**Location:** `src/components/ui/LightCard.tsx`

**Props:**
```typescript
interface LightCardProps {
  imageSrc: string;           // Image URL (required)
  altText?: string;           // Alt text for accessibility
  className?: string;         // Additional Tailwind classes
  title?: string;            // Card title (shown on hover)
  description?: string;      // Card description (shown on hover)
}
```

**Basic Usage:**
```tsx
import { LightCard } from "@/components/ui/LightCard";

export default function MyComponent() {
  return (
    <LightCard
      imageSrc="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe"
      altText="Portfolio project"
      title="Project Name"
      description="Project category"
    />
  );
}
```

### 2. GallerySection Component

A complete gallery section with multiple light cards in a responsive grid.

**Location:** `src/components/home/GallerySection.tsx`

**Props:**
```typescript
interface GallerySectionProps {
  title: string;              // Gallery title (required)
  subtitle?: string;          // Section subtitle (default: "GALLERY")
  description?: string;       // Additional description
  items: GalleryItem[];       // Array of gallery items (required)
  columns?: 1 | 2 | 3 | 4;   // Grid columns (default: 3)
}

interface GalleryItem {
  title: string;
  description: string;
  image: string;
}
```

**Usage Example:**
```tsx
import { GallerySection } from "@/components/home/GallerySection";

export default function Home() {
  const galleryItems = [
    {
      title: "Project Alpha",
      description: "Web Design",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe"
    },
    {
      title: "Project Beta",
      description: "3D Modeling",
      image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2"
    },
    // More items...
  ];

  return (
    <GallerySection
      title="Featured Projects"
      subtitle="OUR WORK"
      description="Showcase of our best creative work"
      items={galleryItems}
      columns={3}
    />
  );
}
```

## Updated Components

The following components have been updated to use the LightCard:

### 1. PortfolioSection (`src/components/home/PortfolioSection.tsx`)
- Replaced custom card styling with LightCard
- Now displays mouse-tracking light effects on project images
- Maintains all original functionality with enhanced visuals

### 2. Portfolio Page (`src/pages/Portfolio.tsx`)
- Updated all portfolio grid items to use LightCard
- Responsive 3-column grid with light effects
- Better hover interactions

## SVG Filter Details

The light effect is powered by a complex SVG filter chain:

1. **feSpecularLighting** - Creates the light reflection based on mouse position
2. **feMorphology** - Adjusts the edge thickness
3. **feColorMatrix** - Enhances color saturation and brightness
4. **feGaussianBlur** - Adds blur layers for depth
5. **feMerge** - Combines all effects
6. **feComposite** - Final arithmetic operations for intensity

### Customizable Parameters

To customize the light effect, modify these values in the LightCard component:

```typescript
// Light position (z-depth)
z="101"

// Specular lighting properties
specularConstant="2.3"      // How reflective the surface is
specularExponent="47"       // How focused the highlight is
surfaceScale="37"           // Height of the 3D effect

// Morphology radius
radius="1.5"                // Edge detection thickness

// Color enhancement
values="5 0 0 0 0.1..."     // Color matrix values

// Gaussian blur
stdDeviation="6"            // Blur amount
```

## Performance Considerations

- The component uses pure CSS and SVG filters (GPU-accelerated)
- Mouse tracking is delegated to the document level (efficient event handling)
- Individual filter IDs prevent conflicts with multiple cards
- Lightweight React implementation with minimal state

## Browser Compatibility

- ✅ Chrome/Edge 88+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Mobile browsers (with touch support)

## Accessibility

- Proper `alt` text for images (customizable)
- Semantic HTML structure
- Title and description accessible on hover
- Keyboard navigable

## Integration Tips

1. **In Hero Sections:**
   ```tsx
   <LightCard imageSrc="hero-image.jpg" className="w-full" />
   ```

2. **In Cards Grid:**
   ```tsx
   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
     {items.map(item => (
       <LightCard key={item.id} imageSrc={item.image} title={item.name} />
     ))}
   </div>
   ```

3. **With Custom Styling:**
   ```tsx
   <LightCard
     imageSrc={url}
     className="rounded-lg aspect-square"
   />
   ```

## Troubleshooting

### Light effect not showing?
- Ensure SVG filter ID is unique
- Check that image source is valid and loaded
- Verify CSS classes are applied correctly

### Performance issues on mobile?
- Consider reducing the number of cards on mobile
- Use lazy loading for images
- Enable GPU acceleration with `will-change: transform`

### Filter not tracking mouse?
- Check browser console for errors
- Ensure JavaScript is enabled
- Verify mouse events are being captured

## Examples in Your Project

- **PortfolioSection** - 4 featured projects with light effects
- **Portfolio Page** - 6 project gallery with light effects
- **Custom GallerySection** - Flexible gallery component

## Future Enhancements

Possible improvements:
- Touch gesture support for mobile light tracking
- Configurable filter presets (subtle, dramatic, etc.)
- Animation on load
- Color-based filter variations
- Multiple light sources
