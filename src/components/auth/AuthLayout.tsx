import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Shield, Zap, MessageSquare, Users } from 'lucide-react';
import logo from '../../assets/logo.png';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = false,
}) => {
  return (
    <div className="min-h-screen flex bg-white">

      {/* ===== LEFT — Brand panel (hidden on mobile) ===== */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden
        bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">

        {/* Soft highlights + faint grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 70% 50% at 15% 10%, rgba(255,255,255,0.18) 0%, transparent 55%),
              radial-gradient(ellipse 60% 50% at 90% 80%, rgba(255,255,255,0.10) 0%, transparent 60%)
            `,
          }}
        />
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
          }}
        />
        <div className="absolute top-[12%] left-[8%] w-[420px] h-[420px]
          bg-white/10 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[8%] right-[6%] w-[380px] h-[380px]
          bg-white/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">

          {/* Top: logo + back */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center group">
              <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center
                shadow-lg transition-transform duration-500 group-hover:scale-105">
                <img src={logo} alt="WabMeta" className="h-9 w-9 object-contain" />
              </div>
            </Link>

            <Link to="/"
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-full
                bg-white/10 border border-white/20 text-sm text-white/90
                hover:bg-white/20 transition-all duration-300">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Back to home
            </Link>
          </div>

          {/* Middle: headline */}
          <div className="space-y-10 max-w-lg">
            <div>
              <h1 className="text-4xl xl:text-5xl font-bold leading-[1.08] tracking-tight mb-6 text-white">
                <span className="block">WhatsApp Marketing,</span>
                <span className="block">
                  <span className="italic font-light text-white/70">without the</span>{' '}
                  <span className="relative inline-block">
                    <span className="relative z-10">duct tape.</span>
                    <span className="absolute bottom-1 left-0 right-0 h-3 -z-0 rounded-sm opacity-90 -rotate-1
                      bg-gradient-to-r from-[#FF6B35] to-[#FF8F5E]" />
                  </span>
                </span>
              </h1>
              <p className="text-lg text-white/80 leading-relaxed">
                One dashboard for campaigns, chatbots, analytics, and team inbox.
                <span className="text-white font-medium"> Built on Meta's official Cloud API.</span>
              </p>
            </div>

            {/* Mini features */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Shield, label: 'E2E Encrypted' },
                { icon: Zap, label: '~6 min setup' },
                { icon: MessageSquare, label: '2.1M sent/mo' },
                { icon: Users, label: '847 teams' },
              ].map((item, i) => (
                <div key={i}
                  className="flex items-center gap-3 p-3 rounded-xl
                    bg-white/10 border border-white/15
                    hover:bg-white/15 transition-all duration-300 group">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center
                    group-hover:scale-110 transition-transform">
                    <item.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm text-white/90">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="rounded-2xl bg-white/10 border border-white/15 p-5">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-amber-300">★</span>
                ))}
              </div>
              <p className="text-sm text-white/90 leading-relaxed mb-4 italic">
                "Replaced 3 SaaS tools we were burning ₹40K/month on. Customer engagement actually went up."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center
                  text-primary-700 font-bold text-sm">PS</div>
                <div>
                  <div className="text-sm font-semibold text-white">Priya Sharma</div>
                  <div className="text-xs text-white/60">TechStart India</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-xs text-white/50">
            © {new Date().getFullYear()} WabMeta · Made with ☕ in India
          </div>
        </div>
      </div>

      {/* ===== RIGHT — Form ===== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white relative">

        {/* Mobile back */}
        <Link to="/"
          className="lg:hidden absolute top-6 left-6 inline-flex items-center gap-2
            px-3 py-1.5 rounded-full bg-secondary-100 border border-secondary-200
            text-xs text-secondary-600 hover:text-secondary-900 transition-colors">
          <ArrowLeft className="w-3 h-3" />
          Home
        </Link>

        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="h-14 w-14 rounded-2xl bg-primary-600 flex items-center justify-center shadow-sm">
              <img src={logo} alt="WabMeta" className="h-9 w-9 object-contain" />
            </Link>
          </div>

          {showBackButton && (
            <Link to="/login"
              className="inline-flex items-center gap-2 mb-6 text-sm text-secondary-500
                hover:text-secondary-900 transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to login
            </Link>
          )}

          {/* Header */}
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-secondary-400">
                WabMeta · Auth
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-2 tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-secondary-500 leading-relaxed">{subtitle}</p>
            )}
          </div>

          {children}

          {/* Trust line */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-secondary-400">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3 h-3" /> SSL Secured
            </span>
            <span className="w-1 h-1 rounded-full bg-secondary-300" />
            <span>No card required</span>
            <span className="w-1 h-1 rounded-full bg-secondary-300" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;