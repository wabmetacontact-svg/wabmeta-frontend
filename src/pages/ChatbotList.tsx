// src/pages/ChatbotList.tsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bot, Plus, Search, MoreVertical, Play, Pause, Copy, Trash2,
  Loader2, Settings, Zap
} from 'lucide-react';
import { chatbots as chatbotsApi } from '../services/api';
import type { Chatbot } from '../types/chatbot';
import toast from 'react-hot-toast';
import PageSkeleton from '../components/common/PageSkeleton';

const ChatbotList: React.FC = () => {
  const navigate = useNavigate();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadChatbots();
  }, []);

  const loadChatbots = async () => {
    setLoading(true);
    try {
      const res = await chatbotsApi.getAll();
      if (res.data.success) {
        setChatbots(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load chatbots');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (chatbot: Chatbot) => {
    try {
      if (chatbot.status === 'ACTIVE') {
        await chatbotsApi.deactivate(chatbot.id);
        toast.success('Chatbot paused');
      } else {
        await chatbotsApi.activate(chatbot.id);
        toast.success('Chatbot activated! 🚀');
      }
      loadChatbots();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDuplicate = async (chatbot: Chatbot) => {
    const newName = prompt('Enter name for duplicated chatbot:', `${chatbot.name} (Copy)`);
    if (!newName) return;

    try {
      await chatbotsApi.duplicate(chatbot.id, newName);
      toast.success('Chatbot duplicated');
      loadChatbots();
    } catch (err) {
      toast.error('Failed to duplicate');
    }
  };

  const handleDelete = async (chatbot: Chatbot) => {
    if (!confirm(`Delete "${chatbot.name}"?`)) return;

    try {
      await chatbotsApi.delete(chatbot.id);
      toast.success('Chatbot deleted');
      loadChatbots();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'PAUSED':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-500 border border-gray-200';
    }
  };

  const filteredChatbots = chatbots.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chatbots</h1>
          <p className="text-gray-600">Build and manage automated conversation flows</p>
        </div>
        <Link
          to="/dashboard/chatbots/new"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Chatbot
        </Link>
      </div>

      {/* How it works - Quick Guide */}
      <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-blue-700 mb-2">🚀 Chatbot Setup Guide:</p>
        <div className="flex items-center gap-2 text-xs text-blue-600 flex-wrap">
          <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-blue-200">
            1️⃣ Create Chatbot
          </span>
          <span className="text-blue-400">→</span>
          <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-blue-200">
            2️⃣ Add nodes in the Flow Builder
          </span>
          <span className="text-blue-400">→</span>
          <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-blue-200">
            3️⃣ Set Keywords in Settings
          </span>
          <span className="text-blue-400">→</span>
          <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-blue-200">
            4️⃣ Save → Activate ✅
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search chatbots..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-500 transition-colors shadow-sm"
        />
      </div>

      {/* Chatbots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChatbots.map((chatbot) => (
          <div
            key={chatbot.id}
            className="relative overflow-hidden rounded-2xl border border-gray-200 p-5 bg-white transition-all duration-200 group hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(16, 185, 129, 0.03) 0%, transparent 60%)' }} />
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{chatbot.name}</h3>
                  <span className={`inline-block px-2 py-0.5 mt-0.5 text-xs rounded-full font-medium ${getStatusBadge(chatbot.status)}`}>
                    {chatbot.status}
                  </span>
                </div>
              </div>

              <div className="relative group">
                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-200 py-1 hidden group-hover:block z-20">
                  <button
                    onClick={() => navigate(`/dashboard/chatbots/${chatbot.id}`)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 text-gray-700"
                  >
                    <Settings className="w-4 h-4" />
                    Edit Flow
                  </button>
                  <button
                    onClick={() => handleToggleStatus(chatbot)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 text-gray-700"
                  >
                    {chatbot.status === 'ACTIVE' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {chatbot.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDuplicate(chatbot)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 text-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => handleDelete(chatbot)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {chatbot.description && (
              <p className="text-sm text-gray-650 mb-3 line-clamp-2 relative z-10">{chatbot.description}</p>
            )}

            <div className="space-y-2 relative z-10">
              {chatbot.triggerKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {chatbot.triggerKeywords.slice(0, 3).map((keyword, i) => (
                    <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">
                      {keyword}
                    </span>
                  ))}
                  {chatbot.triggerKeywords.length > 3 && (
                    <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded border border-gray-100">
                      +{chatbot.triggerKeywords.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {chatbot.isDefault && (
                <div className="flex items-center gap-1 text-xs text-green-700 font-medium">
                  <Zap className="w-3 h-3 text-green-600" />
                  Default for new conversations
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 relative z-10">
              <span className="text-xs text-gray-500">
                {chatbot.flowData?.nodes?.length || 0} nodes
              </span>
              <button
                onClick={() => navigate(`/dashboard/chatbots/${chatbot.id}`)}
                className="text-sm text-green-700 hover:text-green-800 font-semibold"
              >
                Edit Flow →
              </button>
            </div>

            {/* ✅ Setup hint for DRAFT chatbots */}
            {chatbot.status === 'DRAFT' && (
              <div className="mt-2 px-2 py-1.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 font-medium relative z-10">
                ⚠️ Build your flow → Set keywords → Activate
              </div>
            )}
          </div>
        ))}

        {filteredChatbots.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <Bot className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No chatbots yet</h3>
            <p className="text-gray-650 mb-4">Create your first chatbot and start automating conversations</p>
            <Link
              to="/dashboard/chatbots/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Chatbot
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotList;