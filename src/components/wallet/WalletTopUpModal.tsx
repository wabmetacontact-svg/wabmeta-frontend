// src/components/wallet/WalletTopUpModal.tsx

import React, { useState } from "react";
import {
  X,
  CreditCard,
  Loader2,
  CheckCircle,
  Info,
  AlertCircle,
} from "lucide-react";
import { wallet as walletApi } from "../../services/api";
import toast from "react-hot-toast";

// Razorpay global type
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Props {
  currentBalance: number;
  maxTopUp: number;
  maxMonthlyRemaining: number;
  onClose: () => void;
  onSuccess: () => void;
}

const QUICK_AMOUNTS = [200, 500, 1000, 2000, 5000];

const WalletTopUpModal: React.FC<Props> = ({
  currentBalance,
  maxTopUp,
  maxMonthlyRemaining,
  onClose,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const effectiveMax = Math.min(maxTopUp, maxMonthlyRemaining);

  const validateAmount = (val: number): string => {
    if (!val || isNaN(val)) return "Please enter an amount";
    if (val < 100) return "Minimum top-up amount is ₹100";
    if (val > effectiveMax)
      return `Maximum allowed is ₹${effectiveMax.toLocaleString("en-IN")}`;
    return "";
  };

  const handleQuickSelect = (amt: number) => {
    setAmount(amt.toString());
    setError("");
  };

  const handleTopUp = async () => {
    const numAmount = Number(amount);
    const validationError = validateAmount(numAmount);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 1: Create order
      const orderRes = await walletApi.createTopUpOrder(numAmount);
      const { orderId, razorpayKeyId } = orderRes.data.data;

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay not loaded. Please refresh and try again."
        );
      }

      // Step 2: Open Razorpay
      const options = {
        key: razorpayKeyId,
        amount: numAmount * 100,
        currency: "INR",
        name: "WabMeta",
        description: "Add money to Meta Payment Wallet",
        image: "/logo-192.png",
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // Step 3: Verify
            await walletApi.verifyTopUp({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              amount: numAmount,
            });

            setSuccess(true);
            toast.success(`₹${numAmount.toLocaleString("en-IN")} added to wallet!`);
            setTimeout(() => {
              onSuccess();
              onClose();
            }, 2000);
          } catch (verifyErr: any) {
            toast.error(
              verifyErr?.response?.data?.message || "Payment verification failed"
            );
            setLoading(false);
          }
        },
        prefill: {},
        theme: { color: "#16a34a" },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response: any) => {
        setError(
          response?.error?.description || "Payment failed. Please try again."
        );
        setLoading(false);
      });
      razorpay.open();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to initiate payment";
      setError(msg);
      setLoading(false);
    }
  };

  // ── Success State ────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl p-8
                        text-center max-w-sm w-full mx-4 shadow-2xl"
        >
          <div
            className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full
                          flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Money Added!
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            ₹{Number(amount).toLocaleString("en-IN")} added to your wallet
          </p>
        </div>
      </div>
    );
  }

  // ── Main Modal ───────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl
                      w-full max-w-md"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6
                        border-b border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Add Money to Wallet
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700
                       rounded-lg transition-all disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Current Balance */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
            <p className="text-sm text-green-600 dark:text-green-400 mb-1">
              Current Balance
            </p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              ₹
              {currentBalance.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>

          {/* Quick Select */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">
              Quick Select
            </p>
            <div className="grid grid-cols-5 gap-2">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleQuickSelect(amt)}
                  disabled={amt > effectiveMax}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all
                              disabled:opacity-40 disabled:cursor-not-allowed
                    ${amount === amt.toString()
                      ? "bg-green-600 text-white shadow-sm"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                    }`}
                >
                  {amt >= 1000 ? `₹${amt / 1000}K` : `₹${amt}`}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
              Enter Amount (₹)
            </label>
            <div className="relative">
              <span
                className="absolute left-4 top-1/2 -translate-y-1/2
                               text-gray-400 font-medium text-lg"
              >
                ₹
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
                placeholder="Enter amount"
                min={100}
                max={effectiveMax}
                className="w-full pl-8 pr-4 py-3 border border-gray-300
                           dark:border-gray-600 rounded-xl bg-white
                           dark:bg-gray-700 text-gray-900 dark:text-white
                           text-lg font-medium
                           focus:outline-none focus:ring-2 focus:ring-green-500
                           focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Min: ₹100 • Max per transaction: ₹
              {effectiveMax.toLocaleString("en-IN")}
            </p>
          </div>

          {/* Info */}
          <div
            className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20
                          rounded-xl p-3 border border-blue-100 dark:border-blue-800"
          >
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              This amount will be used exclusively for Meta API payments.
              Secure payment via Razorpay. No withdrawal allowed.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={handleTopUp}
            disabled={loading || !amount || Number(amount) <= 0}
            className="w-full py-3.5 bg-green-600 hover:bg-green-700
                       disabled:bg-gray-300 dark:disabled:bg-gray-600
                       disabled:cursor-not-allowed
                       text-white rounded-xl font-semibold transition-all
                       flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay ₹{Number(amount || 0).toLocaleString("en-IN")} Securely
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400">
            🔒 Powered by Razorpay • 256-bit SSL encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletTopUpModal;
