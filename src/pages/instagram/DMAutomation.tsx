import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { instagram } from "../../services/api";
import PageLoader from "../../components/common/PageLoader";
import CreateDmRuleModal from "../../components/instagram/CreateDmRuleModal";
import {
  MessageCircle,
  Plus,
  Zap,
  Search,
  Edit3,
  Trash2,
  ArrowUpRight,
  Hash,
  Heart,
  BookOpen,
  Play,
} from "lucide-react";

// Mirrors IgDmAutomation in the backend Prisma schema.
type IgTriggerType =
  | "KEYWORD"
  | "DM_RECEIVED"
  | "STORY_REPLY"
  | "COMMENT_TO_DM"
  | "ICE_BREAKER";

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

const triggerConfig: Record<
  IgTriggerType,
  { label: string; icon: React.ElementType; color: string }
> = {
  KEYWORD: { label: "Keyword Trigger", icon: Hash, color: "#e1306c" },
  STORY_REPLY: { label: "Story Reply", icon: BookOpen, color: "#833ab4" },
  DM_RECEIVED: { label: "DM Received", icon: MessageCircle, color: "#fcb045" },
  COMMENT_TO_DM: { label: "Comment → DM", icon: Heart, color: "#fd1d1d" },
  ICE_BREAKER: { label: "Ice Breaker", icon: Heart, color: "#fd1d1d" },
};

const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div
    className={`relative rounded-2xl bg-gray-50 backdrop-blur-2xl
      border border-gray-200 p-6 ${className}`}
  >
    <div
      className="absolute inset-0 rounded-2xl pointer-events-none"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)",
      }}
    />
    <div className="relative">{children}</div>
  </div>
);

const DMAutomation: React.FC = () => {
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
      setError(
        err?.response?.data?.message || "Could not load your automation rules."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredRules = rules.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleRule = async (id: string) => {
    const rule = rules.find((r) => r.id === id);
    if (!rule) return;
    const next = !rule.isActive;

    // Optimistic, rolled back if the request fails.
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: next } : r))
    );
    try {
      await instagram.toggleAutomation(id, next);
    } catch (err: any) {
      setRules((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isActive: !next } : r))
      );
      toast.error(
        err?.response?.data?.message || "Could not change that rule's status."
      );
    }
  };

  const igGradient =
    "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)";

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-800">{error}</p>
            <button
              type="button"
              onClick={load}
              className="mt-2 text-sm font-semibold text-red-700 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-[#e1306c]" />
            <span className="text-xs font-mono uppercase tracking-wider text-gray-500">
              DM Automation
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            DM Automation Rules
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Auto-reply to Instagram DMs based on triggers and keywords
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl
            text-gray-900 text-sm font-semibold
            hover:-translate-y-0.5 transition-all duration-300"
          style={{
            background: igGradient,
            boxShadow: "0 8px 24px rgba(131,58,180,0.35)",
          }}
        >
          <Plus className="w-4 h-4" />
          Create Rule
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Rules",
            value: rules.length,
            color: "#e1306c",
            icon: Zap,
          },
          {
            label: "Active",
            value: rules.filter((r) => r.isActive).length,
            color: "#10b981",
            icon: Play,
          },
          {
            label: "Total Replies",
            value: rules.reduce((a, r) => a + r.repliesCount, 0),
            color: "#833ab4",
            icon: MessageCircle,
          },
          {
            label: "Response Rate",
            value: "—",
            color: "#fcb045",
            icon: ArrowUpRight,
          },
        ].map((stat) => (
          <GlassCard key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: `${stat.color}20`,
                  border: `1px solid ${stat.color}40`,
                }}
              >
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* ── Rules List ── */}
      <GlassCard className="p-0 overflow-hidden">
        {/* Search bar */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm
                bg-gray-50 border border-gray-200 rounded-xl
                text-gray-900 placeholder:text-gray-500
                focus:outline-none focus:border-[#e1306c]/50
                transition-all duration-300"
            />
          </div>
        </div>

        {/* Rules */}
        <div className="divide-y divide-gray-200">
          {filteredRules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: "rgba(225,48,108,0.1)",
                  border: "1px solid rgba(225,48,108,0.2)",
                }}
              >
                <MessageCircle className="w-7 h-7 text-[#e1306c]" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                No rules yet
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Create your first DM automation rule
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className="px-4 py-2 rounded-xl text-gray-900 text-xs font-semibold"
                style={{ background: igGradient }}
              >
                Create First Rule
              </button>
            </div>
          ) : (
            filteredRules.map((rule) => {
              const tc = triggerConfig[rule.triggerType] ?? triggerConfig.KEYWORD;

              return (
                <div
                  key={rule.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Trigger icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `${tc.color}15`,
                      border: `1px solid ${tc.color}30`,
                    }}
                  >
                    <tc.icon className="w-4 h-4" style={{ color: tc.color }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {rule.name}
                      </p>
                      <span
                        className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                        style={{
                          background: `${tc.color}15`,
                          color: tc.color,
                          border: `1px solid ${tc.color}30`,
                        }}
                      >
                        {tc.label}
                      </span>
                    </div>

                    {/* Keywords */}
                    {rule.keywords && rule.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {rule.keywords.map((kw) => (
                          <span
                            key={kw}
                            className="px-1.5 py-0.5 rounded text-[9px] font-mono
                              bg-gray-50 border border-gray-200 text-gray-500"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-gray-500 truncate">
                      {rule.responseText}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-1 text-xs text-gray-500 font-mono">
                    <MessageCircle className="w-3 h-3" />
                    <span>{rule.repliesCount}</span>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0
                      ${rule.isActive ? "" : "bg-gray-50"}`}
                    style={
                      rule.isActive
                        ? {
                            background:
                              "linear-gradient(135deg, #833ab4, #fd1d1d)",
                          }
                        : {}
                    }
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full
                        shadow-sm transition-all duration-300
                        ${rule.isActive ? "left-5" : "left-0.5"}`}
                    />
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900
                        hover:bg-gray-50 transition-all duration-300"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400
                        hover:bg-red-500/10 transition-all duration-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </GlassCard>

      <CreateDmRuleModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={load}
      />
    </div>
  );
};

export default DMAutomation;
