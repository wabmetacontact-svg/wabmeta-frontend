// src/components/wallet/WalletAnalytics.tsx
// Meta Business Manager style messaging insights — matches the screenshot exactly

import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw, Info } from "lucide-react";
import { wallet as walletApi } from "../../services/api";

// ─── Types ──────────────────────────────────────────────────────────────────────
interface CategoryRow {
  category: string;
  label: string;
  delivered: number;
}
interface ChargeCategoryRow {
  category: string;
  label: string;
  cost: number;
  rate: number;
  count: number;
}
interface AnalyticsData {
  allMessages: { sent: number; delivered: number; received: number };
  messagesDelivered: CategoryRow[];
  freeMessagesDelivered: { freeCustomerService: number; freeEntryPoint: number; total: number };
  paidMessagesDelivered: CategoryRow[];
  approximateCharges: { total: number; byCategory: ChargeCategoryRow[] };
  rates: Record<string, number>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString("en-IN");
const fmtCost = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Panel Component (one of the 5 boxes in screenshot) ─────────────────────────
interface PanelProps {
  title: string;
  total?: number | string;
  totalLabel?: string;
  rows: { label: string; value: string | number }[];
  tooltip?: string;
  accentColor?: string;
}
const Panel: React.FC<PanelProps> = ({ title, total, rows, tooltip, accentColor = "border-green-500" }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden`}>
    {/* Panel Header */}
    <div className={`flex items-center justify-between px-4 pt-4 pb-3 border-b-2 ${accentColor}`}>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</span>
        {tooltip && (
          <div className="group relative">
            <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
            <div className="absolute left-0 top-5 z-10 w-48 bg-gray-900 text-white text-xs rounded-lg p-2 hidden group-hover:block shadow-lg">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      {total !== undefined && (
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          {typeof total === "number" ? fmt(total) : total}
        </span>
      )}
    </div>

    {/* Rows */}
    <div className="px-4 py-2 space-y-0">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b border-dashed border-gray-100 dark:border-gray-700 last:border-0">
          <div className="flex items-center gap-2">
            {/* Meta-style "---" dash indicator */}
            <span className="text-gray-300 dark:text-gray-600 font-mono text-xs tracking-wider">—</span>
            <span className="text-xs text-gray-600 dark:text-gray-300">{row.label}</span>
          </div>
          <span className={`text-xs font-semibold ${typeof row.value === "number" && row.value > 0
              ? "text-gray-900 dark:text-white"
              : "text-gray-400 dark:text-gray-500"
            }`}>
            {typeof row.value === "number" ? fmt(row.value) : row.value}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// ─── Skeleton ────────────────────────────────────────────────────────────────────
const Skeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 dark:bg-gray-700 rounded-xl" />)}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2].map(i => <div key={i} className="h-44 bg-gray-100 dark:bg-gray-700 rounded-xl" />)}
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────────
const WalletAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await walletApi.getAnalytics();
      if (res.data?.success) {
        setData(res.data.data);
      } else {
        setError(res.data?.message || "Failed to load analytics");
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-red-500 mb-3">{error}</p>
        <button
          onClick={() => fetchData()}
          className="text-xs text-green-600 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { allMessages, messagesDelivered, freeMessagesDelivered, paidMessagesDelivered, approximateCharges } = data;

  // Build category rows for delivered panels
  const catRows = (list: CategoryRow[]) =>
    list.map(c => ({ label: c.label, value: c.delivered }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Messaging Insights</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Note: All insights data is approximate and may vary slightly due to processing latency.
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-green-600 transition-all"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* ── Row 1: All Messages | Messages Delivered | Free Messages Delivered ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* All Messages */}
        <Panel
          title="All Messages"
          tooltip="Total messages sent and received via WhatsApp"
          accentColor="border-gray-400"
          rows={[
            { label: "Messages sent", value: allMessages.sent },
            { label: "Messages delivered", value: allMessages.delivered },
            { label: "Messages received", value: allMessages.received },
          ]}
        />

        {/* Messages Delivered (by category) */}
        <Panel
          title="Messages Delivered"
          total={allMessages.delivered}
          tooltip="Messages delivered broken down by WhatsApp template category"
          accentColor="border-blue-500"
          rows={catRows(messagesDelivered).concat([
            { label: "AI Provider", value: 0 },
          ])}
        />

        {/* Free Messages Delivered */}
        <Panel
          title="Free Messages Delivered"
          total={freeMessagesDelivered.total}
          tooltip="Messages delivered within the free conversation window (24-hour)"
          accentColor="border-teal-500"
          rows={[
            { label: "Free customer service", value: freeMessagesDelivered.freeCustomerService },
            { label: "Free entry point", value: freeMessagesDelivered.freeEntryPoint },
          ]}
        />
      </div>

      {/* ── Row 2: Paid Messages Delivered | Approximate Total Charges ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Paid Messages Delivered */}
        <Panel
          title="Paid Messages Delivered"
          total={paidMessagesDelivered.reduce((s, c) => s + c.delivered, 0)}
          tooltip="Messages delivered that were charged (outside free window)"
          accentColor="border-orange-500"
          rows={paidMessagesDelivered.map(c => ({ label: c.label, value: c.delivered })).concat([
            { label: "AI Provider", value: 0 },
          ])}
        />

        {/* Approximate Total Charges */}
        <Panel
          title="Approximate Total Charges"
          total={fmtCost(approximateCharges.total)}
          tooltip="Estimated charges deducted from your Wabmeta wallet for template messages"
          accentColor="border-green-500"
          rows={approximateCharges.byCategory.map(c => ({
            label: c.label,
            value: fmtCost(c.cost),
          })).concat([
            { label: "AI Provider", value: fmtCost(0) },
          ])}
        />
      </div>

      {/* ── Rates Reference Card ── */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
        <p className="text-xs font-semibold text-green-800 dark:text-green-300 mb-3">
          📋 Meta Wallet Rates (per message)
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Marketing", rate: data.rates.MARKETING || 0.90 },
            { label: "Utility", rate: data.rates.UTILITY || 0.15 },
            { label: "Authentication", rate: data.rates.AUTHENTICATION || 0.15 },
            { label: "Auth (International)", rate: data.rates.AUTHENTICATION_INTERNATIONAL || 2.50 },
          ].map((r, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border border-green-100 dark:border-green-900">
              <p className="text-xs text-gray-500 dark:text-gray-400">{r.label}</p>
              <p className="text-base font-bold text-green-700 dark:text-green-400 mt-1">₹{r.rate.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletAnalytics;
