// WorkShowcase.tsx
// Premium services showcase — Bento Grid style
// Matches WabMeta landing page theme

import { 
  MessageCircle, Instagram, Code2, Target,
  ArrowRight, Check, TrendingUp, Zap,
  Globe, Smartphone, ShoppingBag, Sparkles,
  BarChart3, Users, Send, Bot
} from 'lucide-react';

const WorkShowcase = () => {
  return (
    <section className="relative py-24 bg-gradient-to-b from-white via-gray-50/40 to-white overflow-hidden">
      
      {/* Background decorative blobs */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-green-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-purple-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* ═══════ Section Header ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-14">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 mb-6 shadow-sm">
              <Sparkles size={14} className="text-orange-500" />
              <span className="text-gray-700 text-sm font-semibold tracking-wide">
                OUR SERVICES
              </span>
            </div>

            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.05] tracking-tight">
              What We{' '}
              <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 bg-clip-text text-transparent italic font-light">
                Build
              </span>{' '}
              & <br className="hidden md:block" />
              <span>Manage For You</span>
            </h2>
          </div>

          <div className="lg:col-span-4 lg:pt-10">
            <p className="text-gray-600 text-base md:text-lg leading-relaxed">
              From WhatsApp APIs to high-converting Meta Ads, Instagram automation, 
              and custom websites — everything your business needs under one roof.
            </p>
          </div>
        </div>

        {/* ═══════ Bento Grid Layout ═══════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* ━━━━━━ CARD 1: WhatsApp SaaS API (TALL HERO - 1 col x 2 rows) ━━━━━━ */}
          <WhatsAppCard />

          {/* ━━━━━━ Right column cards ━━━━━━ */}
          <MetaAdsCard />
          <InstagramCard />
          <WebDevCard />
          <AnalyticsCard />
        </div>

        {/* ═══════ Bottom CTA Bar ═══════ */}
        <div className="mt-12 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div>
            <h3 className="font-heading font-bold text-2xl md:text-3xl text-white mb-2">
              Let's build something{' '}
              <span className="text-green-400">extraordinary</span>
            </h3>
            <p className="text-gray-400 text-sm md:text-base">
              Trusted by 10,000+ businesses across India for digital growth.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5">
              Start a Project
              <ArrowRight size={16} />
            </button>
            <button className="inline-flex items-center gap-2 border-2 border-gray-700 hover:border-gray-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200">
              View Pricing
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════
// CARD 1: WhatsApp SaaS API (Hero Card - Tall)
// ═══════════════════════════════════════════════════════════════
const WhatsAppCard = () => (
  <div className="md:col-span-1 lg:row-span-2 bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 rounded-3xl p-7 lg:p-8 relative overflow-hidden group hover:scale-[1.01] transition-all duration-500 min-h-[500px] lg:min-h-[640px] flex flex-col shadow-xl shadow-green-500/20">
    
    {/* Decorative pattern */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />
    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />

    {/* Top: Badge + Arrow */}
    <div className="flex items-start justify-between mb-5 relative z-10">
      <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-3 py-1.5">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
        </span>
        <span className="text-[10px] font-bold text-white tracking-wider uppercase">
          Official Partner
        </span>
      </div>

      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover:bg-white group-hover:text-green-600 group-hover:rotate-45 group-hover:scale-110">
        <ArrowRight size={18} />
      </div>
    </div>

    {/* Heading */}
    <h3 className="font-heading font-bold text-3xl lg:text-4xl text-white leading-tight mb-3 relative z-10">
      WhatsApp<br />Business API
    </h3>
    <p className="text-green-50 text-sm leading-relaxed mb-6 relative z-10 max-w-[280px]">
      Full SaaS platform with bulk campaigns, AI chatbots, shared inbox, 
      automation flows & real-time analytics.
    </p>

    {/* Visual Stack - Mockup Cards */}
    <div className="flex-1 relative my-2">
      
      {/* Background card - Stats */}
      <div className="absolute top-2 right-2 w-48 bg-white rounded-2xl p-3 shadow-2xl rotate-[6deg] border border-white/50">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={14} className="text-green-600" />
          <span className="text-[10px] font-bold text-gray-900">Campaign Stats</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-[9px] text-gray-500">Sent</div>
            <div className="font-heading font-bold text-base text-gray-900">45K</div>
          </div>
          <div>
            <div className="text-[9px] text-gray-500">Read</div>
            <div className="font-heading font-bold text-base text-green-600">87%</div>
          </div>
        </div>
        <svg className="w-full mt-1" height="20" viewBox="0 0 100 20">
          <path d="M0,16 Q25,10 50,8 T100,3" stroke="#1b8b4b" strokeWidth="2" fill="none"/>
        </svg>
      </div>

      {/* Middle card - Chat */}
      <div className="absolute top-16 left-2 w-52 bg-white rounded-2xl p-3 shadow-2xl rotate-[-4deg] border border-white/50 z-10">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
          <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
            <MessageCircle size={13} className="text-white fill-white" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-900">WabMeta Store</div>
            <div className="text-[8px] text-green-600">● Online</div>
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-2 mb-1.5">
          <p className="text-[10px] text-gray-800">Hi! 50% off today 🎉</p>
        </div>
        <div className="bg-gray-100 rounded-xl p-2 ml-6">
          <p className="text-[10px] text-gray-800">Interested! 🛍️</p>
        </div>
      </div>

      {/* Front card - API */}
      <div className="absolute bottom-2 right-0 w-52 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-3 shadow-2xl rotate-[3deg] z-20 border border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 bg-green-500/20 border border-green-500/40 rounded-lg flex items-center justify-center">
            <Code2 size={13} className="text-green-400" />
          </div>
          <span className="text-[10px] font-bold text-white">Cloud API</span>
          <span className="ml-auto text-[8px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full font-bold">LIVE</span>
        </div>
        <div className="bg-black/40 rounded-lg p-2 font-mono">
          <p className="text-[8px] text-green-400">POST /messages</p>
          <p className="text-[8px] text-gray-500">200 OK · 124ms</p>
        </div>
      </div>
    </div>

    {/* Features list */}
    <div className="space-y-2 mt-4 relative z-10">
      {[
        'Unlimited Campaigns & Broadcasts',
        'AI Chatbot Flow Builder',
        'Multi-Agent Team Inbox',
      ].map((feat) => (
        <div key={feat} className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
            <Check size={10} className="text-white" strokeWidth={3} />
          </div>
          <span className="text-xs text-white/95">{feat}</span>
        </div>
      ))}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// CARD 2: Meta Ads Management
// ═══════════════════════════════════════════════════════════════
const MetaAdsCard = () => (
  <div className="md:col-span-1 bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200/60 rounded-3xl p-6 lg:p-7 relative overflow-hidden group hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-200/60 transition-all duration-500 min-h-[300px] flex flex-col">
    
    {/* Top: Icon + Arrow */}
    <div className="flex items-start justify-between mb-4">
      <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
        <Target size={20} className="text-white" />
      </div>
      <div className="w-9 h-9 rounded-xl bg-white/70 border border-blue-200 flex items-center justify-center text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-45 group-hover:scale-110">
        <ArrowRight size={15} />
      </div>
    </div>

    {/* Title + Desc */}
    <h3 className="font-heading font-bold text-xl lg:text-2xl text-blue-950 mb-2">
      Meta Ads<br />Management
    </h3>
    <p className="text-sm text-blue-800/80 leading-relaxed mb-4">
      Performance-driven Facebook & Instagram ad campaigns with conversion tracking.
    </p>

    {/* Mini visual: Ad performance */}
    <div className="mt-auto bg-white rounded-2xl p-3 shadow-md border border-blue-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-gray-900">Lead Campaign</span>
        <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">↑ 142%</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div>
          <div className="text-[8px] text-gray-500">Reach</div>
          <div className="font-heading font-bold text-xs text-gray-900">2.4M</div>
        </div>
        <div>
          <div className="text-[8px] text-gray-500">CTR</div>
          <div className="font-heading font-bold text-xs text-blue-600">8.7%</div>
        </div>
        <div>
          <div className="text-[8px] text-gray-500">Leads</div>
          <div className="font-heading font-bold text-xs text-green-600">3.2K</div>
        </div>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full w-[78%] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// CARD 3: Instagram Automation
// ═══════════════════════════════════════════════════════════════
const InstagramCard = () => (
  <div className="md:col-span-1 bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 border border-pink-200/60 rounded-3xl p-6 lg:p-7 relative overflow-hidden group hover:scale-[1.02] hover:shadow-xl hover:shadow-pink-200/60 transition-all duration-500 min-h-[300px] flex flex-col">
    
    {/* Top: Icon + Arrow */}
    <div className="flex items-start justify-between mb-4">
      <div className="w-11 h-11 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30">
        <Instagram size={20} className="text-white" />
      </div>
      <div className="w-9 h-9 rounded-xl bg-white/70 border border-pink-200 flex items-center justify-center text-pink-600 transition-all duration-300 group-hover:bg-pink-500 group-hover:text-white group-hover:rotate-45 group-hover:scale-110">
        <ArrowRight size={15} />
      </div>
    </div>

    {/* Title + Desc */}
    <h3 className="font-heading font-bold text-xl lg:text-2xl text-pink-955 mb-2">
      Instagram<br />Automation
    </h3>
    <p className="text-sm text-pink-800/80 leading-relaxed mb-4">
      Auto-reply DMs, comments & story mentions. Convert followers into customers.
    </p>

    {/* Mini visual: IG comment */}
    <div className="mt-auto bg-white rounded-2xl p-3 shadow-md border border-pink-100">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
          R
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold text-gray-900">@rohit_sharma</div>
          <div className="text-[9px] text-gray-500">commented on your post</div>
        </div>
        <Instagram size={11} className="text-pink-500" />
      </div>
      <div className="bg-gray-50 rounded-lg p-2 mb-2">
        <p className="text-[10px] text-gray-700">"Price please? 🛍️"</p>
      </div>
      <div className="flex items-center gap-1.5 bg-gradient-to-r from-pink-50 to-orange-50 rounded-lg p-1.5 border border-pink-100">
        <Zap size={10} className="text-pink-600" />
        <span className="text-[9px] text-pink-700 font-semibold">
          Auto-replied in DM ✨
        </span>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// CARD 4: Web Development
// ═══════════════════════════════════════════════════════════════
const WebDevCard = () => (
  <div className="md:col-span-1 bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200/60 rounded-3xl p-6 lg:p-7 relative overflow-hidden group hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-200/60 transition-all duration-500 min-h-[300px] flex flex-col">
    
    {/* Top: Icon + Arrow */}
    <div className="flex items-start justify-between mb-4">
      <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
        <Code2 size={20} className="text-white" />
      </div>
      <div className="w-9 h-9 rounded-xl bg-white/70 border border-purple-200 flex items-center justify-center text-purple-600 transition-all duration-300 group-hover:bg-purple-600 group-hover:text-white group-hover:rotate-45 group-hover:scale-110">
        <ArrowRight size={15} />
      </div>
    </div>

    {/* Title + Desc */}
    <h3 className="font-heading font-bold text-xl lg:text-2xl text-purple-950 mb-2">
      Web & App<br />Development
    </h3>
    <p className="text-sm text-purple-800/80 leading-relaxed mb-4">
      Custom websites, ecommerce stores & mobile apps tailored for your brand.
    </p>

    {/* Mini visual: Browser mockup */}
    <div className="mt-auto bg-white rounded-2xl shadow-md border border-purple-100 overflow-hidden">
      {/* Browser bar */}
      <div className="flex items-center gap-1 p-1.5 bg-gray-50 border-b border-gray-100">
        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
        <div className="ml-2 flex-1 bg-white rounded px-2 py-0.5 text-[8px] text-gray-500 flex items-center gap-1">
          <Globe size={8} />
          yourbrand.com
        </div>
      </div>
      {/* Content */}
      <div className="p-2.5 grid grid-cols-3 gap-1.5">
        <div className="col-span-3 h-2 bg-gradient-to-r from-purple-200 to-violet-200 rounded" />
        <div className="h-8 bg-purple-100 rounded flex items-center justify-center">
          <Smartphone size={12} className="text-purple-600" />
        </div>
        <div className="h-8 bg-violet-100 rounded flex items-center justify-center">
          <ShoppingBag size={12} className="text-violet-600" />
        </div>
        <div className="h-8 bg-purple-100 rounded flex items-center justify-center">
          <Globe size={12} className="text-purple-600" />
        </div>
        <div className="col-span-2 h-1.5 bg-gray-100 rounded" />
        <div className="h-1.5 bg-purple-300 rounded" />
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// CARD 5: Analytics & Growth (Wide card - spans 2 cols)
// ═══════════════════════════════════════════════════════════════
const AnalyticsCard = () => (
  <div className="md:col-span-2 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border border-orange-200/60 rounded-3xl p-6 lg:p-7 relative overflow-hidden group hover:scale-[1.01] hover:shadow-xl hover:shadow-orange-200/60 transition-all duration-500 min-h-[280px] flex flex-col md:flex-row gap-6">
    
    {/* Left: Content */}
    <div className="flex-1 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
          <TrendingUp size={20} className="text-white" />
        </div>
        <div className="w-9 h-9 rounded-xl bg-white/70 border border-orange-200 flex items-center justify-center text-orange-600 transition-all duration-300 group-hover:bg-orange-500 group-hover:text-white group-hover:rotate-45 group-hover:scale-110 md:hidden">
          <ArrowRight size={15} />
        </div>
      </div>

      <h3 className="font-heading font-bold text-2xl lg:text-3xl text-orange-950 mb-2 leading-tight">
        Lead Generation<br />& Analytics
      </h3>
      <p className="text-sm text-orange-900/80 leading-relaxed mb-4 max-w-sm">
        Capture leads from all channels, track every interaction, and turn data into 
        revenue with our unified CRM dashboard.
      </p>

      <div className="mt-auto flex flex-wrap gap-2">
        {['Multi-Channel', 'Real-time Sync', 'AI Insights'].map((tag) => (
          <span key={tag} className="text-[10px] font-semibold text-orange-700 bg-white/70 border border-orange-200 px-2.5 py-1 rounded-full">
            {tag}
          </span>
        ))}
      </div>
    </div>

    {/* Right: Dashboard visual */}
    <div className="flex-shrink-0 w-full md:w-64 lg:w-72 relative">
      <div className="bg-white rounded-2xl p-4 shadow-xl border border-orange-100">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
          <span className="text-xs font-bold text-gray-900">Lead Pipeline</span>
          <Users size={13} className="text-orange-500" />
        </div>

        {/* Pipeline stages */}
        <div className="space-y-2 mb-3">
          {[
            { label: 'Meta Ads', count: 142, color: 'bg-blue-500', width: 'w-full' },
            { label: 'WhatsApp', count: 98, color: 'bg-green-500', width: 'w-[70%]' },
            { label: 'Instagram', count: 67, color: 'bg-pink-500', width: 'w-[48%]' },
            { label: 'Website', count: 45, color: 'bg-purple-500', width: 'w-[32%]' },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[9px] text-gray-600 w-14 flex-shrink-0">{row.label}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${row.width} ${row.color} rounded-full transition-all`} />
              </div>
              <span className="text-[10px] font-bold text-gray-900 w-8 text-right">{row.count}</span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-2.5 border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[9px] text-gray-500">Total Leads</div>
              <div className="font-heading font-bold text-lg text-orange-700">352</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] text-green-600 font-bold">↑ 24.5%</div>
              <div className="text-[8px] text-gray-500">vs last month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hide arrow on mobile, show on desktop top right */}
      <div className="hidden md:flex absolute -top-2 -right-2 w-9 h-9 rounded-xl bg-white border border-orange-200 items-center justify-center text-orange-600 shadow-md transition-all duration-300 group-hover:bg-orange-500 group-hover:text-white group-hover:rotate-45 group-hover:scale-110">
        <ArrowRight size={15} />
      </div>
    </div>
  </div>
);

export default WorkShowcase;
