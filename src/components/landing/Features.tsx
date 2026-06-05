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
} from 'lucide-react';

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
    const walk = (x - startX) * 2; // drag speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // Touch handlers for mobile
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

  // Track scroll position for arrows & active dot
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const cardWidth = 420; // approx card width
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

  // Unified green theme colors for all cards
  const features = [
    {
      id: 1,
      icon: Send,
      title: 'Bulk Messaging',
      tag: 'CAMPAIGNS',
      description:
        'Send personalized messages to thousands instantly. Smart rate limiting handles 50,000+ messages per hour.',
      stat: '2.1M',
      statLabel: 'Messages sent',
      growth: '+18%',
      color: '#16a34a',
      lightColor: '#f0fdf4',
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    },
    {
      id: 2,
      icon: MessageSquare,
      title: 'Live Inbox',
      tag: 'CONVERSATIONS',
      description:
        'Unified inbox for your whole team. Assign chats, add notes, use quick replies, and never miss a message.',
      stat: '16',
      statLabel: 'Agents online',
      growth: 'Live',
      color: '#16a34a',
      lightColor: '#f0fdf4',
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    },
    {
      id: 3,
      icon: Bot,
      title: 'AI Chatbot',
      tag: 'AUTOMATION',
      description:
        'Visual drag-and-drop flow builder with AI integration. Connect OpenAI, Gemini, or use your custom model.',
      stat: '24/7',
      statLabel: 'Always on',
      growth: 'AI',
      color: '#16a34a',
      lightColor: '#f0fdf4',
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    },
    {
      id: 4,
      icon: Zap,
      title: 'Smart Workflows',
      tag: 'AUTOMATION',
      description:
        'Trigger-based automations that work while you sleep. If-then-else logic with 50+ pre-built templates.',
      stat: '90%',
      statLabel: 'Time saved',
      growth: '+42%',
      color: '#16a34a',
      lightColor: '#f0fdf4',
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    },
    {
      id: 5,
      icon: BarChart3,
      title: 'Analytics',
      tag: 'INSIGHTS',
      description:
        'Real-time dashboards. Track delivery rates, response times, campaign performance with exportable reports.',
      stat: '99.7%',
      statLabel: 'Delivery rate',
      growth: '+2.3%',
      color: '#16a34a',
      lightColor: '#f0fdf4',
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    },
    {
      id: 6,
      icon: Users,
      title: 'Team CRM',
      tag: 'COLLABORATION',
      description:
        'Built-in CRM for leads, deals, and contacts. Assign roles, set permissions, and track team performance.',
      stat: '12+',
      statLabel: 'Team members',
      growth: 'Pro',
      color: '#16a34a',
      lightColor: '#f0fdf4',
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    },
    {
      id: 7,
      icon: Instagram,
      title: 'Instagram DMs',
      tag: 'SOCIAL',
      description:
        'Auto-reply to DMs, comments, and stories. Manage Instagram and WhatsApp from one unified inbox.',
      stat: '3.2K',
      statLabel: 'Auto-replies/day',
      growth: '+67%',
      color: '#16a34a',
      lightColor: '#f0fdf4',
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    },
  ];

  return (
    <section id="features" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Soft colorful background */}
      <div className="absolute inset-0 -z-10 bg-slate-50">
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-40"
          style={{
            background:
              'radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[700px] h-[700px] rounded-full opacity-40"
          style={{
            background:
              'radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 70%)',
            filter: 'blur(90px)',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full opacity-30"
          style={{
            background:
              'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)',
            filter: 'blur(70px)',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      <div className="relative max-w-[1400px] mx-auto">
        {/* ✅ Header — clean editorial */}
        <div className="px-4 sm:px-6 lg:px-8 mb-12 lg:mb-16">
          <div className="grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 lg:col-span-7">
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-mono uppercase tracking-wider text-green-700 font-bold shadow-sm">
                  <Sparkles className="w-3 h-3" />
                  Features
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent max-w-[100px]" />
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight text-gray-900">
                Everything you need.
                <br />
                <span className="italic font-light text-gray-500">
                  Nothing you don't.
                </span>
              </h2>
            </div>

            <div className="col-span-12 lg:col-span-5 lg:pb-3">
              <p className="text-base lg:text-lg text-gray-700 leading-relaxed max-w-md">
                Seven powerful tools, deeply integrated. Drag to explore each
                one — built for teams who want to move fast.
              </p>

              {/* Navigation arrows */}
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => scrollByAmount(-440)}
                  disabled={!canScrollLeft}
                  className={`
                    w-12 h-12 rounded-full border bg-white
                    flex items-center justify-center
                    transition-all duration-300 ease-out
                    ${canScrollLeft
                      ? 'border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600 hover:shadow-lg hover:-translate-x-0.5 active:scale-95'
                      : 'border-gray-200 text-gray-300 cursor-not-allowed'
                    }
                  `}
                  aria-label="Previous"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={() => scrollByAmount(440)}
                  disabled={!canScrollRight}
                  className={`
                    w-12 h-12 rounded-full border bg-white
                    flex items-center justify-center
                    transition-all duration-300 ease-out
                    ${canScrollRight
                      ? 'border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600 hover:shadow-lg hover:translate-x-0.5 active:scale-95'
                      : 'border-gray-200 text-gray-300 cursor-not-allowed'
                    }
                  `}
                  aria-label="Next"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>

                {/* Drag hint */}
                <div className="hidden lg:flex items-center gap-2 ml-2 text-xs text-gray-500 font-medium">
                  <div className="flex gap-0.5">
                    <div className="w-1 h-4 bg-gray-400 rounded-full" />
                    <div className="w-1 h-4 bg-gray-300 rounded-full" />
                  </div>
                  Drag to explore
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Draggable Cards Container */}
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

            {/* Spacer at end */}
            <div className="flex-shrink-0 w-4" />
          </div>
        </div>

        {/* ✅ Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {features.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollRef.current?.scrollTo({ left: i * 420, behavior: 'smooth' })}
              className={`
                h-2 rounded-full transition-all duration-500 ease-out
                ${i === activeIndex
                  ? 'w-8 bg-gray-900'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
                }
              `}
              aria-label={`Go to feature ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Hide scrollbar globally for this section */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

// ============================================
// ✅ PREMIUM FEATURE CARD
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
      className="group relative flex-shrink-0 w-[340px] sm:w-[400px] lg:w-[420px] h-[500px]"
      style={{
        scrollSnapAlign: 'start',
        pointerEvents: isDragging ? 'none' : 'auto',
      }}
    >
      {/* ✅ Card Body */}
      <div
        className="relative h-full w-full rounded-[28px] overflow-hidden bg-white border border-gray-200/80 transition-all duration-500 ease-out group-hover:border-gray-300 group-hover:shadow-2xl group-hover:-translate-y-2"
        style={{
          boxShadow:
            '0 4px 20px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        {/* ✅ Top Color Bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5 transition-all duration-500 ease-out group-hover:h-2"
          style={{ background: feature.gradient }}
        />

        {/* ✅ Background tint on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${feature.lightColor} 0%, transparent 60%)`,
          }}
        />

        {/* ✅ Decorative corner gradient */}
        <div
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-10 group-hover:opacity-30 transition-opacity duration-700 ease-out pointer-events-none"
          style={{
            background: feature.gradient,
            filter: 'blur(40px)',
          }}
        />

        {/* ✅ Content */}
        <div className="relative h-full p-7 lg:p-8 flex flex-col">
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

            <div
              className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center transition-all duration-500 ease-out group-hover:bg-gray-900 group-hover:border-gray-900 group-hover:rotate-45"
            >
              <ArrowUpRight className="w-4 h-4 text-gray-700 transition-colors duration-500 group-hover:text-white" />
            </div>
          </div>

          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6"
            style={{
              background: feature.gradient,
              boxShadow: `0 12px 30px ${feature.color}40, inset 0 1px 2px rgba(255,255,255,0.4)`,
            }}
          >
            <Icon className="w-7 h-7 text-white drop-shadow-md" />
          </div>

          {/* Title */}
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 tracking-tight transition-transform duration-500 ease-out group-hover:translate-x-1">
            {feature.title}
          </h3>

          {/* Description */}
          <p className="text-[15px] text-gray-600 leading-relaxed mb-auto">
            {feature.description}
          </p>

          {/* Bottom: Stat */}
          <div className="mt-8 pt-6 border-t border-gray-100 transition-colors duration-500 group-hover:border-gray-200">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-4xl lg:text-5xl font-bold bg-clip-text text-transparent tracking-tight"
                    style={{ backgroundImage: feature.gradient }}
                  >
                    {feature.stat}
                  </span>
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