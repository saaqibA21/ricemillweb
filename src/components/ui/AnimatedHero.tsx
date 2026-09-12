// src/components/ui/AnimatedHero.tsx
// Scroll-scrubbed image-sequence hero: frames extracted from the real rice
// separation footage (public/assets/rice-frames/frame-001.jpg … frame-080.jpg).
// The frame shown is a pure function of scroll progress, so it scrubs
// perfectly forward and backward with the scrollbar, just like a video
// timeline — but as plain images, no video decode/seek latency.

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ChevronDown } from 'lucide-react';
import { getRiceFrames, drawRiceFrame, frameIndexForProgress } from '../../lib/riceFrames';

gsap.registerPlugin(ScrollTrigger);

export default function AnimatedHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const textRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const phaseLabelRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    const canvas = canvasRef.current;
    if (!mount || !canvas) return;
    const ctx = canvas.getContext('2d')!;

    // ── Preload all frames (shared cache with other scroll sections) ──
    const images = getRiceFrames();

    let lastDrawnIndex = -1;

    function drawFrame(index: number) {
      return drawRiceFrame(ctx, images, index, mount!.clientWidth, mount!.clientHeight);
    }

    // ── Resize ──────────────────────────────────────────
    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const w = mount!.clientWidth;
      const h = mount!.clientHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lastDrawnIndex = -1; // force a redraw at the new size
    }
    resize();
    window.addEventListener('resize', resize);

    // ── ScrollTrigger drives progress 0→1 ──────────────
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });

    // GSAP entrance for text
    gsap.set(textRef.current, { opacity: 0, y: 50 });
    gsap.set(ctaRef.current, { opacity: 0, y: 30 });
    gsap.to(textRef.current, { opacity: 1, y: 0, duration: 1.2, delay: 0.4, ease: 'power3.out' });
    gsap.to(ctaRef.current, { opacity: 1, y: 0, duration: 1, delay: 1.1, ease: 'power3.out' });

    // ── Main render loop — draws only when the target frame changes ──
    let raf = 0;
    function animate() {
      const p = progressRef.current;
      const index = frameIndexForProgress(p);
      if (index !== lastDrawnIndex && drawFrame(index)) {
        lastDrawnIndex = index;
      }

      // Hero text fades out as soon as scrolling begins
      if (textRef.current && ctaRef.current) {
        const fade = p < 0.1 ? 1 : Math.max(0, 1 - (p - 0.1) / 0.12);
        textRef.current.style.opacity = String(fade);
        ctaRef.current.style.opacity = String(fade);
      }

      // Mid-scroll phase label
      if (phaseLabelRef.current) {
        const visible = p > 0.28 && p < 0.95;
        const labelAlpha = !visible ? 0 : p < 0.38 ? (p - 0.28) / 0.1 : p > 0.85 ? 1 - (p - 0.85) / 0.1 : 1;
        phaseLabelRef.current.style.opacity = String(labelAlpha);
        phaseLabelRef.current.textContent =
          p < 0.62 ? 'Every grain, a different story.' : 'From one bowl, into every bowl.';
      }

      // Progress bar
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${p * 100}%`;
      }

      raf = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      ScrollTrigger.getAll().forEach((tr) => tr.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} style={{ height: '320vh' }}>
      <div
        ref={mountRef}
        className="sticky top-0 h-screen overflow-hidden bg-gradient-to-b from-[#141416] to-[#050506]"
      >
        {/* Frame sequence */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Dark gradient for text legibility over the footage */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/55 via-black/10 to-black/70 pointer-events-none" />

        {/* Blurs out the source footage's watermark, fixed near the bottom-right corner */}
        <div
          className="absolute right-0 bottom-0 z-10 w-[32%] h-[28%] pointer-events-none"
          style={{
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            maskImage: 'radial-gradient(circle at 100% 100%, black 0%, black 55%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(circle at 100% 100%, black 0%, black 55%, transparent 100%)',
          }}
        />

        {/* Mid-scroll phase label */}
        <div
          ref={phaseLabelRef}
          className="absolute top-[10%] left-1/2 -translate-x-1/2 z-20 font-serif font-bold text-2xl sm:text-3xl md:text-4xl text-[#f0e6c8] text-center px-4 pointer-events-none opacity-0"
          style={{ textShadow: '0 4px 16px rgba(0,0,0,0.6)' }}
        />

        {/* Hero text overlay */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center pointer-events-none">
          <div ref={textRef}>
            <div className="inline-flex items-center gap-2 bg-[#d4a017]/10 border border-[#d4a017]/30 text-[#d4a017] text-sm font-semibold px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 bg-[#d4a017] rounded-full animate-pulse" />
              Farm to Kitchen Since 1981
            </div>
            <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-bold text-white leading-tight mb-4">
              Hariharan
              <span className="block text-[#d4a017]">Traders</span>
              <span className="block text-3xl sm:text-4xl md:text-5xl font-medium text-gray-300">
                Rice
              </span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-xl mx-auto mt-4 mb-2">
              One bowl. Five varieties. Infinite flavour.
            </p>
          </div>

          <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 mt-8 pointer-events-auto">
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

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 animate-bounce">
          <span className="text-gray-400 text-xs tracking-widest uppercase">Scroll to watch</span>
          <ChevronDown className="w-5 h-5 text-[#d4a017]" />
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 h-1 bg-white/10">
          <div
            ref={progressBarRef}
            className="h-full bg-gradient-to-r from-[#d4a017] to-[#fcd34d] transition-none"
            style={{ width: '0%' }}
          />
        </div>
      </div>
    </section>
  );
}
