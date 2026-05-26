import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, MessageCircle, Users, Zap,
  CheckCircle, Star, Shield, BarChart3,
  Sparkles, Play,
} from 'lucide-react';

/* ── Animated Counter ─────────────────────────────── */
function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = React.useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

/* ── Floating Stat Card ───────────────────────────── */
const FloatingCard: React.FC<{
  icon: React.ElementType;
  value: string;
  label: string;
  color: string;
  className?: string;
  delay?: string;
}> = ({ icon: Icon, value, label, color, className = '', delay = '0s' }) => (
  <div
    className={`absolute z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl
      rounded-2xl border border-white/60 dark:border-purple-500/20
      shadow-xl p-4 flex items-center gap-3 animate-float ${className}`}
    style={{ animationDelay: delay }}
  >
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-lg font-black text-gray-900 dark:text-white leading-none">{value}</p>
      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">{label}</p>
    </div>
  </div>
);

/* ── Main Component ───────────────────────────────── */
const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[calc(100vh-80px)] flex items-center
        overflow-hidden bg-white dark:bg-[#0a0a0f]"
    >
      {/* ── Background ─────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Main gradient orbs */}
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px]
          bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px]
          bg-violet-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[80px]" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(168,85,247,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(168,85,247,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating orbs */}
        <div className="absolute top-32 right-1/4 w-3 h-3 rounded-full
          bg-purple-400 animate-float opacity-60" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/2 right-1/3 w-2 h-2 rounded-full
          bg-violet-400 animate-float opacity-40" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-32 left-1/4 w-4 h-4 rounded-full
          bg-indigo-400 animate-float opacity-50" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
        py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

          {/* ── Left Content ───────────────────────── */}
          <div className={`space-y-8 transition-all duration-1000
            ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2
              bg-purple-50 dark:bg-purple-950/50
              border border-purple-200/60 dark:border-purple-700/40
              rounded-full text-sm font-medium text-purple-700
              dark:text-purple-300 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full
                  rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2
                  bg-purple-500" />
              </span>
              Official Meta Business Partner
              <CheckCircle className="w-4 h-4 text-purple-500" />
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black
                text-gray-900 dark:text-white leading-[1.05] tracking-tight"
              >
                Supercharge
                <br />
                <span
                  className="text-transparent bg-clip-text"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #6366f1 100%)',
                    backgroundSize: '200%',
                    animation: 'gradient 5s linear infinite',
                  }}
                >
                  WhatsApp
                </span>
                <br />
                Marketing
              </h1>
            </div>

            {/* Sub */}
            <p className="text-lg text-gray-500 dark:text-gray-400
              max-w-lg leading-relaxed font-medium"
            >
              The all-in-one WhatsApp Business API platform for campaigns,
              chatbots, and customer engagement.
              Trusted by <strong className="text-gray-700 dark:text-gray-200">
                10,000+ businesses
              </strong> worldwide.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center gap-2.5
                  px-7 py-4 text-white font-semibold rounded-2xl
                  shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50
                  transition-all duration-300 hover:-translate-y-0.5 text-sm"
                style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed, #6366f1)' }}
              >
                <Sparkles className="w-4 h-4" />
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1
                  transition-transform duration-300" />
              </Link>

              <button
                onClick={() =>
                  document.getElementById('demo-video')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4
                  bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-200
                  font-semibold rounded-2xl border border-gray-200
                  dark:border-white/10 hover:border-purple-300
                  dark:hover:border-purple-500/50 hover:bg-purple-50
                  dark:hover:bg-purple-950/30 transition-all duration-300 text-sm"
              >
                <div className="w-7 h-7 rounded-full bg-purple-100
                  dark:bg-purple-900/50 flex items-center justify-center"
                >
                  <Play className="w-3.5 h-3.5 text-purple-600
                    dark:text-purple-400 fill-current" />
                </div>
                Watch Demo
              </button>
            </div>

            {/* Trust Pills */}
            <div className="flex flex-wrap gap-3">
              {[
                'No credit card required',
                '2-day free trial',
                'Cancel anytime',
              ].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 text-xs font-medium
                    text-gray-500 dark:text-gray-400"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-purple-500" />
                  {t}
                </span>
              ))}
            </div>

            {/* Stars */}
            <div className="flex items-center gap-3 pt-2 border-t
              border-gray-100 dark:border-white/5"
            >
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                <strong className="text-gray-700 dark:text-gray-200">4.9/5</strong>
                {' '}from 2,000+ reviews
              </span>
            </div>
          </div>

          {/* ── Right: Dashboard UI ─────────────────── */}
          <div
            className={`relative transition-all duration-1000 delay-300
              ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          >
            {/* Glow behind card */}
            <div className="absolute inset-0 bg-purple-500/10 blur-3xl
              rounded-3xl scale-110 pointer-events-none" />

            {/* Main Card */}
            <div className="relative bg-white dark:bg-[#0d0d18]
              rounded-3xl border border-gray-100 dark:border-purple-500/10
              shadow-[0_32px_80px_rgba(168,85,247,0.15)] overflow-hidden"
            >
              {/* Window Chrome */}
              <div className="flex items-center gap-2 px-5 py-4
                border-b border-gray-100 dark:border-white/5
                bg-gray-50/50 dark:bg-white/[0.02]"
              >
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="flex-1 max-w-[200px] mx-auto h-5
                  bg-gray-100 dark:bg-white/5 rounded-lg
                  border border-gray-200/50 dark:border-white/5" />
              </div>

              <div className="p-6 space-y-5">
                {/* Header stat */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center
                      justify-center bg-purple-100 dark:bg-purple-900/40"
                    >
                      <MessageCircle className="w-6 h-6 text-purple-600
                        dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400
                        uppercase tracking-widest"
                      >
                        Engagement Overview
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-gray-900
                          dark:text-white">125,432</span>
                        <span className="text-xs font-bold text-purple-600
                          bg-purple-100 dark:bg-purple-900/40 dark:text-purple-400
                          px-1.5 py-0.5 rounded-lg">↑ 12.5%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5
                    bg-purple-50 dark:bg-purple-900/30
                    rounded-full border border-purple-100
                    dark:border-purple-800/50 text-[10px]
                    font-bold text-purple-600 dark:text-purple-400"
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full
                        w-full rounded-full bg-purple-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5
                        w-1.5 bg-purple-500" />
                    </span>
                    LIVE
                  </div>
                </div>

                {/* Chart */}
                <div className="relative bg-gray-50/50 dark:bg-white/[0.02]
                  rounded-2xl p-4 border border-gray-100
                  dark:border-white/5 overflow-hidden"
                >
                  <div className="h-36 relative">
                    <svg
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 400 140"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id="purpleFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#a855f7" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,140 L0,95 C50,105 80,35 130,65 C180,95 220,5 270,45 C320,75 355,15 400,25 L400,140 Z"
                        fill="url(#purpleFill)"
                      />
                      <path
                        d="M0,95 C50,105 80,35 130,65 C180,95 220,5 270,45 C320,75 355,15 400,25"
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]"
                      />
                      {[
                        { x: 0,   y: 95 },
                        { x: 130, y: 65 },
                        { x: 270, y: 45 },
                        { x: 400, y: 25 },
                      ].map((p, i) => (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r="12"
                            fill="#a855f7" fillOpacity="0.1"
                            className="animate-ping"
                            style={{ animationDuration: '3s', animationDelay: `${i * 600}ms` }}
                          />
                          <circle cx={p.x} cy={p.y} r="5"
                            fill="white" stroke="#a855f7" strokeWidth="2.5" />
                        </g>
                      ))}
                    </svg>
                  </div>
                  <div className="flex justify-between mt-2 text-[9px]
                    text-gray-400 font-bold uppercase tracking-widest px-1"
                  >
                    {['MON','TUE','WED','THU','FRI','SAT','SUN'].map(d => (
                      <span key={d}>{d}</span>
                    ))}
                  </div>
                </div>

                {/* Message rows */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400
                    uppercase tracking-widest mb-3">Recent Broadcasts</p>
                  {[
                    { name: 'Rahul Sharma', status: 'Delivered', pct: 100, color: 'bg-purple-500' },
                    { name: 'Priya Kapoor', status: 'Read',      pct: 100, color: 'bg-violet-500' },
                    { name: 'Amit Hegde',   status: 'Sending',   pct: 65,  color: 'bg-indigo-500' },
                  ].map((m, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-1.5 p-3 rounded-xl
                        bg-gray-50 dark:bg-white/[0.03]
                        border border-gray-100 dark:border-white/5
                        hover:border-purple-200 dark:hover:border-purple-500/20
                        transition-colors duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${m.color}`} />
                          <span className="text-xs font-semibold
                            text-gray-700 dark:text-gray-200">{m.name}</span>
                        </div>
                        <span className="text-[10px] text-gray-400
                          font-medium">{m.status}</span>
                      </div>
                      <div className="h-1 w-full bg-gray-200
                        dark:bg-white/10 rounded-full overflow-hidden"
                      >
                        <div
                          className={`h-full ${m.color} rounded-full
                            transition-all duration-1000`}
                          style={{ width: `${m.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Floating Cards ────────────────────── */}
            <FloatingCard
              icon={Users}
              value="12K+"
              label="Active Agents"
              color="bg-gradient-to-br from-purple-500 to-violet-600"
              className="-top-8 -left-8"
              delay="0s"
            />
            <FloatingCard
              icon={Zap}
              value="98.5%"
              label="Delivery Rate"
              color="bg-gradient-to-br from-violet-500 to-purple-600"
              className="-top-4 -right-10"
              delay="1s"
            />
            <FloatingCard
              icon={BarChart3}
              value="1.2M+"
              label="Contacts Managed"
              color="bg-gradient-to-br from-indigo-500 to-purple-600"
              className="-bottom-8 -right-8"
              delay="2s"
            />
            <FloatingCard
              icon={Shield}
              value="Meta"
              label="Verified Partner"
              color="bg-gradient-to-br from-purple-600 to-indigo-600"
              className="-bottom-4 -left-10"
              delay="1.5s"
            />
          </div>
        </div>

        {/* ── Trusted By ───────────────────────────── */}
        <div className="mt-24 pt-10 border-t border-gray-100
          dark:border-white/5"
        >
          <p className="text-center text-xs font-semibold text-gray-400
            uppercase tracking-widest mb-8"
          >
            Trusted by leading companies worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center
            gap-8 md:gap-16 opacity-40 grayscale"
          >
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-8 w-28 bg-gray-300
                dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2
        flex flex-col items-center gap-2 animate-bounce"
      >
        <span className="text-[10px] text-gray-400 uppercase
          tracking-widest font-medium">Scroll</span>
        <div className="w-6 h-10 rounded-full border-2
          border-purple-300/50 dark:border-purple-500/30
          flex items-start justify-center pt-2"
        >
          <div className="w-1 h-2 rounded-full bg-purple-400
            animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default Hero;