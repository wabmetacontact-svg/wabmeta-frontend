// src/pages/instagram/StoryAutomation.tsx
// Auto-DM when someone mentions your account in a Story, or replies to your Story.

import React, { useCallback, useEffect, useState } from 'react';
import { BookOpen, Plus, Trash2, Power, AtSign, Reply, Zap, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

import { instagram } from '../../services/api';
import { useConfirm } from '../../context/ConfirmContext';
import PageLoader from '../../components/common/PageLoader';
import {
  ChannelHeader, GlassCard, StatCard,
  INSTAGRAM_THEME as TH, primaryBtnStyle
} from '../../components/channel/channelUi';

type Trigger = 'mention' | 'reply';

interface StoryRule {
  id: string;
  name: string;
  triggerType: Trigger;
  dmMessage: string | null;
  isActive: boolean;
  triggeredCount: number;
}

const TRIGGER_LABEL: Record<Trigger, string> = { mention: 'Story Mention', reply: 'Story Reply' };

const StoryAutomation: React.FC = () => {
  const confirm = useConfirm();

  const [rules, setRules] = useState<StoryRule[]>([]);
  const [loading, setLoading] = useState(true);

  const [triggerType, setTriggerType] = useState<Trigger>('mention');
  const [dmMessage, setDmMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await instagram.getStoryRules();
      setRules(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      toast.error('Could not load story automation rules.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dmMessage.trim()) return;
    setSaving(true);
    try {
      await instagram.createStoryRule({ triggerType, dmMessage: dmMessage.trim() });
      toast.success('Story automation rule successfully created!');
      setDmMessage('');
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not add story rule.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (rule: StoryRule) => {
    const prev = rules;
    setRules((r) => r.map((x) => (x.id === rule.id ? { ...x, isActive: !x.isActive } : x)));
    try {
      await instagram.toggleStoryRule(rule.id, !rule.isActive);
      toast.success(`Rule ${!rule.isActive ? 'activated' : 'paused'}`);
    } catch {
      setRules(prev);
      toast.error('Could not update rule state.');
    }
  };

  const handleDelete = async (rule: StoryRule) => {
    const ok = await confirm({
      title: 'Delete this story rule?',
      message: 'This will stop auto-responses when users interact with your Instagram stories.',
      confirmLabel: 'Delete Rule',
      tone: 'danger',
    });
    if (!ok) return;
    const prev = rules;
    setRules((r) => r.filter((x) => x.id !== rule.id));
    try {
      await instagram.deleteStoryRule(rule.id);
      toast.success('Story rule deleted successfully');
    } catch {
      setRules(prev);
      toast.error('Could not delete that rule.');
    }
  };

  if (loading) return <PageLoader />;

  const mentionsHandled = rules
    .filter((r) => r.triggerType === 'mention')
    .reduce((acc, r) => acc + (r.triggeredCount || 0), 0);
  const repliesHandled = rules
    .filter((r) => r.triggerType === 'reply')
    .reduce((acc, r) => acc + (r.triggeredCount || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <ChannelHeader
        theme={TH}
        icon={BookOpen}
        title="Story Automation"
        subtitle="Auto-reply with a DM whenever someone mentions your business account on their Story, or replies to your Story."
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard theme={TH} icon={AtSign} label="Active Story Rules" value={rules.length} hint="Mention + reply triggers" />
        <StatCard theme={TH} icon={Eye} label="Mentions Handled" value={mentionsHandled} hint="Story shoutouts processed" />
        <StatCard theme={TH} icon={Zap} label="Replies Processed" value={repliesHandled} hint="Story replies answered" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

        {/* Builder */}
        <div className="md:col-span-1 space-y-4">
          <GlassCard className="border-pink-100">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Zap className={`w-4 h-4 ${TH.iconText}`} /> Rule Builder
            </h3>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Trigger Event</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['mention', 'reply'] as Trigger[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTriggerType(t)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-[11px] font-semibold gap-2 transition-all ${
                        triggerType === t
                          ? 'border-transparent text-white shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                      style={triggerType === t ? primaryBtnStyle(TH) : undefined}
                    >
                      {t === 'mention' ? <AtSign className="w-4 h-4" /> : <Reply className="w-4 h-4" />}
                      {TRIGGER_LABEL[t]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Action DM</label>
                <textarea
                  value={dmMessage}
                  onChange={(e) => setDmMessage(e.target.value)}
                  placeholder="Hey! Thanks for tagging us! 😍 Grab your coupon: GIFT10"
                  rows={4}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 outline-none resize-none focus:border-pink-300 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={saving || !dmMessage.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white rounded-full shadow-md hover:-translate-y-0.5 disabled:opacity-50 transition-all"
                style={primaryBtnStyle(TH)}
              >
                <Plus className="w-4 h-4" /> {saving ? 'Saving...' : 'Add Story Rule'}
              </button>
            </form>
          </GlassCard>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-500/5 to-purple-500/5 border border-pink-100 text-xs space-y-2">
            <span className="font-bold text-pink-700 block">⚡ Pro tip</span>
            <p className="text-gray-500 leading-relaxed">
              Stories disappear after 24 hours. Story-mention automation captures the lead into your unified inbox
              immediately, so the conversation continues even after the story expires.
            </p>
          </div>
        </div>

        {/* Rules list */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Story Flows</h4>
            <span className="text-[10px] bg-pink-100 text-pink-800 font-mono font-bold px-2 py-0.5 rounded-full border border-pink-200">
              {rules.length} flow{rules.length === 1 ? '' : 's'}
            </span>
          </div>

          {rules.length === 0 ? (
            <GlassCard className="border-dashed text-center">
              <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-600">No story flows configured.</p>
              <p className="text-xs text-gray-400 mt-1">Add a trigger from the builder panel on the left.</p>
            </GlassCard>
          ) : (
            rules.map((rule) => (
              <GlassCard
                key={rule.id}
                className={`hover:border-gray-300 transition-all ${rule.isActive ? '' : 'opacity-60 bg-gray-50/50'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${TH.softBg} border ${TH.softBorder} flex items-center justify-center flex-shrink-0`}>
                    {rule.triggerType === 'reply'
                      ? <Reply className={`w-4 h-4 ${TH.iconText}`} />
                      : <AtSign className={`w-4 h-4 ${TH.iconText}`} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase ${TH.pill}`}>
                        {TRIGGER_LABEL[rule.triggerType]}
                      </span>
                      {rule.triggeredCount > 0 && (
                        <span className="text-[10px] font-mono font-bold text-gray-400">
                          · Fired {rule.triggeredCount} times
                        </span>
                      )}
                    </div>

                    <div className="mt-2 text-xs text-gray-700 bg-gray-50 border border-gray-100 rounded-xl p-3 pr-20 relative leading-relaxed break-words">
                      <span className="absolute top-0 right-0 text-[10px] font-bold text-pink-500 uppercase tracking-wider px-2 py-0.5 bg-pink-50 rounded-tr-xl rounded-bl-xl">
                        AUTO-DM
                      </span>
                      {rule.dmMessage}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggle(rule)}
                      aria-label={rule.isActive ? 'Pause rule' : 'Activate rule'}
                      title={rule.isActive ? 'Active — click to pause' : 'Paused — click to activate'}
                      className={`p-1.5 rounded-lg border transition-all ${
                        rule.isActive
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-gray-100 text-gray-400 border-gray-200'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(rule)}
                      aria-label="Delete rule"
                      className="p-1.5 rounded-lg bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryAutomation;
