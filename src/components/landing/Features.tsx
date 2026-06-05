import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView, useSpring, useMotionValue } from 'framer-motion';
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
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

// ============================================
// ✅ Animated Counter Component
// ============================================
const AnimatedCounter: React.FC<{ value: number; suffix?: string; duration?: number }> = ({
  value,
  suffix = '',
  duration = 2,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = value;
    const incrementTime = (duration * 1000) / end;
    const step = Math.max(1, Math.floor(end / 100));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        start += step; // fix step addition
        setCount(Math.min(start, end));
      }
    }, incrementTime);
    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

// ============================================
// ✅ Premium Tilt Card with Spring Physics
// ============================================
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

const TiltCard: React.FC<TiltCardProps> = ({ children, className = '', intensity = 8 }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [intensity, -intensity]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-intensity, intensity]), {
    stiffness: 150,
    damping: 20,
  });

  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
    setGlarePos({ x: (x + 0.5) * 100, y: (y + 0.5) * 100 });
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        transformPerspective: 1200,
      }}
      className={`relative ${className}`}
    >
      {/* Premium glare effect */}
      <div
        className="absolute inset-0 rounded-[inherit] pointer-events-none z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.15) 25%, transparent 60%)`,
          opacity: isHovered ? 1 : 0,
          mixBlendMode: 'overlay',
        }}
      />
      {children}
    </motion.div>
  );
};

// ============================================
// ✅ Scroll Reveal Wrapper
// ============================================
const ScrollReveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}> = ({ children, delay = 0, direction = 'up', className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const directionVariants = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directionVariants[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// ✅ MAIN COMPONENT
// ============================================
const Features: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Parallax effects for background blobs
  const blob1Y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const blob2Y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const headingY = useTransform(scrollYProgress, [0, 0.3], [50, 0]);

  const mainFeatures = [
    {
      id: 'bulk-messaging',
      icon: Send,
      title: 'Bulk Messaging',
      description: 'Send personalized messages to thousands instantly with smart rate limiting.',
      details: 'Built for scale — handles 50,000+ messages/hour with delivery tracking.',
      stat: 2100000,
      statSuffix: '+',
      statLabel: 'sent this month',
      growth: '+18%',
      accentColor: '#10b981',
      gridArea: 'lg:col-span-3 lg:row-span-2',
      bgGradient: 'from-green-100/80 via-emerald-50/60 to-transparent',
      iconBg: 'from-green-500 to-emerald-600',
      mockup: 'messaging',
    },
    {
      id: 'live-inbox',
      icon: MessageSquare,
      title: 'Live Inbox',
      description: 'Unified chat for your whole team. Never miss a conversation.',
      accentColor: '#3b82f6',
      gridArea: 'lg:col-span-3',
      bgGradient: 'from-blue-100/80 via-cyan-50/60 to-transparent',
      iconBg: 'from-blue-500 to-cyan-600',
      mockup: 'inbox',
    },
    {
      id: 'automation',
      icon: Zap,
      title: 'Smart Automation',
      description: 'Workflows that work while you sleep.',
      accentColor: '#f59e0b',
      gridArea: 'lg:col-span-3',
      bgGradient: 'from-amber-100/80 via-orange-50/60 to-transparent',
      iconBg: 'from-amber-500 to-orange-600',
      mockup: 'automation',
    },
    {
      id: 'chatbot',
      icon: Bot,
      title: 'AI Chatbot Builder',
      description: 'Drag, drop, deploy. Visual flow builder with AI integration.',
      details: 'Connect with OpenAI, Gemini & custom models.',
      accentColor: '#a855f7',
      gridArea: 'lg:col-span-3 lg:row-span-2',
      bgGradient: 'from-purple-100/80 via-pink-50/60 to-transparent',
      iconBg: 'from-purple-500 to-pink-600',
      mockup: 'bot',
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Numbers that matter, updated live.',
      accentColor: '#6366f1',
      gridArea: 'lg:col-span-2',
      bgGradient: 'from-indigo-100/80 via-violet-50/60 to-transparent',
      iconBg: 'from-indigo-500 to-violet-600',
      mockup: 'analytics',
    },
    {
      id: 'team',
      icon: Users,
      title: 'Team Collaboration',
      description: 'Built for teams, not just individuals.',
      accentColor: '#ef4444',
      gridArea: 'lg:col-span-2',
      bgGradient: 'from-rose-100/80 via-red-50/60 to-transparent',
      iconBg: 'from-rose-500 to-red-600',
      mockup: 'team',
    },
    {
      id: 'instagram',
      icon: Instagram,
      title: 'Instagram DMs',
      description: 'Auto-reply to DMs, comments & stories.',
      accentColor: '#e1306c',
      gridArea: 'lg:col-span-2',
      bgGradient: 'from-pink-100/80 via-purple-50/60 to-transparent',
      iconBg: 'from-[#833ab4] via-[#fd1d1d] to-[#fcb045]',
      mockup: 'instagram',
    },
  ];

  const additionalFeatures = [
    { icon: Globe, title: 'Multi-language', desc: '100+ languages supported' },
    { icon: Shield, title: 'Enterprise Security', desc: 'End-to-end encryption' },
    { icon: Clock, title: '24/7 Availability', desc: 'Never miss a message' },
    { icon: Layers, title: 'Template Manager', desc: 'Pre-approved templates' },
    { icon: Smartphone, title: 'Mobile Ready', desc: 'Manage from anywhere' },
    { icon: FileText, title: 'Rich Media', desc: 'Images, videos, docs' },
  ];

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative py-24 lg:py-32 overflow-hidden"
    >
      {/* ✅ Animated Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-green-50/30 to-white">
        {/* Parallax blobs */}
        <motion.div
          style={{ y: blob1Y }}
          className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full"
          aria-hidden
        >
          <div className="h-full w-full bg-gradient-to-br from-green-300/30 to-emerald-300/20 rounded-full blur-3xl" />
        </motion.div>

        <motion.div
          style={{ y: blob2Y }}
          className="absolute top-1/2 -right-40 h-[600px] w-[600px] rounded-full"
          aria-hidden
        >
          <div className="h-full w-full bg-gradient-to-br from-purple-300/20 to-blue-300/20 rounded-full blur-3xl" />
        </motion.div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `linear-gradient(rgba(16,185,129,0.15) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(16,185,129,0.15) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 80%)',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ✅ EDITORIAL Section Header */}
        <motion.div
          style={{ y: headingY }}
          className="grid grid-cols-12 gap-6 mb-16 lg:mb-20"
        >
          {/* Left: label + heading */}
          <div className="col-span-12 lg:col-span-8">
            <ScrollReveal direction="right">
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: 48 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="h-px bg-gradient-to-r from-green-500 to-transparent"
                />
                <span className="text-xs font-mono uppercase tracking-[0.25em] text-green-600 font-semibold">
                  What's inside
                </span>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.1}>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight">
                <span className="text-gray-900">Seven tools.</span>{' '}
                <span className="bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent italic font-light">
                  One platform.
                </span>
                <br />
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite]">
                    Zero duct tape.
                  </span>
                  <motion.span
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
                    viewport={{ once: true }}
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full origin-left"
                  />
                </span>
              </h2>
            </ScrollReveal>
          </div>

          {/* Right: description */}
          <div className="col-span-12 lg:col-span-4 lg:pt-12">
            <ScrollReveal direction="left" delay={0.3}>
              <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
                We didn't bolt features together. Every tool talks to the others — so your data, contacts, and chats move freely.
              </p>

              {/* Mini stats */}
              <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-200">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    <AnimatedCounter value={50} suffix="K+" />
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Active users</div>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    <AnimatedCounter value={99} suffix=".9%" />
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Uptime</div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </motion.div>

        {/* ✅ BENTO GRID - Premium Animated */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-5 auto-rows-[220px] lg:auto-rows-[200px]">
          {mainFeatures.map((feature, index) => (
            <ScrollReveal
              key={feature.id}
              delay={index * 0.08}
              direction="up"
              className={feature.gridArea}
            >
              <TiltCard className="h-full w-full" intensity={6}>
                <FeatureCard feature={feature} />
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>

        {/* ✅ "And more" section */}
        <div className="mt-24 lg:mt-32">
          <ScrollReveal>
            <div className="flex items-baseline justify-between mb-10 pb-4 border-b border-gray-200">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-green-600 font-semibold block mb-2">
                  + Plus the essentials
                </span>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Stuff you'd expect, done right.
                </h3>
              </div>
              <span className="text-xs font-mono text-gray-400 hidden lg:block">
                07 / 13
              </span>
            </div>
          </ScrollReveal>

          {/* Additional features list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
            {additionalFeatures.map((feature, index) => (
              <ScrollReveal key={feature.title} delay={index * 0.05}>
                <motion.div
                  whileHover={{ x: 6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="group flex items-center gap-4 py-5 border-b border-gray-200/70 hover:border-green-400/60 transition-colors duration-300 cursor-pointer"
                >
                  <motion.div
                    whileHover={{ rotate: 12, scale: 1.15 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className="w-11 h-11 rounded-xl border border-white/80 flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(240,253,244,0.5) 100%)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8), 0 2px 8px rgba(16,185,129,0.08)',
                    }}
                  >
                    <feature.icon className="w-4 h-4 text-gray-600 group-hover:text-green-600 transition-colors" />
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors duration-300">
                      {feature.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{feature.desc}</div>
                  </div>

                  <span className="text-xs font-mono text-gray-400 group-hover:text-green-600 transition-colors">
                    0{index + 8}
                  </span>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>

          {/* ✅ Bottom note */}
          <ScrollReveal delay={0.2}>
            <div className="mt-16 flex items-center gap-3 text-sm text-gray-600">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="w-5 h-5 text-green-500" />
              </motion.div>
              <span>
                And ~30 more we didn't list.
                <a
                  href="/documentation"
                  className="text-gray-900 font-semibold underline underline-offset-4 decoration-green-400 hover:text-green-700 hover:decoration-green-600 transition-colors ml-1"
                >
                  Browse the full docs →
                </a>
              </span>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Shimmer animation keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </section>
  );
};

// ============================================
// ✅ FEATURE CARD COMPONENT
// ============================================
interface FeatureCardProps {
  feature: any;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });

  return (
    <div
      ref={cardRef}
      className="group relative h-full w-full rounded-3xl overflow-hidden border border-white/70 transition-all duration-500 cursor-pointer hover:border-white/95 hover:shadow-2xl"
      style={{
        transformStyle: 'preserve-3d',
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow:
          'inset 0 1px 1px rgba(255,255,255,0.8), 0 8px 32px rgba(31,38,135,0.1)',
      }}
    >
      {/* Hover gradient bg */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
      />

      {/* Animated border glow on hover */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${feature.accentColor}20 0%, transparent 60%)`,
        }}
      />

      {/* Top edge glass highlight */}
      <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-3xl" />

      {/* Floating accent orb */}
      <motion.div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-700 blur-2xl"
        style={{ background: feature.accentColor }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 10, 0],
          y: [0, -10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Content */}
      <div
        className="relative h-full p-6 lg:p-7 flex flex-col z-10"
        style={{ transform: 'translateZ(20px)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={isInView ? { scale: 1, rotate: 0 } : {}}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            whileHover={{ scale: 1.15, rotate: -8 }}
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center border border-white/40`}
            style={{
              boxShadow: `0 8px 24px ${feature.accentColor}50, inset 0 1px 1px rgba(255,255,255,0.4)`,
              transform: 'translateZ(40px)',
            }}
          >
            <feature.icon className="w-6 h-6 text-white drop-shadow-sm" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
          >
            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
          </motion.div>
        </div>

        {/* Title + Description */}
        <div className="flex-1">
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2 tracking-tight group-hover:translate-x-1 transition-transform duration-500">
            {feature.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>

          {feature.details && (
            <p className="text-sm text-gray-500 mt-3 leading-relaxed">{feature.details}</p>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="absolute bottom-6 right-6 text-right"
            style={{ transform: 'translateZ(30px)' }}
          >
            <div className="flex items-center justify-end gap-1.5 mb-1">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-[10px] font-bold text-green-600">{feature.growth}</span>
            </div>
            <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
              <AnimatedCounter value={feature.stat} suffix="K+" />
            </div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mt-0.5">
              {feature.statLabel}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// ============================================
// ✅ ANIMATED MOCKUPS - Light Theme
// ============================================

const MessagingMockup: React.FC<{ color: string }> = ({ color }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div
      ref={ref}
      className="absolute bottom-20 left-6 right-32 opacity-80 group-hover:opacity-100 transition-opacity duration-500"
      style={{ transform: 'translateZ(20px)' }}
    >
      <div className="space-y-2.5">
        {[100, 75, 90].map((width, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <div
              className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                boxShadow: `0 2px 8px ${color}40`,
              }}
            >
              {['A', 'B', 'C'][i]}
            </div>
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: `${width}%` } : {}}
              transition={{ delay: 0.4 + i * 0.15, duration: 0.8, ease: 'easeOut' }}
              className="h-2 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${color}40, ${color}20)`,
              }}
            />
            <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color }} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const InboxMockup: React.FC<{ color: string }> = ({ color }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div
      ref={ref}
      className="absolute bottom-6 right-6 opacity-80 group-hover:opacity-100 transition-opacity duration-500"
      style={{ transform: 'translateZ(15px)' }}
    >
      <div className="flex -space-x-2">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, x: 20 }}
            animate={isInView ? { scale: 1, x: 0 } : {}}
            transition={{ type: 'spring', stiffness: 200, delay: 0.3 + i * 0.1 }}
            className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-bold text-white shadow-md"
            style={{
              background: `linear-gradient(135deg, ${color}, ${color}aa)`,
            }}
          >
            {String.fromCharCode(64 + i)}
          </motion.div>
        ))}
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ type: 'spring', stiffness: 200, delay: 0.6 }}
          className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-700 shadow-md"
          style={{
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(8px)',
          }}
        >
          +12
        </motion.div>
      </div>
      <div className="mt-3 text-right">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-green-600">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          16 online now
        </div>
      </div>
    </div>
  );
};

const BotMockup: React.FC<{ color: string }> = ({ color }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const nodes = [
    { x: 0, y: 0, label: 'Trigger' },
    { x: 60, y: 35, label: 'AI Reply' },
    { x: 120, y: 70, label: 'Send' },
  ];

  return (
    <div
      ref={ref}
      className="absolute bottom-16 left-6 right-6 opacity-90 group-hover:opacity-100 transition-opacity duration-500"
      style={{ transform: 'translateZ(20px)' }}
    >
      <div className="relative h-28">
        {nodes.map((node, i) => (
          <React.Fragment key={i}>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.3 + i * 0.2, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.1, y: -2 }}
              className="absolute px-3 py-1.5 rounded-lg text-[9px] font-bold flex items-center gap-1.5 shadow-md"
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                background: `linear-gradient(135deg, white, ${color}15)`,
                border: `1.5px solid ${color}60`,
                color: color,
                backdropFilter: 'blur(8px)',
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: color }}
              />
              {node.label}
            </motion.div>
            {i < 2 && (
              <motion.svg
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isInView ? { pathLength: 1, opacity: 0.6 } : {}}
                transition={{ delay: 0.5 + i * 0.2, duration: 0.6 }}
                className="absolute"
                style={{
                  left: `${node.x + 70}px`,
                  top: `${node.y + 18}px`,
                  width: '20px',
                  height: '25px',
                  overflow: 'visible',
                }}
              >
                <motion.path
                  d="M0 0 Q 5 12 18 22"
                  stroke={color}
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="3 3"
                />
              </motion.svg>
            )}
          </React.Fragment>
        ))}

        {/* Pulse dot at end */}
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute w-3 h-3 rounded-full"
          style={{
            left: '160px',
            top: '78px',
            background: color,
            boxShadow: `0 0 12px ${color}`,
          }}
        />
      </div>
    </div>
  );
};

const AutomationMockup: React.FC<{ color: string }> = ({ color }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div
      ref={ref}
      className="absolute bottom-6 left-6 right-6 opacity-80 group-hover:opacity-100 transition-opacity duration-500"
      style={{ transform: 'translateZ(15px)' }}
    >
      <div className="flex items-center gap-1.5 flex-wrap">
        {['IF', '→', 'THEN', '→', 'SEND'].map((text, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 200 }}
          >
            {text === '→' ? (
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                className="text-sm font-bold"
                style={{ color }}
              >
                →
              </motion.span>
            ) : (
              <span
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold shadow-sm"
                style={{
                  background: `linear-gradient(135deg, white, ${color}15)`,
                  color: color,
                  border: `1.5px solid ${color}50`,
                }}
              >
                {text}
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const AnalyticsMockup: React.FC<{ color: string }> = ({ color }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div
      ref={ref}
      className="absolute bottom-6 left-6 right-6 opacity-80 group-hover:opacity-100 transition-opacity duration-500"
      style={{ transform: 'translateZ(15px)' }}
    >
      <div className="flex items-end gap-1 h-14">
        {[40, 65, 50, 80, 95, 70, 100].map((height, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={isInView ? { height: `${height}%` } : {}}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
            className="flex-1 rounded-t-md"
            style={{
              background: `linear-gradient(to top, ${color}, ${color}40)`,
              boxShadow: `0 -2px 12px ${color}40`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

const TeamMockup: React.FC<{ color: string }> = ({ color }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div
      ref={ref}
      className="absolute bottom-6 right-6 opacity-80 group-hover:opacity-100 transition-opacity duration-500"
      style={{ transform: 'translateZ(15px)' }}
    >
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, y: 10 }}
              animate={isInView ? { scale: 1, y: 0 } : {}}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 + i * 0.08 }}
              className="w-7 h-7 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[10px] font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                opacity: 1 - i * 0.1,
              }}
            >
              {String.fromCharCode(64 + i)}
            </motion.div>
          ))}
        </div>
        <span className="text-[10px] font-mono text-gray-600 ml-1 font-semibold">+8</span>
      </div>
    </div>
  );
};

const InstagramMockup: React.FC<{ color: string }> = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div
      ref={ref}
      className="absolute bottom-6 left-6 right-6 opacity-90 group-hover:opacity-100 transition-opacity duration-500"
      style={{ transform: 'translateZ(15px)' }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={isInView ? { scale: 1, rotate: 0 } : {}}
          transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
          whileHover={{ scale: 1.1, rotate: 12 }}
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
          }}
        >
          <Instagram className="w-5 h-5 text-white" />
        </motion.div>
        <div className="flex flex-col gap-1.5 flex-1">
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: '70%' } : {}}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="h-2 bg-gradient-to-r from-[#833ab4] to-[#fd1d1d] rounded-full opacity-60"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: '50%' } : {}}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="h-2 bg-gradient-to-r from-[#fd1d1d] to-[#fcb045] rounded-full opacity-60"
          />
        </div>
      </div>
    </div>
  );
};

export default Features;