// src/pages/Home.tsx
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Award, Shield, Truck, Leaf, ArrowRight, Users, Package, Globe
} from 'lucide-react';
import AnimatedHero from '../components/ui/AnimatedHero';
import ProductCard from '../components/ui/ProductCard';
import { useProductsStore } from '../store/productsStore';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { icon: Users, value: '50,000+', label: 'Happy Families' },
  { icon: Package, value: '10+', label: 'Rice Varieties' },
  { icon: Globe, value: '25+', label: 'Export Countries' },
  { icon: Award, value: '38 yrs', label: 'Of Excellence' },
];

const features = [
  {
    Icon: Award,
    title: 'FSSAI & ISO Certified',
    desc: 'All our rice is tested, certified, and packed under hygienic conditions to the highest Indian food safety standards.',
  },
  {
    Icon: Leaf,
    title: 'Farm-to-Table',
    desc: 'We source directly from our own paddy farms and partner growers — no middlemen, pure freshness.',
  },
  {
    Icon: Truck,
    title: 'Pan-India Delivery',
    desc: 'Doorstep delivery across India in 3–5 business days. Bulk and wholesale orders shipped nationwide.',
  },
  {
    Icon: Shield,
    title: 'Quality Guarantee',
    desc: 'Not satisfied? We offer a full refund or replacement on every order. No questions asked.',
  },
];

export default function Home() {
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Stats counter animation
      gsap.from('.stat-card', {
        scrollTrigger: { trigger: statsRef.current, start: 'top 80%' },
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out',
      });

      // Features
      gsap.from('.feature-card', {
        scrollTrigger: { trigger: featuresRef.current, start: 'top 80%' },
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power2.out',
      });

      // Product cards
      gsap.from('.product-card-anim', {
        scrollTrigger: { trigger: productsRef.current, start: 'top 80%' },
        opacity: 0,
        y: 40,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power2.out',
      });
    });

    return () => ctx.revert();
  }, []);

  const products = useProductsStore((s) => s.products);
  const featuredProducts = products.slice(0, 6);

  return (
    <main>
      {/* CINEMATIC HERO: scroll-scrubbed rice separation frame sequence */}
      <AnimatedHero />

      {/* STATS */}
      <section ref={statsRef} className="py-16 bg-[#0a150a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="stat-card card-glass p-6 text-center">
                <Icon className="w-8 h-8 text-[#d4a017] mx-auto mb-3" />
                <div className="font-serif font-bold text-3xl text-white mb-1">{value}</div>
                <div className="text-gray-400 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section ref={productsRef} className="py-20 bg-[#0d180d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-subtitle">Our Collection</p>
            <h2 className="section-title mb-4">Premium Rice Varieties</h2>
            <div className="gold-divider mx-auto mb-6" />
            <p className="text-gray-400 max-w-2xl mx-auto">
              From aromatic Basmati aged for 12 months to nutrition-packed Red and Black rice —
              discover our full range of premium milled rice.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((p) => (
              <div key={p.id} className="product-card-anim">
                <ProductCard product={p} />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/shop" className="btn-primary text-lg px-10 py-4">
              View All Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section ref={featuresRef} className="py-20 bg-[#0a150a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-subtitle">Why Hariharan Traders</p>
            <h2 className="section-title">Quality You Can Taste</h2>
            <div className="gold-divider mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ Icon, title, desc }) => (
              <div key={title} className="feature-card card p-6">
                <div className="w-12 h-12 bg-[#d4a017]/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#d4a017]" />
                </div>
                <h3 className="font-serif font-semibold text-white text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHOLESALE CTA */}
      <section className="py-20 bg-gradient-to-br from-[#1e5c1e]/30 to-[#0a150a] border-y border-[#1a2e1a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="section-subtitle">Bulk Orders Welcome</p>
          <h2 className="section-title mb-4">Wholesale &amp; Export</h2>
          <div className="gold-divider mx-auto mb-6" />
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
            We supply to restaurants, supermarkets, exporters, and food manufacturers.
            Competitive pricing, consistent quality, export documentation handled.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/wholesale" className="btn-primary text-lg px-8 py-4">
              Get Wholesale Price
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/export" className="btn-secondary text-lg px-8 py-4">
              Export Inquiry
            </Link>
          </div>
        </div>
      </section>

      {/* CERTIFICATIONS */}
      <section className="py-16 bg-[#060e06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="section-subtitle">Certifications</p>
          <h2 className="text-2xl font-serif text-white mb-10">Trusted. Certified. Safe.</h2>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {['FSSAI Certified', 'ISO 22000', 'APEDA Registered', 'Phytosanitary Cert', 'Halal Certified'].map(
              (cert) => (
                <div
                  key={cert}
                  className="px-6 py-3 border border-[#d4a017]/30 rounded-lg text-[#d4a017] text-sm font-semibold"
                >
                  ✓ {cert}
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
