// ✅ CREATE: src/pages/Automation.tsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap, Plus, Search, Play, Pause, Trash2,
  Clock, MessageSquare, Users, Webhook
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
      // ✅ Optimistic update
      setAutomations(prev => prev.map(a => 
        a.id === automation.id 
          ? { ...a, isActive: !a.isActive }
          : a
      ));
      
      await automationsApi.toggle(automation.id);
      toast.success(automation.isActive ? 'Automation paused' : 'Automation activated');
      
      // ✅ Refresh
      await new Promise(resolve => setTimeout(resolve, 300));
      await loadAutomations();
    } catch (err) {
      await loadAutomations();  // Rollback
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (automation: Automation) => {
    if (!confirm(`Delete "${automation.name}"?`)) return;
    try {
      // ✅ Optimistic
      setAutomations(prev => prev.filter(a => a.id !== automation.id));
      
      await automationsApi.delete(automation.id);
      toast.success('Automation deleted');
      
      // ✅ Refresh
      await new Promise(resolve => setTimeout(resolve, 300));
      await loadAutomations();
    } catch (err) {
      await loadAutomations();  // Rollback
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
          <h1 className="text-2xl font-bold text-gray-900">Automations</h1>
          <p className="text-gray-600">Automate your workflows and save time</p>
        </div>
        <Link
          to="/dashboard/automations/new"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Automation
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-2xl border p-6 bg-white group/stat transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: '#10B98133' }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(16, 185, 129, 0.05) 0%, transparent 60%)' }} />
          <div className="absolute top-0 right-0 p-4 opacity-[0.08] group-hover/stat:scale-110 group-hover/stat:opacity-[0.15] transition-all duration-500">
            <Zap size={80} style={{ color: '#10B981' }} />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <p className="text-xs font-mono uppercase tracking-widest mb-1 text-emerald-600">Active Automations</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {automations.filter((a) => a.isActive).length}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border p-6 bg-white group/stat transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: '#3B82F633' }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(59, 130, 246, 0.05) 0%, transparent 60%)' }} />
          <div className="absolute top-0 right-0 p-4 opacity-[0.08] group-hover/stat:scale-110 group-hover/stat:opacity-[0.15] transition-all duration-500">
            <Play size={80} style={{ color: '#3B82F6' }} />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <p className="text-xs font-mono uppercase tracking-widest mb-1 text-blue-600">Total Executions</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {automations.reduce((sum, a) => sum + a.executionCount, 0)}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border p-6 bg-white group/stat transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: '#8B5CF633' }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(139, 92, 246, 0.05) 0%, transparent 60%)' }} />
          <div className="absolute top-0 right-0 p-4 opacity-[0.08] group-hover/stat:scale-110 group-hover/stat:opacity-[0.15] transition-all duration-500">
            <MessageSquare size={80} style={{ color: '#8B5CF6' }} />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <p className="text-xs font-mono uppercase tracking-widest mb-1 text-purple-600">Messages Sent</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">-</p>
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
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-500 transition-colors shadow-sm"
        />
      </div>

      {/* Automations List */}
      <div className="space-y-3">
        {filteredAutomations.map((automation) => (
          <div
            key={automation.id}
            className="bg-white rounded-2xl border border-gray-200 p-5 hover:bg-emerald-50/[0.2] hover:border-emerald-300 hover:shadow-sm transition-all duration-200 group/row"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${automation.isActive ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                  <Zap className={`w-6 h-6 ${automation.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{automation.name}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${automation.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
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
                  className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(automation)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredAutomations.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
            <Zap className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No automations yet</h3>
            <p className="text-gray-500 mb-4">Create your first automation to save time</p>
            <Link
              to="/dashboard/automations/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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