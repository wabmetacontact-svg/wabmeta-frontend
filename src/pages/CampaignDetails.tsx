import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, RefreshCw, Play, RotateCcw, CheckCircle, XCircle,
  Clock, Send, Eye, AlertTriangle, Users, Search,
  Loader2
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  // Consistent card style
  const cardColor = "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 hover:border-gray-300 dark:hover:border-gray-700 transition-all shadow-sm";

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">{campaign?.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest ${
                campaign?.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                campaign?.status === 'RUNNING' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' :
                'bg-gray-100 text-gray-700 dark:bg-gray-800'
              }`}>
                {campaign?.status}
              </span>
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
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg active:scale-95 transition-all font-bold text-sm"
            >
              <Play className="w-4 h-4" />
              Resume Sending
            </button>
          )}

          {(stats?.failed || 0) > 0 && (
            <button
              onClick={handleRetryFailed}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 shadow-lg active:scale-95 transition-all font-bold text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Failed ({selectedContacts.length || stats?.failed})
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards - Simplified to 5 essentials with same color */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard
            label="Total contacts"
            value={stats.totalContacts}
            icon={Users}
            color={cardColor}
          />
          <StatCard
            label="Messages Sent"
            value={stats.sent}
            icon={Send}
            color={cardColor}
          />
          <StatCard
            label="Delivered"
            value={stats.delivered}
            icon={CheckCircle}
            color={cardColor}
          />
          <StatCard
            label="Read"
            value={stats.read}
            icon={Eye}
            color={cardColor}
          />
          <StatCard
            label="Failed"
            value={stats.failed}
            icon={XCircle}
            color="bg-white dark:bg-gray-900 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 font-bold shadow-sm"
            onClick={() => setFilterStatus('FAILED')}
          />
        </div>
      )}

      {/* Failure Reasons - Premium View */}
      {stats && stats.failureReasons.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-8 shadow-sm">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-6">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Failure Analysis
          </h3>
          <div className="space-y-3">
            {stats.failureReasons.map((fr, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-red-50/30 dark:bg-red-900/10 rounded-xl p-4 border border-red-100/50 dark:border-red-900/20"
              >
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  {fr.reason}
                </span>
                <span className="text-sm font-black text-red-600 dark:text-red-500 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">
                  {fr.count} contacts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by phone..."
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-gray-400 shadow-sm"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm font-medium"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="SENT">Sent</option>
          <option value="DELIVERED">Delivered</option>
          <option value="READ">Read</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {/* Contacts View */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedContacts.length === contacts.length && contacts.length > 0}
                    onChange={(e) => setSelectedContacts(e.target.checked ? contacts.map(c => c.contactId) : [])}
                    className="rounded-md border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Error Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {contacts.map((contact) => {
                const config = statusConfig[contact.status] || statusConfig.PENDING;
                return (
                  <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.contactId)}
                        onChange={() => toggleSelectContact(contact.contactId)}
                        className="rounded-md border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 dark:text-gray-100">{contact.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{contact.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${config.color}`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-4 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                          {contact.sentAt && (
                             <div className="flex flex-col">
                               <span className="text-[9px] uppercase tracking-tighter opacity-70">Sent</span>
                               <span>{new Date(contact.sentAt).toLocaleTimeString()}</span>
                             </div>
                          )}
                          {contact.deliveredAt && (
                             <div className="flex flex-col">
                               <span className="text-[9px] uppercase tracking-tighter opacity-70">Delv</span>
                               <span>{new Date(contact.deliveredAt).toLocaleTimeString()}</span>
                             </div>
                          )}
                          {contact.readAt && (
                             <div className="flex flex-col">
                               <span className="text-[9px] uppercase tracking-tighter opacity-70">Read</span>
                               <span>{new Date(contact.readAt).toLocaleTimeString()}</span>
                             </div>
                          )}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {contact.failureReason && (
                        <div className="inline-block px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold shadow-sm shadow-red-500/10">
                          {contact.failureReason}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: any;
  color: string;
  onClick?: () => void;
}> = ({ label, value, icon: Icon, color, onClick }) => (
  <div
    onClick={onClick}
    className={`p-6 rounded-2xl transition-all ${color} ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''}`}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <span className="text-sm font-black opacity-30">#</span>
    </div>
    <div>
      <span className="text-3xl font-black block tracking-tight">{value.toLocaleString()}</span>
      <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-50">{label}</p>
    </div>
  </div>
);

export default CampaignDetails;