// src/pages/Billing.tsx

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Check,
  Loader2,
  AlertCircle,
  Calendar,
  Users,
  MessageSquare,
  Zap,
  Star,
  TrendingUp,
  Download,
  RefreshCw,
  Shield,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { billing } from '../services/api';
import toast from 'react-hot-toast';
import { loadRazorpayScript } from '../utils/razorpay';
import {
  CARD_CHANNELS,
  featureIncluded,
  getPlanCardFeatures,
  isSectionLabel,
  sectionLabelText,
} from '../utils/planCards';

// ============================================
// TYPES
// ============================================

interface Plan {
  id: string;
  name: string;
  type: string;
  slug: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxContacts: number;
  maxMessagesPerMonth: number;
  maxCampaignsPerMonth: number;
  maxTeamMembers: number;
  maxWhatsAppAccounts: number;
  maxTemplates: number;
  maxChatbots: number;
  maxAutomations: number;
  features: string[];
  validityDays?: number;
  /** Har feature ke liye plan ka saaf haan/na. Purane plans par null. */
  includedFeatures?: Record<string, boolean> | null;
  isActive: boolean;
  popular?: boolean;
}

interface Subscription {
  id: string;
  planId: string;
  plan?: Plan;
  status: string;
  billingCycle: 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  messagesUsed: number;
  contactsUsed: number;
  cancelledAt?: string;
}

interface UsageItem {
  used: number;
  limit: number;
  percentage: number;
}

interface Usage {
  messages?: UsageItem;
  contacts?: UsageItem;
  campaigns?: UsageItem;
  storage?: UsageItem;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | string;
  date: string;
  description?: string;
  type?: string;
  downloadUrl?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Safely format a number with locale string
 */
const safeFormatNumber = (
  value: number | undefined | null,
  fallback: string = '0'
): string => {
  if (value === undefined || value === null) return fallback;
  if (value === -1) return 'Unlimited';
  try {
    return value.toLocaleString('en-IN');
  } catch {
    return String(value);
  }
};

/**
 * Get default usage item
 */
const getDefaultUsageItem = (limit: number = 100): UsageItem => ({
  used: 0,
  limit,
  percentage: 0,
});

/**
 * Get default usage object
 */
const getDefaultUsage = (): Usage => ({
  messages: getDefaultUsageItem(1000),
  contacts: getDefaultUsageItem(100),
  campaigns: getDefaultUsageItem(10),
  storage: getDefaultUsageItem(100),
});

/**
 * Validate Razorpay Key
 */
const validateRazorpayKey = (key: string | undefined): boolean => {
  if (!key) return false;
  // Razorpay keys start with rzp_test_ or rzp_live_
  return key.startsWith('rzp_test_') || key.startsWith('rzp_live_');
};

// ============================================
// MAIN COMPONENT
// ============================================

const Billing: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage>(getDefaultUsage());
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [razorpayReady, setRazorpayReady] = useState(false);

  // Check if Razorpay is loaded
  useEffect(() => {
    const initRazorpay = async () => {
      const loaded = await loadRazorpayScript();
      if (loaded) {
        setRazorpayReady(true);
        console.log('✅ Razorpay SDK loaded');
      } else {
        console.log('❌ Failed to load Razorpay SDK');
      }
    };
    initRazorpay();
  }, []);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch all billing data in parallel
      const [plansRes, subscriptionRes, usageRes, invoicesRes] = await Promise.allSettled([
        billing.getPlans(),
        billing.getCurrentPlan(),
        billing.getUsage(),
        billing.getInvoices({ limit: 10 }),
      ]);

      // Handle plans
      if (plansRes.status === 'fulfilled' && plansRes.value.data.success) {
        const plansData = Array.isArray(plansRes.value.data.data)
          ? plansRes.value.data.data
          : [];
        setPlans(plansData);
      }

      // Handle subscription
      if (subscriptionRes.status === 'fulfilled' && subscriptionRes.value.data.success) {
        setSubscription(subscriptionRes.value.data.data);
      }

      // Handle usage
      if (usageRes.status === 'fulfilled' && usageRes.value.data.success) {
        const usageData = usageRes.value.data.data;
        const formattedUsage: Usage = {
          messages: usageData?.messages || getDefaultUsageItem(1000),
          contacts: usageData?.contacts || getDefaultUsageItem(100),
          campaigns: usageData?.campaigns || getDefaultUsageItem(10),
          storage: usageData?.storage || getDefaultUsageItem(100),
        };
        setUsage(formattedUsage);
      } else {
        setUsage(getDefaultUsage());
      }

      // Handle invoices
      if (invoicesRes.status === 'fulfilled' && invoicesRes.value.data.success) {
        const invoicesData = Array.isArray(invoicesRes.value.data.data)
          ? invoicesRes.value.data.data
          : [];
        setInvoices(invoicesData);
      }

      if (isRefresh) {
        toast.success('Billing data refreshed');
      }
    } catch (err: any) {
      console.error('Failed to fetch billing data:', err);
      setError('Unable to load billing information. Please try again later.');
      setUsage(getDefaultUsage());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getUserFullName = (u: any): string => {
    if (!u) return '';
    if (u.firstName || u.lastName) {
      return `${u.firstName || ''} ${u.lastName || ''}`.trim();
    }
    return u.name || u.email || '';
  };

  const getUserPhone = (u: any): string => {
    if (!u) return '';
    return u.phone || '';
  };

  const handleSubscribe = async (planSlug: string) => {
    try {
      // Ensure Razorpay is loaded
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Failed to load payment gateway. Please check your connection.');
        return;
      }
      setRazorpayReady(true);

      setIsChangingPlan(true);

      // Create order on backend
      console.log('Creating order for plan:', planSlug, billingCycle);
      // The backend catalogue holds two keys per tier - `pro` and
      // `pro_yearly`. The cycle has to travel in the key, or we take a
      // year's money and grant a month's access.
      const planKey = billingCycle === 'yearly' ? `${planSlug}_yearly` : planSlug;

      const orderResponse = await billing.createRazorpayOrder({
        planKey,
        billingCycle,
      });

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || 'Failed to create order');
      }

      const order = orderResponse.data.data;
      console.log('Order created:', {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      });

      // Get Razorpay key from environment
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID ||
        import.meta.env.VITE_RAZORPAY_KEY ||
        '';

      // Debug logging
      console.log('=== RAZORPAY CONFIGURATION ===');
      console.log('Environment Keys Available:', Object.keys(import.meta.env).filter(k => k.includes('RAZORPAY')));
      console.log('Key Found:', razorpayKey ? `${razorpayKey.substring(0, 15)}...` : 'NO KEY');
      console.log('Key Valid:', validateRazorpayKey(razorpayKey) ? '✅' : '❌');

      if (!validateRazorpayKey(razorpayKey)) {
        console.error('Invalid Razorpay key configuration');
        toast.error('Payment gateway not configured. Please contact support.');
        setIsChangingPlan(false);
        return;
      }

      // Prepare Razorpay options
      const options: any = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'WabMeta',
        description: `${planSlug.toUpperCase()} Plan - ${billingCycle === 'yearly' ? 'Annual' : 'Monthly'} Billing`,
        image: '/logo.png', // Add your logo
        order_id: order.id,
        handler: async (response: any) => {
          console.log('✅ Payment successful:', response);

          // Show loading toast
          const loadingToast = toast.loading('Verifying payment...');

          try {
            const verifyResponse = await billing.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.dismiss(loadingToast);

            if (verifyResponse.data.success) {
              toast.success('🎉 Subscription activated successfully!');
              await fetchBillingData();
            } else {
              throw new Error(verifyResponse.data.message || 'Payment verification failed');
            }
          } catch (error: any) {
            toast.dismiss(loadingToast);
            console.error('Verification error:', error);
            toast.error(error.message || 'Payment verification failed. Please contact support.');
          } finally {
            setIsChangingPlan(false);
          }
        },
        prefill: {
          name: getUserFullName(user),
          email: (user as any)?.email || '',
          contact: getUserPhone(user),
        },
        notes: {
          userId: (user as any)?.id,
          planSlug: planSlug,
          billingCycle: billingCycle
        },
        theme: {
          color: '#22c55e',
          backdrop_color: 'rgba(0, 0, 0, 0.8)'
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal closed by user');
            setIsChangingPlan(false);
            toast('Payment cancelled', { icon: '❌' });
          },
          escape: true,
          animation: true,
          confirm_close: true
        },
        retry: {
          enabled: true,
          max_count: 3
        },
        remember_customer: true,
        send_sms_hash: true
      };

      console.log('Opening Razorpay with options:', {
        ...options,
        key: options.key.substring(0, 15) + '...'
      });

      // Create Razorpay instance
      const rzp = new window.Razorpay(options);

      // Handle payment failure
      rzp.on('payment.failed', function (response: any) {
        console.error('❌ Payment Failed:', response.error);

        let errorMessage = 'Payment failed';
        if (response.error?.description) {
          errorMessage = response.error.description;
        } else if (response.error?.reason) {
          errorMessage = response.error.reason;
        }

        toast.error(errorMessage);
        setIsChangingPlan(false);
      });

      // Open payment modal
      rzp.open();

    } catch (error: any) {
      console.error('Subscribe error:', error);
      toast.error(error.message || 'Failed to initialize payment. Please try again.');
      setIsChangingPlan(false);
    }
  };



  // ============================================
  // ERROR STATE
  // ============================================

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start">
          <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 mr-4 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">
              Error Loading Billing
            </h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <button
              onClick={() => fetchBillingData()}
              className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium inline-flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </button>
          </div>
        </div>
      </div>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Billing & Plans
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your subscription and billing information
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!razorpayReady && (
            <div className="px-3 py-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-xs font-medium flex items-center">
              <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
              Loading Payment Gateway...
            </div>
          )}
          <button
            onClick={() => fetchBillingData(true)}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : subscription && (
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 relative z-10">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Current Plan
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="text-2xl font-bold text-gray-900">
                  {subscription.plan?.name || 'Free'}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${subscription.status === 'active' || subscription.status === 'ACTIVE'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : subscription.status === 'cancelled' || subscription.status === 'CANCELLED'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    }`}
                >
                  {subscription.status.toLowerCase()}
                </span>
                {subscription.billingCycle?.toLowerCase() !== 'manual' && (
                  <span className="text-gray-500 capitalize">
                    {subscription.billingCycle}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-3 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {subscription.status === 'active' || subscription.status === 'ACTIVE'
                  ? 'Next billing date: '
                  : 'Expires: '}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {(subscription.status === 'active' || subscription.status === 'ACTIVE') && (
              <button
                onClick={() => {
                  const pricingSection = document.getElementById('pricing-plans');
                  if (pricingSection) {
                    pricingSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200"
              >
                Upgrade Plan
              </button>
            )}
          </div>
        </div>
      )}

      {/* Usage Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-50 animate-pulse rounded-2xl border border-gray-100"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {usage.messages && (
            <UsageCard
              title="Messages"
              used={usage.messages.used}
              limit={usage.messages.limit}
              percentage={usage.messages.percentage}
              icon={MessageSquare}
              color="blue"
            />
          )}
          {usage.contacts && (
            <UsageCard
              title="Contacts"
              used={usage.contacts.used}
              limit={usage.contacts.limit}
              percentage={usage.contacts.percentage}
              icon={Users}
              color="green"
            />
          )}
          {usage.campaigns && (
            <UsageCard
              title="Campaigns"
              used={usage.campaigns.used}
              limit={usage.campaigns.limit}
              percentage={usage.campaigns.percentage}
              icon={Zap}
              color="purple"
            />
          )}
          {usage.storage && (
            <UsageCard
              title="Storage (MB)"
              used={usage.storage.used}
              limit={usage.storage.limit}
              percentage={usage.storage.percentage}
              icon={TrendingUp}
              color="orange"
            />
          )}
        </div>
      )}

      {/* Billing Cycle Toggle */}
      <BillingCycleToggle value={billingCycle} onChange={setBillingCycle} />

      {/* Security Badge */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Shield className="w-4 h-4" />
          <span>Secure payment powered by Razorpay</span>
        </div>
      </div>

      {/* Pricing Comparison Table - NEW PREMIUM UI */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Compare Plans</h2>
          <p className="text-gray-600">Choose the best plan that fits your business needs</p>
        </div>

        <ComparisonTable plans={plans} billingCycle={billingCycle} />
        <p className="mt-4 text-[10px] text-gray-500 text-center italic">*Unlimited messages are subject to Meta's fair usage policy and conversation-based pricing.</p>
      </div>

      {/* Pricing Cards */}
      <div id="pricing-plans" className="text-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Select Your Tier</h2>
        <div className="h-1.5 w-20 bg-green-500 mx-auto rounded-full"></div>
      </div>

      {/* The cards are a long scroll below the first toggle, and the price on
          them changes with it - so the switch is repeated where it applies. */}
      <BillingCycleToggle value={billingCycle} onChange={setBillingCycle} />

      {plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-20 px-2">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
              isCurrentPlan={subscription?.planId === plan.id}
              onSelect={() => handleSubscribe(plan.slug)}
              disabled={isChangingPlan || !razorpayReady}
              isFreePlan={(plan.monthlyPrice ?? 0) === 0 && (plan.yearlyPrice ?? 0) === 0}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 mb-12 bg-white rounded-3xl border border-gray-200 shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium text-lg">
            Synchronizing with server...
          </p>
        </div>
      )}

      {/* Invoices / Billing History */}
      <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 relative z-10">
          Billing History
        </h2>
        {invoices.length > 0 ? (
          <div className="space-y-2 relative z-10">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-all group border border-transparent hover:border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <CreditCard className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">
                      {invoice.description || 'Payment'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-sm font-semibold text-gray-700">
                        ₹{((invoice.amount ?? 0) / 100).toFixed(2)}
                      </p>
                      <span className="text-gray-400 text-xs">•</span>
                      <p className="text-sm text-gray-500">
                        {new Date(invoice.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${invoice.status === 'paid'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : invoice.status === 'pending'
                        ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                  >
                    {invoice.status}
                  </span>
                  {invoice.downloadUrl && (
                    <a
                      href={invoice.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Download Invoice"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No billing history available</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// USAGE CARD COMPONENT
// ============================================

interface UsageCardProps {
  title: string;
  used: number;
  limit: number;
  percentage: number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const UsageCard: React.FC<UsageCardProps> = ({
  title,
  used = 0,
  limit = 100,
  percentage = 0,
  icon: Icon,
  color,
}) => {
  const colorClasses = {
    blue: 'text-blue-700 bg-blue-50 border border-blue-100',
    green: 'text-green-700 bg-green-50 border border-green-100',
    purple: 'text-purple-700 bg-purple-50 border border-purple-100',
    orange: 'text-orange-700 bg-orange-50 border border-orange-100',
  };

  const progressColor = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
  };

  const safePercentage = Math.min(Math.max(percentage || 0, 0), 100);
  const isWarning = safePercentage >= 80;
  const isCritical = safePercentage >= 95;

  return (
    <div className="relative overflow-hidden bg-white border border-gray-200 rounded-2xl p-5 hover:bg-gray-50 shadow-sm transition-all duration-200 group/stat">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span
          className={`text-sm font-medium ${isCritical
            ? 'text-red-600'
            : isWarning
              ? 'text-yellow-600'
              : 'text-gray-500'
            }`}
        >
          {safePercentage.toFixed(0)}%
        </span>
      </div>
      <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-3">
        {safeFormatNumber(used)} / {limit === -1 ? 'Unlimited' : safeFormatNumber(limit)}
      </p>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${isCritical
            ? 'bg-red-500'
            : isWarning
              ? 'bg-yellow-500'
              : progressColor[color]
            }`}
          style={{ width: `${safePercentage}%` }}
        />
      </div>
    </div>
  );
};

// ============================================
// BILLING CYCLE TOGGLE
// ============================================
//
// Rendered twice - once above the comparison table and once above the cards.
// It used to sit only at the top, a full table above the cards whose prices
// it controls, so on the cards the annual option looked like it did not exist.

const BillingCycleToggle: React.FC<{
  value: 'monthly' | 'yearly';
  onChange: (cycle: 'monthly' | 'yearly') => void;
}> = ({ value, onChange }) => (
  <div className="flex justify-center mb-8">
    <div className="bg-gray-100 border border-gray-200 rounded-xl p-1.5 inline-flex shadow-sm">
      <button
        onClick={() => onChange('monthly')}
        className={`px-6 py-2.5 rounded-lg font-medium transition-all ${value === 'monthly'
          ? 'bg-emerald-600 text-white shadow-sm'
          : 'text-gray-500 hover:text-gray-900'
          }`}
      >
        Monthly
      </button>
      <button
        onClick={() => onChange('yearly')}
        className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center ${value === 'yearly'
          ? 'bg-emerald-600 text-white shadow-sm'
          : 'text-gray-500 hover:text-gray-900'
          }`}
      >
        Yearly
        {/* Annual is ten months' price, so the saving is two months - not the
            20% this badge used to claim. */}
        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-semibold border ${value === 'yearly'
          ? 'bg-white/15 text-white border-white/25'
          : 'bg-green-50 text-green-700 border-green-200'
          }`}>
          2 months free
        </span>
      </button>
    </div>
  </div>
);

// ============================================
// COMPARE PLANS TABLE
// ============================================
//
// This table used to be hardcoded end to end - the retired plans' names,
// prices and ticks written straight into the JSX. When the plans changed the
// cards followed and the table did not, so the same page quoted two different
// prices. Every column is now a plan the API returned, and every cell is that
// plan's own data.

const UNLIMITED_AT = 9999;

const countText = (n: number | undefined | null): string => {
  const v = Number(n);
  if (!Number.isFinite(v) || v <= 0) return '—';
  return v >= UNLIMITED_AT ? 'Unlimited' : v.toLocaleString('en-IN');
};

const validityText = (plan: Plan, billingCycle: 'monthly' | 'yearly'): string => {
  const yearly = plan.yearlyPrice ?? 0;
  if (billingCycle === 'yearly' && yearly > 0) return '12 months';

  const days = plan.validityDays ?? 30;
  if (days >= 365) return '12 months';
  if (days >= 28) return `${Math.round(days / 30)} month${days >= 58 ? 's' : ''}`;
  return `${days} days`;
};

// A row is either text or a yes/no. `flag` is a key from the plan's
// includedFeatures; a plan carrying no such data (the retired ones) is read
// as having everything open.
type CompareRow =
  | { label: string; flag: string }
  | { label: string; value: (plan: Plan, billingCycle: 'monthly' | 'yearly') => string; strong?: boolean };

const COMPARE_ROWS: CompareRow[] = [
  {
    label: 'Price',
    strong: true,
    value: (plan, cycle) => {
      const monthly = plan.monthlyPrice ?? 0;
      const yearly = plan.yearlyPrice ?? 0;
      if (monthly === 0 && yearly === 0) return 'Free';
      if (cycle === 'yearly' && yearly > 0) return `₹${yearly.toLocaleString('en-IN')}/yr`;
      return `₹${monthly.toLocaleString('en-IN')}/mo`;
    },
  },
  { label: 'Validity', value: (plan, cycle) => validityText(plan, cycle) },
  { label: 'WhatsApp inbox', flag: 'inbox' },
  { label: 'Instagram inbox', flag: 'instagram' },
  { label: 'Telegram inbox', flag: 'telegram' },
  { label: 'Automation', flag: 'automation' },
  { label: 'Chatbot flow builder', flag: 'chatbot' },
  { label: 'CRM pipelines', flag: 'crm' },
  { label: 'Reports', flag: 'reports' },
  { label: 'AI Sales Agent', flag: 'aiAgent' },
  { label: 'Bulk paste', flag: 'bulkPaste' },
  { label: 'Team members', value: (plan) => countText(plan.maxTeamMembers) },
  { label: 'WhatsApp numbers', value: (plan) => countText(plan.maxWhatsAppAccounts) },
  { label: 'Contacts', value: (plan) => countText(plan.maxContacts) },
  { label: 'Messages / month', value: (plan) => {
      const n = countText(plan.maxMessagesPerMonth);
      return n === 'Unlimited' ? 'Unlimited*' : n;
    },
  },
  { label: 'Campaigns / month', value: (plan) => countText(plan.maxCampaignsPerMonth) },
];

const ComparisonTable: React.FC<{
  plans: Plan[];
  billingCycle: 'monthly' | 'yearly';
}> = ({ plans, billingCycle }) => {
  if (!plans || plans.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-4 text-sm font-semibold text-gray-900 border-b border-gray-200">
              Features
            </th>
            {plans.map((plan) => (
              <th
                key={plan.id}
                className={`p-4 text-sm font-semibold text-center border-b ${plan.popular
                  ? 'text-green-700 border-green-200 bg-green-50/50'
                  : 'text-gray-900 border-gray-200'
                  }`}
              >
                {plan.name}
                {plan.popular && (
                  <>
                    <br />
                    <span className="text-[10px] uppercase tracking-wider font-bold">
                      Recommended
                    </span>
                  </>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {COMPARE_ROWS.map((row) => (
            <tr key={row.label}>
              <td className={`p-4 text-sm text-gray-700 ${'strong' in row && row.strong ? 'font-bold' : 'font-medium'}`}>
                {row.label}
              </td>
              {plans.map((plan) => {
                const highlight = plan.popular ? 'bg-green-50/50' : '';

                if ('flag' in row) {
                  const on = featureIncluded(plan.includedFeatures, row.flag);
                  return (
                    <td key={plan.id} className={`p-4 text-center ${highlight}`}>
                      {on ? (
                        <Check className="w-4 h-4 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300 mx-auto" />
                      )}
                    </td>
                  );
                }

                return (
                  <td
                    key={plan.id}
                    className={`p-4 text-sm text-center ${highlight} ${row.strong
                      ? plan.popular
                        ? 'font-bold text-green-700'
                        : 'font-bold text-gray-900'
                      : 'text-gray-600'
                      }`}
                  >
                    {row.value(plan, billingCycle)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface PricingCardProps {
  plan: Plan;
  billingCycle: 'monthly' | 'yearly';
  isCurrentPlan: boolean;
  onSelect: () => void;
  disabled: boolean;
  /**
   * Free Demo cannot be bought - there is nothing to charge, Razorpay
   * refuses a zero-rupee order and the checkout catalogue has no key for it.
   * Its button says so instead of starting a checkout that can only fail.
   */
  isFreePlan?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  billingCycle,
  isCurrentPlan,
  onSelect,
  disabled,
  isFreePlan,
}) => {
  const monthly = plan.monthlyPrice ?? 0;
  const yearly = plan.yearlyPrice ?? 0;
  const isFree = monthly === 0 && yearly === 0;

  // On yearly the big number is per month and the year's total sits below
  // it, so the two cycles compare directly.
  const price =
    billingCycle === 'yearly' && yearly > 0 ? Math.round(yearly / 12) : monthly;

  const features = getPlanCardFeatures(plan);

  return (
    <div
      className={`relative overflow-hidden bg-white rounded-2xl p-6 transition-all border-2 ${plan.popular
        ? 'border-emerald-500 shadow-lg shadow-emerald-500/10'
        : isCurrentPlan
          ? 'border-blue-500 shadow-md shadow-blue-500/10'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
    >
      {/* Badges */}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg">
            <Star className="w-3 h-3 mr-1 fill-current" />
            MOST POPULAR
          </span>
        </div>
      )}

      {isCurrentPlan && !plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-sm">
            <Check className="w-3 h-3 mr-1" />
            CURRENT PLAN
          </span>
        </div>
      )}

      {/* Plan Header */}
      <div className="text-center mb-8 pt-4 pb-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wider">
          {plan.name || 'Plan'}
        </h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-sm font-bold text-gray-500">₹</span>
          <span className="text-4xl font-black text-gray-900">
            {price.toLocaleString('en-IN')}
          </span>
        </div>
        <p className="text-xs font-semibold text-gray-500 mt-2">
          {isFree
            ? 'FREE'
            : plan.slug.includes('3')
              ? 'PER 3 MONTHS'
              : plan.slug.includes('6')
                ? 'PER 6 MONTHS'
                : 'PER MONTH'}
        </p>
        {billingCycle === 'yearly' && yearly > 0 && (
          <p className="text-xs font-semibold text-emerald-600 mt-1">
            ₹{yearly.toLocaleString('en-IN')} billed yearly
          </p>
        )}
      </div>

      {/* Channels, from the plan's own flags rather than hardcoded */}
      <div className="flex flex-wrap gap-1.5 justify-center mt-5 mb-1">
        {CARD_CHANNELS.map((c) => {
          const on = featureIncluded(plan.includedFeatures, c.key);
          return (
            <span
              key={c.key}
              className={`text-[11px] font-semibold px-2 py-1 rounded-md border ${on
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-gray-100 text-gray-400 border-gray-200'
                }`}
            >
              {c.label}
            </span>
          );
        })}
      </div>

      {/* Features List */}
      <div className="px-2 mt-5">
        <ul className="space-y-3 mb-10 min-h-[200px]">
          {features.map((feature, i) =>
            isSectionLabel(feature.text) ? (
              <li key={i} className="pt-3 first:pt-0">
                <div className="border-t border-dashed border-gray-200 pt-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  {sectionLabelText(feature.text)}
                </div>
              </li>
            ) : (
            <li key={i} className="flex items-center text-sm">
              {feature.active ? (
                <div className="w-5 h-5 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mr-3 flex-shrink-0">
                  <Check className="w-3 h-3 text-green-700" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <X className="w-3 h-3 text-gray-400" />
                </div>
              )}
              <span className={feature.active ? 'text-gray-700 font-medium' : 'text-gray-400 line-through opacity-60'}>
                {feature.text}
              </span>
            </li>
            )
          )}
        </ul>
      </div>

      {/* Select Button */}
      <button
        onClick={onSelect}
        disabled={disabled || isCurrentPlan || isFreePlan}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${isCurrentPlan || isFreePlan
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : disabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : plan.popular
              ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/25 hover:shadow-green-600/40'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
      >
        {isCurrentPlan ? (
          <span className="flex items-center justify-center">
            <Check className="w-4 h-4 mr-2" />
            Current Plan
          </span>
        ) : isFreePlan ? (
          'Trial plan'
        ) : disabled ? (
          <span className="flex items-center justify-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </span>
        ) : (
          'Select Plan'
        )}
      </button>
    </div>
  );
};

// ============================================
// RAZORPAY TYPE DECLARATION
// ============================================

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default Billing;