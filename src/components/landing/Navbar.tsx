import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import logo from '../../assets/logo.png';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features', type: 'scroll' },
    { name: 'Pricing', href: '#pricing', type: 'scroll' },
    { name: 'Documentation', href: '/documentation', type: 'link' },
    { name: 'Blog', href: '/blog', type: 'link' },
    { name: 'Contact', href: '/contact', type: 'link' },
  ];

  const handleNavClick = (link: typeof navLinks[0]) => {
    setIsOpen(false);
    if (link.type === 'scroll') {
      const element = document.querySelector(link.href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => {
          const el = document.querySelector(link.href);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      navigate(link.href);
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">

        {/* ✅ PREMIUM GLASSMORPHIC NAVBAR */}
        <nav
          className={`
            relative w-full max-w-6xl
            transition-all duration-700 ease-out
            rounded-full
            border
            ${isScrolled
              ? 'bg-white/30 border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]'
              : 'bg-white/20 border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]'
            }
          `}
          style={{
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          }}
        >
          {/* ✅ Layer 1: Inner glass reflection (top highlight) */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
            style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.2) 100%)',
            }}
          />

          {/* ✅ Layer 2: Glossy top edge highlight */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-full" />

          {/* ✅ Layer 3: Soft green tint glow at bottom */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1/2 w-3/4 bg-gradient-to-t from-green-200/20 to-transparent rounded-full blur-2xl pointer-events-none" />

          {/* ✅ Layer 4: Inner border glow */}
          <div
            className="absolute inset-[1px] rounded-full pointer-events-none"
            style={{
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.5), inset 0 -1px 1px rgba(0,0,0,0.05)',
            }}
          />

          <div className="relative flex justify-between items-center h-14 lg:h-16 px-3 lg:px-5 z-10">

            {/* ✅ LOGO */}
            <Link to="/" className="flex items-center group flex-shrink-0">
              <div className="relative overflow-visible">
                {/* Soft green halo */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/40 to-emerald-400/40 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-150" />
                <img
                  src={logo}
                  alt="WabMeta"
                  className="h-16 w-16 lg:h-20 lg:w-20 object-contain relative z-10
                    transition-all duration-500 ease-out
                    group-hover:scale-110 group-hover:rotate-3
                    drop-shadow-sm
                    group-hover:drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                />
              </div>
            </Link>

            {/* ✅ Desktop Nav Links */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link, index) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link)}
                  className="relative px-4 py-2 text-sm font-medium
                    text-gray-800 hover:text-green-700
                    transition-all duration-500 ease-out group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Hover glass pill */}
                  <span
                    className="absolute inset-0 rounded-full
                      scale-0 group-hover:scale-100
                      transition-transform duration-300 ease-out origin-center
                      border border-white/60"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(240,253,244,0.4) 100%)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6), 0 2px 8px rgba(34,197,94,0.1)',
                    }}
                  />

                  <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5">
                    {link.name}
                  </span>

                  {/* Underline */}
                  <span className="absolute bottom-1 left-1/2 w-0 h-0.5
                    bg-gradient-to-r from-green-500 to-emerald-400
                    group-hover:w-4/5 group-hover:left-[10%]
                    transition-all duration-300 ease-out rounded-full" />
                </button>
              ))}
            </div>

            {/* ✅ Desktop CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-2 flex-shrink-0">

              {/* Login - Glass pill */}
              <Link
                to="/login"
                className="relative text-sm font-semibold
                  px-5 py-2 rounded-full overflow-hidden group
                  border border-white/60
                  text-gray-800
                  hover:text-green-700
                  transition-all duration-300
                  hover:-translate-y-0.5"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 100%)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  boxShadow:
                    'inset 0 1px 1px rgba(255,255,255,0.6), 0 4px 16px rgba(31,38,135,0.08)',
                }}
              >
                {/* Inner gloss */}
                <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-full pointer-events-none" />

                <span className="relative z-10">Login</span>
              </Link>

              {/* Get Started - Premium green glass pill */}
              <Link
                to="/signup"
                className="relative text-white px-5 py-2 rounded-full text-sm font-semibold
                  overflow-hidden group
                  border border-green-400/50
                  transition-all duration-500 ease-out
                  hover:-translate-y-0.5 active:translate-y-0"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(34,197,94,0.95) 0%, rgba(16,185,129,0.95) 100%)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  boxShadow:
                    'inset 0 1px 1px rgba(255,255,255,0.4), 0 8px 24px rgba(34,197,94,0.35), 0 2px 4px rgba(34,197,94,0.2)',
                }}
              >
                {/* Top gloss highlight */}
                <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-full pointer-events-none" />

                {/* Shimmer */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent
                  -translate-x-full group-hover:translate-x-full
                  transition-transform duration-700 ease-out" />

                <span className="relative z-10 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Get Started Free
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Link>
            </div>

            {/* ✅ Mobile Menu Button — Glass */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden relative p-2.5 rounded-full
                border border-white/60
                hover:border-green-300/60
                transition-all duration-300
                flex-shrink-0 overflow-hidden"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow:
                  'inset 0 1px 1px rgba(255,255,255,0.6), 0 4px 12px rgba(31,38,135,0.08)',
              }}
              aria-label="Toggle menu"
            >
              <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-full pointer-events-none" />

              <div className="relative w-5 h-5 z-10">
                <span className={`absolute top-1/2 left-0 w-5 h-0.5 rounded-full bg-gray-800
                  transition-all duration-300 ease-out origin-center
                  ${isOpen ? 'rotate-45 translate-y-0' : '-translate-y-1.5'}`} />
                <span className={`absolute top-1/2 left-0 w-5 h-0.5 rounded-full bg-gray-800
                  transition-all duration-300 ease-out
                  ${isOpen ? 'opacity-0 translate-x-3' : 'opacity-100'}`} />
                <span className={`absolute top-1/2 left-0 w-5 h-0.5 rounded-full bg-gray-800
                  transition-all duration-300 ease-out origin-center
                  ${isOpen ? '-rotate-45 translate-y-0' : 'translate-y-1.5'}`} />
              </div>
            </button>

          </div>
        </nav>
      </div>

      {/* ✅ Mobile Glassmorphic Dropdown */}
      <div className={`
        fixed top-[5rem] left-0 right-0 z-40
        flex justify-center px-4
        transition-all duration-500 ease-out
        ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}
      `}>
        <div
          className="relative w-full max-w-6xl
            rounded-3xl
            border border-white/50
            overflow-hidden
            shadow-[0_20px_60px_-15px_rgba(31,38,135,0.25)]"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(240,253,244,0.3) 100%)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          }}
        >
          {/* Top gloss */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />

          {/* Bottom green glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1/2 w-3/4 bg-gradient-to-t from-green-200/20 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="relative p-4 space-y-1 z-10">
            {navLinks.map((link, index) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link)}
                className="block w-full text-left px-4 py-3
                  rounded-2xl transition-all duration-300 font-medium
                  border border-transparent
                  text-gray-800 hover:text-green-700
                  hover:border-white/60 hover:translate-x-1"
                style={{
                  transitionDelay: isOpen ? `${index * 40}ms` : '0ms',
                  opacity: isOpen ? 1 : 0,
                  transform: isOpen ? 'translateX(0)' : 'translateX(-10px)',
                  transition: `all 0.3s ease-out ${index * 40}ms`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(240,253,244,0.3) 100%)';
                  e.currentTarget.style.backdropFilter = 'blur(10px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.backdropFilter = 'none';
                }}
              >
                <span className="flex items-center justify-between">
                  {link.name}
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </span>
              </button>
            ))}

            {/* Divider */}
            <div className="h-px my-3 bg-gradient-to-r from-transparent via-gray-300/50 to-transparent" />

            {/* Mobile Auth Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="relative text-center px-4 py-3 rounded-2xl transition-all duration-300 font-semibold
                  text-gray-800 border border-white/60
                  hover:text-green-700
                  overflow-hidden"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 100%)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6)',
                }}
              >
                <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-2xl pointer-events-none" />
                <span className="relative z-10">Login</span>
              </Link>

              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                className="relative text-center text-white px-4 py-3 rounded-2xl font-semibold
                  transition-all duration-300
                  border border-green-400/50
                  active:scale-95
                  overflow-hidden
                  flex items-center justify-center gap-1.5"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(34,197,94,0.95) 0%, rgba(16,185,129,0.95) 100%)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  boxShadow:
                    'inset 0 1px 1px rgba(255,255,255,0.4), 0 8px 24px rgba(34,197,94,0.35)',
                }}
              >
                <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-2xl pointer-events-none" />
                <span className="relative z-10 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Get Started
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;