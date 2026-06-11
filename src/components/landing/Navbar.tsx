import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from '../common/Logo';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', id: 'features' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Services', id: 'services' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'Team', id: 'team' },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 90; // height of the navbar plus some spacing
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Pill Container */}
        <div 
          className={`flex items-center justify-between gap-4 px-3 py-2 rounded-full transition-all duration-300 ${
            scrolled 
              ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-gray-200/50 border border-gray-200/50' 
              : 'bg-white/40 backdrop-blur-md border border-white/60'
          }`}
        >
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 pl-3">
            <Logo variant="full" theme="light" />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollToSection(link.id)}
                className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:text-gray-955 hover:bg-gray-100/80 text-sm font-medium rounded-full transition-all duration-200 cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              to="/login"
              className="px-5 py-2.5 text-gray-700 hover:text-green-600 hover:bg-green-50/60 border border-transparent hover:border-green-200/50 text-sm font-semibold rounded-full transition-all duration-300 hover:shadow-md hover:shadow-green-500/10 hover:scale-105 active:scale-95 flex items-center justify-center"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-green-500/40 hover:-translate-y-0.5"
            >
              Start Free Trial
              <span className="text-base leading-none">→</span>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden mt-3 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-3xl shadow-xl p-4 animate-fade-in">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => {
                    setMobileOpen(false);
                    setTimeout(() => scrollToSection(link.id), 100);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-2xl text-sm font-medium transition-colors text-left cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
            </div>
            
            <div className="border-t border-gray-200 mt-3 pt-3 flex flex-col gap-2">
              <Link 
                to="/login" 
                onClick={() => setMobileOpen(false)}
                className="text-center py-3 text-sm font-semibold text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                onClick={() => setMobileOpen(false)}
                className="text-center py-3 text-sm font-semibold bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
              >
                Start Free Trial →
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;