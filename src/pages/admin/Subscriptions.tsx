// src/pages/admin/Subscriptions.tsx

import React, { useState, useEffect } from 'react';
import PageSkeleton from '../../components/common/PageSkeleton';
import {
  CreditCard,
  TrendingUp,
  Users,
  DollarSign,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  IndianRupee,
} from 'lucide-react';

interface SubscriptionStats {
  total: number;
  active: number;
  trial: number;
  cancelled: number;
  mrr: number;
  arr: number;
}

// ============================================
// STAT CARD
// ============================================

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'yellow' | 'red';
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  color,
}) => {
  const colorMap = {
    blue: { iconBg: 'bg-blue-500/10', iconColor: 'text-blue-400' },
    green: { iconBg: 'bg-green-500/10', iconColor: 'text-green-400' },
    yellow: { iconBg: 'bg-yellow-500/10', iconColor: 'text-yellow-400' },
    red: { iconBg: 'bg-red-500/10', iconColor: 'text-red-400' },
  };

  const cfg = colorMap[color];

  return (
    <div
      className="bg-[#0a0e27] rounded-2xl border border-white/[0.08] p-5
        hover:border-white/[0.12] transition-colors"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
            {label}
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
// MAIN COMPONENT
// ============================================

const Subscriptions: React.FC = () => {
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      // Mock data for demonstration
      const mockStats: SubscriptionStats = {
        total: 0,
        active: 0,
        trial: 0,
        cancelled: 0,
        mrr: 0,
        arr: 0,
      };

      setStats(mockStats);
    } catch (err: any) {
      console.error('❌ Failed to fetch subscription stats:', err);
      setError(
        err.response?.data?.message || 'Failed to load subscription data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md bg-[#0a0e27] border border-white/[0.08] rounded-2xl p-8">
          <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Failed to Load Subscriptions
          </h3>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white
              rounded-xl transition-colors text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const safeStats: SubscriptionStats = stats || {
    total: 0,
    active: 0,
    trial: 0,
    cancelled: 0,
    mrr: 0,
    arr: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage and monitor all subscriptions
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0a0e27]
            border border-white/[0.08] hover:border-white/[0.15]
            hover:bg-white/[0.02] text-gray-300 rounded-xl
            transition-all disabled:opacity-50 text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Subscriptions"
          value={safeStats.total}
          icon={CreditCard}
          color="blue"
        />
        <StatCard
          label="Active"
          value={safeStats.active}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          label="Trial"
          value={safeStats.trial}
          icon={Users}
          color="yellow"
        />
        <StatCard
          label="Cancelled"
          value={safeStats.cancelled}
          icon={XCircle}
          color="red"
        />
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MRR */}
        <div
          className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900
            rounded-2xl p-6 text-white border border-primary-500/20
            relative overflow-hidden"
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />

          <div className="flex items-center justify-between relative">
            <div>
              <p className="text-primary-100 text-xs font-semibold uppercase tracking-wider">
                Monthly Recurring Revenue
              </p>
              <p className="text-4xl font-bold mt-2 flex items-center gap-1">
                <IndianRupee className="w-7 h-7" />
                {safeStats.mrr.toLocaleString('en-IN')}
              </p>
              <div className="flex items-center mt-2 text-sm text-primary-100">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>vs last month</span>
              </div>
            </div>
            <div className="hidden md:block">
              <DollarSign className="w-16 h-16 text-white/20" />
            </div>
          </div>
        </div>

        {/* ARR */}
        <div
          className="bg-gradient-to-br from-slate-800 via-slate-900 to-black
            rounded-2xl p-6 text-white border border-white/[0.08]
            relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -translate-y-16 translate-x-16" />

          <div className="flex items-center justify-between relative">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                Annual Recurring Revenue
              </p>
              <p className="text-4xl font-bold mt-2 flex items-center gap-1">
                <IndianRupee className="w-7 h-7" />
                {safeStats.arr.toLocaleString('en-IN')}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Based on{' '}
                <span className="font-semibold text-gray-200">
                  ₹{safeStats.mrr.toLocaleString('en-IN')}
                </span>{' '}
                MRR
              </p>
            </div>
            <div className="hidden md:block">
              <TrendingUp className="w-16 h-16 text-white/10" />
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Message */}
      <div
        className="bg-[#0a0e27] rounded-2xl border border-white/[0.08] p-12 text-center"
      >
        <div
          className="w-16 h-16 mx-auto mb-4 bg-white/[0.03] rounded-2xl
          flex items-center justify-center border border-white/[0.06]"
        >
          <CreditCard className="w-7 h-7 text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Subscription Management
        </h3>
        <p className="text-gray-400 max-w-md mx-auto text-sm">
          Detailed subscription management features including subscription
          list, plan changes, billing history, and analytics are coming soon.
        </p>
      </div>
    </div>
  );
};

export default Subscriptions;
