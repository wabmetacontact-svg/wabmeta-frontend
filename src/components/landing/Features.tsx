import React, { useEffect, useRef, useState } from 'react';
import {
  MessageSquare, Users, Bot, Zap, BarChart3, Shield,
  Send, Clock, Globe, Layers, Smartphone, FileText,
  ArrowRight, Sparkles,
} from 'lucide-react';

/* ── Intersection Observer hook ──────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ── Data ────────────────────────────────────── */
const mainFeatures = [
  {
    icon: Send,
    title: 'Bulk Messaging',
    description:
      'Send personalized messages to thousands of contacts instantly with our powerful bulk messaging engine.',
    gradient: 'from-purple-500 to-violet-600',
    lightBg: 'bg-purple-50 dark:bg-purple-950/30',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    iconColor: 'text-purple-600 dark:text-purple-400',
    points: ['CSV Upload', 'Variable Mapping', 'Scheduled Sending', 'Template Support'],
  },
  {
    icon: MessageSquare,
    title: 'Live Chat Inbox',
    description:
      'Manage all your WhatsApp conversations in one unified inbox with team collaboration features.',
    gradient: 'from-violet-500 to-indigo-600',
    lightBg: 'bg-violet-50 dark:bg-violet-950/30',
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconColor: 'text-violet-600 dark:text-violet-400',
    points: ['Real-time Chat', 'Agent Assignment', 'Quick Replies', 'Chat Labels'],
  },
  {
    icon: Bot,
    title: 'Chatbot Builder',
    description:
      'Create powerful chatbots with our visual flow builder. No coding required.',
    gradient: 'from-indigo-500 to-purple-600',
    lightBg: 'bg-indigo-50 dark:bg-indigo-950/30',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    points: ['Drag & Drop Builder', 'AI Integration', 'Conditional Logic', 'API Webhooks'],
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description:
      'Work together with your team efficiently with role-based access and assignment rules.',
    gradient: 'from-purple-600 to-pink-600',
    lightBg: 'bg-pink-50 dark:bg-pink-950/30',
    iconBg: 'bg-pink-100 dark:bg-pink-900/40',
    iconColor: 'text-pink-600 dark:text-pink-400',
    points: ['Multi-agent Support', 'Role Management', 'Performance Tracking', 'Internal Notes'],
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description:
      'Track message delivery, engagement rates, and team performance with detailed analytics.',
    gradient: 'from-violet-600 to-purple-700',
    lightBg: 'bg-purple-50 dark:bg-purple-950/30',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    iconColor: 'text-purple-750 dark:text-purple-300',
    points: ['Real-time Stats', 'Custom Reports', 'Export Data', 'Trend Analysis'],
  },
  {
    icon: Zap,
    title: 'Automation Workflows',
    description:
      'Automate repetitive tasks and create powerful workflows to save time.',
    gradient: 'from-indigo-600 to-violet-700',
    lightBg: 'bg-indigo-50 dark:bg-indigo-950/30',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
    iconColor: 'text-indigo-700 dark:text-indigo-300',
    points: ['Trigger Actions', 'Auto-responses', 'Scheduled Tasks', 'API Integration'],
  },
];

const extras = [
  { icon: Globe,      title: 'Multi-language Support', desc: 'Support customers in 100+ languages' },
  { icon: Shield,     title: 'Enterprise Security',    desc: 'End-to-end encryption & compliance' },
  { icon: Clock,      title: '24/7 Availability',      desc: 'Never miss a customer message' },
  { icon: Layers,     title: 'Template Management',    desc: 'Pre-approved message templates' },
  { icon: Smartphone, title: 'Mobile App',             desc: 'Manage on the go with our app' },
  { icon: FileText,   title: 'Rich Media Support',     desc: 'Send images, videos, documents' },
];

/* ── Feature Card ────────────────────────────── */
const FeatureCard: React.FC<{
  feature: typeof mainFeatures[0];
  index: number;
  inView: boolean;
}> = ({ feature, index, inView }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`group relative bg-white dark:bg-[#0d0d18]
        rounded-3xl p-7 border border-gray-100 dark:border-white/5
        hover:border-transparent
        transition-all duration-700 cursor-default overflow-hidden
        shadow-sm hover:shadow-[0_20px_60px_rgba(168,85,247,0.15)]
        ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ transitionDelay: inView ? `${index * 100}ms` : '0ms' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Purple border on hover */}
      <div className={`absolute inset-0 rounded-3xl transition-opacity duration-500
        ${hovered ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: `linear-gradient(white, white) padding-box,
            linear-gradient(135deg, #a855f7, #7c3aed) border-box`,
          border: '1.5px solid transparent',
        }}
      />

      {/* Subtle gradient tint */}
      <div className={`absolute inset-0 rounded-3xl transition-opacity duration-500
        ${feature.lightBg} ${hovered ? 'opacity-100' : 'opacity-0'}`} />

      <div className="relative z-10">
        {/* Icon */}
        <div className={`w-13 h-13 rounded-2xl ${feature.iconBg}
          flex items-center justify-center mb-5
          transition-transform duration-500
          ${hovered ? 'scale-110 rotate-3' : ''}`}
          style={{ width: 52, height: 52 }}
        >
          <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {feature.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
          {feature.description}
        </p>

        <ul className="space-y-2">
          {feature.points.map((pt) => (
            <li key={pt} className="flex items-center gap-2 text-sm
              text-gray-600 dark:text-gray-400"
            >
              <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r
                ${feature.gradient} flex-shrink-0`} />
              {pt}
            </li>
          ))}
        </ul>

        <div className={`mt-5 pt-4 border-t border-gray-100
          dark:border-white/5 flex items-center gap-1.5 text-sm
          font-medium transition-all duration-300 ${feature.iconColor}
          ${hovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}
        >
          Learn more
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

/* ── Main Component ───────────────────────────── */
const Features: React.FC = () => {
  const { ref, inView } = useInView();

  return (
    <section id="features" className="py-28 bg-gray-50/50 dark:bg-[#080810]
      relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px]
          bg-purple-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px]
          bg-purple-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-800/30 text-xs font-semibold text-purple-650 dark:text-purple-400 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Core Features</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
            Scale Your Business on <span className="gradient-text">WhatsApp</span>
          </h2>
          <p className="text-base text-gray-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Discover a comprehensive suite of tools built to engage customers, automate workflows, and accelerate growth.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {mainFeatures.map((feat, idx) => (
            <FeatureCard key={feat.title} feature={feat} index={idx} inView={inView} />
          ))}
        </div>

        {/* Extras Grid */}
        <div className="bg-gradient-purple p-8 md:p-12 rounded-3xl relative overflow-hidden shadow-purple">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="text-center mb-10">
              <h3 className="text-2xl md:text-3xl font-black text-white">And That's Not All...</h3>
              <p className="text-purple-100 text-sm font-medium mt-2">Everything you need in a single enterprise-ready platform</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {extras.map((extra) => (
                <div key={extra.title} className="flex items-start gap-4 p-4 rounded-2xl bg-white/10 hover:bg-white/15 transition-all duration-300 border border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <extra.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{extra.title}</h4>
                    <p className="text-xs text-purple-100 mt-1 font-medium leading-relaxed">{extra.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;