// src/pages/admin/Subscriptions.tsx

import React, { useState, useEffect } from 'react';
import PageSkeleton from '../../components/common/PageSkeleton';
import {
    CreditCard,
    TrendingUp,
    Users,
    DollarSign,
    RefreshCw,
    Loader2,
    AlertCircle,
    CheckCircle,
    XCircle
} from 'lucide-react';

interface SubscriptionStats {
    total: number;
    active: number;
    trial: number;
    cancelled: number;
    mrr: number;
    arr: number;
}

const Subscriptions: React.FC = () => {
    const [stats, setStats] = useState<SubscriptionStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);

        try {
            // This endpoint doesn't exist yet, so we'll use mock data for now
            // const response = await admin.getSubscriptionStats();

            // Mock data for demonstration
            const mockStats: SubscriptionStats = {
                total: 0,
                active: 0,
                trial: 0,
                cancelled: 0,
                mrr: 0,
                arr: 0
            };

            setStats(mockStats);
        } catch (err: any) {
            console.error('❌ Failed to fetch subscription stats:', err);
            setError(err.response?.data?.message || 'Failed to load subscription data');
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
                <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Failed to Load Subscriptions</h3>
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

    const safeStats: SubscriptionStats = stats || {
        total: 0,
        active: 0,
        trial: 0,
        cancelled: 0,
        mrr: 0,
        arr: 0
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
                    <p className="text-gray-500">Manage and monitor all subscriptions</p>
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

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#0a0e27] rounded-2xl border border-white/[0.1] p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Subscriptions</p>
                            <p className="text-3xl font-bold text-white mt-2">
                                {safeStats.total.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-100">
                            <CreditCard className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#0a0e27] rounded-2xl border border-white/[0.1] p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Active</p>
                            <p className="text-3xl font-bold text-white mt-2">
                                {safeStats.active.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-green-100">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#0a0e27] rounded-2xl border border-white/[0.1] p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Trial</p>
                            <p className="text-3xl font-bold text-white mt-2">
                                {safeStats.trial.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-yellow-100">
                            <Users className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#0a0e27] rounded-2xl border border-white/[0.1] p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Cancelled</p>
                            <p className="text-3xl font-bold text-white mt-2">
                                {safeStats.cancelled.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-red-100">
                            <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-primary-100 text-sm font-medium">Monthly Recurring Revenue</p>
                            <p className="text-4xl font-bold mt-2">
                                ${safeStats.mrr.toLocaleString()}
                            </p>
                            <div className="flex items-center mt-2 text-sm text-primary-100">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                <span>vs last month</span>
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-[#0a0e27]/10">
                            <DollarSign className="w-8 h-8" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Annual Recurring Revenue</p>
                            <p className="text-4xl font-bold mt-2">
                                ${safeStats.arr.toLocaleString()}
                            </p>
                            <p className="text-gray-400 text-sm mt-2">
                                Based on ${safeStats.mrr.toLocaleString()} MRR
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-[#0a0e27]/10">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Coming Soon Message */}
            <div className="bg-[#0a0e27] rounded-2xl border border-white/[0.1] p-12 text-center">
                <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Subscription Management</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                    Detailed subscription management features including subscription list, plan changes,
                    billing history, and analytics are coming soon.
                </p>
            </div>
        </div>
    );
};

export default Subscriptions;
