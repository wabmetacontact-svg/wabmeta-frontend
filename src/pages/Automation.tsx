// ✅ CREATE: src/pages/Automation.tsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap, Plus, Search, Play, Pause, Trash2,
  Clock, MessageSquare, Users, Webhook, Loader2
} from 'lucide-react';
import { automations as automationsApi } from '../services/api';
import type { Automation } from '../types/automation';
import toast from 'react-hot-toast';
import PageSkeleton from '../components/common/PageSkeleton';

const triggerIcons: Record<string, React.ReactNode> = {
  NEW_CONTACT: <Users className="w-4 h-4" />,
  KEYWORD: <MessageSquare className="w-4 h-4" />,
  SCHEDULE: <Clock className="w-4 h-4" />,
  WEBHOOK: <Webhook className="w-4 h-4" />,
  INACTIVITY: <Clock className="w-4 h-4" />,
  UNKNOWN_MESSAGE: <Users className="w-4 h-4" />,
};

const triggerLabels: Record<string, string> = {
  NEW_CONTACT: 'New Contact',
  KEYWORD: 'Keyword Match',
  SCHEDULE: 'Scheduled',
  WEBHOOK: 'Webhook',
  INACTIVITY: 'Inactivity',
  UNKNOWN_MESSAGE: 'Unknown Message',
};

const AutomationPage: React.FC = () => {
  const navigate = useNavigate();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadAutomations();
  }, []);

  const loadAutomations = async () => {
    setLoading(true);
    try {
      const res = await automationsApi.getAll();
      if (res.data.success) {
        setAutomations(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load automations');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (automation: Automation) => {
    try {
      await automationsApi.toggle(automation.id);
      toast.success(automation.isActive ? 'Automation paused' : 'Automation activated');
      loadAutomations();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (automation: Automation) => {
    if (!confirm(`Delete "${automation.name}"?`)) return;
    try {
      await automationsApi.delete(automation.id);
      toast.success('Automation deleted');
      loadAutomations();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const filteredAutomations = automations.filter(
    (a) => a.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Automations</h1>
          <p className="text-gray-400">Automate your workflows and save time</p>
        </div>
        <Link
          to="/dashboard/automations/new"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-5 h-5" />
          Create Automation
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/[0.05] p-6 group/stat hover:bg-white/[0.04] transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-[0.08] group-hover/stat:scale-110 group-hover/stat:opacity-[0.15] transition-all duration-500">
            <Zap size={80} style={{ color: '#10B981' }} />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <p className="text-xs font-mono uppercase tracking-widest mb-1 text-emerald-500">Active Automations</p>
            <p className="text-3xl font-bold text-white mt-1">
              {automations.filter((a) => a.isActive).length}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/[0.05] p-6 group/stat hover:bg-white/[0.04] transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-[0.08] group-hover/stat:scale-110 group-hover/stat:opacity-[0.15] transition-all duration-500">
            <Play size={80} style={{ color: '#3B82F6' }} />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <p className="text-xs font-mono uppercase tracking-widest mb-1 text-blue-500">Total Executions</p>
            <p className="text-3xl font-bold text-white mt-1">
              {automations.reduce((sum, a) => sum + a.executionCount, 0)}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/[0.05] p-6 group/stat hover:bg-white/[0.04] transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-[0.08] group-hover/stat:scale-110 group-hover/stat:opacity-[0.15] transition-all duration-500">
            <MessageSquare size={80} style={{ color: '#8B5CF6' }} />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <p className="text-xs font-mono uppercase tracking-widest mb-1 text-purple-500">Messages Sent</p>
            <p className="text-3xl font-bold text-white mt-1">-</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search automations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.05] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-white/[0.1] focus:bg-white/[0.05] transition-colors shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
        />
      </div>

      {/* Automations List */}
      <div className="space-y-3">
        {filteredAutomations.map((automation) => (
          <div
            key={automation.id}
            className="bg-white/[0.02] rounded-2xl border border-white/[0.05] p-5 hover:bg-emerald-500/[0.02] hover:shadow-[inset_0_0_0_1px_rgba(16,185,129,0.4)] transition-all duration-200 group/row"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${automation.isActive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-[#0a0e27]/[0.04] dark:bg-gray-700'
                  }`}>
                  <Zap className={`w-6 h-6 ${automation.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{automation.name}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${automation.isActive ? 'bg-green-100 text-green-700' : 'bg-[#0a0e27]/[0.04] text-gray-500'
                      }`}>
                      {automation.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      {triggerIcons[automation.trigger]}
                      {triggerLabels[automation.trigger]}
                    </span>
                    <span>•</span>
                    <span>{automation.actions.length} action(s)</span>
                    <span>•</span>
                    <span>Ran {automation.executionCount} times</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(automation)}
                  className={`p-2 rounded-lg transition-colors ${automation.isActive
                      ? 'text-yellow-600 hover:bg-yellow-50'
                      : 'text-green-600 hover:bg-green-50'
                    }`}
                >
                  {automation.isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => navigate(`/dashboard/automations/${automation.id}`)}
                  className="px-3 py-1.5 text-sm text-gray-400 hover:bg-[#0a0e27]/[0.04] rounded-lg"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(automation)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredAutomations.length === 0 && (
          <div className="text-center py-12 bg-[#0a0e27] rounded-xl border border-white/[0.1]">
            <Zap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No automations yet</h3>
            <p className="text-gray-500 mb-4">Create your first automation to save time</p>
            <Link
              to="/dashboard/automations/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              <Plus className="w-5 h-5" />
              Create Automation
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutomationPage;