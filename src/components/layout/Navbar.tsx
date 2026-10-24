// src/components/layout/Navbar.tsx
import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../store/languageStore';
import LanguageToggle from './LanguageToggle';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const totalItems = useCartStore((s) => s.totalItems)();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { to: '/shop', label: t('nav.shop', 'Shop') },
    { to: '/branches', label: 'Parcel Counters' },
    { to: '/wholesale', label: t('nav.wholesale', 'Wholesale') },
    { to: '/export', label: t('nav.export', 'Export') },
    { to: '/about', label: t('nav.about', 'About Us') },
    { to: '/contact', label: t('nav.contact', 'Contact') },
  ];

  const isHomeTop = location.pathname === '/' && !isScrolled;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isHomeTop
            ? 'bg-transparent text-white'
            : 'bg-white/95 backdrop-blur-md border-b border-[#e8e2d5] text-[#1c1917] shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 md:h-24">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 sm:gap-4 group shrink-0 py-1">
              <img
                src="/assets/logo.jpeg"
                alt="Hariharan Traders"
                className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full object-cover ring-2 sm:ring-[3px] ring-[#d4a017] group-hover:scale-105 transition-transform shadow-md"
              />
              <div className="flex flex-col">
                <div
                  className={`font-serif font-bold text-base sm:text-xl md:text-2xl leading-tight transition-colors ${
                    isHomeTop ? 'text-white' : 'text-[#1c1917]'
                  }`}
                >
                  Hariharan Traders
                </div>
                <div className="text-[#b7860e] text-[11px] sm:text-xs md:text-sm font-bold tracking-wider">
                  RICE • ஆரோக்கியமான வாழ்வு
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `nav-link font-medium transition-colors ${
                      isHomeTop
                        ? isActive
                          ? 'text-[#fce18a] font-bold'
                          : 'text-stone-200 hover:text-[#fce18a]'
                        : isActive
                        ? 'text-[#b7860e] font-bold'
                        : 'text-[#44403c] hover:text-[#b7860e]'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </div>

            {/* Right Icons & Language Toggle */}
            <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-3 shrink-0">
              <LanguageToggle className="hidden sm:inline-flex" />

              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`transition-colors p-1.5 sm:p-1.5 sm:p-1.5 sm:p-1.5 sm:p-2 ${
                  isHomeTop && !menuOpen ? 'text-stone-200 hover:text-[#fce18a]' : 'text-[#57534e] hover:text-[#b7860e]'
                }`}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link
                to="/cart"
                className={`relative transition-colors p-2 ${
                  isHomeTop && !menuOpen ? 'text-stone-200 hover:text-[#fce18a]' : 'text-[#57534e] hover:text-[#b7860e]'
                }`}
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#d4a017] text-[#1c1917] text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              <Link
                to={isLoggedIn ? '/account' : '/login'}
                className={`transition-colors p-2 ${
                  isHomeTop && !menuOpen ? 'text-stone-200 hover:text-[#fce18a]' : 'text-[#57534e] hover:text-[#b7860e]'
                }`}
                aria-label="Account"
              >
                <User className="w-5 h-5" />
              </Link>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`md:hidden p-2 ${
                  isHomeTop && !menuOpen ? 'text-stone-200 hover:text-[#fce18a]' : 'text-[#57534e] hover:text-[#b7860e]'
                }`}
                aria-label="Menu"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar Dropdown */}
        {searchOpen && (
          <div className="bg-white/98 backdrop-blur-lg border-t border-[#e8e2d5] px-4 py-3 shadow-lg">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
              <input
                autoFocus
                type="text"
                placeholder={t('nav.searchPlaceholder', 'Search rice varieties, brands...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input flex-1 text-base py-3"
              />
              <button type="submit" className="btn-primary py-3 px-5 shrink-0">
                {t('nav.searchBtn', 'Search')}
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white/98 backdrop-blur-xl border-t border-[#e8e2d5] shadow-2xl animate-in fade-in duration-200">
            <div className="px-5 py-6 space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-[#e8e2d5]">
                <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Select Language</span>
                <LanguageToggle />
              </div>

              {navLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block text-base font-semibold py-2.5 px-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#fef3c7] text-[#926b09]'
                        : 'text-[#44403c] hover:bg-[#faf8f5] hover:text-[#b7860e]'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <div className="pt-4 border-t border-[#e8e2d5] flex gap-3">
                <Link
                  to="/cart"
                  onClick={() => setMenuOpen(false)}
                  className="btn-primary flex-1 justify-center py-3.5 text-base"
                >
                  {t('nav.cart', 'Cart')} ({totalItems})
                </Link>
                <Link
                  to={isLoggedIn ? '/account' : '/login'}
                  onClick={() => setMenuOpen(false)}
                  className="btn-secondary flex-1 justify-center py-3.5 text-base"
                >
                  {isLoggedIn ? t('nav.account', 'Account') : t('nav.login', 'Login')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
