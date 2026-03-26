import { useEffect, useRef, useState } from "react";
import "./PortfolioCarousel3D.css";

const DATA = [
  "/Employe%20/Banners%20and%20Posters/1.webp",
  "/Employe%20/Banners%20and%20Posters/3.webp",
  "/Employe%20/Banners%20and%20Posters/7.webp",
  "/Employe%20/Banners%20and%20Posters/8.webp",
  "/Employe%20/Banners%20and%20Posters/9.webp",
  "/Employe%20/Banners%20and%20Posters/12.webp",
  "/Employe%20/Banners%20and%20Posters/13.webp",
  "/Employe%20/Banners%20and%20Posters/14.webp",
  "/Employe%20/Banners%20and%20Posters/17.webp",
  "/Employe%20/Banners%20and%20Posters/18.webp",
  "/Employe%20/Banners%20and%20Posters/20.webp",
  "/Employe%20/Banners%20and%20Posters/21.webp",
  "/Employe%20/Banners%20and%20Posters/22.webp",
  "/Employe%20/Banners%20and%20Posters/23.webp",
  "/Employe%20/Banners%20and%20Posters/27.webp",
  "/Employe%20/Banners%20and%20Posters/28.webp",
  "/Employe%20/Banners%20and%20Posters/29.webp",
];

const N = DATA.length;

export const PortfolioCarousel3D = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting);
      },
      { threshold: 0.15, rootMargin: "120px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      data-active={isActive}
      className="portfolio-carousel-3d mt-16 md:mt-20"
    >
      <div className="mb-8 md:mb-10 text-center">
        <h2 className="font-display text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-300 to-cyan-300">
          Our Graphic Design Work
        </h2>
      </div>

      <div className="scene">
        <div className="a3d" style={{ ["--n" as string]: N }}>
          {DATA.map((src, i) => (
            <img
              key={src}
              className="card"
              src={src}
              style={{ ["--i" as string]: i }}
              alt="MS Digimark banner poster"
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
