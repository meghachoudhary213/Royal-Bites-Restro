import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, Crown, ShoppingBag, User, LogOut, History, ChevronDown, Sun, Moon } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/rooms', label: 'Rooms' },
  { href: '/menu', label: 'Royal Bites' },
  { href: '/spa', label: 'Spa' },
  { href: '/events', label: 'Events' },
  { href: '/offers', label: 'Offers' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar({ 
  cartCount = 0, 
  onOpenCart, 
  currentUser, 
  onLogout, 
  onOpenAuth, 
  onOpenProfile, 
  onOpenOrders,
  onSelectCategory,
  onItemClick,
  theme,
  toggleTheme
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'py-3' : 'py-5'
      }`}
    >
      <div
        className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-500 relative ${
          scrolled ? 'glass-strong rounded-2xl' : 'glass rounded-3xl'
        }`}
      >
        <div className="flex items-center justify-between h-14 md:h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-sunset to-gold group-hover:scale-110 transition-transform">
              <Crown className="w-5 h-5 text-cream" />
            </div>
            <span className="font-display text-sm sm:text-lg md:text-xl font-bold text-gradient">
              Royal Grand Hotel & Resort
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`transition-colors text-sm font-semibold tracking-wide ${
                    isActive 
                      ? 'text-sunset dark:text-gold font-bold' 
                      : 'text-cream/80 hover:text-sunset dark:hover:text-gold'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            

            {/* Desktop Auth Section */}
            {currentUser ? (
              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-white/15 text-cream transition-all duration-300 cursor-pointer"
                >
                  <User className="w-4 h-4 text-gold" />
                  <span className="text-sm font-medium">{currentUser.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 rounded-2xl glass-strong border border-white/20 shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <Link
                    to="/dashboard?tab=profile"
                    className="w-full text-left px-4 py-2 text-sm text-cream/80 hover:bg-white/10 hover:text-gold transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-4.5 h-4.5 text-gold" />
                    Profile
                  </Link>
                  <Link
                    to="/dashboard?tab=bookings"
                    className="w-full text-left px-4 py-2 text-sm text-cream/80 hover:bg-white/10 hover:text-gold transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <History className="w-4.5 h-4.5 text-sunset" />
                    My Bookings
                  </Link>
                  <div className="border-t border-white/5 my-1" />
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-sm text-pink hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-sunset text-cream hover:text-white transition-all duration-300 font-semibold text-xs border border-cream/20 hover:border-sunset cursor-pointer"
              >
                Login
              </button>
            )}

            {/* Desktop Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl glass hover:bg-white/15 text-cream transition-all duration-300 flex items-center justify-center cursor-pointer"
              aria-label="Toggle dark/light mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-gold" /> : <Moon className="w-5 h-5 text-gold" />}
            </button>

            {/* Desktop Cart Button */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl glass hover:bg-white/15 text-cream transition-all duration-300 flex items-center justify-center cursor-pointer"
              aria-label="Open cart"
            >
              <ShoppingBag className="w-5 h-5 text-gold" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-sunset text-navy text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-navy shadow">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Book Now Button */}
            <Link
              to="/booking"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sunset to-sunset-dark text-white hover:opacity-90 font-bold text-xs transition-all duration-300 shadow-md shadow-sunset/25 hover:shadow-sunset/40 hover:-translate-y-0.5"
            >
              Book Now
            </Link>
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            {/* Mobile Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl glass text-cream flex items-center justify-center cursor-pointer"
              aria-label="Toggle dark/light mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-gold" /> : <Moon className="w-5 h-5 text-gold" />}
            </button>

            {/* Mobile Cart Button */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2 rounded-xl glass text-cream flex items-center justify-center"
              aria-label="Open cart"
            >
              <ShoppingBag className="w-5 h-5 text-gold" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-sunset text-navy text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-navy shadow">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              className="p-2 rounded-xl glass text-cream"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden pb-4 border-t border-white/10 mt-2 pt-4 space-y-3">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block py-2 transition-colors font-semibold ${
                    isActive 
                      ? 'text-sunset dark:text-gold font-bold' 
                      : 'text-cream/90 hover:text-sunset dark:hover:text-gold'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}


            {/* Mobile Auth options */}
            {currentUser ? (
              <div className="space-y-1 pt-3 border-t border-white/10 mt-3">
                <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-gold">
                  Account: {currentUser.name}
                </div>
                <Link
                  to="/dashboard?tab=profile"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-left block py-2 text-cream/90 hover:text-gold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4 text-gold" />
                  Profile Details
                </Link>
                <Link
                  to="/dashboard?tab=bookings"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-left block py-2 text-cream/90 hover:text-gold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <History className="w-4 h-4 text-sunset" />
                  My Bookings
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left block py-2 text-pink hover:text-pink-soft transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenAuth();
                }}
                className="w-full text-center block py-2.5 rounded-xl bg-white/10 hover:bg-sunset text-cream hover:text-white transition-all duration-300 font-semibold text-xs mt-3 cursor-pointer border border-cream/20 hover:border-sunset"
              >
                Login / Register
              </button>
            )}

            {/* Mobile Book Now CTA */}
            <Link
              to="/booking"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-sunset to-sunset-dark text-white font-bold text-xs mt-3 shadow-lg"
            >
              Book Now
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
