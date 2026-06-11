// src/components/landing/Footer.tsx - COMPLETE FINAL VERSION

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  MessageCircle,
  ArrowRight,
  Heart,
  ExternalLink,
  Building2,
} from 'lucide-react';
import logo from '../../assets/logo.png';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);

  const footerLinks = {
    product: [
      { name: 'Features', href: '#features', type: 'scroll' },
      { name: 'Pricing', href: '#pricing', type: 'scroll' },
      { name: 'Documentation', href: '/documentation', type: 'link' },
      { name: 'Blog', href: '/blog', type: 'link' },
    ],
    company: [
      { name: 'About Us', href: '#team', type: 'scroll' },
      { name: 'Contact', href: '/contact', type: 'link' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy', type: 'link' },
      { name: 'Terms of Service', href: '/terms', type: 'link' },
      { name: 'Data Deletion', href: '/data-deletion', type: 'link' },
    ],
  };

  const contactInfo = {
    whatsapp: '+91 9211938200',
    whatsappLink: 'https://wa.me/919211938200?text=Hi, I have a query about WabMeta!',
    email: 'wabmetacontact@gmail.com',
    location: 'New Delhi, India',
  };

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: contactInfo.whatsappLink,
      color: 'hover:text-green-500 hover:bg-green-500/10',
      hoverBg: 'group-hover:bg-green-500',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: '#',
      color: 'hover:text-blue-500 hover:bg-blue-500/10',
      hoverBg: 'group-hover:bg-blue-500',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      href: '#',
      color: 'hover:text-sky-400 hover:bg-sky-400/10',
      hoverBg: 'group-hover:bg-sky-400',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: '#',
      color: 'hover:text-blue-600 hover:bg-blue-600/10',
      hoverBg: 'group-hover:bg-blue-600',
    },
    {
      name: 'Instagram',
      // ✅ Instagram link updated
      href: 'https://www.instagram.com/wabmeta?igsh=MXNtOXpwYzdhanFleA%3D%3D&utm_source=qr',
      icon: Instagram,
      color: 'hover:text-pink-500 hover:bg-pink-500/10',
      hoverBg: 'group-hover:bg-pink-500',
    },
  ];

  const handleScrollLink = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ✅ Reusable link renderer
  const renderLink = (link: { name: string; href: string; type: string }) => {
    const linkClass = `text-gray-400 hover:text-green-400 transition-all duration-300 text-sm
      flex items-center group hover:translate-x-2`;

    const inner = (
      <>
        <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 
          group-hover:opacity-100 group-hover:translate-x-0 
          transition-all duration-300 text-green-500" />
        <span className="relative">
          {link.name}
          <span className="absolute bottom-0 left-0 w-0 h-px bg-green-500 
            group-hover:w-full transition-all duration-300" />
        </span>
      </>
    );

    if (link.type === 'scroll') {
      return (
        <button onClick={() => handleScrollLink(link.href)} className={linkClass}>
          {inner}
        </button>
      );
    }
    return <Link to={link.href} className={linkClass}>{inner}</Link>;
  };

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 to-gray-950 text-white overflow-hidden">

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/5 
                        rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/5 
                        rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }} />
      </div>

      {/* ============================================ */}
      {/* MAIN FOOTER CONTENT                         */}
      {/* ============================================ */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4 h-16 lg:h-20 overflow-visible group">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-700 scale-150" />
                <img
                  src={logo}
                  alt="WabMeta"
                  style={{ height: '140px', width: '140px', marginTop: '-30px' }}
                  className="lg:!h-[180px] lg:!w-[180px] lg:!mt-[-40px] object-contain relative z-10
                    transition-all duration-500 ease-out
                    group-hover:scale-110 group-hover:rotate-6
                    group-hover:drop-shadow-[0_0_25px_rgba(34,197,94,0.5)]"
                />
              </div>
            </Link>

            <p className="text-gray-400 mb-6 max-w-sm text-sm leading-relaxed
              hover:text-gray-300 transition-colors duration-300">
              Powerful WhatsApp Business API platform for marketing, support, and automation.
              Connect with your customers like never before.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href={contactInfo.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-400 hover:text-green-400 
                  transition-all duration-300 text-sm group hover:translate-x-2"
              >
                <span className="relative mr-3">
                  <Phone className="w-4 h-4 text-green-500 transition-transform 
                    duration-300 group-hover:scale-110 group-hover:rotate-12" />
                  <span className="absolute inset-0 bg-green-500/30 rounded-full blur-md 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </span>
                <span className="group-hover:underline underline-offset-2">
                  {contactInfo.whatsapp}
                </span>
                <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 
                  transition-all duration-300 -translate-x-2 group-hover:translate-x-0" />
              </a>

              <a
                href={`mailto:${contactInfo.email}`}
                className="flex items-center text-gray-400 hover:text-green-400 
                  transition-all duration-300 text-sm group hover:translate-x-2"
              >
                <span className="relative mr-3">
                  <Mail className="w-4 h-4 text-green-500 transition-transform 
                    duration-300 group-hover:scale-110 group-hover:-rotate-12" />
                  <span className="absolute inset-0 bg-green-500/30 rounded-full blur-md 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </span>
                <span className="group-hover:underline underline-offset-2">
                  {contactInfo.email}
                </span>
              </a>

              <div className="flex items-center text-gray-400 text-sm group 
                hover:text-gray-300 transition-colors duration-300">
                <span className="relative mr-3">
                  <MapPin className="w-4 h-4 text-green-500 transition-transform 
                    duration-300 group-hover:scale-110" />
                  <span className="absolute inset-0 bg-green-500/30 rounded-full blur-md 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </span>
                <span>{contactInfo.location}</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-base font-semibold mb-4 relative inline-block">
              Product
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r 
                from-green-500 to-transparent rounded-full" />
            </h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link, index) => (
                <li key={link.name} style={{ animationDelay: `${index * 100}ms` }}>
                  {renderLink(link)}
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-base font-semibold mb-4 relative inline-block">
              Company
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r 
                from-green-500 to-transparent rounded-full" />
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={link.name} style={{ animationDelay: `${index * 100}ms` }}>
                  {renderLink(link)}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-base font-semibold mb-4 relative inline-block">
              Legal
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r 
                from-green-500 to-transparent rounded-full" />
            </h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={link.name} style={{ animationDelay: `${index * 100}ms` }}>
                  {renderLink(link)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* ✅ NEXRON GROUP SECTION                     */}
      {/* ============================================ */}
      <div className="relative border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Powered By Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700/80 to-transparent" />
            <span className="text-[11px] text-gray-500 uppercase tracking-[0.2em] 
                             font-medium px-2 flex-shrink-0">
              Powered By
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700/80 to-transparent" />
          </div>

          {/* Nexron Premium Card */}
          <div className="relative group">
            {/* Animated Border Gradient */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-gray-800 via-blue-500/20 to-gray-800 rounded-[2rem] opacity-50 group-hover:opacity-100 transition-all duration-700" />
            
            {/* Background Glow */}
            <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            <div className="relative bg-[#050505]/75 backdrop-blur-2xl rounded-[1.9rem] p-6 lg:p-10 border border-white/5 overflow-hidden">
              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors duration-700" />

              <div className="flex flex-col lg:flex-row lg:items-center gap-10">
                {/* Left: Company High-Profile */}
                <div className="flex-1 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    {/* Nexron Custom SVG Logo */}
                    <div className="relative flex-shrink-0 w-16 h-16">
                      <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative p-2 bg-gradient-to-br from-gray-950 to-gray-900 rounded-2xl border border-white/10 shadow-2xl group-hover:border-blue-500/30 transition-colors duration-500">
                        <svg viewBox="0 0 120 120" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            <linearGradient id="metalGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                              <stop offset="0%" stopColor="#E2E8F0" />
                              <stop offset="35%" stopColor="#94A3B8" />
                              <stop offset="50%" stopColor="#F8FAFC" />
                              <stop offset="75%" stopColor="#475569" />
                              <stop offset="100%" stopColor="#CBD5E1" />
                            </linearGradient>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur stdDeviation="3" result="blur" />
                              <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                          </defs>
                          {/* N Shape */}
                          <path d="M30 30 L48 30 L60 85 L42 85 Z" fill="url(#metalGrad)" />
                          <path d="M62 30 L80 30 L68 85 L50 85 Z" fill="url(#metalGrad)" />
                          <path d="M30 30 L80 30 L60 55 L10 55 Z" fill="url(#metalGrad)" opacity="0.6" />
                          
                          {/* Orbit Ring */}
                          <path d="M12 60 C 8 45, 112 30, 108 65 C 104 80, 16 85, 12 60 Z" stroke="url(#metalGrad)" strokeWidth="3.5" strokeLinecap="round" />
                          
                          {/* Glowing Dot */}
                          <circle cx="88" cy="38" r="4.5" fill="#60A5FA" filter="url(#glow)" />
                          <circle cx="88" cy="38" r="2" fill="#FFFFFF" />
                        </svg>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="h-px w-4 bg-blue-500/50" />
                        <p className="text-[10px] text-blue-400 uppercase tracking-[0.3em] font-black">
                          Corporate Headquarters
                        </p>
                      </div>
                      <h4 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight group-hover:text-blue-50 transition-colors">
                        NEXRON GROUP <span className="text-blue-500 font-light">PRIVATE LIMITED</span>
                      </h4>
                      <p className="text-gray-400 text-sm mt-1.5 font-medium tracking-wide flex items-center gap-1.5">
                        <span>One Vision.</span>
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        <span className="text-blue-400">Infinite Possibilities.</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Director</p>
                      <p className="text-gray-100 font-bold text-lg tracking-wide">Mirtunjay Thakur</p>
                    </div>
                  </div>
                </div>

                {/* Vertical Divider - Desktop Only */}
                <div className="hidden lg:block w-px h-32 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

                {/* Right: Direct Contact */}
                <div className="lg:w-80 space-y-4">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Direct Contact</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:border-blue-500/20 transition-all duration-300">
                      <div className="p-2.5 bg-blue-500/10 rounded-xl">
                        <MessageCircle className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Availability</p>
                        <p className="text-sm text-gray-200 font-semibold">24/7 Priority Assistance</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* BOTTOM BAR                                  */}
      {/* ============================================ */}
      <div className="relative border-t border-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center 
                          space-y-4 md:space-y-0">

            {/* Copyright */}
            <p className="text-gray-500 text-xs flex items-center gap-1 group">
              © {currentYear} WabMeta. Made with
              <Heart className="w-3.5 h-3.5 text-red-500 mx-1 animate-pulse 
                group-hover:scale-125 transition-transform duration-300" />
              in India
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-1.5">
              {socialLinks.map((social, index) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setHoveredSocial(social.name)}
                  onMouseLeave={() => setHoveredSocial(null)}
                  className={`relative p-2.5 rounded-full text-gray-400 
                    transition-all duration-300 ease-out
                    ${social.color}
                    hover:scale-110 hover:-translate-y-1
                    active:scale-95 group`}
                  title={social.name}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Glow */}
                  <span className={`absolute inset-0 rounded-full opacity-0 
                    group-hover:opacity-100 transition-opacity duration-300
                    ${social.hoverBg} blur-md scale-150`} />

                  {/* Icon */}
                  <social.icon className="w-4 h-4 relative z-10 
                    transition-transform duration-300 group-hover:rotate-12" />

                  {/* Tooltip */}
                  <span className={`absolute -top-8 left-1/2 -translate-x-1/2 
                    px-2 py-1 bg-gray-800 text-white text-[10px] rounded 
                    whitespace-nowrap pointer-events-none
                    transition-all duration-300
                    ${hoveredSocial === social.name
                      ? 'opacity-100 -translate-y-1'
                      : 'opacity-0 translate-y-1'}`}>
                    {social.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-green-500/50 
                      to-transparent" />
    </footer>
  );
};

export default Footer;