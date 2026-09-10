// src/pages/CRM.tsx - Multi-channel CRM dashboard
// Every figure here comes from /crm/stats, /crm/pipelines and /crm/leads.

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, TrendingUp, DollarSign, Target, Plus,
  ArrowUpRight, Loader2, RefreshCw, Flame, Bot, Sparkles
} from 'lucide-react';
import { FaWhatsapp, FaTelegram, FaInstagram } from 'react-icons/fa';
import { crm as crmApi } from '../services/api';
import type { CRMStats, Pipeline, Lead } from '../types/crm';
import toast from 'react-hot-toast';

/** Map a lead's free-text `source` onto a channel bucket. */
const channelOf = (lead: Pick<Lead, 'source' | 'channel' | 'chatbotQualified'>) => {
  const src = (lead.source || lead.channel || '').toLowerCase();
  if (src.includes('instagram')) return 'instagram';
  if (src.includes('telegram')) return 'telegram';
  if (src.includes('ad')) return 'ad';
  if (lead.chatbotQualified || src.includes('chatbot')) return 'chatbot';
  return 'whatsapp';
};

const CRM: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<CRMStats | null>(null);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, pipelinesRes, leadsRes] = await Promise.all([
        crmApi.getStats(),
        crmApi.getPipelines(),
        crmApi.getLeads({ limit: 6 }),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (pipelinesRes.data.success) setPipelines(pipelinesRes.data.data);
      if (leadsRes.data.success) setRecentLeads(leadsRes.data.data);
    } catch {
      toast.error('Failed to load CRM dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await crmApi.syncFromContacts();
      if (res.data.success) {
        toast.success(res.data.message || 'Contacts synced to CRM');
        await loadData();
      }
    } catch {
      toast.error('Failed to sync contacts');
    } finally {
      setSyncing(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(value);

  // Real channel counts, bucketed from the backend's per-source breakdown.
  const bySource = stats?.leadsBySource ?? [];
  const channelCounts = bySource.reduce(
    (acc, row) => {
      const bucket = channelOf({ source: row.source });
      acc[bucket] = (acc[bucket] || 0) + row.count;
      return acc;
    },
    {} as Record<string, number>
  );
  const chatbotCount = stats?.chatbotLeads ?? channelCounts.chatbot ?? 0;

  const getChannelBadge = (lead: Lead) => {
    switch (channelOf(lead)) {
      case 'instagram':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200"><FaInstagram className="w-3 h-3" /> Instagram</span>;
      case 'telegram':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200"><FaTelegram className="w-3 h-3" /> Telegram</span>;
      case 'ad':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">Ad lead</span>;
      case 'chatbot':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200"><Bot className="w-3 h-3" /> Chatbot</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"><FaWhatsapp className="w-3 h-3" /> WhatsApp</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
              Multi-Channel Sales Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">CRM Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Track and convert leads from WhatsApp, Instagram, Telegram &amp; chatbots.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50"
          >
            {syncing ? <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> : <RefreshCw className="w-4 h-4 text-gray-500" />}
            Sync Contacts
          </button>
          <Link to="/dashboard/crm/leads" className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold transition-all">
            All Leads
          </Link>
          <Link
            to="/dashboard/crm/leads/new"
            className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold shadow-md transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" /> New Lead
          </Link>
        </div>
      </div>

      {/* Headline stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative overflow-hidden rounded-2xl border border-blue-100 p-6 bg-white shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-[0.06] text-blue-600 pointer-events-none"><Users size={80} /></div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-blue-700 font-bold mb-1">Total Leads</p>
          <h3 className="text-3xl font-bold text-gray-900">{loading ? '—' : stats?.totalLeads || 0}</h3>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-emerald-600 font-bold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> {stats?.newLeads || 0} new
            </span>
            <span className="text-gray-400 font-mono">Avg score: {stats?.averageScore || 0}</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 p-6 bg-white shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-[0.06] text-emerald-600 pointer-events-none"><DollarSign size={80} /></div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 font-bold mb-1">Pipeline Value</p>
          <h3 className="text-3xl font-bold text-gray-900">{loading ? '—' : formatCurrency(Number(stats?.totalValue) || 0)}</h3>
          <p className="text-xs text-gray-400 mt-3">Active opportunities</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 p-6 bg-white shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-[0.06] text-emerald-600 pointer-events-none"><Target size={80} /></div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 font-bold mb-1">Revenue Won</p>
          <h3 className="text-3xl font-bold text-emerald-600">{loading ? '—' : formatCurrency(Number(stats?.wonValue) || 0)}</h3>
          <p className="text-xs text-gray-500 mt-3 font-semibold">{stats?.wonLeads || 0} deals won</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-purple-100 p-6 bg-white shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-[0.06] text-purple-600 pointer-events-none"><TrendingUp size={80} /></div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-purple-700 font-bold mb-1">Win Rate</p>
          <h3 className="text-3xl font-bold text-gray-900">{loading ? '—' : `${stats?.winRate || 0}%`}</h3>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-red-500 font-bold flex items-center">
              <Flame className="w-3.5 h-3.5 mr-0.5" /> {stats?.hotLeads || 0} hot
            </span>
            <span className="text-gray-400">{stats?.lostLeads || 0} lost</span>
          </div>
        </div>
      </div>

      {/* Channel breakdown — real counts per source */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: 'whatsapp', label: 'WhatsApp', Icon: FaWhatsapp, wrap: 'bg-emerald-50/50 border-emerald-100', chip: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-700' },
          { key: 'instagram', label: 'Instagram', Icon: FaInstagram, wrap: 'bg-pink-50/50 border-pink-100', chip: 'bg-pink-100 text-pink-700', text: 'text-pink-700' },
          { key: 'telegram', label: 'Telegram', Icon: FaTelegram, wrap: 'bg-sky-50/50 border-sky-100', chip: 'bg-sky-100 text-sky-700', text: 'text-sky-700' },
          { key: 'chatbot', label: 'Chatbot', Icon: Bot, wrap: 'bg-purple-50/50 border-purple-100', chip: 'bg-purple-100 text-purple-700', text: 'text-purple-700' },
        ].map(({ key, label, Icon, wrap, chip, text }) => {
          const count = key === 'chatbot' ? chatbotCount : (channelCounts[key] || 0);
          return (
            <Link
              key={key}
              to={`/dashboard/crm/leads?source=${key}`}
              className={`p-3.5 rounded-2xl border flex items-center gap-3 hover:shadow-sm transition-all ${wrap}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${chip}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className={`text-[10px] uppercase font-bold block ${text}`}>{label}</span>
                <span className="text-sm font-bold text-gray-900">
                  {loading ? '—' : `${count} lead${count === 1 ? '' : 's'}`}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pipelines + recent leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Active Pipelines</h2>
            <Link to="/dashboard/crm/leads?tab=pipeline" className="text-xs font-bold text-emerald-600 hover:underline">
              Open board →
            </Link>
          </div>

          <div className="p-4 space-y-3 flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-emerald-600 animate-spin" /></div>
            ) : pipelines.length > 0 ? (
              pipelines.map((pipeline) => (
                <Link
                  key={pipeline.id}
                  to={`/dashboard/crm/leads?pipelineId=${pipeline.id}&tab=pipeline`}
                  className="block p-4 bg-gray-50/60 border border-gray-200/80 rounded-xl hover:bg-emerald-50/20 hover:border-emerald-300 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-gray-900">{pipeline.name}</h3>
                    <span className="text-xs font-mono font-bold text-gray-500">{pipeline._count?.leads || 0} leads</span>
                  </div>

                  <div className="flex gap-1 my-2">
                    {pipeline.stages.map((stage) => (
                      <div
                        key={stage.id}
                        className="flex-1 h-2 rounded-full"
                        style={{ backgroundColor: stage.color }}
                        title={`${stage.name} (${stage.probability}%)`}
                      />
                    ))}
                  </div>

                  <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                    <span>{pipeline.stages[0]?.name}</span>
                    <span>{pipeline.stages[pipeline.stages.length - 1]?.name}</span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center py-8 text-xs text-gray-400">No pipelines found</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Recent Leads</h2>
            <Link to="/dashboard/crm/leads" className="text-xs font-bold text-emerald-600 hover:underline">View all</Link>
          </div>

          <div className="divide-y divide-gray-100 flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-emerald-600 animate-spin" /></div>
            ) : recentLeads.length > 0 ? (
              recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => navigate(`/dashboard/crm/leads/${lead.id}`)}
                  className="p-3.5 hover:bg-gray-50/60 transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-bold text-gray-900 truncate">{lead.title}</p>
                      {getChannelBadge(lead)}
                    </div>
                    <p className="text-[11px] text-gray-500 truncate">
                      {lead.contact?.firstName
                        ? `${lead.contact.firstName} ${lead.contact.lastName || ''}`
                        : lead.contact?.phone || 'No contact'}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className="px-2 py-0.5 text-[9px] font-bold rounded-full block mb-1"
                      style={{ backgroundColor: (lead.stage?.color || '#10b981') + '20', color: lead.stage?.color || '#10b981' }}
                    >
                      {lead.stage?.name || 'New'}
                    </span>
                    {lead.value ? (
                      <span className="text-[10px] font-bold text-gray-700 font-mono">{formatCurrency(lead.value)}</span>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 p-4">
                <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-700">No leads yet</p>
                <button onClick={handleSync} className="mt-3 text-xs text-emerald-600 font-bold hover:underline">
                  Sync contacts now →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRM;
