import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Menu, X, Sparkles } from 'lucide-react';
import logo from '../../assets/logo.png';

const Navbar: React.FC = () => {
  const [isOpen,     setIsOpen]     = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { name: 'Features',      href: '#features', type: 'scroll' },
    { name: 'Pricing',       href: '#pricing',  type: 'scroll' },
    { name: 'Documentation', href: '/documentation', type: 'link' },
    { name: 'Blog',          href: '/blog',     type: 'link' },
    { name: 'Contact',       href: '/contact',  type: 'link' },
  ];

  const handleNavClick = (link: typeof navLinks[0]) => {
    setIsOpen(false);
    setActiveLink(link.name);
    if (link.type === 'scroll') {
      const el = document.querySelector(link.href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => {
          document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      navigate(link.href);
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/90 dark:bg-[#0a0a0f]/90 backdrop-blur-2xl border-b border-purple-100/50 dark:border-purple-900/30 shadow-lg shadow-purple-500/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">

            {/* ── Logo ─────────────────── */}
            <Link to="/" className="flex items-center -my-2 group flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl
                  opacity-0 group-hover:opacity-100 transition-opacity duration-700 scale-150" />
                <img
                  src={logo}
                  alt="WabMeta"
                  style={{ height: '100px', width: '100px' }}
                  className="lg:!h-[130px] lg:!w-[130px] object-contain relative z-10
                    transition-all duration-500 ease-out
                    group-hover:scale-105 group-hover:rotate-3
                    group-hover:drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                />
              </div>
            </Link>

            {/* ── Desktop Nav ──────────── */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link)}
                  className="relative px-4 py-2 text-sm font-medium text-gray-600
                    dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400
                    transition-colors duration-300 group rounded-xl"
                >
                  {/* Hover pill */}
                  <span className="absolute inset-0 rounded-xl bg-purple-50 dark:bg-purple-950/40
                    scale-0 group-hover:scale-100 transition-transform duration-300
                    ease-out origin-center" />
                  <span className="relative z-10">{link.name}</span>
                  {/* Active dot */}
                  {activeLink === link.name && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2
                      w-1 h-1 rounded-full bg-purple-500" />
                  )}
                </button>
              ))}
            </div>

            {/* ── Desktop CTA ──────────── */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-600 dark:text-gray-300
                  hover:text-purple-600 dark:hover:text-purple-400 px-4 py-2
                  rounded-xl transition-all duration-300 hover:bg-purple-50
                  dark:hover:bg-purple-950/40"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="group relative inline-flex items-center gap-2 px-5 py-2.5
                  rounded-xl text-sm font-semibold text-white overflow-hidden
                  shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50
                  transition-all duration-300 hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed, #6366f1)' }}
              >
                {/* Shine sweep */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent
                  via-white/20 to-transparent -translate-x-full
                  group-hover:translate-x-full transition-transform duration-700" />
                <Sparkles className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Get Started Free</span>
              </Link>
            </div>

            {/* ── Mobile Menu Btn ───────── */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300
                hover:bg-purple-50 dark:hover:bg-purple-950/40
                hover:text-purple-600 transition-all duration-300"
            >
              {isOpen
                ? <X   className="w-6 h-6" />
                : <Menu className="w-6 h-6" />
              }
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ──────────────── */}
        <div className={`lg:hidden overflow-hidden transition-all duration-500 ease-out
          ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="bg-white/95 dark:bg-[#0a0a0f]/95 backdrop-blur-2xl
            border-t border-purple-100/50 dark:border-purple-900/30 px-4 py-4 space-y-1"
          >
            {navLinks.map((link, i) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link)}
                className="flex items-center justify-between w-full px-4 py-3 text-sm
                  font-medium text-gray-700 dark:text-gray-300
                  hover:text-purple-600 dark:hover:text-purple-400
                  hover:bg-purple-50 dark:hover:bg-purple-950/30
                  rounded-xl transition-all duration-300"
                style={{
                  opacity:   isOpen ? 1 : 0,
                  transform: isOpen ? 'translateX(0)' : 'translateX(-16px)',
                  transition: `all 0.3s ease-out ${i * 50}ms`,
                }}
              >
                {link.name}
                <ChevronRight className="w-4 h-4 text-purple-400" />
              </button>
            ))}

            <div className="pt-3 border-t border-purple-100/50 dark:border-purple-900/30
              space-y-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center py-3 text-sm font-medium
                  text-gray-700 dark:text-gray-300
                  hover:bg-purple-50 dark:hover:bg-purple-950/30
                  rounded-xl transition-all duration-300"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center py-3 text-sm font-semibold
                  text-white rounded-xl transition-all duration-300
                  hover:opacity-90 hover:shadow-lg hover:shadow-purple-500/30"
                style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-16 lg:h-20" />
    </>
  );
};

export default Navbar;