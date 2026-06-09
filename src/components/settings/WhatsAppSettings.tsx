import { useState, useEffect, useCallback } from 'react';
import {
  Phone,
  CheckCircle,
  Trash2,
  Loader2,
  Star,
  Cloud,
  Plus,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Activity,
  Shield,
  Clock,
} from 'lucide-react';
import api, { whatsapp } from '../../services/api';
import toast from 'react-hot-toast';
import { useFacebookSDK } from '../../hooks/useFacebookSDK';
import { useAuth } from '../../context/AuthContext';

// ============================================
// TYPES
// ============================================

interface WhatsAppAccount {
  id: string;
  phoneNumber: string;
  displayName: string;
  verifiedName: string;
  qualityRating: string | null;
  messagingLimit: string | null;
  status: string;
  connectionType: 'CLOUD_API' | 'WHATSAPP_BUSINESS_APP';
  isDefault: boolean;
  codeVerificationStatus: string | null;
  dailyMessageLimit: number;
  dailyMessagesUsed: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// HELPERS
// ============================================

const getQualityConfig = (rating: string | null) => {
  switch (rating?.toUpperCase()) {
    case 'GREEN':
    case 'HIGH':
      return {
        label: 'High',
        color: 'text-green-700 dark:text-green-300',
        bg: 'bg-green-100 dark:bg-green-900/40',
        dot: 'bg-green-500',
        ring: 'ring-green-500/20',
      };
    case 'YELLOW':
    case 'MEDIUM':
      return {
        label: 'Medium',
        color: 'text-yellow-700 dark:text-yellow-300',
        bg: 'bg-yellow-100 dark:bg-yellow-900/40',
        dot: 'bg-yellow-500',
        ring: 'ring-yellow-500/20',
      };
    case 'RED':
    case 'LOW':
      return {
        label: 'Low',
        color: 'text-red-700 dark:text-red-300',
        bg: 'bg-red-100 dark:bg-red-900/40',
        dot: 'bg-red-500',
        ring: 'ring-red-500/20',
      };
    default:
      return {
        label: 'Unknown',
        color: 'text-gray-300',
        bg: 'bg-[#0a0e27]/[0.04]',
        dot: 'bg-gray-400',
        ring: 'ring-gray-500/20',
      };
  }
};

const getMessagingTierLabel = (tier: string | null) => {
  if (!tier) return 'Not set';
  const tierMap: Record<string, string> = {
    TIER_50: '50/day',
    TIER_250: '250/day',
    TIER_1K: '1,000/day',
    TIER_10K: '10,000/day',
    TIER_100K: '100,000/day',
    TIER_UNLIMITED: 'Unlimited',
  };
  return tierMap[tier] || tier;
};

const formatLastSynced = (date: string) => {
  const now = new Date();
  const synced = new Date(date);
  const diffMs = now.getTime() - synced.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return synced.toLocaleDateString();
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function WhatsAppSettings() {
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncingAccountId, setSyncingAccountId] = useState<string | null>(
    null
  );
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // ✅ ADD THESE LINES
  const { organization } = useAuth();
  const organizationId = organization?.id || '';
  const { isReady: sdkReady, isLoading: sdkLoading } = useFacebookSDK();

  // 🔍 DEBUG - Remove after testing
  console.log('🔍 Organization:', organization);
  console.log('🔍 Organization ID:', organizationId);
  console.log('🔍 SDK Ready:', sdkReady);

  // ────────────────────────────────────────────
  // Fetch accounts
  // ────────────────────────────────────────────
  const fetchAccounts = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const { data } = await api.get('/meta/accounts');

      // Handle different response structures
      let accountsList: WhatsAppAccount[] = [];
      if (Array.isArray(data?.data)) {
        accountsList = data.data;
      } else if (Array.isArray(data?.data?.accounts)) {
        accountsList = data.data.accounts;
      }

      setAccounts(accountsList);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      if (!silent) toast.error('Failed to load accounts');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // ────────────────────────────────────────────
  // Sync all quality ratings (background)
  // ────────────────────────────────────────────
  const syncAllQuality = useCallback(
    async (showToast = false) => {
      try {
        setSyncing(true);
        const response = await whatsapp.syncAllAccountsQuality();

        const syncStats = response.data?.data?.syncStats;
        const updatedAccounts = response.data?.data?.accounts;

        if (updatedAccounts && Array.isArray(updatedAccounts)) {
          setAccounts(updatedAccounts);
        }

        setLastSyncTime(new Date());

        if (showToast && syncStats) {
          if (syncStats.synced > 0) {
            toast.success(
              `✅ Synced ${syncStats.synced} account${
                syncStats.synced > 1 ? 's' : ''
              }`
            );
          } else if (syncStats.total === 0) {
            toast('No connected accounts to sync', { icon: 'ℹ️' });
          } else {
            toast.error('Sync failed for all accounts');
          }
        }
      } catch (error: any) {
        console.error('Sync failed:', error);
        if (showToast) {
          toast.error(
            error?.response?.data?.message || 'Failed to sync accounts'
          );
        }
      } finally {
        setSyncing(false);
      }
    },
    []
  );

  // ────────────────────────────────────────────
  // Sync single account
  // ────────────────────────────────────────────
  const syncSingleAccount = async (accountId: string) => {
    try {
      setSyncingAccountId(accountId);

      const response = await whatsapp.syncAccountQuality(accountId);
      const updated = response.data?.data;

      if (updated) {
        setAccounts((prev) =>
          prev.map((acc) => (acc.id === accountId ? { ...acc, ...updated } : acc))
        );
        toast.success('Account refreshed');
        setLastSyncTime(new Date());
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to refresh');
    } finally {
      setSyncingAccountId(null);
    }
  };

  // ────────────────────────────────────────────
  // Initial load + auto-sync
  // ────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      await fetchAccounts();
      // Background sync after page load (silent)
      setTimeout(() => {
        syncAllQuality(false);
      }, 1500);
    };
    init();
  }, [fetchAccounts, syncAllQuality]);

  // ────────────────────────────────────────────
  // Auto-refresh every 5 minutes
  // ────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      syncAllQuality(false);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [syncAllQuality]);

  // ────────────────────────────────────────────
  // Connect handler - EMBEDDED SIGNUP
  // ────────────────────────────────────────────
  const handleConnect = async () => {
    // Already connected check
    if (connectedAccounts.length > 0) {
      toast.error('Please disconnect the current account before connecting a new one.');
      return;
    }

    // SDK check
    if (!sdkReady || !window.FB) {
      toast.error('Facebook SDK is still loading. Please wait a moment and try again.');
      return;
    }

    // Config ID check
    const configId = import.meta.env.VITE_META_CONFIG_ID;
    if (!configId) {
      toast.error('Meta configuration missing. Please contact support.');
      console.error('❌ VITE_META_CONFIG_ID not set in .env');
      return;
    }

    if (!organizationId) {
      toast.error('Organization not found. Please refresh the page.');
      return;
    }

    setConnecting(true);

    console.log('🚀 Launching Embedded Signup with:', {
      configId,
      organizationId,
    });

    try {
      // ✅ EMBEDDED SIGNUP - This opens the WhatsApp wizard
      window.FB.login(
        async (response: any) => {
          console.log('📥 FB.login response:', response);

          if (response.authResponse && response.authResponse.code) {
            const code = response.authResponse.code;
            
            try {
              // Send code to backend
              console.log('📤 Sending code to backend...');
              
              const { data } = await api.post('/meta/callback', {
                code,
                organizationId,
                // No state - this is Embedded Signup
              });

              if (data?.success !== false) {
                toast.success('WhatsApp connected successfully! 🎉');
                await fetchAccounts();
                syncAllQuality(false);
              } else {
                throw new Error(data?.message || 'Connection failed');
              }
            } catch (err: any) {
              console.error('❌ Backend error:', err);
              const errorMsg = err.response?.data?.message || err.message || 'Connection failed';
              toast.error(errorMsg);
            } finally {
              setConnecting(false);
            }
          } else {
            console.log('⚠️ User cancelled or did not complete wizard');
            toast.error('Setup was cancelled. Please complete all wizard steps.');
            setConnecting(false);
          }
        },
        {
          config_id: configId,
          response_type: 'code',
          override_default_response_type: true,
          extras: {
            setup: {},
            featureType: 'whatsapp_business_app_onboarding',
            sessionInfoVersion: '3',
          },
        }
      );
    } catch (err: any) {
      console.error('❌ FB.login error:', err);
      toast.error(`Failed to launch wizard: ${err.message}`);
      setConnecting(false);
    }
  };

  // ────────────────────────────────────────────
  // Disconnect handler
  // ────────────────────────────────────────────
  const handleDisconnect = async (accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this account?'))
      return;

    try {
      await api.post(`/meta/accounts/${accountId}/disconnect`);
      toast.success('Account disconnected');
      fetchAccounts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to disconnect');
    }
  };

  // ────────────────────────────────────────────
  // Set default handler
  // ────────────────────────────────────────────
  const handleSetDefault = async (accountId: string) => {
    try {
      await api.post(`/meta/accounts/${accountId}/set-default`);
      toast.success('Default account updated');
      fetchAccounts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to set default');
    }
  };

  // ────────────────────────────────────────────
  // Loading state
  // ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <p className="text-sm text-gray-500">Loading accounts...</p>
      </div>
    );
  }

  const connectedAccounts = accounts.filter((a) => a.status === 'CONNECTED');
  const hasConnectedAccount = connectedAccounts.length > 0;

  // ────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ─── Header with Sync Button ──────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            WhatsApp Connection
          </h2>
          <p className="text-gray-500 mt-1">
            Connect and manage your WhatsApp Business accounts
          </p>
        </div>

        {hasConnectedAccount && (
          <div className="flex items-center gap-3">
            {lastSyncTime && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                <span>Updated {formatLastSynced(lastSyncTime.toISOString())}</span>
              </div>
            )}
            <button
              onClick={() => syncAllQuality(true)}
              disabled={syncing}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium
                text-gray-300 bg-[#0a0e27]
                border border-white/[0.1] rounded-lg
                hover:bg-[#0a0e27]/[0.04] transition-colors
                disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`}
              />
              {syncing ? 'Syncing...' : 'Refresh'}
            </button>
          </div>
        )}
      </div>

      {/* ─── Main Card ────────────────────────────────────────────────── */}
      <div
        className={`p-6 rounded-2xl border-2 transition-all ${
          hasConnectedAccount
            ? 'border-green-300 bg-green-50/50 dark:border-green-700 dark:bg-green-900/10'
            : 'border-white/[0.1] bg-[#0a0e27]'
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
              <Cloud className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-white">
                Meta WhatsApp Cloud API
              </h3>
              <p className="text-sm text-gray-500">
                Official WhatsApp Business API powered by Meta
              </p>
            </div>
          </div>
          {hasConnectedAccount && (
            <span className="px-3 py-1 bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-300 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Connected
            </span>
          )}
        </div>

        {/* ─── Connected Accounts List ──────────────────────────────── */}
        {hasConnectedAccount ? (
          <div className="space-y-4 mt-6">
            {connectedAccounts.map((account) => {
              const quality = getQualityConfig(account.qualityRating);
              const isSyncingThis = syncingAccountId === account.id;
              const usagePercent = account.dailyMessageLimit
                ? (account.dailyMessagesUsed / account.dailyMessageLimit) * 100
                : 0;

              return (
                <div
                  key={account.id}
                  className="bg-[#0a0e27] rounded-xl border border-white/[0.1] overflow-hidden"
                >
                  {/* Account Header */}
                  <div className="p-4 border-b border-white/[0.08]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-white">
                              {account.phoneNumber}
                            </span>
                            {account.isDefault && (
                              <>
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 text-xs font-medium rounded-full">
                                  Default
                                </span>
                              </>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {account.verifiedName ||
                              account.displayName ||
                              'Unnamed'}
                          </p>
                        </div>
                      </div>

                      {/* Refresh single account */}
                      <button
                        onClick={() => syncSingleAccount(account.id)}
                        disabled={isSyncingThis || syncing}
                        title="Refresh this account"
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <RefreshCw
                          className={`w-4 h-4 ${isSyncingThis ? 'animate-spin' : ''}`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-[#050816]/30">
                    {/* Quality Rating */}
                    <div className="bg-[#0a0e27] p-3 rounded-lg border border-white/[0.08]">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Quality
                      </div>
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${quality.bg} ${quality.color}`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${quality.dot}`}
                        />
                        {quality.label}
                      </div>
                    </div>

                    {/* Messaging Limit */}
                    <div className="bg-[#0a0e27] p-3 rounded-lg border border-white/[0.08]">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        Tier Limit
                      </div>
                      <p className="text-sm font-bold text-white">
                        {getMessagingTierLabel(account.messagingLimit)}
                      </p>
                    </div>

                    {/* Verification Status */}
                    <div className="bg-[#0a0e27] p-3 rounded-lg border border-white/[0.08]">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        Verification
                      </div>
                      <p
                        className={`text-sm font-bold ${
                          account.codeVerificationStatus === 'VERIFIED'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`}
                      >
                        {account.codeVerificationStatus === 'VERIFIED'
                          ? '✓ Verified'
                          : account.codeVerificationStatus || 'Pending'}
                      </p>
                    </div>

                    {/* Daily Usage */}
                    <div className="bg-[#0a0e27] p-3 rounded-lg border border-white/[0.08]">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        Today's Usage
                      </div>
                      <p className="text-sm font-bold text-white">
                        {account.dailyMessagesUsed}
                        <span className="text-gray-400 text-xs">
                          {' '}
                          / {account.dailyMessageLimit}
                        </span>
                      </p>
                      <div className="mt-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-all ${
                            usagePercent > 80
                              ? 'bg-red-500'
                              : usagePercent > 50
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{
                            width: `${Math.min(usagePercent, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 flex items-center justify-end gap-2 border-t border-white/[0.08]">
                    {!account.isDefault && connectedAccounts.length > 1 && (
                      <button
                        onClick={() => handleSetDefault(account.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600
                          bg-blue-50 dark:bg-blue-900/20 rounded-lg
                          hover:bg-blue-100 dark:hover:bg-blue-900/40 text-sm font-medium transition-colors"
                      >
                        <Star className="w-3.5 h-3.5" />
                        Set as Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDisconnect(account.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-red-600
                        bg-red-50 dark:bg-red-900/20 rounded-lg
                        hover:bg-red-100 dark:hover:bg-red-900/40 text-sm font-medium transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Disconnect
                    </button>
                  </div>
                </div>
              );
            })}

            {/* ✅ ONE ACCOUNT ONLY - Already connected info */}
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 
              border border-green-200 dark:border-green-800 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-300">
                WhatsApp account is connected. Disconnect current account to connect a different one.
              </p>
            </div>
          </div>
        ) : (
          /* ─── Empty State ──────────────────────────────────────────── */
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#0a0e27]/[0.04] dark:bg-gray-700 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="font-semibold text-white mb-1">
              No WhatsApp Account Connected
            </h4>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              Connect your WhatsApp Business account through Meta's official
              Cloud API for high-volume messaging with advanced features.
            </p>
            <button
              onClick={handleConnect}
              disabled={connecting || sdkLoading || !sdkReady}
              className="inline-flex items-center justify-center gap-2 px-6 py-3
                bg-green-600 text-white rounded-xl hover:bg-green-700
                disabled:opacity-50 font-semibold transition-colors"
            >
              {connecting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : sdkLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              {connecting ? 'Connecting...' : sdkLoading ? 'Loading...' : 'Connect with Meta'}
            </button>
          </div>
        )}
      </div>

      {/* ─── Info Card ────────────────────────────────────────────────── */}
      {hasConnectedAccount && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                About Quality Rating
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
                <strong>High (Green):</strong> Excellent quality, no
                restrictions. <strong>Medium (Yellow):</strong> Some
                user complaints, monitor activity. <strong>Low (Red):</strong>{' '}
                Many complaints, may face restrictions. Quality is calculated
                by Meta based on user feedback.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}