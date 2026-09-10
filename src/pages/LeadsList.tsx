// src/pages/LeadsList.tsx - Multi-channel Kanban + chatbot-lead views

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus, Search, Loader2, Flame, ThumbsUp, Snowflake,
  Bot, RefreshCw, Filter, Users
} from 'lucide-react';
import { FaWhatsapp, FaTelegram, FaInstagram } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { crm as crmApi } from '../services/api';
import type { Lead, Pipeline } from '../types/crm';
import toast from 'react-hot-toast';
import { CreateLeadModal } from '../components/crm';
import ErrorState from '../components/common/ErrorState';

type TabType = 'pipeline' | 'interested';

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  if (score >= 70) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">
        <Flame className="w-3 h-3" /> Hot {score}
      </span>
    );
  }
  if (score >= 40) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full">
        <ThumbsUp className="w-3 h-3" /> Warm {score}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">
      <Snowflake className="w-3 h-3" /> Cold {score}
    </span>
  );
};

const ChannelBadge: React.FC<{ lead: Lead }> = ({ lead }) => {
  const src = (lead.source || lead.channel || '').toLowerCase();
  if (src.includes('instagram')) return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100"><FaInstagram className="w-3 h-3" /> Instagram</span>;
  if (src.includes('telegram')) return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100"><FaTelegram className="w-3 h-3" /> Telegram</span>;
  if (src.includes('ad')) return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Ad</span>;
  if (lead.chatbotQualified || src.includes('chatbot')) return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100"><Bot className="w-3 h-3" /> Chatbot</span>;
  return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100"><FaWhatsapp className="w-3 h-3" /> WhatsApp</span>;
};

const InterestedLeadCard: React.FC<{ lead: Lead; onClick: () => void }> = ({ lead, onClick }) => {
  const contactName =
    lead.contact?.whatsappProfileName ||
    [lead.contact?.firstName, lead.contact?.lastName].filter(Boolean).join(' ') ||
    lead.contact?.phone || 'Unknown';

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-xs text-gray-900 truncate">{lead.title}</h4>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{lead.contact?.phone || contactName}</p>
        </div>
        <ScoreBadge score={lead.score || 0} />
      </div>

      <div className="flex items-center gap-2 flex-wrap text-xs">
        <ChannelBadge lead={lead} />
        {lead.serviceInterest && (
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-100">
            {lead.serviceInterest}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[10px] text-gray-400">
        <span>{lead.stage?.name || 'New lead'}</span>
        <span>{new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
      </div>
    </div>
  );
};

const LeadsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<TabType>(
    searchParams.get('tab') === 'pipeline' ? 'pipeline' : 'interested'
  );
  // A ?source= link from the dashboard pre-selects the channel filter.
  const [channelFilter, setChannelFilter] = useState<string>(
    (searchParams.get('source') || 'ALL').toUpperCase()
  );

  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [leadsByStage, setLeadsByStage] = useState<Record<string, Lead[]>>({});

  const [interestedLeads, setInterestedLeads] = useState<Lead[]>([]);
  const [interestedGrouped, setInterestedGrouped] = useState<{ hot: Lead[]; warm: Lead[]; cold: Lead[] }>({ hot: [], warm: [], cold: [] });
  const [interestedTotal, setInterestedTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const loadPipelines = useCallback(async () => {
    try {
      const res = await crmApi.getPipelines();
      if (res.data.success) {
        const pips = res.data.data;
        const pipelineId = searchParams.get('pipelineId');
        const selected = pips.find((p: Pipeline) => p.id === pipelineId) || pips[0];
        setSelectedPipeline(selected);
      }
    } catch {
      toast.error('Failed to load pipelines');
    }
  }, [searchParams]);

  const loadLeads = useCallback(async () => {
    if (!selectedPipeline) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await crmApi.getLeads({
        pipelineId: selectedPipeline.id,
        search: search || undefined,
        source: channelFilter !== 'ALL' ? channelFilter.toLowerCase() : undefined,
        limit: 200,
      });
      if (res.data.success) {
        const grouped: Record<string, Lead[]> = {};
        selectedPipeline.stages.forEach((stage) => { grouped[stage.id] = []; });
        res.data.data.forEach((lead: Lead) => {
          if (lead.stageId && grouped[lead.stageId]) grouped[lead.stageId].push(lead);
        });
        setLeadsByStage(grouped);
      }
    } catch {
      setLoadError('Could not load the pipeline board.');
    } finally {
      setLoading(false);
    }
  }, [selectedPipeline, search, channelFilter]);

  const loadInterestedLeads = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await crmApi.getInterestedLeads({ search: search || undefined, limit: 100 });
      if (res.data.success) {
        setInterestedLeads(res.data.data.leads || []);
        setInterestedGrouped(res.data.data.grouped || { hot: [], warm: [], cold: [] });
        setInterestedTotal(res.data.data.meta?.total || 0);
      }
    } catch {
      setLoadError('Could not fetch chatbot leads.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { loadPipelines(); }, [loadPipelines]);

  useEffect(() => {
    if (selectedPipeline && activeTab === 'pipeline') loadLeads();
  }, [selectedPipeline, activeTab, loadLeads]);

  useEffect(() => {
    if (activeTab === 'interested') loadInterestedLeads();
  }, [activeTab, loadInterestedLeads]);

  const reload = () => (activeTab === 'interested' ? loadInterestedLeads() : loadLeads());

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await crmApi.syncFromContacts();
      if (res.data.success) {
        toast.success(res.data.message || 'Synced successfully');
        reload();
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
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const lead = leadsByStage[source.droppableId]?.find((l) => l.id === draggableId);
    if (!lead) return;

    const newLeadsByStage = { ...leadsByStage };
    newLeadsByStage[source.droppableId] = newLeadsByStage[source.droppableId].filter((l) => l.id !== draggableId);
    newLeadsByStage[destination.droppableId].splice(destination.index, 0, { ...lead, stageId: destination.droppableId });
    setLeadsByStage(newLeadsByStage);

    try {
      await crmApi.updateLead(draggableId, { stageId: destination.droppableId });
      toast.success('Lead moved');
    } catch {
      loadLeads();
      toast.error('Failed to move lead');
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(value);

  return (
    <div className="h-full flex flex-col space-y-4">

      {/* Control bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-bold text-gray-900">Leads</h1>

          <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('interested')}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'interested' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500'}`}
            >
              Chatbot Leads
              {interestedTotal > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-emerald-600 text-white rounded-full text-[10px]">{interestedTotal}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'pipeline' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              Pipeline Board
            </button>
          </div>

          {/* Channel filter only affects the pipeline query */}
          {activeTab === 'pipeline' && (
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-2 py-1 rounded-xl text-xs font-bold text-gray-600">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                aria-label="Filter by channel"
                className="bg-transparent outline-none cursor-pointer"
              >
                <option value="ALL">All channels</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="TELEGRAM">Telegram</option>
                <option value="CHATBOT">Chatbot</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-400"
            />
          </div>

          <button onClick={handleSync} disabled={syncing} aria-label="Sync contacts" className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 text-gray-500 ${syncing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-md hover:bg-emerald-700 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* Main view */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : loadError ? (
        <ErrorState message={loadError} onRetry={reload} />
      ) : activeTab === 'interested' ? (

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50/60 border border-red-100 rounded-2xl flex items-center gap-3">
              <Flame className="w-6 h-6 text-red-500" />
              <div>
                <span className="text-xl font-bold text-red-700">{interestedGrouped.hot.length}</span>
                <span className="text-xs text-red-600 font-bold block">Hot leads (score ≥ 70)</span>
              </div>
            </div>
            <div className="p-4 bg-orange-50/60 border border-orange-100 rounded-2xl flex items-center gap-3">
              <ThumbsUp className="w-6 h-6 text-orange-500" />
              <div>
                <span className="text-xl font-bold text-orange-700">{interestedGrouped.warm.length}</span>
                <span className="text-xs text-orange-600 font-bold block">Warm leads (40–69)</span>
              </div>
            </div>
            <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center gap-3">
              <Snowflake className="w-6 h-6 text-blue-500" />
              <div>
                <span className="text-xl font-bold text-blue-700">{interestedGrouped.cold.length}</span>
                <span className="text-xs text-blue-600 font-bold block">Cold leads (&lt; 40)</span>
              </div>
            </div>
          </div>

          {interestedLeads.length === 0 ? (
            <div className="p-16 text-center bg-white border border-dashed border-gray-200 rounded-2xl">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-700">No chatbot leads yet</p>
              <p className="text-xs text-gray-400 mt-1">Leads appear here once the chatbot qualifies a conversation.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {interestedLeads.map((lead) => (
                <InterestedLeadCard key={lead.id} lead={lead} onClick={() => navigate(`/dashboard/crm/leads/${lead.id}`)} />
              ))}
            </div>
          )}
        </div>

      ) : (
        <div className="flex-1 overflow-x-auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 min-w-max h-full">
              {selectedPipeline?.stages.map((stage) => (
                <div key={stage.id} className="w-72 bg-gray-50/70 border border-gray-200 rounded-2xl p-3 flex flex-col">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200/80 mb-3">
                    <span className="text-xs font-bold text-gray-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                      {stage.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded-full border border-gray-200">
                      {leadsByStage[stage.id]?.length || 0}
                    </span>
                  </div>

                  <Droppable droppableId={stage.id}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="flex-1 space-y-2 overflow-y-auto min-h-[40px]">
                        {leadsByStage[stage.id]?.map((lead, index) => (
                          <Draggable key={lead.id} draggableId={lead.id} index={index}>
                            {(dragProvided) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                onClick={() => navigate(`/dashboard/crm/leads/${lead.id}`)}
                                className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-2"
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <h4 className="text-xs font-bold text-gray-900 truncate">{lead.title}</h4>
                                  <ChannelBadge lead={lead} />
                                </div>

                                <p className="text-[11px] text-gray-500">{lead.contact?.phone || 'No phone'}</p>

                                <div className="flex items-center justify-between text-[10px] pt-2 border-t border-gray-50">
                                  <span className="font-bold text-emerald-700">{lead.value ? formatCurrency(lead.value) : '₹0'}</span>
                                  <ScoreBadge score={lead.score || 0} />
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
      )}

      {showCreateModal && (
        <CreateLeadModal
          pipelineId={selectedPipeline?.id}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            reload();
          }}
        />
      )}
    </div>
  );
};

export default LeadsList;
