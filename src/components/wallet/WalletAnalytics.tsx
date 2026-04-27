// src/components/wallet/WalletAnalytics.tsx
// Full analytics dashboard shown inside the Wallet page

import React, { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  Send,
  CheckCheck,
  Eye,
  XCircle,
  Users,
  Megaphone,
  LayoutTemplate,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  BarChart3,
  Activity,
  Inbox,
  ChevronDown,
} from "lucide-react";
import { analytics as analyticsApi } from "../../services/api";

// ─── Types ──────────────────────────────────────────────────────────────────────
interface OverviewData {
  contacts: { total: number; newThisPeriod: number; growth: number };
  conversations: { total: number; unread: number };
  messages: { sent: number; received: number; total: number; thisPeriod: number; growth: number };
  campaigns: { total: number; active: number; completed: number };
  templates: { total: number; approved: number };
}

interface MessageData {
  totals: { sent: number; delivered: number; read: number; failed: number; received: number };
  rates: { delivery: number; read: number; failure: number };
  chartData: Array<{ date: string; sent: number; delivered: number; read: number; failed: number; received: number }>;
  typeBreakdown: Array<{ type: string; count: number; percentage: number }>;
}

interface CampaignData {
  overall: {
    totalCampaigns: number;
    totalContacts: number;
    totalSent: number;
    totalDelivered: number;
    totalRead: number;
    totalFailed: number;
    avgDeliveryRate: number;
    avgReadRate: number;
  };
  campaigns: Array<{
    id: string;
    name: string;
    templateName: string;
    status: string;
    totalContacts: number;
    sentCount: number;
    deliveredCount: number;
    readCount: number;
    failedCount: number;
    deliveryRate: number;
    readRate: number;
  }>;
}

interface ContactData {
  totals: { total: number; active: number; newThisPeriod: number };
  sourceBreakdown: Array<{ source: string; count: number; percentage: number }>;
}

interface ConversationData {
  totals: { total: number; openWindows: number; unread: number; avgMessagesPerConversation: number };
}

// ─── Mini Stat Card ─────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  bg?: string;
  growth?: number;
}
const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, sub, color = "text-green-600", bg = "bg-green-50 dark:bg-green-900/20", growth }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      {growth !== undefined && (
        <span className={`text-xs font-medium flex items-center gap-0.5 ${growth >= 0 ? "text-green-600" : "text-red-500"}`}>
          {growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(growth)}%
        </span>
      )}
    </div>
    <p className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{label}</p>
    {sub && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

// ─── Rate Bar ────────────────────────────────────────────────────────────────────
const RateBar: React.FC<{ label: string; rate: number; color: string }> = ({ label, rate, color }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{rate}%</span>
    </div>
    <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-2">
      <div
        className={`${color} rounded-full h-2 transition-all duration-700`}
        style={{ width: `${Math.min(rate, 100)}%` }}
      />
    </div>
  </div>
);

// ─── Section Header ──────────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ icon: React.ElementType; title: string; subtitle?: string }> = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
      <Icon className="w-4 h-4 text-white" />
    </div>
    <div>
      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  </div>
);

// ─── Campaign Status Badge ───────────────────────────────────────────────────────
const statusColors: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  RUNNING: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  PAUSED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  DRAFT: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  CANCELLED: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

// ─── Main Component ──────────────────────────────────────────────────────────────
const WalletAnalytics: React.FC = () => {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [messages, setMessages] = useState<MessageData | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignData | null>(null);
  const [contacts, setContacts] = useState<ContactData | null>(null);
  const [conversations, setConversations] = useState<ConversationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [days, setDays] = useState(30);
  const [showAllCampaigns, setShowAllCampaigns] = useState(false);

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [ovRes, msgRes, campRes, ctRes, convRes] = await Promise.allSettled([
        analyticsApi.getOverview(),
        analyticsApi.getMessages(days),
        analyticsApi.getCampaigns(10),
        analyticsApi.getContacts(days),
        analyticsApi.getConversations(days),
      ]);

      if (ovRes.status === "fulfilled" && ovRes.value.data?.success) setOverview(ovRes.value.data.data);
      if (msgRes.status === "fulfilled" && msgRes.value.data?.success) setMessages(msgRes.value.data.data);
      if (campRes.status === "fulfilled" && campRes.value.data?.success) setCampaigns(campRes.value.data.data);
      if (ctRes.status === "fulfilled" && ctRes.value.data?.success) setContacts(ctRes.value.data.data);
      if (convRes.status === "fulfilled" && convRes.value.data?.success) setConversations(convRes.value.data.data);
    } catch (e) {
      console.error("Analytics fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [days]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-700 rounded-2xl" />
          ))}
        </div>
        <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded-2xl" />
        <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded-2xl" />
      </div>
    );
  }

  const displayedCampaigns = showAllCampaigns
    ? campaigns?.campaigns
    : campaigns?.campaigns?.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-green-600" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Platform Analytics</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="relative">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="text-xs pl-3 pr-7 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 
                         rounded-lg border-0 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-green-600 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Section 1: Overview KPIs ── */}
      <div>
        <SectionHeader icon={Activity} title="Overview" subtitle="Key metrics across your platform" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={Users}
            label="Total Contacts"
            value={overview?.contacts.total.toLocaleString("en-IN") ?? "—"}
            sub={`+${overview?.contacts.newThisPeriod ?? 0} this period`}
            color="text-violet-600"
            bg="bg-violet-50 dark:bg-violet-900/20"
            growth={overview?.contacts.growth}
          />
          <StatCard
            icon={MessageSquare}
            label="Total Messages"
            value={overview?.messages.total.toLocaleString("en-IN") ?? "—"}
            sub={`+${overview?.messages.thisPeriod ?? 0} this period`}
            color="text-blue-600"
            bg="bg-blue-50 dark:bg-blue-900/20"
            growth={overview?.messages.growth}
          />
          <StatCard
            icon={Megaphone}
            label="Campaigns"
            value={overview?.campaigns.total ?? "—"}
            sub={`${overview?.campaigns.active ?? 0} active · ${overview?.campaigns.completed ?? 0} done`}
            color="text-orange-600"
            bg="bg-orange-50 dark:bg-orange-900/20"
          />
          <StatCard
            icon={LayoutTemplate}
            label="Templates"
            value={overview?.templates.total ?? "—"}
            sub={`${overview?.templates.approved ?? 0} approved`}
            color="text-indigo-600"
            bg="bg-indigo-50 dark:bg-indigo-900/20"
          />
        </div>
      </div>

      {/* ── Section 2: Message Analytics ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
        <SectionHeader icon={Send} title="Message Analytics" subtitle={`Last ${days} days`} />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
          {[
            { icon: Send,      label: "Messages Sent",      value: messages?.totals.sent      ?? 0, color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-900/20" },
            { icon: CheckCheck,label: "Delivered",          value: messages?.totals.delivered ?? 0, color: "text-green-600",  bg: "bg-green-50 dark:bg-green-900/20" },
            { icon: Eye,       label: "Read",               value: messages?.totals.read      ?? 0, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
            { icon: XCircle,   label: "Failed",             value: messages?.totals.failed    ?? 0, color: "text-red-500",    bg: "bg-red-50 dark:bg-red-900/20" },
            { icon: Inbox,     label: "Received",           value: messages?.totals.received  ?? 0, color: "text-teal-600",   bg: "bg-teal-50 dark:bg-teal-900/20" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-750 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
              <div className={`w-8 h-8 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">{s.value.toLocaleString("en-IN")}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Rates */}
        {messages && (
          <div className="space-y-3 bg-gray-50 dark:bg-gray-750 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Delivery Rates</p>
            <RateBar label="📦 Delivery Rate" rate={messages.rates.delivery} color="bg-green-500" />
            <RateBar label="👁️ Read Rate" rate={messages.rates.read} color="bg-purple-500" />
            <RateBar label="❌ Failure Rate" rate={messages.rates.failure} color="bg-red-400" />
          </div>
        )}
      </div>

      {/* ── Section 3: Campaign Analytics ── */}
      {campaigns && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <SectionHeader icon={Megaphone} title="Campaign Analytics" subtitle="All-time performance" />

          {/* Overall stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: "Total Sent",      value: campaigns.overall.totalSent,      color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-900/20" },
              { label: "Delivered",       value: campaigns.overall.totalDelivered, color: "text-green-600",  bg: "bg-green-50 dark:bg-green-900/20" },
              { label: "Read",            value: campaigns.overall.totalRead,      color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
              { label: "Failed",          value: campaigns.overall.totalFailed,    color: "text-red-500",    bg: "bg-red-50 dark:bg-red-900/20" },
            ].map((s, i) => (
              <div key={i} className={`${s.bg} rounded-xl p-3 border border-transparent`}>
                <p className={`font-bold ${s.color} text-base`}>{s.value.toLocaleString("en-IN")}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Rate bars */}
          <div className="space-y-3 bg-gray-50 dark:bg-gray-750 rounded-xl p-4 border border-gray-100 dark:border-gray-700 mb-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Avg Rates</p>
            <RateBar label="📬 Avg Delivery Rate" rate={campaigns.overall.avgDeliveryRate} color="bg-green-500" />
            <RateBar label="👁️ Avg Read Rate"     rate={campaigns.overall.avgReadRate}     color="bg-purple-500" />
          </div>

          {/* Recent campaigns table */}
          {campaigns.campaigns.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Recent Campaigns</p>
              <div className="space-y-2">
                {displayedCampaigns?.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.name}</p>
                      <p className="text-xs text-gray-400 truncate">{c.templateName}</p>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>✉️ {c.sentCount.toLocaleString("en-IN")}</span>
                      <span>✅ {c.deliveryRate}%</span>
                      <span>👁️ {c.readRate}%</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColors[c.status] || statusColors.DRAFT}`}>
                      {c.status.charAt(0) + c.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
              {campaigns.campaigns.length > 4 && (
                <button
                  onClick={() => setShowAllCampaigns(v => !v)}
                  className="mt-3 w-full text-xs text-green-600 hover:text-green-700 font-medium py-2 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                >
                  {showAllCampaigns ? "Show less" : `View all ${campaigns.campaigns.length} campaigns`}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Section 4: Contacts & Conversations ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contacts */}
        {contacts && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <SectionHeader icon={Users} title="Contacts" subtitle={`Last ${days} days`} />
            <div className="space-y-3">
              {[
                { label: "Total Contacts",      value: contacts.totals.total,         color: "text-violet-600",  bg: "bg-violet-50 dark:bg-violet-900/20" },
                { label: "Active Contacts",     value: contacts.totals.active,        color: "text-green-600",   bg: "bg-green-50 dark:bg-green-900/20" },
                { label: "New This Period",     value: contacts.totals.newThisPeriod, color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-900/20" },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{s.label}</span>
                  <span className={`font-bold text-sm ${s.color}`}>{s.value.toLocaleString("en-IN")}</span>
                </div>
              ))}

              {contacts.sourceBreakdown.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">By Source</p>
                  {contacts.sourceBreakdown.slice(0, 4).map((s, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex justify-between mb-0.5">
                          <span className="text-xs text-gray-600 dark:text-gray-300 capitalize">{s.source}</span>
                          <span className="text-xs text-gray-400">{s.count}</span>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                          <div className="bg-violet-500 rounded-full h-1.5" style={{ width: `${s.percentage}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conversations */}
        {conversations && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <SectionHeader icon={Inbox} title="Conversations" subtitle={`Last ${days} days`} />
            <div className="space-y-3">
              {[
                { label: "Total Conversations",    value: conversations.totals.total,                      color: "text-blue-600" },
                { label: "Open Windows",           value: conversations.totals.openWindows,                color: "text-green-600" },
                { label: "Unread",                 value: conversations.totals.unread,                     color: "text-orange-500" },
                { label: "Avg Messages / Conv.",   value: conversations.totals.avgMessagesPerConversation, color: "text-purple-600" },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{s.label}</span>
                  <span className={`font-bold text-sm ${s.color}`}>{s.value.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Note */}
      <p className="text-xs text-center text-gray-400 dark:text-gray-500">
        ℹ️ Analytics data is approximate and refreshed in real-time. Delivery rates may vary slightly due to WhatsApp's reporting latency.
      </p>
    </div>
  );
};

export default WalletAnalytics;
