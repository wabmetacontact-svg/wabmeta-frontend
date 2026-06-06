import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  MessageCircle,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import heroIllustration from '../../assets/images/hero-illustration.png';

const Hero = () => {
  return (
    <section
      className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28"
      style={{
        backgroundImage: `url('/hero section background.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Soft white overlay for content readability */}
      <div className="absolute inset-0 bg-white/55 backdrop-blur-[2px]" />

      {/* Top + bottom gradient fade for smooth blending */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/70" />

      {/* Decorative accent blobs (subtle, on top of background) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#2883CF]/10 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-sky-200/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* LEFT: Text content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Top badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/90 px-4 py-1.5 text-sm font-medium text-[#1e3a5f] shadow-sm backdrop-blur"
            >
              <Sparkles className="h-4 w-4 text-[#2883CF]" />
              Official Meta WhatsApp Business Partner
            </motion.div>

            {/* Heading */}
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-[#0f2540] sm:text-5xl lg:text-6xl">
              Grow Your Business with{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-[#2883CF] to-[#1e3a5f] bg-clip-text text-transparent">
                  WhatsApp
                </span>
                <span className="absolute -bottom-2 left-0 h-1.5 w-full rounded-full bg-gradient-to-r from-[#2883CF] to-sky-400 opacity-70" />
              </span>{' '}
              Automation
            </h1>

            {/* Sub heading */}
            <p className="mt-6 text-lg leading-relaxed text-gray-700 sm:text-xl">
              Send bulk campaigns, automate replies, manage conversations, and
              track performance — all from one powerful{' '}
              <span className="font-semibold text-[#1e3a5f]">
                WhatsApp Cloud API
              </span>{' '}
              platform built for modern businesses.
            </p>

            {/* Feature pills */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              {[
                { icon: CheckCircle2, label: 'No-Code Setup' },
                { icon: Zap, label: 'Real-Time Inbox' },
                { icon: ShieldCheck, label: 'Meta Verified' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/85 px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm backdrop-blur"
                >
                  <item.icon className="h-4 w-4 text-[#2883CF]" />
                  {item.label}
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <Link
                to="/signup"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2883CF] to-[#1e3a5f] px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-900/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-900/35 sm:w-auto"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#1e3a5f]/20 bg-white/90 px-7 py-3.5 text-base font-semibold text-[#1e3a5f] shadow-sm backdrop-blur transition-all hover:border-[#2883CF] hover:bg-white hover:text-[#2883CF] hover:shadow-md sm:w-auto"
              >
                <MessageCircle className="h-5 w-5" />
                Book a Demo
              </Link>
            </div>

            {/* Trust line */}
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:justify-start">
              <div className="flex -space-x-2">
                {['#2883CF', '#1e3a5f', '#0ea5e9', '#06b6d4'].map((c, i) => (
                  <div
                    key={i}
                    className="h-9 w-9 rounded-full border-2 border-white shadow"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-700">
                <div className="flex items-center justify-center gap-1 sm:justify-start">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className="h-4 w-4 fill-yellow-400"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.286 3.957c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.366 2.676c-.785.57-1.84-.197-1.54-1.118l1.285-3.957a1 1 0 00-.364-1.118L2.648 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
                    </svg>
                  ))}
                </div>
                <p className="mt-1">
                  <span className="font-semibold text-[#0f2540]">10,000+</span>{' '}
                  businesses trust WabMeta
                </p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            {/* Glow behind illustration */}
            <div className="absolute inset-0 -z-10 mx-auto h-[420px] w-[420px] translate-y-8 rounded-full bg-sky-300/30 blur-3xl" />

            {/* Floating card 1 — Messages sent */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute left-2 top-6 z-10 hidden rounded-2xl border border-white/80 bg-white/95 p-3 shadow-xl backdrop-blur sm:flex sm:items-center sm:gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <MessageCircle className="h-5 w-5 text-[#2883CF]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Messages Sent</p>
                <p className="text-sm font-bold text-[#0f2540]">1,24,580</p>
              </div>
            </motion.div>

            {/* Floating card 2 — Delivery rate */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute -bottom-2 right-2 z-10 hidden rounded-2xl border border-white/80 bg-white/95 p-3 shadow-xl backdrop-blur sm:flex sm:items-center sm:gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50">
                <Zap className="h-5 w-5 text-[#1e3a5f]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Delivery Rate</p>
                <p className="text-sm font-bold text-[#0f2540]">98.7%</p>
              </div>
            </motion.div>

            {/* Main illustration with soft white glass card behind */}
            <div className="relative mx-auto w-full max-w-[560px]">
              <div className="absolute inset-0 -z-10 rounded-3xl bg-white/40 blur-2xl" />
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
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom smooth fade to white for next section blending */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white" />
    </section>
  );
};

export default Hero;