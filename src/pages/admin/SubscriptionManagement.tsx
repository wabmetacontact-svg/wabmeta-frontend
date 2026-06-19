import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Settings,
  Loader2,
  Building2,
  Crown,
  Gift,
  XCircle,
} from 'lucide-react';
import { admin } from '../../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

// Components
import AssignPlanModal from '../../components/admin/AssignPlanModal';
import ExtendSubscriptionModal from '../../components/admin/ExtendSubscriptionModal';

// ============================================
// STAT CARD
// ============================================

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'orange' | 'red';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
}) => {
  const colorMap = {
    blue: {
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
    },
    green: {
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-400',
    },
    orange: {
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-400',
    },
    red: {
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-400',
    },
  };

  const cfg = colorMap[color];

  return (
    <div
      className="bg-[#0a0e27] rounded-2xl p-5 border border-white/[0.08]
        hover:border-white/[0.12] transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
            {title}
          </p>
          <p className="text-3xl font-bold text-white mt-2">
            {value.toLocaleString()}
          </p>
        </div>
        <div className={`p-3 rounded-xl ${cfg.iconBg}`}>
          <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
        </div>
      </div>
    </div>
  );
};

// ============================================
// STATUS BADGE
// ============================================

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { bg: string; text: string; border: string }> = {
    ACTIVE: {
      bg: 'bg-green-500/10',
      text: 'text-green-400',
      border: 'border-green-500/20',
    },
    EXPIRED: {
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      border: 'border-red-500/20',
    },
    CANCELLED: {
      bg: 'bg-gray-500/10',
      text: 'text-gray-400',
      border: 'border-gray-500/20',
    },
    PAST_DUE: {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-400',
      border: 'border-yellow-500/20',
    },
  };

  const cfg = config[status?.toUpperCase()] || config.CANCELLED;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold
        rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {status}
    </span>
  );
};

// ============================================
// CONFIRM MODAL
// ============================================

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  confirmText?: string;
  confirmColor?: 'red' | 'orange';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
  confirmText = 'Confirm',
  confirmColor = 'red',
}) => {
  if (!isOpen) return null;

  const colorClass =
    confirmColor === 'red'
      ? 'bg-red-500 hover:bg-red-600'
      : 'bg-orange-500 hover:bg-orange-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div
        className="relative bg-[#0a0e27] border border-white/[0.08]
        rounded-2xl shadow-2xl max-w-md w-full p-6"
      >
        <div className="flex items-start gap-4 mb-5">
          <div
            className="w-12 h-12 bg-red-500/10 border border-red-500/20
            rounded-xl flex items-center justify-center shrink-0"
          >
            <XCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-400 whitespace-pre-line">
              {message}
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-300 bg-white/[0.04]
              hover:bg-white/[0.08] rounded-xl transition-colors
              disabled:opacity-50 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-white rounded-xl transition-colors
              disabled:opacity-50 flex items-center gap-2 text-sm font-medium ${colorClass}`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const SubscriptionManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<
    'all' | 'active' | 'expired' | 'free'
  >('all');

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);

  // Revoke confirm modal
  const [revokeModal, setRevokeModal] = useState<{
    isOpen: boolean;
    org: any;
    loading: boolean;
  }>({ isOpen: false, org: null, loading: false });

  useEffect(() => {
    fetchData();
  }, [page, statusFilter, planFilter, search, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);

      let currentStatus = statusFilter;
      let currentPlanType = planFilter;
      let excludePlanType = undefined;

      if (activeTab === 'active') {
        currentStatus = 'ACTIVE';
        excludePlanType = 'FREE_DEMO';
      } else if (activeTab === 'expired') {
        currentStatus = 'EXPIRED';
      } else if (activeTab === 'free') {
        currentPlanType = 'FREE_DEMO';
      }

      const [subsRes, statsRes] = await Promise.all([
        admin.getSubscriptions({
          page,
          limit: 20,
          status: currentStatus || undefined,
          planType: currentPlanType || undefined,
          excludePlanType,
          search: search || undefined,
        }),
        admin.getSubscriptionStats(),
      ]);

      if (subsRes.data.success) {
        setSubscriptions(subsRes.data.data.subscriptions || []);
        setTotalPages(subsRes.data.data.meta?.totalPages || 1);
      }

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPlan = (org: any) => {
    setSelectedOrg(org);
    setAssignModalOpen(true);
  };

  const handleExtendSubscription = (org: any) => {
    setSelectedOrg(org);
    setExtendModalOpen(true);
  };

  const handleRevokeClick = (org: any) => {
    setRevokeModal({ isOpen: true, org, loading: false });
  };

  const handleRevokeConfirm = async () => {
    if (!revokeModal.org) return;

    setRevokeModal((prev) => ({ ...prev, loading: true }));

    try {
      const response = await admin.revokeSubscription(
        revokeModal.org.organizationId,
        {
          reason: 'Revoked by admin',
          immediate: true,
        }
      );

      if (response.data.success) {
        toast.success('Subscription revoked successfully');
        setRevokeModal({ isOpen: false, org: null, loading: false });
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to revoke subscription');
      setRevokeModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Loading initial state
  if (loading && !subscriptions.length) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-400 mx-auto" />
          <p className="mt-4 text-gray-400 text-sm">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'all', label: 'All Accounts', icon: null },
    { key: 'active', label: 'Active Subscribers', icon: Crown },
    { key: 'expired', label: 'Expired', icon: Clock },
    { key: 'free', label: 'Free / Trial', icon: Gift },
  ];

  return (
    <div className="space-y-6">
      {/* Revoke Confirm Modal */}
      <ConfirmModal
        isOpen={revokeModal.isOpen}
        title="Revoke Subscription"
        message={`Revoke subscription for "${revokeModal.org?.organization?.name}"?\n\nThis will downgrade them to the free plan immediately.`}
        onConfirm={handleRevokeConfirm}
        onCancel={() =>
          setRevokeModal({ isOpen: false, org: null, loading: false })
        }
        loading={revokeModal.loading}
        confirmText="Revoke"
        confirmColor="red"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Subscription Management
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage user subscriptions and plans
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0a0e27]
              border border-white/[0.08] hover:border-white/[0.15]
              hover:bg-white/[0.02] text-gray-300 rounded-xl
              transition-all disabled:opacity-50 text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setAssignModalOpen(true)}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700
              text-white rounded-xl flex items-center gap-2 text-sm font-medium
              transition-colors"
          >
            <Plus className="w-4 h-4" />
            Assign Plan
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Subs"
            value={stats.total}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Active"
            value={stats.active}
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="Expired"
            value={stats.expired}
            icon={Clock}
            color="orange"
          />
          <StatCard
            title="Cancelled"
            value={stats.cancelled}
            icon={Trash2}
            color="red"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-white/[0.06]">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key as any);
                  setPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium
                  border-b-2 transition-all whitespace-nowrap
                  ${
                    isActive
                      ? 'border-primary-500 text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#0a0e27] rounded-2xl border border-white/[0.08] p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <div>
            <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search organizations..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#050816]
                  border border-white/[0.08] rounded-xl text-sm text-white
                  placeholder:text-gray-500 focus:outline-none
                  focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              disabled={activeTab !== 'all'}
              className="w-full px-4 py-2.5 bg-[#050816] border border-white/[0.08]
                rounded-xl text-sm text-gray-300 focus:outline-none
                focus:border-primary-500 disabled:bg-[#050816] disabled:opacity-50"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Plan Type */}
          <div>
            <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
              Plan Type
            </label>
            <select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setPage(1);
              }}
              disabled={activeTab === 'free'}
              className="w-full px-4 py-2.5 bg-[#050816] border border-white/[0.08]
                rounded-xl text-sm text-gray-300 focus:outline-none
                focus:border-primary-500 disabled:bg-[#050816] disabled:opacity-50"
            >
              <option value="">All Plans</option>
              <option value="FREE_DEMO">Free Demo</option>
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">3-Month</option>
              <option value="BIANNUAL">6-Month</option>
              <option value="ANNUAL">1-Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-[#0a0e27] rounded-2xl border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#050816] border-b border-white/[0.06]">
              <tr>
                {[
                  'Organization',
                  'Plan',
                  'Status',
                  'Expires',
                  'Type',
                  'Actions',
                ].map((header, idx) => (
                  <th
                    key={header}
                    className={`px-6 py-4 text-xs font-semibold text-gray-500
                      uppercase tracking-wider ${
                        idx === 5 ? 'text-right' : 'text-left'
                      }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {subscriptions.map((sub) => (
                <tr
                  key={sub.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 bg-gradient-to-br from-blue-500
                          to-blue-700 rounded-xl flex items-center
                          justify-center shrink-0"
                      >
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">
                          {sub.organization?.name || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {sub.organization?.owner?.firstName}{' '}
                          {sub.organization?.owner?.lastName}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">
                          {sub.organization?.owner?.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-white">
                      {sub.plan?.name || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={sub.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">
                      {new Date(sub.currentPeriodEnd).toLocaleDateString(
                        'en-IN'
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {sub.daysRemaining > 0
                        ? `${sub.daysRemaining} days left`
                        : 'Expired'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs ${
                        sub.isManual
                          ? 'text-purple-400 font-medium'
                          : 'text-gray-500'
                      }`}
                    >
                      {sub.isManual ? '👑 Manual' : 'Auto'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleAssignPlan(sub)}
                      className="p-1.5 text-blue-400 hover:text-blue-300
                        hover:bg-blue-500/10 rounded-lg transition-all inline-block"
                      title="Change Plan"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleExtendSubscription(sub)}
                      className="p-1.5 text-green-400 hover:text-green-300
                        hover:bg-green-500/10 rounded-lg transition-all inline-block"
                      title="Extend"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRevokeClick(sub)}
                      className="p-1.5 text-red-400 hover:text-red-300
                        hover:bg-red-500/10 rounded-lg transition-all inline-block"
                      title="Revoke"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/manage-wabmeta-admin/organizations/${sub.organizationId}/features`}
                      className="p-1.5 text-gray-400 hover:text-gray-300
                        hover:bg-white/[0.06] rounded-lg transition-all inline-block"
                      title="Features & Locks"
                    >
                      <Settings className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="px-6 py-4 border-t border-white/[0.06] bg-[#050816]
            flex justify-between items-center"
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm text-gray-300 bg-[#0a0e27]
                border border-white/[0.08] rounded-xl hover:bg-white/[0.02]
                disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm text-gray-300 bg-[#0a0e27]
                border border-white/[0.08] rounded-xl hover:bg-white/[0.02]
                disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AssignPlanModal
        isOpen={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setSelectedOrg(null);
        }}
        onSuccess={fetchData}
        organization={selectedOrg}
      />

      <ExtendSubscriptionModal
        isOpen={extendModalOpen}
        onClose={() => {
          setExtendModalOpen(false);
          setSelectedOrg(null);
        }}
        onSuccess={fetchData}
        subscription={selectedOrg}
      />
    </div>
  );
};

export default SubscriptionManagement;