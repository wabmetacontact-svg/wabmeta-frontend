// src/pages/LeadsList.tsx - COMPLETE UPDATED VERSION

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus, Search, LayoutGrid, List, Loader2,
  MoreVertical, Calendar, TrendingUp,
  Zap, Flame, ThumbsUp, Snowflake,
  Bot, Phone, RefreshCw,
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { crm as crmApi } from '../services/api';
import type { Lead, Pipeline } from '../types/crm';
import toast from 'react-hot-toast';
import { CreateLeadModal } from '../components/crm';

// ─── Tab Types ────────────────────────────────────────────
type TabType = 'pipeline' | 'interested';

// ─── Score Badge ──────────────────────────────────────────
const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  if (score >= 70) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
        <Flame className="w-3 h-3" /> Hot {score}
      </span>
    );
  }
  if (score >= 40) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
        <ThumbsUp className="w-3 h-3" /> Warm {score}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
      <Snowflake className="w-3 h-3" /> Cold {score}
    </span>
  );
};

// ─── Interested Lead Card ─────────────────────────────────
const InterestedLeadCard: React.FC<{
  lead: any;
  onClick: () => void;
}> = ({ lead, onClick }) => {
  const contactName =
    lead.contact?.whatsappProfileName ||
    [lead.contact?.firstName, lead.contact?.lastName]
      .filter(Boolean).join(' ') ||
    lead.contact?.phone ||
    'Unknown';

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-4 
                 hover:shadow-md hover:border-green-300 
                 transition-all cursor-pointer group"
    >
      {/* Top Row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">
            {lead.title}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <Phone className="w-3 h-3 text-gray-400" />
            <span className="text-sm text-gray-500">
              {lead.contact?.phone || contactName}
            </span>
          </div>
        </div>
        <ScoreBadge score={(lead as any).score || 0} />
      </div>

      {/* Interest Info */}
      {(lead as any).serviceInterest && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-500">Interested in:</span>
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
            {(lead as any).serviceInterest}
          </span>
        </div>
      )}

      {/* Budget */}
      {(lead as any).budget && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-500">Budget:</span>
          <span className="text-xs font-medium text-gray-700">
            {(lead as any).budget}
          </span>
        </div>
      )}

      {/* Bottom Row */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {/* Source badge */}
          {(lead as any).source === 'whatsapp_ad' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
              📢 Ad Lead
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
              <Bot className="w-3 h-3" /> Chatbot
            </span>
          )}

          {/* Stage */}
          {lead.stage && (
            <span
              className="px-2 py-0.5 text-xs rounded-full font-medium"
              style={{
                backgroundColor: lead.stage.color + '20',
                color: lead.stage.color,
              }}
            >
              {lead.stage.name}
            </span>
          )}
        </div>

        <span className="text-xs text-gray-400">
          {new Date(lead.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short',
          })}
        </span>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────
const LeadsList: React.FC = () => {
  const navigate     = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<TabType>('interested');
  const [viewMode, setViewMode]   = useState<'kanban' | 'list'>('kanban');

  const [pipelines, setPipelines]         = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [leadsByStage, setLeadsByStage]   = useState<Record<string, Lead[]>>({});

  const [interestedLeads, setInterestedLeads] = useState<any[]>([]);
  const [interestedGrouped, setInterestedGrouped] = useState<{
    hot: any[]; warm: any[]; cold: any[];
  }>({ hot: [], warm: [], cold: [] });
  const [interestedTotal, setInterestedTotal] = useState(0);

  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [syncing, setSyncing]   = useState(false);

  // ─────────────────────────────────────────
  useEffect(() => { loadPipelines(); }, []);

  useEffect(() => {
    if (selectedPipeline && activeTab === 'pipeline') loadLeads();
  }, [selectedPipeline, search, activeTab]);

  useEffect(() => {
    if (activeTab === 'interested') loadInterestedLeads();
  }, [activeTab, search]);

  // ─────────────────────────────────────────
  const loadPipelines = async () => {
    try {
      const res = await crmApi.getPipelines();
      if (res.data.success) {
        const pips = res.data.data;
        setPipelines(pips);
        const pipelineId = searchParams.get('pipelineId');
        const selected   = pips.find((p: Pipeline) => p.id === pipelineId) || pips[0];
        setSelectedPipeline(selected);
      }
    } catch {
      toast.error('Failed to load pipelines');
    }
  };

  const loadLeads = async () => {
    if (!selectedPipeline) return;
    setLoading(true);
    try {
      const res = await crmApi.getLeads({
        pipelineId: selectedPipeline.id,
        search:     search || undefined,
        limit:      200,
      });
      if (res.data.success) {
        const grouped: Record<string, Lead[]> = {};
        selectedPipeline.stages.forEach(stage => {
          grouped[stage.id] = [];
        });
        res.data.data.forEach((lead: Lead) => {
          if (lead.stageId && grouped[lead.stageId]) {
            grouped[lead.stageId].push(lead);
          }
        });
        setLeadsByStage(grouped);
      }
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const loadInterestedLeads = async () => {
    setLoading(true);
    try {
      const res = await crmApi.getInterestedLeads({
        search: search || undefined,
        limit:  100,
      });
      if (res.data.success) {
        setInterestedLeads(res.data.data.leads || []);
        setInterestedGrouped(res.data.data.grouped || { hot: [], warm: [], cold: [] });
        setInterestedTotal(res.data.data.meta?.total || 0);
      }
    } catch (err: any) {
      // Fallback: get chatbot leads
      try {
        const fallback = await crmApi.getLeads({
          chatbotQualified: true,
          search: search || undefined,
          limit: 100,
        });
        if (fallback.data.success) {
          const leads = fallback.data.data || [];
          setInterestedLeads(leads);
          setInterestedGrouped({
            hot:  leads.filter((l: any) => l.score >= 70),
            warm: leads.filter((l: any) => l.score >= 40 && l.score < 70),
            cold: leads.filter((l: any) => l.score < 40),
          });
          setInterestedTotal(leads.length);
        }
      } catch {
        toast.error('Failed to load interested leads');
      }
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────
  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await crmApi.syncFromContacts();
      if (res.data.success) {
        toast.success(res.data.message || 'Synced successfully');
        activeTab === 'interested' ? loadInterestedLeads() : loadLeads();
      }
    } catch {
      toast.error('Failed to sync contacts');
    } finally {
      setSyncing(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    const lead = leadsByStage[source.droppableId]?.find(l => l.id === draggableId);
    if (!lead) return;

    const newLeadsByStage = { ...leadsByStage };
    newLeadsByStage[source.droppableId] = newLeadsByStage[source.droppableId]
      .filter(l => l.id !== draggableId);
    const updatedLead = { ...lead, stageId: destination.droppableId };
    newLeadsByStage[destination.droppableId].splice(destination.index, 0, updatedLead);
    setLeadsByStage(newLeadsByStage);

    try {
      await crmApi.updateLead(draggableId, { stageId: destination.droppableId });
      toast.success('Lead moved');
    } catch {
      loadLeads();
      toast.error('Failed to move lead');
    }
  };

  // ─────────────────────────────────────────
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR',
      minimumFractionDigits: 0,
    }).format(value);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-700';
      case 'HIGH':   return 'bg-orange-100 text-orange-700';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
      default:       return 'bg-gray-100 text-gray-600';
    }
  };

  // ─────────────────────────────────────────
  return (
    <div className="h-full flex flex-col">

      {/* ── HEADER ─────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">Leads</h1>

            {/* ✅ Tabs */}
            <div className="flex bg-gray-100 border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('interested')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'interested'
                    ? 'bg-white text-green-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Zap className={`w-4 h-4 ${activeTab === 'interested' ? 'text-green-600' : ''}`} />
                Interested
                {interestedTotal > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-green-600 text-white text-xs rounded-full font-bold">
                    {interestedTotal}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('pipeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'pipeline'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Pipeline
              </button>
            </div>

            {/* Pipeline selector - only in pipeline tab */}
            {activeTab === 'pipeline' && (
              <select
                value={selectedPipeline?.id || ''}
                onChange={e => {
                  const pip = pipelines.find(p => p.id === e.target.value);
                  setSelectedPipeline(pip || null);
                }}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-green-500 focus:outline-none"
              >
                {pipelines.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={
                  activeTab === 'interested'
                    ? 'Search interested leads...'
                    : 'Search leads...'
                }
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-lg text-sm text-gray-800 focus:outline-none"
              />
            </div>

            {/* View toggle - only in pipeline tab */}
            {activeTab === 'pipeline' && (
              <div className="flex bg-gray-100 border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-1.5 rounded transition-all ${
                    viewMode === 'kanban'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Refresh */}
            <button
              onClick={() =>
                activeTab === 'interested' ? loadInterestedLeads() : loadLeads()
              }
              className="p-2 border border-gray-200 text-gray-600 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Sync */}
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 bg-white rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50 transition-colors shadow-sm"
            >
              {syncing
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <TrendingUp className="w-4 h-4 text-gray-500" />
              }
              Sync
            </button>

            {/* Add Lead */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Lead
            </button>
          </div>
        </div>
      </div>

      {/* ── CONTENT ────────────────────────────── */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : activeTab === 'interested' ? (

        /* ══ INTERESTED TAB ══════════════════════ */
        <div className="flex-1 overflow-auto p-6">

          {interestedLeads.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Interested Leads Yet
              </h3>
              <p className="text-gray-500 max-w-md">
                When users interact with your chatbot and show interest
                (clicking pricing, demo, booking buttons), they will
                automatically appear here.
              </p>
              <div className="mt-6 p-4 bg-blue-50 rounded-xl text-left max-w-md">
                <p className="text-sm font-semibold text-blue-800 mb-2">
                  💡 How it works:
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• User clicks "Pricing" → Auto-detected as interested</li>
                  <li>• User clicks "Book Demo" → Auto-detected</li>
                  <li>• User score ≥ 50 → Auto-added to CRM</li>
                  <li>• No manual setup needed!</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Flame className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-700">
                      {interestedGrouped.hot.length}
                    </p>
                    <p className="text-sm text-red-600 font-medium">Hot Leads</p>
                    <p className="text-xs text-red-500">Score ≥ 70</p>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <ThumbsUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-700">
                      {interestedGrouped.warm.length}
                    </p>
                    <p className="text-sm text-orange-600 font-medium">Warm Leads</p>
                    <p className="text-xs text-orange-500">Score 40–69</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Snowflake className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-700">
                      {interestedGrouped.cold.length}
                    </p>
                    <p className="text-sm text-blue-600 font-medium">Cold Leads</p>
                    <p className="text-xs text-blue-500">Score &lt; 40</p>
                  </div>
                </div>
              </div>

              {/* Hot Leads Section */}
              {interestedGrouped.hot.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="w-5 h-5 text-red-500" />
                    <h2 className="text-lg font-bold text-gray-900">
                      🔥 Hot Leads
                    </h2>
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-bold">
                      {interestedGrouped.hot.length}
                    </span>
                    <span className="text-xs text-gray-500">— Contact immediately!</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {interestedGrouped.hot.map(lead => (
                      <InterestedLeadCard
                        key={lead.id}
                        lead={lead}
                        onClick={() => navigate(`/dashboard/crm/leads/${lead.id}`)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Warm Leads Section */}
              {interestedGrouped.warm.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <ThumbsUp className="w-5 h-5 text-orange-500" />
                    <h2 className="text-lg font-bold text-gray-900">
                      👍 Warm Leads
                    </h2>
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-bold">
                      {interestedGrouped.warm.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {interestedGrouped.warm.map(lead => (
                      <InterestedLeadCard
                        key={lead.id}
                        lead={lead}
                        onClick={() => navigate(`/dashboard/crm/leads/${lead.id}`)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Cold Leads Section */}
              {interestedGrouped.cold.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Snowflake className="w-5 h-5 text-blue-500" />
                    <h2 className="text-lg font-bold text-gray-900">
                      ❄️ Cold Leads
                    </h2>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-bold">
                      {interestedGrouped.cold.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {interestedGrouped.cold.map(lead => (
                      <InterestedLeadCard
                        key={lead.id}
                        lead={lead}
                        onClick={() => navigate(`/dashboard/crm/leads/${lead.id}`)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      ) : viewMode === 'kanban' ? (

        /* ══ PIPELINE KANBAN ═════════════════════ */
        <div className="flex-1 overflow-x-auto p-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 h-full min-w-max">
              {selectedPipeline?.stages.map(stage => (
                <div
                  key={stage.id}
                  className="w-80 flex-shrink-0 bg-gray-50/50 border border-gray-200/60 rounded-xl flex flex-col shadow-sm"
                >
                  <div
                    className="p-3 rounded-t-xl flex items-center justify-between border-b border-gray-100"
                    style={{ backgroundColor: stage.color + '15' }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                      <span className="font-semibold text-gray-900">{stage.name}</span>
                      <span className="text-sm text-gray-500">
                        ({leadsByStage[stage.id]?.length || 0})
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{stage.probability}%</span>
                  </div>

                  <Droppable droppableId={stage.id}>
                    {(provided: any, snapshot: any) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-2 space-y-2 overflow-y-auto ${
                          snapshot.isDraggingOver ? 'bg-green-50/30' : ''
                        }`}
                      >
                        {leadsByStage[stage.id]?.map((lead, index) => (
                          <Draggable key={lead.id} draggableId={lead.id} index={index}>
                            {(provided: any, snapshot: any) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => navigate(`/dashboard/crm/leads/${lead.id}`)}
                                className={`bg-white border border-gray-200 rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-all ${
                                  snapshot.isDragging ? 'shadow-lg ring-2 ring-green-500' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-semibold text-gray-900 text-sm">{lead.title}</h4>
                                  <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${getPriorityColor(lead.priority)}`}>
                                    {lead.priority}
                                  </span>
                                </div>

                                {lead.contact && (
                                  <p className="text-sm text-gray-600 mb-2">
                                    {lead.contact.firstName} {lead.contact.lastName}
                                  </p>
                                )}

                                {/* Score badge in kanban */}
                                {(lead as any).score > 0 && (
                                  <div className="mb-2">
                                    <ScoreBadge score={(lead as any).score} />
                                  </div>
                                )}

                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  {lead.value && (
                                    <span className="font-semibold text-green-700">
                                      {formatCurrency(lead.value)}
                                    </span>
                                  )}
                                  {lead.expectedCloseDate && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-gray-400" />
                                      {new Date(lead.expectedCloseDate).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>

      ) : (

        /* ══ LIST VIEW ═══════════════════════════ */
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lead</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stage</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.values(leadsByStage).flat().map(lead => (
                  <tr
                    key={lead.id}
                    onClick={() => navigate(`/dashboard/crm/leads/${lead.id}`)}
                    className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{lead.title}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {lead.contact
                        ? `${lead.contact.firstName || ''} ${lead.contact.lastName || ''}`
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2.5 py-0.5 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor: lead.stage?.color + '20',
                          color: lead.stage?.color,
                        }}
                      >
                        {lead.stage?.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-700">
                      {lead.value ? formatCurrency(lead.value) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${getPriorityColor(lead.priority)}`}>
                        {lead.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Lead Modal */}
      {showCreateModal && (
        <CreateLeadModal
          pipelineId={selectedPipeline?.id}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            activeTab === 'interested' ? loadInterestedLeads() : loadLeads();
          }}
        />
      )}
    </div>
  );
};

export default LeadsList;