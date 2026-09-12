// src/components/layout/Navbar.tsx
import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const totalItems = useCartStore((s) => s.totalItems)();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 60);
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
    { to: '/shop', label: 'Shop' },
    { to: '/wholesale', label: 'Wholesale' },
    { to: '/export', label: 'Export' },
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0a150a]/95 backdrop-blur-md shadow-lg shadow-black/30'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <img
                src="/assets/logo.jpeg"
                alt="Hariharan Traders"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-[#d4a017]/40 group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <div className="font-serif font-bold text-white text-sm sm:text-base md:text-lg leading-tight truncate max-w-[150px] xs:max-w-[190px] sm:max-w-none">
                  Hariharan Traders
                </div>
                <div className="text-[#d4a017] text-[10px] sm:text-xs font-semibold tracking-wider">
                  RICE MILL
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
                    `nav-link ${isActive ? 'active text-[#d4a017]' : ''}`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-gray-300 hover:text-[#d4a017] transition-colors p-2"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link
                to="/cart"
                className="relative text-gray-300 hover:text-[#d4a017] transition-colors p-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#d4a017] text-[#0f1a0f] text-xs font-bold rounded-full flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              <Link
                to={isLoggedIn ? '/account' : '/login'}
                className="text-gray-300 hover:text-[#d4a017] transition-colors p-2"
              >
                <User className="w-5 h-5" />
              </Link>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden text-gray-300 hover:text-[#d4a017] p-2"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar Dropdown */}
        {searchOpen && (
          <div className="bg-[#0a150a]/98 backdrop-blur-lg border-t border-[#2d4a2d] px-4 py-3 shadow-xl">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
              <input
                autoFocus
                type="text"
                placeholder="Search rice varieties, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input flex-1 text-base py-3"
              />
              <button type="submit" className="btn-primary py-3 px-5 shrink-0">
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#0a150a]/98 backdrop-blur-xl border-t border-[#2d4a2d] shadow-2xl animate-in fade-in duration-200">
            <div className="px-5 py-6 space-y-3">
              {navLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block text-lg font-medium py-2.5 px-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#1a2e1a] text-[#d4a017] font-semibold'
                        : 'text-gray-300 hover:text-white hover:bg-[#142314]'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <div className="pt-4 border-t border-[#1f381f] flex gap-3">
                <Link
                  to="/cart"
                  onClick={() => setMenuOpen(false)}
                  className="btn-primary flex-1 justify-center py-3.5 text-base"
                >
                  Cart ({totalItems})
                </Link>
                <Link
                  to={isLoggedIn ? '/account' : '/login'}
                  onClick={() => setMenuOpen(false)}
                  className="btn-secondary flex-1 justify-center py-3.5 text-base"
                >
                  {isLoggedIn ? 'Account' : 'Login'}
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
