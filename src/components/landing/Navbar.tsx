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

        {/* ✅ Light Glassmorphic Floating Navbar */}
        <nav
          className={`
            relative w-full max-w-6xl
            transition-all duration-500 ease-in-out
            rounded-full
            ${isScrolled
              ? 'bg-white/80 backdrop-blur-2xl border border-gray-200/80 shadow-xl shadow-green-500/5'
              : 'bg-white/60 backdrop-blur-xl border border-white/60 shadow-lg shadow-gray-200/30'
            }
          `}
          style={{
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          {/* ✅ Subtle shimmer overlay */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(240,253,244,0.2) 50%, rgba(255,255,255,0.4) 100%)',
            }}
          />

          {/* ✅ Subtle top highlight line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-green-200/60 to-transparent rounded-full" />

          <div className="relative flex justify-between items-center h-14 lg:h-16 px-3 lg:px-5">

            {/* ✅ LOGO */}
            <Link to="/" className="flex items-center group flex-shrink-0">
              <div className="relative overflow-visible">
                <div className="absolute inset-0 bg-green-400/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-150" />
                <img
                  src={logo}
                  alt="WabMeta"
                  className="h-16 w-16 lg:h-20 lg:w-20 object-contain relative z-10
                    transition-all duration-500 ease-out
                    group-hover:scale-110 group-hover:rotate-3
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
                    text-gray-700 hover:text-green-600
                    transition-all duration-500 ease-out group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Hover bg pill */}
                  <span className="absolute inset-0 rounded-full
                    scale-0 group-hover:scale-100
                    transition-transform duration-300 ease-out origin-center
                    bg-green-50 border border-green-100" />

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

              {/* Login - clean ghost button */}
              <Link
                to="/login"
                className="relative text-sm font-semibold
                  px-5 py-2 rounded-full overflow-hidden group
                  border border-gray-200 bg-white
                  text-gray-700
                  hover:border-green-300 hover:text-green-700
                  hover:bg-green-50/50
                  transition-all duration-300
                  shadow-sm hover:shadow-md hover:shadow-green-500/10"
              >
                <span className="relative z-10">Login</span>
              </Link>

              {/* Get Started - solid green pill */}
              <Link
                to="/signup"
                className="relative bg-gradient-to-r from-green-500 to-emerald-500
                  text-white px-5 py-2 rounded-full text-sm font-semibold
                  overflow-hidden group
                  shadow-lg shadow-green-500/30
                  hover:shadow-xl hover:shadow-green-500/40
                  transition-all duration-500 ease-out
                  hover:-translate-y-0.5 active:translate-y-0
                  border border-green-400/30"
              >
                {/* Shimmer effect */}
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

            {/* ✅ Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2.5 rounded-full
                bg-white border border-gray-200
                hover:bg-green-50 hover:border-green-300
                transition-all duration-300
                flex-shrink-0 shadow-sm"
              aria-label="Toggle menu"
            >
              <div className="relative w-5 h-5">
                <span className={`absolute top-1/2 left-0 w-5 h-0.5 rounded-full bg-gray-700
                  transition-all duration-300 ease-out origin-center
                  ${isOpen ? 'rotate-45 translate-y-0' : '-translate-y-1.5'}`} />
                <span className={`absolute top-1/2 left-0 w-5 h-0.5 rounded-full bg-gray-700
                  transition-all duration-300 ease-out
                  ${isOpen ? 'opacity-0 translate-x-3' : 'opacity-100'}`} />
                <span className={`absolute top-1/2 left-0 w-5 h-0.5 rounded-full bg-gray-700
                  transition-all duration-300 ease-out origin-center
                  ${isOpen ? '-rotate-45 translate-y-0' : 'translate-y-1.5'}`} />
              </div>
            </button>

          </div>
        </nav>
      </div>

      {/* ✅ Mobile Dropdown */}
      <div className={`
        fixed top-[5rem] left-0 right-0 z-40
        flex justify-center px-4
        transition-all duration-500 ease-out
        ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}
      `}>
        <div
          className="relative w-full max-w-6xl
            rounded-3xl
            bg-white/95 backdrop-blur-2xl
            border border-gray-200/80 overflow-hidden
            shadow-2xl shadow-green-500/10"
          style={{ WebkitBackdropFilter: 'blur(24px)' }}
        >
          {/* Subtle gradient overlay */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background:
                'linear-gradient(135deg, rgba(240,253,244,0.6) 0%, rgba(255,255,255,0.2) 100%)',
            }}
          />

          {/* Top highlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-green-300/60 to-transparent" />

          <div className="relative p-4 space-y-1">
            {navLinks.map((link, index) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link)}
                className="block w-full text-left px-4 py-3
                  rounded-2xl transition-all duration-300 font-medium
                  border border-transparent
                  text-gray-700 hover:bg-green-50 hover:text-green-700
                  hover:border-green-100 hover:translate-x-1"
                style={{
                  transitionDelay: isOpen ? `${index * 40}ms` : '0ms',
                  opacity: isOpen ? 1 : 0,
                  transform: isOpen ? 'translateX(0)' : 'translateX(-10px)',
                  transition: `all 0.3s ease-out ${index * 40}ms`,
                }}
              >
                <span className="flex items-center justify-between">
                  {link.name}
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </span>
              </button>
            ))}

            {/* Divider */}
            <div className="h-px my-3 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Mobile Auth Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="text-center px-4 py-3 rounded-2xl transition-all duration-300 font-semibold
                  text-gray-700 bg-white border border-gray-200
                  hover:bg-green-50 hover:border-green-300 hover:text-green-700
                  shadow-sm"
              >
                Login
              </Link>

              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                className="text-center bg-gradient-to-r from-green-500 to-emerald-500
                  hover:from-green-600 hover:to-emerald-600
                  text-white px-4 py-3 rounded-2xl font-semibold
                  transition-all duration-300
                  shadow-lg shadow-green-500/30
                  hover:shadow-xl hover:shadow-green-500/40
                  border border-green-400/40
                  active:scale-95
                  flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;