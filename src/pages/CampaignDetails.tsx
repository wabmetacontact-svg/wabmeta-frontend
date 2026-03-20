import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, RefreshCw, Play, RotateCcw, CheckCircle, XCircle,
  Clock, Send, Eye, AlertTriangle, Users, Search,
  BarChart2, Loader2
} from 'lucide-react';
import { campaigns as campaignsApi } from '../services/api';
import toast from 'react-hot-toast';

interface CampaignContact {
  id: string;
  contactId: string;
  phone: string;
  name: string;
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

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Pending', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', icon: Clock },
  QUEUED: { label: 'Queued', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400', icon: Clock },
  SENT: { label: 'Sent', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400', icon: Send },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400', icon: CheckCircle },
  READ: { label: 'Read', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400', icon: Eye },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400', icon: XCircle },
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

  const [filterStatus, setFilterStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const loadCampaign = useCallback(async () => {
    try {
      const res = await campaignsApi.getById(id!);
      if (res.data.success) {
        setCampaign(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load campaign');
    }
  }, [id]);

  const loadContacts = useCallback(async (page = 1) => {
    try {
      const res = await campaignsApi.getContacts(id!, {
        page,
        limit: meta.limit,
        status: filterStatus || undefined,
        search: search || undefined,
      });

      if (res.data.success) {
        // Handle result structure which might be res.data.data.contacts or res.data.data directly
        const data = res.data.data;
        const contactList = Array.isArray(data) ? data : (data.contacts || []);
        setContacts(contactList);
        if (data.meta) setMeta(data.meta);
      }
    } catch (err) {
      console.error('Failed to load contacts');
    }
  }, [id, meta.limit, filterStatus, search]);

  const loadStats = useCallback(async () => {
    try {
      const res = await campaignsApi.getDetailedStats(id!);
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load stats');
    }
  }, [id]);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadCampaign(), loadContacts(), loadStats()]);
    setLoading(false);
  };

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([loadCampaign(), loadContacts(meta.page), loadStats()]);
    setRefreshing(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    loadContacts(1);
  }, [filterStatus, search]);

  // Auto-refresh every 5 seconds if campaign is running
  useEffect(() => {
    if (campaign?.status === 'RUNNING') {
      const interval = setInterval(refresh, 5000);
      return () => clearInterval(interval);
    }
  }, [campaign?.status]);

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

  const handleResume = async () => {
    try {
      await campaignsApi.resumePending(id!);
      toast.success('Campaign resumed');
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resume');
    }
  };

  const toggleSelectContact = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const selectAllFailed = () => {
    const failedIds = contacts.filter((c) => c.status === 'FAILED').map((c) => c.contactId);
    setSelectedContacts(failedIds);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-white dark:bg-gray-950 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/campaigns')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{campaign?.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                campaign?.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                campaign?.status === 'RUNNING' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                campaign?.status === 'FAILED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {campaign?.status}
              </span>
              {campaign?.status === 'RUNNING' && (
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  Sending...
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {(stats?.pending || 0) > 0 && campaign?.status !== 'RUNNING' && (
            <button
              onClick={handleResume}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all active:scale-95"
            >
              <Play className="w-4 h-4" />
              Resume ({stats?.pending} pending)
            </button>
          )}

          {(stats?.failed || 0) > 0 && (
            <button
              onClick={handleRetryFailed}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 shadow-md transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Failed ({selectedContacts.length || stats?.failed})
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <StatCard
            label="Total"
            value={stats.totalContacts}
            icon={Users}
            color="bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300 border border-gray-200 dark:border-gray-800"
          />
          <StatCard
            label="Pending"
            value={stats.pending + stats.queued}
            icon={Clock}
            color="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/10 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-900/30"
          />
          <StatCard
            label="Sent"
            value={stats.sent}
            icon={Send}
            color="bg-blue-50 text-blue-700 dark:bg-blue-900/10 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30"
          />
          <StatCard
            label="Delivered"
            value={stats.delivered}
            icon={CheckCircle}
            color="bg-green-50 text-green-700 dark:bg-green-900/10 dark:text-green-400 border border-green-100 dark:border-green-900/30"
          />
          <StatCard
            label="Read"
            value={stats.read}
            icon={Eye}
            color="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30"
          />
          <StatCard
            label="Failed"
            value={stats.failed}
            icon={XCircle}
            color="bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400 border border-red-100 dark:border-red-900/30"
            onClick={() => setFilterStatus('FAILED')}
          />
          <StatCard
            label="Success Rate"
            value={`${stats.successRate}%`}
            icon={BarChart2}
            color="bg-purple-50 text-purple-700 dark:bg-purple-900/10 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30"
          />
        </div>
      )}

      {/* Failure Reasons */}
      {stats && stats.failureReasons.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/50 rounded-xl p-6 mb-8 shadow-sm">
          <h3 className="font-bold text-red-600 dark:text-red-500 flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5" />
            Failure Reasons
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stats.failureReasons.map((fr, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-800"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate flex-1">
                  {fr.reason}
                </span>
                <span className="text-sm font-bold text-red-600 dark:text-red-500 ml-3 shrink-0">
                  {fr.count} contacts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex-1 min-w-[260px] max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by phone or name..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-gray-400"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="SENT">Sent</option>
          <option value="DELIVERED">Delivered</option>
          <option value="READ">Read</option>
          <option value="FAILED">Failed</option>
        </select>

        {filterStatus === 'FAILED' && (
          <button
            onClick={selectAllFailed}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Select All Failed
          </button>
        )}

        {selectedContacts.length > 0 && (
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {selectedContacts.length} selected
          </span>
        )}
      </div>

      {/* Contacts Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedContacts.length === contacts.length && contacts.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedContacts(contacts.map((c) => c.contactId));
                      } else {
                        setSelectedContacts([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sent</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Delivered</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Read</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {contacts.map((contact) => {
                const config = statusConfig[contact.status] || statusConfig.PENDING;
                const StatusIcon = config.icon;

                return (
                  <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.contactId)}
                        onChange={() => toggleSelectContact(contact.contactId)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{contact.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 font-mono mt-0.5">{contact.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${config.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {contact.sentAt ? new Date(contact.sentAt).toLocaleTimeString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {contact.deliveredAt ? new Date(contact.deliveredAt).toLocaleTimeString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {contact.readAt ? new Date(contact.readAt).toLocaleTimeString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {contact.failureReason && (
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded leading-tight" title={contact.failureReason}>
                            {contact.failureReason}
                          </span>
                          {contact.retryCount > 0 && (
                            <span className="text-[10px] text-gray-400 font-medium">
                              Retry Attempt: {contact.retryCount}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {contacts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                       <Search className="w-10 h-10 text-gray-300 dark:text-gray-700 mb-2" />
                       <p className="text-gray-500 dark:text-gray-400 font-medium">No contacts match your criteria</p>
                       <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your filters or search query</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Page {meta.page} of {meta.totalPages} <span className="mx-1">•</span> {meta.total} contacts total
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => loadContacts(meta.page - 1)}
                disabled={meta.page <= 1}
                className="px-4 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => loadContacts(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
                className="px-4 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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

// StatCard Component
const StatCard: React.FC<{
  label: string;
  value: number | string;
  icon: any;
  color: string;
  onClick?: () => void;
}> = ({ label, value, icon: Icon, color, onClick }) => (
  <div
    onClick={onClick}
    className={`p-5 rounded-xl transition-all ${color} ${onClick ? 'cursor-pointer hover:shadow-md active:scale-95' : 'shadow-sm'}`}
  >
    <div className="flex items-start justify-between">
      <div>
        <span className="text-2xl font-black block">{value}</span>
        <p className="text-[11px] font-bold uppercase tracking-wider mt-1.5 opacity-70 whitespace-nowrap">{label}</p>
      </div>
      <div className="p-2 bg-white/10 rounded-lg">
        <Icon className="w-5 h-5 opacity-80" />
      </div>
    </div>
  </div>
);

export default CampaignDetails;