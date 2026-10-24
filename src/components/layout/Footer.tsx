// src/components/layout/Footer.tsx
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle, Instagram, Facebook, Youtube } from 'lucide-react';
import { useTranslation } from '../../store/languageStore';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#18181b] border-t border-[#27272a] mt-20 text-stone-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1 min-w-0">
            <Link to="/" className="flex items-center gap-3.5 mb-6 group">
              <img
                src="/assets/logo.jpeg"
                alt="Hariharan Traders"
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover ring-2 ring-[#d4a017] shadow-lg group-hover:scale-105 transition-transform shrink-0"
              />
              <div>
                <div className="font-serif font-bold text-white text-xl sm:text-2xl leading-tight">Hariharan Traders</div>
                <div className="text-[#d4a017] text-xs sm:text-sm font-semibold tracking-wide mt-1">{t('nav.tagline', 'RICE • ஆரோக்கியமான வாழ்வு')}</div>
              </div>
            </Link>
            <p className="text-stone-400 text-sm leading-relaxed mb-6">
              {t('footer.desc', 'From paddy fields to your kitchen — delivering the finest rice varieties since 1981. FSSAI Certified. ISO 22000. Trusted by 50,000+ families.')}
            </p>
            {/* Social */}
            <div className="flex gap-3">
              {[
                { Icon: Instagram, href: '#', label: 'Instagram' },
                { Icon: Facebook, href: '#', label: 'Facebook' },
                { Icon: Youtube, href: '#', label: 'YouTube' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 bg-[#27272a] rounded-xl flex items-center justify-center text-stone-300 hover:text-[#d4a017] hover:bg-[#d4a017]/20 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-6">{t('footer.quickLinks', 'Quick Links')}</h4>
            <ul className="space-y-3 text-sm">
              {[
                { to: '/shop', label: t('nav.shop', 'Shop All Rice') },
                { to: '/branches', label: 'Parcel Pickup Counters (1,228+)' },
                { to: '/shop?variety=Basmati', label: t('cat.basmati', 'Basmati Rice') },
                { to: '/wholesale', label: t('nav.wholesale', 'Wholesale Inquiry') },
                { to: '/export', label: t('nav.export', 'Export & Trade') },
                { to: '/about', label: t('nav.about', 'Our Mill Story') },
                { to: '/contact', label: t('nav.contact', 'Contact Us') },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-stone-400 hover:text-[#d4a017] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-6">{t('footer.policies', 'Policies')}</h4>
            <ul className="space-y-3 text-sm">
              {[
                { to: '/terms', label: 'Terms & Conditions' },
                { to: '/privacy', label: 'Privacy Policy' },
                { to: '/refund', label: 'Refund & Return Policy' },
                { to: '/shipping', label: 'Shipping Policy' },
                { to: '/faq', label: 'FAQs' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-stone-400 hover:text-[#d4a017] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-6">{t('footer.getInTouch', 'Get In Touch')}</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#d4a017] mt-1 shrink-0" />
                <span className="text-stone-400">
                  Hariharan Traders Rice, Tamil Nadu, India
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#d4a017] shrink-0" />
                <a href="tel:+917810990099" className="text-stone-400 hover:text-white">
                  +91 78109 90099
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#d4a017] shrink-0" />
                <a href="mailto:hariharantradersorders@gmail.com" className="text-stone-400 hover:text-white">
                  hariharantradersorders@gmail.com
                </a>
              </li>
            </ul>

            {/* WhatsApp */}
            <a
              href="https://wa.me/917810990099?text=Hello%2C%20I%20want%20to%20enquire%20about%20your%20rice%20products."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 bg-[#25D366]/15 border border-[#25D366]/40 text-[#4ade80] font-semibold px-4 py-3 rounded-xl hover:bg-[#25D366]/25 transition-all w-full justify-center shadow-sm"
            >
              <MessageCircle className="w-5 h-5" />
              {t('btn.chatWhatsapp', 'Chat on WhatsApp')}
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#27272a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Hariharan Traders Rice. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>FSSAI: 10012345678901</span>
            <span>•</span>
            <span>GST: 03AAAAA0000A1Z5</span>
            <span>•</span>
            <Link to="/admin" className="text-stone-400 hover:text-[#d4a017] transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
