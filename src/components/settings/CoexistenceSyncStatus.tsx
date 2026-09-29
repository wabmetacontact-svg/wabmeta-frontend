// src/components/settings/CoexistenceSyncStatus.tsx
//
// WhatsApp Business app (coexistence) number ki purani chats aur contacts ka
// import status. Backend connect ke turant baad Meta se ye maangta hai
// (wabmeta-backend src/modules/meta/coexistence.ts). Meta har cheez ek hi baar
// aur connect ke 24 ghante tak hi deta hai - isliye fail hone par yahin se
// dobara maangne ka button hai.

import { useState } from 'react';
import { History, Loader2, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { meta as metaApi } from '../../services/api';

interface SyncStep {
  requestedAt?: string;
  error?: string;
}

export interface SmbSyncState {
  onboardedAt: string;
  contacts?: SyncStep;
  history?: SyncStep & { declined?: boolean; phase?: number; progress?: number; lastChunkAt?: string };
}

const WINDOW_MS = 24 * 60 * 60 * 1000;

export function CoexistenceSyncStatus({
  accountId,
  state,
  onUpdated,
}: {
  accountId: string;
  state: SmbSyncState;
  onUpdated: () => void;
}) {
  const [retrying, setRetrying] = useState(false);

  const pending = !state.contacts?.requestedAt || !state.history?.requestedAt;
  const windowLeftMs = new Date(state.onboardedAt).getTime() + WINDOW_MS - Date.now();
  const canRetry = pending && windowLeftMs > 0;
  const error = state.contacts?.error || state.history?.error;

  // Meta history 3 phase me bhejta hai (0-1 din, 1-90, 90-180); phase 2 ka 100% = poora.
  const done = state.history?.phase === 2 && state.history?.progress === 100;

  let tone = 'bg-blue-50 border-blue-200 text-blue-800';
  let icon = <Loader2 className="w-4 h-4 animate-spin" />;
  let text = 'Importing chats and contacts from your WhatsApp Business app. This can take a few minutes.';

  if (state.history?.declined) {
    tone = 'bg-amber-50 border-amber-200 text-amber-800';
    icon = <AlertTriangle className="w-4 h-4" />;
    text =
      'Chat history was not shared from the WhatsApp Business app, so old chats could not be imported. Contacts and new messages still sync.';
  } else if (done) {
    tone = 'bg-green-50 border-green-200 text-green-800';
    icon = <CheckCircle className="w-4 h-4" />;
    text = 'Chats (last 6 months) and contacts imported from your WhatsApp Business app.';
  } else if (pending && !canRetry) {
    tone = 'bg-slate-50 border-slate-200 text-slate-700';
    icon = <AlertTriangle className="w-4 h-4" />;
    text =
      'Old chats were not imported, and Meta only allows it within 24 hours of connecting. Disconnect and connect the number again to retry.';
  } else if (pending && error) {
    tone = 'bg-red-50 border-red-200 text-red-800';
    icon = <AlertTriangle className="w-4 h-4" />;
    text = `Could not start importing old chats: ${error}`;
  } else if (!pending && state.history?.progress != null) {
    text = `Importing chats... ${state.history.progress}% of phase ${Number(state.history.phase ?? 0) + 1} of 3.`;
  }

  const retry = async () => {
    setRetrying(true);
    try {
      await metaApi.coexistenceSync(accountId);
      toast.success('Chat import started');
      onUpdated();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not start the import');
    } finally {
      setRetrying(false);
    }
  };

  const hoursLeft = Math.max(1, Math.ceil(windowLeftMs / (60 * 60 * 1000)));

  return (
    <div className={`mx-4 mb-4 rounded-xl border p-3 flex flex-col sm:flex-row sm:items-center gap-3 ${tone}`}>
      <div className="flex items-start gap-2 flex-1 min-w-0">
        <History className="w-4 h-4 mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-bold flex items-center gap-1.5">
            {icon} WhatsApp Business app chats
          </p>
          <p className="text-xs mt-0.5">{text}</p>
        </div>
      </div>
      {canRetry && (
        <button
          onClick={retry}
          disabled={retrying}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold disabled:opacity-50 shrink-0"
          title={`Meta allows this for about ${hoursLeft} more hour(s)`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
          Import chats
        </button>
      )}
    </div>
  );
}
