import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Sparkles, Shield,
  Zap, MessageSquare, Users,
} from 'lucide-react';
import logo from '../../assets/logo.png';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

// ─── Left Panel Data (static - no reason to be dynamic) ──────────────────────

const FEATURES = [
  { icon: Shield,       label: 'E2E Encrypted' },
  { icon: Zap,          label: '~6 min setup' },
  { icon: MessageSquare,label: '2.1M sent/mo' },
  { icon: Users,        label: '847+ teams' },
] as const;

const TESTIMONIAL = {
  quote: '"Replaced 3 SaaS tools we were burning ₹40K/month on. Customer engagement actually went up."',
  name:  'Priya Sharma',
  org:   'TechStart India',
  initials: 'PS',
};

// ─── Left Brand Panel ─────────────────────────────────────────────────────────

const BrandPanel: React.FC = () => (
  <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden
    bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">

    {/* Ambient glows */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `
          radial-gradient(ellipse 70% 50% at 15% 10%, rgba(255,255,255,0.18) 0%, transparent 55%),
          radial-gradient(ellipse 60% 50% at 90% 80%, rgba(255,255,255,0.10) 0%, transparent 60%)
        `,
      }}
    />

    {/* Subtle grid */}
    <div
      className="absolute inset-0 opacity-[0.07] pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)
        `,
        backgroundSize: '56px 56px',
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
      }}
    />

    {/* Floating blobs */}
    <div className="absolute top-[12%] left-[8%] w-[400px] h-[400px]
      bg-white/10 rounded-full blur-[120px] animate-blob" />
    <div className="absolute bottom-[8%] right-[6%] w-[360px] h-[360px]
      bg-white/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />

    {/* Content */}
    <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">

      {/* Top */}
      <div className="flex items-center justify-between">
        <Link to="/" className="group">
          <div className="h-13 w-13 rounded-2xl bg-white flex items-center justify-center
            shadow-lg transition-transform duration-300 group-hover:scale-105">
            <img src={logo} alt="WabMeta" className="h-9 w-9 object-contain" />
          </div>
        </Link>

        <Link
          to="/"
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-full
            bg-white/10 border border-white/20 text-sm text-white/90
            hover:bg-white/20 transition-all duration-300"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </Link>
      </div>

      {/* Middle */}
      <div className="space-y-10 max-w-lg">

        {/* Headline */}
        <div>
          <h1 className="text-4xl xl:text-5xl font-bold leading-[1.08]
            tracking-tight mb-5 text-white">
            <span className="block">WhatsApp Marketing,</span>
            <span className="block">
              <span className="italic font-light text-white/70">without the </span>
              <span className="relative inline-block">
                <span className="relative z-10">duct tape.</span>
                <span className="absolute bottom-1 left-0 right-0 h-3 -z-0
                  rounded-sm -rotate-1 opacity-90
                  bg-gradient-to-r from-[#FF6B35] to-[#FF8F5E]" />
              </span>
            </span>
          </h1>
          <p className="text-lg text-white/80 leading-relaxed">
            One dashboard for campaigns, chatbots, analytics, and team inbox.{' '}
            <span className="text-white font-medium">
              Built on Meta's official Cloud API.
            </span>
          </p>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 p-3 rounded-xl
                bg-white/10 border border-white/15
                hover:bg-white/15 transition-all duration-300 group"
            >
              <div className="w-8 h-8 rounded-lg bg-white/15
                flex items-center justify-center
                group-hover:scale-110 transition-transform flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm text-white/90">{label}</span>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="rounded-2xl bg-white/10 border border-white/15 p-5">
          <div className="flex gap-0.5 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-amber-300 text-base">★</span>
            ))}
          </div>
          <p className="text-sm text-white/90 leading-relaxed mb-4 italic">
            {TESTIMONIAL.quote}
          </p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white
              flex items-center justify-center
              text-primary-700 font-bold text-sm flex-shrink-0">
              {TESTIMONIAL.initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{TESTIMONIAL.name}</p>
              <p className="text-xs text-white/60">{TESTIMONIAL.org}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-white/40">
        © {new Date().getFullYear()} WabMeta · Made with ☕ in India
      </p>
    </div>
  </div>
);

// ─── Auth Layout ──────────────────────────────────────────────────────────────

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = false,
}) => (
  <div className="min-h-screen flex bg-white">

    {/* Left - Brand Panel */}
    <BrandPanel />

    {/* Right - Form Panel */}
    <div className="w-full lg:w-1/2 flex items-center justify-center
      p-6 sm:p-10 bg-white relative">

      {/* Mobile: Back to home */}
      <Link
        to="/"
        className="lg:hidden absolute top-5 left-5 inline-flex items-center gap-1.5
          px-3 py-1.5 rounded-full
          bg-gray-100 border border-gray-200
          text-xs text-gray-600 hover:text-gray-900
          transition-colors"
      >
        <ArrowLeft className="w-3 h-3" />
        Home
      </Link>

      <div className="w-full max-w-md">

        {/* Mobile: Logo */}
        <div className="lg:hidden flex justify-center mb-8">
          <Link
            to="/"
            className="w-14 h-14 rounded-2xl bg-primary-500
              flex items-center justify-center shadow-sm
              hover:bg-primary-600 transition-colors"
          >
            <img src={logo} alt="WabMeta" className="w-9 h-9 object-contain" />
          </Link>
        </div>

        {/* Optional back to login link */}
        {showBackButton && (
          <Link
            to="/login"
            className="inline-flex items-center gap-2 mb-6
              text-sm text-gray-500 hover:text-gray-800
              transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to sign in
          </Link>
        )}

        {/* Header */}
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
              WabMeta
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900
            mb-2 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-gray-500 leading-relaxed">{subtitle}</p>
          )}
        </div>

        {/* Form content */}
        {children}

        {/* Trust badges */}
        <div className="mt-7 flex items-center justify-center gap-4
          text-xs text-gray-400 flex-wrap">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3 h-3" />
            SSL Secured
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>No card required</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>Cancel anytime</span>
        </div>
      </div>
    </div>
  </div>
);

export default AuthLayout;