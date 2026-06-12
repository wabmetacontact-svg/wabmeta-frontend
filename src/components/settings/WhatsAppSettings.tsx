import { useState, useEffect, useCallback, useRef } from 'react';
import { useMetaConnect } from '../../hooks/useMetaConnect';
import { usePlanAccess } from '../../hooks/usePlanAccess';
import {
  Phone, CheckCircle, Trash2, Loader2, Star, Cloud, Plus,
  RefreshCw, AlertCircle, TrendingUp, Activity, Shield, Clock,
} from 'lucide-react';
import api, { whatsapp } from '../../services/api';
import toast from 'react-hot-toast';

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

const getQualityConfig = (rating: string | null) => {
  switch (rating?.toUpperCase()) {
    case 'GREEN':
    case 'HIGH':
      return {
        label: 'High',
        color: 'text-green-700',
        bg: 'bg-green-100',
        dot: 'bg-green-500',
      };
    case 'YELLOW':
    case 'MEDIUM':
      return {
        label: 'Medium',
        color: 'text-yellow-700',
        bg: 'bg-yellow-100',
        dot: 'bg-yellow-500',
      };
    case 'RED':
    case 'LOW':
      return {
        label: 'Low',
        color: 'text-red-700',
        bg: 'bg-red-100',
        dot: 'bg-red-500',
      };
    default:
      return {
        label: 'Unknown',
        color: 'text-slate-500',
        bg: 'bg-slate-100',
        dot: 'bg-slate-400',
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

export default function WhatsAppSettings() {
  const { hasAccess } = usePlanAccess();
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // orgId localStorage se (api.ts wala hi pattern)
  const getOrgId = (): string => {
    try {
      const raw = localStorage.getItem('wabmeta_org');
      const org = raw ? JSON.parse(raw) : null;
      return org?.id || localStorage.getItem('currentOrganizationId') || '';
    } catch {
      return localStorage.getItem('currentOrganizationId') || '';
    }
  };
  const [syncing, setSyncing] = useState(false);
  const [syncingAccountId, setSyncingAccountId] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const fetchAccounts = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const { data } = await api.get('/meta/accounts');
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

  const syncAllQuality = useCallback(async (showToast = false) => {
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
          toast.success(`✅ Synced ${syncStats.synced} account${syncStats.synced > 1 ? 's' : ''}`);
        } else if (syncStats.total === 0) {
          toast('No connected accounts to sync', { icon: 'ℹ️' });
        } else {
          toast.error('Sync failed for all accounts');
        }
      }
    } catch (error: any) {
      console.error('Sync failed:', error);
      if (showToast) {
        toast.error(error?.response?.data?.message || 'Failed to sync accounts');
      }
    } finally {
      setSyncing(false);
    }
  }, []);

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

  useEffect(() => {
    const init = async () => {
      await fetchAccounts();
      setTimeout(() => { syncAllQuality(false); }, 1500);
    };
    init();
  }, [fetchAccounts, syncAllQuality]);

  useEffect(() => {
    const interval = setInterval(() => { syncAllQuality(false); }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [syncAllQuality]);

  const { connect, loading: connectLoading, progress, sdkReady, sdkLoading } = useMetaConnect({
    organizationId: getOrgId(),
    onSuccess: () => {
      fetchAccounts().then(() => syncAllQuality(false));
    },
  });

  const handleConnect = () => {
    // Note: connectedAccounts is computed below, we can filter accounts directly here:
    if (accounts.some(a => a.status === 'CONNECTED')) {
      toast.error('Please disconnect the current account before connecting a new one.');
      return;
    }
    connect();
  };

  const handleDisconnect = async (accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this account?')) return;
    try {
      await api.post(`/meta/accounts/${accountId}/disconnect`);
      toast.success('Account disconnected');
      fetchAccounts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to disconnect');
    }
  };

  const handleSetDefault = async (accountId: string) => {
    try {
      await api.post(`/meta/accounts/${accountId}/set-default`);
      toast.success('Default account updated');
      fetchAccounts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to set default');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <p className="text-sm text-slate-500">Loading accounts...</p>
      </div>
    );
  }

  const connectedAccounts = accounts.filter((a) => a.status === 'CONNECTED');
  const hasConnectedAccount = connectedAccounts.length > 0;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            WhatsApp Connection
          </h2>
          <p className="text-slate-500 mt-1">
            Connect and manage your WhatsApp Business accounts
          </p>
        </div>

        {hasConnectedAccount && (
          <div className="flex items-center gap-3">
            {lastSyncTime && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                <span>Updated {formatLastSynced(lastSyncTime.toISOString())}</span>
              </div>
            )}
            <button
              onClick={() => syncAllQuality(true)}
              disabled={syncing}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium
                text-slate-700 bg-white border border-slate-200 rounded-lg
                hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Refresh'}
            </button>
          </div>
        )}
      </div>

      {/* ── Main Card ── */}
      <div
        className={`p-6 rounded-2xl border-2 transition-all ${
          hasConnectedAccount
            ? 'border-green-300 bg-green-50/50'
            : 'border-slate-200 bg-slate-50/50'
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Cloud className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">
                Meta WhatsApp Cloud API
              </h3>
              <p className="text-sm text-slate-500">
                Official WhatsApp Business API powered by Meta
              </p>
            </div>
          </div>
          {hasConnectedAccount && (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Connected
            </span>
          )}
        </div>

        {/* ── Connected Accounts ── */}
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
                  className="bg-white rounded-xl border border-green-200 overflow-hidden shadow-sm"
                >
                  {/* Account Header */}
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-slate-900">
                              {account.phoneNumber}
                            </span>
                            {account.isDefault && (
                              <>
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                                  Default
                                </span>
                              </>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {account.verifiedName || account.displayName || 'Unnamed'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => syncSingleAccount(account.id)}
                        disabled={isSyncingThis || syncing}
                        title="Refresh this account"
                        className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${isSyncingThis ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50">
                    {/* Quality */}
                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Quality
                      </div>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${quality.bg} ${quality.color}`}>
                        <span className={`w-2 h-2 rounded-full ${quality.dot}`} />
                        {quality.label}
                      </div>
                    </div>

                    {/* Tier Limit */}
                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        Tier Limit
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {getMessagingTierLabel(account.messagingLimit)}
                      </p>
                    </div>

                    {/* Verification */}
                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        Verification
                      </div>
                      <p className={`text-sm font-bold ${
                        account.codeVerificationStatus === 'VERIFIED'
                          ? 'text-green-600'
                          : 'text-yellow-600'
                      }`}>
                        {account.codeVerificationStatus === 'VERIFIED'
                          ? '✓ Verified'
                          : account.codeVerificationStatus || 'Pending'}
                      </p>
                    </div>

                    {/* Daily Usage */}
                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        Today's Usage
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {account.dailyMessagesUsed}
                        <span className="text-slate-400 text-xs"> / {account.dailyMessageLimit}</span>
                      </p>
                      <div className="mt-1.5 w-full bg-slate-200 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-all ${
                            usagePercent > 80 ? 'bg-red-500'
                            : usagePercent > 50 ? 'bg-yellow-500'
                            : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 flex items-center justify-end gap-2 border-t border-slate-100 bg-white">
                    {!account.isDefault && connectedAccounts.length > 1 && (
                      <button
                        onClick={() => handleSetDefault(account.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600
                          bg-blue-50 rounded-lg hover:bg-blue-100
                          text-sm font-medium transition-colors"
                      >
                        <Star className="w-3.5 h-3.5" />
                        Set as Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDisconnect(account.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-red-600
                        bg-red-50 rounded-lg hover:bg-red-100
                        text-sm font-medium transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Disconnect
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700">
                WhatsApp account is connected. Disconnect current account to connect a different one.
              </p>
            </div>
          </div>
        ) : (
          /* ── Empty State ── */
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              {hasAccess('whatsappMetaConnect') ? (
                <AlertCircle className="w-8 h-8 text-slate-400" />
              ) : (
                <Shield className="w-8 h-8 text-slate-400" />
              )}
            </div>
            
            <h4 className="font-semibold text-slate-900 mb-1">
              {hasAccess('whatsappMetaConnect') 
                ? 'No WhatsApp Account Connected' 
                : 'Premium Feature Locked'}
            </h4>
            
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              {hasAccess('whatsappMetaConnect') 
                ? "Connect your WhatsApp Business account through Meta's official Cloud API for high-volume messaging with advanced features."
                : "Meta Cloud API connection is available for 6-Month and Annual plans. Upgrade your plan to connect your WhatsApp Business account."}
            </p>
            
            {hasAccess('whatsappMetaConnect') ? (
              <button
                onClick={handleConnect}
                disabled={connectLoading || sdkLoading || !sdkReady}
                className="inline-flex items-center justify-center gap-2 px-6 py-3
                  bg-green-600 text-white rounded-xl hover:bg-green-700
                  font-semibold transition-colors disabled:opacity-50"
              >
                {connectLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {progress || 'Connecting...'}
                  </>
                ) : sdkLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Connect with Meta
                  </>
                )}
              </button>
            ) : (
              <a
                href="/dashboard/billing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3
                  bg-blue-600 text-white rounded-xl hover:bg-blue-700
                  font-semibold transition-colors"
              >
                <Star className="w-5 h-5" />
                Upgrade Plan
              </a>
            )}
          </div>
        )}
      </div>

      {/* ── Info Card ── */}
      {hasConnectedAccount && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900">
                About Quality Rating
              </p>
              <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                <strong>High (Green):</strong> Excellent quality, no restrictions.{' '}
                <strong>Medium (Yellow):</strong> Some user complaints, monitor activity.{' '}
                <strong>Low (Red):</strong> Many complaints, may face restrictions.
                Quality is calculated by Meta based on user feedback.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}