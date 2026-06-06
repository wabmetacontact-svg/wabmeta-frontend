// ✅ CREATE: src/pages/CRM.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Users, TrendingUp, DollarSign, Target, Plus,
    ArrowUpRight, ArrowDownRight,
    Loader2, ChevronRight
} from 'lucide-react';
import { crm as crmApi } from '../services/api';
import type { CRMStats, Pipeline, Lead } from '../types/crm';
import toast from 'react-hot-toast';
import PageSkeleton from '../components/common/PageSkeleton';

const CRM: React.FC = () => {
    const [stats, setStats] = useState<CRMStats | null>(null);
    const [pipelines, setPipelines] = useState<Pipeline[]>([]);
    const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await crmApi.syncFromContacts();
            if (res.data.success) {
                toast.success(res.data.message || 'Contacts synced successfully');
                loadData();
            }
        } catch (err) {
            toast.error('Failed to sync contacts');
        } finally {
            setSyncing(false);
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [statsRes, pipelinesRes, leadsRes] = await Promise.all([
                crmApi.getStats(),
                crmApi.getPipelines(),
                crmApi.getLeads({ limit: 5 }),
            ]);

            if (statsRes.data.success) setStats(statsRes.data.data);
            if (pipelinesRes.data.success) setPipelines(pipelinesRes.data.data);
            if (leadsRes.data.success) setRecentLeads(leadsRes.data.data);
        } catch (err) {
            toast.error('Failed to load CRM data');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    if (loading) {
    return <PageSkeleton />;
  }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">CRM Dashboard</h1>
                    <p className="text-gray-600">Manage your leads and deals</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/dashboard/crm/leads"
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        View All Leads
                    </Link>
                    <Link
                        to="/dashboard/crm/leads/new"
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        New Lead
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative overflow-hidden rounded-2xl border p-6 group/stat transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md bg-white" style={{ borderColor: '#3B82F633' }}>
                    <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(59, 130, 246, 0.05) 0%, transparent 60%)' }} />
                    <div className="absolute top-0 right-0 p-4 opacity-[0.08] group-hover/stat:scale-110 group-hover/stat:opacity-[0.15] transition-all duration-500">
                        <Users size={80} style={{ color: '#3B82F6' }} />
                    </div>
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: '#3B82F6' }}>Total Leads</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">
                            {stats?.totalLeads || 0}
                        </p>
                        <p className="text-sm text-green-600 mt-2 flex items-center font-medium">
                            <ArrowUpRight className="w-4 h-4 mr-1" />
                            {stats?.newLeads || 0} new this week
                        </p>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border p-6 group/stat transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md bg-white" style={{ borderColor: '#10B98133' }}>
                    <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(16, 185, 129, 0.05) 0%, transparent 60%)' }} />
                    <div className="absolute top-0 right-0 p-4 opacity-[0.08] group-hover/stat:scale-110 group-hover/stat:opacity-[0.15] transition-all duration-500">
                        <DollarSign size={80} style={{ color: '#10B981' }} />
                    </div>
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: '#10B981' }}>Pipeline Value</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">
                            {formatCurrency(Number(stats?.totalValue) || 0)}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">Across all stages</p>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border p-6 group/stat transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md bg-white" style={{ borderColor: '#10B98133' }}>
                    <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(16, 185, 129, 0.05) 0%, transparent 60%)' }} />
                    <div className="absolute top-0 right-0 p-4 opacity-[0.08] group-hover/stat:scale-110 group-hover/stat:opacity-[0.15] transition-all duration-500">
                        <Target size={80} style={{ color: '#10B981' }} />
                    </div>
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: '#10B981' }}>Won Deals</p>
                        <p className="text-3xl font-bold text-green-600 mt-1">
                            {stats?.wonLeads || 0}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            {formatCurrency(Number(stats?.wonValue) || 0)} value
                        </p>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border p-6 group/stat transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md bg-white" style={{ borderColor: '#8B5CF633' }}>
                    <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(139, 92, 246, 0.05) 0%, transparent 60%)' }} />
                    <div className="absolute top-0 right-0 p-4 opacity-[0.08] group-hover/stat:scale-110 group-hover/stat:opacity-[0.15] transition-all duration-500">
                        <TrendingUp size={80} style={{ color: '#8B5CF6' }} />
                    </div>
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: '#8B5CF6' }}>Win Rate</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">
                            {stats?.winRate || 0}%
                        </p>
                        <p className="text-sm text-red-600 mt-2 flex items-center font-medium">
                            <ArrowDownRight className="w-4 h-4 mr-1" />
                            {stats?.lostLeads || 0} lost
                        </p>
                    </div>
                </div>
            </div>

            {/* Pipelines & Recent Leads */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pipelines */}
                <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between relative z-10">
                        <h2 className="text-lg font-semibold text-gray-900">Pipelines</h2>
                        <Link to="/dashboard/crm/pipelines" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                            Manage
                        </Link>
                    </div>
                    <div className="p-4 space-y-4 relative z-10">
                        {pipelines.map((pipeline) => (
                            <Link
                                key={pipeline.id}
                                to={`/dashboard/crm/leads?pipelineId=${pipeline.id}`}
                                className="block p-4 bg-gray-50/50 border border-gray-200 rounded-xl hover:bg-emerald-50/[0.2] hover:border-emerald-300 transition-all duration-200"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-medium text-gray-900">{pipeline.name}</h3>
                                    <span className="text-sm text-gray-500 font-mono">{pipeline._count?.leads || 0} leads</span>
                                </div>
                                <div className="flex gap-1">
                                    {pipeline.stages.map((stage) => (
                                        <div
                                            key={stage.id}
                                            className="flex-1 h-2 rounded-full"
                                            style={{ backgroundColor: stage.color }}
                                            title={stage.name}
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-between mt-2 text-xs text-gray-500">
                                    <span>{pipeline.stages[0]?.name}</span>
                                    <span>{pipeline.stages[pipeline.stages.length - 1]?.name}</span>
                                </div>
                            </Link>
                        ))}

                        {pipelines.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No pipelines created yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Leads */}
                <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between relative z-10">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
                        <Link to="/dashboard/crm/leads" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                            View All
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-100 relative z-10">
                        {recentLeads.map((lead) => (
                            <Link
                                key={lead.id}
                                to={`/dashboard/crm/leads/${lead.id}`}
                                className="block p-4 hover:bg-emerald-50/[0.2] transition-all duration-200"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">{lead.title}</p>
                                        <p className="text-sm text-gray-500">
                                            {lead.contact?.firstName} {lead.contact?.lastName}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span
                                        className="px-2 py-0.5 text-xs rounded-full"
                                        style={{ backgroundColor: lead.stage?.color + '20', color: lead.stage?.color }}
                                    >
                                        {lead.stage?.name}
                                    </span>
                                    {lead.value && (
                                        <span className="text-sm text-gray-500">
                                            {formatCurrency(lead.value)}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}

                        {recentLeads.length === 0 && (
                            <div className="text-center py-12 px-4">
                                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <h3 className="text-gray-900 font-medium">No leads yet</h3>
                                <p className="text-gray-500 text-sm mt-1 mb-4">
                                    You haven't added any leads to your sales pipeline.
                                </p>
                                <div className="flex flex-col gap-2 max-w-[200px] mx-auto">
                                    <Link
                                        to="/dashboard/crm/leads/new"
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add New Lead
                                    </Link>
                                    <button
                                        onClick={handleSync}
                                        disabled={syncing}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50"
                                    >
                                        {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                                        Sync from Contacts
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CRM;