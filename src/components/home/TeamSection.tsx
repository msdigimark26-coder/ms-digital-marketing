import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { AnimatePresence } from "framer-motion";

gsap.registerPlugin(CustomEase);
CustomEase.create("slideshow-wipe", "0.625, 0.05, 0, 1");

interface TeamMember {
  id: string;
  name: string;
  title: string;
  description: string;
  image: string;
}

interface TeamSectionProps {
  showHeader?: boolean;
}

export const TeamSection = ({ showHeader = true }: TeamSectionProps) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [initFailed, setInitFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const innerRef = useRef<(HTMLDivElement | null)[]>([]);
  const thumbsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStartRef = useRef<number | null>(null);

  // Fetch employees from database
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase
          .from("employees")
          .select("id, name, title, description, image_url")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          // Map database fields to component interface
          const mappedData: TeamMember[] = data.map(employee => ({
            id: employee.id,
            name: employee.name,
            title: employee.title,
            description: employee.description,
            image: employee.image_url,
          }));
          setTeamMembers(mappedData);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

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
    if (length === 0) return;

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

      // Reset classes for all slides
      slidesRef.current.forEach((slide, idx) => {
        if (slide) {
          if (idx === current) {
            slide.classList.add('is--current');
          } else {
            slide.classList.remove('is--current');
          }
        }
      });

      // Reset classes for all thumbnails
      thumbsRef.current.forEach((thumb, idx) => {
        if (thumb) {
          if (idx === current) {
            thumb.classList.add('is--current');
          } else {
            thumb.classList.remove('is--current');
          }
        }
      });
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
      if (slide) gsap.set(slide, { opacity: slide.classList.contains('is--current') ? 1 : 0, visibility: "visible" });
    });

  }, [teamMembers, length, current]);

  // Auto-advance logic (1.5 seconds)
  useEffect(() => {
    if (loading || teamMembers.length <= 1 || animating || isFullScreen) return;

    const timer = setInterval(() => {
      navigate(1);
    }, 5000);

    return () => clearInterval(timer);
  }, [loading, teamMembers.length, current, animating, isFullScreen]);

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
      className={`${showHeader ? "py-24" : "py-0"} bg-gradient-to-b from-background to-muted/30`}
      ref={containerRef}
      initial={{ opacity: 0, y: 30, scale: 0.995 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      {/* Section Header */}
      {showHeader && (
        <div className="container mx-auto px-4 mb-12">
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
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="relative w-full h-[350px] sm:h-[450px] md:h-[550px] lg:h-[600px] overflow-hidden rounded-2xl md:rounded-3xl bg-black flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
        </div>
      ) : teamMembers.length === 0 ? (
        <div className="relative w-full h-[350px] sm:h-[450px] md:h-[550px] lg:h-[600px] overflow-hidden rounded-2xl md:rounded-3xl bg-black flex items-center justify-center">
          <div className="text-center text-slate-400">
            <p className="text-lg">No team members to display</p>
          </div>
        </div>
      ) : (
        <>
          {/* Carousel Container */}
          <div className="relative w-full h-[500px] sm:h-[600px] md:h-[700px] lg:h-[750px] overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] bg-[#05030e] border border-white/5 shadow-2xl">
            {/* Dynamic Ambient Background */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`bg-${teamMembers[current]?.id}`}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 0.4, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute inset-0 z-0 pointer-events-none"
              >
                <div
                  className="absolute inset-0 bg-center bg-cover blur-[80px] saturate-[1.8] scale-110"
                  style={{ backgroundImage: `url(${teamMembers[current]?.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05030e] via-transparent to-[#05030e]/50" />
              </motion.div>
            </AnimatePresence>

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
                  className={`team-slide absolute inset-0 ${index === current ? 'opacity-100 pointer-events-auto is--current' : 'opacity-0 pointer-events-none'} transition-opacity duration-300`}
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
                    {member.image && (
                      <picture>
                        {!member.image.startsWith('http') && (
                          <source srcSet={member.image.replace(/\.(png|jpg|jpeg)$/, '.webp')} type="image/webp" />
                        )}
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-contain object-center"
                          draggable={false}
                          loading="lazy"
                          decoding="async"
                        />
                      </picture>
                    )}
                  </div>
                  {/* Content Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end pb-32 sm:pb-36 lg:pb-32">
                    <div className="p-4 sm:p-6 md:p-12 w-full text-white pointer-events-auto">
                      <div
                        className="cursor-pointer"
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
                        <p className="text-xs sm:text-sm md:text-base text-gray-200 max-w-2xl line-clamp-2 sm:line-clamp-3 mb-6">{member.description}</p>
                      </div>
                      <a
                        href="/Employe /index.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-8 py-3 border-2 border-primary text-primary hover:bg-primary hover:text-black rounded-full font-bold text-sm sm:text-base uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(255,210,48,0.2)] hover:shadow-[0_0_30px_rgba(255,210,48,0.4)]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Full Bio
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Thumbnails */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 w-full px-4">
              <div className="flex gap-4 bg-black/40 backdrop-blur-2xl rounded-[2rem] p-4 justify-center border border-white/10 w-fit mx-auto shadow-2xl">
                {teamMembers.map((member, index) => (
                  <button
                    key={member.id}
                    ref={(el) => {
                      if (el) thumbsRef.current[index] = el;
                    }}
                    onClick={() => navigate(current < index ? 1 : -1, index)}
                    className={`team-nav-btn relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all duration-500 hover:scale-110 flex-shrink-0 ${index === current ? 'border-purple-500 ring-4 ring-purple-500/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    aria-label={`View ${member.name}`}
                  >
                    {member.image && (
                      <picture>
                        {!member.image.startsWith('http') && (
                          <source srcSet={member.image.replace(/\.(png|jpg|jpeg)$/, '.webp')} type="image/webp" />
                        )}
                        <img
                          src={member.image}
                          alt={member.name}
                          className={`w-full h-full object-cover transition-all duration-500 ${index === current ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`}
                          draggable={false}
                          loading="lazy"
                          decoding="async"
                        />
                      </picture>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Side Navigation Buttons */}
            <motion.button onClick={() => navigate(-1)} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6 }} className="absolute left-4 md:left-12 top-1/2 transform -translate-y-1/2 z-40 group hidden md:flex" aria-label="Previous member">
              <div className="w-16 h-16 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:border-white/20">
                <ArrowLeft className="h-6 w-6 text-white" />
              </div>
            </motion.button>

            <motion.button onClick={() => navigate(1)} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6 }} className="absolute right-4 md:right-12 top-1/2 transform -translate-y-1/2 z-40 group hidden md:flex" aria-label="Next member">
              <div className="w-16 h-16 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:border-white/20">
                <ArrowRight className="h-6 w-6 text-white" />
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

          {/* Member Details / Full Screen QR Dialog */}
          <Dialog open={!!selectedMember} onOpenChange={(open) => {
            if (!open) {
              setSelectedMember(null);
              setIsFullScreen(false);
            }
          }}>
            <DialogContent className={isFullScreen ? "max-w-[95vw] h-[95vh] p-0 overflow-hidden bg-black/95 border-none" : "max-w-3xl"}>
              {selectedMember && (
                isFullScreen ? (
                  <div className="relative w-full h-full flex items-center justify-center p-4">
                    <img
                      src={selectedMember.image}
                      alt={selectedMember.name}
                      className="max-w-full max-h-full object-contain drop-shadow-2xl"
                    />
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-sm bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
                      Full view with QR Code enabled
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 p-6">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-purple-500/20 blur-2xl group-hover:opacity-100 transition-opacity" />
                      <img src={selectedMember.image} alt={selectedMember.name} className="w-full h-80 object-contain rounded-2xl relative z-10" loading="lazy" decoding="async" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <DialogTitle className="text-3xl font-bold mb-2">{selectedMember.name}</DialogTitle>
                      <DialogDescription className="text-lg">
                        <span className="text-purple-400 font-semibold block mb-4">{selectedMember.title}</span>
                        <p className="text-slate-300 leading-relaxed">{selectedMember.description}</p>
                      </DialogDescription>
                    </div>
                  </div>
                )
              )}
            </DialogContent>
          </Dialog>

          <style>{`
        .team-slide {
          transition: opacity 0.3s ease;
          z-index: 0;
          touch-action: pan-y;
          will-change: transform, opacity;
          transform: translateZ(0);
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
          transform: translate3d(0,0,0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
 
        .team-nav-btn.is--current {
          border-color: rgb(255, 255, 255);
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }
 
        .team-member {
          opacity: 1;
          visibility: visible;
        }
      `}</style>
        </>
      )}
    </motion.section>
  );
};