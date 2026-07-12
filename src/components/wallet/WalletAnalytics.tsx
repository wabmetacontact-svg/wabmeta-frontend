// src/components/wallet/WalletAnalytics.tsx
// Meta Business Manager style - Complete Analytics with Country Breakdown

import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw, Info, Globe, TrendingUp, Download } from "lucide-react";
import { wallet as walletApi } from "../../services/api";
import CountryBreakdownModal from "./CountryBreakdownModal";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface CategoryRow {
  category: string;
  label: string;
  delivered: number;
  sent?: number;
}

interface ChargeCategoryRow {
  category: string;
  label: string;
  cost: number;
  delivered: number;
}

interface CountryRow {
  code: string;
  name: string;
  flag: string;
  sent: number;
  delivered: number;
  failed: number;
  cost: number;
  deliveryRate: number;
  categories: Record<string, number>;
}

interface AnalyticsData {
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  allMessages: {
    sent: number;
    delivered: number;
    failed: number;
    read: number;
    received: number;
    deliveryRate: number;
    readRate: number;
  };
  messagesDelivered: {
    total: number;
    byCategory: CategoryRow[];
  };
  freeMessagesDelivered: {
    freeCustomerService: number;
    freeEntryPoint: number;
    total: number;
    sent: number;
  };
  paidMessagesDelivered: {
    total: number;
    byCategory: CategoryRow[];
  };
  approximateCharges: {
    total: number;
    byCategory: ChargeCategoryRow[];
  };
  actualCharges: {
    total: number;
    byCategory: ChargeCategoryRow[];
  };
  countryBreakdown: CountryRow[];
  countrySummary: {
    totalCountries: number;
    topCountry: CountryRow | null;
  };
  rates: {
    india: Record<string, number>;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString("en-IN");
const fmtCost = (n: number) =>
  "₹" +
  n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// ─── Panel Component ────────────────────────────────────────────────────────────
interface PanelProps {
  title: string;
  total?: number | string;
  rows: { label: string; value: string | number; highlight?: boolean }[];
  tooltip?: string;
  accentColor?: string;
  icon?: React.ReactNode;
}

const Panel: React.FC<PanelProps> = ({
  title,
  total,
  rows,
  tooltip,
  accentColor = "border-green-500",
  icon,
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
    <div className={`flex items-center justify-between px-4 pt-4 pb-3 border-b-2 ${accentColor}`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          {title}
        </span>
        {tooltip && (
          <div className="group relative">
            <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
            <div className="absolute left-0 top-5 z-20 w-56 bg-gray-900 text-white text-xs rounded-lg p-2.5 hidden group-hover:block shadow-xl">
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

    <div className="px-4 py-2">
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex items-center justify-between py-2 border-b border-dashed border-gray-100 dark:border-gray-700 last:border-0"
        >
          <div className="flex items-center gap-2">
            <span className="text-gray-300 dark:text-gray-600 font-mono text-xs">
              —
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-300">
              {row.label}
            </span>
          </div>
          <span
            className={`text-xs font-semibold ${
              typeof row.value === "number" && row.value > 0
                ? row.highlight
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-900 dark:text-white"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {typeof row.value === "number" ? fmt(row.value) : row.value}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// ─── Country Row (Preview) ──────────────────────────────────────────────────────
const CountryPreview: React.FC<{
  country: CountryRow;
  totalSent: number;
}> = ({ country, totalSent }) => {
  const percentage = totalSent > 0 ? (country.sent / totalSent) * 100 : 0;

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="flex items-center gap-3 flex-1">
        <span className="text-2xl">{country.flag}</span>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {country.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {fmt(country.sent)} sent • {fmt(country.delivered)} delivered
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {fmtCost(country.cost)}
          </p>
          <p className="text-xs text-gray-400">{percentage.toFixed(1)}%</p>
        </div>

        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div
            className="bg-green-500 h-1.5 rounded-full transition-all"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton ────────────────────────────────────────────────────────────────────
const Skeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-44 bg-gray-100 dark:bg-gray-700 rounded-xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2].map((i) => (
        <div key={i} className="h-44 bg-gray-100 dark:bg-gray-700 rounded-xl" />
      ))}
    </div>
    <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-xl" />
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────────
const WalletAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [dateRange, setDateRange] = useState<"7" | "30" | "90">("30");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const res = await walletApi.getAnalytics({ days: parseInt(dateRange) });
        if (res.data?.success) {
          setData(res.data.data);
          setLastUpdated(new Date());
        } else {
          setError(res.data?.message || "Failed to load analytics");
        }
      } catch (e: any) {
        setError(
          e?.response?.data?.message || e?.message || "Failed to load analytics"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dateRange]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(true);
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ✅ Export to CSV
  const exportToCSV = () => {
    if (!data) return;

    const rows = [
      ["Country", "Sent", "Delivered", "Failed", "Cost (INR)", "Delivery Rate"],
      ...data.countryBreakdown.map((c) => [
        c.name,
        c.sent,
        c.delivered,
        c.failed,
        c.cost.toFixed(2),
        `${c.deliveryRate}%`,
      ]),
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wallet-analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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

  const {
    allMessages,
    messagesDelivered,
    freeMessagesDelivered,
    paidMessagesDelivered,
    approximateCharges,
    countryBreakdown,
    countrySummary,
  } = data;

  const catRows = (list: CategoryRow[]) =>
    list.map((c) => ({ label: c.label, value: c.delivered }));

  return (
    <div className="space-y-4">
      {/* ═══ HEADER ═══ */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            📊 Messaging Insights
            {lastUpdated && (
              <span className="text-[10px] text-gray-400 font-normal">
                Updated {lastUpdated.toLocaleTimeString("en-IN")}
              </span>
            )}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Note: All insights data is approximate and may vary slightly due to processing latency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-green-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>

          {/* Country Modal */}
          {countryBreakdown.length > 0 && (
            <button
              onClick={() => setShowCountryModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              {countrySummary.totalCountries} {countrySummary.totalCountries === 1 ? 'Country' : 'Countries'}
            </button>
          )}

          {/* Export */}
          <button
            onClick={exportToCSV}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-green-600 transition-all"
            title="Export to CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Refresh */}
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-green-600 transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ═══ ROW 1: All | Delivered | Free ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Panel
          title="All Messages"
          tooltip="Total messages sent and received via WhatsApp"
          accentColor="border-gray-400"
          rows={[
            { label: "Messages sent", value: allMessages.sent, highlight: true },
            { label: "Messages delivered", value: allMessages.delivered, highlight: true },
            { label: "Messages received", value: allMessages.received },
            { label: "Messages failed", value: allMessages.failed },
          ]}
        />

        <Panel
          title="Messages Delivered"
          total={allMessages.delivered}
          tooltip="Messages delivered broken down by WhatsApp template category"
          accentColor="border-blue-500"
          rows={catRows(messagesDelivered.byCategory)}
        />

        <Panel
          title="Free Messages Delivered"
          total={freeMessagesDelivered.total}
          tooltip="Messages delivered within the 24-hour free conversation window"
          accentColor="border-teal-500"
          rows={[
            {
              label: "Free customer service",
              value: freeMessagesDelivered.freeCustomerService,
            },
            {
              label: "Free entry point",
              value: freeMessagesDelivered.freeEntryPoint,
            },
          ]}
        />
      </div>

      {/* ═══ ROW 2: Paid | Charges ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel
          title="Paid Messages Delivered"
          total={paidMessagesDelivered.total}
          tooltip="Messages that were charged (outside 24-hour free window or template messages)"
          accentColor="border-orange-500"
          rows={paidMessagesDelivered.byCategory.map((c) => ({
            label: c.label,
            value: c.delivered,
          }))}
        />

        <Panel
          title="Approximate Total Charges"
          total={fmtCost(approximateCharges.total)}
          tooltip="Estimated charges based on Meta's per-message rates for delivered messages"
          accentColor="border-green-500"
          rows={approximateCharges.byCategory.map((c) => ({
            label: c.label,
            value: fmtCost(c.cost),
            highlight: c.cost > 0,
          }))}
        />
      </div>

      {/* ═══ COUNTRY BREAKDOWN (NEW!) ═══ */}
      {countryBreakdown.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b-2 border-purple-500">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Country-wise Distribution
              </span>
              <span className="text-xs text-gray-400">
                (Top {Math.min(5, countryBreakdown.length)})
              </span>
            </div>
            <span className="text-xs font-medium text-purple-600">
              {countrySummary.totalCountries} {countrySummary.totalCountries === 1 ? 'country' : 'countries'}
            </span>
          </div>

          <div className="px-4 py-2">
            {countryBreakdown.slice(0, 5).map((country) => (
              <CountryPreview
                key={country.code}
                country={country}
                totalSent={allMessages.sent}
              />
            ))}
          </div>

          {countryBreakdown.length > 5 && (
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setShowCountryModal(true)}
                className="w-full text-xs font-medium text-purple-600 hover:text-purple-700 flex items-center justify-center gap-1"
              >
                View all {countryBreakdown.length} countries →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══ RATES REFERENCE ═══ */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
        <p className="text-xs font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5" />
          Meta Rates for India (per delivered message)
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Marketing", rate: data.rates.india.MARKETING, color: "text-orange-600" },
            { label: "Utility", rate: data.rates.india.UTILITY, color: "text-blue-600" },
            { label: "Authentication", rate: data.rates.india.AUTHENTICATION, color: "text-green-600" },
            { label: "Auth (Intl)", rate: data.rates.india.AUTHENTICATION_INTERNATIONAL, color: "text-red-600" },
          ].map((r, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border border-green-100 dark:border-green-900"
            >
              <p className="text-xs text-gray-500 dark:text-gray-400">{r.label}</p>
              <p className={`text-base font-bold mt-1 ${r.color}`}>₹{r.rate.toFixed(2)}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-green-700/70 dark:text-green-400/70 mt-3 text-center">
          💡 Rates shown are for India. International rates vary by country. Click "View by Country" for details.
        </p>
      </div>

      {/* ═══ COUNTRY MODAL ═══ */}
      {showCountryModal && (
        <CountryBreakdownModal
          countries={countryBreakdown}
          totalSent={allMessages.sent}
          totalCost={approximateCharges.total}
          onClose={() => setShowCountryModal(false)}
        />
      )}
    </div>
  );
};

export default WalletAnalytics;
