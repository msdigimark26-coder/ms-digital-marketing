import { useEffect, useRef, useState } from "react";

interface LightCardProps {
  imageSrc: string;
  altText?: string;
  className?: string;
  title?: string;
  description?: string;
}

// Generate unique filter ID to avoid conflicts
const generateFilterId = () => `filter-${Math.random().toString(36).substr(2, 9)}`;

export const LightCard = ({
  imageSrc,
  altText = "Card image",
  className = "",
  title,
  description,
}: LightCardProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [filterId] = useState(generateFilterId());

  useEffect(() => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = img.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Find the SVG in this container and update the fePointLight
      const svg = container.querySelector("svg");
      if (svg) {
        const pointLight = svg.querySelector("fePointLight");
        if (pointLight) {
          pointLight.setAttribute("x", String(x));
          pointLight.setAttribute("y", String(y));
        }
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className={`relative group ${className}`}>
      <svg className="absolute inset-0 pointer-events-none" style={{ width: "100%", height: "100%", visibility: "hidden", position: "absolute" }}>
        <defs>
          <filter id={filterId} primitiveUnits="userSpaceOnUse">
            <feSpecularLighting
              result="specular-lighting-0"
              lighting-color="#ffffff"
              specularConstant="2.3"
              specularExponent="47"
              surfaceScale="37"
            >
              <fePointLight z="101" x="70" y="265" />
            </feSpecularLighting>
            
            <feMorphology
              result="morphology-0"
              in="SourceGraphic"
              radius="1.5"
            />
            
            <feComposite result="composite-0" in="specular-lighting-0" in2="morphology-0" operator="out" />
            <feComposite result="composite-1" in="SourceGraphic" in2="composite-0" operator="in" />
            
            <feColorMatrix
              result="color-matrix-0"
              in="composite-1"
              values="5 0 0 0 0.1 0 5 0 0 0.1 0 0 5 0 0.1 0 0 0 2.06 0"
            />
            
            <feGaussianBlur result="gaussian-blur-0" in="color-matrix-0" stdDeviation="6" />
            <feGaussianBlur result="gaussian-blur-1" in="color-matrix-0" stdDeviation="1" />
            <feGaussianBlur result="gaussian-blur-2" in="color-matrix-0" stdDeviation="0" />
            
            <feMerge result="merge-0">
              <feMergeNode in="gaussian-blur-0" />
              <feMergeNode in="gaussian-blur-1" />
              <feMergeNode in="gaussian-blur-2" />
            </feMerge>
            
            <feColorMatrix
              result="color-matrix-1"
              in="merge-0"
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.3 0"
            />
            <feColorMatrix result="saturation" type="saturate" values="10" />
            
            <feComposite
              result="composite-2"
              in2="SourceGraphic"
              operator="arithmetic"
              k3="1"
              k2="8.5"
            />
          </filter>
        </defs>
      </svg>

      <div className="relative overflow-hidden rounded-2xl bg-muted/30 backdrop-blur-sm border border-border/50">
        <img
          ref={imgRef}
          src={imageSrc}
          alt={altText}
          className="w-full h-full object-cover aspect-video transition-transform duration-300 group-hover:scale-105"
          style={{
            filter: `url(#${filterId})`,
          }}
        />

        {(title || description) && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col items-start justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {title && (
              <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            )}
            {description && (
              <p className="text-sm text-gray-200">{description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
