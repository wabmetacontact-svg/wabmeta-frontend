import React, { useRef, useState, useEffect } from 'react';
import {
  MessageSquare,
  Users,
  Bot,
  Zap,
  BarChart3,
  Send,
  ArrowUpRight,
  Instagram,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Settings2,
  CheckCircle2,
} from 'lucide-react';
import preferencesIllustration from '../../assets/images/preferences-illustration.png';

const Features: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.cursor = 'grabbing';
    scrollRef.current.style.scrollBehavior = 'auto';
  };

  const handleMouseLeave = () => {
    if (!scrollRef.current) return;
    setIsDragging(false);
    scrollRef.current.style.cursor = 'grab';
    scrollRef.current.style.scrollBehavior = 'smooth';
  };

  const handleMouseUp = () => {
    if (!scrollRef.current) return;
    setIsDragging(false);
    scrollRef.current.style.cursor = 'grab';
    scrollRef.current.style.scrollBehavior = 'smooth';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const cardWidth = 340;
    const newIndex = Math.round(scrollLeft / cardWidth);
    setActiveIndex(newIndex);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollByAmount = (amount: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  // Unified blue theme colors for all cards (using #2883CF)
  const features = [
    {
      id: 1,
      icon: Send,
      title: 'Bulk Messaging',
      tag: 'CAMPAIGNS',
      description: 'Send personalized messages to thousands instantly. Smart rate limiting handles 50,000+ msgs/hour.',
      stat: '2.1M',
      statLabel: 'Messages sent',
      growth: '+18%',
      color: '#2883CF',
      lightColor: '#f0f9ff',
      gradient: 'linear-gradient(135deg, #38bdf8 0%, #2883CF 100%)',
    },
    {
      id: 2,
      icon: MessageSquare,
      title: 'Live Inbox',
      tag: 'CONVERSATIONS',
      description: 'Unified inbox for your whole team. Assign chats, add notes, use quick replies.',
      stat: '16',
      statLabel: 'Agents online',
      growth: 'Live',
      color: '#2883CF',
      lightColor: '#f0f9ff',
      gradient: 'linear-gradient(135deg, #38bdf8 0%, #2883CF 100%)',
    },
    {
      id: 3,
      icon: Bot,
      title: 'AI Chatbot',
      tag: 'AUTOMATION',
      description: 'Visual drag-and-drop flow builder with AI. Connect OpenAI, Gemini, or your own model.',
      stat: '24/7',
      statLabel: 'Always on',
      growth: 'AI',
      color: '#2883CF',
      lightColor: '#f0f9ff',
      gradient: 'linear-gradient(135deg, #38bdf8 0%, #2883CF 100%)',
    },
    {
      id: 4,
      icon: Zap,
      title: 'Smart Workflows',
      tag: 'AUTOMATION',
      description: 'Trigger-based automations. If-then-else logic with 50+ pre-built templates.',
      stat: '90%',
      statLabel: 'Time saved',
      growth: '+42%',
      color: '#2883CF',
      lightColor: '#f0f9ff',
      gradient: 'linear-gradient(135deg, #38bdf8 0%, #2883CF 100%)',
    },
    {
      id: 5,
      icon: BarChart3,
      title: 'Analytics',
      tag: 'INSIGHTS',
      description: 'Real-time dashboards. Track delivery rates, response times, campaign performance.',
      stat: '99.7%',
      statLabel: 'Delivery rate',
      growth: '+2.3%',
      color: '#2883CF',
      lightColor: '#f0f9ff',
      gradient: 'linear-gradient(135deg, #38bdf8 0%, #2883CF 100%)',
    },
    {
      id: 6,
      icon: Users,
      title: 'Team CRM',
      tag: 'COLLABORATION',
      description: 'Built-in CRM for leads and deals. Assign roles, set permissions, track performance.',
      stat: '12+',
      statLabel: 'Team members',
      growth: 'Pro',
      color: '#2883CF',
      lightColor: '#f0f9ff',
      gradient: 'linear-gradient(135deg, #38bdf8 0%, #2883CF 100%)',
    },
    {
      id: 7,
      icon: Instagram,
      title: 'Instagram DMs',
      tag: 'SOCIAL',
      description: 'Auto-reply to DMs, comments, and stories. Manage Instagram alongside WhatsApp.',
      stat: '3.2K',
      statLabel: 'Auto-replies/day',
      growth: '+67%',
      color: '#2883CF',
      lightColor: '#f0f9ff',
      gradient: 'linear-gradient(135deg, #38bdf8 0%, #2883CF 100%)',
    },
  ];

  // Quick toggles list (matching illustration vibe)
  const quickToggles = [
    { label: 'Auto-reply', enabled: true },
    { label: 'Read receipts', enabled: true },
    { label: 'Bot fallback', enabled: false },
    { label: 'Smart routing', enabled: true },
  ];

  return (
    <section id="features" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Soft background */}
      <div className="absolute inset-0 -z-10 bg-slate-50">
        <div
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-35"
          style={{
            background:
              'radial-gradient(circle, rgba(40,131,207,0.2) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[700px] h-[700px] rounded-full opacity-35"
          style={{
            background:
              'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)',
            filter: 'blur(90px)',
          }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full opacity-20"
          style={{
            background:
              'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)',
            filter: 'blur(70px)',
            transform: 'translateY(-50%)',
          }}
        />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ✅ TOP: 2-column layout — Illustration + Heading */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center mb-16 lg:mb-20">

          {/* LEFT: Illustration with floating cards */}
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <div className="relative max-w-[500px] mx-auto">

              {/* Decorative background blob */}
              <div
                className="absolute inset-0 -z-10 rounded-full opacity-30"
                style={{
                  background:
                    'radial-gradient(circle, rgba(40,131,207,0.25) 0%, transparent 60%)',
                  filter: 'blur(60px)',
                }}
              />

              {/* Main illustration */}
              <img
                src={preferencesIllustration}
                alt="Customize your workspace"
                className="relative w-full h-auto drop-shadow-xl transition-transform duration-700 ease-out hover:scale-[1.02]"
              />

              {/* ✅ Floating Card 1 - Top right "Settings synced" */}
              <div
                className="absolute top-6 -right-2 lg:right-4 bg-white rounded-2xl shadow-xl p-3 pr-4 flex items-center gap-3 transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-2xl border border-gray-100"
                style={{ transform: 'rotate(-3deg)' }}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2883CF] to-sky-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">Synced</div>
                  <div className="text-[10px] text-gray-500">Just now</div>
                </div>
              </div>

              {/* ✅ Floating Card 2 - Bottom left "Quick toggles" */}
              <div
                className="absolute bottom-10 -left-4 lg:-left-8 bg-white rounded-2xl shadow-xl p-4 w-[200px] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-2xl border border-gray-100"
                style={{ transform: 'rotate(2deg)' }}
              >
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                  <Settings2 className="w-3.5 h-3.5 text-[#2883CF]" />
                  <span className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">
                    Quick Setup
                  </span>
                </div>
                <div className="space-y-2">
                  {quickToggles.map((toggle, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-xs text-gray-700 font-medium">
                        {toggle.label}
                      </span>
                      <div
                        className={`w-7 h-4 rounded-full relative transition-colors duration-300 ${
                          toggle.enabled ? 'bg-[#2883CF]' : 'bg-gray-200'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${
                            toggle.enabled ? 'left-3.5' : 'left-0.5'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ✅ Floating Badge - "100+ options" */}
              <div
                className="absolute top-1/2 -right-4 lg:right-0 bg-gradient-to-br from-[#2883CF] to-sky-600 text-white rounded-full px-4 py-2 shadow-lg transition-all duration-500 ease-out hover:scale-110 hover:rotate-3"
                style={{ transform: 'rotate(-8deg) translateY(-50%)' }}
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">100+ options</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Heading + Description */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-sky-200 text-xs font-mono uppercase tracking-wider text-sky-750 font-bold shadow-sm" style={{ color: '#2883CF' }}>
                <Settings2 className="w-3.5 h-3.5" />
                Built your way
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-sky-300 to-transparent max-w-[100px]" />
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight text-gray-900 mb-6">
              Configure once,
              <br />
              <span className="bg-gradient-to-r from-[#2883CF] via-sky-500 to-sky-400 bg-clip-text text-transparent">
                run forever.
              </span>
            </h2>

            <p className="text-base lg:text-lg text-gray-700 leading-relaxed max-w-xl mb-8">
              Every feature is built to be{' '}
              <span className="text-gray-900 font-semibold">customizable, modular, and intuitive</span>.
              Set your preferences once — let WabMeta handle the rest. Seven tools, deeply integrated,
              all controlled from one place.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-6 lg:gap-8 pt-6 border-t border-gray-200">
              <div>
                <div className="text-3xl font-bold text-gray-900">7</div>
                <div className="text-xs text-gray-600 mt-1 font-medium uppercase tracking-wider">
                  Core tools
                </div>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div>
                <div className="text-3xl font-bold text-gray-900">100+</div>
                <div className="text-xs text-gray-600 mt-1 font-medium uppercase tracking-wider">
                  Settings
                </div>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div>
                <div className="text-3xl font-bold text-gray-900">∞</div>
                <div className="text-xs text-gray-600 mt-1 font-medium uppercase tracking-wider">
                  Possibilities
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Section divider with controls */}
        <div className="flex items-end justify-between mb-8 pb-6 border-b border-gray-200">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-gray-500 font-bold block mb-2">
              Explore all features →
            </span>
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Drag to discover.
            </h3>
          </div>

          {/* Navigation arrows */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollByAmount(-360)}
              disabled={!canScrollLeft}
              className={`
                w-12 h-12 rounded-full border bg-white
                flex items-center justify-center
                transition-all duration-300 ease-out
                ${canScrollLeft
                  ? 'border-gray-300 text-gray-700 hover:border-[#2883CF] hover:text-[#2883CF] hover:shadow-lg hover:-translate-x-0.5 active:scale-95'
                  : 'border-gray-200 text-gray-300 cursor-not-allowed'
                }
              `}
              aria-label="Previous"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => scrollByAmount(360)}
              disabled={!canScrollRight}
              className={`
                w-12 h-12 rounded-full border bg-white
                flex items-center justify-center
                transition-all duration-300 ease-out
                ${canScrollRight
                  ? 'border-gray-300 text-gray-700 hover:border-[#2883CF] hover:text-[#2883CF] hover:shadow-lg hover:translate-x-0.5 active:scale-95'
                  : 'border-gray-200 text-gray-300 cursor-not-allowed'
                }
              `}
              aria-label="Next"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Draggable Cards Container - FULL WIDTH */}
      <div className="relative max-w-[1400px] mx-auto">
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          className="overflow-x-auto scrollbar-hide cursor-grab select-none"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            scrollBehavior: 'smooth',
            scrollSnapType: 'x mandatory',
          }}
        >
          <div className="flex gap-5 lg:gap-6 px-4 sm:px-6 lg:px-8 pb-8 pt-2">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                index={index}
                isDragging={isDragging}
              />
            ))}
            <div className="flex-shrink-0 w-4" />
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-6 px-4">
          {features.map((_, i) => (
            <button
              key={i}
              onClick={() =>
                scrollRef.current?.scrollTo({ left: i * 340, behavior: 'smooth' })
              }
              className={`
                h-2 rounded-full transition-all duration-500 ease-out
                ${i === activeIndex
                  ? 'w-8 bg-[#2883CF]'
                  : 'w-2 bg-sky-200 hover:bg-sky-300'
                }
              `}
              aria-label={`Go to feature ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

// ============================================
// ✅ FEATURE CARD
// ============================================
interface FeatureCardProps {
  feature: any;
  index: number;
  isDragging: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, isDragging }) => {
  const Icon = feature.icon;

  return (
    <div
      className="group relative flex-shrink-0 w-[320px] sm:w-[360px] h-[460px]"
      style={{
        scrollSnapAlign: 'start',
        pointerEvents: isDragging ? 'none' : 'auto',
      }}
    >
      <div
        className="relative h-full w-full rounded-[28px] overflow-hidden bg-white border border-gray-200/80 transition-all duration-500 ease-out group-hover:border-gray-300 group-hover:shadow-2xl group-hover:-translate-y-2"
        style={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        {/* Top colored bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5 transition-all duration-500 ease-out group-hover:h-2"
          style={{ background: feature.gradient }}
        />

        {/* Background tint on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${feature.lightColor} 0%, transparent 60%)`,
          }}
        />

        {/* Corner glow */}
        <div
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-10 group-hover:opacity-30 transition-opacity duration-700 ease-out pointer-events-none"
          style={{
            background: feature.gradient,
            filter: 'blur(40px)',
          }}
        />

        {/* Content */}
        <div className="relative h-full p-7 flex flex-col">
          {/* Top: Tag + Arrow */}
          <div className="flex items-start justify-between mb-8">
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase transition-all duration-300"
              style={{
                background: feature.lightColor,
                color: feature.color,
              }}
            >
              {feature.tag}
            </span>

            <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center transition-all duration-500 ease-out group-hover:bg-gray-900 group-hover:border-gray-900 group-hover:rotate-45">
              <ArrowUpRight className="w-4 h-4 text-gray-700 transition-colors duration-500 group-hover:text-white" />
            </div>
          </div>

          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6"
            style={{
              background: feature.gradient,
              boxShadow: `0 12px 30px rgba(40,131,207,0.25), inset 0 1px 2px rgba(255,255,255,0.4)`,
            }}
          >
            <Icon className="w-7 h-7 text-white drop-shadow-md" />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight transition-transform duration-500 ease-out group-hover:translate-x-1">
            {feature.title}
          </h3>

          {/* Description */}
          <p className="text-[14px] text-gray-600 leading-relaxed mb-auto">
            {feature.description}
          </p>

          {/* Bottom: Stat */}
          <div className="mt-6 pt-5 border-t border-gray-100 transition-colors duration-500 group-hover:border-gray-200">
            <div className="flex items-end justify-between">
              <div>
                <div
                  className="text-4xl font-bold bg-clip-text text-transparent tracking-tight"
                  style={{ backgroundImage: feature.gradient }}
                >
                  {feature.stat}
                </div>
                <div className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wider">
                  {feature.statLabel}
                </div>
              </div>

              <div
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-500 group-hover:scale-110"
                style={{
                  background: feature.lightColor,
                  color: feature.color,
                }}
              >
                {feature.growth}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;