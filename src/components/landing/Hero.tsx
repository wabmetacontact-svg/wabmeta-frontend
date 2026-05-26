import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare, Bot } from 'lucide-react';
import { useScrollReveal } from './useScrollReveal';

const Hero: React.FC = () => {
  const { ref, visible } = useScrollReveal(0);

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* Subtle BG accent */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px]
        bg-primary-100/40 dark:bg-primary-900/10 rounded-full blur-[120px]
        -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-5 pt-16 lg:pt-24 pb-20 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

          {/* Left */}
          <div className={`space-y-7 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5
              bg-primary-50 dark:bg-primary-950/40 border border-primary-100
              dark:border-primary-800/30 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse-soft" />
              <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
                WhatsApp Business API Platform
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-[2.5rem] sm:text-5xl lg:text-[3.25rem] font-extrabold
              text-gray-900 dark:text-white leading-[1.1] tracking-tight">
              Run campaigns, support,{' '}
              <br className="hidden sm:block" />
              and automation on{' '}
              <span className="gradient-text">WhatsApp</span>
            </h1>

            {/* Sub */}
            <p className="text-base lg:text-lg text-gray-500 dark:text-gray-400
              leading-relaxed max-w-lg">
              WabMeta helps teams manage bulk messaging, live conversations,
              chatbots, and workflows through a single workspace built on
              the official WhatsApp API.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link to="/signup"
                className="group inline-flex items-center gap-2 px-6 py-3
                  bg-primary-600 hover:bg-primary-700 text-white text-sm
                  font-semibold rounded-lg transition-all shadow-sm
                  shadow-primary-600/20 hover:shadow-primary-600/30">
                Start free trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a href="https://wa.me/919211938200?text=Hi, I'd like a demo of WabMeta!"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3
                  bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300
                  text-sm font-semibold rounded-lg border border-gray-200
                  dark:border-white/10 hover:border-gray-300
                  dark:hover:border-white/20 transition-all">
                Book a demo
              </a>
            </div>

            {/* Trust pills */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs
              text-gray-400 dark:text-gray-500">
              {['No credit card needed', '2-day free trial', 'Cancel anytime'].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-primary-400" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — Product Collage */}
          <div className={`relative transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

            {/* Main screen */}
            <div className="relative bg-white dark:bg-[#111118] rounded-2xl
              border border-gray-200 dark:border-white/8 shadow-card overflow-hidden">

              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b
                border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-white/10" />
                </div>
                <div className="flex-1 max-w-[180px] mx-auto h-4 bg-gray-100 dark:bg-white/5 rounded" />
              </div>

              {/* Dashboard content */}
              <div className="p-5 space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Sent today', value: '12,847', change: '+18%' },
                    { label: 'Delivered',  value: '98.2%',  change: '+2.1%' },
                    { label: 'Replies',    value: '3,241',  change: '+34%' },
                  ].map(s => (
                    <div key={s.label} className="p-3 rounded-xl bg-gray-50
                      dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
                      <p className="text-[10px] text-gray-400 font-medium mb-1">{s.label}</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{s.value}</p>
                      <p className="text-[10px] text-primary-600 font-semibold">{s.change}</p>
                    </div>
                  ))}
                </div>

                {/* Chart area */}
                <div className="h-32 rounded-xl bg-gray-50 dark:bg-white/[0.02]
                  border border-gray-100 dark:border-white/5 relative overflow-hidden">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="heroChart" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,120 L0,80 Q50,90 100,55 T200,40 T300,60 T400,25 L400,120 Z" fill="url(#heroChart)" />
                    <path d="M0,80 Q50,90 100,55 T200,40 T300,60 T400,25" fill="none"
                      stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>

                {/* Activity rows */}
                <div className="space-y-2">
                  {[
                    { name: 'Diwali Campaign',      status: 'Delivered', pct: 100 },
                    { name: 'Welcome Sequence',     status: 'Active',    pct: 100 },
                    { name: 'Flash Sale Broadcast', status: 'Sending',   pct: 67  },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg
                      bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        r.pct === 100 ? 'bg-primary-500' : 'bg-amber-400'}`} />
                      <span className="text-xs font-medium text-gray-700
                        dark:text-gray-300 flex-1">{r.name}</span>
                      <span className="text-[10px] text-gray-400 font-medium">{r.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating mini cards */}
            <div className="absolute -top-6 -right-4 z-10 bg-white dark:bg-[#111118]
              rounded-xl border border-gray-200 dark:border-white/8 shadow-card
              p-3 flex items-center gap-3 animate-float">
              <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-950/40
                flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">2.4K</p>
                <p className="text-[10px] text-gray-400">Live chats</p>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-4 z-10 bg-white dark:bg-[#111118]
              rounded-xl border border-gray-200 dark:border-white/8 shadow-card
              p-3 flex items-center gap-3 animate-float"
              style={{ animationDelay: '2s' }}>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40
                flex items-center justify-center">
                <Bot className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">98.5%</p>
                <p className="text-[10px] text-gray-400">Auto-resolved</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;