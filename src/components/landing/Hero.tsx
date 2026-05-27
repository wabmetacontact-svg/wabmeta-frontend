import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-[#FAFAF7] dark:bg-[#0F0F0E] overflow-hidden border-b border-gray-200 dark:border-gray-800">
      {/* Subtle grid texture — barely visible */}
      <div 
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12 pt-12 pb-20 lg:pt-20 lg:pb-32">
        
        {/* Tiny top label — no fancy badge */}
        <div className="flex items-center gap-3 mb-12 lg:mb-20">
          <div className="h-px w-12 bg-gray-400 dark:bg-gray-600" />
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
            Meta Tech Partner · Est. 2024
          </span>
        </div>

        {/* Headline — asymmetric, breaks the grid */}
        <div className="grid grid-cols-12 gap-6 items-end mb-16 lg:mb-24">
          
          <div className="col-span-12 lg:col-span-8">
            <h1 className="font-serif text-[2.75rem] sm:text-6xl lg:text-[5.5rem] leading-[0.95] tracking-[-0.03em] text-gray-900 dark:text-white">
              WhatsApp Marketing,
              <br />
              <span className="italic font-light text-gray-700 dark:text-gray-300">
                without the
              </span>
              <span className="relative inline-block ml-3">
                <span className="relative z-10">duct tape.</span>
                <span className="absolute bottom-2 left-0 right-0 h-3 bg-[#FF6B35] -z-0 opacity-90" />
              </span>
            </h1>
          </div>

          <div className="col-span-12 lg:col-span-4 lg:pb-4">
            <p className="text-base lg:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm">
              You're stitching together Excel sheets, third-party senders, and a chatbot that breaks every Tuesday. 
              <span className="text-gray-900 dark:text-white font-medium"> WabMeta replaces all of it.</span>
            </p>
          </div>
        </div>

        {/* CTA row — minimal, no shadow, no gradient */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-20 lg:mb-28">
          <Link
            to="/signup"
            className="group inline-flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-7 py-4 text-[15px] font-medium hover:bg-[#1B7A3E] dark:hover:bg-[#1B7A3E] dark:hover:text-white transition-colors duration-200"
          >
            <span>Try it free for 2 days</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>

          <Link
            to="/demo"
            className="inline-flex items-center gap-2 text-[15px] text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border-b border-gray-300 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white pb-0.5 transition-colors"
          >
            Or watch a 90-second demo
          </Link>

          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 sm:ml-auto">
            <Check className="w-3.5 h-3.5 text-[#1B7A3E]" strokeWidth={3} />
            <span>No card. Cancel by closing the tab.</span>
          </div>
        </div>

        {/* Product reveal — one real screenshot, framed editorially */}
        <div className="relative">
          
          {/* Caption above the screenshot — like a magazine */}
          <div className="flex items-baseline justify-between mb-4 pb-3 border-b border-gray-300 dark:border-gray-700">
            <span className="text-xs font-mono uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Fig. 01 — Campaign Builder
            </span>
            <span className="text-xs font-mono text-gray-400 dark:text-gray-600">
              wabmeta.com/app
            </span>
          </div>

          {/* The actual product screenshot wrapper */}
          <div className="relative bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 overflow-hidden">
            {/* TODO: Replace with real screenshot */}
            <img 
              src="/dashboard-real.png" 
              alt="WabMeta Campaign Dashboard"
              className="w-full h-auto block"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            {/* Fallback if image missing */}
            <div 
              className="hidden aspect-[16/9] items-center justify-center bg-gray-50 dark:bg-gray-900"
              style={{ display: 'none' }}
            >
              <span className="text-sm text-gray-400 font-mono">[ Replace with real /dashboard-real.png ]</span>
            </div>
          </div>

          {/* Annotation — handwritten feel */}
          <div className="absolute -right-2 lg:right-8 -bottom-6 lg:-bottom-8 max-w-[200px] hidden lg:block">
            <svg className="w-12 h-12 text-[#FF6B35] mb-1" viewBox="0 0 48 48" fill="none">
              <path d="M8 8 Q 24 24, 40 40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M40 40 L 32 38 M 40 40 L 38 32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-snug" style={{ fontFamily: 'Caveat, cursive' }}>
              Send 1 lakh messages, schedule campaigns, see who actually read them — one screen.
            </p>
          </div>
        </div>

        {/* Bottom strip — honest social proof */}
        <div className="mt-32 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 pt-10 border-t border-gray-300 dark:border-gray-700">
          <div>
            <div className="text-3xl lg:text-4xl font-serif text-gray-900 dark:text-white tracking-tight">
              847
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
              Businesses onboarded
            </div>
          </div>
          
          <div>
            <div className="text-3xl lg:text-4xl font-serif text-gray-900 dark:text-white tracking-tight">
              2.1M
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
              Messages this month
            </div>
          </div>
          
          <div>
            <div className="text-3xl lg:text-4xl font-serif text-gray-900 dark:text-white tracking-tight">
              ₹0.18
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
              Avg. cost per message
            </div>
          </div>
          
          <div>
            <div className="text-3xl lg:text-4xl font-serif text-gray-900 dark:text-white tracking-tight">
              4 min
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
              From signup to first send
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;