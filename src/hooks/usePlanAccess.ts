import { useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { ORG_FLAG_BY_KEY } from '../constants/features';

// Define Plan Types explicitly
type PlanType = 'free' | 'monthly' | '3month' | '6month' | 'yearly';

// Feature Access Matrix - Defined outside to keep it stable
const FEATURES_MATRIX = {
  // Core Modules
  dashboard: ['free', 'monthly', '3month', '6month', 'yearly'],
  inbox: ['free', 'monthly', '3month', '6month', 'yearly'],
  contacts: ['free', 'monthly', '3month', '6month', 'yearly'],
  crm: ['free', 'monthly', '3month', '6month', 'yearly'],
  campaigns: ['free', 'monthly', '3month', '6month', 'yearly'],
  templates: ['free', 'monthly', '3month', '6month', 'yearly'],

  // Advanced Features
  automation: ['monthly', '3month', '6month', 'yearly'],
  chatbot: ['monthly', '3month', '6month', 'yearly'],
  aiAgent: ['monthly', '3month', '6month', 'yearly'],
  flowBuilder: ['monthly', '3month', '6month', 'yearly'],

  // Channels - plan sabko deta hai; ye admin ke lock se hi band hote hain
  // (naye accounts par default locked).
  telegram: ['free', 'monthly', '3month', '6month', 'yearly'],
  instagram: ['free', 'monthly', '3month', '6month', 'yearly'],
  connection: ['free', 'monthly', '3month', '6month', 'yearly'],

  // Analytics
  analytics: ['monthly', '3month', '6month', 'yearly'],
  reports: ['monthly', '3month', '6month', 'yearly'],

  // Settings & Utils
  webhooks: ['monthly', '3month', '6month', 'yearly'],
  campaignRetry: ['6month', 'yearly'],
  mobileApiSameNumber: ['6month', 'yearly'],
  prioritySupport: ['6month', 'yearly'],
  team: ['monthly', '3month', '6month', 'yearly'],
  billing: ['free', 'monthly', '3month', '6month', 'yearly'],
  wallet: ['monthly', '3month', '6month', 'yearly'],
  settings: ['free', 'monthly', '3month', '6month', 'yearly'],
};

export const usePlanAccess = () => {
  const { organization } = useAuth();

  // Map Backend PlanType to Frontend PlanType
  const userPlan = useMemo((): PlanType => {
    const type = organization?.planType;
    if (type === 'MONTHLY') return 'monthly';
    if (type === 'QUARTERLY') return '3month';
    if (type === 'BIANNUAL') return '6month';
    if (type === 'ANNUAL') return 'yearly';
    return 'free'; // Default/FREE_DEMO
  }, [organization?.planType]);

  const hasAccess = useCallback((feature: string): boolean => {
    // 1. Admin lock sabse pehle. Har lockable feature ka flag
    //    src/constants/features.ts me hai, isliye naya feature add karne par
    //    yahan ek aur `if` nahi likhna padta.
    const orgFlag = ORG_FLAG_BY_KEY[feature];
    const orgFlags = organization as unknown as Record<string, boolean | undefined> | null;
    if (orgFlag && orgFlags?.[orgFlag] === true) {
      return false;
    }

    // 2. Check Plan Level Access
    const allowedPlans = FEATURES_MATRIX[feature as keyof typeof FEATURES_MATRIX];

    if (!allowedPlans) {
      console.warn(`⚠️ Feature "${feature}" is not defined in usePlanAccess hook.`);
      return true;
    }

    return allowedPlans.includes(userPlan);
  }, [userPlan, organization]);

  return { hasAccess, currentPlan: userPlan };
};

export default usePlanAccess;
