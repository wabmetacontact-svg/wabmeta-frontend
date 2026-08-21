// src/pages/Campaigns.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, BarChart3, Calendar, Send, Clock,
  CheckCircle, XCircle, Pause, Play, Eye, Loader2,
  AlertCircle, AlertTriangle, RefreshCw, TrendingUp,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { campaigns as campaignsApi } from '../services/api';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import WalletCostModal from '../components/campaigns/WalletCostModal';
import { type Campaign, type CampaignStatus, type CampaignStats } from '../types/campaign';

import { useConfirm } from '../context/ConfirmContext';
const safeNum = (v: any): number => {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};
const safeStr = (v: any): string => safeNum(v).toLocaleString();

const STATUS_CONFIG: Record<CampaignStatus, {
  color: string; icon: React.ElementType; label: string;
}> = {
  DRAFT: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock, label: 'Draft' },
  SCHEDULED: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Calendar, label: 'Scheduled' },
  RUNNING: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Play, label: 'Running' },
  PAUSED: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Pause, label: 'Paused' },
  COMPLETED: { color: 'bg-purple-50 text-purple-700 border-purple-200', icon: CheckCircle, label: 'Completed' },
  FAILED: { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle, label: 'Failed' },
  CANCELLED: { color: 'bg-gray-50 text-gray-600 border-gray-200', icon: XCircle, label: 'Cancelled' },
};

const StatusBadge: React.FC<{ status: CampaignStatus }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
};

const getProgress = (c: Campaign): number => {
  if (c.status === 'COMPLETED') return 100;

  const total = safeNum(c.totalContacts);
  const processed = safeNum(c.sentCount) +
    safeNum(c.deliveredCount) +
    safeNum(c.readCount) +
    safeNum(c.failedCount);

  if (total === 0) return 0;
  return Math.min(100, Math.round((processed / total) * 100));
};

type WalletErrResult =
  | { isWallet: true; type: 'low' | 'insufficient'; required: number; balance: number }
  | { isWallet: false };

const parseWalletErr = (msg: string): WalletErrResult => {
  if (msg.startsWith('WALLET_LOW_BALANCE::')) {
    const p = msg.split('::');
    return {
      isWallet: true,
      type: 'low',
      required: parseFloat(p[1]) || 0,
      balance: parseFloat(p[2]) || 0,
    };
  }
  if (msg.startsWith('WALLET_INSUFFICIENT::')) {
    const p = msg.split('::');
    return {
      isWallet: true,
      type: 'insufficient',
      required: parseFloat(p[1]) || 0,
      balance: parseFloat(p[2]) || 0,
    };
  }
  return { isWallet: false };
};

const Campaigns: React.FC = () => {
  const confirm = useConfirm();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<CampaignStats>({
    total: 0, totalSent: 0, totalDelivered: 0,
    totalRead: 0, replied: 0, totalRecipients: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [walletBlockData, setWalletBlockData] = useState<{
    balance: number; required?: number; type?: 'low' | 'insufficient';
  } | null>(null);
  const [costModalOpen, setCostModalOpen] = useState(false);
  const [costEstimate, setCostEstimate] = useState<any>(null);
  const [costLoading, setCostLoading] = useState(false);
  const [pendingStartId, setPendingStartId] = useState<string | null>(null);
  const [pendingCampName, setPendingCampName] = useState('');

  const { socket, isConnected } = useSocket();
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const fetchCampaigns = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await campaignsApi.getAll({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined,
      });
      if (res.data.success && isMountedRef.current) {
        setCampaigns(Array.isArray(res.data.data) ? res.data.data : []);
      }
    } catch (e: any) {
      if (isMountedRef.current) {
        setError(e.message || 'Failed to load campaigns');
        setCampaigns([]);
      }
    } finally {
      if (!silent && isMountedRef.current) setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await campaignsApi.stats();
      if (res.data.success && isMountedRef.current) {
        const d = res.data.data || {};
        setStats({
          total: safeNum(d.total),
          totalSent: safeNum(d.totalSent),
          totalDelivered: safeNum(d.totalDelivered),
          totalRead: safeNum(d.totalRead),
          replied: safeNum(d.replied),
          totalRecipients: safeNum(d.totalRecipients),
        });
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSearchInput = (val: string) => {
    setSearchInput(val);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setSearchQuery(val);
    }, 400);
  };

  const handleSearchSubmit = () => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    setSearchQuery(searchInput);
  };

  // ✅ FIXED: Isolated Socket Room Subscriptions — Zero drops, static event handles bypass dynamic filter dependencies!
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
  }, [socket, isConnected, fetchStats, fetchCampaigns]); // Static fetch dependencies mapped via refs or static callbacks

  const handleStartCampaign = async (campaignId: string, campaignName: string) => {
    setPendingStartId(campaignId);
    setPendingCampName(campaignName);
    setCostEstimate(null);
    setCostLoading(true);
    setCostModalOpen(true);

    try {
      const res = await campaignsApi.estimateCost(campaignId);
      const estimate = res.data?.data || res.data;
      if (isMountedRef.current) setCostEstimate(estimate);
    } catch (e: any) {
      console.warn('Cost estimate failed:', e.message);
    } finally {
      if (isMountedRef.current) setCostLoading(false);
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
      if (isMountedRef.current) {
        setActionLoading(null);
        setPendingStartId(null);
      }
    }
  };

  const handleAction = async (action: 'pause' | 'resume' | 'cancel', campaignId: string) => {
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
      if (isMountedRef.current) setActionLoading(null);
    }
  };

  const handleDelete = async (campaignId: string, campaignName: string) => {
    if (!(await confirm({
      title: `Delete "${campaignName}"?`,
      message: 'The campaign and all of its metrics data will be permanently deleted.',
      confirmLabel: 'Delete',
      tone: 'danger',
    }))) return;

    try {
      setActionLoading(campaignId);
      await campaignsApi.delete(campaignId);
      toast.success('Campaign deleted');
      if (isMountedRef.current) {
        setCampaigns(prev => prev.filter(c => c.id !== campaignId));
        fetchStats();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to delete campaign');
    } finally {
      if (isMountedRef.current) setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Campaigns</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage your broadcast campaigns</p>
        </div>
        <Link
          to="/dashboard/campaigns/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-5 h-5" />
          New Campaign
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 font-medium text-sm">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button
            onClick={() => { setError(null); fetchCampaigns(); }}
            className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {walletBlockData && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm animate-in slide-in-from-top-4 duration-250">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-red-700 text-sm">
              {walletBlockData.type === 'low' ? 'Wallet Balance Too Low' : 'Insufficient Wallet Balance'}
            </p>
            <p className="text-red-600 text-xs mt-0.5 font-semibold">
              Current balance: ₹{walletBlockData.balance.toFixed(2)}.
              {walletBlockData.required && ` Required: ₹${walletBlockData.required.toFixed(2)}.`}
              {' '}Please top up your workspace balance to trigger processing.
            </p>
            <Link
              to="/dashboard/wallet"
              className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all"
            >
              Add Money to Wallet →
            </Link>
          </div>
          <button onClick={() => setWalletBlockData(null)} className="text-red-400 hover:text-red-600 p-1">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Stats indicators grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Campaigns', value: stats.total, color: '#3B82F6', icon: BarChart3 },
          { label: 'Messages Sent', value: stats.totalSent, color: '#8B5CF6', icon: Send },
          { label: 'Delivered', value: stats.totalDelivered, color: '#10B981', icon: CheckCircle },
          { label: 'Read', value: stats.totalRead, color: '#0e885b', icon: Eye },
        ].map(s => (
          <div
            key={s.label}
            className="relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            style={{
              backgroundColor: `${s.color}0A`,
              borderColor: `${s.color}30`,
            }}
          >
            <div className="absolute top-0 right-0 p-4 opacity-[0.08] text-gray-900"><s.icon size={80} /></div>
            <div className="relative z-10">
              <p className="text-xs font-semibold font-mono uppercase tracking-wider mb-1" style={{ color: s.color }}>{s.label}</p>
              <h3 className="text-3xl font-bold text-gray-900">
                {loading ? <Loader2 className="w-6 h-6 animate-spin text-gray-400 my-1" /> : safeStr(s.value)}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and search box panel */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchInput}
            onChange={e => handleSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-semibold"
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
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 flex items-center justify-center gap-2 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Campaign card components container */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm min-h-[300px] flex flex-col items-center justify-center py-16 animate-pulse">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
            <p className="text-sm font-semibold text-gray-400">Loading campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-gray-200 shadow-sm">
            <div className="w-20 h-20 bg-emerald-50/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100"><Send className="w-10 h-10 text-emerald-600" /></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto text-sm font-medium">Create your first campaign to start sending bulk messages instantly.</p>
            <Link
              to="/dashboard/campaigns/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Create First Campaign
            </Link>
          </div>
        ) : (
          campaigns.map(campaign => {
            const total = safeNum(campaign.totalContacts);
            const sent = safeNum(campaign.sentCount);
            const delivered = safeNum(campaign.deliveredCount);
            const read = safeNum(campaign.readCount);
            const failed = safeNum(campaign.failedCount);
            const successRate = total > 0 ? Math.min(100, Math.round(((total - failed) / total) * 100)) : 0;
            const isCompleted = campaign.status === 'COMPLETED';

            return (
              <div
                key={campaign.id}
                className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 hover:border-emerald-300 hover:shadow-md transition-all duration-300 group shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-base font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-none">{campaign.name}</h3>
                      <StatusBadge status={campaign.status} />
                      {isCompleted && total > 0 && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${successRate >= 90
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : successRate >= 80
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          }`}>
                          <TrendingUp className="w-3.5 h-3.5" /> {successRate}%
                        </span>
                      )}
                    </div>
                    {campaign.description && <p className="text-gray-500 text-sm line-clamp-1 font-normal">{campaign.description}</p>}
                    {campaign.templateName && <p className="text-xs text-gray-400 mt-1 font-medium">Template: {campaign.templateName}</p>}
                  </div>

                  {/* Actions column */}
                  <div className="flex items-center gap-1.5 ml-4">
                    <Link to={`/dashboard/campaigns/${campaign.id}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View Details">
                      <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    </Link>

                    {(campaign.status === 'DRAFT' || campaign.status === 'SCHEDULED') && (
                      <button
                        onClick={() => handleStartCampaign(campaign.id, campaign.name)}
                        disabled={actionLoading === campaign.id}
                        className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Start Campaign"
                      >
                        {actionLoading === campaign.id
                          ? <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                          : <Play className="w-5 h-5 text-emerald-600" />}
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
                        className="p-2 hover:bg-emerald-50 rounded-lg"
                        title="Resume"
                      >
                        {actionLoading === campaign.id
                          ? <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                          : <Play className="w-5 h-5 text-emerald-600" />}
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(campaign.id, campaign.name)}
                      disabled={actionLoading === campaign.id || campaign.status === 'RUNNING'}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed"
                      title={campaign.status === 'RUNNING' ? 'Pause campaign before deleting' : 'Delete'}
                    >
                      <XCircle className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Internal metrics rows */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 select-none">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1">Recipients</p>
                    <p className="text-lg font-bold text-gray-900">{safeStr(total)}</p>
                  </div>
                  <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-blue-500 mb-1">Sent</p>
                    <p className="text-lg font-bold text-blue-700">{safeStr(sent)}</p>
                  </div>
                  <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600 mb-1">Delivered</p>
                    <p className="text-lg font-bold text-emerald-700">{safeStr(delivered + read)}</p>
                  </div>
                  <div className="bg-red-50/50 p-3 rounded-xl border border-red-100">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-red-500 mb-1">Failed</p>
                    <p className="text-lg font-bold text-red-700">{safeStr(failed)}</p>
                  </div>
                </div>

                {/* Progress bar line */}
                {(['RUNNING', 'PAUSED', 'COMPLETED'].includes(campaign.status) || sent > 0) && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5 font-bold">
                      <span>Progress</span>
                      <span>{getProgress(campaign)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                      <div
                        className={`h-2 rounded-full transition-all duration-700 ${campaign.status === 'COMPLETED' ? 'bg-purple-600' : campaign.status === 'PAUSED' ? 'bg-yellow-500' : 'bg-emerald-500'
                          }`}
                        style={{ width: `${getProgress(campaign)}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-400 border-t border-gray-100 pt-3 flex-wrap font-medium uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Created {formatDistanceToNow(new Date(campaign.createdAt), { addSuffix: true })}</span>
                  {campaign.scheduledAt && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Scheduled: {new Date(campaign.scheduledAt).toLocaleString()}</span>}
                  {campaign.startedAt && <span className="flex items-center gap-1.5"><Play className="w-3.5 h-3.5 text-emerald-600" />Started {formatDistanceToNow(new Date(campaign.startedAt), { addSuffix: true })}</span>}
                  {campaign.completedAt && <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-purple-500" />Completed {formatDistanceToNow(new Date(campaign.completedAt), { addSuffix: true })}</span>}
                </div>
              </div>
            );
          })
        )}
      </div>

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