// src/pages/Campaigns.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  BarChart3,
  Calendar,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Eye,
  Loader2,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { campaigns as campaignsApi } from '../services/api';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import PageSkeleton from '../components/common/PageSkeleton';

// ✅ Safe number helpers
const safeNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

const safeLocaleString = (value: any): string => {
  return safeNumber(value).toLocaleString();
};

interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED';
  totalContacts?: number;
  sentCount?: number;
  deliveredCount?: number;
  readCount?: number;
  failedCount?: number;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  template?: {
    name: string;
  };
}

interface CampaignStats {
  total?: number;
  active?: number;
  scheduled?: number;
  completed?: number;
  totalSent?: number;
  totalDelivered?: number;
}

const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<CampaignStats>({
    total: 0,
    active: 0,
    scheduled: 0,
    completed: 0,
    totalSent: 0,
    totalDelivered: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ✅ NEW: Wallet low balance state
  const [walletBlockData, setWalletBlockData] = useState<{
    balance: number;
    required?: number;
    type?: 'low' | 'insufficient';
  } | null>(null);

  const { socket, isConnected } = useSocket();

  useEffect(() => {
    fetchCampaigns();
    fetchStats();
  }, [statusFilter]);

  // ✅ REAL-TIME UPDATES
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleCampaignUpdate = (data: any) => {
      console.log('📡 [REAL-TIME] Campaign update:', data);

      setCampaigns(prev => prev.map(c =>
        c.id === data.campaignId
          ? { ...c, status: data.status, sentCount: data.sent || c.sentCount }
          : c
      ));

      fetchStats();
    };

    const handleCampaignProgress = (data: any) => {
      setCampaigns(prev => prev.map(c =>
        c.id === data.campaignId
          ? {
            ...c,
            sentCount: data.sent,
            failedCount: data.failed,
            deliveredCount: data.delivered,
            readCount: data.read,
            status: data.status || c.status
          }
          : c
      ));
    };

    const handleCampaignError = (data: any) => {
      console.error('❌ [REAL-TIME] Campaign error:', data);
      toast.error(data.message, { duration: 8000 });
      fetchCampaigns();
      fetchStats();
    };

    socket.on('campaign:update', handleCampaignUpdate);
    socket.on('campaign:progress', handleCampaignProgress);
    socket.on('campaign:error', handleCampaignError);
    socket.on('campaign:completed', (_data) => {
      fetchCampaigns();
      fetchStats();
    });

    return () => {
      socket.off('campaign:update', handleCampaignUpdate);
      socket.off('campaign:progress', handleCampaignProgress);
      socket.off('campaign:error', handleCampaignError);
      socket.off('campaign:completed');
    };
  }, [socket, isConnected]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await campaignsApi.getAll({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined
      });

      if (response.data.success) {
        const campaignsData = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setCampaigns(campaignsData);
      } else {
        throw new Error(response.data.message || 'Failed to load campaigns');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load campaigns');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await campaignsApi.stats();
      if (response.data.success) {
        const statsData = response.data.data || {};
        setStats({
          total: safeNumber(statsData.total),
          active: safeNumber(statsData.active),
          scheduled: safeNumber(statsData.scheduled),
          completed: safeNumber(statsData.completed),
          totalSent: safeNumber(statsData.totalSent),
          totalDelivered: safeNumber(statsData.totalDelivered)
        });
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const handleAction = async (action: 'start' | 'pause' | 'resume' | 'cancel', campaignId: string) => {
    try {
      setActionLoading(campaignId);
      setWalletBlockData(null); // Clear previous warning

      let response;
      switch (action) {
        case 'start':
          response = await campaignsApi.start(campaignId);
          break;
        case 'pause':
          response = await campaignsApi.pause(campaignId);
          break;
        case 'resume':
          response = await campaignsApi.resume(campaignId);
          break;
        case 'cancel':
          response = await campaignsApi.cancel(campaignId);
          break;
      }

      if (response?.data.success) {
        toast.success(`Campaign ${action}ed successfully`);
        fetchCampaigns();
        fetchStats();
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || '';

      // ✅ Wallet balance checks
      if (msg.startsWith('WALLET_LOW_BALANCE::')) {
        const parts = msg.split('::');
        const minReq = parseFloat(parts[1]);
        const balance = parseFloat(parts[2]);
        setWalletBlockData({ balance, required: minReq, type: 'low' });
      } 
      else if (msg.startsWith('WALLET_INSUFFICIENT::')) {
        const parts = msg.split('::');
        const estCost = parseFloat(parts[1]);
        const balance = parseFloat(parts[2]);
        setWalletBlockData({ balance, required: estCost, type: 'insufficient' });
      }
      else {
        toast.error(msg || `Failed to ${action} campaign`);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      setActionLoading(campaignId);
      const response = await campaignsApi.delete(campaignId);

      if (response.data.success) {
        toast.success('Campaign deleted successfully');
        fetchCampaigns();
        fetchStats();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete campaign');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: Campaign['status']) => {
    const badges = {
      DRAFT: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', icon: Clock },
      SCHEDULED: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Calendar },
      RUNNING: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: Play },
      PAUSED: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Pause },
      COMPLETED: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: CheckCircle },
      FAILED: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle }
    };

    const badge = badges[status] || badges.DRAFT;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const getProgress = (campaign: Campaign) => {
    const total = safeNumber(campaign.totalContacts);
    const sent = safeNumber(campaign.sentCount);

    if (total === 0) return 0;
    return Math.min(Math.round((sent / total) * 100), 100);
  };

  if (loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Failed to Load Campaigns
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={fetchCampaigns}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage your broadcast campaigns
          </p>
        </div>
        <Link
          to="/dashboard/campaigns/create"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-5 h-5" />
          New Campaign
        </Link>
      </div>

      {/* ✅ NEW: Dynamic Wallet Balance Warning Banner */}
      {walletBlockData && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200
                        dark:border-red-800 rounded-2xl p-4
                        flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300">

          {/* Icon */}
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40
                          rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>

          {/* Text */}
          <div className="flex-1">
            <p className="font-semibold text-red-700 dark:text-red-400 text-sm">
              Insufficient Wallet Balance
            </p>
            <p className="text-red-600 dark:text-red-500 text-xs mt-0.5">
              Your current wallet balance (₹{walletBlockData.balance.toFixed(2)}) is insufficient to run this campaign. Please add money to your wallet to proceed.
            </p>

            {/* Button */}
            <Link
              to="/dashboard/wallet"
              className="inline-flex items-center gap-1.5 mt-2
                         px-3 py-1.5 bg-red-600 hover:bg-red-700
                         text-white text-xs font-semibold
                         rounded-lg shadow-sm shadow-red-200 transition-all active:scale-95"
            >
              Add Money to Wallet →
            </Link>
          </div>

          {/* Close */}
          <button
            onClick={() => setWalletBlockData(null)}
            className="text-red-400 hover:text-red-600 transition-all p-1"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Campaigns</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {safeNumber(stats.total)}
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Active</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {safeNumber(stats.active)}
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Play className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Messages Sent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {safeLocaleString(stats.totalSent)}
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Send className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Delivered</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {safeLocaleString(stats.totalDelivered)}
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          >
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="RUNNING">Running</option>
            <option value="PAUSED">Paused</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>

          <button
            onClick={fetchCampaigns}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.length > 0 ? (
          campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate max-w-[250px] sm:max-w-none">
                      {campaign.name}
                    </h3>
                    {getStatusBadge(campaign.status)}
                  </div>
                  {campaign.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-1">
                      {campaign.description}
                    </p>
                  )}
                  {campaign.template?.name && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-medium">
                      Template: {campaign.template.name}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 ml-4">
                  <Link
                    to={`/dashboard/campaigns/${campaign.id}`}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </Link>

                  {campaign.status === 'DRAFT' && (
                    <button
                      onClick={() => handleAction('start', campaign.id)}
                      disabled={actionLoading === campaign.id}
                      className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="Start Campaign"
                    >
                      {actionLoading === campaign.id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                      ) : (
                        <Play className="w-5 h-5 text-green-600" />
                      )}
                    </button>
                  )}

                  {campaign.status === 'RUNNING' && (
                    <button
                      onClick={() => handleAction('pause', campaign.id)}
                      disabled={actionLoading === campaign.id}
                      className="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                      title="Pause Campaign"
                    >
                      <Pause className="w-5 h-5 text-yellow-600" />
                    </button>
                  )}

                  {campaign.status === 'PAUSED' && (
                    <button
                      onClick={() => handleAction('resume', campaign.id)}
                      disabled={actionLoading === campaign.id}
                      className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="Resume Campaign"
                    >
                      <Play className="w-5 h-5 text-green-600" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(campaign.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete"
                  >
                    <XCircle className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-500 mb-1">Recipients</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {safeLocaleString(campaign.totalContacts)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-500 mb-1">Sent</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {safeLocaleString(campaign.sentCount)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-500 mb-1">Delivered</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {safeLocaleString(campaign.deliveredCount)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-500 mb-1">Read</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {safeLocaleString(campaign.readCount)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              {(campaign.status === 'RUNNING' || (campaign.sentCount || 0) > 0) && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                    <span className="font-medium">Campaign Progress</span>
                    <span className="font-bold">{getProgress(campaign)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 shadow-inner">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ease-out ${
                        campaign.status === 'COMPLETED' ? 'bg-purple-600' : 'bg-green-500'
                      }`}
                      style={{ width: `${getProgress(campaign)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Meta Info */}
              <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-500 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-3">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Created {formatDistanceToNow(new Date(campaign.createdAt), { addSuffix: true })}
                </span>
                {campaign.scheduledAt && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Scheduled for {new Date(campaign.scheduledAt).toLocaleString()}
                  </span>
                )}
                {campaign.startedAt && (
                  <span className="flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5" />
                    Started {formatDistanceToNow(new Date(campaign.startedAt), { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-16 text-center border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Send className="w-10 h-10 text-gray-300 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No campaigns yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xs mx-auto">
              Create your first campaign to start sending bulk messages and reach your customers.
            </p>
            <Link
              to="/dashboard/campaigns/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-200 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Create Your First Campaign
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Campaigns;