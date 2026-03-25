import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, RefreshCw, RotateCcw, CheckCircle, XCircle,
  Clock, Send, Eye, AlertTriangle, Users, Search,
  Loader2
} from 'lucide-react';
import { campaigns as campaignsApi } from '../services/api';
import toast from 'react-hot-toast';
import { useCampaignRealtime } from '../hooks/useCampaignRealtime';

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
  PENDING: { label: 'Pending', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', icon: Clock },
  QUEUED: { label: 'Queued', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Clock },
  SENT: { label: 'Sent', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: Send },
  DELIVERED: { label: 'Delivered', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: CheckCircle },
  READ: { label: 'Read', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Eye },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
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

  // ✅ Real-time socket integration
  const { progress, isProcessing, contactUpdates } = useCampaignRealtime(id || null);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [campaignRes, statsRes] = await Promise.all([
        campaignsApi.getById(id!),
        campaignsApi.getDetailedStats(id!)
      ]);

      if (campaignRes.data.success) setCampaign(campaignRes.data.data);
      if (statsRes.data.success) setStats(statsRes.data.data);

      await loadContacts(1);
    } catch (err) {
      console.error('Failed to load data');
    } finally {
      setLoading(false);
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
        setContacts(Array.isArray(data) ? data : (data.contacts || []));
        if (data.meta) setMeta(data.meta);
      }
    } catch (err) {
      console.error('Failed to load contacts');
    }
  }, [id, meta.limit, filterStatus, search]);

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([
        campaignsApi.getById(id!).then(res => res.data.success && setCampaign(res.data.data)),
        campaignsApi.getDetailedStats(id!).then(res => res.data.success && setStats(res.data.data)),
        loadContacts(meta.page)
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    loadAll();
  }, [id, loadAll]);

  useEffect(() => {
    loadContacts(1);
  }, [filterStatus, loadContacts]);

  // ✅ Sync socket progress with stats
  useEffect(() => {
    if (progress) {
      setStats(prev => {
        if (!prev) return null;
        return {
          ...prev,
          sent: progress.sent,
          failed: progress.failed,
          delivered: progress.delivered || prev.delivered,
          read: progress.read || prev.read,
          totalContacts: progress.total,
        };
      });
      // Optionally update campaign status if it changed
      if (progress.status && campaign && progress.status !== campaign.status) {
        setCampaign((prev: any) => ({ ...prev, status: progress.status }));
      }
    }
  }, [progress]);

  // ✅ Sync individual contact updates
  useEffect(() => {
    if (contactUpdates.length > 0) {
      const latest = contactUpdates[contactUpdates.length - 1];
      setContacts(prev => prev.map(c => 
        c.contactId === latest.contactId 
          ? { ...c, status: latest.status, waMessageId: latest.messageId || c.waMessageId, failureReason: latest.error || c.failureReason }
          : c
      ));
    }
  }, [contactUpdates]);

  const handleRetryFailed = async () => {
    try {
      const contactIds = selectedContacts.length > 0 ? selectedContacts : undefined;
      await campaignsApi.retryFailed(id!, { contactIds });
      toast.success('Retrying messages...');
      setSelectedContacts([]);
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to retry');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/campaigns')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">{campaign?.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                campaign?.status === 'COMPLETED' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30' :
                campaign?.status === 'RUNNING' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                'bg-gray-100 text-gray-700 dark:bg-gray-800'
              }`}>
                {campaign?.status}
              </span>
              {isProcessing && (
                <span className="flex items-center text-[10px] font-bold text-green-600 dark:text-green-400 animate-pulse tracking-wide italic">
                  <span className="w-1 h-1 bg-green-600 rounded-full mr-1"></span>
                  LIVE UPDATES ACTIVE
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {(stats?.failed || 0) > 0 && (
            <button
              onClick={handleRetryFailed}
              className="flex items-center gap-2 px-5 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 shadow-md active:scale-95 transition-all font-bold text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Failed ({selectedContacts.length || stats?.failed})
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards - Identical to Campaigns.tsx layout */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            label="Total Attempts"
            value={stats.sent + stats.failed}
            icon={Users}
            iconBg="bg-blue-50 dark:bg-blue-900/20"
            iconColor="text-blue-600 dark:text-blue-400"
            onClick={() => setFilterStatus('all')}
          />
          <StatCard
            label="Pending"
            value={stats.pending + stats.queued}
            icon={Clock}
            iconBg="bg-gray-50 dark:bg-gray-800"
            iconColor="text-gray-500"
            onClick={() => setFilterStatus('PENDING')}
          />
          <StatCard
            label="Messages Sent"
            value={stats.sent}
            icon={Send}
            iconBg="bg-purple-50 dark:bg-purple-900/20"
            iconColor="text-purple-600 dark:text-purple-400"
            onClick={() => setFilterStatus('SENT')}
          />
          <StatCard
            label="Delivered"
            value={stats.delivered}
            icon={CheckCircle}
            iconBg="bg-green-50 dark:bg-green-900/20"
            iconColor="text-green-600 dark:text-green-400"
            onClick={() => setFilterStatus('DELIVERED')}
          />
          <StatCard
            label="Read"
            value={stats.read}
            icon={Eye}
            iconBg="bg-blue-50 dark:bg-blue-900/20"
            iconColor="text-blue-600 dark:text-blue-400"
            onClick={() => setFilterStatus('READ')}
          />
          <StatCard
            label="Failed"
            value={stats.failed}
            icon={XCircle}
            iconBg="bg-red-50 dark:bg-red-900/20"
            iconColor="text-red-600 dark:text-red-400"
            onClick={() => setFilterStatus('FAILED')}
          />
        </div>
      )}

      {/* Failure Analysis */}
      {stats && stats.failureReasons.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Failure Analysis
          </h3>
          <div className="space-y-2">
            {stats.failureReasons.map((fr, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-red-50/10 dark:bg-red-900/5 rounded-xl p-4 border border-red-100/20 dark:border-red-900/10"
              >
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{fr.reason}</span>
                <span className="text-sm font-black text-red-600 dark:text-red-500 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">{fr.count} contacts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters - Identical to Campaigns.tsx style */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="SENT">Sent</option>
            <option value="DELIVERED">Delivered</option>
            <option value="READ">Read</option>
            <option value="FAILED">Failed</option>
          </select>

          <button
            onClick={() => loadContacts(1)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
          >
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Contacts Table Section Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Recipient Contacts <span className="text-gray-400 text-sm font-medium ml-2">({meta.total.toLocaleString()} total)</span>
          </h2>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedContacts.length === contacts.length && contacts.length > 0}
                    onChange={(e) => setSelectedContacts(e.target.checked ? contacts.map(c => c.contactId) : [])}
                    className="rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500"
                  />
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Error Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {contacts.map((contact) => {
                const config = statusConfig[contact.status] || statusConfig.PENDING;
                const Icon = config.icon;
                return (
                  <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.contactId)}
                        onChange={() => {
                          setSelectedContacts(prev => prev.includes(contact.contactId) ? prev.filter(id => id !== contact.contactId) : [...prev, contact.contactId]);
                        }}
                        className="rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 dark:text-gray-100">{contact.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400 font-mono tracking-tighter">{contact.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${config.color}`}>
                        <Icon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-4 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                          {contact.sentAt && (
                             <div className="flex flex-col"><span className="text-[8px] uppercase opacity-60">Sent</span><span className="tracking-tight">{new Date(contact.sentAt).toLocaleTimeString()}</span></div>
                          )}
                          {contact.deliveredAt && (
                             <div className="flex flex-col"><span className="text-[8px] uppercase opacity-60">Delv</span><span className="tracking-tight">{new Date(contact.deliveredAt).toLocaleTimeString()}</span></div>
                          )}
                          {contact.readAt && (
                             <div className="flex flex-col"><span className="text-[8px] uppercase opacity-60">Read</span><span className="tracking-tight">{new Date(contact.readAt).toLocaleTimeString()}</span></div>
                          )}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {contact.failureReason && (
                        <div className="inline-block px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold ring-1 ring-red-100 dark:ring-red-900/30 shadow-sm">
                          {contact.failureReason}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {contacts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No contacts found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Perfectly matched StatCard component
const StatCard: React.FC<{
  label: string;
  value: number;
  icon: any;
  iconBg: string;
  iconColor: string;
  onClick?: () => void;
}> = ({ label, value, icon: Icon, iconBg, iconColor, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-shadow ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
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