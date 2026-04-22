import { useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

// Define Plan Types explicitly
type PlanType = 'free' | 'monthly' | '3month' | '6month' | 'yearly';

// Feature Access Matrix - Defined outside to keep it stable
const FEATURES_MATRIX = {
  // Core Modules
  dashboard: ['free', 'monthly', '3month', '6month', 'yearly'],
  inbox: ['free', 'monthly', '3month', '6month', 'yearly'],
  contacts: ['free', 'monthly', '3month', '6month', 'yearly'],
  campaigns: ['free', 'monthly', '3month', '6month', 'yearly'],
  templates: ['free', 'monthly', '3month', '6month', 'yearly'],
  
  // Advanced Features
  automation: ['3month', '6month', 'yearly'],
  chatbot: ['monthly', '3month', '6month', 'yearly'],
  flowBuilder: ['monthly', '3month', '6month', 'yearly'],
  
  // Analytics
  analytics: ['monthly', '3month', '6month', 'yearly'],
  reports: ['free', 'monthly', '3month', '6month', 'yearly'],
  
  // Settings & Utils
  webhooks: ['monthly', '3month', '6month', 'yearly'],
  campaignRetry: ['6month', 'yearly'],
  mobileApiSameNumber: ['6month', 'yearly'],
  prioritySupport: ['6month', 'yearly'],
  team: ['monthly', '3month', '6month', 'yearly'],
  billing: ['free', 'monthly', '3month', '6month', 'yearly'],
  wallet: ['3month', '6month', 'yearly'],
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
    const allowedPlans = FEATURES_MATRIX[feature as keyof typeof FEATURES_MATRIX];
    
    if (!allowedPlans) {
      console.warn(`⚠️ Feature "${feature}" is not defined in usePlanAccess hook.`);
      return true; 
    }

    return allowedPlans.includes(userPlan);
  }, [userPlan]);

  return { hasAccess, currentPlan: userPlan };
};

export default usePlanAccess;