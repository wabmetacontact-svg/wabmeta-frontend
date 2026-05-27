import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, Sparkles, MessageSquare, Users, Zap, Play } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen overflow-hidden -mt-[4.5rem] lg:-mt-[5rem] pt-[4.5rem] lg:pt-[5rem]">

      {/* ✅ VIBRANT GRADIENT BACKGROUND */}
      <div className="absolute inset-0 -z-10">

        {/* Main mesh gradient - multi color blend */}
        <div className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 10%, rgba(16, 185, 129, 0.35) 0%, transparent 60%),
              radial-gradient(ellipse 70% 50% at 80% 20%, rgba(59, 130, 246, 0.30) 0%, transparent 55%),
              radial-gradient(ellipse 60% 50% at 50% 60%, rgba(168, 85, 247, 0.25) 0%, transparent 60%),
              radial-gradient(ellipse 80% 60% at 80% 90%, rgba(236, 72, 153, 0.20) 0%, transparent 55%),
              radial-gradient(ellipse 70% 50% at 10% 80%, rgba(34, 197, 94, 0.25) 0%, transparent 60%),
              linear-gradient(135deg, #050816 0%, #0a0e27 35%, #0c1233 70%, #0a0e27 100%)
            `,
          }}
        />

        {/* Animated floating gradient orbs */}
        <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] 
          bg-gradient-to-r from-green-400/30 to-emerald-400/20 
          rounded-full blur-[120px] animate-blob"
        />
        <div className="absolute top-[20%] right-[10%] w-[450px] h-[450px] 
          bg-gradient-to-r from-blue-500/30 to-cyan-400/20 
          rounded-full blur-[120px] animate-blob animation-delay-2000"
        />
        <div className="absolute bottom-[20%] left-[40%] w-[500px] h-[500px] 
          bg-gradient-to-r from-purple-500/25 to-pink-500/15 
          rounded-full blur-[120px] animate-blob animation-delay-4000"
        />
        <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] 
          bg-gradient-to-r from-emerald-500/25 to-teal-400/20 
          rounded-full blur-[100px] animate-blob animation-delay-6000"
        />

        {/* Noise texture for premium feel */}
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E")`,
          }}
        />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          }}
        />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12 pt-16 pb-20 lg:pt-24 lg:pb-32">

        {/* ✅ TOP BADGE - Premium glass pill */}
        <div className="flex justify-center mb-10 lg:mb-14">
          <div className="group inline-flex items-center gap-3 
            px-5 py-2.5 rounded-full
            bg-white/[0.06] backdrop-blur-2xl
            border border-white/[0.12]
            shadow-[0_8px_32px_rgba(0,0,0,0.2)]
            hover:bg-white/[0.1] hover:border-white/[0.2]
            transition-all duration-500 cursor-default
            relative overflow-hidden"
          >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 rounded-full opacity-50"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
              }}
            />

            <div className="relative flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.15em] 
                bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Meta Tech Partner
              </span>
            </div>
            <div className="relative h-3 w-px bg-white/20" />
            <span className="relative text-xs font-mono text-green-300/90 tracking-wider">
              Est. 2024
            </span>
          </div>
        </div>

        {/* ✅ HEADLINE */}
        <div className="text-center max-w-5xl mx-auto mb-8 lg:mb-10">
          <h1 className="text-[2.5rem] sm:text-6xl lg:text-[5rem] xl:text-[5.5rem] 
            leading-[1] tracking-[-0.03em] font-bold">

            <span className="bg-gradient-to-br from-white via-white to-gray-300 
              bg-clip-text text-transparent">
              WhatsApp Marketing,
            </span>
            <br className="hidden sm:block" />

            <span className="font-light italic 
              bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent">
              {' '}without the{' '}
            </span>

            <span className="relative inline-block">
              <span className="relative z-10 
                bg-gradient-to-br from-white via-white to-gray-200 
                bg-clip-text text-transparent">
                duct tape.
              </span>
              {/* Orange highlight bar with glow */}
              <span className="absolute bottom-1 sm:bottom-2 left-0 right-0 h-3 sm:h-4 
                bg-gradient-to-r from-[#FF6B35] via-[#FF8F5E] to-[#FFA07A] 
                -z-0 opacity-90 rounded-sm
                shadow-[0_0_30px_rgba(255,107,53,0.5)]
                transform -rotate-1" />
            </span>
          </h1>
        </div>

        {/* ✅ SUBTITLE GLASS CARD */}
        <div className="flex justify-center mb-10 lg:mb-14">
          <div className="relative max-w-2xl text-center px-7 py-5 rounded-2xl
            bg-white/[0.04] backdrop-blur-xl 
            border border-white/[0.08]
            shadow-[0_8px_32px_rgba(0,0,0,0.15)]
            overflow-hidden">

            {/* Shimmer */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)',
              }}
            />

            <p className="relative text-base lg:text-lg text-gray-300 leading-relaxed">
              You're stitching together Excel sheets, third-party senders, and a chatbot that breaks every Tuesday.
              <span className="text-white font-medium"> WabMeta replaces all of it.</span>
            </p>
          </div>
        </div>

        {/* ✅ CTA BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">

          {/* Primary CTA - vibrant gradient */}
          <Link
            to="/signup"
            className="group relative inline-flex items-center gap-3 
              px-8 py-4 rounded-full text-[15px] font-semibold text-white
              bg-gradient-to-r from-green-500 via-emerald-500 to-green-600
              shadow-[0_8px_32px_rgba(16,185,129,0.4)]
              hover:shadow-[0_12px_40px_rgba(16,185,129,0.6)]
              hover:-translate-y-0.5
              transition-all duration-500 ease-out
              border border-green-400/40
              overflow-hidden"
          >
            {/* Animated glow ring */}
            <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 
              transition-opacity duration-500"
              style={{
                background: 'radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, transparent 70%)',
              }}
            />

            {/* Shine sweep */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent
              -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            <span className="relative z-10 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Try it free for 2 days
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </span>
          </Link>

          {/* Secondary CTA - glass pill */}
          <Link
            to="/demo"
            className="group relative inline-flex items-center gap-3 
              text-[15px] text-gray-200
              px-6 py-4 rounded-full
              bg-white/[0.06] backdrop-blur-2xl
              border border-white/[0.12]
              hover:bg-white/[0.1] hover:border-white/[0.2]
              hover:text-white
              transition-all duration-300
              overflow-hidden"
          >
            <div className="relative w-8 h-8 rounded-full 
              bg-gradient-to-br from-white/20 to-white/5
              flex items-center justify-center
              group-hover:from-white/30 group-hover:to-white/10 transition-all">
              <Play className="w-3 h-3 text-white ml-0.5 fill-white" />
            </div>
            <span className="relative">Watch 90-second demo</span>
          </Link>
        </div>

        {/* Trust line */}
        <div className="flex justify-center mb-16 lg:mb-20">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Check className="w-3.5 h-3.5 text-green-400" strokeWidth={3} />
            <span>No card required. Cancel by closing the tab.</span>
          </div>
        </div>

        {/* ✅ PRODUCT IMAGE - PREMIUM GLASS FRAME */}
        <div className="relative max-w-5xl mx-auto">

          {/* Multi-layer glow behind image */}
          <div className="absolute inset-0 -m-12 
            bg-gradient-to-r from-green-500/20 via-blue-500/15 to-purple-500/20 
            rounded-[3rem] blur-3xl opacity-70 animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          <div className="absolute inset-0 -m-6
            bg-gradient-to-tr from-emerald-500/10 via-transparent to-cyan-500/10 
            rounded-[3rem] blur-2xl"
          />

          {/* Caption bar */}
          <div className="relative flex items-baseline justify-between mb-3 px-2">
            <span className="text-xs font-mono uppercase tracking-widest text-gray-400">
              Fig. 01 — Campaign Builder
            </span>
            <span className="text-xs font-mono text-gray-500">
              wabmeta.com/app
            </span>
          </div>

          {/* ✅ Main glass card */}
          <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden
            bg-white/[0.06] backdrop-blur-2xl
            border border-white/[0.12]
            shadow-[0_20px_60px_rgba(0,0,0,0.4)]
            p-2 lg:p-3
            group"
          >
            {/* Inner glass shimmer */}
            <div className="absolute inset-0 rounded-2xl lg:rounded-3xl pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.06) 100%)',
              }}
            />

            {/* Top edge highlight */}
            <div className="absolute top-0 left-[10%] right-[10%] h-px 
              bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            {/* Browser bar */}
            <div className="relative flex items-center gap-2 px-4 py-3 
              bg-white/[0.04] rounded-t-xl lg:rounded-t-2xl
              border-b border-white/[0.06] mb-2 lg:mb-3
              backdrop-blur-sm">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/70 hover:bg-red-400 transition-colors" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/70 hover:bg-yellow-400 transition-colors" />
                <div className="w-3 h-3 rounded-full bg-green-400/70 hover:bg-green-400 transition-colors" />
              </div>
              <div className="flex-1 mx-8">
                <div className="bg-white/[0.05] rounded-full px-4 py-1.5 text-xs text-gray-400 font-mono text-center
                  border border-white/[0.05] max-w-xs mx-auto">
                  🔒 wabmeta.com/dashboard
                </div>
              </div>
            </div>

            {/* ✅ Product image */}
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
            </div>
          </div>

          {/* Annotation card */}
          <div className="absolute -right-2 lg:right-[-40px] -bottom-4 lg:-bottom-6 
            max-w-[220px] hidden lg:block z-10">
            <div className="relative bg-white/[0.08] backdrop-blur-2xl 
              border border-white/[0.15] 
              rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)]
              transform rotate-2 hover:rotate-0 transition-transform duration-500
              overflow-hidden">

              <div className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%)',
                }}
              />

              <svg className="relative w-8 h-8 text-[#FF6B35] mb-2" viewBox="0 0 48 48" fill="none">
                <path d="M8 8 Q 24 24, 40 40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M40 40 L 32 38 M 40 40 L 38 32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p className="relative text-sm text-gray-200 italic leading-snug"
                style={{ fontFamily: 'Caveat, cursive' }}>
                Send 1 lakh messages, schedule campaigns, see who actually read them — one screen.
              </p>
            </div>
          </div>
        </div>

        {/* ✅ STATS - Premium glass cards */}
        <div className="mt-24 lg:mt-32 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[
            {
              icon: <Users className="w-5 h-5" />,
              value: '847',
              label: 'Businesses onboarded',
              gradient: 'from-green-500/20 via-emerald-500/10 to-transparent',
              iconBg: 'from-green-500/30 to-emerald-500/20',
              iconColor: 'text-green-300',
              borderHover: 'hover:border-green-400/40',
              shadow: 'hover:shadow-green-500/20',
            },
            {
              icon: <MessageSquare className="w-5 h-5" />,
              value: '2.1M',
              label: 'Messages this month',
              gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent',
              iconBg: 'from-blue-500/30 to-cyan-500/20',
              iconColor: 'text-blue-300',
              borderHover: 'hover:border-blue-400/40',
              shadow: 'hover:shadow-blue-500/20',
            },
            {
              icon: <Zap className="w-5 h-5" />,
              value: '₹0.18',
              label: 'Avg. cost per message',
              gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
              iconBg: 'from-amber-500/30 to-orange-500/20',
              iconColor: 'text-amber-300',
              borderHover: 'hover:border-amber-400/40',
              shadow: 'hover:shadow-amber-500/20',
            },
            {
              icon: <Sparkles className="w-5 h-5" />,
              value: '4 min',
              label: 'From signup to first send',
              gradient: 'from-purple-500/20 via-pink-500/10 to-transparent',
              iconBg: 'from-purple-500/30 to-pink-500/20',
              iconColor: 'text-purple-300',
              borderHover: 'hover:border-purple-400/40',
              shadow: 'hover:shadow-purple-500/20',
            },
          ].map((stat, index) => (
            <div
              key={index}
              className={`group relative rounded-2xl overflow-hidden
                bg-white/[0.04] backdrop-blur-2xl
                border border-white/[0.08] ${stat.borderHover}
                p-6 lg:p-7
                transition-all duration-500 ease-out
                hover:bg-white/[0.08]
                hover:-translate-y-1
                hover:shadow-xl ${stat.shadow}
                cursor-default`}
            >
              {/* Gradient bg on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} 
                opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Inner shimmer */}
              <div className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 60%)',
                }}
              />

              <div className="relative z-10">
                {/* Icon with gradient bg */}
                <div className={`w-10 h-10 rounded-xl mb-4 
                  bg-gradient-to-br ${stat.iconBg}
                  flex items-center justify-center ${stat.iconColor}
                  border border-white/10
                  transition-all duration-300
                  group-hover:scale-110 group-hover:rotate-3`}>
                  {stat.icon}
                </div>

                <div className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-1.5
                  group-hover:translate-x-1 transition-transform duration-300">
                  {stat.value}
                </div>

                <div className="text-xs text-gray-400 group-hover:text-gray-300 
                  uppercase tracking-wider transition-colors duration-300 font-medium">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating decorative cards */}
        <div className="hidden xl:block absolute top-40 right-12 z-0 animate-float">
          <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] 
            rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.2)] transform rotate-6
            hover:rotate-0 transition-transform duration-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/20 
                flex items-center justify-center border border-green-400/20">
                <MessageSquare className="w-4 h-4 text-green-300" />
              </div>
              <div>
                <div className="text-xs text-white font-medium">Campaign Sent</div>
                <div className="text-[10px] text-gray-400">12,450 delivered ✓</div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden xl:block absolute bottom-56 left-12 z-0 animate-float"
          style={{ animationDelay: '3s' }}>
          <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] 
            rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.2)] transform -rotate-3
            hover:rotate-0 transition-transform duration-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/20 
                flex items-center justify-center border border-blue-400/20">
                <Users className="w-4 h-4 text-blue-300" />
              </div>
              <div>
                <div className="text-xs text-white font-medium">New Lead</div>
                <div className="text-[10px] text-gray-400">+3 contacts today</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;