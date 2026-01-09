import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";

gsap.registerPlugin(CustomEase);
CustomEase.create("slideshow-wipe", "0.625, 0.05, 0, 1");

interface TeamMember {
  id: number;
  name: string;
  title: string;
  description: string;
  image: string;
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Sai sankeet",
    title: "Digital Marketing Head & Business Strategy",
    description: "SEO & Content Marketing • Social Media Marketing • PPC & Paid Advertising",
    image: "/Team Members 2/1.png",
  },
  {
    id: 2,
    name: "Britto",
    title: "Front-end Developer & UI/UX Designer",
    description: "Website Development • User Interface Design • 3D Modeling",
    image: "/Team Members 2/2.png",
  },
  {
    id: 3,
    name: "Arivalagan",
    title: "UI/UX Designer & Editor",
    description: "User Interface Design • User Experience Design • Prototyping & Wireframes",
    image: "/Team Members 2/3.png",
  },
  {
    id: 4,
    name: "Abdul razaak",
    title: "Project Manager & Editor",
    description: "Project Planning • Client Coordination • Quality Assurance",
    image: "/Team Members 2/4.png",
  },
  {
    id: 5,
    name: "Joel Kevin",
    title: "Social Media Manager",
    description: "Account Handling • Content Strategy • Audience Engagement",
    image: "/Team Members 2/5.png",
  },
  {
    id: 6,
    name: "Baptis",
    title: "Creative Designer",
    description: "Banner & Ad Design • YouTube Thumbnails • Instagram Creatives",
    image: "/Team Members 2/6.png",
  },
  {
    id: 7,
    name: "Rahul ji",
    title: "Video Editor",
    description: "Video Editing • Motion Graphics • Platform-Optimized Content",
    image: "/Team Members 2/7.png",
  },
  {
    id: 8,
    name: "Sangeeth",
    title: "Back-end Developer",
    description: "Secure Architecture • API & Database Management • Scalable & High Performance",
    image: "/Team Members 2/8.png",
  },
];

interface TeamSectionProps {
  showHeader?: boolean;
}

export const TeamSection = ({ showHeader = true }: TeamSectionProps) => {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [initFailed, setInitFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const innerRef = useRef<(HTMLDivElement | null)[]>([]);
  const thumbsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStartRef = useRef<number | null>(null);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      navigate(-1);
    } else if (e.key === "ArrowRight") {
      navigate(1);
    }
  };

  const length = teamMembers.length;
  const animationDuration = 1.1; // slightly snappier

  useEffect(() => {
    slidesRef.current = new Array(length).fill(null);
    innerRef.current = new Array(length).fill(null);
    thumbsRef.current = new Array(length).fill(null);

    const init = () => {
      const slideEls = Array.from(containerRef.current?.querySelectorAll<HTMLDivElement>('.team-slide') || []);
      const innerEls = Array.from(containerRef.current?.querySelectorAll<HTMLDivElement>('.team-slide-inner') || []);
      const thumbEls = Array.from(containerRef.current?.querySelectorAll<HTMLButtonElement>('.team-nav-btn') || []);

      slidesRef.current = slideEls;
      innerRef.current = innerEls;
      thumbsRef.current = thumbEls;

      if (slidesRef.current[0]) slidesRef.current[0].classList.add('is--current');
      if (thumbsRef.current[0]) thumbsRef.current[0].classList.add('is--current');
    };

    init();

    gsap.from(containerRef.current, {
      duration: 0.9,
      opacity: 1,
      y: 0,
      ease: "power3.out",
      delay: 0.1,
    });

    // Ensure consistent visibility for all team members
    slidesRef.current.forEach((slide) => {
      gsap.set(slide, { opacity: 1, visibility: "visible" });
    });

    return () => {
      // Cleanup logic
    };
  }, []);

  const navigate = (direction: number, targetIndex: number | null = null) => {
    if (animating) return;
    setAnimating(true);

    const previous = current;
    const next =
      targetIndex !== null && targetIndex !== undefined
        ? targetIndex
        : direction === 1
          ? current < length - 1
            ? current + 1
            : 0
          : current > 0
            ? current - 1
            : length - 1;

    let currentSlide = slidesRef.current[previous];
    let currentInner = innerRef.current[previous];
    let upcomingSlide = slidesRef.current[next];
    let upcomingInner = innerRef.current[next];

    // If refs are missing (race), try to repopulate from DOM as a fallback
    if (!currentSlide || !upcomingSlide) {
      const slideEls = containerRef.current?.querySelectorAll<HTMLDivElement>('.team-slide');
      const innerEls = containerRef.current?.querySelectorAll<HTMLDivElement>('.team-slide-inner');
      const thumbEls = containerRef.current?.querySelectorAll<HTMLButtonElement>('.team-nav-btn');
      if (slideEls && slideEls.length) {
        slidesRef.current = Array.from(slideEls) as (HTMLDivElement | null)[];
        currentSlide = slidesRef.current[previous];
        upcomingSlide = slidesRef.current[next];
      }
      if (innerEls && innerEls.length) {
        innerRef.current = Array.from(innerEls) as (HTMLDivElement | null)[];
        currentInner = innerRef.current[previous];
        upcomingInner = innerRef.current[next];
      }
      if (thumbEls && thumbEls.length) {
        thumbsRef.current = Array.from(thumbEls) as (HTMLButtonElement | null)[];
      }
    }

    if (!currentSlide || !upcomingSlide) {
      console.warn('TeamSection.navigate: missing slide refs, aborting');
      setAnimating(false);
      return;
    }

    // ensure upcoming is on top during animation
    gsap.set(upcomingSlide, { zIndex: 20 });
    gsap.set(currentSlide, { zIndex: 10 });

    gsap
      .timeline({
        defaults: { duration: animationDuration, ease: "slideshow-wipe" },
        onStart() {
          upcomingSlide?.classList.add("is--current");
          thumbsRef.current[previous]?.classList.remove("is--current");
          thumbsRef.current[next]?.classList.add("is--current");
        },
        onComplete() {
          currentSlide?.classList.remove('is--current');
          // remove the inline zIndex property safely
          gsap.set(upcomingSlide, { clearProps: 'zIndex' });
          gsap.set(currentSlide, { clearProps: 'zIndex' });
          setCurrent(next);
          setAnimating(false);
        },
      })
      // slide and fade out the current slide with a subtle skew
      .to(currentSlide, { xPercent: -direction * 100, opacity: 0.6, skewX: -direction * 6 }, 0)
      .to(currentInner, { xPercent: direction * 65, scale: 0.98 }, 0)
      // bring in upcoming slide with a smoother ease and slight scale in
      .fromTo(
        upcomingSlide,
        { xPercent: direction * 100, opacity: 0.6, skewX: direction * 6 },
        { xPercent: 0, opacity: 1, skewX: 0 },
        0
      )
      .fromTo(upcomingInner, { xPercent: -direction * 65, scale: 1.02 }, { xPercent: 0, scale: 1 }, 0);
  };

  return (
    <motion.section
      className="py-24 bg-gradient-to-b from-background to-muted/30"
      ref={containerRef}
      initial={{ opacity: 0, y: 30, scale: 0.995 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <div className="container mx-auto px-4 mb-12">
        {/* Section Header */}
        {showHeader && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Our Team
            </span>
            <h2 className="text-5xl md:text-6xl font-bold mt-4 mb-6">
              <span className="text-gradient">The Minds Behind</span>
              <br />
              <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                Meet Our Team
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The creative strategists powering your digital success.
            </p>
          </motion.div>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative w-full h-[450px] sm:h-[550px] md:h-[650px] lg:h-[750px] overflow-hidden rounded-2xl md:rounded-3xl bg-black">
        {initFailed && (
          <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/60 text-white">
            <div className="text-center">
              <p className="font-semibold mb-2">Team section failed to load.</p>
              <p className="text-sm text-muted-foreground">Try refreshing the page — if the issue persists, check console for details.</p>
            </div>
          </div>
        )}
        {/* Slides */}
        <div
          className="relative w-full h-full"
          tabIndex={0}
          role="region"
          aria-label="Team carousel"
          onKeyDown={handleKeyDown}
          onTouchStart={(e) => (touchStartRef.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const start = touchStartRef.current;
            const end = e.changedTouches[0].clientX;
            if (start == null) return;
            const dx = end - start;
            const threshold = 50;
            if (Math.abs(dx) > threshold) {
              if (dx < 0) navigate(1); else navigate(-1);
            }
            touchStartRef.current = null;
          }}
        >
          {teamMembers.map((member, index) => (
            <div
              key={member.id}
              ref={(el) => {
                if (el) slidesRef.current[index] = el;
              }}
              className={`team-slide absolute inset-0 opacity-0 pointer-events-none ${index === 0 ? 'is--current' : ''}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${member.name} - ${member.title}`}
            >
              <div
                ref={(el) => {
                  if (el) innerRef.current[index] = el;
                }}
                className="team-slide-inner absolute inset-0 w-full h-full bg-gradient-to-b from-gray-900 to-black flex items-center justify-center"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-contain object-center"
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              {/* Content Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end">
                <div
                  className="p-4 sm:p-6 md:p-12 w-full text-white cursor-pointer"
                  onClick={() => setSelectedMember(member)}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedMember(member)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open details for ${member.name}`}
                >
                  <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2">{member.name}</h3>
                  <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-primary mb-3 sm:mb-4 font-semibold">
                    {member.title}
                  </p>
                  <p className="text-xs sm:text-sm md:text-base text-gray-200 max-w-2xl line-clamp-2 sm:line-clamp-3">{member.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Thumbnails */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="absolute bottom-3 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-full px-2 sm:px-0">
          <div className="flex gap-2 sm:gap-3 bg-black/40 backdrop-blur-md rounded-full p-2 sm:p-3 justify-center">
            {teamMembers.map((member, index) => (
              <button
                key={member.id}
                ref={(el) => {
                  if (el) thumbsRef.current[index] = el;
                }}
                onClick={() => navigate(current < index ? 1 : -1, index)}
                className={`team-nav-btn w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 border-transparent transition-all duration-500 hover:scale-105 flex-shrink-0 ${index === 0 ? 'is--current' : ''}`}
                aria-label={`View ${member.name}`}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-contain object-center"
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Side Navigation Buttons */}
        <motion.button onClick={() => navigate(-1)} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6 }} className="absolute left-2 sm:left-4 md:left-8 top-1/2 transform -translate-y-1/2 z-10 group hidden sm:flex" aria-label="Previous member">
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </motion.button>

        <motion.button onClick={() => navigate(1)} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6 }} className="absolute right-2 sm:right-4 md:right-8 top-1/2 transform -translate-y-1/2 z-10 group hidden sm:flex" aria-label="Next member">
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </motion.button>
      </div>

      {/* Counter */}
      <div className="text-center mt-8">
        <p className="text-muted-foreground text-lg">
          <span className="text-primary font-bold text-2xl">0{current + 1}</span> /{" "}
          <span className="font-bold text-2xl">0{length}</span>
        </p>
      </div>

      {/* Member Details Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent>
          {selectedMember && (
            <div className="grid gap-4 md:grid-cols-2">
              <img src={selectedMember.image} alt={selectedMember.name} className="w-full h-64 object-cover rounded-md" loading="lazy" decoding="async" />
              <div>
                <DialogTitle>{selectedMember.name}</DialogTitle>
                <DialogDescription>
                  <p className="text-primary font-semibold">{selectedMember.title}</p>
                  <p className="mt-4 text-muted-foreground">{selectedMember.description}</p>
                </DialogDescription>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <style>{`
        .team-slide {
          transition: opacity 0.2s ease;
          z-index: 0;
          touch-action: pan-y;
          will-change: transform, opacity;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        
        .team-slide.is--current {
          opacity: 1;
          pointer-events: auto;
          z-index: 10;
        }

        .team-slide-inner {
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          -webkit-perspective: 1000;
          perspective: 1000;
        }

        .team-nav-btn.is--current {
          border-color: rgb(255, 255, 255);
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
          transform: scale(1.03);
        }

        .team-member {
          opacity: 1;
          visibility: visible;
        }

        @media (max-width: 640px) {
          .team-slide {
            will-change: auto;
          }
          .team-slide-inner {
            will-change: auto;
          }
        }
      `}</style>
    </motion.section>
  );
};