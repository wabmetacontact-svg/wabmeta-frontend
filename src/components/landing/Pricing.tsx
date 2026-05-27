import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Sparkles, Zap, Shield, Crown, Rocket, ArrowUpRight, TrendingUp } from 'lucide-react';

interface Feature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

interface Plan {
  name: string;
  icon: React.ElementType;
  price: string;
  originalPrice: string | null;
  duration: string;
  description: string;
  features: Feature[];
  cta: string;
  highlight: boolean;
  accentColor: string;
  iconBg: string;
  tag?: string;
  savings?: string;
}

const Pricing: React.FC = () => {
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const plans: Plan[] = [
    {
      name: 'Free Demo',
      icon: Zap,
      price: 'Free',
      originalPrice: null,
      duration: '2 days',
      description: 'Test the waters',
      features: [
        { text: '100 messages', included: true },
        { text: 'Basic campaigns', included: true },
        { text: 'Number safety', included: true },
        { text: 'Automation', included: false },
        { text: 'Webhooks', included: false },
      ],
      cta: 'Start free',
      highlight: false,
      accentColor: '#6b7280',
      iconBg: 'from-gray-500 to-gray-600',
    },
    {
      name: 'Monthly',
      icon: Rocket,
      price: '₹899',
      originalPrice: null,
      duration: 'per month',
      description: 'For growing teams',
      features: [
        { text: 'Unlimited messages*', included: true },
        { text: 'Unlimited campaigns', included: true },
        { text: 'Standard safety', included: true },
        { text: 'Webhooks + Flow Builder', included: true },
        { text: 'Standard support', included: true },
      ],
      cta: 'Choose monthly',
      highlight: false,
      accentColor: '#3b82f6',
      iconBg: 'from-blue-500 to-cyan-600',
    },
    {
      name: '3-Month',
      icon: Shield,
      price: '₹2,500',
      originalPrice: '₹2,697',
      duration: 'one-time',
      description: 'Quarterly saver',
      savings: 'Save 7%',
      features: [
        { text: 'All monthly features', included: true },
        { text: 'Basic automation', included: true },
        { text: 'Good number safety', included: true },
        { text: 'Standard support', included: true },
        { text: 'Campaign retry', included: false },
      ],
      cta: 'Choose 3-month',
      highlight: false,
      accentColor: '#a855f7',
      iconBg: 'from-purple-500 to-pink-600',
    },
    {
      name: '6-Month',
      icon: Crown,
      price: '₹5,000',
      originalPrice: '₹5,394',
      duration: 'one-time',
      description: 'Most chosen plan',
      savings: 'Save 7%',
      features: [
        { text: 'Advanced automation', included: true },
        { text: 'Mobile + API same no.', included: true, highlight: true },
        { text: 'Campaign retry', included: true, highlight: true },
        { text: 'High safety (active)', included: true, highlight: true },
        { text: 'Priority support', included: true },
      ],
      cta: 'Get best value',
      highlight: true,
      tag: 'POPULAR',
      accentColor: '#10b981',
      iconBg: 'from-green-500 to-emerald-600',
    },
    {
      name: '1-Year',
      icon: Sparkles,
      price: '₹8,999',
      originalPrice: '₹10,788',
      duration: 'one-time',
      description: 'Best deal, period.',
      savings: 'Save 17%',
      features: [
        { text: 'Full automation suite', included: true },
        { text: 'Mobile + API same no.', included: true, highlight: true },
        { text: 'Campaign retry', included: true, highlight: true },
        { text: 'Maximum safety', included: true, highlight: true },
        { text: '2 WhatsApp accounts', included: true, highlight: true },
      ],
      cta: 'Go annual',
      highlight: true,
      tag: 'BEST DEAL',
      accentColor: '#f59e0b',
      iconBg: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden"
    >
      {/* ✅ Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0a0e27] via-[#050816] to-[#0a0e27]">
        <div className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 20% 30%, rgba(16, 185, 129, 0.1) 0%, transparent 60%),
              radial-gradient(ellipse 60% 50% at 80% 70%, rgba(245, 158, 11, 0.08) 0%, transparent 60%)
            `,
          }}
        />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ✅ EDITORIAL HEADER */}
        <div className={`grid grid-cols-12 gap-6 mb-16 lg:mb-20 transition-all duration-1000 
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="col-span-12 lg:col-span-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-white/20" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-gray-400">
                Pricing · No bs
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              <span className="text-white">Pick a plan.</span>{' '}
              <span className="bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent italic font-light">
                Or don't.
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                You won't be surprised later.
              </span>
            </h2>
          </div>

          <div className="col-span-12 lg:col-span-5 lg:pt-16">
            <p className="text-base lg:text-lg text-gray-400 leading-relaxed mb-4">
              Every plan shows what you get and what you don't. No hidden tier upgrades. No "contact us for pricing". 
              <span className="text-white"> The longer you commit, the less you pay.</span>
            </p>
          </div>
        </div>

        {/* ✅ PRICING CARDS */}
        <div className="flex flex-nowrap lg:grid lg:grid-cols-5 gap-4 lg:gap-5 overflow-x-auto lg:overflow-visible py-6 snap-x snap-mandatory scrollbar-hide items-stretch">
          {plans.map((plan, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredPlan(index)}
              onMouseLeave={() => setHoveredPlan(null)}
              className={`flex-none w-72 lg:w-auto snap-center transition-all duration-700 ease-out
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <div
                className={`relative h-full rounded-3xl overflow-hidden
                  bg-white/[0.04] backdrop-blur-2xl
                  border transition-all duration-500 ease-out
                  flex flex-col
                  ${plan.highlight
                    ? 'border-white/[0.18] shadow-[0_20px_60px_rgba(0,0,0,0.3)]'
                    : 'border-white/[0.08] hover:border-white/[0.15]'
                  }
                  ${hoveredPlan === index ? '-translate-y-2 lg:-translate-y-3' : ''}
                  ${plan.highlight ? 'lg:scale-[1.03]' : ''}
                `}
                style={{
                  boxShadow: hoveredPlan === index 
                    ? `0 20px 60px ${plan.accentColor}25` 
                    : undefined,
                }}
              >
                {/* Gradient bg */}
                <div className="absolute inset-0 opacity-0 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${plan.accentColor}20 0%, transparent 60%)`,
                    opacity: hoveredPlan === index || plan.highlight ? 1 : 0,
                  }}
                />

                {/* Inner shimmer */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)',
                  }}
                />

                {/* Top edge highlight */}
                <div className="absolute top-0 left-[15%] right-[15%] h-px 
                  bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                {/* TAG */}
                {plan.tag && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider
                      backdrop-blur-xl border"
                      style={{
                        backgroundColor: `${plan.accentColor}25`,
                        borderColor: `${plan.accentColor}60`,
                        color: plan.accentColor,
                      }}
                    >
                      {plan.tag}
                    </div>
                  </div>
                )}

                {/* CONTENT */}
                <div className="relative z-10 p-6 flex flex-col h-full">

                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${plan.iconBg}
                    flex items-center justify-center mb-5 
                    transition-all duration-500
                    ${hoveredPlan === index ? 'scale-110 rotate-3' : ''}`}
                    style={{
                      boxShadow: `0 8px 20px ${plan.accentColor}40`,
                    }}
                  >
                    <plan.icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-xs text-gray-500 mb-5">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl lg:text-4xl font-bold text-white">
                        {plan.price}
                      </span>
                      {plan.originalPrice && (
                        <span className="text-sm text-gray-600 line-through">
                          {plan.originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{plan.duration}</span>
                      {plan.savings && (
                        <>
                          <span className="text-gray-700">·</span>
                          <span className="text-xs font-mono inline-flex items-center gap-1"
                            style={{ color: plan.accentColor }}
                          >
                            <TrendingUp className="w-3 h-3" />
                            {plan.savings}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-white/[0.06] mb-5" />

                  {/* Features */}
                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className={`flex items-start text-sm transition-all duration-300
                          ${hoveredPlan === index ? 'translate-x-0.5' : ''}`}
                        style={{ transitionDelay: `${idx * 40}ms` }}
                      >
                        {feature.included ? (
                          <span className="flex-shrink-0 mr-2.5 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: feature.highlight 
                                ? `${plan.accentColor}30` 
                                : 'rgba(255,255,255,0.08)',
                              border: feature.highlight 
                                ? `1px solid ${plan.accentColor}60` 
                                : 'none',
                            }}
                          >
                            <Check className="w-2.5 h-2.5" 
                              style={{ 
                                color: feature.highlight ? plan.accentColor : '#10b981' 
                              }} 
                              strokeWidth={3} 
                            />
                          </span>
                        ) : (
                          <span className="flex-shrink-0 mr-2.5 mt-0.5 w-4 h-4 rounded-full bg-white/[0.04] flex items-center justify-center">
                            <X className="w-2.5 h-2.5 text-gray-600" strokeWidth={2.5} />
                          </span>
                        )}
                        <span className={
                          feature.included
                            ? feature.highlight 
                              ? 'text-white font-medium' 
                              : 'text-gray-300'
                            : 'text-gray-600 line-through'
                        }>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-sm
                      transition-all duration-300 flex items-center justify-center gap-2
                      group/btn overflow-hidden relative
                      ${plan.highlight ? 'text-white' : 'text-gray-200'}
                    `}
                    style={{
                      background: plan.highlight 
                        ? `linear-gradient(135deg, ${plan.accentColor}, ${plan.accentColor}cc)`
                        : 'rgba(255,255,255,0.06)',
                      border: plan.highlight 
                        ? `1px solid ${plan.accentColor}80` 
                        : '1px solid rgba(255,255,255,0.1)',
                      boxShadow: plan.highlight ? `0 8px 24px ${plan.accentColor}40` : 'none',
                    }}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                      -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                    <span className="relative z-10">{plan.cta}</span>
                    <ArrowUpRight className="relative z-10 w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ TRUST STRIP - editorial */}
        <div className={`mt-16 pt-10 border-t border-white/10 transition-all duration-1000 delay-500
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[
              { icon: Shield, label: 'Secure payments', sub: '256-bit SSL' },
              { icon: Zap, label: 'Instant activation', sub: 'No wait time' },
              { icon: Check, label: 'Cancel anytime', sub: 'No questions' },
              { icon: Sparkles, label: 'Honest pricing', sub: 'No surprises' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08]
                  flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 text-center">
            *Unlimited messages subject to Meta's Fair Usage Policy & tier limits.
          </p>
        </div>

        {/* ✅ ENTERPRISE CTA */}
        <div className={`mt-16 transition-all duration-1000 delay-700
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="relative rounded-3xl overflow-hidden
            bg-white/[0.04] backdrop-blur-2xl
            border border-white/[0.1]
            p-8 lg:p-10">

            {/* Gradient bg */}
            <div className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(ellipse 60% 50% at 20% 50%, rgba(168, 85, 247, 0.15) 0%, transparent 60%),
                  radial-gradient(ellipse 50% 40% at 80% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 60%)
                `,
              }}
            />

            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-purple-300">
                    Enterprise
                  </span>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  Need something <span className="italic font-light text-gray-400">custom?</span>
                </h3>
                <p className="text-gray-400 text-sm lg:text-base">
                  100k+ messages/day, dedicated infrastructure, SLA, white-labeling — we do all of it.
                </p>
              </div>

              <a
                href="https://wa.me/919310010763?text=Hi, I need a custom enterprise plan for WabMeta!"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 
                  bg-white text-gray-900 px-6 py-3.5 rounded-full text-sm font-semibold
                  hover:shadow-[0_8px_24px_rgba(255,255,255,0.2)]
                  hover:-translate-y-0.5
                  transition-all duration-300 flex-shrink-0"
              >
                Talk to founder
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default Pricing;