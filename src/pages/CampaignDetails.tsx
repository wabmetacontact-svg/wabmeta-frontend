// 📁 src/pages/CampaignDetails.tsx - COMPLETE FIXED VERSION

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

// ============================================
// TYPES
// ============================================

interface CampaignContact {
  id: string;
  contactId: string;
  phone: string;
  name: string;
  fullName?: string;
  avatar?: string;
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

// ============================================
// HELPERS
// ============================================

// ✅ Clean phone number - remove "+" prefix for display
const cleanPhone = (phone: string): string => {
  if (!phone) return '';
  return phone.replace(/^\+/, '');
};

// ✅ Get display name - never show "Unknown"
const getDisplayName = (contact: CampaignContact): string => {
  const name = contact.name || contact.fullName || '';
  if (name && name !== 'Unknown' && name.trim() !== '') {
    return name;
  }
  // Fallback to phone number
  return cleanPhone(contact.phone);
};

// ✅ Expired media error detect karo
const isExpiredMediaError = (reason: string): boolean => {
  return reason.toLowerCase().includes('expired media handle') ||
         reason.toLowerCase().includes('re-upload');
};

// ✅ Status config
const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  QUEUED: { label: 'Queued', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: Clock },
  SENT: { label: 'Sent', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Send },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  READ: { label: 'Read', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Eye },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
};

// ============================================
// COMPONENT
// ============================================

const CampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State
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

  const {
    progress,
    isProcessing,
    completedStats,
    isConnected,
    campaignError,
  } = useCampaignRealtime(id || null);

  // ✅ FIXED: Merge real-time progress with SAFETY CAPS
  const liveStats = useMemo((): Stats | null => {
    if (!stats) return null;

    if (progress && isProcessing) {
      const total = Math.max(progress.total, 1);
      
      // ✅ CRITICAL: Never let sent+failed exceed total
      const sent = Math.min(progress.sent, total);
      const failed = Math.min(progress.failed, total - sent);
      const delivered = Math.min(progress.delivered || stats.delivered, sent);
      const read = Math.min(progress.read || stats.read, delivered);
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

  // ============================================
  // DATA LOADING
  // ============================================

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
    } catch (err) {
      console.error('Failed to load stats');
    }
  }, [id]);

  const loadContacts = useCallback(async (page = 1) => {
    try {
      const res = await campaignsApi.getContacts(id!, {
        page,
        limit: meta.limit,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: search || undefined,
      });

      if (res.data.success) {
        const data = res.data.data;

        // ✅ Handle both response formats
        const contactsList = Array.isArray(data)
          ? data
          : data.contacts || data.recipients || [];

        setContacts(contactsList);

        // ✅ Handle meta from different locations
        const responseMeta = res.data.meta || data.meta;
        if (responseMeta) {
          setMeta(prev => ({
            ...prev,
            page: responseMeta.page || page,
            total: responseMeta.total || 0,
            totalPages: responseMeta.totalPages || 1,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load contacts');
    }
  }, [id, meta.limit, filterStatus, search]);

  // Initial load
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadCampaign(), loadStats()]);
      await loadContacts(1);
      setLoading(false);
    };
    loadAll();
  }, [id]);

  // Reload contacts when filter changes
  useEffect(() => {
    if (!loading) {
      loadContacts(1);
    }
  }, [filterStatus]);

  // ✅ REAL-TIME: Auto-refresh stats when progress updates
  useEffect(() => {
    if (progress && progress.percentage % 10 === 0) {
      // Refresh from server every 10%
      loadStats();
      loadContacts(meta.page);
    }
  }, [progress?.percentage]);

  // ✅ REAL-TIME: Handle campaign completion
  useEffect(() => {
    if (completedStats) {
      toast.success(
        `Campaign completed! ${completedStats.sentCount} sent, ${completedStats.failedCount} failed`,
        { duration: 5000 }
      );
      // Final refresh
      loadCampaign();
      loadStats();
      loadContacts(meta.page);
    }
  }, [completedStats]);

  // ✅ Polling fallback (when socket is not connected)
  useEffect(() => {
    if (campaign?.status === 'RUNNING' && !isConnected) {
      console.log('⚠️ Socket not connected, using polling');
      const interval = setInterval(() => {
        loadStats();
        loadContacts(meta.page);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [campaign?.status, isConnected]);

  // ✅ REAL-TIME: Update campaign status from socket
  useEffect(() => {
    if (isProcessing && campaign?.status !== 'RUNNING') {
      setCampaign((prev: any) => prev ? { ...prev, status: 'RUNNING' } : prev);
    }
    if (completedStats && campaign?.status === 'RUNNING') {
      setCampaign((prev: any) => prev ? { ...prev, status: 'COMPLETED' } : prev);
    }
  }, [isProcessing, completedStats]);

  // ✅ REAL-TIME: Handle campaign errors (e.g. Low Balance)
  useEffect(() => {
    if (campaignError) {
      toast.error(campaignError.message, { 
        duration: 8000,
        icon: '⚠️'
      });
      // Refresh to get updated status (PAUSED)
      loadCampaign();
      loadStats();
    }
  }, [campaignError]);

  // ============================================
  // ACTIONS
  // ============================================

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
      await campaignsApi.retryFailed(id!, { contactIds });
      toast.success('Retrying failed messages...');
      setSelectedContacts([]);
      refresh();
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

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return <PageSkeleton />;
  }

  const displayStats = liveStats || stats;

  return (
    <div className="space-y-6">
      {/* ============================== */}
      {/* HEADER */}
      {/* ============================== */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/campaigns')}
            className="p-2 hover:bg-[#0a0e27]/[0.06] rounded-lg text-gray-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {campaign?.name}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              {/* Campaign Status Badge */}
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                campaign?.status === 'COMPLETED' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30' :
                campaign?.status === 'RUNNING' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                campaign?.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30' :
                campaign?.status === 'FAILED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' :
                'bg-[#0a0e27]/[0.04] text-gray-300 dark:bg-gray-800'
              }`}>
                {campaign?.status}
              </span>

              {/* ✅ Live Updates Indicator */}
              {campaign?.status === 'RUNNING' && (
                <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                  isConnected ? 'text-green-500' : 'text-yellow-500'
                }`}>
                  {isConnected ? (
                    <>
                      <Wifi className="w-3 h-3" />
                      <span className="animate-pulse">LIVE UPDATES ACTIVE</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3" />
                      <span>POLLING MODE</span>
                    </>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-[#0a0e27] border border-white/[0.1] text-gray-300 rounded-lg hover:bg-[#0a0e27]/[0.04] transition-colors shadow-sm text-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>

          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-[#0a0e27] border border-white/[0.1] text-gray-300 rounded-lg hover:bg-[#0a0e27]/[0.04] transition-colors shadow-sm text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
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

      {/* ✅ FIXED: Progress Bar - capped at 100% */}
      {campaign?.status === 'RUNNING' && displayStats && (
        <div className="bg-[#0a0e27] rounded-xl border border-white/[0.1] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">
              Campaign Progress
            </span>
            <span className="text-sm text-gray-400">
              {/* ✅ FIX: Never show more than total */}
              {Math.min(
                displayStats.sent + displayStats.failed,
                displayStats.totalContacts
              ).toLocaleString()} / {displayStats.totalContacts.toLocaleString()} processed
            </span>
          </div>

          {(() => {
            const total = Math.max(displayStats.totalContacts, 1);
            
            // ✅ Calculate safe percentages that never exceed 100%
            const deliveredPct = Math.min(
              (displayStats.delivered / total) * 100, 
              100
            );
            const sentPct = Math.min(
              ((displayStats.sent - displayStats.delivered) / total) * 100,
              100 - deliveredPct
            );
            const failedPct = Math.min(
              (displayStats.failed / total) * 100,
              100 - deliveredPct - sentPct
            );
            const totalPct = Math.min(100, deliveredPct + sentPct + failedPct);

            return (
              <>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full flex transition-all duration-500"
                    style={{ width: `${totalPct}%` }}
                  >
                    <div
                      className="bg-green-500 h-full"
                      style={{ width: `${totalPct > 0 ? (deliveredPct / totalPct) * 100 : 0}%` }}
                    />
                    <div
                      className="bg-blue-500 h-full"
                      style={{ width: `${totalPct > 0 ? (sentPct / totalPct) * 100 : 0}%` }}
                    />
                    <div
                      className="bg-red-500 h-full"
                      style={{ width: `${totalPct > 0 ? (failedPct / totalPct) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                      Delivered ({displayStats.delivered})
                    </span>
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-1" />
                      Sent ({Math.max(0, displayStats.sent - displayStats.delivered)})
                    </span>
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-1" />
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

      {/* ============================== */}
      {/* ✅ NEW: Quality Warning when ecosystem errors detected */}
      {displayStats && displayStats.failureReasons?.some(fr => 
        fr.reason.includes('ecosystem') || fr.reason.includes('healthy')
      ) && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-base font-bold text-amber-800 dark:text-amber-300 mb-1">
                ⚠️ Meta Quality Warning
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                Meta is blocking some messages to protect users. This happens when:
              </p>
              <ul className="text-sm text-amber-600 dark:text-amber-400 space-y-1 list-disc list-inside mb-3">
                <li>Recipients haven't opted-in to receive messages</li>
                <li>Too many users are blocking or reporting your number</li>
                <li>Template quality score has dropped</li>
                <li>Sending to too many inactive/cold contacts</li>
              </ul>
              <div className="bg-[#0a0e27] rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                <p className="text-xs font-bold text-gray-300 mb-2">
                  💡 How to fix:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-400">
                  <div className="flex items-start gap-1.5">
                    <span className="text-green-500 font-bold">1.</span>
                    <span>Only send to contacts who opted-in</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-green-500 font-bold">2.</span>
                    <span>Send to smaller groups (50-100 at a time)</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-green-500 font-bold">3.</span>
                    <span>Wait 24 hours before sending again</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-green-500 font-bold">4.</span>
                    <span>Use a different template with better content</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================== */}
      {/* ✅ FIXED: STATS CARDS */}
      {/* ============================== */}
      {displayStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            label="Total Recipients"
            value={displayStats.totalContacts}
            icon={Users}
            iconBg="bg-blue-50 dark:bg-blue-900/20"
            iconColor="text-blue-600 dark:text-blue-400"
            onClick={() => setFilterStatus('all')}
            active={filterStatus === 'all'}
          />

          <StatCard
            label="Pending"
            value={displayStats.pending + (displayStats.queued || 0)}
            icon={Clock}
            iconBg="bg-yellow-50 dark:bg-yellow-900/20"
            iconColor="text-yellow-500 dark:text-yellow-400"
            onClick={() => setFilterStatus('PENDING')}
            active={filterStatus === 'PENDING'}
            pulse={campaign?.status === 'RUNNING' && displayStats.pending > 0}
          />

          <StatCard
            label="Sent"
            value={displayStats.sent}
            icon={Send}
            iconBg="bg-purple-50 dark:bg-purple-900/20"
            iconColor="text-purple-600 dark:text-purple-400"
            onClick={() => setFilterStatus('SENT')}
            active={filterStatus === 'SENT'}
          />

          <StatCard
            label="Delivered"
            value={displayStats.delivered}
            icon={CheckCircle}
            iconBg="bg-green-50 dark:bg-green-900/20"
            iconColor="text-green-600 dark:text-green-400"
            onClick={() => setFilterStatus('DELIVERED')}
            active={filterStatus === 'DELIVERED'}
          />

          <StatCard
            label="Read"
            value={displayStats.read}
            icon={Eye}
            iconBg="bg-blue-50 dark:bg-blue-900/20"
            iconColor="text-blue-600 dark:text-blue-400"
            onClick={() => setFilterStatus('READ')}
            active={filterStatus === 'READ'}
          />

          <StatCard
            label="Failed"
            value={displayStats.failed}
            icon={XCircle}
            iconBg="bg-red-50 dark:bg-red-900/20"
            iconColor="text-red-600 dark:text-red-400"
            onClick={() => setFilterStatus('FAILED')}
            active={filterStatus === 'FAILED'}
          />
        </div>
      )}

      {/* ============================== */}
      {/* FAILURE ANALYSIS */}
      {/* ============================== */}
      {displayStats && displayStats.failureReasons && displayStats.failureReasons.length > 0 && (
        <div className="bg-[#0a0e27] rounded-xl border border-white/[0.1] p-6 shadow-sm">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Failure Analysis
          </h3>
          <div className="space-y-2">
            {displayStats.failureReasons.map((fr, i) => (
              <div
                key={i}
                className="flex items-start justify-between bg-red-50/50 dark:bg-red-900/10 rounded-xl p-4 border border-red-100/30 dark:border-red-900/20"
              >
                <div className="flex-1 mr-4">
                  <p className="text-sm font-semibold text-gray-300">
                    {fr.reason}
                  </p>
                  
                  {/* ✅ NEW: Show "Edit Template" button for expired media */}
                  {isExpiredMediaError(fr.reason) && (
                    <Link
                      to={`/dashboard/templates`}
                      className="inline-flex items-center mt-2 text-xs font-medium 
                                 text-blue-600 hover:text-blue-800 underline"
                    >
                      🔧 Go to Templates → Edit & Re-upload Image
                    </Link>
                  )}
                </div>
                <span className="text-sm font-black text-red-600 dark:text-red-500 bg-[#0a0e27] px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
                  {fr.count} contacts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================== */}
      {/* SEARCH & FILTERS */}
      {/* ============================== */}
      <div className="bg-[#0a0e27] rounded-xl p-4 border border-white/[0.1] shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by phone or name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 bg-[#050816] dark:bg-gray-700 border border-white/[0.1] dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-[#050816] dark:bg-gray-700 border border-white/[0.1] dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
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
            className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ============================== */}
      {/* ✅ FIXED: CONTACTS TABLE */}
      {/* ============================== */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-bold text-white">
            Recipient Contacts
            <span className="text-gray-400 text-sm font-medium ml-2">
              ({meta.total.toLocaleString()} total)
            </span>
          </h2>
        </div>

        {selectedContacts.length > 0 && (
          <span className="text-sm text-green-600 font-medium">
            {selectedContacts.length} selected
          </span>
        )}
      </div>

      <div className="bg-[#0a0e27] rounded-xl border border-white/[0.1] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#050816]/50 dark:bg-gray-700/50 border-b border-white/[0.1]">
                <th className="px-4 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedContacts.length === contacts.length && contacts.length > 0}
                    onChange={(e) =>
                      setSelectedContacts(
                        e.target.checked ? contacts.map((c) => c.contactId) : []
                      )
                    }
                    className="rounded border-white/[0.12] text-green-600 focus:ring-green-500"
                  />
                </th>
                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Contact
                </th>
                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Delivery Details
                </th>
                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                  Error / Info
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {contacts.map((contact) => {
                const config = statusConfig[contact.status] || statusConfig.PENDING;
                const Icon = config.icon;
                const displayName = getDisplayName(contact);
                const displayPhone = cleanPhone(contact.phone);

                return (
                  <tr
                    key={contact.id}
                    className="hover:bg-[#0a0e27]/[0.04]/30 transition-colors"
                  >
                    {/* Checkbox */}
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
                        className="rounded border-white/[0.12] text-green-600 focus:ring-green-500"
                      />
                    </td>

                    {/* Contact name & phone */}
                    <td className="px-4 py-4">
                      <p className="font-bold text-white dark:text-gray-100">
                        {displayName}
                      </p>
                      {displayName !== displayPhone && (
                        <p className="text-xs text-gray-400 font-mono tracking-tighter">
                          {displayPhone}
                        </p>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${config.color}`}
                      >
                        <Icon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </td>

                    {/* Delivery Timeline */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4 text-[11px] font-medium text-gray-400">
                        {contact.sentAt && (
                          <div className="flex flex-col">
                            <span className="text-[8px] uppercase opacity-60">Sent</span>
                            <span className="tracking-tight">
                              {new Date(contact.sentAt).toLocaleTimeString()}
                            </span>
                          </div>
                        )}
                        {contact.deliveredAt && (
                          <div className="flex flex-col">
                            <span className="text-[8px] uppercase opacity-60">Delv</span>
                            <span className="tracking-tight">
                              {new Date(contact.deliveredAt).toLocaleTimeString()}
                            </span>
                          </div>
                        )}
                        {contact.readAt && (
                          <div className="flex flex-col">
                            <span className="text-[8px] uppercase opacity-60">Read</span>
                            <span className="tracking-tight">
                              {new Date(contact.readAt).toLocaleTimeString()}
                            </span>
                          </div>
                        )}
                        {contact.status === 'PENDING' && (
                          <span className="text-yellow-500 text-xs italic">Waiting...</span>
                        )}
                      </div>
                    </td>

                    {/* Error Message */}
                    <td className="px-4 py-4 text-right">
                      {contact.failureReason && (
                        <div
                          className="inline-block px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold ring-1 ring-red-100 dark:ring-red-900/30 shadow-sm max-w-[300px] truncate"
                          title={contact.failureReason}
                        >
                          {contact.failureReason}
                        </div>
                      )}
                      {contact.retryCount > 0 && (
                        <span className="text-[10px] text-gray-400 ml-2">
                          (retry #{contact.retryCount})
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {contacts.length === 0 && (
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

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-white/[0.1] flex items-center justify-between">
            <span className="text-sm text-gray-400">
              Page {meta.page} of {meta.totalPages} ({meta.total.toLocaleString()} total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => loadContacts(meta.page - 1)}
                disabled={meta.page === 1}
                className="px-3 py-1.5 bg-[#0a0e27]/[0.04] dark:bg-gray-700 text-gray-300 rounded-lg disabled:opacity-50 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => loadContacts(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
                className="px-3 py-1.5 bg-[#0a0e27]/[0.04] dark:bg-gray-700 text-gray-300 rounded-lg disabled:opacity-50 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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

// ============================================
// StatCard Component
// ============================================

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: any;
  iconBg: string;
  iconColor: string;
  onClick?: () => void;
  active?: boolean;
  pulse?: boolean;
}> = ({ label, value, icon: Icon, iconBg, iconColor, onClick, active, pulse }) => (
  <div
    onClick={onClick}
    className={`bg-[#0a0e27] rounded-xl p-5 border transition-all shadow-sm ${
      active
        ? 'border-green-500 ring-2 ring-green-500/20 shadow-green-500/10'
        : 'border-white/[0.1]'
    } ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}`}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm text-gray-400 whitespace-nowrap">{label}</p>
        <p className={`text-2xl font-bold text-white mt-1 ${
          pulse ? 'animate-pulse' : ''
        }`}>
          {value.toLocaleString()}
        </p>
      </div>
      <div className={`flex-none p-3 rounded-lg ${iconBg}`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
    </div>
  </div>
);

export default CampaignDetails;