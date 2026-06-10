// src/components/wallet/WalletStats.tsx

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Wallet,
} from "lucide-react";

interface Props {
  totalCredited: number;
  totalDebited: number;
  lastTransactionAt: string | null;
  availableBalance: number;
}

const WalletStats: React.FC<Props> = ({
  totalCredited,
  totalDebited,
  lastTransactionAt,
}) => {
  const netBalance = totalCredited - totalDebited;

  const stats = [
    {
      label: "Total Added",
      value: `₹${totalCredited.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: TrendingUp,
      iconColor: "text-green-600",
      iconBg: "bg-green-100 dark:bg-green-900/30",
      textColor: "text-green-600 dark:text-green-400",
    },
    {
      label: "Total Used",
      value: `₹${totalDebited.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: TrendingDown,
      iconColor: "text-red-500",
      iconBg: "bg-red-100 dark:bg-red-900/30",
      textColor: "text-red-500 dark:text-red-400",
    },
    {
      label: "Net Savings",
      value: `₹${netBalance.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: Wallet,
      iconColor: netBalance >= 0 ? "text-blue-600" : "text-orange-600",
      iconBg:
        netBalance >= 0
          ? "bg-blue-100 dark:bg-blue-900/30"
          : "bg-orange-100 dark:bg-orange-900/30",
      textColor:
        netBalance >= 0
          ? "text-blue-600 dark:text-blue-400"
          : "text-orange-600 dark:text-orange-400",
    },
    {
      label: "Last Activity",
      value: lastTransactionAt
        ? new Date(lastTransactionAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "No transactions yet",
      icon: Clock,
      iconColor: "text-gray-500",
      iconBg: "bg-gray-100 dark:bg-gray-700",
      textColor: "text-gray-700 dark:text-gray-300",
      small: !lastTransactionAt,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Icon */}
          <div
            className={`w-9 h-9 ${stat.iconBg.split(' ')[0]} rounded-xl
                           flex items-center justify-center mb-3`}
          >
            <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
          </div>

          {/* Value */}
          <p
            className={`font-bold ${stat.textColor.split(' ')[0]}
                          ${stat.small ? "text-sm" : "text-base"} leading-tight`}
          >
            {stat.value}
          </p>

          {/* Label */}
          <p className="text-xs text-slate-500 mt-1">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
};

export default WalletStats;
