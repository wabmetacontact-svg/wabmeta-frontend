// src/pages/Wallet.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Shield,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Info,
  RefreshCw,
  Lock,
  Zap
} from "lucide-react";
import { wallet as walletApi } from "../services/api";
import WalletTopUpModal from "../components/wallet/WalletTopUpModal";
import WalletRequestModal from "../components/wallet/WalletRequestModal";
import TransactionHistory from "../components/wallet/TransactionHistory";
import WalletAnalytics from "../components/wallet/WalletAnalytics";
import WalletStats from "../components/wallet/WalletStats";
import { usePlanAccess } from "../hooks/usePlanAccess";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import MetaRatesCard from '../components/wallet/MetaRatesCard';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface WalletData {
  exists: boolean;
  isActive: boolean;
  balance: number;
  reservedBalance: number;
  availableBalance: number;
  creditEnabled: boolean;
  creditLimit: number;
  creditUsed: number;
  availableCredit: number;
  currency: string;
  lowBalanceThreshold: number;
  maxTopUpAmount: number;
  maxMonthlyTopUp: number;
  currentMonthTopUp: number;
  totalCredited: number;
  totalDebited: number;
  lastTransactionAt: string | null;
  flagged: boolean;
  flagReason?: string;
  hasPendingRequest: boolean;
  pendingRequest: { id: string; status: string; requestedAt: string } | null;
}

// ─── Skeleton Loader ───────────────────────────────────────────────────────────
const WalletSkeleton: React.FC = () => (
  <div className="w-full mx-auto p-6 space-y-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div>
        <div className="h-7 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
      </div>
      <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2 h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
    </div>
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      ))}
    </div>
  </div>
);

// ─── Locked View ───────────────────────────────────────────────────────────────
const LockedWalletView: React.FC = () => (
  <div className="max-w-2xl mx-auto mt-20 p-8 text-center">
    <div className="w-24 h-24 bg-[#0a0e27]/[0.04] rounded-full flex items-center justify-center mx-auto mb-6">
      <Lock className="w-12 h-12 text-gray-400" />
    </div>
    <h1 className="text-3xl font-bold text-white mb-4">
      Wallet Feature Locked
    </h1>
    <p className="text-gray-400 mb-8 max-w-md mx-auto">
      The Meta Payment Wallet is a premium feature available for all paid subscription plans. 
      Upgrade your plan from Free to manage payments with ease.
    </p>
    <Link
      to="/dashboard/billing"
      className="inline-flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 
                 text-white rounded-xl font-semibold transition-all shadow-lg shadow-green-200 dark:shadow-none"
    >
      <Zap className="w-5 h-5" />
      Upgrade Now
    </Link>
    
    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
      {[
        { title: "No International Cards", desc: "Pay in INR without needing international credit cards." },
        { title: "Automated Billing", desc: "We handle Meta's direct billing so you don't have to." }
      ].map((f, i) => (
        <div key={i} className="p-4 bg-[#0a0e27] rounded-2xl border border-white/[0.08]">
          <h3 className="font-semibold text-white text-sm mb-1">{f.title}</h3>
          <p className="text-xs text-gray-500">{f.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

// ─── Not Active View ───────────────────────────────────────────────────────────
interface NotActiveViewProps {
  walletData: WalletData | null;
  onRequestAccess: () => void;
}

const NotActiveView: React.FC<NotActiveViewProps> = ({
  walletData,
  onRequestAccess,
}) => {
  const isPending = walletData?.hasPendingRequest;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div
          className="w-20 h-20 bg-green-100 dark:bg-green-900/30
                        rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Wallet className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-white">
          Meta Payment Wallet
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          Manage your WhatsApp API payments without international cards
        </p>
      </div>

      {/* Status Card */}
      <div
        className="relative overflow-hidden bg-white/[0.02] rounded-2xl shadow-xl
                      border border-white/[0.05] p-6 mb-6 backdrop-blur-xl"
      >
        {isPending ? (
          /* ── Pending State ── */
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Clock className="w-6 h-6 text-yellow-500 animate-pulse" />
              <span className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                Request Under Review
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your wallet access request is being reviewed by our team. We'll
              notify you once it's processed (usually within 24 hours).
            </p>
            <div
              className="mt-4 bg-yellow-50 dark:bg-yellow-900/20
                            rounded-xl p-3 text-sm text-yellow-700 dark:text-yellow-400"
            >
              💡 Make sure you are on a paid subscription plan (Monthly or higher).
            </div>
            {walletData?.pendingRequest?.requestedAt && (
              <p className="text-xs text-gray-400 mt-3">
                Submitted:{" "}
                {new Date(
                  walletData.pendingRequest.requestedAt
                ).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        ) : (
          /* ── Not Requested State ── */
          <div>
            <h3 className="font-semibold text-white mb-4">
              Requirements to Enable Wallet:
            </h3>
            <div className="space-y-3 mb-6">
              {[
                {
                  icon: CheckCircle,
                  color: "text-green-500",
                  text: "Active paid subscription plan required",
                },
                {
                  icon: CheckCircle,
                  color: "text-green-500",
                  text: "Admin approval required (24hr review)",
                },
                {
                  icon: Shield,
                  color: "text-blue-500",
                  text: "Balance only usable for Meta API payments",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${item.color} flex-shrink-0`} />
                  <span className="text-sm text-gray-400 dark:text-gray-300">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={onRequestAccess}
              className="w-full py-3 bg-green-600 hover:bg-green-700
                         text-white rounded-xl font-semibold transition-all
                         flex items-center justify-center gap-2 shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Request Wallet Access
            </button>
          </div>
        )}
      </div>

      {/* Wallet Feature Description */}
      <div
        className="relative overflow-hidden bg-emerald-500/10 backdrop-blur-xl
                      rounded-2xl p-6 border border-emerald-500/20"
      >
        <h3 className="font-bold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Wabmeta Wallet Feature Description
        </h3>
        
        <div className="space-y-4 text-sm text-green-800/80 dark:text-green-400/90 leading-relaxed">
          <p>
            If you do not have a credit or debit card, you can use the Wabmeta Wallet to pay for bulk messaging services.
          </p>
          
          <p>
            According to Meta’s policies, running message templates and sending bulk messages requires payment through Meta, 
            which typically needs a valid credit or debit card linked to your account.
          </p>
          
          <div className="bg-[#0a0e27]/50 dark:bg-black/20 p-4 rounded-xl space-y-2 border border-green-100 dark:border-green-900/50">
            <p>• If you have a card, you can directly add it to your Meta account and manage payments yourself.</p>
            <p>• If you do not have a card, you can use the Wabmeta Wallet as an alternative.</p>
          </div>

          <div>
            <p className="font-semibold mb-2">With the Wabmeta Wallet:</p>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>You can add funds to your wallet within the platform.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Wabmeta will use this balance to process your Meta-related payments on your behalf.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>It works like a controlled credit line, making it easier for users without international payment methods.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Active Wallet View ────────────────────────────────────────────────────────
interface ActiveWalletViewProps {
  walletData: WalletData;
  onAddMoney: () => void;
  onRefresh: () => void;
}

const ActiveWalletView: React.FC<ActiveWalletViewProps> = ({
  walletData,
  onAddMoney,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "analytics">(
    "overview"
  );
  const isLowBalance = walletData.balance < walletData.lowBalanceThreshold;

  return (
    <div className="w-full mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            My Wallet
          </h1>
          <p className="text-gray-400 text-sm">
            Meta API Payment Balance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 hover:bg-[#0a0e27]/[0.04] dark:hover:bg-gray-700
                       rounded-xl transition-all text-gray-500"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={onAddMoney}
            className="px-4 py-2 bg-green-600 hover:bg-green-700
                       text-white rounded-xl font-medium transition-all
                       flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Money
          </button>
        </div>
      </div>

      {/* Flagged Warning */}
      {walletData.flagged && (
        <div
          className="bg-red-50 dark:bg-red-900/20 border border-red-200
                        dark:border-red-800 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 dark:text-red-400 font-medium text-sm">
              Wallet Flagged
            </p>
            <p className="text-red-600 dark:text-red-500 text-xs mt-1">
              {walletData.flagReason ||
                "Please contact support for more information."}
            </p>
          </div>
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Balance Card */}
        <div
          className="md:col-span-2 bg-gradient-to-br from-green-600
                        to-emerald-700 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 opacity-80" />
              <span className="text-sm opacity-80">Available Balance</span>
            </div>
            <span className="text-xs bg-[#0a0e27]/20 px-2 py-1 rounded-full">
              {walletData.currency}
            </span>
          </div>

          <div className="text-4xl font-bold mb-1">
            ₹{walletData.balance.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>

          {walletData.reservedBalance > 0 && (
            <p className="text-sm opacity-70 mt-1">
              ₹
              {walletData.reservedBalance.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}{" "}
              reserved
            </p>
          )}

          {isLowBalance && (
            <div
              className="mt-4 bg-[#0a0e27]/20 backdrop-blur-sm rounded-xl p-3
                            flex items-center gap-2 text-sm"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                Low balance! Add money to avoid service interruption.
              </span>
            </div>
          )}

          {/* Month Usage Bar */}
          {walletData.maxMonthlyTopUp > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs opacity-70 mb-1">
                <span>Monthly top-up</span>
                <span>
                  ₹{walletData.currentMonthTopUp.toLocaleString("en-IN")} /
                  ₹{walletData.maxMonthlyTopUp.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="bg-[#0a0e27]/20 rounded-full h-1.5">
                <div
                  className="bg-[#0a0e27] rounded-full h-1.5 transition-all"
                  style={{
                    width: `${Math.min(
                      (walletData.currentMonthTopUp /
                        walletData.maxMonthlyTopUp) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Credit Card (if enabled) */}
        {walletData.creditEnabled ? (
          <div
            className="relative overflow-hidden bg-white/[0.02] rounded-2xl p-6
                          border border-white/[0.05] shadow-xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-400">
                Credit Line
              </span>
            </div>
            <div className="text-2xl font-bold text-white">
              ₹
              {walletData.availableCredit.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              of ₹{walletData.creditLimit.toLocaleString("en-IN")} limit
            </div>
            <div className="mt-3 bg-[#0a0e27]/[0.04] dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 rounded-full h-2 transition-all"
                style={{
                  width: `${walletData.creditLimit > 0
                      ? (walletData.creditUsed / walletData.creditLimit) * 100
                      : 0
                    }%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              ₹{walletData.creditUsed.toLocaleString("en-IN")} used
            </p>
          </div>
        ) : (
          /* Wallet Info Card (when no credit) */
          <div
            className="relative overflow-hidden bg-white/[0.02] rounded-2xl p-6
                          border border-white/[0.05] shadow-xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">
                Wallet Info
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400">Alert Threshold</p>
                <p className="font-semibold text-white text-sm">
                  ₹{walletData.lowBalanceThreshold.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Max Per Top-up</p>
                <p className="font-semibold text-white text-sm">
                  ₹{walletData.maxTopUpAmount.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="pt-2 border-t border-white/[0.08]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Template Rates Info */}
      <MetaRatesCard />

      {/* Stats Row */}
      <WalletStats
        totalCredited={walletData.totalCredited}
        totalDebited={walletData.totalDebited}
        lastTransactionAt={walletData.lastTransactionAt}
        availableBalance={walletData.availableBalance}
      />

      {/* Tabs */}
      <div
        className="relative overflow-hidden bg-white/[0.02] rounded-2xl border
                      border-white/[0.05] shadow-xl backdrop-blur-xl"
      >
        {/* Tab Headers */}
        <div className="flex border-b border-white/[0.1]">
          {([
            { id: "overview",     label: "📊 Overview" },
            { id: "transactions", label: "📋 Transactions" },
            { id: "analytics",   label: "📈 Analytics" },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3.5 text-sm font-medium capitalize
                          transition-all
                ${activeTab === tab.id
                  ? "text-emerald-500 border-b-2 border-emerald-500 bg-emerald-500/10"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" ? (
            <WalletOverview walletData={walletData} />
          ) : activeTab === "analytics" ? (
            <WalletAnalytics />
          ) : (
            <TransactionHistory />
          )}
        </div>
      </div>

      {/* Note */}
      <div
        className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4
                      border border-blue-200 dark:border-blue-800
                      flex items-start gap-3"
      >
        <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Security Note:</strong> Wallet balance can only be used for
          Meta API payments. Direct withdrawals are not allowed. All
          transactions are logged and audited.
        </p>
      </div>
    </div>
  );
};

// ─── Overview Tab Content ──────────────────────────────────────────────────────
const WalletOverview: React.FC<{ walletData: WalletData }> = ({
  walletData,
}) => (
  <div className="space-y-4">
    <h3 className="font-semibold text-white text-sm">
      Wallet Details
    </h3>

    <div className="grid grid-cols-2 gap-3">
      {[
        {
          label: "Total Added",
          value: `₹${walletData.totalCredited.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
          icon: ArrowUpRight,
          color: "text-green-600",
          bg: "bg-green-50 dark:bg-green-900/20",
        },
        {
          label: "Total Used",
          value: `₹${walletData.totalDebited.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
          icon: ArrowDownLeft,
          color: "text-red-600",
          bg: "bg-red-50 dark:bg-red-900/20",
        },
        {
          label: "Low Balance Alert",
          value: `Below ₹${walletData.lowBalanceThreshold.toLocaleString("en-IN")}`,
          icon: AlertTriangle,
          color: "text-yellow-600",
          bg: "bg-yellow-50 dark:bg-yellow-900/20",
        },
        {
          label: "Monthly Limit",
          value: `₹${walletData.maxMonthlyTopUp.toLocaleString("en-IN")}`,
          icon: CreditCard,
          color: "text-blue-600",
          bg: "bg-blue-50 dark:bg-blue-900/20",
        },
      ].map((item, i) => (
          className={`${item.bg.replace(/bg-.*50\s/, 'bg-white/[0.02] ')} rounded-xl p-4 border border-white/[0.05] relative overflow-hidden`}
          <div className="flex items-center gap-2 mb-1">
            <item.icon className={`w-4 h-4 ${item.color}`} />
            <span className="text-xs text-gray-400">
              {item.label}
            </span>
          </div>
          <div className="font-semibold text-white text-sm">
            {item.value}
          </div>
        </div>
      ))}
    </div>

    {walletData.lastTransactionAt && (
      <p className="text-xs text-gray-400 text-center">
        Last transaction:{" "}
        {new Date(walletData.lastTransactionAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    )}
  </div>
);

// ─── Main Wallet Page ──────────────────────────────────────────────────────────
const WalletPage: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { hasAccess } = usePlanAccess();

  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showRequest, setShowRequest] = useState(false);

  const fetchWallet = useCallback(async () => {
    // If auth is still loading, wait
    if (isAuthLoading) return;

    // If not authenticated, we shouldn't even be here, but safety first
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    // If no plan access, don't fetch from API
    if (!hasAccess('wallet')) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await walletApi.getWallet();
      if (res.data?.success) {
        setWalletData(res.data.data);
      } else {
        throw new Error(res.data?.message || "Failed to load wallet data");
      }
    } catch (err: any) {
      console.error("Wallet Fetch Error:", err);
      toast.error(
        err?.response?.data?.message || err.message || "Failed to load wallet data"
      );
    } finally {
      setLoading(false);
    }
  }, [hasAccess, isAuthenticated, isAuthLoading]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  if (isAuthLoading || (loading && !walletData)) {
    return <WalletSkeleton />;
  }

  // Check access first
  if (!hasAccess('wallet')) {
    return <LockedWalletView />;
  }

  // Not active
  if (!walletData?.isActive) {
    return (
      <>
        <NotActiveView
          walletData={walletData}
          onRequestAccess={() => setShowRequest(true)}
        />
        {showRequest && (
          <WalletRequestModal
            onClose={() => setShowRequest(false)}
            onSuccess={fetchWallet}
          />
        )}
      </>
    );
  }

  // Active wallet
  return (
    <>
      <ActiveWalletView
        walletData={walletData}
        onAddMoney={() => setShowTopUp(true)}
        onRefresh={fetchWallet}
      />

      {showTopUp && (
        <WalletTopUpModal
          currentBalance={walletData.balance}
          maxTopUp={walletData.maxTopUpAmount}
          maxMonthlyRemaining={
            walletData.maxMonthlyTopUp - walletData.currentMonthTopUp
          }
          onClose={() => setShowTopUp(false)}
          onSuccess={fetchWallet}
        />
      )}
    </>
  );
};

export default WalletPage;
