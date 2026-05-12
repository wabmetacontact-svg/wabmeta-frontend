// src/components/wallet/TransactionHistory.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { wallet as walletApi } from "../../services/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatTransactionDescription = (desc: string): string => {
  if (!desc) return '';
  
  // Old → New mapping
  const replacements: Record<string, string> = {
    'Manual debit by admin': 'Debit by WabMeta',
    'manual debit by admin': 'Debit by WabMeta',
    'Manual credit by admin': 'Credit by WabMeta',
    'manual credit by admin': 'Credit by WabMeta',
    'Manual debit': 'Debit by WabMeta',
    'Manual credit': 'Credit by WabMeta',
  };

  let result = desc;
  for (const [oldText, newText] of Object.entries(replacements)) {
    result = result.replace(new RegExp(oldText, 'gi'), newText);
  }
  return result;
};

const formatTransactionNote = (note: string | null | undefined): string => {
  if (!note) return '';
  return formatTransactionDescription(note);
};

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Transaction {
  id: string;
  transactionId: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  status: string;
  metaService?: string;
  razorpayPaymentId?: string;
  note?: string;
  createdAt: string;
}

// ─── Config ────────────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<
  string,
  {
    label: string;
    textColor: string;
    bgColor: string;
    isCredit: boolean;
  }
> = {
  credit: {
    label: "Added",
    textColor: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    isCredit: true,
  },
  debit: {
    label: "Meta Charge",
    textColor: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    isCredit: false,
  },
  admin_credit: {
    label: "Adjustment by Meta",
    textColor: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    isCredit: true,
  },
  admin_debit: {
    label: "Adjustment by Meta",
    textColor: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    isCredit: false,
  },
  refund: {
    label: "Refund",
    textColor: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    isCredit: true,
  },
  reserved: {
    label: "Reserved",
    textColor: "text-gray-600",
    bgColor: "bg-gray-100 dark:bg-gray-700",
    isCredit: false,
  },
  released: {
    label: "Released",
    textColor: "text-teal-600",
    bgColor: "bg-teal-100 dark:bg-teal-900/30",
    isCredit: true,
  },
};

const FILTER_OPTIONS = [
  { value: "", label: "All" },
  { value: "credit", label: "Added" },
  { value: "debit", label: "Meta Charges" },
  { value: "admin_credit", label: "Adjustment by Meta" },
  { value: "refund", label: "Refunds" },
];

// ─── Transaction Item ──────────────────────────────────────────────────────────
const TransactionItem: React.FC<{ txn: Transaction }> = ({ txn }) => {
  const config = TYPE_CONFIG[txn.type] || {
    label: txn.type,
    textColor: "text-gray-600",
    bgColor: "bg-gray-100",
    isCredit: false,
  };

  const formattedDate = new Date(txn.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl
                    hover:bg-gray-50 dark:hover:bg-gray-700/50
                    transition-all group"
    >
      {/* Icon */}
      <div
        className={`w-10 h-10 ${config.bgColor} rounded-full
                       flex items-center justify-center flex-shrink-0`}
      >
        {config.isCredit ? (
          <ArrowUpRight className={`w-5 h-5 ${config.textColor}`} />
        ) : (
          <ArrowDownLeft className={`w-5 h-5 ${config.textColor}`} />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium text-gray-900 dark:text-white
                        truncate"
        >
          {formatTransactionDescription(txn.description)}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded-full
                           ${config.bgColor} ${config.textColor}`}
          >
            {config.label}
          </span>
          {txn.metaService && (
            <span className="text-xs text-gray-400 capitalize">
              {txn.metaService.replace(/_/g, " ")}
            </span>
          )}
          <span className="text-xs text-gray-400">{formattedDate}</span>
        </div>
        {txn.note && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            Note: {formatTransactionNote(txn.note)}
          </p>
        )}
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p
          className={`font-semibold text-sm ${config.isCredit ? "text-green-600" : "text-red-500"}`}
        >
          {config.isCredit ? "+" : "-"}₹
          {txn.amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Bal: ₹
          {txn.balanceAfter.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("");
  const LIMIT = 15;

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await walletApi.getTransactions({
        page,
        limit: LIMIT,
        type: filter || undefined,
      });

      const data = res.data.data;
      setTransactions(data.transactions || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setPage(1);
  };

  return (
    <div>
      {/* Filter Bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <div className="flex gap-2 flex-wrap">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleFilterChange(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium
                          transition-all
                ${filter === opt.value
                  ? "bg-green-600 text-white shadow-sm"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {total > 0 && (
          <span className="text-xs text-gray-400 ml-auto">
            {total} transaction{total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <p className="text-sm text-gray-400">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12">
          <div
            className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full
                          flex items-center justify-center mx-auto mb-3"
          >
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            No transactions found
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {filter
              ? "Try changing the filter"
              : "Transactions will appear here after your first top-up"}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {transactions.map((txn) => (
            <TransactionItem key={txn.id} txn={txn} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg
                       bg-gray-100 dark:bg-gray-700 disabled:opacity-40
                       disabled:cursor-not-allowed text-sm font-medium
                       hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {page}
            </span>{" "}
            of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg
                       bg-gray-100 dark:bg-gray-700 disabled:opacity-40
                       disabled:cursor-not-allowed text-sm font-medium
                       hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
