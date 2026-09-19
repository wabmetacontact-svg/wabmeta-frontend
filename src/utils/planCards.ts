// src/utils/planCards.ts
//
// Pricing card ka wo hissa jo do jagah chahiye: landing page ka public
// pricing section aur logged-in Billing page.
//
// Pehle dono jagah plans hardcoded the, aur teesri copy backend ke
// set-billing-plans.ts me thi. Daam badalte hi teeno ko alag-alag badalna
// padta tha - aur ek baar reh bhi gaya. Ab asli data GET /billing/plans se
// aata hai; yahan sirf usko card me dikhane ka tareeka hai.

export interface PlanCardPlan {
  id?: string;
  name: string;
  slug?: string;
  type?: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice?: number;
  validityDays?: number;
  maxTeamMembers?: number;
  maxWhatsAppAccounts?: number;
  features?: string[];
  /** Har feature ke liye plan ka saaf haan/na. Purane plans par null. */
  includedFeatures?: Record<string, boolean> | null;
  popular?: boolean;
  isRecommended?: boolean;
}

export interface PlanCardFeature {
  text: string;
  active: boolean;
}

// WhatsApp ka apna flag nahi hai - uska inbox hi "inbox" hai, jo har plan
// me khula rehta hai.
export const CARD_CHANNELS: { key: string; label: string }[] = [
  { key: 'inbox', label: 'WhatsApp' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'telegram', label: 'Telegram' },
];

/**
 * Is plan me ye channel khula hai ya nahi.
 *
 * Purane duration plans par includedFeatures hai hi nahi - unke liye sab
 * khula maano, kyunki unme sach me sab khula tha.
 */
export const channelEnabled = (
  includedFeatures: Record<string, boolean> | null | undefined,
  key: string
): boolean => {
  if (!includedFeatures || typeof includedFeatures !== 'object') return true;
  return includedFeatures[key] !== false;
};

/** "Everything in Starter, plus:" jaisi bullet heading hai, feature nahi. */
export const isSectionLabel = (text: string): boolean =>
  /^everything in .+?,?\s*plus:?$/i.test(text.trim());

/** Heading bullet ko dikhane layak chhota kar do. */
export const sectionLabelText = (text: string): string =>
  text.trim().replace(/,?\s*plus:?$/i, '');

export const getPlanCardFeatures = (plan: PlanCardPlan): PlanCardFeature[] => {
  // Naye tiers apni bullets khud lekar aate hain (plan.features, jo
  // set-billing-plans.ts likhta hai). Neeche wali hardcoded lists sirf
  // purane duration plans ke liye bachi hain.
  if (Array.isArray(plan.features) && plan.features.length > 0) {
    return plan.features
      .filter((f) => typeof f === 'string' && f.trim())
      .map((text) => ({ text, active: true }));
  }

  const slug = (plan.slug || plan.id || plan.type || '').toLowerCase();

  if (slug.includes('free')) {
    return [
      { text: '100 messages', active: true },
      { text: 'Basic campaigns', active: true },
      { text: 'Number safety', active: true },
      { text: 'Bulk paste', active: false },
      { text: 'Automation', active: false },
      { text: 'Webhooks', active: false },
    ];
  }

  if (slug.includes('3') || slug.includes('quarter')) {
    return [
      { text: 'All monthly features', active: true },
      { text: 'Bulk paste', active: true },
      { text: 'Basic automation', active: true },
      { text: 'Good number safety', active: true },
      { text: 'Standard support', active: true },
      { text: 'Campaign retry', active: false },
    ];
  }

  if (slug.includes('6') || slug.includes('biannual')) {
    return [
      { text: 'Advanced automation', active: true },
      { text: 'Bulk paste', active: true },
      { text: 'Mobile + API same no.', active: true },
      { text: 'Campaign retry', active: true },
      { text: 'High safety (active)', active: true },
      { text: 'Priority support', active: true },
    ];
  }

  if (slug.includes('year') || slug.includes('annual') || slug.includes('1-year')) {
    return [
      { text: 'Full automation suite', active: true },
      { text: 'Bulk paste', active: true },
      { text: 'Mobile + API same no.', active: true },
      { text: 'Campaign retry', active: true },
      { text: 'Maximum safety', active: true },
      { text: '2 WhatsApp accounts', active: true },
    ];
  }

  // Monthly plan (default)
  return [
    { text: 'Unlimited messages*', active: true },
    { text: 'Unlimited campaigns', active: true },
    { text: 'Standard safety', active: true },
    { text: 'Bulk paste', active: false },
    { text: 'Webhooks + Flow Builder', active: true },
    { text: 'Standard support', active: true },
  ];
};

/**
 * Agar API tak pahunch hi na ho to landing page par kya dikhe.
 *
 * Ye backend ke prisma/set-billing-plans.ts ki public rows ki copy hai.
 * Daam wahan badle to yahan bhi badalna hoga - isliye yahan sirf utna hi
 * rakha hai jitne se page khali na dikhe; asli source DB hai.
 */
export const FALLBACK_PLANS: PlanCardPlan[] = [
  {
    id: 'free-demo',
    slug: 'free-demo',
    name: 'Free Demo',
    description: 'Try every feature for 5 days.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    validityDays: 5,
    includedFeatures: null,
    features: [
      'All features unlocked',
      'Automation & chatbot included',
      'WhatsApp + Instagram + Telegram',
      '100 messages · 50 contacts · 5 days',
    ],
  },
  {
    id: 'starter',
    slug: 'starter',
    name: 'Starter',
    description: 'WhatsApp aur Instagram par shuruaat.',
    monthlyPrice: 799,
    yearlyPrice: 7990,
    validityDays: 30,
    includedFeatures: { inbox: true, instagram: true, telegram: false },
    features: [
      'WhatsApp + Instagram inbox',
      'Unlimited contacts & campaigns',
      '3 team seats · 1 WhatsApp number',
      'Automation, CRM aur AI: Growth se',
    ],
  },
  {
    id: 'growth',
    slug: 'growth',
    name: 'Growth',
    description: 'Automation, chatbot aur CRM ke saath poori team.',
    monthlyPrice: 1799,
    yearlyPrice: 17990,
    validityDays: 30,
    popular: true,
    isRecommended: true,
    includedFeatures: { inbox: true, instagram: true, telegram: true },
    features: [
      'Everything in Starter, plus:',
      'Telegram inbox',
      'Chatbot flow builder & automations',
      'CRM pipelines aur reports',
      '5 team seats',
    ],
  },
  {
    id: 'pro',
    slug: 'pro',
    name: 'Pro',
    description: 'AI Sales Agent aur payment links ke saath.',
    monthlyPrice: 2999,
    yearlyPrice: 29990,
    validityDays: 30,
    includedFeatures: { inbox: true, instagram: true, telegram: true },
    features: [
      'Everything in Growth, plus:',
      'AI Sales Agent — 2,000 replies/mahina',
      'Payment links',
      '10 team seats · 2 WhatsApp numbers',
    ],
  },
  {
    id: 'business',
    slug: 'business',
    name: 'Business',
    description: 'Agency aur multi-number setup ke liye.',
    monthlyPrice: 5999,
    yearlyPrice: 59990,
    validityDays: 30,
    includedFeatures: { inbox: true, instagram: true, telegram: true },
    features: [
      'Everything in Pro, plus:',
      'Unlimited team seats',
      '3 WhatsApp numbers',
      'API access · AI 10,000 replies/mahina',
    ],
  },
];
