import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, Sparkles, Cake } from 'lucide-react';

interface NavigationProps {
  itemCount: number;
  onCartClick: () => void;
  onNavigate: (section: string) => void;
  currentSection: string;
}

export function Navigation({ itemCount, onCartClick, onNavigate, currentSection }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Início' },
    { id: 'cardapio', label: 'Cardápio' },
    { id: 'sobre', label: 'Sobre' },
    { id: 'contato', label: 'Contato' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'glass-nav shadow-lg' 
            : 'bg-transparent'
        }`}
        style={{ height: 'var(--nav-h)' }}
      >
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <motion.button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF1493] to-[#D4AF37] flex items-center justify-center shadow-glow-sm">
              <Cake className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-[#2D1B2E] hidden sm:block">
              Doce<span className="gradient-text">Aracaju</span>
            </span>
          </motion.button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                  currentSection === link.id
                    ? 'text-[#FF1493] bg-[#FF1493]/10'
                    : 'text-[#2D1B2E]/70 hover:text-[#FF1493] hover:bg-[#FF1493]/5'
                }`}
              >
                {link.label}
                {currentSection === link.id && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-lg bg-[#FF1493]/10 -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Cart & Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <motion.button
              onClick={onCartClick}
              className="relative p-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-[#FF1493]/20 shadow-sm hover:shadow-glow-sm transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart className="w-5 h-5 text-[#FF1493]" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF1493] text-white text-xs font-bold flex items-center justify-center shadow-md"
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-[#FF1493]/20"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-[#FF1493]" />
              ) : (
                <Menu className="w-5 h-5 text-[#FF1493]" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-[var(--nav-h)] z-40 md:hidden"
          >
            <div className="mx-4 mt-2 p-4 rounded-2xl glass-card shadow-xl">
              <div className="flex flex-col gap-2">
                {navLinks.map((link, index) => (
                  <motion.button
                    key={link.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleNavClick(link.id)}
                    className={`px-4 py-3 rounded-xl text-left font-medium transition-colors ${
                      currentSection === link.id
                        ? 'text-[#FF1493] bg-[#FF1493]/10'
                        : 'text-[#2D1B2E]/70 hover:bg-[#FF1493]/5'
                    }`}
                  >
                    {link.label}
                  </motion.button>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-[#FF1493]/10">
                <div className="flex items-center gap-2 text-sm text-[#2D1B2E]/60">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>Doces típicos de Aracaju</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
