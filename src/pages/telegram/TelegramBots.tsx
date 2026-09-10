// src/pages/telegram/TelegramBots.tsx
// Connect and manage Telegram bots, plus each bot's "/" command menu.

import React, { useCallback, useEffect, useState } from 'react';
import { Send, Plus, Trash2, RefreshCw, AlertCircle, ExternalLink, Terminal, X, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

import { telegram } from '../../services/api';
import { useConfirm } from '../../context/ConfirmContext';
import PageLoader from '../../components/common/PageLoader';
import { ChannelHeader, GlassCard, TELEGRAM_THEME as TH, primaryBtnStyle } from '../../components/channel/channelUi';
import { TG, type TelegramBotRow } from './telegramShared';

const TelegramBots: React.FC = () => {
  const confirm = useConfirm();

  const [bots, setBots] = useState<TelegramBotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [commandsBot, setCommandsBot] = useState<TelegramBotRow | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await telegram.getBots();
      setBots(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Could not load your bots.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) return;
    setConnecting(true);
    try {
      const res = await telegram.connect(trimmed);
      toast.success(res.data?.message || 'Telegram bot connected!');
      if (res.data?.data?.webhookConfigured === false) {
        toast('Webhook not set — messages won’t arrive until TELEGRAM_WEBHOOK_BASE_URL is configured.', { icon: '⚠️', duration: 6000 });
      }
      setToken('');
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not connect that bot. Check the token.');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (bot: TelegramBotRow) => {
    const ok = await confirm({
      title: `Disconnect @${bot.username}?`,
      message: 'This removes the bot and stops its messages reaching your inbox. Existing conversations are kept.',
      confirmLabel: 'Disconnect Bot',
      tone: 'danger',
    });
    if (!ok) return;
    const previous = bots;
    setBots((prev) => prev.filter((b) => b.id !== bot.id));
    try {
      await telegram.disconnect(bot.id);
      toast.success(`@${bot.username} disconnected`);
    } catch (err: any) {
      setBots(previous);
      toast.error(err?.response?.data?.message || 'Could not disconnect that bot.');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <ChannelHeader
        theme={TH}
        icon={Send}
        title="Telegram Bot Integrations"
        subtitle="Connect a bot, configure its command menu, and route every Telegram message into your unified inbox."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

        {/* Connector + bot list */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleConnect} className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4">
            <div>
              <label htmlFor="tg-token" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                HTTP API Bot Token
              </label>

              <div className="flex flex-wrap gap-2 mt-2">
                <input
                  id="tg-token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="5372819381:AAH8N_vxxxxxxxxxxxxxxxx"
                  autoComplete="off"
                  spellCheck={false}
                  className="flex-1 min-w-[220px] px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 outline-none focus:bg-white focus:border-sky-400 transition-all"
                />
                <button
                  type="submit"
                  disabled={connecting || !token.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white rounded-full shadow-md hover:-translate-y-0.5 disabled:opacity-50 transition-all"
                  style={primaryBtnStyle(TH)}
                >
                  <Plus className="w-4 h-4" />
                  {connecting ? 'Linking Bot...' : 'Connect'}
                </button>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 flex items-center gap-1.5 font-medium">
              <Shield className="w-3.5 h-3.5 text-sky-400" /> Tokens are encrypted before they are stored and never shown again.
            </p>
          </form>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Connected Bots ({bots.length})
              </h2>
              <button onClick={load} aria-label="Refresh" className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-all bg-white shadow-sm">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-bold text-red-800">{error}</p>
                  <button onClick={load} className="mt-2 font-semibold text-red-700 underline">Try again</button>
                </div>
              </div>
            ) : bots.length === 0 ? (
              <div className="p-16 border border-dashed border-gray-200 rounded-2xl text-center bg-white">
                <Send className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-600">No Telegram bots linked yet.</p>
                <p className="text-xs text-gray-400 mt-1">Get a token from BotFather using the steps on the right.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bots.map((bot) => (
                  <GlassCard key={bot.id} className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-sky-50 border border-sky-100 text-sky-500 flex items-center justify-center flex-shrink-0">
                        <Send className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-gray-900 block truncate">{bot.firstName || bot.username}</span>
                        <a
                          href={`https://t.me/${bot.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-sky-500 hover:underline"
                        >
                          @{bot.username}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        {bot.status === 'CONNECTED' ? 'Connected' : bot.status}
                      </span>
                      <button
                        onClick={() => setCommandsBot(bot)}
                        className="p-2 text-sky-500 hover:bg-sky-50 border border-sky-100 rounded-xl transition-all"
                        title="Configure command menu"
                        aria-label={`Configure commands for ${bot.username}`}
                      >
                        <Terminal className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDisconnect(bot)}
                        aria-label={`Disconnect ${bot.username}`}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BotFather setup guide */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-sky-100 overflow-hidden bg-gray-900 text-slate-300 font-mono shadow-md text-xs">
            <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
              <span className="text-gray-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full" />
                <span className="ml-1">Setup</span>
              </span>
              <Terminal className="w-4 h-4 text-gray-500" />
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sky-400 font-bold">// 3 quick steps</p>

              <div className="space-y-1">
                <span className="text-yellow-400 block">Step 01:</span>
                <span className="text-gray-400">Open BotFather in Telegram</span>
                <a
                  href="https://t.me/BotFather"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-300 hover:underline font-semibold flex items-center gap-1"
                >
                  t.me/BotFather <ExternalLink size={10} />
                </a>
              </div>

              <div className="space-y-1">
                <span className="text-yellow-400 block">Step 02:</span>
                <span className="text-gray-400">Send the command:</span>
                <span className="bg-gray-800/80 text-emerald-400 px-1.5 py-0.5 rounded border border-gray-700 block w-fit">/newbot</span>
              </div>

              <div className="space-y-1">
                <span className="text-yellow-400 block">Step 03:</span>
                <span className="text-gray-400">Copy the token it replies with and paste it here.</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-500/5 to-blue-500/5 border border-sky-100 text-xs space-y-2">
            <span className="font-bold text-sky-700 block">After connecting</span>
            <p className="text-gray-500 leading-relaxed">
              Use the <Terminal className="w-3 h-3 inline text-sky-500" /> button on a bot to set its “/” command
              menu — the shortcut list users see when they type <span className="font-mono">/</span> in Telegram.
            </p>
          </div>
        </div>

      </div>

      {commandsBot && (
        <CommandsModal bot={commandsBot} onClose={() => setCommandsBot(null)} />
      )}
    </div>
  );
};

interface CommandRow { command: string; description: string }

const CommandsModal: React.FC<{ bot: TelegramBotRow; onClose: () => void }> = ({ bot, onClose }) => {
  const [rows, setRows] = useState<CommandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await telegram.getCommands(bot.id);
        const list: CommandRow[] = Array.isArray(res.data?.data) ? res.data.data : [];
        if (alive) setRows(list.length ? list : [{ command: '', description: '' }]);
      } catch {
        if (alive) setRows([{ command: '', description: '' }]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [bot.id]);

  const update = (i: number, patch: Partial<CommandRow>) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  const addRow = () => setRows((r) => [...r, { command: '', description: '' }]);
  const removeRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    const cleaned = rows
      .map((r) => ({ command: r.command.trim().toLowerCase().replace(/^\//, ''), description: r.description.trim() }))
      .filter((r) => r.command || r.description);
    // Local validation mirrors Telegram's rules for a friendly message.
    for (const r of cleaned) {
      if (!/^[a-z0-9_]{1,32}$/.test(r.command)) {
        toast.error(`"/${r.command}" — use 1–32 lowercase letters, digits or _`);
        return;
      }
      if (!r.description) { toast.error(`"/${r.command}" needs a description`); return; }
    }
    setSaving(true);
    try {
      await telegram.setCommands(bot.id, cleaned);
      toast.success(cleaned.length ? 'Command menu updated' : 'Command menu cleared');
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not update the command menu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-gray-200 shadow-2xl p-5">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: TG.blueSoft }}>
              <Terminal className="w-4 h-4" style={{ color: TG.blue }} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900">Command menu</h3>
              <p className="text-xs text-gray-500 truncate">@{bot.username} — the “/” list users see in Telegram</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50"><X className="w-4 h-4" /></button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-gray-400">Loading…</div>
        ) : (
          <>
            <div className="mt-3 space-y-2 max-h-[50vh] overflow-y-auto">
              {rows.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex items-center flex-shrink-0 w-32 px-2 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                    <span className="text-gray-400 text-sm">/</span>
                    <input
                      value={row.command}
                      onChange={(e) => update(i, { command: e.target.value })}
                      placeholder="start"
                      aria-label="Command"
                      className="w-full bg-transparent text-sm font-mono outline-none"
                    />
                  </div>
                  <input
                    value={row.description}
                    onChange={(e) => update(i, { description: e.target.value })}
                    placeholder="Start the bot"
                    aria-label="Command description"
                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none"
                  />
                  <button onClick={() => removeRow(i)} aria-label="Remove command" className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button onClick={addRow} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold hover:underline" style={{ color: TG.blue }}>
              <Plus className="w-3.5 h-3.5" /> Add command
            </button>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white rounded-full shadow-md disabled:opacity-50" style={primaryBtnStyle(TH)}>
                {saving ? 'Saving…' : 'Save menu'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TelegramBots;
