import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Send, Database, Bot, Handshake, Megaphone, 
  Code2, TrendingUp, Sparkles, ArrowRight
} from 'lucide-react';

const AutomateBusiness = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const services = [
    {
      number: '01',
      title: 'Capture',
      titleLine2: 'Leads',
      icon: Send,
      bgColor: 'bg-[#FBB03B]',
      hoverShadow: 'hover:shadow-[#FBB03B]/30',
      size: 'w-36 h-36 xl:w-44 xl:h-44',
      position: 'translate-y-0',
    },
    {
      number: '02',
      title: 'Centralize',
      titleLine2: 'Data',
      icon: Database,
      bgColor: 'bg-[#1D1E4E]',
      hoverShadow: 'hover:shadow-indigo-900/40',
      size: 'w-36 h-36 xl:w-44 xl:h-44',
      position: '-translate-y-6',
    },
    {
      number: '03',
      title: 'AI',
      titleLine2: 'Automation',
      icon: Bot,
      bgColor: 'bg-teal-500',
      hoverShadow: 'hover:shadow-teal-500/40',
      size: 'w-32 h-32 xl:w-40 xl:h-40',
      position: 'translate-y-2',
    },
    {
      number: '04',
      title: 'Convert &',
      titleLine2: 'Close',
      icon: Handshake,
      bgColor: 'bg-[#1D1E4E]',
      hoverShadow: 'hover:shadow-indigo-900/40',
      size: 'w-36 h-36 xl:w-44 xl:h-44',
      position: '-translate-y-4',
    },
    {
      number: '05',
      title: 'Bulk',
      titleLine2: 'Campaigns',
      icon: Send,
      bgColor: 'bg-[#1D1E4E]',
      hoverShadow: 'hover:shadow-indigo-900/40',
      size: 'w-36 h-36 xl:w-44 xl:h-44',
      position: 'translate-y-4',
    },
    {
      number: '06',
      title: 'Website/App',
      titleLine2: 'des & dev',
      icon: Code2,
      bgColor: 'bg-pink-500',
      hoverShadow: 'hover:shadow-pink-500/30',
      size: 'w-36 h-36 xl:w-44 xl:h-44',
      position: '-translate-y-4',
    },
    {
      number: '07',
      title: 'SEO',
      titleLine2: 'Optimization',
      icon: TrendingUp,
      bgColor: 'bg-[#FBB03B]',
      hoverShadow: 'hover:shadow-[#FBB03B]/30',
      size: 'w-32 h-32 xl:w-40 xl:h-40',
      position: 'translate-y-4',
    },
    {
      number: '08',
      title: 'Digital',
      titleLine2: 'Marketing',
      icon: Megaphone,
      bgColor: 'bg-teal-500',
      hoverShadow: 'hover:shadow-teal-500/40',
      size: 'w-36 h-36 xl:w-44 xl:h-44',
      position: '-translate-y-2',
    },
  ];

  return (
    <section ref={sectionRef} className="relative py-16 bg-white overflow-hidden">
      
      {/* Custom Keyframes for pop-in entrance animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.6) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-pop-in {
          animation: popIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}} />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* The Card frame container */}
        <div className="bg-[#0b1329] border border-slate-800 rounded-[2.5rem] shadow-2xl p-8 md:p-16 relative overflow-hidden">
          
          {/* Background decorative pattern */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          {/* Decorative glows inside card */}
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            
            {/* ═══════ LEFT: Content (5 cols) ═══════ */}
            <div className="lg:col-span-5 space-y-6 relative">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700/50 rounded-full px-4 py-2">
                <Sparkles size={14} className="text-yellow-400" />
                <span className="text-white text-sm font-semibold">
                  How It Works
                </span>
              </div>

              {/* Heading */}
              <h2 className="font-heading text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-white leading-[1.15] tracking-tight">
                Automate Your Business in 8 Simple Steps
              </h2>

              {/* Subheading */}
              <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-md">
                From capturing leads to converting them into customers — our platform handles everything automatically.
              </p>

              {/* CTA Button */}
              <div className="pt-2">
                <Link
                  to="/signup"
                  className="group inline-flex items-center gap-2 bg-[#FBB03B] hover:bg-orange-500 text-slate-900 font-bold px-8 py-4 rounded-full transition-all duration-200 hover:shadow-2xl hover:shadow-[#FBB03B]/20 hover:-translate-y-0.5"
                >
                  <span className="text-lg">👉</span>
                  Get Free Demo
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4 pt-6">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-[#0b1329] flex items-center justify-center text-xs font-bold text-white">👩</div>
                  <div className="w-10 h-10 rounded-full bg-slate-600 border-2 border-[#0b1329] flex items-center justify-center text-xs font-bold text-white">🧑</div>
                  <div className="w-10 h-10 rounded-full bg-slate-500 border-2 border-[#0b1329] flex items-center justify-center text-xs font-bold text-white">👨</div>
                </div>
                <div>
                  <div className="font-heading font-black text-xl text-white">
                    2.3M+
                  </div>
                  <p className="text-[11px] text-slate-400 font-semibold tracking-wide uppercase">
                    5000+ Client reviews
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

            {/* ═══════ RIGHT: Circular Bubble Strip (7 cols) ═══════ */}
            <div className="lg:col-span-7 relative">
              
              {/* Mobile: Simple 2-column grid */}
              <div className="lg:hidden grid grid-cols-2 gap-6">
                {services.map((service, i) => (
                  <BubbleCard key={i} service={service} index={i} isVisible={isVisible} mobile />
                ))}
              </div>

              {/* Desktop: Staggered positioned bubble rows */}
              <div className="hidden lg:block relative min-h-[440px] w-full">
                {/* Row 1 */}
                <div className="flex justify-between items-end gap-3 mb-8">
                  {services.slice(0, 4).map((service, i) => (
                    <BubbleCard key={i} service={service} index={i} isVisible={isVisible} />
                  ))}
                </div>
                
                {/* Row 2 */}
                <div className="flex justify-between items-start gap-3">
                  {services.slice(4, 8).map((service, i) => (
                    <BubbleCard key={i + 4} service={service} index={i + 4} isVisible={isVisible} />
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Wave Decoration inside the card container */}
          <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none opacity-40 z-0">
            <svg 
              className="w-full h-full" 
              viewBox="0 0 1200 80" 
              preserveAspectRatio="none"
              fill="none"
            >
              {/* Wavy line */}
              <path 
                d="M 0 50 Q 150 20 300 45 T 600 40 T 900 50 T 1200 35" 
                stroke="#6366f1" 
                strokeWidth="2.5" 
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
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════
// Bubble Card Component
// ═══════════════════════════════════════════════════
const BubbleCard = ({ service, index, isVisible, mobile = false }: { service: any; index: number; isVisible: boolean; mobile?: boolean }) => {
  return (
    <div
      style={{
        animationDelay: `${index * 80}ms`,
        opacity: isVisible ? 1 : 0,
      }}
      className={`${isVisible ? 'animate-pop-in' : 'opacity-0'} ${mobile ? 'w-full' : ''}`}
    >
      <div 
        className={`relative ${mobile ? 'w-full aspect-square' : `${service.size} ${service.position}`} 
          ${service.bgColor} ${service.hoverShadow}
          rounded-full flex items-center justify-center
          transition-all duration-500 cursor-pointer
          hover:scale-105 hover:shadow-2xl
          group flex-shrink-0`}
      >
        {/* Number badge */}
        <div className="absolute -top-1 -right-1 w-8 h-8 md:w-9 md:h-9 bg-blue-500 rounded-full flex items-center justify-center border-4 border-[#0b1329] shadow-lg">
          <span className="text-white text-[10px] md:text-xs font-bold">{service.number}</span>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center justify-center text-center px-4">
          {/* Icon */}
          <div className="mb-2 group-hover:scale-110 transition-transform">
            <service.icon size={22} className="text-white" />
          </div>
          
          {/* Title */}
          <div className="text-white font-bold text-sm md:text-base leading-tight">
            {service.title}
          </div>
          {service.titleLine2 && (
            <div className="text-white font-bold text-sm md:text-base leading-tight">
              {service.titleLine2}
            </div>
          )}
        </div>

        {/* Subtle inner shadow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default AutomateBusiness;
