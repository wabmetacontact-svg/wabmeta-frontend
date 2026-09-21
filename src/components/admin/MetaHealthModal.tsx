// src/components/admin/MetaHealthModal.tsx
//
// Meta's full health answer for one WhatsApp number, for support.
//
// The customer only ever sees one line of reason. When a client says "it is
// not blocked" or "I already added a card", support needs what Meta actually
// said: the error code, which level it sits on - phone number, WABA, business
// portfolio or app - and how old the answer is. That last part settles the
// question that kept coming up: is this Meta's current view, or a stale copy?

import { useCallback, useEffect, useState } from 'react';
import {
  X,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ChevronDown,
  Copy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { admin } from '../../services/api';

type Level = 'AVAILABLE' | 'LIMITED' | 'BLOCKED' | 'UNKNOWN';

interface HealthError {
  code: number | null;
  description: string;
  solution: string | null;
  known: { title: string; action: string } | null;
}

interface HealthEntity {
  entity: string;
  id: string | null;
  canSend: Level;
  errors: HealthError[];
  info: string[];
}

interface HealthResponse {
  phoneNumber: string;
  wabaId: string;
  canSend: Level;
  summary: string | null;
  checkedAt: string | null;
  ageSeconds: number | null;
  refreshRequested: boolean;
  fetchedNow: boolean;
  entities: HealthEntity[];
  raw: unknown;
}

const ENTITY_LABEL: Record<string, string> = {
  PHONE_NUMBER: 'Phone number',
  WABA: 'WhatsApp Business Account',
  BUSINESS: 'Business portfolio',
  APP: 'App',
};

const LEVEL_STYLE: Record<Level, { label: string; cls: string; Icon: typeof CheckCircle2 }> = {
  AVAILABLE: { label: 'Can send', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
  LIMITED: { label: 'Limited', cls: 'bg-amber-50 text-amber-700 border-amber-200', Icon: AlertTriangle },
  BLOCKED: { label: 'Blocked', cls: 'bg-red-50 text-red-700 border-red-200', Icon: XCircle },
  UNKNOWN: { label: 'Unknown', cls: 'bg-gray-50 text-gray-600 border-gray-200', Icon: HelpCircle },
};

const ago = (seconds: number | null): string => {
  if (seconds === null) return 'never';
  if (seconds < 60) return 'just now';
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} hour${h === 1 ? '' : 's'} ago`;
  return `${Math.round(h / 24)} days ago`;
};

const LevelBadge = ({ level }: { level: Level }) => {
  const s = LEVEL_STYLE[level] || LEVEL_STYLE.UNKNOWN;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${s.cls}`}>
      <s.Icon className="w-3.5 h-3.5" />
      {s.label}
    </span>
  );
};

interface Props {
  account: { id: string; phoneNumber: string } | null;
  onClose: () => void;
}

export default function MetaHealthModal({ account, onClose }: Props) {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const load = useCallback(
    async (refresh: boolean) => {
      if (!account) return;
      setLoading(true);
      try {
        const res = await admin.getWhatsAppAccountHealth(account.id, refresh);
        const next: HealthResponse = res.data?.data;
        setData(next);
        if (refresh && !next?.fetchedNow) {
          toast.error('Meta did not answer - showing the last stored result.');
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load health');
      } finally {
        setLoading(false);
      }
    },
    [account]
  );

  useEffect(() => {
    setData(null);
    setShowRaw(false);
    if (account) load(false);
  }, [account, load]);

  if (!account) return null;

  const copyRaw = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data?.raw ?? null, null, 2));
      toast.success('Copied');
    } catch {
      toast.error('Could not copy');
    }
  };

  const problems = (data?.entities || []).flatMap((e) =>
    e.errors.map((err) => ({ entity: e.entity, err }))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 border-b border-gray-200">
          <div className="min-w-0">
            <h2 className="font-bold text-gray-900">Meta health</h2>
            <p className="text-sm text-gray-500 font-mono truncate">{account.phoneNumber}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          {!data && loading && (
            <div className="flex items-center justify-center py-10 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          )}

          {data && (
            <>
              {/* Overall + freshness */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-3">
                  <LevelBadge level={data.canSend} />
                  <span className="text-sm text-gray-600">
                    Checked with Meta <strong>{ago(data.ageSeconds)}</strong>
                    {data.checkedAt && (
                      <span className="text-gray-400"> · {new Date(data.checkedAt).toLocaleString()}</span>
                    )}
                  </span>
                </div>
                <button
                  onClick={() => load(true)}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Re-check with Meta
                </button>
              </div>

              {/* What to tell the client */}
              {problems.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">What to tell the client</h3>
                  {problems.map(({ entity, err }, i) => (
                    <div key={i} className="p-4 rounded-xl border border-red-200 bg-red-50/50">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        {err.code && (
                          <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                            {err.code}
                          </span>
                        )}
                        <span className="font-semibold text-sm text-gray-900">
                          {err.known?.title || 'Meta reported a problem'}
                        </span>
                        <span className="text-xs text-gray-500">on {ENTITY_LABEL[entity] || entity}</span>
                      </div>
                      {err.known && <p className="text-sm text-gray-800 leading-relaxed">{err.known.action}</p>}
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                        <span className="font-semibold">Meta said:</span> {err.description}
                        {err.solution ? ` ${err.solution}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {problems.length === 0 && data.entities.length > 0 && (
                <p className="text-sm text-emerald-700">Meta reports no problems on any level.</p>
              )}

              {data.entities.length === 0 && (
                <p className="text-sm text-gray-500">
                  No health data stored for this number yet. Press <strong>Re-check with Meta</strong>.
                </p>
              )}

              {/* Every level */}
              {data.entities.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">By level</h3>
                  <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl">
                    {data.entities.map((e) => (
                      <div key={e.entity} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900">{ENTITY_LABEL[e.entity] || e.entity}</p>
                          {e.id && <p className="text-[11px] text-gray-400 font-mono">{e.id}</p>}
                          {e.info.map((line, i) => (
                            <p key={i} className="text-xs text-gray-500 mt-0.5">{line}</p>
                          ))}
                        </div>
                        <LevelBadge level={e.canSend} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw */}
              <div>
                <button
                  onClick={() => setShowRaw((v) => !v)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showRaw ? 'rotate-180' : ''}`} />
                  Raw response from Meta
                </button>
                {showRaw && (
                  <div className="relative mt-2">
                    <button
                      onClick={copyRaw}
                      className="absolute top-2 right-2 p-1.5 rounded-md bg-white/10 text-gray-300 hover:text-white"
                      aria-label="Copy"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <pre className="text-[11px] leading-relaxed bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto max-h-72">
                      {JSON.stringify(data.raw ?? null, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
