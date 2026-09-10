// src/pages/telegram/TelegramAutomation.tsx
// Command / keyword / fallback auto-replies for Telegram bots, with inline buttons.

import React, { useCallback, useEffect, useState } from 'react';
import {
  Zap, Plus, Trash2, Power, Search, Terminal,
  Hash, CornerDownRight, ExternalLink, Link2, MessageSquare, Play, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

import { telegram } from '../../services/api';
import { useConfirm } from '../../context/ConfirmContext';
import PageLoader from '../../components/common/PageLoader';
import {
  ChannelHeader, GlassCard, StatCard,
  TELEGRAM_THEME as TH, primaryBtnStyle
} from '../../components/channel/channelUi';
import {
  TG, TRIGGER_LABEL,
  type AutomationRow, type ButtonDef, type TriggerType, type MatchType,
} from './telegramShared';

// GlassCard hardcodes p-6, which Tailwind won't let `p-0` override, so the
// edge-to-edge list uses the same card styling directly.
const cardShell =
  'relative rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.03)] border border-gray-200 overflow-hidden';

const TelegramAutomation: React.FC = () => {
  const confirm = useConfirm();

  const [automations, setAutomations] = useState<AutomationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'COMMAND' | 'KEYWORD' | 'FALLBACK'>('ALL');
  const [showBuilder, setShowBuilder] = useState(false);

  // Form state
  const [triggerType, setTriggerType] = useState<TriggerType>('COMMAND');
  const [pattern, setPattern] = useState('');
  const [matchType, setMatchType] = useState<MatchType>('contains');
  const [responseText, setResponseText] = useState('');
  const [buttons, setButtons] = useState<ButtonDef[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await telegram.getAutomations();
      setAutomations(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      toast.error('Could not load Telegram automations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim()) {
      toast.error('Please enter a response message.');
      return;
    }
    if (triggerType !== 'FALLBACK' && !pattern.trim()) {
      toast.error(triggerType === 'COMMAND' ? 'Enter a command like /start' : 'Enter a keyword');
      return;
    }
    setSaving(true);
    try {
      const validButtons = buttons
        .map((b) => ({ ...b, text: b.text.trim(), value: b.value.trim() }))
        .filter((b) => b.text && b.value);

      const cleanPattern = triggerType === 'COMMAND'
        ? (pattern.trim().startsWith('/') ? pattern.trim() : `/${pattern.trim()}`)
        : pattern.trim();

      const name = triggerType === 'FALLBACK'
        ? 'Fallback Auto-Reply'
        : `${TRIGGER_LABEL[triggerType]}: ${cleanPattern}`;

      await telegram.createAutomation({
        name,
        triggerType,
        pattern: triggerType === 'FALLBACK' ? undefined : cleanPattern,
        matchType,
        responseText: responseText.trim(),
        buttons: validButtons.length ? validButtons : undefined,
      });

      toast.success('Auto-reply created successfully!');
      setPattern('');
      setResponseText('');
      setButtons([]);
      setShowBuilder(false);
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not add that rule.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (rule: AutomationRow) => {
    const previous = automations;
    setAutomations((prev) => prev.map((r) => (r.id === rule.id ? { ...r, isActive: !r.isActive } : r)));
    try {
      await telegram.toggleAutomation(rule.id, !rule.isActive);
      toast.success(`Rule ${!rule.isActive ? 'activated' : 'paused'}`);
    } catch {
      setAutomations(previous);
      toast.error('Could not update that rule.');
    }
  };

  const handleDelete = async (rule: AutomationRow) => {
    const ok = await confirm({
      title: 'Delete this auto-reply?',
      message: `Rule "${rule.name}" will be deleted permanently.`,
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    const previous = automations;
    setAutomations((prev) => prev.filter((r) => r.id !== rule.id));
    try {
      await telegram.deleteAutomation(rule.id);
      toast.success('Auto-reply deleted');
    } catch {
      setAutomations(previous);
      toast.error('Could not delete that rule.');
    }
  };

  // Filter
  const q = searchQuery.trim().toLowerCase();
  const filteredAutomations = automations.filter((rule) => {
    const matchesTab = activeTab === 'ALL' || rule.triggerType === activeTab;
    if (!matchesTab) return false;
    if (!q) return true;
    return (
      (rule.name || '').toLowerCase().includes(q) ||
      (rule.pattern || '').toLowerCase().includes(q) ||
      (rule.responseText || '').toLowerCase().includes(q)
    );
  });

  // Stats
  const totalFired = automations.reduce((acc, r) => acc + (r.triggerCount || 0), 0);
  const activeCount = automations.filter((r) => r.isActive).length;

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <ChannelHeader
        theme={TH}
        icon={Zap}
        title="Telegram Auto-Replies"
        subtitle="Configure instant replies for commands (/start, /help), keywords, and fallback messages with interactive inline buttons."
        action={
          <button
            onClick={() => setShowBuilder(!showBuilder)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold shadow-md hover:-translate-y-0.5 transition-all"
            style={primaryBtnStyle(TH)}
          >
            <Plus className="w-4 h-4" /> {showBuilder ? 'Close Builder' : 'Create Auto-Reply'}
          </button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard theme={TH} icon={Zap} label="Total Rules" value={automations.length} hint="Configured triggers" />
        <StatCard theme={TH} icon={Play} label="Active" value={activeCount} hint="Currently live" />
        <StatCard theme={TH} icon={Terminal} label="Commands" value={automations.filter((r) => r.triggerType === 'COMMAND').length} hint="/start, /help, etc." />
        <StatCard theme={TH} icon={MessageSquare} label="Total Fired" value={totalFired} hint="Responses triggered" />
      </div>

      {/* Rule builder */}
      {showBuilder && (
        <GlassCard className="border-sky-100 bg-gradient-to-tr from-sky-50/30 via-white to-white">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
            <div className={`w-8 h-8 rounded-lg ${TH.softBg} flex items-center justify-center`}>
              <Sparkles className={`w-4 h-4 ${TH.iconText}`} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">New Auto-Reply Flow</h3>
              <p className="text-[11px] text-gray-400">Commands take priority, followed by keywords, then fallback.</p>
            </div>
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            {/* Trigger type */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Trigger Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { type: 'COMMAND' as TriggerType, icon: Terminal, label: 'Command', hint: 'e.g. /start, /pricing' },
                  { type: 'KEYWORD' as TriggerType, icon: Hash, label: 'Keyword', hint: 'e.g. price, order status' },
                  { type: 'FALLBACK' as TriggerType, icon: CornerDownRight, label: 'Fallback', hint: 'When no rule matches' },
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setTriggerType(item.type)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      triggerType === item.type
                        ? 'border-sky-300 bg-sky-50/60 shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <item.icon className={`w-4 h-4 ${triggerType === item.type ? 'text-sky-600' : 'text-gray-400'}`} />
                      <span className={`text-xs font-bold ${triggerType === item.type ? 'text-sky-900' : 'text-gray-700'}`}>{item.label}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 block truncate">{item.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pattern + match */}
            {triggerType !== 'FALLBACK' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className={triggerType === 'KEYWORD' ? 'md:col-span-2' : 'md:col-span-3'}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    {triggerType === 'COMMAND' ? 'Command Pattern' : 'Trigger Keyword'}
                  </label>
                  <input
                    type="text"
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    placeholder={triggerType === 'COMMAND' ? '/start' : 'price, brochure, help'}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono outline-none focus:border-sky-400 transition-all"
                  />
                </div>
                {triggerType === 'KEYWORD' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Match Condition</label>
                    <select
                      value={matchType}
                      onChange={(e) => setMatchType(e.target.value as MatchType)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-sky-400 transition-all"
                    >
                      <option value="contains">Contains Keyword</option>
                      <option value="exact">Exact Match</option>
                      <option value="starts_with">Starts With</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Response */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Bot Response Text</label>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Hello! Welcome to our Telegram channel. How can we assist you today? 👋"
                rows={3}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none resize-none focus:border-sky-400 transition-all"
              />
            </div>

            {/* Inline buttons */}
            <div className="space-y-2 p-3 bg-gray-50/70 border border-gray-100 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-sky-500" /> Inline Keyboard Buttons (Optional)
                </span>
                <button
                  type="button"
                  onClick={() => setButtons((p) => [...p, { text: '', type: 'callback', value: '' }])}
                  className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Button
                </button>
              </div>

              {buttons.map((btn, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-lg border border-gray-200">
                  <input
                    type="text"
                    value={btn.text}
                    onChange={(e) => setButtons((p) => p.map((b, j) => (j === i ? { ...b, text: e.target.value } : b)))}
                    placeholder="Button Label (e.g. View Plans)"
                    className="flex-1 min-w-[120px] px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none"
                  />
                  <select
                    value={btn.type}
                    onChange={(e) => setButtons((p) => p.map((b, j) => (j === i ? { ...b, type: e.target.value as 'callback' | 'url' } : b)))}
                    className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none"
                  >
                    <option value="callback">Triggers Keyword</option>
                    <option value="url">Opens URL Link</option>
                  </select>
                  <input
                    type="text"
                    value={btn.value}
                    onChange={(e) => setButtons((p) => p.map((b, j) => (j === i ? { ...b, value: e.target.value } : b)))}
                    placeholder={btn.type === 'url' ? 'https://yourwebsite.com' : 'pricing'}
                    className="flex-1 min-w-[130px] px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setButtons((p) => p.filter((_, j) => j !== i))}
                    aria-label="Remove button"
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowBuilder(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !responseText.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white rounded-full shadow-md disabled:opacity-50 transition-all"
                style={primaryBtnStyle(TH)}
              >
                <Plus className="w-4 h-4" /> {saving ? 'Creating Rule...' : 'Save Auto-Reply'}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Rules explorer */}
      <div className={cardShell}>
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search triggers or responses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-sky-300 transition-all"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-xl">
            {(['ALL', 'COMMAND', 'KEYWORD', 'FALLBACK'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab === 'ALL' ? 'All Rules' : tab}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredAutomations.length === 0 ? (
            <div className="p-16 text-center">
              <Zap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-600">
                {automations.length === 0 ? 'No auto-reply rules yet.' : 'No rules match this filter.'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Create a welcome <span className="font-mono text-sky-600">/start</span> command or add keyword triggers.
              </p>
            </div>
          ) : (
            filteredAutomations.map((rule) => (
              <div
                key={rule.id}
                className={`p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-gray-50/50 transition-colors ${rule.isActive ? '' : 'opacity-60 bg-gray-50/30'}`}
              >
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border"
                      style={{ background: TG.blueSoft, color: TG.blueDark, borderColor: TG.blueBorder }}
                    >
                      {TRIGGER_LABEL[rule.triggerType]}
                    </span>
                    {rule.pattern && (
                      <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                        {rule.pattern}
                      </span>
                    )}
                    {rule.triggerType === 'KEYWORD' && (
                      <span className="text-[10px] text-gray-400 font-mono">({rule.matchType})</span>
                    )}
                    {rule.triggerCount > 0 && (
                      <span className="text-[10px] text-gray-500 font-semibold">· Fired {rule.triggerCount}×</span>
                    )}
                  </div>

                  <p className="text-xs text-gray-700 bg-gray-50/80 border border-gray-100 rounded-xl p-3 leading-relaxed whitespace-pre-wrap break-words">
                    {rule.responseText}
                  </p>

                  {Array.isArray(rule.buttons) && rule.buttons.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {rule.buttons.map((b, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white text-sky-700 border border-sky-200 shadow-sm"
                        >
                          {b.type === 'url' ? <ExternalLink className="w-3 h-3 text-sky-500" /> : <CornerDownRight className="w-3 h-3 text-sky-500" />}
                          {b.text}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                  <button
                    type="button"
                    onClick={() => handleToggle(rule)}
                    title={rule.isActive ? 'Active — click to pause' : 'Paused — click to activate'}
                    aria-label={rule.isActive ? 'Pause rule' : 'Activate rule'}
                    className={`p-2 rounded-xl border transition-all ${
                      rule.isActive
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
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

export default TelegramAutomation;
