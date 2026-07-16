// src/components/campaigns/WalletCostModal.tsx - FIXED
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, CheckCircle, Wallet, X,
  Globe, TrendingUp, Info, ArrowRight, ChevronDown,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────
interface CountryBreakdown {
  country: string;
  count: number;
  rate: number;
  cost: number;
}

interface CostBreakdown {
  totalRecipients: number;
  ratePerMessage: number;
  category: string;
  language: string;
  countryBreakdown: CountryBreakdown[];
}

export interface CostEstimate {
  hasWallet: boolean;
  walletActive: boolean;
  availableBalance: number;
  estimatedCost: number;
  estimatedCostBreakdown?: CostBreakdown | null;
  canProceed: boolean;
  shortfall: number;
  currency: string;
}

interface WalletCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  estimate: CostEstimate | null;
  loading: boolean;
  campaignName: string;
}

// ─── Helpers ─────────────────────────────────────────────────
const formatINR = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);

const getCategoryColor = (category: string): string => {
  const u = (category || '').toUpperCase();
  if (u.includes('MARKETING')) return 'text-purple-600 bg-purple-100';
  if (u.includes('UTIL')) return 'text-blue-600 bg-blue-100';
  if (u.includes('AUTH')) return 'text-orange-600 bg-orange-100';
  return 'text-gray-600 bg-gray-100';
};

// ─── Country Table ────────────────────────────────────────────
const CountryTable: React.FC<{ breakdown: CostBreakdown }> = ({ breakdown }) => {
  // ✅ FIX Bug4: Expandable country list
  const [expanded, setExpanded] = useState(false);
  const SHOW_LIMIT = 8;
  const items = expanded
    ? breakdown.countryBreakdown
    : breakdown.countryBreakdown.slice(0, SHOW_LIMIT);
  const hasMore = breakdown.countryBreakdown.length > SHOW_LIMIT;

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300
                     mb-2 flex items-center gap-2">
        <Globe className="w-4 h-4 text-primary-500" />
        Country-wise Breakdown
      </h3>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden
                      border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {['Country', 'Recipients', 'Rate', 'Cost'].map((h, i) => (
                <th
                  key={h}
                  className={`py-2.5 px-3 text-xs font-semibold
                              text-gray-500 dark:text-gray-400
                              ${i === 0 ? 'text-left' : 'text-right'}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-100 dark:border-gray-700/50
                           last:border-0 hover:bg-gray-100
                           dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="py-2.5 px-3 font-medium text-gray-900
                               dark:text-gray-100">
                  {item.country}
                </td>
                <td className="py-2.5 px-3 text-right text-gray-600
                               dark:text-gray-400">
                  {item.count.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-right text-gray-600
                               dark:text-gray-400">
                  {formatINR(item.rate)}
                </td>
                <td className="py-2.5 px-3 text-right font-semibold
                               text-gray-900 dark:text-gray-100">
                  {formatINR(item.cost)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 dark:bg-gray-700/50">
              <td colSpan={3}
                className="py-2.5 px-3 font-bold text-gray-900
                             dark:text-gray-100 text-xs">
                TOTAL ({breakdown.totalRecipients.toLocaleString()} recipients)
              </td>
              <td className="py-2.5 px-3 text-right font-bold text-gray-900
                             dark:text-gray-100">
                {formatINR(
                  breakdown.countryBreakdown.reduce((s, i) => s + i.cost, 0)
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ✅ FIX Bug4: Expand button */}
      {hasMore && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full mt-2 py-1.5 text-xs text-gray-500
                     hover:text-gray-700 dark:hover:text-gray-300
                     flex items-center justify-center gap-1 transition-colors"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
          {expanded
            ? 'Show less'
            : `Show ${breakdown.countryBreakdown.length - SHOW_LIMIT} more countries`}
        </button>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────
const WalletCostModal: React.FC<WalletCostModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  estimate,
  loading,
  campaignName,
}) => {
  // ✅ FIX Bug1: Use navigate instead of window.location.href
  const navigate = useNavigate();

  if (!isOpen) return null;

  // ── Loading state ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl
                        shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30
                          rounded-full flex items-center justify-center
                          mx-auto mb-4 animate-pulse">
            <Wallet className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Calculating Cost...
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Analyzing recipients and computing country-wise rates
          </p>
          <div className="mt-6 flex gap-1 justify-center">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!estimate) return null;

  // ── No wallet case ───────────────────────────────────────────
  if (!estimate.hasWallet) {
    // ✅ FIX Bug2: Safe access with optional chaining
    const recipients =
      estimate.estimatedCostBreakdown?.totalRecipients ?? 0;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl
                        shadow-2xl w-full max-w-md p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100
                       dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30
                            rounded-full flex items-center justify-center
                            mx-auto mb-4">
              <Info className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              No Wallet Connected
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Campaign charges will be billed directly by Meta to your
              registered payment method.
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4
                          mb-6 text-sm text-blue-700 dark:text-blue-300">
            <strong>"{campaignName}"</strong> will send to{' '}
            <strong>{recipients.toLocaleString()}</strong> recipients.
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200
                         dark:border-gray-700 text-gray-700 dark:text-gray-300
                         rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800
                         font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose(); // ✅ FIX Bug5: Close modal first
                onConfirm();
              }}
              className="flex-1 px-4 py-3 bg-primary-500 text-white
                         rounded-xl hover:bg-primary-600 font-medium
                         transition-colors flex items-center
                         justify-center gap-2"
            >
              Proceed <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main modal ───────────────────────────────────────────────
  const insufficient = !estimate.canProceed &&
    estimate.hasWallet &&
    estimate.walletActive;

  // ✅ FIX Bug2: Safe breakdown access
  const breakdown = estimate.estimatedCostBreakdown;
  const totalRecipients = breakdown?.totalRecipients ?? 0;
  const ratePerMessage = breakdown?.ratePerMessage ?? 0;
  const category = breakdown?.category ?? 'UTILITY';
  const language = breakdown?.language ?? 'en';
  const afterBalance = estimate.availableBalance - estimate.estimatedCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl
                      shadow-2xl w-full max-w-lg overflow-hidden">

        {/* ── Header ── */}
        <div
          className={`px-6 py-5 ${insufficient
              ? 'bg-gradient-to-r from-red-500 to-red-600'
              : 'bg-gradient-to-r from-primary-500 to-primary-600'
            }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl
                              flex items-center justify-center">
                {insufficient
                  ? <AlertTriangle className="w-5 h-5 text-white" />
                  : <Wallet className="w-5 h-5 text-white" />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {insufficient
                    ? 'Insufficient Balance'
                    : 'Campaign Cost Summary'}
                </h2>
                <p className="text-white/80 text-xs truncate max-w-[200px]">
                  {campaignName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">

          {/* Insufficient Warning */}
          {insufficient && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200
                            dark:border-red-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-400 text-sm">
                    Wallet balance insufficient!
                  </p>
                  <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                    You need{' '}
                    <span className="font-bold">
                      {formatINR(estimate.shortfall)}
                    </span>{' '}
                    more to run this campaign.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Balance Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4
                            border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 mb-1">Wallet Balance</p>
              <p className={`text-xl font-bold ${insufficient
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
                }`}>
                {formatINR(estimate.availableBalance)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Available</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4
                            border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 mb-1">Estimated Cost</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {formatINR(estimate.estimatedCost)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {totalRecipients.toLocaleString()} recipients
              </p>
            </div>
          </div>

          {/* After Campaign Balance */}
          {!insufficient && (
            <div className="bg-green-50 dark:bg-green-900/20 border
                            border-green-200 dark:border-green-800
                            rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-700
                                 dark:text-green-400">
                  Balance after campaign
                </span>
              </div>
              <span className="text-lg font-bold text-green-700
                               dark:text-green-400">
                {formatINR(Math.max(0, afterBalance))}
              </span>
            </div>
          )}

          {/* Info Row */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                              ${getCategoryColor(category)}`}>
              {category}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Globe className="w-3.5 h-3.5" />
              <span>{language}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Avg {formatINR(ratePerMessage)}/msg</span>
            </div>
          </div>

          {/* Country Breakdown */}
          {breakdown &&
            (breakdown.countryBreakdown?.length ?? 0) > 0 && (
              <CountryTable breakdown={breakdown} />
            )}

          {/* Note */}
          <div className="flex items-start gap-2 text-xs text-gray-500
                          bg-gray-50 dark:bg-gray-800 rounded-lg p-3
                          border border-gray-200 dark:border-gray-700">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              Cost is estimated based on Meta's country-wise pricing.
              Actual cost may vary slightly based on message delivery.
              Failed messages are not charged.
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50
                        border-t border-gray-200 dark:border-gray-700
                        flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-200
                       dark:border-gray-700 text-gray-700 dark:text-gray-300
                       rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700
                       font-medium transition-colors"
          >
            Cancel
          </button>

          {insufficient ? (
            // ✅ FIX Bug1: navigate() instead of window.location.href
            <button
              onClick={() => {
                onClose();
                navigate('/dashboard/wallet');
              }}
              className="flex-1 px-4 py-3 bg-red-500 text-white
                         rounded-xl hover:bg-red-600 font-medium
                         transition-colors flex items-center
                         justify-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              Top Up Wallet
            </button>
          ) : (
            <button
              onClick={() => {
                onClose(); // ✅ FIX Bug5: Close BEFORE confirming
                onConfirm();
              }}
              className="flex-1 px-4 py-3 bg-primary-500 text-white
                         rounded-xl hover:bg-primary-600 font-medium
                         transition-colors flex items-center
                         justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Confirm & Start
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletCostModal;