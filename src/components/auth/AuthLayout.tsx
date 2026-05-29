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
    <div className="min-h-screen flex bg-[#050816] relative overflow-hidden">

      {/* ✅ ANIMATED GRADIENT BACKGROUND - covers full screen */}
      <div className="absolute inset-0">
        <div className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 10%, rgba(16, 185, 129, 0.25) 0%, transparent 60%),
              radial-gradient(ellipse 70% 50% at 80% 20%, rgba(59, 130, 246, 0.25) 0%, transparent 55%),
              radial-gradient(ellipse 60% 50% at 50% 80%, rgba(168, 85, 247, 0.20) 0%, transparent 60%),
              linear-gradient(135deg, #050816 0%, #0a0e27 35%, #0c1233 70%, #0a0e27 100%)
            `,
          }}
        />

        {/* Floating orbs */}
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] 
          bg-gradient-to-r from-green-500/20 to-emerald-500/10 
          rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[10%] right-[10%] w-[450px] h-[450px] 
          bg-gradient-to-r from-blue-500/20 to-cyan-500/10 
          rounded-full blur-[120px] animate-blob animation-delay-2000" />

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
          }}
        />
      </div>

      {/* ✅ LEFT SIDE - Editorial branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10">
        <div className="flex flex-col justify-between p-12 xl:p-16 w-full">

          {/* Bottom Trust Line / Logo + back link */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img
                  src={logo}
                  alt="WabMeta"
                  className="relative h-16 w-16 object-contain
                    transition-all duration-500
                    group-hover:scale-110 group-hover:rotate-3"
                />
              </div>
            </Link>

            <Link
              to="/"
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-full
                bg-white/[0.05] backdrop-blur-xl
                border border-white/[0.1]
                hover:bg-white/[0.1] hover:border-white/[0.2]
                text-sm text-gray-300 hover:text-white
                transition-all duration-300"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Back to home
            </Link>
          </div>

          {/* Middle: Editorial content */}
          <div className="space-y-10 max-w-lg">


            {/* Main headline */}
            <div>
              <h1 className="text-4xl xl:text-5xl font-bold leading-[1.05] tracking-tight mb-6">
                <span className="block bg-gradient-to-br from-white via-white to-gray-300 bg-clip-text text-transparent">
                  WhatsApp Marketing,
                </span>
                <span className="block">
                  <span className="bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent italic font-light">
                    without the
                  </span>{' '}
                  <span className="relative inline-block">
                    <span className="relative z-10 text-white">duct tape.</span>
                    <span className="absolute bottom-1 left-0 right-0 h-3 
                      bg-gradient-to-r from-[#FF6B35] to-[#FF8F5E] -z-0 opacity-80 rounded-sm
                      transform -rotate-1" />
                  </span>
                </span>
              </h1>

              <p className="text-lg text-gray-400 leading-relaxed">
                One dashboard for campaigns, chatbots, analytics, and team inbox. 
                <span className="text-white"> Built on Meta's official Cloud API.</span>
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
                    bg-white/[0.03] backdrop-blur-xl
                    border border-white/[0.06]
                    hover:bg-white/[0.06] hover:border-white/[0.1]
                    transition-all duration-300 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08]
                    flex items-center justify-center
                    group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <item.icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Testimonial glass card */}
            <div className="relative rounded-2xl overflow-hidden
              bg-white/[0.04] backdrop-blur-2xl
              border border-white/[0.1]
              p-5">
              <div className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)',
                }}
              />
              <div className="relative">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-amber-400">★</span>
                  ))}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-4 italic">
                  "Replaced 3 SaaS tools we were burning ₹40K/month on. Customer engagement actually went up."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 
                    flex items-center justify-center text-white font-bold text-sm">
                    PS
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Priya Sharma</div>
                    <div className="text-xs text-gray-500">TechStart India</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: footer */}
          <div className="text-xs font-mono text-gray-600">
            © {new Date().getFullYear()} WabMeta · Made with ☕ in India
          </div>
        </div>
      </div>

      {/* ✅ RIGHT SIDE - FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">

        {/* Mobile back btn */}
        <Link
          to="/"
          className="lg:hidden absolute top-6 left-6 group inline-flex items-center gap-2 
            px-3 py-1.5 rounded-full
            bg-white/[0.05] backdrop-blur-xl
            border border-white/[0.1]
            text-xs text-gray-300 hover:text-white
            transition-all duration-300"
        >
          <ArrowLeft className="w-3 h-3" />
          Home
        </Link>

        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="WabMeta" className="h-14 w-14 object-contain" />
            </Link>
          </div>

          {/* ✅ MAIN GLASS CARD */}
          <div className="relative rounded-3xl overflow-hidden
            bg-white/[0.04] backdrop-blur-2xl
            border border-white/[0.1]
            shadow-[0_20px_60px_rgba(0,0,0,0.3)]
            p-7 sm:p-9">

            {/* Shimmer */}
            <div className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)',
              }}
            />

            {/* Top edge highlight */}
            <div className="absolute top-0 left-[15%] right-[15%] h-px 
              bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            <div className="relative">
              {/* Back btn inside */}
              {showBackButton && (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 mb-6
                    text-sm text-gray-400 hover:text-white
                    transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  Back to login
                </Link>
              )}

              {/* Header */}
              <div className="mb-7">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-mono uppercase tracking-[0.15em] text-gray-400">
                    WabMeta · Auth
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Form */}
              {children}
            </div>
          </div>

          {/* Bottom trust line */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              SSL Secured
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-700" />
            <span>No card required</span>
            <span className="w-1 h-1 rounded-full bg-gray-700" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;