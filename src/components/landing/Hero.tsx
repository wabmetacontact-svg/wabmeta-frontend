import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, Sparkles, MessageSquare, Users, Zap } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen overflow-hidden">

      {/* ✅ ANIMATED GRADIENT BACKGROUND - Glass ke liye zaroori hai */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#0a0f1a]" />

        {/* Animated gradient orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] 
          bg-gradient-to-r from-green-500/20 to-emerald-500/10 
          rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: '8s' }}
        />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] 
          bg-gradient-to-r from-blue-500/15 to-cyan-500/10 
          rounded-full blur-[100px] animate-pulse"
          style={{ animationDuration: '10s', animationDelay: '2s' }}
        />
        <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] 
          bg-gradient-to-r from-purple-500/10 to-pink-500/5 
          rounded-full blur-[100px] animate-pulse"
          style={{ animationDuration: '12s', animationDelay: '4s' }}
        />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />

        {/* Radial light from top center */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] 
          bg-gradient-to-b from-green-500/8 to-transparent rounded-full blur-[80px]" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12 pt-16 pb-20 lg:pt-24 lg:pb-32">

        {/* ✅ TOP LABEL - Glass pill badge */}
        <div className="flex justify-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-3 
            px-5 py-2.5 rounded-full
            bg-white/5 backdrop-blur-xl
            border border-white/10
            shadow-lg shadow-black/10
            hover:bg-white/10 hover:border-white/20
            transition-all duration-500 group cursor-default"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping absolute" />
                <div className="w-2 h-2 bg-green-400 rounded-full relative" />
              </div>
              <span className="text-xs font-mono uppercase tracking-[0.15em] text-gray-400 
                group-hover:text-gray-300 transition-colors">
                Meta Tech Partner
              </span>
            </div>
            <div className="h-3 w-px bg-white/20" />
            <span className="text-xs font-mono text-green-400/80 tracking-wider">
              Est. 2024
            </span>
          </div>
        </div>

        {/* ✅ HEADLINE - Center aligned, premium typography */}
        <div className="text-center max-w-5xl mx-auto mb-8 lg:mb-10">
          <h1 className="text-[2.5rem] sm:text-6xl lg:text-[5rem] xl:text-[5.5rem] 
            leading-[1] tracking-[-0.03em] text-white font-bold">
            WhatsApp Marketing,
            <br className="hidden sm:block" />
            <span className="font-light text-gray-400 italic">
              {' '}without the{' '}
            </span>
            <span className="relative inline-block">
              <span className="relative z-10 text-white">duct tape.</span>
              {/* Orange highlight bar */}
              <span className="absolute bottom-1 sm:bottom-2 left-0 right-0 h-3 sm:h-4 
                bg-gradient-to-r from-[#FF6B35] to-[#FF8F5E] -z-0 opacity-80 rounded-sm
                transform -rotate-1" />
            </span>
          </h1>
        </div>

        {/* ✅ SUBTITLE - Glass card */}
        <div className="flex justify-center mb-10 lg:mb-14">
          <div className="max-w-2xl text-center px-6 py-4 rounded-2xl
            bg-white/[0.03] backdrop-blur-sm border border-white/[0.06]">
            <p className="text-base lg:text-lg text-gray-400 leading-relaxed">
              You're stitching together Excel sheets, third-party senders, and a chatbot that breaks every Tuesday.
              <span className="text-white font-medium"> WabMeta replaces all of it.</span>
            </p>
          </div>
        </div>

        {/* ✅ CTA BUTTONS - Glass styled */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mb-6">

          {/* Primary CTA */}
          <Link
            to="/signup"
            className="group relative inline-flex items-center gap-3 
              bg-gradient-to-r from-green-500 to-emerald-500
              text-white px-8 py-4 rounded-full text-[15px] font-semibold
              shadow-xl shadow-green-500/25
              hover:shadow-2xl hover:shadow-green-500/35
              hover:-translate-y-0.5
              transition-all duration-500 ease-out
              border border-green-400/30
              overflow-hidden"
          >
            {/* Shine sweep */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
              -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            <span className="relative z-10 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Try it free for 2 days
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </span>
          </Link>

          {/* Secondary CTA - Glass pill */}
          <Link
            to="/demo"
            className="group inline-flex items-center gap-2 
              text-[15px] text-gray-300
              px-6 py-4 rounded-full
              bg-white/5 backdrop-blur-xl
              border border-white/10
              hover:bg-white/10 hover:border-white/20
              hover:text-white
              transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center
              group-hover:bg-white/20 transition-colors">
              <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 16 16">
                <path d="M6 3.5a.5.5 0 0 1 .5.3l5 4a.5.5 0 0 1 0 .8l-5 4a.5.5 0 0 1-.8-.4V4a.5.5 0 0 1 .3-.5z"/>
              </svg>
            </div>
            Watch 90-second demo
          </Link>
        </div>

        {/* No card notice */}
        <div className="flex justify-center mb-16 lg:mb-20">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Check className="w-3.5 h-3.5 text-green-400" strokeWidth={3} />
            <span>No card. Cancel by closing the tab.</span>
          </div>
        </div>

        {/* ✅ PRODUCT IMAGE - Glass framed */}
        <div className="relative max-w-5xl mx-auto">

          {/* Glow behind image */}
          <div className="absolute inset-0 -m-8 
            bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-blue-500/10 
            rounded-[2rem] blur-3xl opacity-60" />

          {/* Caption bar - glass */}
          <div className="relative flex items-baseline justify-between mb-3 px-2">
            <span className="text-xs font-mono uppercase tracking-widest text-gray-500">
              Fig. 01 — Campaign Builder
            </span>
            <span className="text-xs font-mono text-gray-600">
              wabmeta.com/app
            </span>
          </div>

          {/* ✅ Image container - Main glass card */}
          <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden
            bg-white/5 backdrop-blur-xl
            border border-white/10
            shadow-2xl shadow-black/30
            p-2 lg:p-3
            group"
          >
            {/* Inner shimmer */}
            <div className="absolute inset-0 rounded-2xl lg:rounded-3xl pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 50%, rgba(255,255,255,0.04) 100%)',
              }}
            />

            {/* Fake browser top bar */}
            <div className="relative flex items-center gap-2 px-4 py-3 
              bg-white/5 rounded-t-xl lg:rounded-t-2xl
              border-b border-white/5 mb-2 lg:mb-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                <div className="w-3 h-3 rounded-full bg-green-400/60" />
              </div>
              <div className="flex-1 mx-8">
                <div className="bg-white/5 rounded-full px-4 py-1.5 text-xs text-gray-500 font-mono text-center
                  border border-white/5 max-w-xs mx-auto">
                  wabmeta.com/dashboard
                </div>
              </div>
            </div>

            {/* ✅ Actual product image */}
            <div className="relative rounded-xl lg:rounded-2xl overflow-hidden">
              <img
                src="/wabmeta onbord img.png"
                alt="WabMeta Campaign Dashboard"
                className="w-full h-auto block rounded-xl lg:rounded-2xl
                  transition-transform duration-700 ease-out
                  group-hover:scale-[1.02]"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              {/* Fallback */}
              <div
                className="hidden aspect-[16/9] items-center justify-center 
                  bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl"
                style={{ display: 'none' }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">📊</div>
                  <span className="text-sm text-gray-500 font-mono">
                    /wabmeta onbord img.png
                  </span>
                </div>
              </div>

              {/* Subtle overlay gradient on image */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent 
                pointer-events-none rounded-xl lg:rounded-2xl" />
            </div>
          </div>

          {/* ✅ Floating annotation - glass card */}
          <div className="absolute -right-2 lg:right-[-40px] -bottom-4 lg:-bottom-6 
            max-w-[220px] hidden lg:block z-10">
            <div className="bg-white/10 backdrop-blur-xl border border-white/15 
              rounded-2xl p-4 shadow-xl shadow-black/20
              transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <svg className="w-8 h-8 text-[#FF6B35] mb-2" viewBox="0 0 48 48" fill="none">
                <path d="M8 8 Q 24 24, 40 40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M40 40 L 32 38 M 40 40 L 38 32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p className="text-sm text-gray-300 italic leading-snug"
                style={{ fontFamily: 'Caveat, cursive' }}>
                Send 1 lakh messages, schedule campaigns, see who actually read them — one screen.
              </p>
            </div>
          </div>
        </div>

        {/* ✅ STATS SECTION - Glass cards grid */}
        <div className="mt-24 lg:mt-32 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[
            {
              icon: <Users className="w-5 h-5" />,
              value: '847',
              label: 'Businesses onboarded',
              color: 'from-green-500/20 to-green-500/5',
              iconColor: 'text-green-400',
              borderColor: 'border-green-500/20 hover:border-green-500/40',
            },
            {
              icon: <MessageSquare className="w-5 h-5" />,
              value: '2.1M',
              label: 'Messages this month',
              color: 'from-blue-500/20 to-blue-500/5',
              iconColor: 'text-blue-400',
              borderColor: 'border-blue-500/20 hover:border-blue-500/40',
            },
            {
              icon: <Zap className="w-5 h-5" />,
              value: '₹0.18',
              label: 'Avg. cost per message',
              color: 'from-amber-500/20 to-amber-500/5',
              iconColor: 'text-amber-400',
              borderColor: 'border-amber-500/20 hover:border-amber-500/40',
            },
            {
              icon: <Sparkles className="w-5 h-5" />,
              value: '4 min',
              label: 'From signup to first send',
              color: 'from-purple-500/20 to-purple-500/5',
              iconColor: 'text-purple-400',
              borderColor: 'border-purple-500/20 hover:border-purple-500/40',
            },
          ].map((stat, index) => (
            <div
              key={index}
              className={`group relative rounded-2xl overflow-hidden
                bg-white/[0.04] backdrop-blur-xl
                border ${stat.borderColor}
                p-6 lg:p-7
                transition-all duration-500 ease-out
                hover:bg-white/[0.08]
                hover:-translate-y-1
                hover:shadow-xl hover:shadow-black/20
                cursor-default`}
            >
              {/* Subtle gradient bg */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 
                group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Inner shimmer */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)',
                }} />

              <div className="relative z-10">
                {/* Icon */}
                <div className={`${stat.iconColor} mb-4 
                  opacity-60 group-hover:opacity-100 
                  transition-all duration-300
                  group-hover:scale-110 transform`}>
                  {stat.icon}
                </div>

                {/* Value */}
                <div className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-1.5
                  group-hover:translate-x-1 transition-transform duration-300">
                  {stat.value}
                </div>

                {/* Label */}
                <div className="text-xs text-gray-500 group-hover:text-gray-400 
                  uppercase tracking-wider transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ FLOATING GLASS DECORATIVE ELEMENTS */}
        {/* Top right floating card */}
        <div className="hidden xl:block absolute top-32 right-8 z-0 animate-float">
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 
            rounded-2xl p-4 shadow-lg transform rotate-6
            hover:rotate-0 transition-transform duration-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <div className="text-xs text-white font-medium">Campaign Sent</div>
                <div className="text-[10px] text-gray-500">12,450 delivered ✓</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom left floating card */}
        <div className="hidden xl:block absolute bottom-48 left-8 z-0 animate-float"
          style={{ animationDelay: '3s' }}>
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 
            rounded-2xl p-4 shadow-lg transform -rotate-3
            hover:rotate-0 transition-transform duration-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="text-xs text-white font-medium">New Lead</div>
                <div className="text-[10px] text-gray-500">+3 contacts today</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Bottom fade - smooth transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 
        bg-gradient-to-t from-[#0a0f1a] to-transparent pointer-events-none" />
    </section>
  );
};

export default Hero;