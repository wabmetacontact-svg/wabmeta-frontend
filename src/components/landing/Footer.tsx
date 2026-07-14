// src/components/landing/Footer.tsx - PREMIUM UPGRADED VERSION

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
  Shield,
  Clock,
  Award,
  Sparkles,
} from 'lucide-react';
import logo from '../../assets/logo.png';
import nexronLogo from '../../assets/nexron-group-logo.png'; // ✅ Nexron logo

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
      {/* ✅ NEXRON GROUP PREMIUM SECTION (UPGRADED)  */}
      {/* ============================================ */}
      <div className="relative border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Powered By Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700/80 to-transparent" />
            <div className="flex items-center gap-2 px-3">
              <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
              <span className="text-[11px] text-gray-400 uppercase tracking-[0.25em] font-semibold">
                Powered By
              </span>
              <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700/80 to-transparent" />
          </div>

          {/* Nexron Premium Card */}
          <div className="relative group">
            {/* Animated Gradient Border */}
            <div className="absolute -inset-[1.5px] bg-gradient-to-r from-blue-600/40 via-purple-500/30 to-blue-600/40 rounded-[2rem] opacity-50 group-hover:opacity-100 blur-sm transition-all duration-700 animate-gradient-x" />

            {/* Static Border */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/20 via-blue-400/30 to-purple-500/20 rounded-[2rem] opacity-60 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative bg-gradient-to-br from-[#0a0a0f] via-[#050510] to-[#0a0a0f] backdrop-blur-2xl rounded-[1.9rem] p-6 lg:p-10 border border-white/5 overflow-hidden">

              {/* Decorative Grid Pattern */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(rgba(96, 165, 250, 0.5) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(96, 165, 250, 0.5) 1px, transparent 1px)`,
                  backgroundSize: '40px 40px',
                }}
              />

              {/* Corner Glow Effects */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-500/20 transition-colors duration-700" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20 group-hover:bg-purple-500/20 transition-colors duration-700" />

              <div className="relative flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-10">

                {/* Left: Company Info */}
                <div className="flex-1 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5">

                    {/* ✅ NEXRON LOGO - PNG IMAGE */}
                    <div className="relative flex-shrink-0 w-20 h-20 group/logo">
                      {/* Animated Glow Ring */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-400 to-purple-500 blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 rounded-2xl animate-pulse" />

                      {/* Static Glow */}
                      <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/40 to-purple-500/40 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Logo Container */}
                      <div className="relative w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-white/10 shadow-2xl group-hover:border-blue-400/50 transition-all duration-500 flex items-center justify-center p-2 overflow-hidden">
                        {/* Inner shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <img
                          src={nexronLogo}
                          alt="Nexron Group"
                          className="relative w-full h-full object-contain group-hover/logo:scale-110 transition-transform duration-500"
                        />
                      </div>
                    </div>

                    {/* Company Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="h-[2px] w-6 bg-gradient-to-r from-blue-500 to-transparent" />
                        <p className="text-[10px] text-blue-400 uppercase tracking-[0.3em] font-black">
                          Corporate Headquarters
                        </p>
                      </div>

                      <h4 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
                        <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                          NEXRON GROUP
                        </span>
                        <br className="sm:hidden" />
                        <span className="ml-0 sm:ml-2 bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent font-light">
                          PRIVATE LIMITED
                        </span>
                      </h4>

                      <p className="text-gray-400 text-sm mt-2 font-medium tracking-wide flex items-center gap-2">
                        <span className="text-slate-300">One Vision.</span>
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-semibold">
                          Infinite Possibilities.
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Divider with gradient */}
                  <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  {/* Director + Extra Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Director */}
                    <div className="group/info">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
                          Director
                        </p>
                      </div>
                      <p className="text-white font-bold text-lg tracking-wide group-hover/info:text-blue-300 transition-colors">
                        Mirtunjay Thakur
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">Founder & CEO</p>
                    </div>

                    {/* Trust Badge */}
                    <div className="group/info">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
                          Trusted By
                        </p>
                      </div>
                      <p className="text-white font-bold text-lg tracking-wide group-hover/info:text-emerald-300 transition-colors">
                        Enterprise Clients
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">Across India & Beyond</p>
                    </div>
                  </div>
                </div>

                {/* Vertical Divider - Desktop Only */}
                <div className="hidden lg:block w-px h-48 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

                {/* Right: Contact Info Cards */}
                <div className="lg:w-80 space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-[2px] w-6 bg-gradient-to-r from-purple-400 to-transparent" />
                    <p className="text-[10px] text-purple-400 uppercase tracking-[0.3em] font-black">
                      Direct Contact
                    </p>
                  </div>

                  {/* Priority Assistance */}
                  <div className="group/card relative overflow-hidden flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 hover:border-blue-400/50 transition-all duration-300 cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 translate-x-[-100%] group-hover/card:translate-x-[100%] transition-transform duration-1000" />

                    <div className="relative p-2.5 bg-blue-500/20 rounded-xl border border-blue-400/30 group-hover/card:scale-110 transition-transform">
                      <MessageCircle className="w-4 h-4 text-blue-300" />
                    </div>
                    <div className="relative">
                      <p className="text-[9px] text-blue-300/70 uppercase font-black tracking-widest">Availability</p>
                      <p className="text-sm text-white font-bold">24/7 Priority Assistance</p>
                    </div>
                  </div>

                  {/* Enterprise Grade Badge */}
                  <div className="group/card flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-300 cursor-pointer">
                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 group-hover/card:scale-110 transition-transform">
                      <Shield className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Security</p>
                      <p className="text-sm text-gray-200 font-semibold">Enterprise Grade</p>
                    </div>
                  </div>

                  {/* Response Time */}
                  <div className="group/card flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all duration-300 cursor-pointer">
                    <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 group-hover/card:scale-110 transition-transform">
                      <Clock className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Response Time</p>
                      <p className="text-sm text-gray-200 font-semibold">&lt; 1 Hour Guaranteed</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Achievement Bar */}
              <div className="relative mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Certified Business Solution Partner</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-semibold">All Systems Operational</span>
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
                  <span className={`absolute inset-0 rounded-full opacity-0 
                    group-hover:opacity-100 transition-opacity duration-300
                    ${social.hoverBg} blur-md scale-150`} />

                  <social.icon className="w-4 h-4 relative z-10 
                    transition-transform duration-300 group-hover:rotate-12" />

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