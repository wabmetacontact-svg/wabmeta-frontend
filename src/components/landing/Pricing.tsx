import { useState } from 'react';
import { Check, ShieldCheck, Headphones, Tag, Sparkles } from 'lucide-react';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Free Demo',
      tagline: 'Test the waters',
      price: 'Free',
      priceLabel: '2 days',
      isFree: true,
      features: [
        { text: '100 messages', active: true },
        { text: 'Basic campaigns', active: true },
        { text: 'Number safety', active: true },
        { text: 'Automation', active: false },
        { text: 'Webhooks', active: false },
      ],
      cta: 'Start free',
      ctaStyle: 'outline-gray',
      badge: null,
      highlighted: false,
    },
    {
      name: 'Monthly',
      tagline: 'For growing teams',
      price: '₹899',
      priceLabel: 'per month',
      features: [
        { text: 'Unlimited messages*', active: true },
        { text: 'Unlimited campaigns', active: true },
        { text: 'Standard safety', active: true },
        { text: 'Webhooks + Flow Builder', active: true },
        { text: 'Standard support', active: true },
      ],
      cta: 'Choose monthly',
      ctaStyle: 'outline-green',
      badge: null,
      highlighted: false,
    },
    {
      name: '3-Month',
      tagline: 'Quarterly saver',
      price: '₹2,500',
      originalPrice: '₹2,687',
      priceLabel: 'one-time',
      savings: 'Save 7%',
      features: [
        { text: 'All monthly features', active: true },
        { text: 'Basic automation', active: true },
        { text: 'Good number safety', active: true },
        { text: 'Standard support', active: true },
        { text: 'Campaign retry', active: false },
      ],
      cta: 'Choose 3-month',
      ctaStyle: 'outline-green',
      badge: null,
      highlighted: false,
    },
    {
      name: '6-Month',
      tagline: 'Most chosen plan',
      price: '₹5,000',
      originalPrice: '₹5,304',
      priceLabel: 'one-time',
      savings: 'Save 7%',
      features: [
        { text: 'Advanced automation', active: true },
        { text: 'Mobile + API same no.', active: true },
        { text: 'Campaign retry', active: true },
        { text: 'High safety (active)', active: true },
        { text: 'Priority support', active: true },
      ],
      cta: 'Get best value',
      ctaStyle: 'outline-green',
      badge: 'POPULAR',
      highlighted: false,
    },
    {
      name: '1-Year',
      tagline: 'Best deal, period.',
      price: '₹8,999',
      originalPrice: '₹10,188',
      priceLabel: 'one-time',
      savings: 'Save 11%',
      features: [
        { text: 'Full automation suite', active: true },
        { text: 'Mobile + API same no.', active: true },
        { text: 'Campaign retry', active: true },
        { text: 'Maximum safety', active: true },
        { text: '2 WhatsApp accounts', active: true },
      ],
      cta: 'Go annual',
      ctaStyle: 'solid-white',
      badge: 'BEST DEAL',
      highlighted: true,
    },
  ];

  return (
    <section className="relative py-24 bg-gradient-to-b from-white via-gray-50/30 to-white overflow-hidden">
      
      {/* Decorative background */}
      <div className="absolute top-40 right-20 w-72 h-72 bg-green-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 left-20 w-72 h-72 bg-purple-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* ═══════ Section Header ═══════ */}
        <div className="grid grid-cols-12 gap-6 mb-16 lg:mb-24">
          <div className="col-span-12 lg:col-span-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-gray-200" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500 font-bold">
                Simple, Transparent Pricing
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-gray-950">
              <span>Choose the</span>{' '}
              <span className="bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent italic font-light">
                perfect
              </span>
              <br />
              <span>plan for your</span>{' '}
              <span className="bg-gradient-to-r from-green-700 via-emerald-600 to-green-700 bg-clip-text text-transparent">
                business.
              </span>
            </h2>
          </div>

          <div className="col-span-12 lg:col-span-5 lg:pt-12 flex flex-col items-start gap-6">
            <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
              Flexible plans to help you automate, engage and grow — start free and upgrade anytime.
            </p>
            
            {/* ═══════ Billing Toggle ═══════ */}
            <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              
              {/* Toggle Switch */}
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  billingCycle === 'yearly' ? 'bg-green-500' : 'bg-gray-200'
                }`}
              >
                <div 
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all ${
                    billingCycle === 'yearly' ? 'left-[26px]' : 'left-0.5'
                  }`}
                />
              </button>
              
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
                  billingCycle === 'yearly'
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Yearly
              </button>
              
              <span className="text-green-600 text-xs font-semibold pr-3">
                Save 20%
              </span>
            </div>
          </div>
        </div>

        {/* ═══════ Pricing Cards Grid ═══════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          {plans.map((plan, index) => (
            <PricingCard key={index} plan={plan} />
          ))}
        </div>

        {/* ═══════ Trust Bar ═══════ */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: 'Secure & Reliable',
                desc: 'Enterprise-grade security and 99.9% uptime.',
              },
              {
                icon: Headphones,
                title: '24/7 Support',
                desc: 'Our team is always here to help you.',
              },
              {
                icon: Tag,
                title: 'No Hidden Charges',
                desc: 'Transparent pricing with no surprises.',
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <item.icon size={20} className="text-green-600" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-gray-900 mb-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fair Usage Note */}
        <p className="text-center text-xs text-gray-500 mt-6">
          *Fair usage policy applies. Excess usage will be billed at standard rates.
        </p>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════
// Pricing Card Component
// ═══════════════════════════════════════════════════
interface PlanFeature {
  text: string;
  active: boolean;
}

interface Plan {
  name: string;
  tagline: string;
  price: string;
  priceLabel: string;
  originalPrice?: string;
  savings?: string;
  features: PlanFeature[];
  cta: string;
  ctaStyle: string;
  badge: string | null;
  highlighted: boolean;
  isFree?: boolean;
}

const PricingCard = ({ plan }: { plan: Plan }) => {
  const cardClasses = plan.highlighted
    ? 'bg-green-600 text-white border-2 border-green-600 shadow-2xl shadow-green-600/30 lg:scale-105'
    : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-xl';

  const titleClasses = plan.highlighted ? 'text-white' : 'text-gray-900';
  const taglineClasses = plan.highlighted ? 'text-green-100' : 'text-gray-500';
  const priceClasses = plan.highlighted ? 'text-white' : 'text-gray-900';
  const priceLabelClasses = plan.highlighted ? 'text-green-100' : 'text-gray-500';

  const getCtaButton = () => {
    if (plan.ctaStyle === 'solid-white') {
      return 'bg-white text-gray-900 hover:bg-gray-50';
    }
    if (plan.ctaStyle === 'outline-green') {
      return 'border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white';
    }
    return 'border-2 border-gray-300 text-gray-700 hover:border-gray-900 hover:bg-gray-900 hover:text-white';
  };

  return (
    <div className={`relative rounded-2xl p-6 transition-all duration-300 ${cardClasses}`}>
      
      {/* Badge */}
      {plan.badge && (
        <div className={`absolute top-4 right-4 px-2 py-1 rounded-md text-[10px] font-bold tracking-wide ${
          plan.highlighted 
            ? 'bg-gray-900 text-white' 
            : 'bg-purple-100 text-purple-700'
        }`}>
          {plan.badge}
        </div>
      )}

      {/* Plan Name */}
      <h3 className={`font-heading font-bold text-base mb-1 ${titleClasses}`}>
        {plan.name}
      </h3>
      <p className={`text-xs mb-6 ${taglineClasses}`}>
        {plan.tagline}
      </p>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-1">
          <span className={`font-heading font-bold text-3xl ${priceClasses}`}>
            {plan.price}
          </span>
          {plan.originalPrice && (
            <span className={`text-sm line-through ${
              plan.highlighted ? 'text-green-200' : 'text-gray-400'
            }`}>
              {plan.originalPrice}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${priceLabelClasses}`}>
            {plan.priceLabel}
          </span>
          {plan.savings && (
            <span className={`text-xs font-semibold flex items-center gap-0.5 ${
              plan.highlighted ? 'text-green-100' : 'text-green-600'
            }`}>
              <Sparkles size={10} />
              {plan.savings}
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className={`h-px mb-5 ${
        plan.highlighted ? 'bg-green-500' : 'bg-gray-100'
      }`} />

      {/* Features */}
      <ul className="space-y-2.5 mb-6 min-h-[160px]">
        {plan.features.map((feature, i) => (
          <li 
            key={i} 
            className={`text-sm flex items-start gap-2 ${
              feature.active 
                ? (plan.highlighted ? 'text-white' : 'text-gray-700')
                : (plan.highlighted ? 'text-green-200/60 line-through' : 'text-gray-300 line-through')
            }`}
          >
            {/* Custom Check / Cross marker */}
            {feature.active ? (
              <Check size={16} className={`flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-white' : 'text-green-500'}`} />
            ) : (
              <span className={`text-sm font-semibold flex-shrink-0 w-4 text-center ${plan.highlighted ? 'text-green-300/40' : 'text-gray-300'}`}>×</span>
            )}
            <span className="flex-1">{feature.text}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${getCtaButton()}`}
      >
        {plan.cta}
      </button>
    </div>
  );
};

export default Pricing;