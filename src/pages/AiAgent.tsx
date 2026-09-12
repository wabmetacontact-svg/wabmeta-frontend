// AI Sales Agent (backend: /api/ai-agent).
//
// The agent replies to WhatsApp messages that no automation or chatbot picked
// up, answers only from the knowledge base below, fills the CRM lead, books
// callbacks and hands the chat to a person when the rules here say so. "Try it"
// runs the real agent in dry-run mode: nothing is saved, nothing is sent.

import React, { useEffect, useRef, useState } from 'react';
import {
  Sparkles, Save, Loader2, Plus, Trash2, Send, Package, HelpCircle,
  UserRound, RotateCcw, Wrench, Pencil, Check, X, AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { aiAgent as aiAgentApi } from '../services/api';
import PageLoader from '../components/common/PageLoader';

type Settings = {
  isEnabled: boolean;
  name: string;
  businessInfo: string;
  instructions: string;
  timezone: string;
  handoffOnRequest: boolean;
  handoffOnComplaint: boolean;
  handoffOnUnknown: boolean;
  handoffDealAbove: number | null;
};

type KnowledgeType = 'PRODUCT' | 'FAQ';

type Item = {
  id: string;
  type: KnowledgeType;
  title: string;
  content: string;
  price: string | number | null;
  currency: string;
};

type ToolCall = { name: string; args: Record<string, any>; result: Record<string, any> };
type ChatMsg = { role: 'user' | 'assistant'; text: string; toolCalls?: ToolCall[]; handoff?: string };

const DEFAULTS: Settings = {
  isEnabled: false,
  name: 'Assistant',
  businessInfo: '',
  instructions: '',
  timezone: 'Asia/Kolkata',
  handoffOnRequest: true,
  handoffOnComplaint: true,
  handoffOnUnknown: true,
  handoffDealAbove: null,
};

const TIMEZONES = ['Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Asia/Jakarta', 'Europe/London', 'America/New_York', 'UTC'];

const TOOL_LABEL: Record<string, string> = {
  save_customer_details: 'Saved customer details',
  update_lead_stage: 'Moved lead stage',
  schedule_callback: 'Booked a callback',
  handoff_to_human: 'Handed to a person',
};

const REASON_LABEL: Record<string, string> = {
  customer_request: 'customer asked for a person',
  complaint: 'complaint',
  unknown_answer: "didn't know the answer",
  high_value: 'high-value deal',
};

const labelCls = 'block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1';
const inputCls =
  'w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500';
const cardCls = 'bg-white rounded-2xl border border-gray-200 p-6 shadow-sm';

const pickSettings = (s: any): Settings => ({
  isEnabled: !!s?.isEnabled,
  name: s?.name ?? DEFAULTS.name,
  businessInfo: s?.businessInfo ?? '',
  instructions: s?.instructions ?? '',
  timezone: s?.timezone || DEFAULTS.timezone,
  handoffOnRequest: s?.handoffOnRequest ?? true,
  handoffOnComplaint: s?.handoffOnComplaint ?? true,
  handoffOnUnknown: s?.handoffOnUnknown ?? true,
  handoffDealAbove: s?.handoffDealAbove ?? null,
});

const formatInr = (v: string | number | null) =>
  v === null || v === '' || v === undefined
    ? null
    : '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Number(v));

const errMsg = (err: any, fallback: string) => err?.response?.data?.message || fallback;

const Switch: React.FC<{ checked: boolean; onChange: () => void; label: string; disabled?: boolean }> = ({
  checked, onChange, label, disabled,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors outline-none disabled:opacity-60 ${
      checked ? 'bg-green-500' : 'bg-gray-200'
    }`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

// ── Knowledge base section (products or FAQs) ───────────────────────────

const KnowledgeSection: React.FC<{
  type: KnowledgeType;
  items: Item[];
  onAdded: (item: Item) => void;
  onUpdated: (item: Item) => void;
  onRemoved: (id: string) => void;
}> = ({ type, items, onAdded, onUpdated, onRemoved }) => {
  const isProduct = type === 'PRODUCT';
  const empty = { title: '', price: '', content: '' };
  const [draft, setDraft] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState(empty);

  const payload = (d: typeof empty) => ({
    title: d.title,
    content: d.content,
    ...(isProduct ? { price: d.price === '' ? null : Number(d.price) } : {}),
  });

  const validate = (d: typeof empty) => {
    if (!d.title.trim()) {
      toast.error(isProduct ? 'Product name is required' : 'Question is required');
      return false;
    }
    if (!isProduct && !d.content.trim()) {
      toast.error('Add the answer');
      return false;
    }
    return true;
  };

  const add = async () => {
    if (!validate(draft)) return;
    setBusy(true);
    try {
      const res = await aiAgentApi.createKnowledge({ type, ...payload(draft) });
      onAdded(res.data.data);
      setDraft(empty);
    } catch (err) {
      toast.error(errMsg(err, 'Could not add'));
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async (id: string) => {
    if (!validate(edit)) return;
    setBusy(true);
    try {
      const res = await aiAgentApi.updateKnowledge(id, payload(edit));
      onUpdated(res.data.data);
      setEditingId(null);
    } catch (err) {
      toast.error(errMsg(err, 'Could not save'));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    setBusy(true);
    try {
      await aiAgentApi.deleteKnowledge(id);
      onRemoved(id);
    } catch (err) {
      toast.error(errMsg(err, 'Could not delete'));
    } finally {
      setBusy(false);
    }
  };

  const Icon = isProduct ? Package : HelpCircle;

  return (
    <div className={cardCls}>
      <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
        <Icon className="w-5 h-5 text-emerald-600" />
        {isProduct ? 'Products & services' : 'FAQs'}
        <span className="text-xs font-semibold text-gray-400">({items.length})</span>
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        {isProduct
          ? 'The agent quotes prices only from this list. Leave the price empty if it depends ("quoted after a call").'
          : 'Common questions and the exact answers the agent should give.'}
      </p>

      <div className="space-y-2 mb-4">
        {items.map((item) =>
          editingId === item.id ? (
            <div key={item.id} className="p-3 border border-emerald-200 bg-emerald-50/40 rounded-xl space-y-2">
              <div className="flex gap-2">
                <input
                  aria-label={isProduct ? 'Edit product name' : 'Edit question'}
                  value={edit.title}
                  onChange={(e) => setEdit({ ...edit, title: e.target.value })}
                  className={inputCls}
                />
                {isProduct && (
                  <input
                    aria-label="Edit price"
                    type="number"
                    min={0}
                    value={edit.price}
                    onChange={(e) => setEdit({ ...edit, price: e.target.value })}
                    placeholder="Price ₹"
                    className={`${inputCls} max-w-[140px]`}
                  />
                )}
              </div>
              <textarea
                aria-label={isProduct ? 'Edit details' : 'Edit answer'}
                value={edit.content}
                onChange={(e) => setEdit({ ...edit, content: e.target.value })}
                rows={2}
                className={`${inputCls} resize-none`}
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditingId(null)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Cancel">
                  <X className="w-4 h-4" />
                </button>
                <button type="button" disabled={busy} onClick={() => saveEdit(item.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Save">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div key={item.id} className="flex items-start gap-3 p-3 border border-gray-100 bg-gray-50 rounded-xl">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {item.title}
                  {isProduct && (
                    <span className="ml-2 text-emerald-700 font-bold">
                      {formatInr(item.price) ?? <span className="text-gray-400 font-medium">price not listed</span>}
                    </span>
                  )}
                </p>
                {item.content && <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{item.content}</p>}
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingId(item.id);
                  setEdit({ title: item.title, price: item.price === null ? '' : String(Number(item.price)), content: item.content || '' });
                }}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white rounded-lg"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button type="button" disabled={busy} onClick={() => remove(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )
        )}
        {items.length === 0 && (
          <p className="text-xs italic text-gray-400">{isProduct ? 'No products yet.' : 'No FAQs yet.'}</p>
        )}
      </div>

      <div className="p-3 border-2 border-dashed border-gray-200 rounded-xl space-y-2">
        <div className="flex gap-2">
          <input
            aria-label={isProduct ? 'New product name' : 'New question'}
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder={isProduct ? 'e.g. Business website (5 pages)' : 'e.g. Do you deliver outside Pune?'}
            className={inputCls}
          />
          {isProduct && (
            <input
              aria-label="New product price"
              type="number"
              min={0}
              value={draft.price}
              onChange={(e) => setDraft({ ...draft, price: e.target.value })}
              placeholder="Price ₹"
              className={`${inputCls} max-w-[140px]`}
            />
          )}
        </div>
        <textarea
          aria-label={isProduct ? 'New product details' : 'New answer'}
          value={draft.content}
          onChange={(e) => setDraft({ ...draft, content: e.target.value })}
          rows={2}
          placeholder={isProduct ? 'What is included, delivery time, options...' : 'The answer'}
          className={`${inputCls} resize-none`}
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={add}
            disabled={busy}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            {isProduct ? 'Add product' : 'Add FAQ'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Try it (dry run) ─────────────────────────────────────────────────────

const summarizeArgs = (args: Record<string, any>) =>
  Object.entries(args)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
    .join(', ')
    .slice(0, 140);

const TryIt: React.FC<{ unsaved: boolean }> = ({ unsaved }) => {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, sending]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const next: ChatMsg[] = [...messages, { role: 'user', text }];
    setMessages(next);
    setInput('');
    setSending(true);
    try {
      const res = await aiAgentApi.test(
        next.filter((m) => m.text).map((m) => ({ role: m.role, text: m.text })).slice(-40)
      );
      const data = res.data.data || {};
      setMessages([
        ...next,
        { role: 'assistant', text: data.reply || '', toolCalls: data.toolCalls || [], handoff: data.handoff },
      ]);
    } catch (err) {
      toast.error(errMsg(err, 'The agent could not reply'));
      setMessages(messages); // roll back the unanswered message
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`${cardCls} flex flex-col h-[640px] lg:sticky lg:top-6`}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-600" />
          Try it
        </h3>
        <button
          type="button"
          onClick={() => setMessages([])}
          className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800"
          title="Start over"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Chat as a customer. Nothing is saved and no WhatsApp message is sent — you will see what the agent would do.
      </p>
      {unsaved && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
          You have unsaved changes. The test uses your saved settings.
        </p>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pr-1" aria-label="Test conversation">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
            <UserRound className="w-10 h-10 mb-2" />
            <p className="text-sm">Try "what is the price of a website?" or "I want to talk to someone".</p>
          </div>
        )}
        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-br-sm bg-emerald-600 text-white text-sm whitespace-pre-wrap">{m.text}</div>
            </div>
          ) : (
            <div key={i} className="flex flex-col items-start gap-1.5" data-testid="agent-reply">
              <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-bl-sm bg-gray-100 text-gray-900 text-sm whitespace-pre-wrap">
                {m.text || <span className="italic text-gray-400">(no reply)</span>}
              </div>
              {(m.toolCalls || []).map((t, j) => (
                <div
                  key={j}
                  className={`max-w-[85%] flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] border ${
                    t.result?.ok === false
                      ? 'bg-gray-50 border-gray-200 text-gray-500'
                      : t.name === 'handoff_to_human' || t.result?.handedOff
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-violet-50 border-violet-200 text-violet-800'
                  }`}
                >
                  <Wrench className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>
                    <strong>{TOOL_LABEL[t.name] || t.name}</strong>
                    {t.result?.ok === false ? ` — not done: ${t.result.error}` : summarizeArgs(t.args) ? ` — ${summarizeArgs(t.args)}` : ''}
                  </span>
                </div>
              ))}
              {m.handoff && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-red-100 text-red-800">
                  <AlertTriangle className="w-3 h-3" />
                  Chat would go to your team ({REASON_LABEL[m.handoff] || m.handoff}); the AI stops replying.
                </div>
              )}
            </div>
          )
        )}
        {sending && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Agent is typing...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 mt-3">
        <input
          aria-label="Test message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Message as a customer..."
          className={inputCls}
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || !input.trim()}
          aria-label="Send test message"
          className="px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────

const AiAgentPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [form, setForm] = useState<Settings>(DEFAULTS);
  const [saved, setSaved] = useState<Settings>(DEFAULTS);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([aiAgentApi.getSettings(), aiAgentApi.listKnowledge()])
      .then(([s, k]) => {
        if (cancelled) return;
        const settings = pickSettings(s.data.data);
        setForm(settings);
        setSaved(settings);
        setItems(k.data.data || []);
      })
      .catch((err) => toast.error(errMsg(err, 'Could not load the AI agent')))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // isEnabled is saved on its own (the switch), so it never counts as unsaved
  const dirty = JSON.stringify({ ...form, isEnabled: false }) !== JSON.stringify({ ...saved, isEnabled: false });

  const save = async () => {
    setSaving(true);
    try {
      const { isEnabled: _ignored, ...rest } = form;
      const res = await aiAgentApi.updateSettings(rest);
      const next = pickSettings(res.data.data);
      setForm(next);
      setSaved(next);
      toast.success('AI agent saved');
    } catch (err) {
      toast.error(errMsg(err, 'Could not save'));
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async () => {
    const isEnabled = !saved.isEnabled;
    setToggling(true);
    try {
      await aiAgentApi.updateSettings({ isEnabled });
      setSaved((s) => ({ ...s, isEnabled }));
      setForm((f) => ({ ...f, isEnabled }));
      toast.success(isEnabled ? 'AI agent is now replying to customers' : 'AI agent turned off');
    } catch (err) {
      toast.error(errMsg(err, 'Could not change'));
    } finally {
      setToggling(false);
    }
  };

  if (loading) return <PageLoader />;

  const products = items.filter((i) => i.type === 'PRODUCT');
  const faqs = items.filter((i) => i.type === 'FAQ');
  const zones = TIMEZONES.includes(form.timezone) ? TIMEZONES : [form.timezone, ...TIMEZONES];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-violet-600" />
            AI Sales Agent
          </h1>
          <p className="text-gray-600 text-sm max-w-2xl">
            Answers WhatsApp messages that no automation or chatbot handles, fills your CRM leads, books callbacks,
            and hands the chat to your team when needed.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving || !dirty}
          className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl disabled:opacity-50 shadow-md font-semibold"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>
      </div>

      <div
        className={`flex items-center justify-between gap-4 p-5 rounded-2xl border ${
          saved.isEnabled ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
        }`}
      >
        <div>
          <p className="font-semibold text-gray-900">
            {saved.isEnabled ? 'AI agent is replying to customers' : 'AI agent is off'}
          </p>
          <p className="text-sm text-gray-500">
            It stays quiet in chats your team has taken over (the handoff switch in the inbox).
          </p>
        </div>
        <Switch checked={saved.isEnabled} onChange={toggleEnabled} label="Enable AI agent" disabled={toggling} />
      </div>

      {saved.isEnabled && items.length === 0 && (
        <p className="flex items-center gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          The agent has no products or FAQs yet, so it cannot quote prices. Add them below.
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-3 space-y-6">
          <div className={cardCls}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">About your business</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="agent-name" className={labelCls}>Agent name</label>
                  <input
                    id="agent-name"
                    value={form.name}
                    maxLength={60}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Riya"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="agent-tz" className={labelCls}>Timezone</label>
                  <select id="agent-tz" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} className={inputCls}>
                    {zones.map((z) => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="agent-business" className={labelCls}>What you do, timings, location, policies</label>
                <textarea
                  id="agent-business"
                  value={form.businessInfo}
                  maxLength={8000}
                  onChange={(e) => setForm({ ...form, businessInfo: e.target.value })}
                  rows={5}
                  placeholder="We design websites for small businesses in Pune. Open Mon-Sat, 10am-7pm. 50% advance, rest on delivery. Refunds within 7 days if work has not started."
                  className={`${inputCls} resize-y`}
                />
              </div>
              <div>
                <label htmlFor="agent-instructions" className={labelCls}>How the agent should talk (optional)</label>
                <textarea
                  id="agent-instructions"
                  value={form.instructions}
                  maxLength={4000}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  rows={3}
                  placeholder="Friendly and short. Always offer a free 15-minute consultation. Never promise delivery in under a week."
                  className={`${inputCls} resize-y`}
                />
              </div>
            </div>
          </div>

          <div className={cardCls}>
            <h3 className="text-lg font-bold text-gray-900 mb-1">When to hand over to your team</h3>
            <p className="text-xs text-gray-500 mb-4">
              The AI pauses itself on that chat and notifies the assigned agent (or the owner).
            </p>
            <div className="space-y-3">
              {([
                ['handoffOnRequest', 'Customer asks for a person or a call'],
                ['handoffOnComplaint', 'Customer is unhappy, complains, or wants a refund'],
                ['handoffOnUnknown', "The answer isn't in the knowledge base (instead of guessing)"],
              ] as const).map(([key, text]) => (
                <label key={key} className="flex items-center justify-between gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer">
                  <span className="text-sm font-medium text-gray-700">{text}</span>
                  <Switch checked={form[key]} onChange={() => setForm({ ...form, [key]: !form[key] })} label={text} />
                </label>
              ))}
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <label htmlFor="agent-deal" className="text-sm font-medium text-gray-700">Deal is bigger than (₹)</label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    id="agent-deal"
                    type="number"
                    min={0}
                    step={1000}
                    value={form.handoffDealAbove ?? ''}
                    onChange={(e) =>
                      setForm({ ...form, handoffDealAbove: e.target.value === '' ? null : Math.max(0, Math.floor(Number(e.target.value))) })
                    }
                    placeholder="Off"
                    className={`${inputCls} max-w-[200px]`}
                  />
                  <span className="text-xs text-gray-500">Leave empty to turn off. Checked on the server, not left to the AI.</span>
                </div>
              </div>
            </div>
          </div>

          <KnowledgeSection
            type="PRODUCT"
            items={products}
            onAdded={(i) => setItems((prev) => [...prev, i])}
            onUpdated={(i) => setItems((prev) => prev.map((x) => (x.id === i.id ? i : x)))}
            onRemoved={(id) => setItems((prev) => prev.filter((x) => x.id !== id))}
          />
          <KnowledgeSection
            type="FAQ"
            items={faqs}
            onAdded={(i) => setItems((prev) => [...prev, i])}
            onUpdated={(i) => setItems((prev) => prev.map((x) => (x.id === i.id ? i : x)))}
            onRemoved={(id) => setItems((prev) => prev.filter((x) => x.id !== id))}
          />
        </div>

        <div className="lg:col-span-2">
          <TryIt unsaved={dirty} />
        </div>
      </div>
    </div>
  );
};

export default AiAgentPage;
