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
  PENDING: { label: 'Pending', color: 'bg-gray-100 text-gray-600', icon: Clock },
  QUEUED: { label: 'Queued', color: 'bg-blue-100 text-blue-600', icon: Clock },
  SENT: { label: 'Sent', color: 'bg-yellow-100 text-yellow-600', icon: Send },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-600', icon: CheckCircle },
  READ: { label: 'Read', color: 'bg-emerald-100 text-emerald-600', icon: Eye },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-600', icon: XCircle },
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
        setContacts(res.data.data.contacts);
        setMeta(res.data.data.meta);
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
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/campaigns')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{campaign?.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                campaign?.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                campaign?.status === 'RUNNING' ? 'bg-blue-100 text-blue-600' :
                campaign?.status === 'FAILED' ? 'bg-red-100 text-red-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {campaign?.status}
              </span>
              {campaign?.status === 'RUNNING' && (
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
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
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {(stats?.pending || 0) > 0 && campaign?.status !== 'RUNNING' && (
            <button
              onClick={handleResume}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Play className="w-4 h-4" />
              Resume ({stats?.pending} pending)
            </button>
          )}

          {(stats?.failed || 0) > 0 && (
            <button
              onClick={handleRetryFailed}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Failed ({selectedContacts.length || stats?.failed})
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <StatCard
            label="Total"
            value={stats.totalContacts}
            icon={Users}
            color="bg-gray-100 text-gray-600"
          />
          <StatCard
            label="Pending"
            value={stats.pending + stats.queued}
            icon={Clock}
            color="bg-yellow-100 text-yellow-600"
          />
          <StatCard
            label="Sent"
            value={stats.sent}
            icon={Send}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            label="Delivered"
            value={stats.delivered}
            icon={CheckCircle}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            label="Read"
            value={stats.read}
            icon={Eye}
            color="bg-emerald-100 text-emerald-600"
          />
          <StatCard
            label="Failed"
            value={stats.failed}
            icon={XCircle}
            color="bg-red-100 text-red-600"
            onClick={() => setFilterStatus('FAILED')}
          />
          <StatCard
            label="Success Rate"
            value={`${stats.successRate}%`}
            icon={BarChart2}
            color="bg-purple-100 text-purple-600"
          />
        </div>
      )}

      {/* Failure Reasons */}
      {stats && stats.failureReasons.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-red-800 flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" />
            Failure Reasons
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {stats.failureReasons.map((fr, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-white rounded-lg p-3 border border-red-100"
              >
                <span className="text-sm text-gray-700 truncate flex-1">
                  {fr.reason}
                </span>
                <span className="text-sm font-medium text-red-600 ml-2">
                  {fr.count} contacts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex-1 min-w-[200px] max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by phone or name..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="SENT">Sent</option>
          <option value="DELIVERED">Delivered</option>
          <option value="READ">Read</option>
          <option value="FAILED">Failed</option>
        </select>

        {filterStatus === 'FAILED' && (
          <button
            onClick={selectAllFailed}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Select All Failed
          </button>
        )}

        {selectedContacts.length > 0 && (
          <span className="text-sm text-gray-500">
            {selectedContacts.length} selected
          </span>
        )}
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left w-10">
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
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Contact</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Sent</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Delivered</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Read</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Error</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {contacts.map((contact) => {
              const config = statusConfig[contact.status] || statusConfig.PENDING;
              const StatusIcon = config.icon;

              return (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.contactId)}
                      onChange={() => toggleSelectContact(contact.contactId)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.phone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {config.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {contact.sentAt ? new Date(contact.sentAt).toLocaleTimeString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {contact.deliveredAt ? new Date(contact.deliveredAt).toLocaleTimeString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {contact.readAt ? new Date(contact.readAt).toLocaleTimeString() : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {contact.failureReason && (
                      <span className="text-xs text-red-600 max-w-[200px] truncate block" title={contact.failureReason}>
                        {contact.failureReason}
                      </span>
                    )}
                    {contact.retryCount > 0 && (
                      <span className="text-xs text-gray-400">
                        Retry: {contact.retryCount}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}

            {contacts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                  No contacts found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-sm text-gray-500">
              Page {meta.page} of {meta.totalPages} ({meta.total} contacts)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => loadContacts(meta.page - 1)}
                disabled={meta.page <= 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => loadContacts(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
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
    className={`p-4 rounded-xl ${color} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
  >
    <div className="flex items-center justify-between">
      <span className="text-2xl font-bold">{value}</span>
      <Icon className="w-5 h-5 opacity-60" />
    </div>
    <p className="text-sm mt-1 opacity-80">{label}</p>
  </div>
);

export default CampaignDetails;