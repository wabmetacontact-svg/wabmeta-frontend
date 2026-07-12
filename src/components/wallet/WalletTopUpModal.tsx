// src/components/wallet/WalletTopUpModal.tsx - BULLETPROOF

import React, { useState, useEffect } from "react";
import {
  X, CreditCard, Loader2, CheckCircle, Info, AlertCircle, RefreshCw,
} from "lucide-react";
import { wallet as walletApi } from "../../services/api";
import toast from "react-hot-toast";

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

// ✅ LocalStorage key for tracking in-flight payments
const PENDING_PAYMENT_KEY = 'wabmeta_pending_payment';

interface PendingPayment {
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  timestamp: number;
}

const WalletTopUpModal: React.FC<Props> = ({
  currentBalance,
  maxTopUp,
  maxMonthlyRemaining,
  onClose,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showRetry, setShowRetry] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);

  const effectiveMax = Math.min(maxTopUp, maxMonthlyRemaining);

  // ✅ Check for pending payment on mount (if user reopened after failed verify)
  useEffect(() => {
    const stored = localStorage.getItem(PENDING_PAYMENT_KEY);
    if (stored) {
      try {
        const payment: PendingPayment = JSON.parse(stored);
        // Only show if within last 30 minutes
        if (Date.now() - payment.timestamp < 30 * 60 * 1000) {
          setPendingPayment(payment);
          setShowRetry(true);
        } else {
          localStorage.removeItem(PENDING_PAYMENT_KEY);
        }
      } catch {}
    }
  }, []);

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

  // ✅ BULLETPROOF verify with retries
  const verifyPayment = async (params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    amount: number;
    maxRetries?: number;
  }) => {
    const { maxRetries = 3 } = params;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Verify attempt ${attempt}/${maxRetries}`);
        
        const res = await walletApi.verifyTopUp({
          razorpayOrderId: params.razorpayOrderId,
          razorpayPaymentId: params.razorpayPaymentId,
          razorpaySignature: params.razorpaySignature,
          amount: params.amount,
        });

        // ✅ Success - clear pending
        localStorage.removeItem(PENDING_PAYMENT_KEY);
        return res.data;
      } catch (err: any) {
        lastError = err;
        console.error(`❌ Verify attempt ${attempt} failed:`, err.message);
        
        // Wait before retry (1s, 2s, 4s)
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
        }
      }
    }

    throw lastError;
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
        throw new Error("Razorpay not loaded. Please refresh and try again.");
      }

      // ✅ Save order to localStorage IMMEDIATELY (before payment)
      const pending: PendingPayment = {
        razorpayOrderId: orderId,
        amount: numAmount,
        timestamp: Date.now(),
      };
      localStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(pending));

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
          setVerifying(true);
          
          // ✅ Update localStorage with payment ID
          const updated: PendingPayment = {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            amount: numAmount,
            timestamp: Date.now(),
          };
          localStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(updated));

          try {
            // ✅ BULLETPROOF verify with 3 retries
            await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              amount: numAmount,
            });

            setSuccess(true);
            setVerifying(false);
            toast.success(`₹${numAmount.toLocaleString("en-IN")} added to wallet!`);
            
            setTimeout(() => {
              onSuccess();
              onClose();
            }, 2000);
          } catch (verifyErr: any) {
            console.error('❌ All verify attempts failed:', verifyErr);
            
            // ✅ Show retry UI - payment gone through but verify failed
            setVerifying(false);
            setLoading(false);
            setPendingPayment(updated);
            setShowRetry(true);
            
            toast.error(
              'Payment successful but verification failed. Please click "Verify Payment" below.',
              { duration: 8000 }
            );
          }
        },
        prefill: {},
        theme: { color: "#16a34a" },
        modal: {
          ondismiss: () => {
            setLoading(false);
            // ✅ Don't clear localStorage - user might have paid
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response: any) => {
        setError(response?.error?.description || "Payment failed. Please try again.");
        setLoading(false);
        // Payment failed = clear localStorage
        localStorage.removeItem(PENDING_PAYMENT_KEY);
      });
      razorpay.open();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to initiate payment";
      setError(msg);
      setLoading(false);
      localStorage.removeItem(PENDING_PAYMENT_KEY);
    }
  };

  // ✅ Manual retry for stuck payments
  const handleRetryVerification = async () => {
    if (!pendingPayment) return;

    setVerifying(true);
    setError("");

    try {
      const res = await (walletApi as any).retryTopUp?.({
        razorpayOrderId: pendingPayment.razorpayOrderId,
        razorpayPaymentId: pendingPayment.razorpayPaymentId,
      }) || await fetch('/api/wallet/topup/retry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          razorpayOrderId: pendingPayment.razorpayOrderId,
          razorpayPaymentId: pendingPayment.razorpayPaymentId,
        }),
      }).then(r => r.json());

      if (res?.data?.success || res?.success) {
        localStorage.removeItem(PENDING_PAYMENT_KEY);
        setPendingPayment(null);
        setShowRetry(false);
        setSuccess(true);
        toast.success(`₹${pendingPayment.amount.toLocaleString("en-IN")} added to wallet!`);
        
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        throw new Error(res?.message || 'Verification failed');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Retry failed. Please contact support.';
      setError(msg);
      toast.error(msg, { duration: 8000 });
    } finally {
      setVerifying(false);
    }
  };

  const clearPendingAndStart = () => {
    localStorage.removeItem(PENDING_PAYMENT_KEY);
    setPendingPayment(null);
    setShowRetry(false);
    setError("");
  };

  // ── Success State ────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full mx-4 shadow-2xl">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Money Added!</h3>
          <p className="text-gray-500">
            ₹{Number(amount || pendingPayment?.amount || 0).toLocaleString("en-IN")} added to your wallet
          </p>
        </div>
      </div>
    );
  }

  // ── Pending Payment Recovery UI ──────────────────────────────────────
  if (showRetry && pendingPayment) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900">Pending Payment</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-orange-800 mb-1">
                💳 Pending Payment Detected
              </p>
              <p className="text-xs text-orange-700 mb-2">
                We found a payment of{" "}
                <span className="font-bold">₹{pendingPayment.amount.toLocaleString("en-IN")}</span>{" "}
                that may not have been credited to your wallet.
              </p>
              <p className="text-xs text-orange-600 font-mono">
                Order: {pendingPayment.razorpayOrderId}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs text-blue-700">
                💡 Click "Verify Payment" below. If payment was successful on Razorpay,
                your wallet will be credited immediately.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleRetryVerification}
                disabled={verifying}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" /> Verify Payment
                  </>
                )}
              </button>
              <button
                onClick={clearPendingAndStart}
                disabled={verifying}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm"
              >
                Start New
              </button>
            </div>

            <p className="text-center text-xs text-gray-500">
              Still not working? Contact support with Order ID above.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Modal ───────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Add Money to Wallet</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading || verifying}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {verifying && (
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Verifying Payment...</p>
                <p className="text-xs text-blue-700">Please don't close this window</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 space-y-5">
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-sm text-green-600 mb-1">Current Balance</p>
            <p className="text-2xl font-bold text-green-700">
              ₹{currentBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2 font-medium">Quick Select</p>
            <div className="grid grid-cols-5 gap-2">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleQuickSelect(amt)}
                  disabled={amt > effectiveMax || verifying}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed
                    ${amount === amt.toString()
                      ? "bg-green-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-green-50"
                    }`}
                >
                  {amt >= 1000 ? `₹${amt / 1000}K` : `₹${amt}`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2 font-medium">Enter Amount (₹)</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-lg">
                ₹
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
                disabled={verifying}
                placeholder="Enter amount"
                min={100}
                max={effectiveMax}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Min: ₹100 • Max per transaction: ₹{effectiveMax.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3 border border-blue-100">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              This amount will be used exclusively for Meta API payments. Secure payment via Razorpay.
              If payment succeeds but wallet not credited, we auto-verify within 5 minutes.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleTopUp}
            disabled={loading || verifying || !amount || Number(amount) <= 0}
            className="w-full py-3.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" /> Pay ₹
                {Number(amount || 0).toLocaleString("en-IN")} Securely
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
