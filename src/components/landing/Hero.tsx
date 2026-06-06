import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, MessageCircle, Zap } from 'lucide-react';
import heroIllustration from '../../assets/images/hero-illustration.png';

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

          {/* RIGHT: Original Illustration with new background theme */}
          <div className="relative flex items-center justify-center p-4 lg:p-8 lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative w-full max-w-[560px]"
            >
              {/* Glow behind illustration */}
              <div className="absolute inset-0 -z-10 mx-auto h-[420px] w-[420px] translate-y-8 rounded-full bg-sky-300/30 blur-3xl pointer-events-none" />

              {/* Floating card 1 — Messages sent */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute left-2 top-6 z-10 hidden rounded-2xl border border-white/80 bg-white/95 p-3 shadow-2xl backdrop-blur sm:flex sm:items-center sm:gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <MessageCircle className="h-5 w-5 text-[#2883CF]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold">Messages Sent</p>
                  <p className="text-sm font-bold text-[#0f2540]">1,24,580</p>
                </div>
              </motion.div>

              {/* Floating card 2 — Delivery rate */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -bottom-2 right-2 z-10 hidden rounded-2xl border border-white/80 bg-white/95 p-3 shadow-2xl backdrop-blur sm:flex sm:items-center sm:gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50">
                  <Zap className="h-5 w-5 text-[#1e3a5f]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold">Delivery Rate</p>
                  <p className="text-sm font-bold text-[#0f2540]">98.7%</p>
                </div>
              </motion.div>

              {/* Main illustration */}
              <motion.img
                src={heroIllustration}
                alt="WabMeta WhatsApp Analytics Dashboard"
                className="relative h-auto w-full drop-shadow-2xl"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom smooth fade for next section blending */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-white" />
    </section>
  );
};

export default Hero;