// src/pages/admin/AdminDashboard.tsx

import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  MessageSquare,
  CreditCard,
  Activity,
  Smartphone,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock,
  Ban,
  Loader2,
  AlertCircle,
  RefreshCw,
  BarChart3,
  UserPlus,
  Wallet,
  XCircle
} from 'lucide-react';
import { admin } from '../../services/api';
import { formatINR } from '../../utils/currency';
import { Link } from 'react-router-dom';
import WhatsAppConnectionStats from '../../components/admin/WhatsAppConnectionStats';
import PageSkeleton from '../../components/common/PageSkeleton';

// ============================================
// TYPES
// ============================================
interface DashboardStats {
  users: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    newThisMonth: number;
    todayUsers: number;
  };
  organizations: {
    total: number;
    byPlan: Record<string, number>;
    newThisMonth: number;
  };
  messages: {
    totalSent: number;
    todaySent: number;
    thisMonthSent: number;
  };
  revenue: {
    totalRevenue: number;
    monthlyRevenue: number;
    todayRevenue: number;
    mrr: number;
    arr: number;
  };
  whatsapp: {
    connectedAccounts: number;
    totalContacts: number;
    totalCampaigns: number;
  };
  wallet?: {
    totalActiveWallets: number;
    pendingRequests: number;
    totalBalanceHeld: number;
  };
}

// ============================================
// STAT CARD COMPONENT
// ============================================
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  link?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title, value, change, changeLabel, icon: Icon, iconBg, iconColor, link
}) => {
  const CardWrapper = link ? Link : 'div';
  const wrapperProps = link ? { to: link } : {};

  return (
    <CardWrapper
      {...wrapperProps as any}
      className={`bg-[#0a0e27] rounded-2xl border border-white/[0.1] p-6 ${link ? 'hover:shadow-lg hover:border-white/[0.12] transition-all cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">
            {/* ✅ FIXED: Safe toLocaleString */}
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? (
                <ArrowUpRight className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-1" />
              )}
              <span>{Math.abs(change)}% {changeLabel || 'vs last month'}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </CardWrapper>
  );
};

// ============================================
// USER STATUS BREAKDOWN COMPONENT
// ============================================
interface StatusBreakdownProps {
  stats: DashboardStats['users'];
}

const UserStatusBreakdown: React.FC<StatusBreakdownProps> = ({ stats }) => {
  const statuses = [
    { label: 'Active', value: stats.active || 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Pending', value: stats.pending || 0, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'Suspended', value: stats.suspended || 0, icon: Ban, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  const total = stats.total || 0;

  return (
    <div className="bg-[#0a0e27] rounded-2xl border border-white/[0.1] p-6">
      <h3 className="text-lg font-semibold text-white mb-4">User Status Breakdown</h3>
      <div className="space-y-4">
        {statuses.map((status) => (
          <div key={status.label} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${status.bg}`}>
                <status.icon className={`w-4 h-4 ${status.color}`} />
              </div>
              <span className="text-gray-300 font-medium">{status.label}</span>
            </div>
            <div className="flex items-center space-x-3">
              {/* ✅ FIXED: Safe toLocaleString */}
              <span className="text-2xl font-bold text-white">
                {(status.value || 0).toLocaleString()}
              </span>
              <span className="text-sm text-gray-400">
                ({total > 0 ? Math.round((status.value / total) * 100) : 0}%)
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-6 h-3 bg-[#0a0e27]/[0.04] rounded-full overflow-hidden flex">
        <div
          className="bg-green-500 transition-all"
          style={{ width: `${total > 0 ? ((stats.active || 0) / total) * 100 : 0}%` }}
        />
        <div
          className="bg-yellow-500 transition-all"
          style={{ width: `${total > 0 ? ((stats.pending || 0) / total) * 100 : 0}%` }}
        />
        <div
          className="bg-red-500 transition-all"
          style={{ width: `${total > 0 ? ((stats.suspended || 0) / total) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
};

// ============================================
// PLAN DISTRIBUTION COMPONENT
// ============================================
interface PlanDistributionProps {
  byPlan: Record<string, number>;
  total: number;
}

const PlanDistribution: React.FC<PlanDistributionProps> = ({ byPlan, total }) => {
  const planConfig: Record<string, { color: string; bg: string }> = {
    FREE: { color: 'text-gray-400', bg: 'bg-[#050816]0' },
    STARTER: { color: 'text-blue-600', bg: 'bg-blue-500' },
    PRO: { color: 'text-purple-600', bg: 'bg-purple-500' },
    ENTERPRISE: { color: 'text-orange-600', bg: 'bg-orange-500' },
  };

  // ✅ FIXED: Handle empty byPlan object
  const plans = Object.entries(byPlan || {}).map(([type, count]) => ({
    type,
    count: count || 0,
    percentage: total > 0 ? Math.round(((count || 0) / total) * 100) : 0,
    ...planConfig[type] || { color: 'text-gray-400', bg: 'bg-[#050816]0' }
  }));

  // ✅ FIXED: Show message if no data
  if (plans.length === 0) {
    return (
      <div className="bg-[#0a0e27] rounded-2xl border border-white/[0.1] p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Organizations by Plan</h3>
        <div className="text-center py-8 text-gray-500">
          <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No organizations yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0e27] rounded-2xl border border-white/[0.1] p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Organizations by Plan</h3>
      <div className="space-y-4">
        {plans.map((plan) => (
          <div key={plan.type}>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-medium ${plan.color}`}>{plan.type}</span>
              {/* ✅ FIXED: Safe toLocaleString */}
              <span className="text-white font-bold">
                {(plan.count || 0).toLocaleString()}
              </span>
            </div>
            <div className="h-2 bg-[#0a0e27]/[0.04] rounded-full overflow-hidden">
              <div
                className={`h-full ${plan.bg} transition-all`}
                style={{ width: `${plan.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// QUICK STATS COMPONENT
// ============================================
interface QuickStatsProps {
  whatsapp: DashboardStats['whatsapp'];
  messages: DashboardStats['messages'];
}

const QuickStats: React.FC<QuickStatsProps> = ({ whatsapp, messages }) => {
  const stats = [
    { label: 'Connected WhatsApp', value: whatsapp.connectedAccounts || 0, icon: Smartphone },
    { label: 'Total Contacts', value: whatsapp.totalContacts || 0, icon: Users },
    { label: 'Total Campaigns', value: whatsapp.totalCampaigns || 0, icon: MessageSquare },
    { label: "Today's Messages", value: messages.todaySent || 0, icon: Activity },
  ];

  return (
    <div className="bg-[#0a0e27] rounded-2xl border border-white/[0.1] p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Platform Overview</h3>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#050816] rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <stat.icon className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
            </div>
            {/* ✅ FIXED: Safe toLocaleString */}
            <p className="text-2xl font-bold text-white">
              {(stat.value || 0).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// WALLET REQUESTS WIDGET
// ============================================
const WalletRequestsWidget: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await admin.getWalletRequests({ status: 'pending', limit: 5 });
      const data = res.data?.data;
      setRequests(data?.requests || []);
    } catch (err) {
      console.error('Failed to fetch wallet requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleReview = async (
    requestId: string,
    action: 'approve' | 'reject'
  ) => {
    setReviewing(requestId);
    try {
      await admin.reviewWalletRequest(requestId, { action });
      // Remove from list
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err: any) {
      console.error('Review failed:', err);
    } finally {
      setReviewing(null);
    }
  };

  return (
    <div className="bg-[#0a0e27] rounded-2xl border border-white/[0.1] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <Wallet className="w-4 h-4 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Wallet Access Requests
          </h3>
          {requests.length > 0 && (
            <span
              className="px-2 py-0.5 bg-red-100 text-red-600
                           text-xs font-bold rounded-full animate-pulse"
            >
              {requests.length} pending
            </span>
          )}
        </div>
        <Link
          to="/admin/wallets"
          className="text-sm text-blue-600 hover:text-blue-700
                     font-medium flex items-center gap-1"
        >
          View All
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div
              key={i}
              className="h-20 bg-[#0a0e27]/[0.04] rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-8">
          <div
            className="w-12 h-12 bg-green-50 rounded-full flex
                          items-center justify-center mx-auto mb-3"
          >
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-gray-500 text-sm font-medium">
            No pending requests
          </p>
          <p className="text-gray-400 text-xs mt-1">
            All wallet requests have been reviewed
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(request => (
            <div
              key={request.id}
              className="border border-white/[0.1] rounded-xl p-4
                           hover:border-white/[0.12] transition-all"
            >
              {/* User & Org Info */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white text-sm">
                      {request.organization?.name || 'Unknown Org'}
                    </p>
                    {/* Plan Badge */}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${request.organization?.planType === 'QUARTERLY' ||
                        request.organization?.planType === 'BIANNUAL' ||
                        request.organization?.planType === 'ANNUAL'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {request.organization?.planType || 'Unknown Plan'}
                    </span>
                    {/* Plan Verified Badge */}
                    {request.planVerified ? (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full
                                     bg-blue-100 text-blue-700 font-medium"
                      >
                        ✓ Plan OK
                      </span>
                    ) : (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full
                                     bg-red-100 text-red-700 font-medium"
                      >
                        ⚠ Plan Issue
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-0.5">
                    {request.user?.email || ''}
                  </p>

                  {/* Reason */}
                  <p
                    className="text-xs text-gray-400 mt-2 bg-[#050816]
                                  rounded-lg p-2 line-clamp-2"
                  >
                    "{request.reason}"
                  </p>

                  {/* Time */}
                  <p className="text-xs text-gray-400 mt-1.5">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {new Date(request.requestedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleReview(request.id, 'approve')}
                  disabled={reviewing === request.id}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700
                             disabled:opacity-50 disabled:cursor-not-allowed
                             text-white text-xs font-semibold rounded-lg
                             transition-all flex items-center justify-center gap-1"
                >
                  {reviewing === request.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3 h-3" />
                  )}
                  Approve
                </button>
                <button
                  onClick={() => handleReview(request.id, 'reject')}
                  disabled={reviewing === request.id}
                  className="flex-1 py-2 bg-red-50 hover:bg-red-100
                             disabled:opacity-50 disabled:cursor-not-allowed
                             text-red-600 text-xs font-semibold rounded-lg
                             transition-all flex items-center justify-center gap-1
                             border border-red-200"
                >
                  <XCircle className="w-3 h-3" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await admin.getDashboard();
      console.log('📊 Dashboard Stats:', response.data);

      const data = response.data?.data || response.data;
      setStats(data);

      // Get admin user from localStorage
      const storedAdmin = localStorage.getItem('wabmeta_admin_user');
      if (storedAdmin) {
        try {
          setAdminUser(JSON.parse(storedAdmin));
        } catch {
          console.warn('Failed to parse admin user');
        }
      }

    } catch (err: any) {
      console.error('❌ Failed to fetch dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Loading State
  if (loading) {
    return <PageSkeleton />;
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Failed to Load Dashboard</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ✅ FIXED: Safe default values with proper fallbacks
  const dashboardStats: DashboardStats = stats || {
    users: {
      total: 0,
      active: 0,
      pending: 0,
      suspended: 0,
      newThisMonth: 0,
      todayUsers: 0
    },
    organizations: {
      total: 0,
      byPlan: {},
      newThisMonth: 0
    },
    messages: {
      totalSent: 0,
      todaySent: 0,
      thisMonthSent: 0
    },
    revenue: {
      totalRevenue: 0,
      monthlyRevenue: 0,
      todayRevenue: 0,
      mrr: 0,
      arr: 0
    },
    whatsapp: {
      connectedAccounts: 0,
      totalContacts: 0,
      totalCampaigns: 0
    },
    wallet: {
      totalActiveWallets: 0,
      pendingRequests: 0,
      totalBalanceHeld: 0
    },
  };

  // ✅ FIXED: Ensure nested values exist
  const safeStats: DashboardStats = {
    users: {
      total: dashboardStats.users?.total ?? 0,
      active: dashboardStats.users?.active ?? 0,
      pending: dashboardStats.users?.pending ?? 0,
      suspended: dashboardStats.users?.suspended ?? 0,
      newThisMonth: dashboardStats.users?.newThisMonth ?? 0,
      todayUsers: dashboardStats.users?.todayUsers ?? 0,
    },
    organizations: {
      total: dashboardStats.organizations?.total ?? 0,
      byPlan: dashboardStats.organizations?.byPlan ?? {},
      newThisMonth: dashboardStats.organizations?.newThisMonth ?? 0,
    },
    messages: {
      totalSent: dashboardStats.messages?.totalSent ?? 0,
      todaySent: dashboardStats.messages?.todaySent ?? 0,
      thisMonthSent: dashboardStats.messages?.thisMonthSent ?? 0,
    },
    revenue: {
      totalRevenue: dashboardStats.revenue?.totalRevenue ?? 0,
      monthlyRevenue: dashboardStats.revenue?.monthlyRevenue ?? 0,
      todayRevenue: dashboardStats.revenue?.todayRevenue ?? 0,
      mrr: dashboardStats.revenue?.mrr ?? 0,
      arr: dashboardStats.revenue?.arr ?? 0,
    },
    whatsapp: {
      connectedAccounts: dashboardStats.whatsapp?.connectedAccounts ?? 0,
      totalContacts: dashboardStats.whatsapp?.totalContacts ?? 0,
      totalCampaigns: dashboardStats.whatsapp?.totalCampaigns ?? 0,
    },
    wallet: {
      totalActiveWallets: dashboardStats.wallet?.totalActiveWallets ?? 0,
      pendingRequests: dashboardStats.wallet?.pendingRequests ?? 0,
      totalBalanceHeld: dashboardStats.wallet?.totalBalanceHeld ?? 0,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {adminUser?.name || 'Admin'}! 👋
          </h1>
          <p className="text-gray-500">Here's what's happening with your platform today.</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-[#0a0e27] border border-white/[0.1] rounded-xl text-gray-300 hover:bg-[#050816] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Users"
          value={safeStats.users.total}
          change={safeStats.users.newThisMonth > 0 ? 12 : undefined}
          changeLabel="new this month"
          icon={Users}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          link="/admin/users"
        />
        <StatCard
          title="New Users Today"
          value={safeStats.users.todayUsers || 0}
          icon={UserPlus}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Organizations"
          value={safeStats.organizations.total}
          change={safeStats.organizations.newThisMonth > 0 ? 8 : undefined}
          changeLabel="new this month"
          icon={Building2}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          link="/admin/subscriptions"
        />
        <StatCard
          title="Messages Sent"
          value={safeStats.messages.thisMonthSent}
          icon={MessageSquare}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatINR(safeStats.revenue.monthlyRevenue / 100)}
          icon={CreditCard}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Status Breakdown */}
        <UserStatusBreakdown stats={safeStats.users} />

        {/* Plan Distribution */}
        <PlanDistribution
          byPlan={safeStats.organizations.byPlan}
          total={safeStats.organizations.total}
        />

        {/* Quick Stats */}
        <QuickStats
          whatsapp={safeStats.whatsapp}
          messages={safeStats.messages}
        />

        {/* WhatsApp Connection Stats */}
        <WhatsAppConnectionStats />
        
        {/* ✅ ADD THIS - Wallet Requests Widget */}
        <WalletRequestsWidget />
        
        {/* ✅ ADD THIS - Wallet Stats Card */}
        {safeStats.wallet && (
          <div className="bg-[#0a0e27] rounded-2xl border border-white/[0.1] p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Wallet className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Wallet Overview
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <p className="text-2xl font-bold text-green-700">
                  {safeStats.wallet.totalActiveWallets}
                </p>
                <p className="text-xs text-gray-500 mt-1">Active Wallets</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-xl">
                <p className="text-2xl font-bold text-yellow-700">
                  {safeStats.wallet.pendingRequests}
                </p>
                <p className="text-xs text-gray-500 mt-1">Pending Requests</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <p className="text-2xl font-bold text-blue-700">
                  ₹{(safeStats.wallet.totalBalanceHeld || 0).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-500 mt-1">Balance Held</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Revenue Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-green-700 to-green-800 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm font-medium">Total Revenue (All Time)</p>
              <p className="text-4xl font-bold mt-2">
                {formatINR(safeStats.revenue.totalRevenue / 100)}
              </p>
              <p className="text-green-200 text-sm mt-2">
                Today: {formatINR(safeStats.revenue.todayRevenue / 100)}
              </p>
            </div>
            <div className="hidden md:block">
              <CreditCard className="w-16 h-16 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Annual Recurring Revenue (ARR)</p>
              <p className="text-4xl font-bold mt-2">
                {formatINR(safeStats.revenue.arr || 0)}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Based on {formatINR(safeStats.revenue.mrr || 0)} MRR
              </p>
            </div>
            <div className="hidden md:block">
              <BarChart3 className="w-20 h-20 text-gray-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#0a0e27] rounded-2xl border border-white/[0.1] p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/admin/users"
            className="flex items-center space-x-3 p-4 bg-[#050816] rounded-xl hover:bg-[#0a0e27]/[0.04] transition-colors"
          >
            <Users className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-300">Manage Users</span>
          </Link>
          <Link
            to="/admin/subscriptions"
            className="flex items-center space-x-3 p-4 bg-[#050816] rounded-xl hover:bg-[#0a0e27]/[0.04] transition-colors"
          >
            <Building2 className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-300">Organizations</span>
          </Link>
          <Link
            to="/admin/plans"
            className="flex items-center space-x-3 p-4 bg-[#050816] rounded-xl hover:bg-[#0a0e27]/[0.04] transition-colors"
          >
            <CreditCard className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-300">Manage Plans</span>
          </Link>
          <Link
            to="/admin/settings"
            className="flex items-center space-x-3 p-4 bg-[#050816] rounded-xl hover:bg-[#0a0e27]/[0.04] transition-colors"
          >
            <Activity className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-gray-300">System Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;