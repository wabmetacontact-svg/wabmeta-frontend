import React, { useRef, useState } from 'react';
import {
  MessageSquare,
  Users,
  Bot,
  Zap,
  BarChart3,
  Shield,
  Send,
  Clock,
  Globe,
  Layers,
  Smartphone,
  FileText,
  ArrowUpRight,
  Sparkles,
  Instagram,
} from 'lucide-react';

// ✅ Reusable Tilt Card Component - mouse follow
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

const TiltCard: React.FC<TiltCardProps> = ({ children, className = '', intensity = 8 }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -intensity;
    const rotateY = ((x - centerX) / centerX) * intensity;

    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    );
    setGlarePos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: 'transform 0.2s ease-out',
        transformStyle: 'preserve-3d',
      }}
      className={`relative ${className}`}
    >
      {/* Glare effect */}
      <div
        className="absolute inset-0 rounded-[inherit] pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300 z-20"
        style={{
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.6) 0%, transparent 50%)`,
        }}
      />
      {children}
    </div>
  );
};

const Features: React.FC = () => {
  const mainFeatures = [
    {
      icon: Send,
      title: 'Bulk Messaging',
      description: 'Send personalized messages to thousands instantly.',
      details: 'Built for scale — handles 50,000+ messages/hour with smart rate limiting.',
      stat: '2.1M',
      statLabel: 'sent this month',
      accentColor: '#10b981',
      gridArea: 'lg:col-span-2 lg:row-span-2',
      bgGradient: 'from-green-100/60 via-emerald-50/40 to-transparent',
      iconBg: 'from-green-500 to-emerald-600',
      mockup: 'messaging',
    },
    {
      icon: MessageSquare,
      title: 'Live Inbox',
      description: 'Unified chat for your whole team.',
      accentColor: '#3b82f6',
      gridArea: 'lg:col-span-2',
      bgGradient: 'from-blue-100/60 via-cyan-50/40 to-transparent',
      iconBg: 'from-blue-500 to-cyan-600',
      mockup: 'inbox',
    },
    {
      icon: Bot,
      title: 'Chatbot Builder',
      description: 'Drag, drop, deploy.',
      details: 'Visual flow builder with AI integration.',
      accentColor: '#a855f7',
      gridArea: 'lg:col-span-2 lg:row-span-2',
      bgGradient: 'from-purple-100/60 via-pink-50/40 to-transparent',
      iconBg: 'from-purple-500 to-pink-600',
      mockup: 'bot',
    },
    {
      icon: Zap,
      title: 'Automation',
      description: 'Workflows that work while you sleep.',
      accentColor: '#f59e0b',
      gridArea: 'lg:col-span-2',
      bgGradient: 'from-amber-100/60 via-orange-50/40 to-transparent',
      iconBg: 'from-amber-500 to-orange-600',
      mockup: 'automation',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Numbers that matter.',
      accentColor: '#6366f1',
      gridArea: 'lg:col-span-2',
      bgGradient: 'from-indigo-100/60 via-violet-50/40 to-transparent',
      iconBg: 'from-indigo-500 to-violet-600',
      mockup: 'analytics',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Built for teams, not just individuals.',
      accentColor: '#ef4444',
      gridArea: 'lg:col-span-2',
      bgGradient: 'from-rose-100/60 via-red-50/40 to-transparent',
      iconBg: 'from-rose-500 to-red-600',
      mockup: 'team',
    },
    {
      icon: Instagram,
      title: 'Instagram Automation',
      description: 'Auto-reply to DMs, comments & stories.',
      details: 'Boost engagement without lifting a finger.',
      accentColor: '#e1306c',
      gridArea: 'lg:col-span-3 lg:row-span-2',
      bgGradient: 'from-pink-100/60 via-purple-50/40 to-transparent',
      iconBg: 'from-[#833ab4] via-[#fd1d1d] to-[#fcb045]',
      mockup: 'instagram',
    },
  ];

  const additionalFeatures = [
    { icon: Globe, title: 'Multi-language', desc: '100+ languages' },
    { icon: Shield, title: 'Enterprise Security', desc: 'E2E encryption' },
    { icon: Clock, title: '24/7 Availability', desc: 'Never miss a message' },
    { icon: Layers, title: 'Template Manager', desc: 'Pre-approved templates' },
    { icon: Smartphone, title: 'Mobile App', desc: 'Manage anywhere' },
    { icon: FileText, title: 'Rich Media', desc: 'Images, videos, docs' },
  ];

  return (
    <section id="features" className="relative py-24 lg:py-32 overflow-hidden">

      {/* ✅ LIGHT Background with soft gradients */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-green-50/30 to-white">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 15% 30%, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
              radial-gradient(ellipse 60% 50% at 85% 70%, rgba(168, 85, 247, 0.08) 0%, transparent 60%),
              radial-gradient(ellipse 40% 40% at 50% 90%, rgba(59, 130, 246, 0.06) 0%, transparent 60%)
            `,
          }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `linear-gradient(rgba(16,185,129,0.08) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(16,185,129,0.08) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ✅ EDITORIAL Section Header - asymmetric */}
        <div className="grid grid-cols-12 gap-6 mb-16 lg:mb-20">

          {/* Left: label + heading */}
          <div className="col-span-12 lg:col-span-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-gray-300" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500">
                What's inside
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              <span className="text-gray-900">Six tools.</span>{' '}
              <span className="bg-gradient-to-r from-gray-500 to-gray-600 bg-clip-text text-transparent italic font-light">
                One platform.
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                Zero duct tape.
              </span>
            </h2>
          </div>

          {/* Right: description */}
          <div className="col-span-12 lg:col-span-4 lg:pt-12">
            <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
              We didn't bolt features together. Every tool here was built to talk to the others — so your data, contacts, and chats move freely.
            </p>
          </div>
        </div>

        {/* ✅ BENTO GRID - Light Glassmorphic */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-5 auto-rows-[200px] lg:auto-rows-[180px]">

          {mainFeatures.map((feature) => (
            <TiltCard
              key={feature.title}
              className={feature.gridArea}
              intensity={6}
            >
              <div
                className="group relative h-full w-full
                  rounded-3xl overflow-hidden
                  border border-white/60
                  transition-all duration-500
                  cursor-pointer
                  hover:border-white/90"
                style={{
                  transformStyle: 'preserve-3d',
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 100%)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  boxShadow:
                    'inset 0 1px 1px rgba(255,255,255,0.7), 0 8px 32px rgba(31,38,135,0.08)',
                }}
              >
                {/* Background gradient on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                />

                {/* Top edge highlight (glass shine) */}
                <div className="absolute top-0 left-[15%] right-[15%] h-px 
                  bg-gradient-to-r from-transparent via-white/90 to-transparent" />

                {/* Top inner gloss */}
                <div className="absolute inset-x-0 top-0 h-1/3 
                  bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-3xl" />

                {/* ✅ Content */}
                <div
                  className="relative h-full p-6 lg:p-7 flex flex-col z-10"
                  style={{ transform: 'translateZ(20px)' }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.iconBg}
                        flex items-center justify-center
                        group-hover:scale-110 group-hover:-rotate-3
                        transition-all duration-500
                        border border-white/40`}
                      style={{
                        boxShadow: `0 8px 24px ${feature.accentColor}40, inset 0 1px 1px rgba(255,255,255,0.4)`,
                        transform: 'translateZ(40px)',
                      }}
                    >
                      <feature.icon className="w-6 h-6 text-white drop-shadow-sm" />
                    </div>

                    <ArrowUpRight
                      className="w-5 h-5 text-gray-400 
                        group-hover:text-gray-900 group-hover:translate-x-1 group-hover:-translate-y-1
                        transition-all duration-300"
                    />
                  </div>

                  {/* Title + Description */}
                  <div className="flex-1">
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>

                    {feature.details && (
                      <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                        {feature.details}
                      </p>
                    )}
                  </div>

                  {/* Visual mockups */}
                  {feature.mockup === 'messaging' && <MessagingMockup color={feature.accentColor} />}
                  {feature.mockup === 'bot' && <BotMockup color={feature.accentColor} />}
                  {feature.mockup === 'inbox' && <InboxMockup color={feature.accentColor} />}
                  {feature.mockup === 'automation' && <AutomationMockup color={feature.accentColor} />}
                  {feature.mockup === 'analytics' && <AnalyticsMockup color={feature.accentColor} />}
                  {feature.mockup === 'team' && <TeamMockup color={feature.accentColor} />}
                  {feature.mockup === 'instagram' && <InstagramMockup color={feature.accentColor} />}

                  {/* Stat for messaging card */}
                  {feature.stat && (
                    <div
                      className="absolute bottom-6 right-6 text-right"
                      style={{ transform: 'translateZ(30px)' }}
                    >
                      <div className="text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        {feature.stat}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                        {feature.statLabel}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TiltCard>
          ))}
        </div>

        {/* ✅ "And more" section - editorial style */}
        <div className="mt-24 lg:mt-32">

          <div className="flex items-baseline justify-between mb-10 pb-4 
            border-b border-gray-200">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-gray-500 block mb-2">
                + Plus the essentials
              </span>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Stuff you'd expect, done right.
              </h3>
            </div>
            <span className="text-xs font-mono text-gray-400 hidden lg:block">
              06 / 12
            </span>
          </div>

          {/* Minimal list-style additional features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
            {additionalFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="group flex items-center gap-4 py-5 
                  border-b border-gray-200/70 hover:border-green-300/60
                  transition-all duration-300 cursor-pointer"
              >
                <div
                  className="w-10 h-10 rounded-xl 
                    border border-white/80
                    flex items-center justify-center flex-shrink-0
                    transition-all duration-300
                    group-hover:scale-110 group-hover:rotate-3
                    group-hover:border-green-200"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(240,253,244,0.4) 100%)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.7)',
                  }}
                >
                  <feature.icon className="w-4 h-4 text-gray-600 group-hover:text-green-600 transition-colors" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 
                    group-hover:translate-x-1 group-hover:text-green-700 transition-all duration-300">
                    {feature.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {feature.desc}
                  </div>
                </div>

                <span className="text-xs font-mono text-gray-400 group-hover:text-green-600 transition-colors">
                  0{index + 7}
                </span>
              </div>
            ))}
          </div>

          {/* ✅ Bottom note */}
          <div className="mt-16 flex items-center gap-3 text-sm text-gray-600">
            <Sparkles className="w-4 h-4 text-green-500" />
            <span>
              And ~30 more we didn't list.
              <a
                href="/documentation"
                className="text-gray-900 font-semibold underline underline-offset-4 decoration-green-300 hover:text-green-700 hover:decoration-green-500 transition-colors ml-1"
              >
                Browse the full docs →
              </a>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================
// ✅ MINI VISUAL MOCKUPS - Light theme versions
// ============================================

const MessagingMockup: React.FC<{ color: string }> = ({ color }) => (
  <div
    className="absolute bottom-20 left-6 right-6 opacity-70 group-hover:opacity-100 transition-opacity duration-500"
    style={{ transform: 'translateZ(20px)' }}
  >
    <div className="space-y-2">
      {[100, 75, 90].map((width, i) => (
        <div key={i} className="flex items-center gap-2" style={{ animationDelay: `${i * 100}ms` }}>
          <div
            className="w-6 h-6 rounded-full flex-shrink-0"
            style={{ backgroundColor: `${color}30`, border: `1px solid ${color}60` }}
          />
          <div
            className="h-2 rounded-full flex-1"
            style={{ width: `${width}%`, backgroundColor: `${color}25` }}
          />
          <div className="text-[9px] font-mono text-gray-400">✓✓</div>
        </div>
      ))}
    </div>
  </div>
);

const InboxMockup: React.FC<{ color: string }> = ({ color }) => (
  <div
    className="absolute bottom-4 right-4 opacity-60 group-hover:opacity-100 transition-opacity duration-500"
    style={{ transform: 'translateZ(15px)' }}
  >
    <div className="flex -space-x-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-8 h-8 rounded-full border-2 border-white
            flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
          style={{ backgroundColor: `${color}cc` }}
        >
          {String.fromCharCode(64 + i)}
        </div>
      ))}
      <div
        className="w-8 h-8 rounded-full border-2 border-white
          flex items-center justify-center text-[10px] font-bold text-gray-700 shadow-sm"
        style={{
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(8px)',
        }}
      >
        +12
      </div>
    </div>
  </div>
);

const BotMockup: React.FC<{ color: string }> = ({ color }) => (
  <div
    className="absolute bottom-20 left-6 right-6 opacity-80 group-hover:opacity-100 transition-opacity duration-500"
    style={{ transform: 'translateZ(20px)' }}
  >
    <div className="relative h-24">
      {[
        { x: 0, y: 0, label: 'Start' },
        { x: 50, y: 30, label: 'Reply' },
        { x: 100, y: 60, label: 'End' },
      ].map((node, i) => (
        <React.Fragment key={i}>
          <div
            className="absolute w-14 h-7 rounded-md text-[8px] font-mono 
              flex items-center justify-center
              transition-all duration-500 group-hover:scale-110 shadow-sm"
            style={{
              left: `${node.x}px`,
              top: `${node.y}px`,
              backgroundColor: `${color}20`,
              border: `1px solid ${color}60`,
              color: color,
              backdropFilter: 'blur(8px)',
              transitionDelay: `${i * 80}ms`,
              fontWeight: 600,
            }}
          >
            {node.label}
          </div>
          {i < 2 && (
            <svg
              className="absolute"
              style={{
                left: `${node.x + 56}px`,
                top: `${node.y + 14}px`,
                width: '12px',
                height: '20px',
              }}
            >
              <path d="M0 0 L12 20" stroke={color} strokeWidth="1.5" opacity="0.5" />
            </svg>
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const AutomationMockup: React.FC<{ color: string }> = ({ color }) => (
  <div
    className="absolute bottom-6 left-6 right-6 opacity-70 group-hover:opacity-100 transition-opacity duration-500"
    style={{ transform: 'translateZ(15px)' }}
  >
    <div className="flex items-center gap-1.5">
      {['IF', '→', 'THEN', '→', 'SEND'].map((text, i) => (
        <React.Fragment key={i}>
          {text === '→' ? (
            <span className="text-xs font-bold" style={{ color }}>
              →
            </span>
          ) : (
            <span
              className="px-2 py-1 rounded-md text-[9px] font-mono font-bold shadow-sm"
              style={{
                backgroundColor: `${color}20`,
                color: color,
                border: `1px solid ${color}50`,
              }}
            >
              {text}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const AnalyticsMockup: React.FC<{ color: string }> = ({ color }) => (
  <div
    className="absolute bottom-6 left-6 right-6 opacity-70 group-hover:opacity-100 transition-opacity duration-500"
    style={{ transform: 'translateZ(15px)' }}
  >
    <div className="flex items-end gap-1 h-12">
      {[40, 65, 50, 80, 95, 70, 100].map((height, i) => (
        <div
          key={i}
          className="flex-1 rounded-t transition-all duration-500"
          style={{
            height: `${height}%`,
            background: `linear-gradient(to top, ${color}aa, ${color}30)`,
            transitionDelay: `${i * 50}ms`,
            boxShadow: `0 -2px 8px ${color}30`,
          }}
        />
      ))}
    </div>
  </div>
);

const TeamMockup: React.FC<{ color: string }> = ({ color }) => (
  <div
    className="absolute bottom-6 right-6 opacity-70 group-hover:opacity-100 transition-opacity duration-500"
    style={{ transform: 'translateZ(15px)' }}
  >
    <div className="flex items-center gap-1.5">
      <div className="flex -space-x-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: `${color}${(10 - i).toString(16)}0` }}
          />
        ))}
      </div>
      <span className="text-[10px] font-mono text-gray-500 ml-1 font-semibold">+8 online</span>
    </div>
  </div>
);

const InstagramMockup: React.FC<{ color: string }> = ({ color: _color }) => (
  <div
    className="absolute bottom-6 left-6 right-6 opacity-80 group-hover:opacity-100 transition-opacity duration-500"
    style={{ transform: 'translateZ(15px)' }}
  >
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
        style={{
          background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
        }}
      >
        <Instagram className="w-5 h-5 text-white" />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="h-2 w-24 bg-gradient-to-r from-[#833ab4] to-[#fd1d1d] rounded-full opacity-50"></div>
        <div className="h-2 w-16 bg-gradient-to-r from-[#fd1d1d] to-[#fcb045] rounded-full opacity-50"></div>
      </div>
    </div>
  </div>
);

export default Features;