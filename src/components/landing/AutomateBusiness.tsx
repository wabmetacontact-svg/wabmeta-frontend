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
      bgColor: 'bg-orange-500',
      hoverShadow: 'hover:shadow-orange-500/30',
    },
    {
      number: '02',
      title: 'Centralize',
      titleLine2: 'Data',
      icon: Database,
      bgColor: 'bg-indigo-950',
      hoverShadow: 'hover:shadow-indigo-950/30',
    },
    {
      number: '03',
      title: 'AI',
      titleLine2: 'Automation',
      icon: Bot,
      bgColor: 'bg-teal-500',
      hoverShadow: 'hover:shadow-teal-500/30',
    },
    {
      number: '04',
      title: 'Convert &',
      titleLine2: 'Close',
      icon: Handshake,
      bgColor: 'bg-indigo-950',
      hoverShadow: 'hover:shadow-indigo-950/30',
    },
    {
      number: '05',
      title: 'Bulk',
      titleLine2: 'Campaigns',
      icon: Send,
      bgColor: 'bg-indigo-950',
      hoverShadow: 'hover:shadow-indigo-950/30',
    },
    {
      number: '06',
      title: 'Website/App',
      titleLine2: 'des & dev',
      icon: Code2,
      bgColor: 'bg-pink-500',
      hoverShadow: 'hover:shadow-pink-500/30',
    },
    {
      number: '07',
      title: 'SEO',
      titleLine2: 'Optimization',
      icon: TrendingUp,
      bgColor: 'bg-orange-500',
      hoverShadow: 'hover:shadow-orange-500/30',
    },
    {
      number: '08',
      title: 'Digital',
      titleLine2: 'Marketing',
      icon: Megaphone,
      bgColor: 'bg-teal-500',
      hoverShadow: 'hover:shadow-teal-500/30',
    },
  ];

  return (
    <section ref={sectionRef} className="relative py-20 lg:py-28 bg-slate-900 overflow-hidden">
      
      {/* Custom Keyframes for staggered entry animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

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
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          
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

          {/* ═══════ RIGHT: Grid of Cards (7 cols) ═══════ */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {services.map((service, i) => (
                <div
                  key={i}
                  style={{
                    animationDelay: `${i * 80}ms`,
                    opacity: isVisible ? 1 : 0,
                  } as React.CSSProperties}
                  className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'} relative`}
                >
                  <ServiceCard service={service} />
                </div>
              ))}
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
// Service Card Component
// ═══════════════════════════════════════════════════
const ServiceCard = ({ service }: { service: any }) => {
  return (
    <div className={`relative rounded-2xl p-5 border border-white/5 hover:border-white/15 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden ${service.bgColor} ${service.hoverShadow} group flex flex-col justify-between min-h-[140px] md:min-h-[160px]`}>
      
      {/* Subtle overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

      <div className="flex justify-between items-start mb-4">
        {/* Icon wrapper */}
        <div className="p-2 bg-white/10 rounded-xl text-white group-hover:scale-110 transition-transform">
          <service.icon size={20} />
        </div>
        {/* Number badge */}
        <span className="text-white/40 font-mono text-xs font-bold">
          {service.number}
        </span>
      </div>

      <div>
        <h3 className="font-heading font-bold text-white text-sm md:text-base leading-tight">
          {service.title}
        </h3>
        {service.titleLine2 && (
          <h3 className="font-heading font-bold text-white text-sm md:text-base leading-tight mt-0.5">
            {service.titleLine2}
          </h3>
        )}
      </div>
    </div>
  );
};

export default AutomateBusiness;
