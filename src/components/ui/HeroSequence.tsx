// src/components/ui/HeroSequence.tsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ChevronDown, ShoppingBag, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const heroImages = [
  { src: '/assets/rice-bowl.jpg', alt: 'A ceramic bowl overflowing with premium rice' },
  { src: '/assets/rice-spill.jpg', alt: 'Rice spilling dynamically from a tipped bowl' },
  { src: '/assets/rice-segregation.jpg', alt: 'Rice grains segregating mid-air into variety streams' },
  { src: '/assets/rice-bowls.jpg', alt: 'Five bowls filled with different rice varieties' },
];

export default function HeroSequence() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const imgs = imgRefs.current;

      // Set initial states
      gsap.set(imgs, { opacity: 0, scale: 1.08 });
      gsap.set(imgs[0], { opacity: 1, scale: 1 });
      gsap.set(textRef.current, { opacity: 0, y: 40 });
      gsap.set(ctaRef.current, { opacity: 0, y: 20 });

      // Intro animation
      gsap.to(textRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.5,
        ease: 'power3.out',
      });
      gsap.to(ctaRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 1,
        ease: 'power3.out',
      });

      // Main scroll-linked timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5,
          onUpdate: (self) => {
            // Update progress bar
            if (progressRef.current) {
              progressRef.current.style.width = `${self.progress * 100}%`;
            }
          },
        },
      });

      // Image 0 → 1: Bowl tilts and spills
      tl.to(imgs[0], { opacity: 0, scale: 1.05, duration: 0.8, ease: 'power2.inOut' }, 0)
        .to(imgs[1], { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.inOut' }, 0);

      // Image 1 → 2: Grain streams start separating
      tl.to(imgs[1], { opacity: 0, scale: 1.04, duration: 0.8, ease: 'power2.inOut' }, 1)
        .to(imgs[2], { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.inOut' }, 1);

      // Overlay text changes on segregation image
      tl.to(overlayRef.current, { opacity: 0.85, duration: 0.5 }, 1.2)
        .to(overlayRef.current, { opacity: 0, duration: 0.5 }, 1.7);

      // Image 2 → 3: Rice lands in variety bowls
      tl.to(imgs[2], { opacity: 0, scale: 1.03, duration: 0.8, ease: 'power2.inOut' }, 2)
        .to(imgs[3], { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.inOut' }, 2);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="hero-section">
      {/* Sticky viewport */}
      <div ref={stickyRef} className="hero-sticky">
        {/* Images */}
        {heroImages.map((img, i) => (
          <img
            key={i}
            ref={(el) => { imgRefs.current[i] = el; }}
            src={img.src}
            alt={img.alt}
            className="hero-img"
            style={{ zIndex: i === 0 ? 2 : 1 }}
          />
        ))}

        {/* Base dark overlay gradient */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

        {/* Mid-scroll overlay text (segregation phase) */}
        <div
          ref={overlayRef}
          className="absolute inset-0 z-20 flex items-center justify-center opacity-0 pointer-events-none"
        >
          <div className="text-center">
            <p className="font-serif text-4xl md:text-6xl font-bold text-white drop-shadow-2xl">
              Every grain,
            </p>
            <p className="font-serif text-4xl md:text-6xl font-bold text-[#d4a017] drop-shadow-2xl">
              a different story.
            </p>
          </div>
        </div>

        {/* Hero Content — always visible */}
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4 text-center">
          {/* Gentle dark center vignette for razor-sharp text readability */}
          <div
            className="absolute inset-0 pointer-events-none -z-10"
            style={{
              background: 'radial-gradient(ellipse 65% 55% at 50% 48%, rgba(10,18,10,0.72) 0%, rgba(10,18,10,0.35) 60%, rgba(10,18,10,0) 100%)',
            }}
          />

          <div ref={textRef} className="max-w-4xl mx-auto flex flex-col items-center">
            {/* Authentic Heritage Crest */}
            <div className="flex items-center gap-3 mb-4">
              <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent via-[#d4a017]/60 to-[#d4a017]" />
              <div className="flex items-center gap-2 text-xs sm:text-sm font-serif tracking-[0.26em] uppercase font-semibold text-[#f5d98b] drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                <span>ESTD. 1981</span>
                <span className="text-[#d4a017] text-xs">❖</span>
                <span>TAMIL NADU</span>
              </div>
              <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent via-[#d4a017]/60 to-[#d4a017]" />
            </div>

            {/* Brand Title */}
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.08] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
              Hariharan{' '}
              <span className="bg-gradient-to-r from-[#fce18a] via-[#e5b32f] to-[#caa02b] bg-clip-text text-transparent">
                Traders
              </span>
            </h1>

            {/* Traditional Sub-Title */}
            <p className="mt-3 text-sm sm:text-base md:text-lg text-[#ecd79d] font-serif italic tracking-wide max-w-xl mx-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
              Traditional Rice Millers &amp; Wholesale Suppliers
            </p>

            {/* Tagline */}
            <p className="mt-2 text-white/90 text-sm sm:text-base font-light tracking-wide max-w-md mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              One bowl · Five varieties · Infinite flavour
            </p>
          </div>

          <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 items-center">
            <Link to="/shop" className="btn-primary text-lg px-8 py-4">
              <ShoppingBag className="w-5 h-5" />
              Shop All Rice
            </Link>
            <Link to="/wholesale" className="btn-secondary text-lg px-8 py-4">
              Wholesale Inquiry
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Scroll Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-40 h-1 bg-white/10">
          <div
            ref={progressRef}
            className="h-full bg-gradient-to-r from-[#d4a017] to-[#fcd34d] transition-none"
            style={{ width: '0%' }}
          />
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1 animate-bounce">
          <span className="text-gray-400 text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-5 h-5 text-[#d4a017]" />
        </div>

        {/* Floating image step indicators */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3">
          {heroImages.map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-8 rounded-full bg-white/20"
              style={{ background: i === 0 ? '#d4a017' : 'rgba(255,255,255,0.2)' }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
