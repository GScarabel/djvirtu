import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import { ButtonRipple } from './EnhancedAnimations';

const navLinks = [
  { href: '/#home', label: 'Inicio' },
  { href: '/#about', label: 'Sobre' },
  { href: '/#gallery', label: 'Galeria' },
  { href: '/#videos', label: 'Vídeos' },
  { href: '/#events', label: 'Eventos' },
  { href: '/#contact', label: 'Contato' },
];

export function Navbar() {
  const {} = useSiteSettings();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const prevLocationRef = useRef(location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on location change
  if (location.pathname !== prevLocationRef.current) {
    prevLocationRef.current = location.pathname;
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }

  const handleNavClick = (href: string) => {
    if (href.startsWith('/#')) {
      const id = href.replace('/#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
            <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-[#030014]/95 backdrop-blur-xl shadow-lg shadow-purple-900/10 border-b border-purple-500/10'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Left side - Empty space for balance */}
            <div className="flex items-center">
              <span className="w-10"></span>
            </div>

            {/* Center - Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
              {navLinks.map((link) => (
                <ButtonRipple
                  key={link.href}
                  href={link.href}
                  onClick={(e?: React.MouseEvent<HTMLElement>) => {
                    if (e) e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className="relative px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-full transition-all duration-300" />
                </ButtonRipple>
              ))}
            </div>

            {/* Right side - Location and Mobile menu button */}
            <div className="flex items-center gap-4">

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-10 h-10 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-purple-500/40 transition-all md:hidden"
                aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#030014]/80 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Menu panel */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-[#0a0a1a] border-l border-purple-500/20 z-50 md:hidden"
            >
              <div className="p-6">
                {/* Close button */}
                <div className="flex justify-end mb-8">
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-10 h-10 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    aria-label="Fechar menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation links */}
                <div className="flex flex-col gap-2">
                  {navLinks.map((link, index) => (
                    <ButtonRipple
                      key={link.href}
                      href={link.href}
                      onClick={(e?: React.MouseEvent<HTMLElement>) => {
                        if (e) e.preventDefault();
                        handleNavClick(link.href);
                      }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-purple-500/10 transition-all w-full"
                    >
                      {link.label}
                    </ButtonRipple>
                  ))}
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
