import React, { useState } from "react";
import {
  MessageCircle,
  Plus,
  Zap,
  Search,
  Toggle,
  Edit3,
  Trash2,
  Eye,
  ArrowUpRight,
  Hash,
  Heart,
  BookOpen,
  Play,
  Pause,
  Settings,
} from "lucide-react";

interface AutomationRule {
  id: string;
  name: string;
  trigger: "keyword" | "story_reply" | "dm_received" | "comment_to_dm";
  keywords?: string[];
  response: string;
  isActive: boolean;
  repliesCount: number;
  createdAt: string;
}

// Mock data - baad mein API se replace hoga
const mockRules: AutomationRule[] = [
  {
    id: "1",
    name: "Pricing Inquiry",
    trigger: "keyword",
    keywords: ["price", "cost", "how much"],
    response:
      "Hi! Thanks for reaching out. Our pricing starts at ₹899/month. Want to know more?",
    isActive: true,
    repliesCount: 142,
    createdAt: "2026-06-01",
  },
  {
    id: "2",
    name: "Story Reply Welcome",
    trigger: "story_reply",
    response: "Hey! Thanks for checking out my story 🙌 How can I help you?",
    isActive: false,
    repliesCount: 38,
    createdAt: "2026-05-28",
  },
];

const triggerConfig = {
  keyword: { label: "Keyword Trigger", icon: Hash, color: "#e1306c" },
  story_reply: { label: "Story Reply", icon: BookOpen, color: "#833ab4" },
  dm_received: { label: "DM Received", icon: MessageCircle, color: "#fcb045" },
  comment_to_dm: { label: "Comment → DM", icon: Heart, color: "#fd1d1d" },
};

const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div
    className={`relative rounded-2xl bg-white/[0.04] backdrop-blur-2xl
      border border-white/[0.08] p-6 ${className}`}
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
  const [rules, setRules] = useState<AutomationRule[]>(mockRules);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredRules = rules.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const igGradient =
    "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-[#e1306c]" />
            <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
              DM Automation
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            DM Automation Rules
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Auto-reply to Instagram DMs based on triggers and keywords
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl
            text-white text-sm font-semibold
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
                <p className="text-xs text-gray-400">{stat.label}</p>
                <p className="text-xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* ── Rules List ── */}
      <GlassCard className="p-0 overflow-hidden">
        {/* Search bar */}
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm
                bg-white/[0.04] border border-white/[0.08] rounded-xl
                text-white placeholder:text-gray-500
                focus:outline-none focus:border-[#e1306c]/50
                transition-all duration-300"
            />
          </div>
        </div>

        {/* Rules */}
        <div className="divide-y divide-white/[0.04]">
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
              <p className="text-sm font-medium text-white mb-1">
                No rules yet
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Create your first DM automation rule
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-xl text-white text-xs font-semibold"
                style={{ background: igGradient }}
              >
                Create First Rule
              </button>
            </div>
          ) : (
            filteredRules.map((rule) => {
              const tc = triggerConfig[rule.trigger];

              return (
                <div
                  key={rule.id}
                  className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors"
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
                      <p className="text-sm font-semibold text-white truncate">
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
                              bg-white/[0.05] border border-white/[0.08] text-gray-400"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-gray-500 truncate">
                      {rule.response}
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
                      ${rule.isActive ? "" : "bg-white/[0.08]"}`}
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
                      className="p-1.5 rounded-lg text-gray-500 hover:text-white
                        hover:bg-white/[0.05] transition-all duration-300"
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
    </div>
  );
};

export default DMAutomation;
