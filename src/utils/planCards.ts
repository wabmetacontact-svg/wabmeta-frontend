// src/utils/planCards.ts
//
// The part of a pricing card that two screens need: the public pricing
// section on the landing page, and the Billing page behind login.
//
// Both used to hardcode the plans, and a third copy lived in the backend's
// set-billing-plans.ts. Changing a price meant changing all three, and once
// it was missed. The real data now comes from GET /billing/plans; this file
// only decides how to render it.

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
  /** The plan's explicit yes/no per feature. Null on the retired plans. */
  includedFeatures?: Record<string, boolean> | null;
  popular?: boolean;
  isRecommended?: boolean;
}

export interface PlanCardFeature {
  text: string;
  active: boolean;
}

// WhatsApp has no flag of its own - its inbox is "inbox", which every plan
// keeps open.
export const CARD_CHANNELS: { key: string; label: string }[] = [
  { key: 'inbox', label: 'WhatsApp' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'telegram', label: 'Telegram' },
];

/**
 * Whether this plan includes the given feature.
 *
 * The retired duration plans have no includedFeatures at all, so for them
 * everything reads as included - which is the truth: they really did have
 * everything open.
 */
export const featureIncluded = (
  includedFeatures: Record<string, boolean> | null | undefined,
  key: string
): boolean => {
  if (!includedFeatures || typeof includedFeatures !== 'object') return true;
  return includedFeatures[key] !== false;
};

/** Kept for the channel chips, which is where this started. */
export const channelEnabled = featureIncluded;

/**
 * The plans a paying customer can move to.
 *
 * Free Demo is dropped: it costs nothing, so its card can only offer a
 * checkout Razorpay refuses, and a customer already on a plan cannot go back
 * to it. The landing page keeps it - to a visitor, the free trial is the
 * offer - so the filter belongs at the call site, not in the data.
 */
export const sellablePlans = <T extends PlanCardPlan>(plans: T[]): T[] =>
  plans.filter(
    (p) => (Number(p.monthlyPrice) || 0) > 0 || (Number(p.yearlyPrice) || 0) > 0
  );

/** "Everything in Starter, plus:" is a heading, not a feature. */
export const isSectionLabel = (text: string): boolean =>
  /^everything in .+?,?\s*plus:?$/i.test(text.trim());

/** Trim a heading bullet down to what should actually be shown. */
export const sectionLabelText = (text: string): string =>
  text.trim().replace(/,?\s*plus:?$/i, '');

export const getPlanCardFeatures = (plan: PlanCardPlan): PlanCardFeature[] => {
  // The current tiers bring their own bullets (plan.features, written by
  // set-billing-plans.ts). The hardcoded lists below survive only for the
  // retired duration plans, which have none.
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
 * The landing page's pricing, in code.
 *
 * This page used to read GET /billing/plans like the Billing page does. That
 * is the right call for Billing, where what is shown has to match what is
 * charged - but it made the public pricing page unchangeable from the repo:
 * the copy lived in plan rows, and fixing a typo meant running a seed script
 * against production.
 *
 * Marketing copy belongs here. Money still belongs to the database: this page
 * only links to /signup, it never starts a checkout, so nothing here can
 * charge anyone the wrong amount.
 *
 * KEEP IN SYNC with the backend's prisma/set-billing-plans.ts, which sets the
 * limits that are actually enforced. If the two disagree, this page is
 * advertising something the product does not do.
 */
export const LANDING_PLANS: PlanCardPlan[] = [
  {
    id: 'free-demo',
    slug: 'free-demo',
    name: 'Free Demo',
    description: 'Try every feature for 5 days.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    validityDays: 5,
    includedFeatures: { bulkPaste: true },
    features: [
      'Every feature unlocked',
      'WhatsApp + Instagram + Telegram',
      '50 contacts · 100 messages',
      '5-day trial',
    ],
  },
  {
    id: 'starter',
    slug: 'starter',
    name: 'Starter',
    description: 'Get started on WhatsApp and Instagram.',
    monthlyPrice: 799,
    yearlyPrice: 7990,
    validityDays: 30,
    includedFeatures: {
      inbox: true,
      instagram: true,
      telegram: false,
      automation: false,
      chatbot: false,
      crm: false,
      reports: false,
      aiAgent: false,
      bulkPaste: false,
    },
    features: [
      'WhatsApp + Instagram inbox',
      '5,000 contacts · 10,000 messages/mo',
      'Unlimited campaigns & templates',
      '3 team members · 1 WhatsApp number',
    ],
  },
  {
    id: 'growth',
    slug: 'growth',
    name: 'Growth',
    description: 'Automation, chatbot and CRM for the whole team.',
    monthlyPrice: 1799,
    yearlyPrice: 17990,
    validityDays: 30,
    popular: true,
    isRecommended: true,
    includedFeatures: {
      inbox: true,
      instagram: true,
      telegram: true,
      automation: true,
      chatbot: true,
      crm: true,
      reports: true,
      aiAgent: false,
      bulkPaste: true,
    },
    features: [
      'Everything in Starter, plus:',
      'Telegram inbox',
      'Automation & chatbot flow builder',
      'CRM pipelines & reports',
      '25,000 contacts · 50,000 messages/mo',
      '5 team members',
    ],
  },
  {
    id: 'pro',
    slug: 'pro',
    name: 'Pro',
    description: 'AI Sales Agent and payment links.',
    monthlyPrice: 2999,
    yearlyPrice: 29990,
    validityDays: 30,
    includedFeatures: {
      inbox: true,
      instagram: true,
      telegram: true,
      automation: true,
      chatbot: true,
      crm: true,
      reports: true,
      aiAgent: true,
      bulkPaste: true,
    },
    features: [
      'Everything in Growth, plus:',
      'AI Sales Agent — 2,000 replies/month',
      'Payment links',
      '100,000 contacts · 200,000 messages/mo',
      '10 team members · 2 WhatsApp numbers',
    ],
  },
  {
    id: 'business',
    slug: 'business',
    name: 'Business',
    description: 'For agencies and multi-number setups.',
    monthlyPrice: 5999,
    yearlyPrice: 59990,
    validityDays: 30,
    includedFeatures: {
      inbox: true,
      instagram: true,
      telegram: true,
      automation: true,
      chatbot: true,
      crm: true,
      reports: true,
      aiAgent: true,
      bulkPaste: true,
    },
    features: [
      'Everything in Pro, plus:',
      'Unlimited contacts & messages',
      'AI Sales Agent — 10,000 replies/month',
      '3 WhatsApp numbers · API access',
      'Unlimited team members',
    ],
  },
];
