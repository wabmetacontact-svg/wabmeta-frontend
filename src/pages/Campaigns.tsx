// src/pages/Campaigns.tsx - FIXED
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, BarChart3, Calendar, Send, Clock,
  CheckCircle, XCircle, Pause, Play, Eye, Loader2,
  AlertCircle, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { campaigns as campaignsApi } from '../services/api';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import PageSkeleton from '../components/common/PageSkeleton';
import WalletCostModal from '../components/campaigns/WalletCostModal';

// ─── Helpers ─────────────────────────────────────────────────
const safeNum = (v: any): number => {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};
const safeStr = (v: any): string => safeNum(v).toLocaleString();

// ─── Types ───────────────────────────────────────────────────
type CampaignStatus =
  | 'DRAFT' | 'SCHEDULED' | 'RUNNING'
  | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  totalContacts?: number;
  sentCount?: number;
  deliveredCount?: number;
  readCount?: number;
  failedCount?: number;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  template?: { name: string };
}

interface CampaignStats {
  total: number;
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalRecipients: number;
}

// ─── Status Badge ─────────────────────────────────────────────
// ✅ FIX Bug6: Added CANCELLED status
const STATUS_CONFIG: Record<CampaignStatus, {
  color: string; icon: React.ElementType; label: string;
}> = {
  DRAFT: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock, label: 'Draft' },
  SCHEDULED: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Calendar, label: 'Scheduled' },
  RUNNING: { color: 'bg-green-50 text-green-700 border-green-200', icon: Play, label: 'Running' },
  PAUSED: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Pause, label: 'Paused' },
  COMPLETED: { color: 'bg-purple-50 text-purple-700 border-purple-200', icon: CheckCircle, label: 'Completed' },
  FAILED: { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle, label: 'Failed' },
  CANCELLED: { color: 'bg-gray-50 text-gray-600 border-gray-200', icon: XCircle, label: 'Cancelled' },
};

const StatusBadge: React.FC<{ status: CampaignStatus }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5
                      rounded-full text-xs font-medium border ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
};

// ─── Progress ─────────────────────────────────────────────────
const getProgress = (c: Campaign): number => {
  const total = safeNum(c.totalContacts);
  const sent = safeNum(c.sentCount);
  if (total === 0) return 0;
  return Math.min(100, Math.round((sent / total) * 100));
};

// ─── Wallet error parser ──────────────────────────────────────
const parseWalletErr = (msg: string) => {
  if (msg.startsWith('WALLET_LOW_BALANCE::')) {
    const p = msg.split('::');
    return {
      isWallet: true, type: 'low' as const,
      required: parseFloat(p[1]), balance: parseFloat(p[2])
    };
  }
  if (msg.startsWith('WALLET_INSUFFICIENT::')) {
    const p = msg.split('::');
    return {
      isWallet: true, type: 'insufficient' as const,
      required: parseFloat(p[1]), balance: parseFloat(p[2])
    };
  }
  return { isWallet: false };
};

// ─── Component ────────────────────────────────────────────────
const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<CampaignStats>({
    total: 0, totalSent: 0, totalDelivered: 0,
    totalRead: 0, totalRecipients: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Wallet
  const [walletBlockData, setWalletBlockData] = useState<{
    balance: number; required?: number; type?: 'low' | 'insufficient';
  } | null>(null);
  const [costModalOpen, setCostModalOpen] = useState(false);
  const [costEstimate, setCostEstimate] = useState<any>(null);
  const [costLoading, setCostLoading] = useState(false);
  const [pendingStartId, setPendingStartId] = useState<string | null>(null);
  const [pendingCampName, setPendingCampName] = useState('');

  const { socket, isConnected } = useSocket();

  // ✅ FIX Bug5: Debounce ref for search
  const searchDebounce = useRef<ReturnType<typeof setTimeout>>();

  // ─── Fetch ─────────────────────────────────────────────────
  const fetchCampaigns = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await campaignsApi.getAll({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined,
      });
      if (res.data.success) {
        setCampaigns(
          Array.isArray(res.data.data) ? res.data.data : []
        );
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load campaigns');
      setCampaigns([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await campaignsApi.stats();
      if (res.data.success) {
        const d = res.data.data || {};
        setStats({
          total: safeNum(d.total),
          totalSent: safeNum(d.totalSent),
          totalDelivered: safeNum(d.totalDelivered),
          totalRead: safeNum(d.totalRead),
          totalRecipients: safeNum(d.totalRecipients),
        });
      }
    } catch { /* silent */ }
  }, []);

  // ✅ FIX Bug1: Single effect, not double fetch
  useEffect(() => {
    fetchCampaigns();
    fetchStats();
  }, [statusFilter, searchQuery]);

  // ✅ FIX Bug5: Search with debounce
  const handleSearchInput = (val: string) => {
    setSearchInput(val);
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setSearchQuery(val);
    }, 400);
  };

  const handleSearchSubmit = () => {
    clearTimeout(searchDebounce.current);
    setSearchQuery(searchInput);
  };

  // ─── Socket ────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !isConnected) return;

    const onUpdate = (data: any) => {
      setCampaigns(prev => prev.map(c =>
        c.id === data.campaignId
          ? {
            ...c,
            status: data.status ?? c.status,
            totalContacts: data.totalContacts ?? c.totalContacts,
            sentCount: data.sentCount ?? c.sentCount,
            deliveredCount: data.deliveredCount ?? c.deliveredCount,
            readCount: data.readCount ?? c.readCount,
            failedCount: data.failedCount ?? c.failedCount,
          }
          : c
      ));
    };

    const onProgress = (data: any) => {
      setCampaigns(prev => prev.map(c =>
        c.id === data.campaignId
          ? {
            ...c,
            sentCount: data.sent,
            failedCount: data.failed,
            deliveredCount: data.delivered,
            readCount: data.read,
            totalContacts: data.total ?? c.totalContacts,
            status: data.status || c.status,
          }
          : c
      ));
    };

    const onCompleted = (data: any) => {
      setCampaigns(prev => prev.map(c =>
        c.id === data.campaignId
          ? {
            ...c, status: 'COMPLETED', sentCount: data.sentCount,
            failedCount: data.failedCount, deliveredCount: data.deliveredCount
          }
          : c
      ));
      fetchStats();
    };

    const onError = (data: any) => {
      toast.error(data.message, { duration: 8000 });
      fetchCampaigns(true);
      fetchStats();
    };

    socket.on('campaign:update', onUpdate);
    socket.on('campaign:progress', onProgress);
    socket.on('campaign:completed', onCompleted);
    socket.on('campaign:error', onError);

    return () => {
      socket.off('campaign:update', onUpdate);
      socket.off('campaign:progress', onProgress);
      socket.off('campaign:completed', onCompleted);
      socket.off('campaign:error', onError);
    };
  }, [socket, isConnected, fetchCampaigns, fetchStats]);

  // ─── Start with wallet estimate ────────────────────────────
  const handleStartCampaign = async (
    campaignId: string, campaignName: string
  ) => {
    setPendingStartId(campaignId);
    setPendingCampName(campaignName);
    setCostEstimate(null);
    setCostLoading(true);
    setCostModalOpen(true);

    try {
      const res = await campaignsApi.estimateCost(campaignId);
      const estimate = res.data?.data || res.data;
      setCostEstimate(estimate);
    } catch (e: any) {
      console.warn('Cost estimate failed:', e.message);
      // Keep modal open with null estimate
    } finally {
      setCostLoading(false);
    }
  };

  const handleConfirmStart = async () => {
    if (!pendingStartId) return;
    setCostModalOpen(false);

    try {
      setActionLoading(pendingStartId);
      await campaignsApi.start(pendingStartId);
      toast.success('Campaign started!');
      await new Promise(r => setTimeout(r, 400));
      await fetchCampaigns(true);
      await fetchStats();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || '';
      const wall = parseWalletErr(msg);
      if (wall.isWallet) {
        setWalletBlockData({
          balance: wall.balance,
          required: wall.required,
          type: wall.type,
        });
      } else {
        toast.error(msg || 'Failed to start campaign');
      }
    } finally {
      setActionLoading(null);
      setPendingStartId(null);
    }
  };

  // ─── Pause / Resume / Cancel ───────────────────────────────
  const handleAction = async (
    action: 'pause' | 'resume' | 'cancel',
    campaignId: string
  ) => {
    try {
      setActionLoading(campaignId);
      setWalletBlockData(null);

      let res;
      if (action === 'pause') res = await campaignsApi.pause(campaignId);
      if (action === 'resume') res = await campaignsApi.resume(campaignId);
      if (action === 'cancel') res = await campaignsApi.cancel(campaignId);

      if (res?.data.success) {
        toast.success(`Campaign ${action}d successfully`);
        await new Promise(r => setTimeout(r, 300));
        await fetchCampaigns(true);
        await fetchStats();
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || '';
      const wall = parseWalletErr(msg);
      if (wall.isWallet) {
        setWalletBlockData({
          balance: wall.balance,
          required: wall.required,
          type: wall.type,
        });
      } else {
        toast.error(msg || `Failed to ${action} campaign`);
      }
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Delete ────────────────────────────────────────────────
  // ✅ FIX Bug3: No optimistic update - just delete then refetch
  const handleDelete = async (campaignId: string) => {
    if (!confirm('Delete this campaign? This cannot be undone.')) return;
    try {
      setActionLoading(campaignId);
      await campaignsApi.delete(campaignId);
      toast.success('Campaign deleted');
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
      fetchStats();
    } catch (e: any) {
      toast.error(
        e.response?.data?.message || 'Failed to delete campaign'
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Render ────────────────────────────────────────────────
  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600 mt-1">
            Create and manage your broadcast campaigns
          </p>
        </div>
        <Link
          to="/dashboard/campaigns/create"
          className="flex items-center gap-2 px-4 py-2 bg-green-600
                     text-white rounded-lg hover:bg-green-700 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          New Campaign
        </Link>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4
                        flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 font-medium text-sm">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button
            onClick={() => { setError(null); fetchCampaigns(); }}
            className="px-3 py-1 bg-red-600 text-white text-xs
                       rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Wallet Warning ── */}
      {walletBlockData && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4
                        flex items-start gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center
                          justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-700 text-sm">
              {walletBlockData.type === 'low'
                ? 'Wallet Balance Too Low'
                : 'Insufficient Wallet Balance'}
            </p>
            <p className="text-red-600 text-xs mt-0.5">
              Current balance: ₹{walletBlockData.balance.toFixed(2)}.
              {walletBlockData.required &&
                ` Required: ₹${walletBlockData.required.toFixed(2)}.`}
              {' '}Please add funds to proceed.
            </p>
            <Link
              to="/dashboard/wallet"
              className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5
                         bg-red-600 hover:bg-red-700 text-white text-xs
                         font-semibold rounded-lg transition-all"
            >
              Add Money to Wallet →
            </Link>
          </div>
          <button
            onClick={() => setWalletBlockData(null)}
            className="text-red-400 hover:text-red-600 p-1"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Campaigns', value: stats.total, color: '#3B82F6', icon: BarChart3 },
          { label: 'Messages Sent', value: stats.totalSent, color: '#8B5CF6', icon: Send },
          { label: 'Delivered', value: stats.totalDelivered, color: '#25D366', icon: CheckCircle },
          { label: 'Read', value: stats.totalRead, color: '#10B981', icon: Eye },
        ].map(s => (
          <div
            key={s.label}
            className="relative overflow-hidden rounded-2xl border p-6
                       transition-all duration-300 hover:-translate-y-0.5
                       hover:shadow-md"
            style={{
              backgroundColor: `${s.color}0A`,
              borderColor: `${s.color}30`,
            }}
          >
            <div className="absolute top-0 right-0 p-4 opacity-[0.08]">
              <s.icon size={80} />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-mono uppercase tracking-widest mb-1"
                style={{ color: s.color }}>
                {s.label}
              </p>
              <h3 className="text-3xl font-bold text-gray-900">
                {safeStr(s.value)}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2
                               w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchInput}
              onChange={e => handleSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border
                         border-gray-200 rounded-lg text-gray-900
                         placeholder-gray-400 focus:outline-none
                         focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200
                       rounded-lg text-gray-900 focus:outline-none
                       focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="RUNNING">Running</option>
            <option value="PAUSED">Paused</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button
            onClick={() => fetchCampaigns()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200
                       rounded-lg text-gray-700 flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Campaign List ── */}
      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center
                          border border-gray-200 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex
                            items-center justify-center mx-auto mb-6">
              <Send className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No campaigns yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-xs mx-auto">
              Create your first campaign to start sending bulk messages.
            </p>
            <Link
              to="/dashboard/campaigns/create"
              className="inline-flex items-center gap-2 px-6 py-3
                         bg-green-600 hover:bg-green-700 text-white
                         font-bold rounded-xl transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create First Campaign
            </Link>
          </div>
        ) : (
          campaigns.map(campaign => (
            <div
              key={campaign.id}
              className="relative overflow-hidden rounded-2xl bg-white
                         border border-gray-200 p-6 hover:border-green-300
                         hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900
                                   truncate max-w-[200px] sm:max-w-none">
                      {campaign.name}
                    </h3>
                    <StatusBadge status={campaign.status} />
                  </div>
                  {campaign.description && (
                    <p className="text-gray-600 text-sm line-clamp-1">
                      {campaign.description}
                    </p>
                  )}
                  {campaign.template?.name && (
                    <p className="text-xs text-gray-500 mt-1 font-medium">
                      Template: {campaign.template.name}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 ml-4">
                  <Link
                    to={`/dashboard/campaigns/${campaign.id}`}
                    className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  </Link>

                  {/* ✅ FIX Bug2: DRAFT + SCHEDULED both show start */}
                  {(campaign.status === 'DRAFT' ||
                    campaign.status === 'SCHEDULED') && (
                      <button
                        onClick={() =>
                          handleStartCampaign(campaign.id, campaign.name)
                        }
                        disabled={actionLoading === campaign.id}
                        className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                        title="Start Campaign"
                      >
                        {actionLoading === campaign.id
                          ? <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                          : <Play className="w-5 h-5 text-green-600" />}
                      </button>
                    )}

                  {campaign.status === 'RUNNING' && (
                    <button
                      onClick={() => handleAction('pause', campaign.id)}
                      disabled={actionLoading === campaign.id}
                      className="p-2 hover:bg-yellow-50 rounded-lg"
                      title="Pause"
                    >
                      {actionLoading === campaign.id
                        ? <Loader2 className="w-5 h-5 animate-spin text-yellow-600" />
                        : <Pause className="w-5 h-5 text-yellow-600" />}
                    </button>
                  )}

                  {campaign.status === 'PAUSED' && (
                    <button
                      onClick={() => handleAction('resume', campaign.id)}
                      disabled={actionLoading === campaign.id}
                      className="p-2 hover:bg-green-50 rounded-lg"
                      title="Resume"
                    >
                      {actionLoading === campaign.id
                        ? <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                        : <Play className="w-5 h-5 text-green-600" />}
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(campaign.id)}
                    disabled={
                      actionLoading === campaign.id ||
                      campaign.status === 'RUNNING'
                    }
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors
                               opacity-0 group-hover:opacity-100
                               disabled:opacity-0 disabled:cursor-not-allowed"
                    title={
                      campaign.status === 'RUNNING'
                        ? 'Pause campaign before deleting'
                        : 'Delete'
                    }
                  >
                    <XCircle className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                {[
                  { label: 'Recipients', value: campaign.totalContacts, color: 'text-gray-900' },
                  { label: 'Sent', value: campaign.sentCount, color: 'text-green-700' },
                  { label: 'Delivered', value: campaign.deliveredCount, color: 'text-blue-700' },
                  { label: 'Failed', value: campaign.failedCount, color: 'text-red-600' },
                ].map(s => (
                  <div key={s.label}
                    className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-[10px] uppercase tracking-wider
                                  font-bold text-gray-500 mb-1">
                      {s.label}
                    </p>
                    <p className={`text-lg font-bold ${s.color}`}>
                      {safeStr(s.value)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Progress */}
              {(['RUNNING', 'PAUSED', 'COMPLETED'].includes(campaign.status) ||
                safeNum(campaign.sentCount) > 0) && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between
                                  text-xs text-gray-600 mb-1.5">
                      <span className="font-medium">Progress</span>
                      <span className="font-bold">
                        {getProgress(campaign)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-700 ${campaign.status === 'COMPLETED'
                            ? 'bg-purple-600'
                            : campaign.status === 'PAUSED'
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                        style={{ width: `${getProgress(campaign)}%` }}
                      />
                    </div>
                  </div>
                )}

              {/* Meta info */}
              <div className="flex items-center gap-4 mt-2 text-[11px]
                              text-gray-500 border-t border-gray-100 pt-3
                              flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Created{' '}
                  {formatDistanceToNow(new Date(campaign.createdAt), {
                    addSuffix: true,
                  })}
                </span>
                {campaign.scheduledAt && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Scheduled:{' '}
                    {new Date(campaign.scheduledAt).toLocaleString()}
                  </span>
                )}
                {campaign.startedAt && (
                  <span className="flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5" />
                    Started{' '}
                    {formatDistanceToNow(new Date(campaign.startedAt), {
                      addSuffix: true,
                    })}
                  </span>
                )}
                {campaign.completedAt && (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-500" />
                    Completed{' '}
                    {formatDistanceToNow(new Date(campaign.completedAt), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Wallet Cost Modal ── */}
      <WalletCostModal
        isOpen={costModalOpen}
        onClose={() => { setCostModalOpen(false); setPendingStartId(null); }}
        onConfirm={handleConfirmStart}
        estimate={costEstimate}
        loading={costLoading}
        campaignName={pendingCampName}
      />
    </div>
  );
};

export default Campaigns;