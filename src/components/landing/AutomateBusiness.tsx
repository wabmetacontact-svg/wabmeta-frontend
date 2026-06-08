import { Link } from 'react-router-dom';
import {
  Send, Database, Bot, Handshake, Megaphone, 
  Code2, TrendingUp, Sparkles, ArrowRight
} from 'lucide-react';

const AutomateBusiness = () => {
  const services = [
    {
      number: '01',
      title: 'Capture',
      titleLine2: 'Leads',
      icon: Send,
      bgColor: 'bg-orange-400',
      hoverShadow: 'hover:shadow-orange-400/40',
      size: 'w-44 h-44 md:w-48 md:h-48',
      position: 'translate-y-0',
    },
    {
      number: '02',
      title: 'Centralize',
      titleLine2: 'Data',
      icon: Database,
      bgColor: 'bg-indigo-900',
      hoverShadow: 'hover:shadow-indigo-900/40',
      size: 'w-44 h-44 md:w-48 md:h-48',
      position: '-translate-y-6',
    },
    {
      number: '03',
      title: 'AI',
      titleLine2: 'Automation',
      icon: Bot,
      bgColor: 'bg-teal-500',
      hoverShadow: 'hover:shadow-teal-500/40',
      size: 'w-40 h-40 md:w-44 md:h-44',
      position: 'translate-y-2',
    },
    {
      number: '04',
      title: 'Convert &',
      titleLine2: 'Close',
      icon: Handshake,
      bgColor: 'bg-indigo-900',
      hoverShadow: 'hover:shadow-indigo-900/40',
      size: 'w-44 h-44 md:w-48 md:h-48',
      position: '-translate-y-4',
    },
    {
      number: '05',
      title: 'Bulk',
      titleLine2: 'Campaigns',
      icon: Send,
      bgColor: 'bg-indigo-900',
      hoverShadow: 'hover:shadow-indigo-900/40',
      size: 'w-44 h-44 md:w-48 md:h-48',
      position: 'translate-y-2',
    },
    {
      number: '06',
      title: 'Website/App',
      titleLine2: 'des & dev',
      icon: Code2,
      bgColor: 'bg-pink-500',
      hoverShadow: 'hover:shadow-pink-500/40',
      size: 'w-44 h-44 md:w-48 md:h-48',
      position: '-translate-y-4',
    },
    {
      number: '07',
      title: 'SEO',
      titleLine2: 'Optimization',
      icon: TrendingUp,
      bgColor: 'bg-orange-400',
      hoverShadow: 'hover:shadow-orange-400/40',
      size: 'w-40 h-40 md:w-44 md:h-44',
      position: 'translate-y-4',
    },
    {
      number: '08',
      title: 'Digital',
      titleLine2: 'Marketing',
      icon: Megaphone,
      bgColor: 'bg-teal-500',
      hoverShadow: 'hover:shadow-teal-500/40',
      size: 'w-44 h-44 md:w-48 md:h-48',
      position: '-translate-y-2',
    },
  ];

  return (
    <section className="relative py-20 lg:py-28 bg-slate-900 overflow-hidden">
      
      {/* Background decorative pattern */}
      <div className="absolute inset-0 opacity-30">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          
          {/* ═══════ LEFT: Content (5 cols) ═══════ */}
          <div className="lg:col-span-5 space-y-6 relative">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full px-4 py-2">
              <Sparkles size={14} className="text-yellow-400" />
              <span className="text-white text-sm font-semibold">
                How It Works
              </span>
            </div>

            {/* Heading */}
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
              Automate Your Business in 8 Powerful Ways
            </h2>

            {/* Subheading */}
            <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-md">
              From capturing leads to closing deals — WabMeta handles 
              everything you need to scale your business automatically.
            </p>

            {/* CTA Button */}
            <div className="pt-2">
              <Link
                to="/signup"
                className="group inline-flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white font-bold px-8 py-4 rounded-full transition-all duration-200 hover:shadow-2xl hover:shadow-orange-400/40 hover:-translate-y-0.5"
              >
                <span className="text-lg">👉</span>
                Get Free Demo
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-3 pt-4">
              <div className="flex -space-x-2">
                {[
                  'from-orange-400 to-pink-500',
                  'from-blue-400 to-purple-500',
                  'from-green-400 to-teal-500',
                ].map((grad, i) => (
                  <div 
                    key={i} 
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${grad} border-2 border-slate-900`}
                  />
                ))}
              </div>
              <div>
                <div className="font-heading font-bold text-2xl text-white">
                  10K+
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Trusted Businesses
                </p>
              </div>
            </div>

            {/* Arrow decoration */}
            <div className="absolute -top-4 right-0 hidden md:block">
              <svg width="80" height="50" viewBox="0 0 80 50" fill="none">
                <path 
                  d="M 5 10 Q 30 -5 60 25" 
                  stroke="white" 
                  strokeWidth="1.5" 
                  fill="none" 
                  strokeLinecap="round"
                />
                <path 
                  d="M 55 20 L 62 27 L 55 32" 
                  stroke="white" 
                  strokeWidth="1.5" 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* ═══════ RIGHT: Service Bubbles Grid (7 cols) ═══════ */}
          <div className="lg:col-span-7 relative">
            
            {/* Mobile: Simple grid */}
            <div className="lg:hidden grid grid-cols-2 gap-6">
              {services.map((service, i) => (
                <BubbleCard key={i} service={service} mobile />
              ))}
            </div>

            {/* Desktop: Custom positioned bubbles */}
            <div className="hidden lg:block">
              {/* Row 1 */}
              <div className="flex justify-between items-end gap-2 mb-6">
                {services.slice(0, 4).map((service, i) => (
                  <BubbleCard key={i} service={service} />
                ))}
              </div>
              
              {/* Row 2 */}
              <div className="flex justify-between items-start gap-2">
                {services.slice(4, 8).map((service, i) => (
                  <BubbleCard key={i + 4} service={service} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ Bottom Wave Decoration ═══════ */}
        <div className="relative h-20 mt-12">
          <svg 
            className="absolute inset-0 w-full h-full" 
            viewBox="0 0 1200 80" 
            preserveAspectRatio="none"
            fill="none"
          >
            {/* Wavy line */}
            <path 
              d="M 0 50 Q 150 20 300 45 T 600 40 T 900 50 T 1200 35" 
              stroke="#6366f1" 
              strokeWidth="2.5" 
              strokeOpacity="0.4"
              fill="none"
            />
            
            {/* Dots on the wave */}
            {[
              { cx: 100, cy: 45 },
              { cx: 320, cy: 50 },
              { cx: 560, cy: 42 },
              { cx: 800, cy: 48 },
              { cx: 1050, cy: 40 },
            ].map((dot, i) => (
              <g key={i}>
                <circle cx={dot.cx} cy={dot.cy} r="6" fill="#6366f1" opacity="0.3" />
                <circle cx={dot.cx} cy={dot.cy} r="3" fill="#3b82f6" />
              </g>
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════
// Bubble Card Component
// ═══════════════════════════════════════════════════
const BubbleCard = ({ service, mobile = false }: { service: any; mobile?: boolean }) => {
  return (
    <div 
      className={`relative ${mobile ? 'w-full aspect-square' : `${service.size} ${service.position}`} 
        ${service.bgColor} ${service.hoverShadow}
        rounded-full flex items-center justify-center
        transition-all duration-500 cursor-pointer
        hover:scale-105 hover:shadow-2xl
        group flex-shrink-0`}
    >
      {/* Number badge */}
      <div className="absolute -top-1 -right-1 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-lg">
        <span className="text-white text-xs font-bold">{service.number}</span>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center text-center px-4">
        {/* Icon */}
        <div className="mb-2 group-hover:scale-110 transition-transform">
          <service.icon size={mobile ? 24 : 22} className="text-white" />
        </div>
        
        {/* Title */}
        <div className="text-white font-bold text-base md:text-lg leading-tight">
          {service.title}
        </div>
        {service.titleLine2 && (
          <div className="text-white font-bold text-base md:text-lg leading-tight">
            {service.titleLine2}
          </div>
        )}
      </div>

      {/* Subtle inner shadow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
    </div>
  );
};

export default AutomateBusiness;
