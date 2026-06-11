// WorkShowcase.tsx - Complete Redesign
// Matches WabMeta landing page theme exactly

import { useEffect, useRef, useState } from 'react';
import { 
  ChevronLeft, ChevronRight, ArrowRight,
  MessageCircle, Bot, Instagram, TrendingUp,
  ShoppingBag, Cpu, Zap, Cloud
} from 'lucide-react';

interface ShowcaseItem {
  id: number;
  title: string;
  description: string;
  tag: string;
  tagBg: string;
  tagText: string;
  tagDot: string;
  cardBg: string;
  cardBorder: string;
  cardHover: string;
  titleColor: string;
  descColor: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  visual: React.ReactNode;
}

// ─── Mini Visual Components ───────────────────────────────────────────────

const WAVisual = () => (
  <div className="relative h-full flex items-end justify-center pb-2">
    {/* Background stacked cards */}
    <div className="absolute bottom-8 left-2 w-36 bg-white rounded-2xl p-2.5 shadow-md rotate-[-6deg] border border-gray-100">
      <div className="bg-green-50 rounded-xl p-2 mb-1.5 flex items-center gap-2">
        <span className="text-lg">📢</span>
        <div>
          <div className="text-[9px] font-bold text-gray-800">Flash Sale!</div>
          <div className="text-[8px] text-gray-500">50% off today</div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-2.5 bg-green-500 rounded-full" />
        <span className="text-[8px] text-gray-500 flex-1">Delivered</span>
        <span className="text-[8px] font-bold text-gray-800">44K</span>
      </div>
    </div>

    {/* Middle card */}
    <div className="absolute bottom-16 left-6 w-36 bg-white rounded-2xl p-2.5 shadow-lg rotate-[4deg] border border-gray-100 z-10">
      <div className="text-[9px] text-gray-500 mb-0.5">Open Rate</div>
      <div className="font-heading font-bold text-xl text-gray-900">87%</div>
      <svg className="w-full mt-1" height="18" viewBox="0 0 80 18">
        <path d="M0,14 Q20,10 40,6 T80,2" stroke="#1b8b4b" strokeWidth="1.5" fill="none" />
      </svg>
    </div>

    {/* Front card */}
    <div className="absolute bottom-4 left-10 w-40 bg-white rounded-2xl p-3 shadow-xl border border-green-100 z-20">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
          <MessageCircle size={13} className="text-white fill-white" />
        </div>
        <div>
          <div className="text-[10px] font-bold text-gray-900">Campaign Live</div>
          <div className="text-[8px] text-green-600 font-semibold">5.2x ROI</div>
        </div>
      </div>
      <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full w-[87%] bg-green-500 rounded-full" />
      </div>
    </div>
  </div>
);

const AIVisual = () => (
  <div className="mt-auto">
    <div className="bg-white rounded-2xl p-3 shadow-lg border border-pink-100">
      <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-gray-100">
        <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <Bot size={13} className="text-white" />
        </div>
        <div>
          <div className="text-[10px] font-bold text-gray-900">AI Assistant</div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[8px] text-green-600">Online</span>
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="bg-gray-50 rounded-xl p-2 max-w-[85%]">
          <p className="text-[10px] text-gray-700">Hi! How can I help? 👋</p>
        </div>
        <div className="bg-pink-100 rounded-xl p-2 ml-auto max-w-[80%]">
          <p className="text-[10px] text-pink-900">What's the price?</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-2 max-w-[85%]">
          <p className="text-[10px] text-gray-700">Starts ₹899/mo 🚀</p>
        </div>
      </div>
    </div>
  </div>
);

const IGVisual = () => (
  <div className="mt-auto">
    <div className="bg-white rounded-2xl p-3 shadow-lg border border-orange-100">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center">
          <Instagram size={13} className="text-white" />
        </div>
        <span className="text-[10px] font-bold text-gray-900">@user_123</span>
      </div>
      <p className="text-[10px] text-gray-600 mb-2">"What's the price?"</p>
      <div className="flex items-center gap-1.5 bg-orange-50 rounded-lg p-1.5">
        <Zap size={9} className="text-orange-500" />
        <span className="text-[9px] text-orange-700 font-semibold">
          Auto-replied in DM ✨
        </span>
      </div>
    </div>
  </div>
);

const CRMVisual = () => (
  <div className="mt-auto space-y-1.5">
    {[
      { stage: 'New', count: '24', color: 'bg-yellow-400' },
      { stage: 'Contacted', count: '18', color: 'bg-blue-400' },
      { stage: 'Won', count: '8', color: 'bg-green-500' },
    ].map((s, i) => (
      <div key={i} className="bg-white rounded-xl p-2 shadow-sm border border-gray-100 flex items-center gap-2">
        <div className={`w-1.5 h-6 ${s.color} rounded-full`} />
        <span className="text-[10px] text-gray-600 flex-1">{s.stage}</span>
        <span className="text-[11px] font-bold text-gray-900">{s.count}</span>
      </div>
    ))}
  </div>
);

const AutomationVisual = () => (
  <div className="mt-auto space-y-1.5">
    {[
      { label: 'Trigger', sub: 'User sends "Hi"', icon: Zap, color: 'bg-yellow-400', border: 'border-yellow-200' },
      { label: 'AI Reply', sub: 'Welcome message', icon: Bot, color: 'bg-purple-500', border: 'border-purple-200' },
      { label: 'Assign', sub: 'Sales Team', icon: TrendingUp, color: 'bg-green-500', border: 'border-green-200' },
    ].map((node, i) => (
      <div key={i}>
        <div className={`bg-white border ${node.border} rounded-xl p-2 shadow-sm flex items-center gap-2`}>
          <div className={`w-6 h-6 ${node.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <node.icon size={11} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-[9px] text-gray-500">{node.label}</div>
            <div className="text-[10px] font-bold text-gray-900 truncate">{node.sub}</div>
          </div>
        </div>
        {i < 2 && (
          <div className="flex justify-center my-0.5">
            <div className="w-px h-2 bg-violet-300" />
          </div>
        )}
      </div>
    ))}
  </div>
);

const EcomVisual = () => (
  <div className="mt-auto bg-white rounded-2xl p-3 shadow-lg border border-purple-100">
    {[
      { name: 'Sneakers', price: '₹1,299', emoji: '👟', sold: 142 },
      { name: 'Smart Watch', price: '₹2,999', emoji: '⌚', sold: 89 },
    ].map((p, i) => (
      <div key={i} className={`flex items-center gap-2 ${i > 0 ? 'mt-2 pt-2 border-t border-gray-100' : ''}`}>
        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-xl">
          {p.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold text-gray-900 truncate">{p.name}</div>
          <div className="text-[9px] text-gray-500">{p.price}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold text-purple-700">{p.sold}</div>
          <div className="text-[8px] text-gray-400">sold</div>
        </div>
      </div>
    ))}
  </div>
);

const MetaVisual = () => (
  <div className="mt-auto bg-white rounded-2xl p-3 shadow-lg border border-blue-100">
    <div className="grid grid-cols-2 gap-2 mb-2">
      {[
        { label: 'API Calls', val: '2.4M', color: 'text-blue-600' },
        { label: 'Webhooks', val: '98K', color: 'text-indigo-600' },
      ].map((s, i) => (
        <div key={i} className="bg-blue-50 rounded-xl p-2 text-center">
          <div className={`font-heading font-bold text-sm ${s.color}`}>{s.val}</div>
          <div className="text-[8px] text-gray-500">{s.label}</div>
        </div>
      ))}
    </div>
    <div className="flex items-center gap-1.5 bg-green-50 rounded-lg p-1.5">
      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
      <span className="text-[9px] text-green-700 font-semibold">All systems operational</span>
    </div>
  </div>
);

const JewelVisual = () => (
  <div className="mt-auto bg-white rounded-2xl p-3 shadow-lg border border-amber-100">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-300 rounded-full flex items-center justify-center text-base">
        💎
      </div>
      <div>
        <div className="text-[10px] font-bold text-gray-900">Diamond Tracker</div>
        <div className="text-[8px] text-amber-600 font-semibold">148 items</div>
      </div>
    </div>
    <div className="flex items-center gap-1 bg-amber-50 rounded-lg p-1.5">
      <span className="text-[9px] text-amber-700 font-semibold">
        ✦ Coming Soon — Q3 2026
      </span>
    </div>
  </div>
);

// ─── Showcase Data ───────────────────────────────────────────────────────

const showcaseItems: Omit<ShowcaseItem, 'visual'>[] = [
  {
    id: 1,
    title: 'WhatsApp Campaigns',
    description: 'Bulk broadcasts, smart templates & real-time delivery tracking.',
    tag: 'Active Now',
    tagBg: 'bg-green-50 border-green-200',
    tagText: 'text-green-700',
    tagDot: 'bg-green-500',
    cardBg: 'bg-purple-200',
    cardBorder: 'border-transparent',
    cardHover: 'hover:shadow-xl hover:shadow-purple-200/60 hover:scale-[1.02]',
    titleColor: 'text-purple-900',
    descColor: 'text-purple-800',
    icon: MessageCircle,
    iconBg: 'bg-green-500',
    iconColor: 'text-white',
  },
  {
    id: 2,
    title: 'AI Chatbot Builder',
    description: 'Drag & drop canvas. Answer FAQs and close sales 24/7.',
    tag: 'AI Powered',
    tagBg: 'bg-pink-50 border-pink-200',
    tagText: 'text-pink-700',
    tagDot: 'bg-pink-500',
    cardBg: 'bg-pink-300',
    cardBorder: 'border-transparent',
    cardHover: 'hover:shadow-xl hover:shadow-pink-200/60 hover:scale-[1.02]',
    titleColor: 'text-pink-900',
    descColor: 'text-pink-800',
    icon: Bot,
    iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
    iconColor: 'text-white',
  },
  {
    id: 3,
    title: 'Instagram Automation',
    description: 'Auto-reply to DMs, comments & story mentions instantly.',
    tag: 'Active Now',
    tagBg: 'bg-orange-50 border-orange-200',
    tagText: 'text-orange-700',
    tagDot: 'bg-orange-500',
    cardBg: 'bg-gradient-to-br from-yellow-200 to-orange-200',
    cardBorder: 'border-transparent',
    cardHover: 'hover:shadow-xl hover:shadow-orange-200/60 hover:scale-[1.02]',
    titleColor: 'text-orange-900',
    descColor: 'text-orange-800',
    icon: Instagram,
    iconBg: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
    iconColor: 'text-white',
  },
  {
    id: 4,
    title: 'CRM & Lead Pipeline',
    description: 'Track leads, manage pipeline & convert prospects automatically.',
    tag: 'Verified',
    tagBg: 'bg-blue-50 border-blue-200',
    tagText: 'text-blue-700',
    tagDot: 'bg-blue-500',
    cardBg: 'bg-orange-300',
    cardBorder: 'border-transparent',
    cardHover: 'hover:shadow-xl hover:shadow-orange-200/60 hover:scale-[1.02]',
    titleColor: 'text-orange-955',
    descColor: 'text-orange-900',
    icon: TrendingUp,
    iconBg: 'bg-orange-500',
    iconColor: 'text-white',
  },
  {
    id: 5,
    title: 'Automation Flows',
    description: 'Triggers, conditions, delays & actions — all in one canvas.',
    tag: 'High Yield',
    tagBg: 'bg-violet-50 border-violet-200',
    tagText: 'text-violet-700',
    tagDot: 'bg-violet-500',
    cardBg: 'bg-violet-200',
    cardBorder: 'border-transparent',
    cardHover: 'hover:shadow-xl hover:shadow-violet-200/60 hover:scale-[1.02]',
    titleColor: 'text-violet-900',
    descColor: 'text-violet-800',
    icon: Zap,
    iconBg: 'bg-violet-500',
    iconColor: 'text-white',
  },
  {
    id: 6,
    title: 'Ecommerce Platform',
    description: 'High-converting storefronts with built-in analytics dashboard.',
    tag: 'Verified',
    tagBg: 'bg-purple-50 border-purple-200',
    tagText: 'text-purple-700',
    tagDot: 'bg-purple-500',
    cardBg: 'bg-purple-300',
    cardBorder: 'border-transparent',
    cardHover: 'hover:shadow-xl hover:shadow-purple-200/60 hover:scale-[1.02]',
    titleColor: 'text-purple-900',
    descColor: 'text-purple-800',
    icon: ShoppingBag,
    iconBg: 'bg-purple-600',
    iconColor: 'text-white',
  },
  {
    id: 7,
    title: 'Meta Cloud API',
    description: 'Seamless integration with the entire Meta developer ecosystem.',
    tag: 'Stable Core',
    tagBg: 'bg-blue-50 border-blue-200',
    tagText: 'text-blue-700',
    tagDot: 'bg-blue-500',
    cardBg: 'bg-blue-200',
    cardBorder: 'border-transparent',
    cardHover: 'hover:shadow-xl hover:shadow-blue-200/60 hover:scale-[1.02]',
    titleColor: 'text-blue-900',
    descColor: 'text-blue-800',
    icon: Cloud,
    iconBg: 'bg-blue-600',
    iconColor: 'text-white',
  },
  {
    id: 8,
    title: 'Jewellery CRM',
    description: 'Luxury CRM with diamond inventory & customer relationship tools.',
    tag: 'Coming Soon',
    tagBg: 'bg-amber-50 border-amber-200',
    tagText: 'text-amber-700',
    tagDot: 'bg-amber-500',
    cardBg: 'bg-gradient-to-br from-amber-200 to-yellow-200',
    cardBorder: 'border-transparent',
    cardHover: 'hover:shadow-xl hover:shadow-amber-200/60 hover:scale-[1.02]',
    titleColor: 'text-amber-900',
    descColor: 'text-amber-800',
    icon: Cpu,
    iconBg: 'bg-amber-500',
    iconColor: 'text-white',
  },
];

// Map visuals to items
const visualMap: Record<number, React.ReactNode> = {
  1: <WAVisual />,
  2: <AIVisual />,
  3: <IGVisual />,
  4: <CRMVisual />,
  5: <AutomationVisual />,
  6: <EcomVisual />,
  7: <MetaVisual />,
  8: <JewelVisual />,
};

const items: ShowcaseItem[] = showcaseItems.map((item) => ({
  ...item,
  visual: visualMap[item.id],
}));

// Triple for seamless loop
const duplicated = [...items, ...items, ...items];

// ─── Main Component ───────────────────────────────────────────────────────

const WorkShowcase = () => {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  const CARD_WIDTH = 316; // 292px card + 24px gap
  const TOTAL_WIDTH = items.length * CARD_WIDTH;
  const SPEED = 0.45;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const animate = () => {
      if (!isPaused && el) {
        positionRef.current += SPEED;
        if (positionRef.current >= TOTAL_WIDTH) {
          positionRef.current = 0;
        }
        el.style.transform = `translateX(-${positionRef.current}px)`;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPaused]);

  const nudge = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    positionRef.current = dir === 'left'
      ? Math.max(0, positionRef.current - CARD_WIDTH)
      : positionRef.current + CARD_WIDTH;
    el.style.transform = `translateX(-${positionRef.current}px)`;
  };

  return (
    <section className="relative py-24 bg-gradient-to-b from-white via-gray-50/40 to-white overflow-hidden">

      {/* ── Background Blobs (match Hero style) ── */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-green-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-purple-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-pink-100/20 rounded-full blur-3xl pointer-events-none" />

      {/* ── Section Header ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">

          {/* Left: Badge + Heading + Sub */}
          <div className="max-w-2xl">

            {/* Badge - exact Pricing/Features style */}
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 mb-6 shadow-sm">
              <Zap size={14} className="text-orange-500" />
              <span className="text-gray-700 text-sm font-semibold tracking-wide">
                PLATFORM SHOWCASE
              </span>
            </div>

            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-4">
              Everything that powers{' '}
              <span className="text-green-500">your growth</span>{' '}
              <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                in one place
              </span>
            </h2>

            <p className="text-gray-600 text-lg leading-relaxed max-w-xl">
              From WhatsApp campaigns to AI chatbots — every tool your business 
              needs to automate, engage, and scale beautifully.
            </p>
          </div>

          {/* Right: Nav buttons — match Hero CTA style */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => nudge('left')}
              aria-label="Scroll Left"
              className="
                w-11 h-11 rounded-full border-2 border-gray-200 bg-white 
                flex items-center justify-center text-gray-700
                hover:border-green-500 hover:text-green-600 hover:shadow-lg hover:shadow-green-500/20
                transition-all duration-200 hover:-translate-y-0.5 active:scale-95
              "
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => nudge('right')}
              aria-label="Scroll Right"
              className="
                w-11 h-11 rounded-full bg-green-500 hover:bg-green-600 border-2 border-green-500
                flex items-center justify-center text-white
                hover:shadow-lg hover:shadow-green-500/30
                transition-all duration-200 hover:-translate-y-0.5 active:scale-95
              "
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Carousel Track ── */}
      <div
        className="relative w-full overflow-hidden px-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Edge fade - white to match section bg */}
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />

        {/* Cards */}
        <div
          ref={scrollRef}
          className="flex gap-6 will-change-transform py-4"
          style={{ width: 'max-content', transition: 'transform 0.5s ease-out' }}
        >
          {duplicated.map((item, index) => (
            <ShowcaseCard key={`${item.id}-${index}`} item={item} />
          ))}
        </div>
      </div>

      {/* ── Bottom CTA strip (matches Features marquee style) ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-14">
        <div className="bg-gradient-to-r from-green-500 via-green-600 to-green-500 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-green-500/20">
          <div>
            <h3 className="font-heading font-bold text-2xl md:text-3xl text-white mb-1">
              Ready to automate your business?
            </h3>
            <p className="text-green-100 text-sm md:text-base">
              Join 10,000+ businesses already growing with WabMeta.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="
              inline-flex items-center gap-2 bg-white text-green-700 
              font-semibold px-6 py-3 rounded-xl 
              hover:bg-green-50 hover:shadow-lg 
              transition-all duration-200 hover:-translate-y-0.5
            ">
              Start Free Trial
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="
              inline-flex items-center gap-2 border-2 border-white/40 text-white 
              font-semibold px-6 py-3 rounded-xl 
              hover:bg-white/10 hover:border-white/60
              transition-all duration-200 hover:-translate-y-0.5
            ">
              Book a Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Card Component ───────────────────────────────────────────────────────

const ShowcaseCard = ({ item }: { item: ShowcaseItem }) => {
  return (
    <div
      className={`
        group relative w-[292px] h-[420px] flex-shrink-0 
        rounded-3xl p-6 flex flex-col
        border border-white/60
        ${item.cardBg} ${item.cardHover}
        transition-all duration-500 cursor-pointer
        overflow-hidden
      `}
    >
      {/* ── Top Row: Icon + Tag + Arrow ── */}
      <div className="flex items-start justify-between mb-4">

        {/* Icon */}
        <div className={`w-11 h-11 ${item.iconBg} rounded-2xl flex items-center justify-center shadow-md flex-shrink-0`}>
          <item.icon size={20} className={item.iconColor} />
        </div>

        {/* Arrow button - exact style from Features hover */}
        <div className="
          w-9 h-9 rounded-xl bg-white/70 border border-white/80
          flex items-center justify-center text-gray-700 shadow-sm
          transition-all duration-300
          group-hover:bg-green-500 group-hover:border-green-500 
          group-hover:text-white group-hover:shadow-green-500/30
          group-hover:shadow-md group-hover:rotate-45 group-hover:scale-110
        ">
          <ArrowRight size={16} className="transition-transform duration-300" />
        </div>
      </div>

      {/* ── Status Tag ── */}
      <div className={`
        inline-flex items-center gap-1.5 self-start
        px-3 py-1 rounded-full border text-[10px] font-bold tracking-wide uppercase
        bg-white/60 border-white/80 mb-4
        ${item.tagText}
      `}>
        <span className="relative flex h-1.5 w-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${item.tagDot} opacity-60`} />
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${item.tagDot}`} />
        </span>
        {item.tag}
      </div>

      {/* ── Visual Area (flexible height) ── */}
      <div className="flex-1 flex flex-col justify-end">
        {item.visual}
      </div>

      {/* ── Title + Description ── */}
      <div className="mt-5 pt-4 border-t border-white/40">
        <h3 className={`font-heading font-bold text-lg mb-1 leading-snug ${item.titleColor} group-hover:opacity-90 transition-opacity`}>
          {item.title}
        </h3>
        <p className={`text-xs leading-relaxed ${item.descColor} opacity-80`}>
          {item.description}
        </p>
      </div>
    </div>
  );
};

export default WorkShowcase;
