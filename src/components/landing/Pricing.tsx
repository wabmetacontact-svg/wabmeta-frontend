import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, ArrowRight } from 'lucide-react';
import { useScrollReveal } from './useScrollReveal';

const plans = [
  {
    name: 'Free Demo',
    price: 'Free',
    original: null,
    period: '2 days trial',
    desc: 'Test the platform',
    features: [
      { text: '100 Messages',       ok: true  },
      { text: 'Limited Campaigns',  ok: true  },
      { text: 'Basic Safety',       ok: true  },
      { text: 'Automation',         ok: false },
      { text: 'Webhooks',           ok: false },
    ],
    cta: 'Start free',
    featured: false,
    tag: null,
  },
  {
    name: 'Monthly',
    price: '₹899',
    original: null,
    period: '/month',
    desc: 'For growing teams',
    features: [
      { text: 'Unlimited Messages*',    ok: true },
      { text: 'Unlimited Campaigns',    ok: true },
      { text: 'Standard Safety',        ok: true },
      { text: 'Webhooks & Flow Builder',ok: true },
      { text: 'Standard Support',       ok: true },
    ],
    cta: 'Choose Monthly',
    featured: false,
    tag: null,
  },
  {
    name: '3 Month',
    price: '₹2,500',
    original: '₹2,697',
    period: 'one-time',
    desc: 'Save 7%',
    features: [
      { text: 'All Monthly features',  ok: true  },
      { text: 'Basic Automation',      ok: true  },
      { text: 'Good Number Safety',    ok: true  },
      { text: 'Standard Support',      ok: true  },
      { text: 'Campaign Retry',        ok: false },
    ],
    cta: 'Choose 3-Month',
    featured: false,
    tag: null,
  },
  {
    name: '6 Month',
    price: '₹5,000',
    original: '₹5,394',
    period: 'one-time',
    desc: 'Most popular',
    features: [
      { text: 'Advanced Automation',      ok: true },
      { text: 'Mobile + API Same No.',    ok: true },
      { text: 'Campaign Retry',           ok: true },
      { text: 'High Safety',              ok: true },
      { text: 'Priority Support',         ok: true },
    ],
    cta: 'Get Best Value',
    featured: true,
    tag: 'Recommended',
  },
  {
    name: '1 Year',
    price: '₹8,999',
    original: '₹10,788',
    period: 'one-time',
    desc: 'Save 17%',
    features: [
      { text: 'Full Automation Suite',    ok: true },
      { text: 'Mobile + API Same No.',    ok: true },
      { text: 'Campaign Retry',           ok: true },
      { text: 'Maximum Safety',           ok: true },
      { text: '2 WhatsApp Accounts',      ok: true },
    ],
    cta: 'Go Annual',
    featured: true,
    tag: 'Best Deal',
  },
];

const Pricing: React.FC = () => {
  const { ref, visible } = useScrollReveal();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="pricing" ref={ref} className="section-padding">
      <div className="max-w-6xl mx-auto px-5">

        <div className={`text-center max-w-2xl mx-auto mb-14 transition-all duration-700
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="text-xs font-bold text-primary-600 dark:text-primary-400
            uppercase tracking-wider mb-3">Pricing</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900
            dark:text-white leading-tight mb-4">
            Simple, transparent <span className="gradient-text">pricing</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Start free. Upgrade when you're ready. No hidden fees.
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-nowrap lg:grid lg:grid-cols-5 gap-4
          overflow-x-auto scrollbar-hide pb-4 lg:pb-0 snap-x items-stretch">
          {plans.map((p, i) => (
            <div key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className={`flex-none w-64 lg:w-auto snap-center transition-all duration-500
                ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: visible ? `${i * 80}ms` : '0ms' }}>

              <div className={`relative h-full flex flex-col rounded-2xl border p-5
                transition-all duration-300 ${
                  p.featured
                    ? 'bg-primary-600 dark:bg-primary-700 border-primary-500 shadow-purple'
                    : hovered === i
                      ? 'bg-white dark:bg-[#111118] border-primary-200 dark:border-primary-800/40 shadow-card-hover'
                      : 'bg-white dark:bg-[#111118] border-gray-100 dark:border-white/5 shadow-card'
                }`}>

                {/* Tag */}
                {p.tag && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 text-[10px] font-bold rounded-full
                      bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400
                      border border-primary-200 dark:border-primary-800/40 whitespace-nowrap shadow-sm">
                      {p.tag}
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="mb-5">
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                    p.featured ? 'text-primary-200' : 'text-primary-600 dark:text-primary-400'
                  }`}>{p.name}</p>
                  <p className={`text-xs mb-3 ${p.featured ? 'text-primary-200' : 'text-gray-400'}`}>
                    {p.desc}
                  </p>
                  <div className="flex items-end gap-1.5">
                    <span className={`text-3xl font-extrabold ${
                      p.featured ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}>{p.price}</span>
                    <span className={`text-xs mb-1 ${
                      p.featured ? 'text-primary-200' : 'text-gray-400'
                    }`}>{p.period}</span>
                  </div>
                  {p.original && (
                    <p className={`text-xs line-through mt-0.5 ${
                      p.featured ? 'text-primary-300' : 'text-gray-400'
                    }`}>{p.original}</p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 flex-1 mb-6">
                  {p.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        f.ok
                          ? p.featured
                            ? 'bg-white/20'
                            : 'bg-primary-50 dark:bg-primary-950/30'
                          : 'bg-gray-100 dark:bg-white/5'
                      }`}>
                        {f.ok
                          ? <Check className={`w-2.5 h-2.5 ${p.featured ? 'text-white' : 'text-primary-600'}`} />
                          : <X className="w-2.5 h-2.5 text-gray-400" />}
                      </div>
                      <span className={`text-xs leading-relaxed ${
                        f.ok
                          ? p.featured ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                          : 'text-gray-400 dark:text-gray-500 line-through'
                      }`}>{f.text}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link to="/signup"
                  className={`group flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                    text-xs font-semibold transition-all ${
                    p.featured
                      ? 'bg-white text-primary-700 hover:bg-primary-50'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}>
                  {p.cta}
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Fine print */}
        <p className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500">
          * Unlimited messages subject to WhatsApp API rate limits. All prices are for single WhatsApp number unless stated.
        </p>
      </div>
    </section>
  );
};

export default Pricing;