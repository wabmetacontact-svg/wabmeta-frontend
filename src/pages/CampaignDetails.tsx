// src/pages/CampaignDetails.tsx - PRODUCTION FIXED

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, RefreshCw, RotateCcw, CheckCircle, XCircle,
  Clock, Send, Eye, AlertTriangle, Users, Search,
  Wifi, WifiOff, Download
} from 'lucide-react';
import { campaigns as campaignsApi } from '../services/api';
import useCampaignRealtime from '../hooks/useCampaignRealtime';
import toast from 'react-hot-toast';
import PageSkeleton from '../components/common/PageSkeleton';

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

const cleanPhone = (phone: string): string => {
  if (!phone) return '';
  return phone.replace(/^\+/, '');
};

const getDisplayName = (contact: CampaignContact): string => {
  const name = contact.name || contact.fullName || '';
  if (name && name !== 'Unknown' && name.trim() !== '') return name;
  return cleanPhone(contact.phone);
};

const isExpiredMediaError = (reason: string): boolean => {
  return reason.toLowerCase().includes('expired media handle') ||
    reason.toLowerCase().includes('re-upload');
};

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  QUEUED: { label: 'Queued', color: 'bg-orange-100 text-orange-700', icon: Clock },
  SENT: { label: 'Sent', color: 'bg-blue-100 text-blue-700', icon: Send },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  READ: { label: 'Read', color: 'bg-purple-100 text-purple-700', icon: Eye },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const CampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [campaign, setCampaign] = useState<any>(null);
  const [contacts, setContacts] = useState<CampaignContact[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [meta, setMeta] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const lastStatsRefreshRef = useRef<number>(0);
  const lastContactsRefreshRef = useRef<number>(0);

  const {
    progress,
    isProcessing,
    completedStats,
    contactStatusMap,        // ✅ Real-time contact updates
    isConnected,
    campaignError,
    resetStats,
  } = useCampaignRealtime(id || null);

  // ✅ Merge real-time progress with fetched stats (SAFETY CAPS)
  const liveStats = useMemo((): Stats | null => {
    if (!stats) return null;

    if (progress && isProcessing) {
      const total = Math.max(progress.total, stats.totalContacts, 1);
      const sent = Math.min(progress.sent, total);
      const failed = Math.min(progress.failed, Math.max(0, total - sent));
      const delivered = Math.min(progress.delivered, sent);
      const read = Math.min(progress.read, delivered);
      const pending = Math.max(0, total - sent - failed);

      return {
        ...stats,
        totalContacts: total,
        sent,
        failed,
        delivered,
        read,
        pending,
        queued: 0,
      };
    }

    return stats;
  }, [stats, progress, isProcessing]);

  // ✅ Merge contact list with real-time per-contact updates
  const liveContacts = useMemo(() => {
    if (contactStatusMap.size === 0) return contacts;

    return contacts.map((c) => {
      const update = contactStatusMap.get(c.contactId);
      if (!update) return c;

      return {
        ...c,
        status: update.status,
        sentAt: update.sentAt || c.sentAt,
        deliveredAt: update.deliveredAt || c.deliveredAt,
        readAt: update.readAt || c.readAt,
        failedAt: update.failedAt || c.failedAt,
        failureReason: update.error || c.failureReason,
        waMessageId: update.messageId || c.waMessageId,
      };
    });
  }, [contacts, contactStatusMap]);

  const loadCampaign = useCallback(async () => {
    try {
      const res = await campaignsApi.getById(id!);
      if (res.data.success) setCampaign(res.data.data);
    } catch (err) {
      console.error('Failed to load campaign');
    }
  }, [id]);

  const loadStats = useCallback(async () => {
    try {
      const res = await campaignsApi.getDetailedStats(id!);
      if (res.data.success) setStats(res.data.data);
      lastStatsRefreshRef.current = Date.now();
    } catch (err) {
      console.error('Failed to load stats');
    }
  }, [id]);

  const loadContacts = useCallback(async (page = 1, silent = false) => {
    try {
      const res = await campaignsApi.getContacts(id!, {
        page,
        limit: meta.limit,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: search || undefined,
      });

      if (res.data.success) {
        const data = res.data.data;
        const contactsList = Array.isArray(data) ? data : data.contacts || data.recipients || [];
        setContacts(contactsList);

        const responseMeta = res.data.meta || data.meta;
        if (responseMeta) {
          setMeta((prev) => ({
            ...prev,
            page: responseMeta.page || page,
            total: responseMeta.total || 0,
            totalPages: responseMeta.totalPages || 1,
          }));
        }
        lastContactsRefreshRef.current = Date.now();
      }
    } catch (err) {
      if (!silent) console.error('Failed to load contacts');
    }
  }, [id, meta.limit, filterStatus, search]);

  // ✅ Initial load
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      resetStats();
      await Promise.all([loadCampaign(), loadStats()]);
      await loadContacts(1);
      setLoading(false);
    };
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ✅ Filter change → reload contacts (page 1)
  useEffect(() => {
    if (!loading) {
      loadContacts(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  // ✅ SMART REFRESH: Only refresh stats every 15s during RUNNING
  useEffect(() => {
    if (!isProcessing) return;

    const interval = setInterval(() => {
      const now = Date.now();
      // Only refresh if last refresh > 15s ago
      if (now - lastStatsRefreshRef.current > 15000) {
        loadStats();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isProcessing, loadStats]);

  // ✅ Handle campaign completion → ONE final refresh
  useEffect(() => {
    if (completedStats) {
      toast.success(
        `Campaign completed! ${completedStats.sentCount} sent, ${completedStats.failedCount} failed`,
        { duration: 5000 }
      );
      // Delayed final refresh (webhooks may take time)
      const timer = setTimeout(() => {
        loadCampaign();
        loadStats();
        loadContacts(meta.page, true);
      }, 2000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedStats]);

  // ✅ POLLING FALLBACK (only if socket disconnected)
  useEffect(() => {
    if (campaign?.status === 'RUNNING' && !isConnected) {
      const interval = setInterval(() => {
        loadStats();
        loadContacts(meta.page, true);
      }, 8000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign?.status, isConnected]);

  // ✅ Update campaign status from socket events
  useEffect(() => {
    if (isProcessing && campaign?.status !== 'RUNNING') {
      setCampaign((prev: any) => (prev ? { ...prev, status: 'RUNNING' } : prev));
    }
    if (completedStats && campaign?.status === 'RUNNING') {
      setCampaign((prev: any) => (prev ? { ...prev, status: 'COMPLETED' } : prev));
    }
  }, [isProcessing, completedStats, campaign?.status]);

  // ✅ Handle campaign errors
  useEffect(() => {
    if (campaignError) {
      toast.error(campaignError.message, { duration: 8000, icon: '⚠️' });
      loadCampaign();
      loadStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignError]);

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([loadCampaign(), loadStats(), loadContacts(meta.page)]);
    setRefreshing(false);
  };

  const handleSearch = () => {
    setSearch(searchInput);
    loadContacts(1);
  };

  const handleRetryFailed = async () => {
    try {
      const contactIds = selectedContacts.length > 0 ? selectedContacts : undefined;
      await campaignsApi.retryFailed(id!, { contactIds, retryFailed: true });
      toast.success('Retrying failed messages...');
      setSelectedContacts([]);
      setTimeout(() => refresh(), 1000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to retry');
    }
  };

  const handleExport = async () => {
    try {
      const res = await campaignsApi.exportRecipients(
        id!,
        filterStatus !== 'all' ? filterStatus : undefined
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `campaign-${id}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Export downloaded!');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  if (loading) return <PageSkeleton />;

  const displayStats = liveStats || stats;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/campaigns')}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {campaign?.name}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                campaign?.status === 'COMPLETED' ? 'bg-purple-100 text-purple-700' :
                campaign?.status === 'RUNNING' ? 'bg-green-100 text-green-700' :
                campaign?.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-700' :
                campaign?.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {campaign?.status}
              </span>

              {campaign?.status === 'RUNNING' && (
                <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                  isConnected ? 'text-green-500' : 'text-yellow-500'
                }`}>
                  {isConnected ? (
                    <><Wifi className="w-3.5 h-3.5" /><span className="animate-pulse">LIVE UPDATES</span></>
                  ) : (
                    <><WifiOff className="w-3.5 h-3.5" /><span>POLLING MODE</span></>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm text-sm"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
          {(displayStats?.failed || 0) > 0 && (
            <button
              onClick={handleRetryFailed}
              className="flex items-center gap-2 px-5 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 shadow-md active:scale-95 transition-all font-bold text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Failed ({selectedContacts.length || displayStats?.failed})
            </button>
          )}
        </div>
      </div>

      {/* PROGRESS BAR */}
      {(campaign?.status === 'RUNNING' || isProcessing) && displayStats && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Campaign Progress</span>
            <span className="text-sm text-gray-500">
              {Math.min(displayStats.sent + displayStats.failed, displayStats.totalContacts).toLocaleString()} / {displayStats.totalContacts.toLocaleString()} processed
            </span>
          </div>

          {(() => {
            const total = Math.max(displayStats.totalContacts, 1);
            const deliveredPct = Math.min((displayStats.delivered / total) * 100, 100);
            const sentOnlyPct = Math.min(((displayStats.sent - displayStats.delivered) / total) * 100, 100 - deliveredPct);
            const failedPct = Math.min((displayStats.failed / total) * 100, 100 - deliveredPct - sentOnlyPct);
            const totalPct = Math.min(100, deliveredPct + sentOnlyPct + failedPct);

            return (
              <>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full flex transition-all duration-500" style={{ width: `${totalPct}%` }}>
                    <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${totalPct > 0 ? (deliveredPct / totalPct) * 100 : 0}%` }} />
                    <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${totalPct > 0 ? (sentOnlyPct / totalPct) * 100 : 0}%` }} />
                    <div className="bg-red-500 h-full transition-all duration-500" style={{ width: `${totalPct > 0 ? (failedPct / totalPct) * 100 : 0}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-1" />Delivered ({displayStats.delivered})</span>
                    <span className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-1" />Sent ({Math.max(0, displayStats.sent - displayStats.delivered)})</span>
                    <span className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-1" />Failed ({displayStats.failed})</span>
                  </div>
                  <span className="font-bold">{Math.min(100, Math.round(totalPct))}%</span>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* STATS CARDS */}
      {displayStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total Recipients" value={displayStats.totalContacts} icon={Users} iconColor="text-blue-600" onClick={() => setFilterStatus('all')} active={filterStatus === 'all'} />
          <StatCard label="Pending" value={displayStats.pending + (displayStats.queued || 0)} icon={Clock} iconColor="text-yellow-500" onClick={() => setFilterStatus('PENDING')} active={filterStatus === 'PENDING'} pulse={isProcessing && displayStats.pending > 0} />
          <StatCard label="Sent" value={displayStats.sent} icon={Send} iconColor="text-purple-600" onClick={() => setFilterStatus('SENT')} active={filterStatus === 'SENT'} />
          <StatCard label="Delivered" value={displayStats.delivered} icon={CheckCircle} iconColor="text-green-600" onClick={() => setFilterStatus('DELIVERED')} active={filterStatus === 'DELIVERED'} />
          <StatCard label="Read" value={displayStats.read} icon={Eye} iconColor="text-blue-600" onClick={() => setFilterStatus('READ')} active={filterStatus === 'READ'} />
          <StatCard label="Failed" value={displayStats.failed} icon={XCircle} iconColor="text-red-600" onClick={() => setFilterStatus('FAILED')} active={filterStatus === 'FAILED'} />
        </div>
      )}

      {/* FAILURE ANALYSIS */}
      {displayStats && displayStats.failureReasons && displayStats.failureReasons.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-500" /> Failure Analysis
          </h3>
          <div className="space-y-2">
            {displayStats.failureReasons.map((fr, i) => (
              <div key={i} className="flex items-start justify-between bg-red-50 rounded-xl p-4 border border-red-100">
                <div className="flex-1 mr-4">
                  <p className="text-sm font-semibold text-gray-700">{fr.reason}</p>
                  {isExpiredMediaError(fr.reason) && (
                    <Link to="/dashboard/templates" className="inline-flex items-center mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 underline">
                      🔧 Go to Templates → Edit & Re-upload Image
                    </Link>
                  )}
                </div>
                <span className="text-sm font-black text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
                  {fr.count} contacts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEARCH & FILTERS */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by phone or name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
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
            className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* CONTACTS TABLE */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-bold text-gray-900">
            Recipient Contacts
            <span className="text-gray-500 text-sm font-medium ml-2">({meta.total.toLocaleString()} total)</span>
          </h2>
        </div>
        {selectedContacts.length > 0 && (
          <span className="text-sm text-green-600 font-medium">{selectedContacts.length} selected</span>
        )}
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedContacts.length === liveContacts.length && liveContacts.length > 0}
                    onChange={(e) => setSelectedContacts(e.target.checked ? liveContacts.map((c) => c.contactId) : [])}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </th>
                <th className="px-4 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Contact</th>
                <th className="px-4 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-4 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Delivery Details</th>
                <th className="px-4 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Error / Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {liveContacts.map((contact) => {
                const config = statusConfig[contact.status] || statusConfig.PENDING;
                const Icon = config.icon;
                const displayName = getDisplayName(contact);
                const displayPhone = cleanPhone(contact.phone);
                const isLive = contactStatusMap.has(contact.contactId);

                return (
                  <tr
                    key={contact.id}
                    className={`hover:bg-emerald-500/[0.02] transition-all duration-500 group/row ${
                      isLive ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.contactId)}
                        onChange={() => {
                          setSelectedContacts((prev) =>
                            prev.includes(contact.contactId)
                              ? prev.filter((id) => id !== contact.contactId)
                              : [...prev, contact.contactId]
                          );
                        }}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-bold text-gray-900">{displayName}</p>
                      {displayName !== displayPhone && (
                        <p className="text-xs text-gray-500 font-mono">{displayPhone}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${config.color} ${isLive ? 'animate-pulse' : ''}`}>
                        <Icon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4 text-[11px] font-medium text-gray-400">
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
                        {contact.status === 'PENDING' && (
                          <span className="text-yellow-500 text-xs italic">Waiting...</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {contact.failureReason && (
                        <div className="inline-block px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold ring-1 ring-red-100 shadow-sm max-w-[300px] truncate" title={contact.failureReason}>
                          {contact.failureReason}
                        </div>
                      )}
                      {contact.retryCount > 0 && (
                        <span className="text-[10px] text-gray-400 ml-2">(retry #{contact.retryCount})</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {liveContacts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No contacts found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Page {meta.page} of {meta.totalPages} ({meta.total.toLocaleString()} total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => loadContacts(meta.page - 1)}
                disabled={meta.page === 1}
                className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg disabled:opacity-50 text-sm hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => loadContacts(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
                className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg disabled:opacity-50 text-sm hover:bg-gray-50"
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

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: any;
  iconColor: string;
  onClick?: () => void;
  active?: boolean;
  pulse?: boolean;
}> = ({ label, value, icon: Icon, iconColor, onClick, active, pulse }) => (
  <div
    onClick={onClick}
    className={`relative overflow-hidden rounded-2xl bg-white border p-6 transition-all duration-300 group/stat shadow-sm ${
      active ? 'border-emerald-500 shadow-md shadow-emerald-500/10' : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
    } ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover/stat:scale-110 group-hover/stat:opacity-[0.10] transition-all duration-500">
      <Icon size={80} className={iconColor} />
    </div>
    <div className="relative z-10">
      <p className={`text-xs font-mono uppercase tracking-widest mb-1 ${iconColor}`}>{label}</p>
      <p className={`text-3xl font-bold text-gray-900 transition-all duration-500 ${pulse ? 'animate-pulse' : ''}`}>
        {value.toLocaleString()}
      </p>
    </div>
  </div>
);

export default CampaignDetails;