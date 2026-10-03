// src/components/admin/TeamOsSyncCard.tsx
//
// Whether clients, the admin team and money are actually reaching TeamOS.
//
// The sync is built to fail quietly: a receiver that is down is retried on a
// timer rather than shouted about, and an event that will never be accepted is
// parked instead of retried forever. That is only safe if somebody can see the
// queue. Without this card the parked events pile up and nobody finds out
// until a month's revenue is missing over there.

import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Loader2, RefreshCw, RotateCcw, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { admin } from '../../services/api';
import { adminCan } from '../../utils/adminPermissions';

interface SyncError {
  kind: string;
  externalId: string;
  attempts: number;
  lastError: string | null;
}

interface SyncStatus {
  configured: boolean;
  pending: number;
  delivered: number;
  dead: number;
  oldestPendingAt: string | null;
  lastDeliveredAt: string | null;
  recentErrors: SyncError[];
  target: string | null;
  scope: 'owned' | 'all' | null;
}

const errorText = (err: any, fallback: string) =>
  err?.response?.data?.message || err?.response?.data?.errors?.[0]?.message || fallback;

/** "4 minutes ago", and plain enough that a stuck queue is obvious. */
const ago = (iso: string | null): string => {
  if (!iso) return 'never';
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

/**
 * A pending queue is normal; a pending queue that is not moving is not.
 *
 * Ten minutes is comfortably more than the one-minute tick, so anything older
 * than that has failed at least a few times.
 */
const STUCK_AFTER_MS = 10 * 60 * 1000;
const isStuck = (oldest: string | null) => !!oldest && Date.now() - new Date(oldest).getTime() > STUCK_AFTER_MS;

const Tile: React.FC<{ label: string; value: string; tone?: 'plain' | 'warn' | 'bad'; help?: string }> = ({
  label,
  value,
  tone = 'plain',
  help,
}) => (
  <div
    className={`rounded-xl border p-4 ${
      tone === 'bad'
        ? 'border-red-200 bg-red-50'
        : tone === 'warn'
          ? 'border-amber-200 bg-amber-50'
          : 'border-gray-200 bg-gray-50'
    }`}
  >
    <p className="text-xs text-gray-500">{label}</p>
    <p
      className={`text-2xl font-bold mt-1 ${
        tone === 'bad' ? 'text-red-700' : tone === 'warn' ? 'text-amber-700' : 'text-gray-900'
      }`}
    >
      {value}
    </p>
    {help && <p className="text-xs text-gray-500 mt-1">{help}</p>}
  </div>
);

const TeamOsSyncCard: React.FC = () => {
  const canWrite = adminCan('settings.write');
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<'run' | 'retry' | null>(null);

  const load = useCallback(
    (quiet = false) =>
      admin
        .getTeamosSync()
        .then((r) => setStatus(r.data.data))
        .catch((err) => {
          if (!quiet) toast.error(errorText(err, 'Could not read the TeamOS sync status'));
        })
        .finally(() => setLoading(false)),
    [],
  );

  useEffect(() => {
    load();
    // The queue moves on a one-minute tick, so refreshing at the same rate
    // keeps the card honest without polling for nothing. Quietly: a failed
    // background refresh must not throw a toast at somebody reading the page.
    const timer = setInterval(() => load(true), 60_000);
    return () => clearInterval(timer);
  }, [load]);

  const act = async (which: 'run' | 'retry') => {
    setBusy(which);
    try {
      const res = which === 'run' ? await admin.runTeamosSync() : await admin.retryTeamosSync();
      toast.success(res.data.message || 'Done');
      await load();
    } catch (err) {
      toast.error(errorText(err, which === 'run' ? 'Could not run the sync' : 'Could not retry'));
    } finally {
      setBusy(null);
    }
  };

  if (!adminCan('settings.read')) return null;

  const stuck = isStuck(status?.oldestPendingAt ?? null);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10">
            <Share2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">TeamOS sync</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Clients, the admin team and money received are pushed to TeamOS every minute.
            </p>
          </div>
        </div>

        {canWrite && status?.configured && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => act('run')}
              disabled={busy !== null}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {busy === 'run' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Sync now
            </button>
            {!!status.dead && (
              <button
                onClick={() => act('retry')}
                disabled={busy !== null}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-50"
              >
                {busy === 'retry' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                Retry {status.dead} given up
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-6">
          <Loader2 className="w-4 h-4 animate-spin" />
          Reading the queue…
        </div>
      ) : !status ? (
        <p className="text-sm text-gray-500 mt-6">The sync status could not be read.</p>
      ) : !status.configured ? (
        <div className="mt-5 flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
          <Clock className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-gray-900">Not switched on</p>
            <p className="text-gray-500 mt-1">
              Set <code className="px-1 py-0.5 bg-gray-200 rounded text-xs">TEAMOS_SYNC_URL</code> and{' '}
              <code className="px-1 py-0.5 bg-gray-200 rounded text-xs">TEAMOS_SYNC_SECRET</code> on the server. Until
              both are set nothing is queued or sent.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mt-5">
            <Tile
              label="Waiting"
              value={String(status.pending)}
              tone={stuck ? 'warn' : 'plain'}
              help={status.pending ? `oldest ${ago(status.oldestPendingAt)}` : 'nothing in the queue'}
            />
            <Tile label="Delivered" value={String(status.delivered)} help={`last ${ago(status.lastDeliveredAt)}`} />
            <Tile
              label="Given up on"
              value={String(status.dead)}
              tone={status.dead ? 'bad' : 'plain'}
              help={status.dead ? 'needs a look, then Retry' : 'none'}
            />
            <Tile
              label="Sending to"
              value={status.target ?? '—'}
              help={status.scope === 'all' ? 'every organization' : 'onboarder-owned clients'}
            />
          </div>

          {stuck && (
            <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-900">The queue is not moving</p>
                <p className="text-amber-800 mt-1">
                  The oldest waiting event is from {ago(status.oldestPendingAt)}, and the sync runs every minute. Check
                  the errors below — a wrong URL or secret is the usual cause.
                </p>
              </div>
            </div>
          )}

          {!status.pending && !status.dead && status.delivered > 0 && (
            <div className="mt-4 flex items-center gap-2 text-sm text-green-700">
              <CheckCircle2 className="w-4 h-4" />
              Everything has been delivered.
            </div>
          )}

          {status.recentErrors.length > 0 && (
            <div className="mt-5">
              <h4 className="text-sm font-medium text-gray-900">Recent errors</h4>
              <div className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                {status.recentErrors.map((e) => (
                  <div key={`${e.kind}:${e.externalId}`} className="p-3 bg-white">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <span className="text-xs font-mono text-gray-700">{e.externalId}</span>
                      <span className="text-xs text-gray-400">
                        {e.attempts} attempt{e.attempts === 1 ? '' : 's'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 break-words">{e.lastError}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                “has not been synced yet” fixes itself on the next run — the client is sent before its payments.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeamOsSyncCard;
