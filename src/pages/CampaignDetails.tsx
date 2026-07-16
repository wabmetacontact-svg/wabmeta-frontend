// src/pages/CampaignDetails.tsx - FIXED
import React, {
  useState, useEffect, useCallback,
  useMemo, useRef,
} from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, RefreshCw, RotateCcw, CheckCircle,
  XCircle, Clock, Send, Eye, AlertTriangle,
  Users, Search, Wifi, WifiOff, Download,
} from 'lucide-react';
import { campaigns as campaignsApi } from '../services/api';
import useCampaignRealtime from '../hooks/useCampaignRealtime';
import toast from 'react-hot-toast';
import PageSkeleton from '../components/common/PageSkeleton';

// ─── Types ───────────────────────────────────────────────────
interface CampaignContact {
  id: string;
  contactId: string;
  phone: string;
  name: string;
  fullName?: string;
  status: string;
  waMessageId?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  failedAt?: string;
  failureReason?: string;
  retryCount: number;
  updatedAt: string;
}

interface Stats {
  totalContacts: number;
  pending: number;
  queued: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  failureReasons: { reason: string; count: number }[];
  successRate: number;
  deliveryRate: number;
  readRate: number;
}

interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── Helpers ─────────────────────────────────────────────────
const cleanPhone = (p: string) => (p || '').replace(/^\+/, '');

const getDisplayName = (c: CampaignContact): string => {
  const n = c.name || c.fullName || '';
  if (n && n !== 'Unknown' && n.trim()) return n;
  return cleanPhone(c.phone);
};

const isMediaError = (r: string) =>
  r.toLowerCase().includes('expired media') ||
  r.toLowerCase().includes('re-upload');

// ─── Status config ────────────────────────────────────────────
const STATUS_CFG: Record<string, {
  label: string; color: string; icon: React.ElementType;
}> = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  QUEUED: { label: 'Queued', color: 'bg-orange-100 text-orange-700', icon: Clock },
  SENT: { label: 'Sent', color: 'bg-blue-100 text-blue-700', icon: Send },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  READ: { label: 'Read', color: 'bg-purple-100 text-purple-700', icon: Eye },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: XCircle },
};

// ─── StatCard ─────────────────────────────────────────────────
const StatCard: React.FC<{
  label: string; value: number; icon: React.ElementType;
  iconColor: string; onClick?: () => void;
  active?: boolean; pulse?: boolean;
}> = ({ label, value, icon: Icon, iconColor, onClick, active, pulse }) => (
  <div
    onClick={onClick}
    className={`relative overflow-hidden rounded-2xl bg-white border
                p-6 transition-all duration-300 shadow-sm
                ${active
        ? 'border-emerald-500 shadow-emerald-500/10 shadow-md'
        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
      <Icon size={80} className={iconColor} />
    </div>
    <div className="relative z-10">
      <p className={`text-xs font-mono uppercase tracking-widest mb-1 ${iconColor}`}>
        {label}
      </p>
      <p className={`text-3xl font-bold text-gray-900
                     ${pulse ? 'animate-pulse' : ''}`}>
        {value.toLocaleString()}
      </p>
    </div>
  </div>
);

// ─── Component ────────────────────────────────────────────────
const CampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [campaign, setCampaign] = useState<any>(null);
  const [contacts, setContacts] = useState<CampaignContact[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pageMeta, setPageMeta] = useState<PageMeta>({
    page: 1, limit: 50, total: 0, totalPages: 1,
  });

  const [filterStatus, setFilterStatus] = useState('all');
  // ✅ FIX Bug2: Separate input and committed search
  const [searchInput, setSearchInput] = useState('');
  const [searchCommitted, setSearchCommitted] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const lastStatsRef = useRef<number>(0);
  const isInitialized = useRef(false);

  const {
    progress,
    isProcessing,
    completedStats,
    contactStatusMap,
    isConnected,
    campaignError,
    resetStats,
  } = useCampaignRealtime(id || null);

  // ─── Live stats merge ──────────────────────────────────────
  const liveStats = useMemo((): Stats | null => {
    if (!stats) return null;
    if (!progress || !isProcessing) return stats;

    const total = Math.max(progress.total, stats.totalContacts, 1);
    const sent = Math.min(progress.sent, total);
    const failed = Math.min(progress.failed, Math.max(0, total - sent));
    // ✅ FIX Bug5: delivered should not exceed sent
    const delivered = Math.min(progress.delivered, sent);
    const read = Math.min(progress.read, delivered);
    const pending = Math.max(0, total - sent - failed);

    return {
      ...stats,
      totalContacts: total,
      sent, failed, delivered, read, pending, queued: 0,
    };
  }, [stats, progress, isProcessing]);

  // ─── Live contacts merge ───────────────────────────────────
  const liveContacts = useMemo(() => {
    if (contactStatusMap.size === 0) return contacts;
    return contacts.map(c => {
      const upd = contactStatusMap.get(c.contactId);
      if (!upd) return c;
      return {
        ...c,
        status: upd.status,
        sentAt: upd.sentAt || c.sentAt,
        deliveredAt: upd.deliveredAt || c.deliveredAt,
        readAt: upd.readAt || c.readAt,
        failedAt: upd.failedAt || c.failedAt,
        failureReason: upd.error || c.failureReason,
        waMessageId: upd.messageId || c.waMessageId,
      };
    });
  }, [contacts, contactStatusMap]);

  // ─── Load functions ────────────────────────────────────────
  const loadCampaign = useCallback(async () => {
    try {
      const res = await campaignsApi.getById(id!);
      if (res.data.success) setCampaign(res.data.data);
    } catch { /* silent */ }
  }, [id]);

  const loadStats = useCallback(async () => {
    try {
      const res = await campaignsApi.getDetailedStats(id!);
      if (res.data.success) {
        setStats(res.data.data);
        lastStatsRef.current = Date.now();
      }
    } catch { /* silent */ }
  }, [id]);

  // ✅ FIX Bug1: Removed meta.limit from deps (use ref instead)
  const limitRef = useRef(50);
  const loadContacts = useCallback(async (
    page = 1,
    silent = false,
    overrideStatus?: string,
    overrideSearch?: string,
  ) => {
    try {
      const status = overrideStatus ?? filterStatus;
      const search = overrideSearch ?? searchCommitted;

      const res = await campaignsApi.getContacts(id!, {
        page,
        limit: limitRef.current,
        status: status !== 'all' ? status : undefined,
        search: search || undefined,
      });

      if (res.data.success) {
        const data = res.data.data;
        const list = Array.isArray(data)
          ? data
          : data.contacts || data.recipients || [];
        setContacts(list);

        const rm = res.data.meta || data.meta;
        if (rm) {
          setPageMeta(prev => ({
            ...prev,
            page: rm.page || page,
            total: rm.total || 0,
            totalPages: rm.totalPages || 1,
          }));
        }
      }
    } catch {
      if (!silent) console.error('Failed to load contacts');
    }
  }, [id, filterStatus, searchCommitted]); // ✅ filterStatus/search as deps

  // ─── Initial load ──────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      resetStats();
      await Promise.all([loadCampaign(), loadStats()]);
      await loadContacts(1);
      setLoading(false);
      isInitialized.current = true;
    };
    init();
  }, [id]); // Only id - not loadCampaign/loadStats

  // ✅ FIX Bug6: Filter/search change - skip initial render
  useEffect(() => {
    if (!isInitialized.current) return;
    loadContacts(1);
  }, [filterStatus, searchCommitted]);

  // ─── Smart stats refresh (during RUNNING) ─────────────────
  useEffect(() => {
    if (!isProcessing) return;
    const interval = setInterval(() => {
      if (Date.now() - lastStatsRef.current > 15_000) {
        loadStats();
      }
    }, 5_000);
    return () => clearInterval(interval);
  }, [isProcessing, loadStats]);

  // ─── Campaign completed ────────────────────────────────────
  useEffect(() => {
    if (!completedStats) return;
    toast.success(
      `Campaign completed! ${completedStats.sentCount} sent, ` +
      `${completedStats.failedCount} failed`,
      { duration: 5000 }
    );
    const t = setTimeout(async () => {
      await loadCampaign();
      await loadStats();
      await loadContacts(pageMeta.page, true);
    }, 2_000);
    return () => clearTimeout(t);
  }, [completedStats]);

  // ─── Polling fallback (no socket) ─────────────────────────
  useEffect(() => {
    if (campaign?.status !== 'RUNNING' || isConnected) return;
    const interval = setInterval(async () => {
      await loadStats();
      await loadContacts(pageMeta.page, true);
    }, 8_000);
    return () => clearInterval(interval);
  }, [campaign?.status, isConnected]);

  // ─── Sync campaign status from socket ─────────────────────
  useEffect(() => {
    if (isProcessing && campaign?.status !== 'RUNNING') {
      setCampaign((p: any) => p ? { ...p, status: 'RUNNING' } : p);
    }
    if (completedStats && campaign?.status === 'RUNNING') {
      setCampaign((p: any) => p ? { ...p, status: 'COMPLETED' } : p);
    }
  }, [isProcessing, completedStats]);

  // ✅ FIX Bug7: campaignError - use stable references
  useEffect(() => {
    if (!campaignError) return;
    toast.error(campaignError.message, { duration: 8000, icon: '⚠️' });
    loadCampaign();
    loadStats();
  }, [campaignError]);

  // ─── Actions ───────────────────────────────────────────────
  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadCampaign(),
      loadStats(),
      loadContacts(pageMeta.page),
    ]);
    setRefreshing(false);
  };

  // ✅ FIX Bug2: Commit search explicitly
  const handleSearch = () => {
    setSearchCommitted(searchInput);
  };

  const handleRetry = async () => {
    try {
      const ids = selectedContacts.length > 0 ? selectedContacts : undefined;
      await campaignsApi.retryFailed(id!, { contactIds: ids, retryFailed: true });
      toast.success('Retrying failed messages...');
      setSelectedContacts([]);
      setTimeout(refresh, 1_000);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to retry');
    }
  };

  const handleExport = async () => {
    try {
      const res = await campaignsApi.exportRecipients(
        id!,
        filterStatus !== 'all' ? filterStatus : undefined
      );
      const url = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `campaign-${id}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Export downloaded!');
    } catch {
      toast.error('Export failed');
    }
  };

  // ✅ FIX Bug3: Proper page navigation with state update
  const goToPage = (page: number) => {
    if (page < 1 || page > pageMeta.totalPages) return;
    setPageMeta(p => ({ ...p, page }));
    loadContacts(page);
  };

  if (loading) return <PageSkeleton />;

  const displayStats = liveStats || stats;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/campaigns')}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {campaign?.name}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5
                               rounded-full text-[10px] font-bold tracking-widest
                               uppercase
                               ${campaign?.status === 'COMPLETED'
                  ? 'bg-purple-100 text-purple-700'
                  : campaign?.status === 'RUNNING'
                    ? 'bg-green-100 text-green-700'
                    : campaign?.status === 'PAUSED'
                      ? 'bg-yellow-100 text-yellow-700'
                      : campaign?.status === 'CANCELLED'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-gray-100 text-gray-600'}`}>
                {campaign?.status}
              </span>

              {campaign?.status === 'RUNNING' && (
                <span className={`inline-flex items-center gap-1 text-xs font-bold
                                  ${isConnected
                    ? 'text-green-500'
                    : 'text-yellow-500'}`}>
                  {isConnected
                    ? <><Wifi className="w-3.5 h-3.5" /><span className="animate-pulse">LIVE</span></>
                    : <><WifiOff className="w-3.5 h-3.5" /><span>POLLING</span></>}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border
                       border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50
                       shadow-sm text-sm"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border
                       border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50
                       shadow-sm text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {(displayStats?.failed || 0) > 0 && (
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-5 py-2 bg-orange-600
                         text-white rounded-lg hover:bg-orange-700 shadow-md
                         font-bold text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Failed ({selectedContacts.length || displayStats?.failed})
            </button>
          )}
        </div>
      </div>

      {/* ── Progress Bar ── */}
      {displayStats &&
        (campaign?.status === 'RUNNING' || isProcessing) && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Campaign Progress
              </span>
              <span className="text-sm text-gray-500">
                {Math.min(
                  displayStats.sent + displayStats.failed,
                  displayStats.totalContacts
                ).toLocaleString()}{' '}
                / {displayStats.totalContacts.toLocaleString()} processed
              </span>
            </div>

            {(() => {
              const total = Math.max(displayStats.totalContacts, 1);
              const delPct = Math.min((displayStats.delivered / total) * 100, 100);
              const sentPct = Math.min(((displayStats.sent - displayStats.delivered) / total) * 100, 100 - delPct);
              const failPct = Math.min((displayStats.failed / total) * 100, 100 - delPct - sentPct);
              const totalPct = Math.min(100, delPct + sentPct + failPct);

              return (
                <>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full flex transition-all duration-500"
                      style={{ width: `${totalPct}%` }}
                    >
                      <div
                        className="bg-green-500 h-full"
                        style={{ width: `${totalPct > 0 ? (delPct / totalPct) * 100 : 0}%` }}
                      />
                      <div
                        className="bg-blue-500 h-full"
                        style={{ width: `${totalPct > 0 ? (sentPct / totalPct) * 100 : 0}%` }}
                      />
                      <div
                        className="bg-red-500 h-full"
                        style={{ width: `${totalPct > 0 ? (failPct / totalPct) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between
                                mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        Delivered ({displayStats.delivered})
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                        Sent ({Math.max(0, displayStats.sent - displayStats.delivered)})
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full" />
                        Failed ({displayStats.failed})
                      </span>
                    </div>
                    <span className="font-bold">
                      {Math.min(100, Math.round(totalPct))}%
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
        )}

      {/* ── Stats Cards ── */}
      {displayStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            label="Total" value={displayStats.totalContacts}
            icon={Users} iconColor="text-blue-600"
            onClick={() => setFilterStatus('all')}
            active={filterStatus === 'all'}
          />
          <StatCard
            label="Pending"
            value={displayStats.pending + (displayStats.queued || 0)}
            icon={Clock} iconColor="text-yellow-500"
            onClick={() => setFilterStatus('PENDING')}
            active={filterStatus === 'PENDING'}
            pulse={isProcessing && displayStats.pending > 0}
          />
          <StatCard
            label="Sent" value={displayStats.sent}
            icon={Send} iconColor="text-purple-600"
            onClick={() => setFilterStatus('SENT')}
            active={filterStatus === 'SENT'}
          />
          <StatCard
            label="Delivered" value={displayStats.delivered}
            icon={CheckCircle} iconColor="text-green-600"
            onClick={() => setFilterStatus('DELIVERED')}
            active={filterStatus === 'DELIVERED'}
          />
          <StatCard
            label="Read" value={displayStats.read}
            icon={Eye} iconColor="text-blue-600"
            onClick={() => setFilterStatus('READ')}
            active={filterStatus === 'READ'}
          />
          <StatCard
            label="Failed" value={displayStats.failed}
            icon={XCircle} iconColor="text-red-600"
            onClick={() => setFilterStatus('FAILED')}
            active={filterStatus === 'FAILED'}
          />
        </div>
      )}

      {/* ── Failure Analysis ── */}
      {displayStats?.failureReasons?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-[10px] font-black text-gray-500 uppercase
                         tracking-widest flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Failure Analysis
          </h3>
          <div className="space-y-2">
            {displayStats.failureReasons.map((fr, i) => (
              <div
                key={i}
                className="flex items-start justify-between bg-red-50
                           rounded-xl p-4 border border-red-100"
              >
                <div className="flex-1 mr-4">
                  <p className="text-sm font-semibold text-gray-700">
                    {fr.reason}
                  </p>
                  {isMediaError(fr.reason) && (
                    <Link
                      to="/dashboard/templates"
                      className="inline-flex items-center mt-2 text-xs
                                 font-medium text-blue-600 hover:text-blue-800
                                 underline"
                    >
                      🔧 Go to Templates → Re-upload Media
                    </Link>
                  )}
                </div>
                <span className="text-sm font-black text-red-600 bg-red-50
                                 border border-red-200 px-3 py-1 rounded-full
                                 whitespace-nowrap">
                  {fr.count} contacts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Search & Filters ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2
                               w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by phone or name..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 bg-white border
                         border-gray-200 rounded-xl text-gray-900
                         focus:outline-none focus:border-emerald-500
                         focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200
                       rounded-xl text-gray-700 focus:outline-none
                       focus:border-emerald-500 focus:ring-2
                       focus:ring-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="SENT">Sent</option>
            <option value="DELIVERED">Delivered</option>
            <option value="READ">Read</option>
            <option value="FAILED">Failed</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-4 py-2.5 bg-green-600 hover:bg-green-700
                       text-white rounded-lg"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Contacts Table ── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-bold text-gray-900">
            Recipients
            <span className="text-gray-500 text-sm font-medium ml-2">
              ({pageMeta.total.toLocaleString()} total)
            </span>
          </h2>
        </div>
        {selectedContacts.length > 0 && (
          <span className="text-sm text-green-600 font-medium">
            {selectedContacts.length} selected
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      liveContacts.length > 0 &&
                      selectedContacts.length === liveContacts.length
                    }
                    onChange={e =>
                      setSelectedContacts(
                        e.target.checked
                          ? liveContacts.map(c => c.contactId)
                          : []
                      )
                    }
                    className="rounded border-gray-300 text-green-600
                               focus:ring-green-500"
                  />
                </th>
                {['Contact', 'Status', 'Delivery Details', 'Error / Info'].map(h => (
                  <th
                    key={h}
                    className={`px-4 py-4 text-[10px] font-black text-gray-500
                                uppercase tracking-widest
                                ${h === 'Error / Info' ? 'text-right' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {liveContacts.map(contact => {
                const cfg = STATUS_CFG[contact.status] || STATUS_CFG.PENDING;
                const Icon = cfg.icon;
                const name = getDisplayName(contact);
                const phone = cleanPhone(contact.phone);
                const isLive = contactStatusMap.has(contact.contactId);

                return (
                  <tr
                    key={contact.id}
                    className={`hover:bg-gray-50 transition-all duration-300
                                ${isLive ? 'bg-emerald-50/30' : ''}`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.contactId)}
                        onChange={() =>
                          setSelectedContacts(prev =>
                            prev.includes(contact.contactId)
                              ? prev.filter(id => id !== contact.contactId)
                              : [...prev, contact.contactId]
                          )
                        }
                        className="rounded border-gray-300 text-green-600"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-bold text-gray-900">{name}</p>
                      {name !== phone && (
                        <p className="text-xs text-gray-500 font-mono">{phone}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1
                                    rounded-full text-[10px] font-black
                                    tracking-widest uppercase ${cfg.color}
                                    ${isLive ? 'animate-pulse' : ''}`}
                      >
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4
                                      text-[11px] font-medium text-gray-400">
                        {contact.sentAt && (
                          <div className="flex flex-col">
                            <span className="text-[8px] uppercase opacity-60">Sent</span>
                            <span>{new Date(contact.sentAt).toLocaleTimeString()}</span>
                          </div>
                        )}
                        {contact.deliveredAt && (
                          <div className="flex flex-col">
                            <span className="text-[8px] uppercase opacity-60">Delv</span>
                            <span>{new Date(contact.deliveredAt).toLocaleTimeString()}</span>
                          </div>
                        )}
                        {contact.readAt && (
                          <div className="flex flex-col">
                            <span className="text-[8px] uppercase opacity-60">Read</span>
                            <span>{new Date(contact.readAt).toLocaleTimeString()}</span>
                          </div>
                        )}
                        {contact.status === 'PENDING' && !contact.sentAt && (
                          <span className="text-yellow-500 text-xs italic">
                            Waiting...
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {contact.failureReason && (
                        <div
                          className="inline-block px-3 py-1.5 bg-red-50
                                     text-red-600 rounded-xl text-xs font-bold
                                     ring-1 ring-red-100 max-w-[280px] truncate"
                          title={contact.failureReason}
                        >
                          {contact.failureReason}
                        </div>
                      )}
                      {contact.retryCount > 0 && (
                        <span className="text-[10px] text-gray-400 ml-1">
                          (retry #{contact.retryCount})
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {liveContacts.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    No contacts found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ FIX Bug3: Pagination with proper page state */}
        {pageMeta.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200
                          flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Page {pageMeta.page} of {pageMeta.totalPages}{' '}
              ({pageMeta.total.toLocaleString()} total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => goToPage(pageMeta.page - 1)}
                disabled={pageMeta.page === 1}
                className="px-3 py-1.5 bg-white border border-gray-200
                           text-gray-700 rounded-lg disabled:opacity-50
                           text-sm hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => goToPage(pageMeta.page + 1)}
                disabled={pageMeta.page >= pageMeta.totalPages}
                className="px-3 py-1.5 bg-white border border-gray-200
                           text-gray-700 rounded-lg disabled:opacity-50
                           text-sm hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignDetails;