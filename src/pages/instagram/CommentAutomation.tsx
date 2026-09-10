// src/pages/instagram/CommentAutomation.tsx
// Auto-reply to Instagram comments (public reply and/or DM). WhatsApp-style UI, IG theme.
// Per-post targeting is done from the Posts & Stories page; rules here apply to all posts.

import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare, Plus, Trash2, Power, Grid,
  Search, Zap, Activity, MessageCircle, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

import { instagram } from '../../services/api';
import { useConfirm } from '../../context/ConfirmContext';
import PageLoader from '../../components/common/PageLoader';
import {
  ChannelHeader, GlassCard, StatCard,
  INSTAGRAM_THEME as TH, primaryBtnStyle
} from '../../components/channel/channelUi';

interface CommentRule {
  id: string;
  name: string;
  keywords: string[];
  postIds: string[];
  action: string;
  commentReply: string | null;
  dmMessage: string | null;
  isActive: boolean;
  triggeredCount: number;
}

// GlassCard hardcodes p-6, which Tailwind won't let `p-0` override, so the
// edge-to-edge list uses the same card styling directly.
const cardShell =
  'relative rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.03)] border border-gray-200 overflow-hidden';

const CommentAutomation: React.FC = () => {
  const confirm = useConfirm();

  const [rules, setRules] = useState<CommentRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [keywords, setKeywords] = useState('');
  const [commentReply, setCommentReply] = useState('');
  const [dmMessage, setDmMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await instagram.getCommentRules();
      setRules(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      toast.error('Could not load comment rules.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentReply.trim() && !dmMessage.trim()) {
      toast.error('Add a public comment reply or a DM message.');
      return;
    }
    setSaving(true);
    try {
      await instagram.createCommentRule({
        keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
        postIds: [], // all posts
        action: commentReply.trim() && dmMessage.trim() ? 'reply_and_dm' : dmMessage.trim() ? 'dm' : 'reply',
        commentReply: commentReply.trim() || undefined,
        dmMessage: dmMessage.trim() || undefined,
      });
      toast.success('Comment rule added successfully!');
      setKeywords(''); setCommentReply(''); setDmMessage('');
      setShowAddForm(false);
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not add that rule.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (rule: CommentRule) => {
    const prev = rules;
    setRules((r) => r.map((x) => (x.id === rule.id ? { ...x, isActive: !x.isActive } : x)));
    try {
      await instagram.toggleCommentRule(rule.id, !rule.isActive);
      toast.success(`Rule ${!rule.isActive ? 'activated' : 'paused'}`);
    } catch {
      setRules(prev);
      toast.error('Could not update that rule.');
    }
  };

  const handleDelete = async (rule: CommentRule) => {
    const ok = await confirm({
      title: 'Delete this comment rule?',
      message: 'This will stop auto-reply and auto-DM triggers for these keywords.',
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    const prev = rules;
    setRules((r) => r.filter((x) => x.id !== rule.id));
    try {
      await instagram.deleteCommentRule(rule.id);
      toast.success('Comment rule deleted');
    } catch {
      setRules(prev);
      toast.error('Could not delete that rule.');
    }
  };

  // Filter logic
  const q = searchQuery.trim().toLowerCase();
  const filteredRules = !q
    ? rules
    : rules.filter((r) =>
        r.keywords.some((k) => k.toLowerCase().includes(q)) ||
        (r.commentReply || '').toLowerCase().includes(q) ||
        (r.dmMessage || '').toLowerCase().includes(q)
      );

  // Stats
  const activeRulesCount = rules.filter((r) => r.isActive).length;
  const totalFired = rules.reduce((acc, r) => acc + (r.triggeredCount || 0), 0);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <ChannelHeader
        theme={TH}
        icon={MessageSquare}
        title="Comment Automation"
        subtitle="Turn comments into conversations. Reply publicly and automatically send DMs to commenters instantly."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold shadow-md hover:-translate-y-0.5 transition-all"
              style={primaryBtnStyle(TH)}
            >
              <Plus className="w-4 h-4" /> {showAddForm ? 'Close Builder' : 'Create Comment Rule'}
            </button>
            <Link to="/instagram/content" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 text-gray-700 text-xs font-bold shadow-sm hover:bg-gray-50 transition-all">
              <Grid className="w-4 h-4" /> Target Specific Post
            </Link>
          </div>
        }
      />

      {/* Stats Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard theme={TH} icon={MessageSquare} label="Total Rules" value={rules.length} hint="Active & paused triggers" />
        <StatCard theme={TH} icon={Zap} label="Active Triggers" value={activeRulesCount} hint="Running on live posts" />
        <StatCard theme={TH} icon={Activity} label="Auto-Replies Fired" value={totalFired} hint="Comments processed successfully" />
      </div>

      {/* Visual Rule Builder Card */}
      {showAddForm && (
        <GlassCard className="border-pink-100 bg-gradient-to-tr from-pink-50/20 via-white to-white">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
            <div className={`w-8 h-8 rounded-lg ${TH.softBg} flex items-center justify-center`}>
              <Zap className={`w-4 h-4 ${TH.iconText}`} />
            </div>
            <h3 className="text-sm font-bold text-gray-900">New Comment Trigger Flow</h3>
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Keywords</label>
                <input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="price, info, link (comma separated)"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-pink-300 transition-all"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Leave empty to auto-reply to any comment.</span>
              </div>

              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Public Comment Reply</label>
                <input
                  value={commentReply}
                  onChange={(e) => setCommentReply(e.target.value)}
                  placeholder="Sent you a DM! Check inbox 📩"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-pink-300 transition-all"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Private Inbox DM</label>
                <textarea
                  value={dmMessage}
                  onChange={(e) => setDmMessage(e.target.value)}
                  rows={1}
                  placeholder="Hi 👋 Here's your exclusive link: ..."
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none resize-none focus:border-pink-300 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white rounded-full shadow-md transition-all disabled:opacity-50"
                style={primaryBtnStyle(TH)}
              >
                <Plus className="w-4 h-4" /> {saving ? 'Creating...' : 'Launch Automation Flow'}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Rules Engine Filter & Search */}
      <div className={cardShell}>
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by keywords or automated message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-pink-300 transition-all"
            />
          </div>
          <span className="text-[10px] font-mono text-gray-400 uppercase font-semibold">
            Showing {filteredRules.length} of {rules.length} rules
          </span>
        </div>

        {/* Rules visual flow container */}
        <div className="divide-y divide-gray-100">
          {filteredRules.length === 0 ? (
            <div className="p-16 text-center">
              <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-600">
                {rules.length === 0 ? 'No comment rules yet.' : 'No comment rules match your search.'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {rules.length === 0
                  ? 'Create a rule above to start auto-replying to comments.'
                  : 'Try a different keyword, or clear the search.'}
              </p>
            </div>
          ) : (
            filteredRules.map((rule) => (
              <div
                key={rule.id}
                className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-gray-50/50 ${rule.isActive ? '' : 'opacity-60 bg-gray-50/30'}`}
              >
                {/* Left: rule trigger definition */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {rule.keywords.length > 0 ? (
                      rule.keywords.map((k) => (
                        <span key={k} className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-pink-100/60 text-pink-700 border border-pink-100/80">
                          #{k}
                        </span>
                      ))
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                        Any Comment
                      </span>
                    )}
                    <span className="text-[9px] text-gray-400 font-mono uppercase bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                      {rule.postIds.length ? `${rule.postIds.length} targeted post` : 'Global rule (all posts)'}
                    </span>
                    {rule.triggeredCount > 0 && (
                      <span className="text-[10px] font-semibold text-gray-500 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-emerald-500" /> Fired {rule.triggeredCount}×
                      </span>
                    )}
                  </div>

                  {/* Flow steps */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs pt-1">
                    {rule.commentReply && (
                      <div className="flex items-center gap-1.5 text-gray-600 bg-white shadow-sm border border-gray-100 px-3 py-1.5 rounded-lg min-w-0">
                        <span className="text-gray-400 flex-shrink-0">💬 Reply:</span>
                        <span className="font-medium italic truncate">"{rule.commentReply}"</span>
                      </div>
                    )}

                    {rule.commentReply && rule.dmMessage && <ArrowRight className="hidden sm:block w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}

                    {rule.dmMessage && (
                      <div className="flex items-center gap-1.5 text-gray-600 bg-gradient-to-r from-pink-50/40 to-transparent shadow-sm border border-pink-100/50 px-3 py-1.5 rounded-lg min-w-0">
                        <span className="text-pink-500 font-bold flex-shrink-0">📩 DM:</span>
                        <span className="font-medium truncate">{rule.dmMessage}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: quick actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                  <button
                    type="button"
                    onClick={() => handleToggle(rule)}
                    title={rule.isActive ? 'Pause rule' : 'Resume rule'}
                    aria-label={rule.isActive ? 'Pause rule' : 'Resume rule'}
                    className={`p-2 rounded-xl border transition-all ${
                      rule.isActive
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                        : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(rule)}
                    aria-label="Delete rule"
                    className="p-2 rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentAutomation;
