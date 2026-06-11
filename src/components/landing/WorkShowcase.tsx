// WorkShowcase.tsx
// Expandable Accordion Services Section — matches WabMeta theme

import { useState } from 'react';
import { 
  MessageCircle, Instagram, Code2, Target, TrendingUp,
  ArrowUpRight, X, Sparkles, Check, ArrowRight,
  BarChart3, Bot, Smartphone, ShoppingBag, Globe,
  Zap, Users, Send
} from 'lucide-react';

interface Service {
  id: string;
  number: string;
  title: string;
  description: string;
  tags: string[];
  icon: React.ElementType;
  accentColor: string; // for badge, button bg
  iconBg: string;
  visual: React.ReactNode;
}

const WorkShowcase = () => {
  // Default open service
  const [activeId, setActiveId] = useState<string>('whatsapp');

  const toggle = (id: string) => {
    setActiveId(activeId === id ? '' : id);
  };

  return (
    <section id="services" className="relative py-24 bg-gradient-to-b from-white via-gray-50/40 to-white overflow-hidden">
      
      {/* Background blobs */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-green-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-orange-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* ═══════ Section Header ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-end">
          
          <div className="lg:col-span-7">
            {/* Mini label with line */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-10 bg-orange-500" />
              <span className="text-orange-500 text-sm font-semibold tracking-wide uppercase">
                Our Specialization
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-gray-955">
              <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent italic font-light">
                Services
              </span>{' '}
              <span>| We</span>{' '}
              <span className="bg-gradient-to-r from-green-700 via-emerald-600 to-green-700 bg-clip-text text-transparent">
                Provide
              </span>
            </h2>
          </div>

          <div className="lg:col-span-5">
            <p className="text-gray-600 text-base md:text-lg leading-relaxed">
              From WhatsApp APIs to Meta Ads, Instagram automation, and custom web 
              development — everything your business needs to scale, under one roof.
            </p>
          </div>
        </div>

        {/* ═══════ Accordion List ═══════ */}
        <div className="space-y-3">
          {services.map((service) => (
            <ServiceAccordion 
              key={service.id}
              service={service}
              isOpen={activeId === service.id}
              onToggle={() => toggle(service.id)}
            />
          ))}
        </div>

        {/* ═══════ View All Button ═══════ */}
        <div className="flex justify-center mt-10">
          <button className="group inline-flex items-center gap-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold pl-6 pr-2 py-2 rounded-full transition-all duration-300 hover:shadow-xl hover:shadow-gray-900/20 hover:-translate-y-0.5">
            <span className="text-sm">View All Services</span>
            <span className="w-9 h-9 bg-orange-500 group-hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors">
              <ArrowRight size={16} className="text-white group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════
// Accordion Item Component
// ═══════════════════════════════════════════════════════════════
const ServiceAccordion = ({ 
  service, 
  isOpen, 
  onToggle 
}: { 
  service: Service; 
  isOpen: boolean; 
  onToggle: () => void;
}) => {
  return (
    <div
      className={`
        rounded-2xl overflow-hidden transition-all duration-500 ease-out
        ${isOpen 
          ? 'bg-gray-900 shadow-2xl shadow-gray-900/20 border border-gray-800' 
          : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md'
        }
      `}
    >
      {/* ━━━ Header Row (Always visible) ━━━ */}
      <button
        onClick={onToggle}
        className={`
          w-full flex items-center justify-between gap-4 p-5 md:p-6 cursor-pointer
          transition-colors duration-300
          ${isOpen ? '' : 'hover:bg-gray-50'}
        `}
      >
        {/* Left: Number + Title + Icon */}
        <div className="flex items-center gap-4 md:gap-6 min-w-0 flex-1">
          {/* Number */}
          <span className={`
            font-heading font-bold text-base md:text-lg flex-shrink-0 w-10
            ${isOpen ? 'text-gray-500' : 'text-gray-400'}
          `}>
            {service.number}.
          </span>

          {/* Icon (mobile/desktop) */}
          <div className={`
            w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0
            transition-all duration-300
            ${isOpen 
              ? `${service.iconBg} shadow-lg` 
              : 'bg-gray-100'
            }
          `}>
            <service.icon 
              size={18} 
              className={isOpen ? 'text-white' : 'text-gray-700'} 
            />
          </div>

          {/* Title */}
          <h3 className={`
            font-heading font-bold text-lg md:text-xl truncate
            ${isOpen ? 'text-white' : 'text-gray-900'}
          `}>
            {service.title}
          </h3>
        </div>

        {/* Right: Action Button */}
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
          transition-all duration-300
          ${isOpen 
            ? `${service.accentColor} text-white rotate-0 scale-100` 
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900'
          }
        `}>
          {isOpen ? <X size={16} strokeWidth={2.5} /> : <ArrowUpRight size={16} strokeWidth={2.5} />}
        </div>
      </button>

      {/* ━━━ Expanded Content (Smooth slide) ━━━ */}
      <div className={`
        grid transition-all duration-500 ease-out
        ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
      `}>
        <div className="overflow-hidden">
          <div className="px-5 md:px-6 pb-6 md:pb-8 pt-2">
            <div className="md:pl-[88px]"> {/* Align with title (40px icon + 24px gap + 24px number) */}
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {service.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="text-xs font-medium text-gray-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-5 max-w-2xl">
                {service.description}
              </p>

              {/* Visual */}
              <div className="rounded-2xl overflow-hidden bg-gray-800/50 border border-gray-700/50">
                {service.visual}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Visual Components for each service
// ═══════════════════════════════════════════════════════════════

// 1. WhatsApp Visual
const WhatsAppVisual = () => (
  <div className="relative p-6 md:p-8 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent min-h-[260px] flex items-center justify-center gap-4 md:gap-6 flex-wrap">
    
    {/* Stats card */}
    <div className="w-48 bg-white rounded-2xl p-3 shadow-2xl rotate-[-4deg]">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 size={14} className="text-green-600" />
        <span className="text-[10px] font-bold text-gray-900">Campaign Stats</span>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <div className="text-[9px] text-gray-500">Sent</div>
          <div className="font-heading font-bold text-base text-gray-900">45K</div>
        </div>
        <div>
          <div className="text-[9px] text-gray-500">Read</div>
          <div className="font-heading font-bold text-base text-green-600">87%</div>
        </div>
      </div>
      <svg className="w-full" height="20" viewBox="0 0 100 20">
        <path d="M0,16 Q25,10 50,8 T100,3" stroke="#1b8b4b" strokeWidth="2" fill="none"/>
      </svg>
    </div>

    {/* Chat card */}
    <div className="w-52 bg-white rounded-2xl p-3 shadow-2xl rotate-[3deg]">
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

    {/* API card */}
    <div className="w-48 bg-gray-950 border border-gray-800 rounded-2xl p-3 shadow-2xl rotate-[-2deg]">
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
);

// 2. Meta Ads Visual
const MetaAdsVisual = () => (
  <div className="p-6 md:p-8 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent min-h-[260px] flex items-center justify-center">
    <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold text-gray-900">Lead Generation Campaign</span>
          <div className="text-[10px] text-gray-500">Active · 7 days running</div>
        </div>
        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">↑ 142%</span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Reach', val: '2.4M', color: 'text-gray-900' },
          { label: 'CTR', val: '8.7%', color: 'text-blue-600' },
          { label: 'Leads', val: '3.2K', color: 'text-green-600' },
        ].map((s, i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-2.5 text-center">
            <div className="text-[9px] text-gray-500 mb-1">{s.label}</div>
            <div className={`font-heading font-bold text-base ${s.color}`}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-gray-500">Spend</span>
          <span className="font-bold text-gray-900">₹48,250 / ₹60,000</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full w-[78%] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

// 3. Instagram Visual
const InstagramVisual = () => (
  <div className="p-6 md:p-8 bg-gradient-to-br from-pink-500/10 via-orange-500/5 to-transparent min-h-[260px] flex items-center justify-center gap-4 flex-wrap">
    
    {/* Comment card */}
    <div className="w-56 bg-white rounded-2xl p-3 shadow-2xl rotate-[-3deg]">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
          R
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold text-gray-900">@rohit_sharma</div>
          <div className="text-[9px] text-gray-500">commented on your post</div>
        </div>
        <Instagram size={12} className="text-pink-500" />
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

    {/* DM card */}
    <div className="w-56 bg-white rounded-2xl p-3 shadow-2xl rotate-[3deg]">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
        <div className="w-7 h-7 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center">
          <Instagram size={13} className="text-white" />
        </div>
        <div>
          <div className="text-[10px] font-bold text-gray-900">Direct Message</div>
          <div className="text-[8px] text-pink-600">● Auto-bot</div>
        </div>
      </div>
      <div className="bg-pink-50 rounded-xl p-2 mb-1.5">
        <p className="text-[10px] text-gray-800">Hey! Thanks for reaching out 👋</p>
      </div>
      <div className="bg-gray-100 rounded-xl p-2 ml-6">
        <p className="text-[10px] text-gray-800">Send catalog please</p>
      </div>
    </div>
  </div>
);

// 4. Web Dev Visual
const WebDevVisual = () => (
  <div className="p-6 md:p-8 bg-gradient-to-br from-purple-500/10 via-violet-500/5 to-transparent min-h-[260px] flex items-center justify-center">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Browser bar */}
      <div className="flex items-center gap-1.5 p-2.5 bg-gray-50 border-b border-gray-100">
        <div className="w-2 h-2 rounded-full bg-red-400" />
        <div className="w-2 h-2 rounded-full bg-yellow-400" />
        <div className="w-2 h-2 rounded-full bg-green-400" />
        <div className="ml-3 flex-1 bg-white rounded px-3 py-1 text-[10px] text-gray-500 flex items-center gap-1.5 border border-gray-200">
          <Globe size={10} />
          yourbrand.com
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Hero section */}
        <div className="h-3 bg-gradient-to-r from-purple-200 to-violet-200 rounded w-2/3" />
        <div className="h-2 bg-gray-100 rounded w-full" />
        <div className="h-2 bg-gray-100 rounded w-3/4" />
        
        {/* Cards grid */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          {[
            { icon: Smartphone, color: 'bg-purple-100 text-purple-600' },
            { icon: ShoppingBag, color: 'bg-violet-100 text-violet-600' },
            { icon: Globe, color: 'bg-purple-100 text-purple-600' },
          ].map((item, i) => (
            <div key={i} className={`${item.color} h-14 rounded-lg flex items-center justify-center`}>
              <item.icon size={16} />
            </div>
          ))}
        </div>

        {/* Button row */}
        <div className="flex gap-2 pt-1">
          <div className="flex-1 h-6 bg-purple-500 rounded" />
          <div className="w-16 h-6 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  </div>
);

// 5. Analytics Visual
const AnalyticsVisual = () => (
  <div className="p-6 md:p-8 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent min-h-[260px] flex items-center justify-center">
    <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
        <span className="text-xs font-bold text-gray-900">Lead Pipeline</span>
        <Users size={13} className="text-orange-500" />
      </div>

      <div className="space-y-2.5 mb-3">
        {[
          { label: 'Meta Ads', count: 142, color: 'bg-blue-500', width: 'w-full' },
          { label: 'WhatsApp', count: 98, color: 'bg-green-500', width: 'w-[70%]' },
          { label: 'Instagram', count: 67, color: 'bg-pink-500', width: 'w-[48%]' },
          { label: 'Website', count: 45, color: 'bg-purple-500', width: 'w-[32%]' },
        ].map((row, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[10px] text-gray-600 w-16 flex-shrink-0">{row.label}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${row.width} ${row.color} rounded-full transition-all`} />
            </div>
            <span className="text-[11px] font-bold text-gray-900 w-10 text-right">{row.count}</span>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-3 border border-orange-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-500">Total Leads This Month</div>
            <div className="font-heading font-bold text-xl text-orange-700">352</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-green-600 font-bold">↑ 24.5%</div>
            <div className="text-[9px] text-gray-500">vs last month</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// Services Data
// ═══════════════════════════════════════════════════════════════
const services: Service[] = [
  {
    id: 'whatsapp',
    number: '01',
    title: 'WhatsApp Business API',
    description: 'Full SaaS platform with bulk campaigns, AI chatbots, shared team inbox, automation flows, and real-time analytics. Official Meta Partner with verified Cloud API access.',
    tags: ['Cloud API', 'Bulk Campaigns', 'AI Chatbot', 'Team Inbox', 'Automation Flows'],
    icon: MessageCircle,
    accentColor: 'bg-green-500',
    iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
    visual: <WhatsAppVisual />,
  },
  {
    id: 'meta-ads',
    number: '02',
    title: 'Meta Ads Management',
    description: 'Performance-driven Facebook & Instagram ad campaigns with advanced conversion tracking, audience targeting, and creative optimization to maximize ROAS.',
    tags: ['Facebook Ads', 'Instagram Ads', 'Lead Generation', 'Pixel Setup', 'A/B Testing'],
    icon: Target,
    accentColor: 'bg-blue-500',
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    visual: <MetaAdsVisual />,
  },
  {
    id: 'instagram',
    number: '03',
    title: 'Instagram Automation',
    description: 'Auto-reply to DMs, comments, and story mentions. Convert followers into customers with intelligent automation flows that engage your audience 24/7.',
    tags: ['DM Automation', 'Comment Replies', 'Story Mentions', 'Lead Capture'],
    icon: Instagram,
    accentColor: 'bg-pink-500',
    iconBg: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
    visual: <InstagramVisual />,
  },
  {
    id: 'web-dev',
    number: '04',
    title: 'Web & App Development',
    description: 'Custom websites, ecommerce stores, and mobile applications tailored to your brand. Built with modern stack — React, Next.js, React Native — fast, scalable, and beautiful.',
    tags: ['Web Development', 'Ecommerce', 'Mobile Apps', 'Custom CRM', 'API Integration'],
    icon: Code2,
    accentColor: 'bg-purple-500',
    iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600',
    visual: <WebDevVisual />,
  },
  {
    id: 'analytics',
    number: '05',
    title: 'Lead Generation & Analytics',
    description: 'Capture leads from all channels, track every interaction, and turn data into revenue with our unified CRM dashboard. Real-time insights for smarter decisions.',
    tags: ['Multi-Channel', 'CRM Dashboard', 'Real-time Sync', 'AI Insights', 'Reports'],
    icon: TrendingUp,
    accentColor: 'bg-orange-500',
    iconBg: 'bg-gradient-to-br from-orange-500 to-amber-600',
    visual: <AnalyticsVisual />,
  },
];

export default WorkShowcase;
