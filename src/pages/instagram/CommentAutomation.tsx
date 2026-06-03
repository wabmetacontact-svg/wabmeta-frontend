import React from 'react';
import { Heart, Plus, Search, MessageSquare, Send, Tag, MoreVertical, Play, Pause } from 'lucide-react';

const CommentAutomation: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-[#833ab4]" />
            <span className="text-xs font-mono uppercase tracking-wider text-gray-400">Engagement</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Comment Automation</h1>
          <p className="text-sm text-gray-400 mt-1">Manage auto-replies for your posts and reels</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#833ab4] to-[#fd1d1d] text-white text-sm font-semibold shadow-lg">
          <Plus size={18} /> Add Comment Rule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Main List */}
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-4 flex items-center gap-3">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" placeholder="Search by rule name or keyword..." className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#833ab4]" />
             </div>
          </div>

          {/* Rule Card Example */}
          {[
            { name: 'E-book Lead Gen', keyword: 'BOOK', type: 'Reply + DM', status: 'active', hits: 42 },
            { name: 'Generic Support', keyword: 'HELP', type: 'Reply only', status: 'paused', hits: 156 }
          ].map((rule, i) => (
            <div key={i} className="rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-white/15 transition-all p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#833ab4]/20 flex items-center justify-center text-[#833ab4]">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{rule.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-gray-400">KW: {rule.keyword}</span>
                      <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-gray-400">{rule.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-bold text-white">{rule.hits}</p>
                    <p className="text-[9px] text-gray-500">Automations</p>
                  </div>
                  <button className={`p-2 rounded-lg ${rule.status === 'active' ? 'text-green-400 bg-green-400/10' : 'text-gray-400 bg-white/5'}`}>
                    {rule.status === 'active' ? <Play size={14} /> : <Pause size={14} />}
                  </button>
                </div>
              </div>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px]">
                <span className="text-gray-500">Target: All Posts</span>
                <button className="text-[#833ab4] hover:underline font-bold">Edit Settings</button>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Quick Stats & Guide */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-5">
            <h3 className="text-sm font-bold text-white mb-4">Comment Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Total Replies</span>
                <span className="text-xs font-bold text-white">1,204</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#833ab4] h-full" style={{ width: '70%' }}></div>
              </div>
              <p className="text-[10px] text-gray-500">70% of comments were handled by AI</p>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-white/10 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-orange-400" />
              <h4 className="text-xs font-bold text-white">Keyword Tip</h4>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Use short, clear keywords like "INFO", "YES", or "LINK" in your captions. Tell users to comment these for an instant DM!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentAutomation;
