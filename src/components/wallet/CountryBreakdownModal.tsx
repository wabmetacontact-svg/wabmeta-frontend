// src/components/wallet/CountryBreakdownModal.tsx
// Beautiful modal to show country-wise breakdown

import React, { useState } from "react";
import { X, Search, Download } from "lucide-react";

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

interface Props {
  countries: CountryRow[];
  totalSent: number;
  totalCost: number;
  onClose: () => void;
}

const fmt = (n: number) => n.toLocaleString("en-IN");
const fmtCost = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CountryBreakdownModal: React.FC<Props> = ({
  countries,
  totalSent,
  totalCost,
  onClose,
}) => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"sent" | "cost" | "delivered">("sent");

  const filtered = countries
    .filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search)
    )
    .sort((a, b) => {
      if (sortBy === "cost") return b.cost - a.cost;
      if (sortBy === "delivered") return b.delivered - a.delivered;
      return b.sent - a.sent;
    });

  const exportCSV = () => {
    const rows = [
      ["Country", "Code", "Sent", "Delivered", "Failed", "Cost (INR)", "Delivery Rate", "Marketing", "Utility", "Authentication", "Service"],
      ...filtered.map((c) => [
        c.name,
        `+${c.code}`,
        c.sent,
        c.delivered,
        c.failed,
        c.cost.toFixed(2),
        `${c.deliveryRate}%`,
        c.categories.MARKETING || 0,
        c.categories.UTILITY || 0,
        c.categories.AUTHENTICATION || 0,
        c.categories.SERVICE || 0,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `country-breakdown-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              🌍 Country-wise Message Distribution
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {countries.length} countries • {fmt(totalSent)} total messages • {fmtCost(totalCost)} total cost
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 dark:hover:bg-gray-700 rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="sent">Sort by Sent</option>
            <option value="delivered">Sort by Delivered</option>
            <option value="cost">Sort by Cost</option>
          </select>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>

        {/* Country List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No countries found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((country) => {
                const percentage =
                  totalSent > 0 ? (country.sent / totalSent) * 100 : 0;

                return (
                  <div
                    key={country.code}
                    className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{country.flag}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {country.name}
                            </p>
                            <span className="text-xs text-gray-400">
                              +{country.code}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {percentage.toFixed(1)}% of total messages
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {fmtCost(country.cost)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {country.deliveryRate}% delivered
                        </p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs text-gray-500">Sent</p>
                        <p className="text-sm font-bold text-blue-600">{fmt(country.sent)}</p>
                      </div>
                      <div className="text-center py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-xs text-gray-500">Delivered</p>
                        <p className="text-sm font-bold text-green-600">{fmt(country.delivered)}</p>
                      </div>
                      <div className="text-center py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-xs text-gray-500">Failed</p>
                        <p className="text-sm font-bold text-red-600">{fmt(country.failed)}</p>
                      </div>
                    </div>

                    {/* Category Breakdown */}
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(country.categories)
                        .filter(([_, count]) => count > 0)
                        .map(([cat, count]) => (
                          <div
                            key={cat}
                            className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs"
                          >
                            <span className="text-gray-600 dark:text-gray-400">
                              {cat.charAt(0) + cat.slice(1).toLowerCase()}:
                            </span>
                            <span className="ml-1 font-semibold text-gray-900 dark:text-white">
                              {count}
                            </span>
                          </div>
                        ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            💡 Rates are calculated based on recipient country as per Meta's pricing
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CountryBreakdownModal;
