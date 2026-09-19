import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { ORG_FLAG_BY_KEY } from '../constants/features';

// Whether this organisation can see a feature.
//
// There is exactly one answer to that question and the server already worked
// it out: the plan, any per-organisation override the admin granted, and the
// admin's own lock, combined into the featureXLocked flags that come back on
// the organisation payload. This hook reads those flags and nothing else.
//
// It used to hold its own FEATURES_MATRIX keyed by the old duration plans
// (free / monthly / 3month / 6month / yearly). Every new tier - STARTER,
// GROWTH, PRO, BUSINESS - fell through that mapping to 'free', and 'free' was
// not in the list for chatbot, automation, aiAgent, reports or wallet. So a
// Business customer paying ₹5,999 saw the same padlocks as a trial, and an
// admin granting a plan exception changed nothing, because for those features
// the matrix decided before it ever looked at the org flags. CRM was open to
// 'free' in that matrix, which is why CRM alone appeared to work.
//
// Anything outside the feature registry (dashboard, billing, settings) is not
// lockable and is always allowed.

export const usePlanAccess = () => {
  const { organization } = useAuth();

  const hasAccess = useCallback(
    (feature: string): boolean => {
      const orgFlag = ORG_FLAG_BY_KEY[feature];
      if (!orgFlag) return true;

      const flags = organization as unknown as
        | Record<string, boolean | undefined>
        | null;

      // Only an explicit true locks it. A missing flag - an older payload, or
      // an organisation that has not loaded yet - must not padlock the app.
      return flags?.[orgFlag] !== true;
    },
    [organization]
  );

  return {
    hasAccess,
    currentPlan: organization?.planType || 'FREE_DEMO',
  };
};

export default usePlanAccess;
