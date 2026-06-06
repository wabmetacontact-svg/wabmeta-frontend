import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, MessageCircle } from 'lucide-react';

const ChatSimulator = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 6);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-[320px] rounded-2xl bg-white border border-slate-200/80 shadow-xl overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center font-bold text-[#2883CF] text-sm border border-blue-100">
            WM
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">WabMeta Auto-Responder</h4>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-slate-500 font-semibold">Online</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-3 h-[280px] bg-slate-50/20 overflow-y-auto flex flex-col justify-end">
        {step >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="self-start max-w-[80%] rounded-2xl rounded-tl-none bg-white p-3 text-xs text-slate-700 shadow-sm border border-slate-100"
          >
            Hi! Can I schedule a product demo?
          </motion.div>
        )}
        {step >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="self-end max-w-[80%] rounded-2xl rounded-tr-none bg-[#2883CF] p-3 text-xs text-white shadow-sm font-medium"
          >
            Absolutely! Click a time below to book a live demo:
          </motion.div>
        )}
        {step >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="self-end flex gap-2"
          >
            <button className={`px-3 py-1.5 rounded-full border text-[10px] font-bold transition-all ${step >= 4 ? 'bg-[#2883CF] border-[#2883CF] text-white shadow-sm' : 'bg-white border-slate-200 text-[#2883CF]'}`}>
              Today at 3:00 PM
            </button>
            {step < 4 && (
              <button className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-500 text-[10px] font-bold">
                Tomorrow
              </button>
            )}
          </motion.div>
        )}
        {step >= 4 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="self-start max-w-[80%] rounded-2xl rounded-tl-none bg-white p-3 text-xs text-slate-700 shadow-sm border border-slate-100"
          >
            Today at 3:00 PM works great!
          </motion.div>
        )}
        {step >= 5 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="self-end max-w-[80%] rounded-2xl rounded-tr-none bg-[#2883CF] p-3 text-xs text-white shadow-sm font-medium"
          >
            Confirmed! 🎉 A calendar invite has been sent to your email. See you soon!
          </motion.div>
        )}
      </div>
    </div>
  );
};

const Hero = () => {
  return (
    <section
      className="relative overflow-hidden bg-slate-50/60 border-b border-slate-200/50 pt-28 pb-20 lg:pt-36 lg:pb-28"
      style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, #e2e8f0 1.5px, transparent 0)',
        backgroundSize: '28px 28px',
      }}
    >
      {/* Editorial Structural Layout Border Lines */}
      <div className="absolute top-0 bottom-0 left-[calc(50%-100px)] w-px bg-slate-200/40 hidden lg:block pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-12 w-px bg-slate-200/40 hidden xl:block pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12">
          {/* LEFT: Text content */}
          <div className="text-center lg:text-left lg:col-span-6">
            {/* Top badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1e3a5f] shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#2883CF]" />
              Official Meta Business Partner
            </motion.div>

            {/* Heading */}
            <h1 className="mt-8 text-4xl font-black leading-[1.08] tracking-tight text-[#0f2540] sm:text-5xl lg:text-6xl">
              Grow Your Business with{' '}
              <span className="relative inline-block text-[#2883CF] underline decoration-wavy decoration-[#2883CF]/20 underline-offset-8">
                WhatsApp
              </span>{' '}
              Automation
            </h1>

            {/* Sub heading */}
            <p className="mt-8 text-base leading-relaxed text-slate-600 sm:text-lg">
              Send bulk campaigns, automate replies, manage conversations, and
              track performance — all from one powerful{' '}
              <span className="font-semibold text-[#1e3a5f] border-b-2 border-[#2883CF]/20 pb-0.5">
                WhatsApp Cloud API
              </span>{' '}
              platform built for modern teams.
            </p>

            {/* Feature pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
              {[
                { label: 'No-Code Setup' },
                { label: 'Real-Time Inbox' },
                { label: 'Meta Verified' },
              ].map((item, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-md border border-slate-200/80 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm"
                >
                  {item.label}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <Link
                to="/signup"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2883CF] px-8 py-4 text-sm font-bold text-white shadow-md shadow-blue-500/10 transition-all hover:bg-[#1d70b8] hover:shadow-lg sm:w-auto"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-8 py-4 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
              >
                <MessageCircle className="h-4 w-4 text-slate-400" />
                Book a Demo
              </Link>
            </div>

            {/* Trust line */}
            <div className="mt-12 flex flex-col gap-3 border-t border-slate-200/60 pt-8 sm:flex-row sm:items-center sm:gap-6 lg:justify-start">
              <div className="flex -space-x-1.5 justify-center lg:justify-start">
                {['#2883CF', '#1e3a5f', '#38bdf8', '#0284c7'].map((c, i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 shadow-sm ring-1 ring-slate-100"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div className="text-sm text-slate-500">
                <p className="font-bold text-slate-800">Trusted by over 10,000+ businesses</p>
                <p className="text-xs">Seamless Meta API integrations worldwide</p>
              </div>
            </div>
          </div>

          {/* RIGHT: Visual Mockups Canvas */}
          <div className="relative flex items-center justify-center p-4 lg:p-8 lg:col-span-6">
            {/* The flow connection lines in the background */}
            <div className="absolute inset-0 pointer-events-none hidden md:block">
              <svg className="w-full h-full" fill="none">
                <path
                  d="M 50, 120 C 120, 80 200, 60 250, 100"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.8"
                />
                <path
                  d="M 120, 360 C 220, 340 250, 280 280, 240"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.8"
                />
              </svg>
            </div>

            {/* Main Interactive Elements Group */}
            <div className="relative z-10 w-full max-w-[420px] lg:max-w-none lg:w-auto">
              
              {/* Trigger Flow Node */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute -top-10 -left-6 bg-white border border-slate-200 rounded-xl p-3 shadow-lg z-20 flex items-center gap-2.5 max-w-[190px]"
              >
                <div className="h-6 w-6 rounded-full bg-blue-50 flex items-center justify-center text-xs text-[#2883CF] font-bold border border-blue-100">
                  ⚡
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold leading-none">Trigger</p>
                  <p className="text-[11px] font-bold text-slate-700 mt-1">Keyword is "demo"</p>
                </div>
              </motion.div>

              {/* Central WhatsApp Simulator Frame */}
              <div className="relative mx-auto bg-slate-100/40 p-4 rounded-[28px] border border-slate-200/50 backdrop-blur-sm shadow-inner">
                <ChatSimulator />
              </div>

              {/* Stats Widget */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-8 -right-6 w-[200px] rounded-xl border border-slate-200 bg-white p-4 shadow-xl z-20 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Campaign Stats</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-[#0f2540] tracking-tight">98.7%</span>
                  <span className="text-[10px] text-emerald-600 font-bold">▲ 1.4%</span>
                </div>
                <p className="text-[10px] text-slate-500 font-semibold leading-none">Delivery Success Rate</p>
                <svg className="w-full h-8 mt-1.5" viewBox="0 0 100 30" fill="none">
                  <path
                    d="M0,25 Q15,10 30,20 T60,5 T90,15 L100,10"
                    stroke="#2883CF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0,25 Q15,10 30,20 T60,5 T90,15 L100,10 L100,30 L0,30 Z"
                    fill="url(#sparkline-grad)"
                    opacity="0.1"
                  />
                  <defs>
                    <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2883CF" />
                      <stop offset="100%" stopColor="#2883CF" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom smooth fade for next section blending */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-white" />
    </section>
  );
};

export default Hero;