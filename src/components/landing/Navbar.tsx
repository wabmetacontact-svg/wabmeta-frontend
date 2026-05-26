import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '../../assets/logo.png';

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const links = [
    { label: 'Product',   href: '#product',  type: 'scroll' },
    { label: 'Use Cases', href: '#usecases', type: 'scroll' },
    { label: 'Pricing',   href: '#pricing',  type: 'scroll' },
    { label: 'Docs',      href: '/documentation', type: 'link' },
    { label: 'Contact',   href: '/contact',  type: 'link' },
  ];

  const go = (l: typeof links[0]) => {
    setOpen(false);
    if (l.type === 'scroll') {
      const el = document.querySelector(l.href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else {
        navigate('/');
        setTimeout(() => document.querySelector(l.href)?.scrollIntoView({ behavior: 'smooth' }), 150);
      }
    } else navigate(l.href);
  };

  return (
    <>
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-[#0b0b11]/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/5'
          : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">

          <Link to="/" className="flex-shrink-0">
            <img src={logo} alt="WabMeta" className="h-16 lg:h-20 w-auto object-contain" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map(l => (
              <button key={l.label} onClick={() => go(l)}
                className="text-[13px] font-medium text-gray-600 dark:text-gray-400
                  hover:text-gray-900 dark:hover:text-white transition-colors">
                {l.label}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login" className="text-[13px] font-medium text-gray-600
              dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
              transition-colors px-3 py-2">
              Log in
            </Link>
            <Link to="/signup" className="text-[13px] font-semibold text-white
              bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg
              transition-colors shadow-sm shadow-primary-600/20">
              Start free →
            </Link>
          </div>

          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-gray-600 dark:text-gray-400">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden bg-white dark:bg-[#111118] border-t border-gray-100 dark:border-white/5 px-5 py-4 space-y-1">
            {links.map(l => (
              <button key={l.label} onClick={() => go(l)}
                className="block w-full text-left py-2.5 text-sm font-medium
                  text-gray-700 dark:text-gray-300 hover:text-primary-600
                  dark:hover:text-primary-400 transition-colors">
                {l.label}
              </button>
            ))}
            <div className="pt-3 mt-2 border-t border-gray-100 dark:border-white/5 space-y-2">
              <Link to="/login" onClick={() => setOpen(false)}
                className="block text-center py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                Log in
              </Link>
              <Link to="/signup" onClick={() => setOpen(false)}
                className="block text-center py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg">
                Start free →
              </Link>
            </div>
          </div>
        )}
      </nav>
      <div className="h-16" />
    </>
  );
};

export default Navbar;