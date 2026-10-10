// src/components/settings/GupshupActivationStatus.tsx
//
// Gupshup (credit line) par connect hue number ka activation haal. Connect ke
// baad backend Gupshup app link karta hai aur Gupshup number register karta
// hai; "live" hone tak is number se messages nahi jaate
// (wabmeta-backend src/modules/gupshup). Live hone par kuch nahi dikhta.

import { useState } from 'react';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { meta as metaApi } from '../../services/api';

export function GupshupActivationStatus({
  accountId,
  status,
  error,
  onUpdated,
}: {
  accountId: string;
  status: string | null | undefined;
  error?: string | null;
  onUpdated: () => void;
}) {
  const [retrying, setRetrying] = useState(false);

  // LIVE par subscription fail hui ho to bhi number chal raha hai - sirf
  // delivery ticks der se aa sakte hain. Tab bhi chhota sa retry dikhao.
  const liveWithIssue = status === 'LIVE' && !!error;
  if (status === 'LIVE' && !error) return null;

  const failed = status === 'ERROR' || liveWithIssue;

  const retry = async () => {
    setRetrying(true);
    try {
      await metaApi.gupshupLink(accountId);
      toast.success('Activation check started');
      onUpdated();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not retry activation');
    } finally {
      setRetrying(false);
    }
  };

  const tone = failed
    ? 'bg-red-50 border-red-200 text-red-800'
    : 'bg-blue-50 border-blue-200 text-blue-800';

  return (
    <div className={`mx-4 mb-4 rounded-xl border p-3 flex flex-col sm:flex-row sm:items-center gap-3 ${tone}`}>
      <div className="flex items-start gap-2 flex-1 min-w-0">
        {failed ? (
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
        ) : (
          <Loader2 className="w-4 h-4 mt-0.5 shrink-0 animate-spin" />
        )}
        <div className="min-w-0">
          <p className="text-xs font-bold">
            {liveWithIssue ? 'Number is live - delivery updates need attention' : failed ? 'Activation failed' : 'Activating your number'}
          </p>
          <p className="text-xs mt-0.5">
            {failed
              ? error || 'We could not finish activating this number. Please retry, or contact support if it keeps failing.'
              : 'Your number is being activated for messaging. This usually takes a few minutes; you can send messages once it is done.'}
          </p>
        </div>
      </div>
      {(failed || status !== 'LIVE') && (
        <button
          onClick={retry}
          disabled={retrying}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
          {failed ? 'Retry' : 'Check again'}
        </button>
      )}
    </div>
  );
}
