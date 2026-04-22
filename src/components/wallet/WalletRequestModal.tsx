// src/components/wallet/WalletRequestModal.tsx

import React, { useState } from "react";
import {
  X,
  Wallet,
  CheckCircle,
  Loader2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { wallet as walletApi } from "../../services/api";
import toast from "react-hot-toast";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const COMMON_REASONS = [
  "I don't have an international credit/debit card for Meta payments",
  "Meta payments are not supported in my region",
  "I want WabMeta to manage Meta API billing on my behalf",
  "Corporate policy restricts direct Meta/Facebook payments",
];

const WalletRequestModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleQuickReason = (r: string) => {
    setReason(r);
    setError("");
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason");
      return;
    }
    if (reason.trim().length < 20) {
      setError("Please provide a more detailed reason (minimum 20 characters)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await walletApi.requestAccess({
        reason: reason.trim(),
        additionalInfo: additionalInfo.trim() || undefined,
      });

      setSuccess(true);
      toast.success("Wallet access request submitted!");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2500);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Failed to submit request";
      setError(msg);
    } finally {
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
            Request Submitted!
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Our team will review your request within 24 hours and notify you
            via email.
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
                      w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6
                        border-b border-gray-200 dark:border-gray-700 sticky top-0
                        bg-white dark:bg-gray-800 z-10"
        >
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-green-600" />
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Request Wallet Access
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Quick Reasons */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Select a common reason
            </label>
            <div className="space-y-2">
              {COMMON_REASONS.map((r, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickReason(r)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm
                              transition-all border flex items-start gap-2 group
                    ${reason === r
                      ? "bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300"
                      : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                >
                  <ChevronRight
                    className={`w-4 h-4 flex-shrink-0 mt-0.5 transition-transform
                    ${reason === r ? "rotate-90 text-green-500" : "text-gray-400"}`}
                  />
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Reason */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
              Your reason{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              placeholder="Describe why you need wallet access for Meta payments..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600
                         rounded-xl bg-white dark:bg-gray-700 text-gray-900
                         dark:text-white text-sm resize-none
                         focus:outline-none focus:ring-2 focus:ring-green-500
                         focus:border-transparent"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-400">Minimum 20 characters</p>
              <p
                className={`text-xs ${reason.length < 20 ? "text-red-400" : "text-gray-400"}`}
              >
                {reason.length}/500
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
              Additional information{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Any other details that might help..."
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600
                         rounded-xl bg-white dark:bg-gray-700 text-gray-900
                         dark:text-white text-sm
                         focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Requirements Note */}
          <div
            className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20
                          rounded-xl p-4 border border-amber-200 dark:border-amber-800"
          >
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
              <p className="font-semibold">Requirements:</p>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>Active subscription required</li>
                <li>Minimum 3-month subscription plan</li>
                <li>Admin will verify and respond within 24 hours</li>
              </ul>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 dark:border-gray-600
                         rounded-xl text-gray-700 dark:text-gray-300 font-medium
                         hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || reason.trim().length < 20}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700
                         disabled:bg-gray-300 dark:disabled:bg-gray-600
                         disabled:cursor-not-allowed
                         text-white rounded-xl font-semibold transition-all
                         flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Submit Request"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletRequestModal;
