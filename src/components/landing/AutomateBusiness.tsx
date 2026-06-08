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
      bgColor: 'bg-orange-400',
      hoverShadow: 'hover:shadow-orange-400/40',
    },
    {
      number: '02',
      title: 'Centralize',
      titleLine2: 'Data',
      icon: Database,
      bgColor: 'bg-indigo-900',
      hoverShadow: 'hover:shadow-indigo-900/40',
    },
    {
      number: '03',
      title: 'AI',
      titleLine2: 'Automation',
      icon: Bot,
      bgColor: 'bg-teal-500',
      hoverShadow: 'hover:shadow-teal-500/40',
    },
    {
      number: '04',
      title: 'Convert &',
      titleLine2: 'Close',
      icon: Handshake,
      bgColor: 'bg-indigo-900',
      hoverShadow: 'hover:shadow-indigo-900/40',
    },
    {
      number: '05',
      title: 'Bulk',
      titleLine2: 'Campaigns',
      icon: Send,
      bgColor: 'bg-indigo-900',
      hoverShadow: 'hover:shadow-indigo-900/40',
    },
    {
      number: '06',
      title: 'Website/App',
      titleLine2: 'des & dev',
      icon: Code2,
      bgColor: 'bg-pink-500',
      hoverShadow: 'hover:shadow-pink-500/40',
    },
    {
      number: '07',
      title: 'SEO',
      titleLine2: 'Optimization',
      icon: TrendingUp,
      bgColor: 'bg-orange-400',
      hoverShadow: 'hover:shadow-orange-400/40',
    },
    {
      number: '08',
      title: 'Digital',
      titleLine2: 'Marketing',
      icon: Megaphone,
      bgColor: 'bg-teal-500',
      hoverShadow: 'hover:shadow-teal-500/40',
    },
  ];

  return (
    <section ref={sectionRef} className="relative py-20 lg:py-28 bg-slate-900 overflow-hidden">
      
      {/* Inject custom styling and responsive variables directly */}
      <style dangerouslySetInnerHTML={{ __html: `
        .orbit-container {
          --radius: 110px;
          --b-size: 80px;
        }
        @media (min-width: 768px) {
          .orbit-container {
            --radius: 220px;
            --b-size: 144px;
          }
        }
        
        @keyframes orbit-entry {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.2);
          }
          100% {
            opacity: 1;
            transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1);
          }
        }
        
        .animate-orbit-entry {
          animation: orbit-entry 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        @keyframes float-animation {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        
        .animate-float {
          animation: float-animation 6s ease-in-out infinite;
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
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center mb-16">
          
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

          {/* ═══════ RIGHT: Circular Orbit Layout (7 cols) ═══════ */}
          <div className="lg:col-span-7 flex items-center justify-center relative min-h-[340px] md:min-h-[640px]">
            
            {/* The circular orbit container */}
            <div className="relative w-[300px] h-[300px] md:w-[580px] md:h-[580px] flex items-center justify-center orbit-container">
              
              {/* Central Hub */}
              <div 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-24 h-24 md:w-36 md:h-36 rounded-full bg-slate-800 border border-slate-700/50 shadow-2xl flex flex-col items-center justify-center p-2 text-center"
                style={{
                  animation: isVisible ? 'orbit-entry 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none',
                  '--tx': '0px',
                  '--ty': '0px',
                } as React.CSSProperties}
              >
                <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping opacity-60" style={{ animationDuration: '3s' }} />
                <span className="text-white text-xs md:text-lg font-black font-heading tracking-wider uppercase bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">WabMeta</span>
                <span className="text-[8px] md:text-[11px] text-blue-400 font-extrabold uppercase tracking-widest mt-0.5 md:mt-1">Hub</span>
              </div>

              {/* Orbiting Service Bubbles */}
              {services.map((service, i) => {
                const angle = (i * 45 * Math.PI) / 180;
                const cosVal = Math.cos(angle);
                const sinVal = Math.sin(angle);
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      width: 'var(--b-size)',
                      height: 'var(--b-size)',
                      '--tx': `calc(${cosVal.toFixed(4)} * var(--radius))`,
                      '--ty': `calc(${sinVal.toFixed(4)} * var(--radius))`,
                      animationDelay: `${i * 120}ms`,
                    } as React.CSSProperties}
                    className={`absolute pointer-events-auto ${isVisible ? 'animate-orbit-entry' : 'opacity-0'}`}
                  >
                    {/* Floating Inner Wrapper */}
                    <div 
                      className="w-full h-full animate-float"
                      style={{
                        animationDelay: `${i * 0.4}s`,
                      }}
                    >
                      <BubbleCard service={service} />
                    </div>
                  </div>
                );
              })}

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
const BubbleCard = ({ service }: { service: any }) => {
  return (
    <div className={`relative w-full h-full rounded-full flex flex-col items-center justify-center text-center p-2 cursor-pointer transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-2xl ${service.bgColor} ${service.hoverShadow} group overflow-hidden`}>
      
      {/* Number badge */}
      <div className="absolute -top-0.5 -right-0.5 w-6 h-6 md:w-8 md:h-8 bg-blue-500 rounded-full flex items-center justify-center border border-slate-900 md:border-4 shadow-md">
        <span className="text-white text-[8px] md:text-[11px] font-extrabold">{service.number}</span>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center text-center px-1 md:px-2">
        {/* Icon */}
        <div className="mb-0.5 md:mb-1.5 group-hover:scale-110 transition-transform text-white">
          <service.icon className="w-4 h-4 md:w-6 md:h-6" />
        </div>
        
        {/* Title */}
        <div className="text-white font-extrabold text-[9px] md:text-sm leading-tight max-w-[95%]">
          {service.title}
        </div>
        {service.titleLine2 && (
          <div className="text-white font-semibold text-[8px] md:text-xs leading-none mt-0.5 opacity-90">
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
