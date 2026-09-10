// src/pages/instagram/DMAutomation.tsx
// Auto-reply to Instagram DMs by keyword, first message, or story reply.

import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  MessageCircle, Plus, Zap, Search, Trash2, ArrowUpRight,
  Hash, Heart, BookOpen, Play, Power, MessageSquare
} from "lucide-react";

import { instagram } from "../../services/api";
import { useConfirm } from "../../context/ConfirmContext";
import PageLoader from "../../components/common/PageLoader";
import CreateDmRuleModal from "../../components/instagram/CreateDmRuleModal";
import {
  ChannelHeader, StatCard,
  INSTAGRAM_THEME as TH, primaryBtnStyle
} from "../../components/channel/channelUi";

// GlassCard hardcodes p-6, which Tailwind won't let `p-0` override, so the
// edge-to-edge list uses the same card styling directly.
const cardShell =
  "relative rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.03)] border border-gray-200 overflow-hidden";

type IgTriggerType = "KEYWORD" | "DM_RECEIVED" | "STORY_REPLY" | "COMMENT_TO_DM" | "ICE_BREAKER";

interface AutomationRule {
  id: string;
  name: string;
  triggerType: IgTriggerType;
  keywords: string[];
  matchType: string;
  responseText: string | null;
  isActive: boolean;
  repliesCount: number;
  createdAt: string;
}

const triggerConfig: Record<IgTriggerType, { label: string; icon: React.ElementType; color: string }> = {
  KEYWORD: { label: "Keyword Trigger", icon: Hash, color: "#e1306c" },
  STORY_REPLY: { label: "Story Reply", icon: BookOpen, color: "#833ab4" },
  DM_RECEIVED: { label: "DM Received", icon: MessageCircle, color: "#fcb045" },
  COMMENT_TO_DM: { label: "Comment → DM", icon: Heart, color: "#fd1d1d" },
  ICE_BREAKER: { label: "Ice Breaker", icon: Heart, color: "#fd1d1d" },
};

const DMAutomation: React.FC = () => {
  const confirm = useConfirm();
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await instagram.getAutomations();
      setRules(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not load your automation rules.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const q = searchQuery.trim().toLowerCase();
  const filteredRules = !q
    ? rules
    : rules.filter((r) =>
        r.name.toLowerCase().includes(q) ||
        (r.responseText || "").toLowerCase().includes(q) ||
        r.keywords.some((k) => k.toLowerCase().includes(q))
      );

  const toggleRule = async (id: string) => {
    const rule = rules.find((r) => r.id === id);
    if (!rule) return;
    const next = !rule.isActive;

    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, isActive: next } : r)));
    try {
      await instagram.toggleAutomation(id, next);
      toast.success(`Automation ${next ? "activated" : "paused"}`);
    } catch {
      setRules((prev) => prev.map((r) => (r.id === id ? { ...r, isActive: !next } : r)));
      toast.error("Could not change status.");
    }
  };

  const deleteRule = async (rule: AutomationRule) => {
    const ok = await confirm({
      title: "Delete this DM rule?",
      message: `"${rule.name}" will stop auto-replying to Instagram DMs.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;

    const prev = rules;
    setRules((r) => r.filter((x) => x.id !== rule.id));
    try {
      await instagram.deleteAutomation(rule.id);
      toast.success("Rule deleted");
    } catch (err: any) {
      setRules(prev);
      toast.error(err?.response?.data?.message || "Could not delete rule.");
    }
  };

  if (loading) return <PageLoader />;

  const activeCount = rules.filter((r) => r.isActive).length;
  const totalReplies = rules.reduce((a, r) => a + (r.repliesCount || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">

      <ChannelHeader
        theme={TH}
        icon={MessageCircle}
        title="Direct Message Automation"
        subtitle="Auto-reply to Instagram DMs instantly based on keywords, first messages, or story replies."
        action={
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold shadow-md hover:-translate-y-0.5 transition-all"
            style={primaryBtnStyle(TH)}
          >
            <Plus className="w-4 h-4" /> Create DM Rule
          </button>
        }
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm font-bold text-red-800">{error}</p>
            <button onClick={load} className="mt-2 text-xs font-bold text-red-700 underline">Try again</button>
          </div>
        </div>
      )}

      {/* Stats — all derived from the loaded rules */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard theme={TH} icon={Zap} label="Total Rules" value={rules.length} hint="Active & paused" />
        <StatCard theme={TH} icon={Play} label="Active" value={activeCount} hint="Currently monitoring" />
        <StatCard theme={TH} icon={MessageSquare} label="Total Replies" value={totalReplies} hint="Automated DMs sent" />
        <StatCard
          theme={TH}
          icon={ArrowUpRight}
          label="Avg per Rule"
          value={rules.length > 0 ? Math.round(totalReplies / rules.length) : 0}
          hint="Replies per rule"
        />
      </div>

      {/* Rules list + search */}
      <div className={cardShell}>
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by rule name, keyword or response..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-pink-300 transition-all"
            />
          </div>
          {rules.length > 0 && (
            <span className="text-[10px] font-mono text-gray-400 uppercase font-semibold hidden sm:block">
              Showing {filteredRules.length} of {rules.length}
            </span>
          )}
        </div>

        <div className="divide-y divide-gray-100">
          {filteredRules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4 bg-pink-50 border border-pink-100 shadow-sm">
                <MessageCircle className="w-7 h-7 text-pink-500" />
              </div>
              <p className="text-sm font-bold text-gray-900 mb-1">
                {rules.length === 0 ? "No DM rules yet" : "No rules match your search"}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                {rules.length === 0
                  ? "Create your first automation to reply instantly."
                  : "Try a different name or keyword."}
              </p>
              {rules.length === 0 && (
                <button
                  onClick={() => setShowCreate(true)}
                  className="px-5 py-2.5 rounded-full text-white text-xs font-bold shadow-md hover:-translate-y-0.5 transition-all"
                  style={primaryBtnStyle(TH)}
                >
                  Create first rule
                </button>
              )}
            </div>
          ) : (
            filteredRules.map((rule) => {
              const tc = triggerConfig[rule.triggerType] ?? triggerConfig.KEYWORD;

              return (
                <div
                  key={rule.id}
                  className={`flex items-start sm:items-center gap-4 p-5 hover:bg-gray-50/50 transition-colors ${rule.isActive ? "" : "opacity-60 bg-gray-50/30"}`}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${tc.color}15`, border: `1px solid ${tc.color}30` }}
                  >
                    <tc.icon className="w-5 h-5" style={{ color: tc.color }} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-gray-900 truncate">{rule.name}</p>
                      <span
                        className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                        style={{ background: `${tc.color}15`, color: tc.color }}
                      >
                        {tc.label}
                      </span>
                      {rule.repliesCount > 0 && (
                        <span className="text-[10px] text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded-md">
                          Fired {rule.repliesCount}×
                        </span>
                      )}
                    </div>

                    {rule.keywords && rule.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {rule.keywords.map((kw) => (
                          <span key={kw} className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-white border border-gray-200 text-gray-600 shadow-sm">
                            #{kw}
                          </span>
                        ))}
                      </div>
                    )}

                    {rule.responseText && (
                      <p className="text-xs text-gray-700 bg-gray-50/80 border border-gray-100 rounded-xl p-3 line-clamp-2 break-words">
                        <span className="font-bold text-pink-500 mr-1">Reply:</span> {rule.responseText}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => toggleRule(rule.id)}
                      title={rule.isActive ? "Active — click to pause" : "Paused — click to activate"}
                      aria-label={rule.isActive ? "Pause rule" : "Activate rule"}
                      className={`p-2 rounded-xl border transition-all ${
                        rule.isActive
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                          : "bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200"
                      }`}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteRule(rule)}
                      aria-label="Delete rule"
                      className="p-2 rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <CreateDmRuleModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreated={load} />
    </div>
  );
};

export default DMAutomation;
