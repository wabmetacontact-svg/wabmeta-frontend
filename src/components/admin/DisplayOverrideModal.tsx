import { useEffect, useState } from 'react';
import { X, Loader2, RefreshCw, Info } from 'lucide-react';
import { admin } from '../../services/api';
import toast from 'react-hot-toast';

// Meta in dono ko khud assign karta hai aur koi API unhe set nahi karne deti.
// Ye modal sirf ye tay karta hai ki WabMeta me user ko KYA DIKHE - Meta par
// kuch nahi badalta, aur campaign ki send speed hamesha Meta ke asli tier se
// hi chalti hai.

const QUALITY = ['GREEN', 'YELLOW', 'RED', 'UNKNOWN'] as const;
const TIERS = [
  'TIER_250',
  'TIER_1K',
  'TIER_2K',
  'TIER_10K',
  'TIER_100K',
  'TIER_UNLIMITED',
] as const;

const TIER_LABEL: Record<string, string> = {
  TIER_250: '250 / day',
  TIER_1K: '1,000 / day',
  TIER_2K: '2,000 / day',
  TIER_10K: '10,000 / day',
  TIER_100K: '100,000 / day',
  TIER_UNLIMITED: 'Unlimited',
};

const QUALITY_DOT: Record<string, string> = {
  GREEN: 'bg-emerald-500',
  YELLOW: 'bg-amber-500',
  RED: 'bg-red-500',
  UNKNOWN: 'bg-slate-400',
};

export interface OverrideTarget {
  id: string;
  phoneNumber: string;
  /** Meta ki asli values */
  qualityRating?: string | null;
  messagingLimit?: string | null;
  codeVerificationStatus?: string | null;
  /** Abhi jo override laga hai */
  qualityRatingOverride?: string | null;
  messagingLimitOverride?: string | null;
  codeVerificationOverride?: string | null;
  overrideSetBy?: string | null;
  overrideSetAt?: string | null;
}

interface Props {
  account: OverrideTarget | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function DisplayOverrideModal({ account, onClose, onSaved }: Props) {
  const [quality, setQuality] = useState<string>('');
  const [tier, setTier] = useState<string>('');
  const [verification, setVerification] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [meta, setMeta] = useState<{
    quality?: string | null;
    tier?: string | null;
    verification?: string | null;
  }>({});

  useEffect(() => {
    if (!account) return;
    setQuality(account.qualityRatingOverride || '');
    setTier(account.messagingLimitOverride || '');
    setVerification(account.codeVerificationOverride || '');
    setMeta({
      quality: account.qualityRating,
      tier: account.messagingLimit,
      verification: account.codeVerificationStatus,
    });
  }, [account]);

  if (!account) return null;

  const hasOverride = !!(
    account.qualityRatingOverride ||
    account.messagingLimitOverride ||
    account.codeVerificationOverride
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const { data } = await admin.refreshWhatsAppAccount(account.id);
      const fresh = data?.data?.account;
      if (fresh) {
        setMeta({
          quality: fresh.qualityRating,
          tier: fresh.messagingLimit,
          verification: fresh.codeVerificationStatus,
        });
      }
      toast.success('Pulled the latest values from Meta');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Could not reach Meta');
    } finally {
      setRefreshing(false);
    }
  };

  const save = async (clear = false) => {
    setSaving(true);
    try {
      await admin.setWhatsAppDisplayOverrides(account.id, {
        qualityRating: clear ? null : quality || null,
        messagingLimit: clear ? null : tier || null,
        verificationStatus: clear ? null : verification || null,
      });
      toast.success(clear ? 'Override removed' : 'Display values updated');
      onSaved();
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Displayed values</h3>
            <p className="text-sm text-slate-500 mt-0.5">{account.phoneNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Ye kya karta hai, aur kya nahi */}
          <div className="flex gap-2.5 rounded-xl bg-blue-50 border border-blue-100 p-3.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[13px] leading-relaxed text-blue-900">
              These values only change what the customer sees inside WabMeta.
              Nothing is changed on Meta, and campaign sending speed always
              follows the real tier from Meta.
            </p>
          </div>

          {/* Meta kya kehta hai */}
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Real values from Meta
              </span>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 disabled:opacity-60"
              >
                {refreshing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Refresh
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 text-xs mb-1">Quality rating</p>
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-900">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      QUALITY_DOT[String(meta.quality || 'UNKNOWN').toUpperCase()] ||
                      'bg-slate-400'
                    }`}
                  />
                  {meta.quality || 'Unknown'}
                </span>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Messaging tier</p>
                <span className="font-medium text-slate-900">
                  {meta.tier ? TIER_LABEL[meta.tier] || meta.tier : 'Not assigned'}
                </span>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500 text-xs mb-1">Verification</p>
                <span className="font-medium text-slate-900">
                  {meta.verification
                    ? meta.verification.replace(/_/g, ' ').toLowerCase()
                        .replace(/^./, (c) => c.toUpperCase())
                    : 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Overrides */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Show quality rating as
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Use the value from Meta</option>
                {QUALITY.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Show verification as
              </label>
              <select
                value={verification}
                onChange={(e) => setVerification(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Use the value from Meta</option>
                <option value="VERIFIED">Verified</option>
                <option value="NOT_VERIFIED">Not Verified</option>
                <option value="PENDING">Pending</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Show messaging tier as
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Use the value from Meta</option>
                {TIERS.map((t) => (
                  <option key={t} value={t}>
                    {TIER_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasOverride && account.overrideSetBy && (
            <p className="text-xs text-slate-500">
              Last set by {account.overrideSetBy}
              {account.overrideSetAt
                ? ` on ${new Date(account.overrideSetAt).toLocaleString('en-IN')}`
                : ''}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100">
          <button
            onClick={() => save(true)}
            disabled={saving || !hasOverride}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-40"
          >
            Remove override
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => save(false)}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
