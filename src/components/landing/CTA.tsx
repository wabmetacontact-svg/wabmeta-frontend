import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, MessageSquare, Sparkles, Zap } from 'lucide-react';

const CTA: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">

      {/* ✅ Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0a0e27] via-[#050816] to-[#050816]">
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ✅ MAIN CTA CARD - interactive spotlight */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          className="relative rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden
            bg-white/[0.04] backdrop-blur-2xl
            border border-white/[0.1]
            shadow-[0_20px_80px_rgba(0,0,0,0.4)]
            p-8 sm:p-12 lg:p-16"
        >
          {/* Vibrant gradient bg */}
          <div className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 70% 60% at 15% 20%, rgba(16, 185, 129, 0.3) 0%, transparent 60%),
                radial-gradient(ellipse 60% 50% at 85% 80%, rgba(59, 130, 246, 0.25) 0%, transparent 60%),
                radial-gradient(ellipse 50% 50% at 50% 50%, rgba(168, 85, 247, 0.15) 0%, transparent 70%)
              `,
            }}
          />

          {/* Spotlight follows mouse */}
          <div
            className="absolute inset-0 transition-opacity duration-300 pointer-events-none opacity-100"
            style={{
              background: `radial-gradient(circle 400px at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.08) 0%, transparent 70%)`,
            }}
          />

          {/* Grid texture */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), 
                                linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
              maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
            }}
          />

          {/* Inner shimmer */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)',
            }}
          />

          {/* Top edge highlight */}
          <div className="absolute top-0 left-[15%] right-[15%] h-px 
            bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          {/* Floating decorative glass cards */}
          <div className="hidden lg:block absolute top-12 right-12 animate-float"
            style={{ animationDelay: '0s' }}>
            <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.15] 
              rounded-2xl p-3 shadow-lg transform rotate-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-white font-mono">8 signed up today</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block absolute bottom-12 left-12 animate-float"
            style={{ animationDelay: '3s' }}>
            <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.15] 
              rounded-2xl p-3 shadow-lg transform -rotate-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span className="text-xs text-white font-mono">No card required</span>
              </div>
            </div>
          </div>

          {/* ✅ MAIN CONTENT */}
          <div className="relative grid grid-cols-12 gap-8 items-center">

            {/* Left: Headline + content */}
            <div className="col-span-12 lg:col-span-8">

              {/* Top tag */}
              <div className="inline-flex items-center gap-3 
                px-4 py-2 rounded-full
                bg-white/[0.08] backdrop-blur-xl
                border border-white/[0.15] mb-8">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                  </span>
                  <span className="text-xs font-mono uppercase tracking-wider text-white">
                    Open for signups
                  </span>
                </div>
              </div>

              {/* Headline */}
              <h2 className="text-4xl sm:text-5xl lg:text-[4.5rem] font-bold 
                leading-[1] tracking-[-0.02em] mb-6">
                <span className="block bg-gradient-to-br from-white via-white to-gray-300 
                  bg-clip-text text-transparent">
                  Stop fighting
                </span>
                <span className="block">
                  <span className="bg-gradient-to-r from-gray-400 to-gray-500 
                    bg-clip-text text-transparent italic font-light">
                    your tools.
                  </span>
                </span>
                <span className="block">
                  <span className="relative inline-block">
                    <span className="relative z-10 bg-gradient-to-r from-green-300 to-emerald-300
                      bg-clip-text text-transparent">
                      Start sending.
                    </span>
                    <span className="absolute bottom-1 sm:bottom-2 left-0 right-0 h-3 sm:h-4 
                      bg-gradient-to-r from-[#FF6B35] to-[#FF8F5E] 
                      -z-0 opacity-70 rounded-sm transform -rotate-1" />
                  </span>
                </span>
              </h2>

              {/* Subtitle */}
              <p className="text-base lg:text-lg text-gray-300 mb-10 max-w-xl leading-relaxed">
                847 businesses already replaced their Excel + sender + chatbot stack with WabMeta. 
                <span className="text-white font-medium"> Your turn.</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">

                {/* Primary */}
                <Link
                  to="/signup"
                  className="group relative inline-flex items-center gap-3 
                    px-8 py-4 rounded-full text-[15px] font-semibold text-white
                    bg-gradient-to-r from-green-500 via-emerald-500 to-green-600
                    shadow-[0_8px_32px_rgba(16,185,129,0.5)]
                    hover:shadow-[0_12px_48px_rgba(16,185,129,0.7)]
                    hover:-translate-y-0.5
                    transition-all duration-500 ease-out
                    border border-green-400/40
                    overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent
                    -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                  <span className="relative z-10 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Start free, no card
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                </Link>

                {/* Secondary */}
                <Link
                  to="/demo"
                  className="group inline-flex items-center gap-3 
                    text-[15px] text-gray-200
                    px-6 py-4 rounded-full
                    bg-white/[0.08] backdrop-blur-xl
                    border border-white/[0.15]
                    hover:bg-white/[0.12] hover:border-white/[0.25]
                    hover:text-white
                    transition-all duration-300"
                >
                  Book a 15-min demo
                  <span className="text-xs font-mono text-gray-500 group-hover:text-gray-400">
                    →
                  </span>
                </Link>
              </div>

              {/* Trust line - editorial */}
              <div className="mt-10 pt-8 border-t border-white/10">
                <div className="grid grid-cols-3 gap-6 lg:gap-8">
                  {[
                    { stat: '2 days', label: 'Free trial' },
                    { stat: '~6 min', label: 'To first send' },
                    { stat: 'Anytime', label: 'Cancel' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="text-xl lg:text-2xl font-bold text-white">
                        {item.stat}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Animated chat preview */}
            <div className="col-span-12 lg:col-span-4 hidden lg:block">
              <div className="relative">

                {/* Phone-like glass frame */}
                <div className="relative mx-auto max-w-[280px]
                  rounded-[2rem] overflow-hidden
                  bg-white/[0.04] backdrop-blur-xl
                  border border-white/[0.15]
                  shadow-[0_20px_60px_rgba(0,0,0,0.4)]
                  transform rotate-3 hover:rotate-0 transition-transform duration-700"
                >
                  {/* Phone header */}
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">WabMeta</div>
                        <div className="text-[10px] text-white/70">online</div>
                      </div>
                    </div>
                  </div>

                  {/* Chat area */}
                  <div className="bg-[#0a0e27]/50 p-4 space-y-3 min-h-[280px]">

                    {/* Message 1 - incoming */}
                    <div className="flex justify-start animate-slideInLeft" 
                      style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-tl-sm 
                        px-3 py-2 max-w-[80%]">
                        <p className="text-xs text-white">Hi! Interested in your product 👀</p>
                        <p className="text-[9px] text-gray-400 mt-1">10:24 AM</p>
                      </div>
                    </div>

                    {/* Message 2 - outgoing */}
                    <div className="flex justify-end animate-slideInRight"
                      style={{ animationDelay: '0.8s', animationFillMode: 'backwards' }}>
                      <div className="bg-green-500/80 backdrop-blur-sm rounded-2xl rounded-tr-sm 
                        px-3 py-2 max-w-[80%]">
                        <p className="text-xs text-white">Welcome! Here's a 10% off code: SAVE10</p>
                        <p className="text-[9px] text-white/70 mt-1 text-right">10:24 AM ✓✓</p>
                      </div>
                    </div>

                    {/* Message 3 - incoming */}
                    <div className="flex justify-start animate-slideInLeft"
                      style={{ animationDelay: '1.6s', animationFillMode: 'backwards' }}>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-tl-sm 
                        px-3 py-2 max-w-[80%]">
                        <p className="text-xs text-white">Just bought! Thanks 🎉</p>
                        <p className="text-[9px] text-gray-400 mt-1">10:25 AM</p>
                      </div>
                    </div>

                    {/* Typing indicator */}
                    <div className="flex justify-start animate-slideInLeft"
                      style={{ animationDelay: '2.4s', animationFillMode: 'backwards' }}>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-tl-sm 
                        px-3 py-2.5">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating notification card */}
                <div className="absolute -top-4 -left-8 animate-float"
                  style={{ animationDelay: '1s' }}>
                  <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.15] 
                    rounded-xl p-2.5 shadow-lg transform -rotate-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-500/30 flex items-center justify-center">
                        <span className="text-[10px]">💰</span>
                      </div>
                      <div>
                        <div className="text-[9px] font-semibold text-white">New sale!</div>
                        <div className="text-[8px] text-gray-400">₹1,299 · 2s ago</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ✅ Honest tagline below card */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            <span className="text-gray-400">P.S.</span> If you hate it, just close the tab. We don't even ask for a card. 
            That's how confident we are.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;