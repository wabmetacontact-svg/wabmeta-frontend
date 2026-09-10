// src/pages/telegram/TelegramSettings.tsx
// Bot health + connection settings. Every status shown here is read live from
// Telegram's own getWebhookInfo — nothing is simulated.

import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings as SettingsIcon, CheckCircle2, AlertCircle,
  ShieldCheck, Send, ExternalLink, RefreshCw, Globe, Inbox
} from 'lucide-react';
import toast from 'react-hot-toast';

import { telegram } from '../../services/api';
import PageLoader from '../../components/common/PageLoader';
import { ChannelHeader, GlassCard, TELEGRAM_THEME as TH } from '../../components/channel/channelUi';
import { TG, type TelegramBotRow } from './telegramShared';

interface WebhookHealth {
  botId: string;
  username: string;
  url: string | null;
  isRegistered: boolean;
  pendingUpdateCount: number;
  ipAddress: string | null;
  maxConnections: number | null;
  allowedUpdates: string[];
  lastErrorAt: string | null;
  lastErrorMessage: string | null;
  healthy: boolean;
}

const TelegramSettings: React.FC = () => {
  const [bots, setBots] = useState<TelegramBotRow[]>([]);
  const [health, setHealth] = useState<Record<string, WebhookHealth>>({});
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState<string | null>(null);

  const loadHealth = useCallback(async (botId: string, notify = false) => {
    setChecking(botId);
    try {
      const res = await telegram.getWebhookHealth(botId);
      const h: WebhookHealth = res.data?.data;
      setHealth((prev) => ({ ...prev, [botId]: h }));
      if (notify) {
        if (!h.isRegistered) toast.error('Telegram has no webhook registered for this bot.');
        else if (h.lastErrorMessage) toast.error(`Last delivery error: ${h.lastErrorMessage}`);
        else toast.success(`Webhook healthy · ${h.pendingUpdateCount} update(s) queued`);
      }
    } catch (err: any) {
      if (notify) toast.error(err?.response?.data?.message || 'Could not read webhook status.');
    } finally {
      setChecking(null);
    }
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await telegram.getBots();
      const list: TelegramBotRow[] = Array.isArray(res.data?.data) ? res.data.data : [];
      setBots(list);
      // Pull real webhook status for each connected bot.
      list.forEach((b) => { loadHealth(b.id).catch(() => {}); });
    } catch {
      /* surfaced per-action */
    } finally {
      setLoading(false);
    }
  }, [loadHealth]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <PageLoader />;

  const fmtDate = (s?: string | null) => {
    if (!s) return '—';
    try { return new Date(s).toLocaleString(); } catch { return s; }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <ChannelHeader
        theme={TH}
        icon={SettingsIcon}
        title="Telegram Settings & Health"
        subtitle="Live webhook delivery status for each connected bot, read directly from Telegram."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

        <div className="md:col-span-2 space-y-6">

          {/* Security note — describes what the code actually does */}
          <div className="flex items-start gap-3.5 p-5 rounded-2xl bg-gradient-to-tr from-sky-50 via-white to-sky-50/40 border border-sky-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900 mb-1">How your bot tokens are protected</h4>
              <p className="text-xs text-sky-700/80 leading-relaxed">
                Tokens are encrypted before they are stored and are only decrypted server-side at the moment a
                request is sent to Telegram. Every incoming update is verified against a per-bot secret token,
                so updates that do not come from Telegram are rejected.
              </p>
            </div>
          </div>

          {/* Per-bot webhook health */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Connected Bots ({bots.length})
              </h2>
              <Link to="/dashboard/telegram/bots" className="text-xs font-bold text-sky-600 hover:underline">
                Manage bots →
              </Link>
            </div>

            {bots.length === 0 ? (
              <GlassCard className="text-center border-dashed">
                <Send className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-semibold">No bots connected yet.</p>
                <Link
                  to="/dashboard/telegram/bots"
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-full shadow-sm"
                  style={{ background: TG.blue }}
                >
                  <Send className="w-3.5 h-3.5" /> Connect a bot
                </Link>
              </GlassCard>
            ) : (
              bots.map((bot) => {
                const h = health[bot.id];
                const isChecking = checking === bot.id;
                return (
                  <GlassCard key={bot.id}>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                          TG
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{bot.firstName || bot.username}</p>
                          <a
                            href={`https://t.me/${bot.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-sky-500 hover:underline flex items-center gap-1"
                          >
                            @{bot.username} <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {h && (
                          h.healthy ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Webhook OK
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertCircle className="w-3 h-3" /> {h.isRegistered ? 'Delivery errors' : 'Not registered'}
                            </span>
                          )
                        )}
                        <button
                          onClick={() => loadHealth(bot.id, true)}
                          disabled={isChecking}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-all disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                          {isChecking ? 'Checking...' : 'Check now'}
                        </button>
                      </div>
                    </div>

                    {h ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl min-w-0">
                            <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                              <Globe className="w-3 h-3" /> Webhook URL
                            </span>
                            <span className="font-mono text-[11px] text-gray-700 break-all">
                              {h.url || 'Not set'}
                            </span>
                          </div>
                          <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                            <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                              <Inbox className="w-3 h-3" /> Queued updates
                            </span>
                            <span className={`font-mono text-[11px] font-bold ${h.pendingUpdateCount > 0 ? 'text-amber-600' : 'text-gray-700'}`}>
                              {h.pendingUpdateCount}
                            </span>
                          </div>
                        </div>

                        {h.lastErrorMessage && (
                          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
                            <span className="font-bold">Last delivery error</span>
                            <span className="block font-mono mt-0.5 break-words">{h.lastErrorMessage}</span>
                            <span className="block text-amber-600 mt-0.5">{fmtDate(h.lastErrorAt)}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-xl">
                          <div className="min-w-0">
                            <span className="text-[10px] text-gray-400 block font-semibold">Bot user ID</span>
                            <span className="font-mono text-gray-700 truncate block">{bot.botUserId}</span>
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] text-gray-400 block font-semibold">Connected on</span>
                            <span className="text-gray-700 truncate block">{fmtDate(bot.connectedAt)}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-400 italic">Reading webhook status from Telegram…</p>
                    )}
                  </GlassCard>
                );
              })
            )}
          </div>
        </div>

        {/* Telegram's documented platform limits (reference, not live status) */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Telegram platform limits</h4>
            <div className="space-y-2.5 text-xs text-gray-600">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span>Bulk send rate</span>
                <span className="font-bold text-gray-900">~30 msgs/sec</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span>Same-chat rate</span>
                <span className="font-bold text-gray-900">1 msg/sec</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Max file size</span>
                <span className="font-bold text-gray-900">50 MB</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed pt-1">
              Published Telegram Bot API limits, shown for reference. Broadcasts are rate-limited to stay
              within them.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-500/5 to-blue-500/5 border border-sky-100 text-xs space-y-2">
            <span className="font-bold text-sky-700 block">Webhook not registered?</span>
            <p className="text-gray-500 leading-relaxed">
              Telegram only delivers messages to a public HTTPS URL. If the webhook URL above is empty, set{' '}
              <span className="font-mono text-[10px] bg-white px-1 py-0.5 rounded border border-gray-200">TELEGRAM_WEBHOOK_BASE_URL</span>{' '}
              on the server and reconnect the bot.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TelegramSettings;
