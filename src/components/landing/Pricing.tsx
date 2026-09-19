import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, ShieldCheck, Headphones, Tag, Sparkles, Loader2 } from 'lucide-react';
import { billing } from '../../services/api';
import {
  CARD_CHANNELS,
  FALLBACK_PLANS,
  channelEnabled,
  getPlanCardFeatures,
  isSectionLabel,
  sectionLabelText,
  type PlanCardPlan,
} from '../../utils/planCards';

// Landing page ke card me dikhne wali cheezein. Plans khud API se aate
// hain - yahan sirf unhe card ki bhasha me badla jata hai.
interface PlanFeature {
  text: string;
  active: boolean;
  isHeading?: boolean;
}

interface Plan {
  name: string;
  tagline: string;
  price: string;
  priceLabel: string;
  originalPrice?: string;
  savings?: string;
  channels: { label: string; on: boolean }[];
  features: PlanFeature[];
  cta: string;
  ctaStyle: string;
  badge: string | null;
  highlighted: boolean;
  isFree?: boolean;
}

const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

/**
 * API ka plan row -> card.
 *
 * Yearly par bada number per-month hota hai aur poore saal ka amount neeche,
 * taaki dono cycles seedha compare hon.
 */
const toCard = (plan: PlanCardPlan, cycle: 'monthly' | 'yearly'): Plan => {
  const monthly = Number(plan.monthlyPrice) || 0;
  const yearly = Number(plan.yearlyPrice) || 0;
  const isFree = monthly === 0 && yearly === 0;
  const showYearly = cycle === 'yearly' && yearly > 0;

  const perMonth = showYearly ? Math.round(yearly / 12) : monthly;
  const savedPct =
    showYearly && monthly > 0
      ? Math.round(((monthly * 12 - yearly) / (monthly * 12)) * 100)
      : 0;

  const features: PlanFeature[] = getPlanCardFeatures(plan).map((f) =>
    isSectionLabel(f.text)
      ? { text: sectionLabelText(f.text), active: true, isHeading: true }
      : f
  );

  return {
    name: plan.name,
    tagline: plan.description || '',
    price: isFree ? 'Free' : rupees(perMonth),
    priceLabel: isFree
      ? `${plan.validityDays ?? 5} days`
      : showYearly
        ? `per month · ${rupees(yearly)} billed yearly`
        : 'per month',
    originalPrice: showYearly && monthly > 0 ? rupees(monthly) : undefined,
    savings: savedPct > 0 ? `Save ${savedPct}%` : undefined,
    channels: CARD_CHANNELS.map((c) => ({
      label: c.label,
      on: channelEnabled(plan.includedFeatures, c.key),
    })),
    features,
    cta: isFree ? 'Start free' : `Choose ${plan.name}`,
    ctaStyle: isFree ? 'outline-gray' : 'outline-green',
    badge: plan.popular || plan.isRecommended ? 'MOST POPULAR' : null,
    highlighted: Boolean(plan.popular || plan.isRecommended),
    isFree,
  };
};

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [rows, setRows] = useState<PlanCardPlan[]>(FALLBACK_PLANS);
  const [loading, setLoading] = useState(true);

  // Daam ek hi jagah rehne chahiye. Ye endpoint public hai (auth middleware
  // se pehle mount hai), isliye landing page bina login ke padh sakta hai.
  // Na mile to FALLBACK_PLANS par hi rehta hai - khali section se behtar.
  useEffect(() => {
    let alive = true;

    billing
      .getPlans()
      .then((res) => {
        const data = (res?.data as any)?.data ?? (res?.data as any);
        const list = Array.isArray(data) ? data : data?.plans;
        if (alive && Array.isArray(list) && list.length > 0) {
          setRows(list as PlanCardPlan[]);
        }
      })
      .catch(() => {
        // Fallback pehle se laga hua hai.
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const plans = rows.map((p) => toCard(p, billingCycle));

  // Annual par sabse zyada bachat kitni hai - toggle ke paas wahi dikhao,
  // hardcoded "17%" nahi.
  const maxSavings = rows.reduce((best, p) => {
    const m = Number(p.monthlyPrice) || 0;
    const y = Number(p.yearlyPrice) || 0;
    if (m <= 0 || y <= 0) return best;
    return Math.max(best, Math.round(((m * 12 - y) / (m * 12)) * 100));
  }, 0);

  return (
    <section id="pricing" className="relative py-24 bg-gradient-to-b from-white via-gray-50/30 to-white overflow-hidden">

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

              {maxSavings > 0 && (
                <span className="text-green-600 text-xs font-semibold pr-3">
                  2 months free
                </span>
              )}
            </div>

            {loading && (
              <span className="inline-flex items-center gap-2 text-xs text-gray-400">
                <Loader2 size={12} className="animate-spin" />
                Latest pricing load ho rahi hai…
              </span>
            )}
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
                desc: 'Jo daam dikh raha hai wahi lagta hai — koi GST ya extra fee nahi.',
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

const PricingCard = ({ plan }: { plan: Plan }) => {
  const [isHovered, setIsHovered] = useState(false);

  const isGreen = isHovered;

  const cardClasses = isGreen
    ? 'bg-green-600 text-white border-2 border-green-600 shadow-2xl shadow-green-600/30 lg:scale-105'
    : plan.highlighted
      ? 'bg-white border-2 border-green-500/30 shadow-md lg:scale-105'
      : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-xl';

  const titleClasses = isGreen ? 'text-white' : 'text-gray-900';
  const taglineClasses = isGreen ? 'text-green-100' : 'text-gray-500';
  const priceClasses = isGreen ? 'text-white' : 'text-gray-900';
  const priceLabelClasses = isGreen ? 'text-green-100' : 'text-gray-500';

  const getCtaButton = () => {
    if (isGreen) {
      return 'bg-white text-gray-900 hover:bg-gray-50';
    }
    if (plan.highlighted) {
      return 'bg-green-600 text-white hover:bg-green-700 shadow-md';
    }
    if (plan.ctaStyle === 'outline-green') {
      return 'border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white';
    }
    return 'border-2 border-gray-300 text-gray-700 hover:border-gray-900 hover:bg-gray-900 hover:text-white';
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative rounded-2xl p-6 transition-all duration-300 ${cardClasses}`}
    >

      {/* Badge */}
      {plan.badge && (
        <div className={`absolute top-4 right-4 px-2 py-1 rounded-md text-[10px] font-bold tracking-wide ${
          isGreen
            ? 'bg-gray-900 text-white'
            : plan.highlighted
              ? 'bg-green-100 text-green-700'
              : 'bg-purple-100 text-purple-700'
        }`}>
          {plan.badge}
        </div>
      )}

      {/* Plan Name */}
      <h3 className={`font-heading font-bold text-base mb-1 ${titleClasses}`}>
        {plan.name}
      </h3>
      <p className={`text-xs mb-6 min-h-[32px] ${taglineClasses}`}>
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
              isGreen ? 'text-green-200' : 'text-gray-400'
            }`}>
              {plan.originalPrice}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs ${priceLabelClasses}`}>
            {plan.priceLabel}
          </span>
          {plan.savings && (
            <span className={`text-xs font-semibold flex items-center gap-0.5 ${
              isGreen ? 'text-green-100' : 'text-green-600'
            }`}>
              <Sparkles size={10} />
              {plan.savings}
            </span>
          )}
        </div>
      </div>

      {/* Channels - plan ke asli flags se, hardcode nahi */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {plan.channels.map((c) => (
          <span
            key={c.label}
            className={`text-[10px] font-semibold px-2 py-1 rounded-md border ${
              c.on
                ? isGreen
                  ? 'bg-green-500/40 text-white border-green-300/50'
                  : 'bg-green-50 text-green-700 border-green-200'
                : isGreen
                  ? 'bg-green-700/40 text-green-200/60 border-green-500/40 line-through'
                  : 'bg-gray-100 text-gray-400 border-gray-200 line-through'
            }`}
          >
            {c.label}
          </span>
        ))}
      </div>

      {/* Divider */}
      <div className={`h-px mb-5 ${
        isGreen ? 'bg-green-500' : 'bg-gray-100'
      }`} />

      {/* Features */}
      <ul className="space-y-2.5 mb-6 min-h-[160px]">
        {plan.features.map((feature, i) =>
          feature.isHeading ? (
            <li key={i} className="pt-1 first:pt-0">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                isGreen ? 'text-green-100' : 'text-gray-500'
              }`}>
                {feature.text}
              </span>
            </li>
          ) : (
            <li
              key={i}
              className={`text-sm flex items-start gap-2 ${
                feature.active
                  ? (isGreen ? 'text-white' : 'text-gray-700')
                  : (isGreen ? 'text-green-200/60 line-through' : 'text-gray-300 line-through')
              }`}
            >
              {/* Custom Check / Cross marker */}
              {feature.active ? (
                <Check size={16} className={`flex-shrink-0 mt-0.5 ${isGreen ? 'text-white' : 'text-green-500'}`} />
              ) : (
                <span className={`text-sm font-semibold flex-shrink-0 w-4 text-center ${isGreen ? 'text-green-300/40' : 'text-gray-300'}`}>×</span>
              )}
              <span className="flex-1">{feature.text}</span>
            </li>
          )
        )}
      </ul>

      {/* CTA Button */}
      <Link
        to="/signup"
        className={`block text-center w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${getCtaButton()}`}
      >
        {plan.cta}
      </Link>
    </div>
  );
};

export default Pricing;
