import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, MessageCircle, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', hasDropdown: true },
    { label: 'Solutions', hasDropdown: true },
    { label: 'Resources', hasDropdown: true },
    { label: 'Pricing', hasDropdown: false },
    { label: 'Company', hasDropdown: true },
  ];

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
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-sm">
              <MessageCircle size={18} className="text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-gray-900 tracking-tight">
              WabMeta
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 text-sm font-medium rounded-full transition-all duration-200"
              >
                {link.label}
                {link.hasDropdown && <ChevronDown size={14} className="opacity-60" />}
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors"
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
            className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
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
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-2xl text-sm font-medium transition-colors"
                >
                  {link.label}
                  {link.hasDropdown && <ChevronDown size={14} />}
                </button>
              ))}
            </div>
            
            <div className="border-t border-gray-200 mt-3 pt-3 flex flex-col gap-2">
              <Link 
                to="/login" 
                onClick={() => setMobileOpen(false)}
                className="text-center py-3 text-sm font-medium text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50"
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