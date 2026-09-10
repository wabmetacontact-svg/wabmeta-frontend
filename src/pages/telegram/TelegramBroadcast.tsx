// src/pages/telegram/TelegramBroadcast.tsx
// Broadcast to every Telegram user who has chatted with a connected bot,
// with a live preview of how the message will look inside Telegram.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Megaphone, Send, Plus, Trash2, Users, RefreshCw,
  CheckCircle2, Loader2, ImagePlus, X, ExternalLink, CornerDownRight, Smartphone, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

import api, { telegram } from '../../services/api';
import { useConfirm } from '../../context/ConfirmContext';
import PageLoader from '../../components/common/PageLoader';
import {
  ChannelHeader, GlassCard, StatCard,
  TELEGRAM_THEME as TH, primaryBtnStyle
} from '../../components/channel/channelUi';
import { TG, type ButtonDef } from './telegramShared';

interface BroadcastRow {
  id: string;
  message: string;
  status: 'SENDING' | 'COMPLETED' | 'FAILED';
  total: number;
  sent: number;
  failed: number;
  createdAt: string;
  completedAt?: string | null;
}

const TelegramBroadcast: React.FC = () => {
  const confirm = useConfirm();

  const [broadcasts, setBroadcasts] = useState<BroadcastRow[]>([]);
  const [audience, setAudience] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState('');
  const [buttons, setButtons] = useState<ButtonDef[]>([]);
  // `kind` is the short form ('image'), `mediaType` the full MIME ('image/png').
  const [media, setMedia] = useState<{ url: string; mediaType: string; kind: string; name: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const [bRes, aRes] = await Promise.all([
        telegram.getBroadcasts(),
        telegram.getBroadcastAudience(),
      ]);
      setBroadcasts(Array.isArray(bRes.data?.data) ? bRes.data.data : []);
      setAudience(aRes.data?.data?.count ?? 0);
    } catch {
      /* surfaced on actions */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Poll only while a broadcast is still sending.
  useEffect(() => {
    const anySending = broadcasts.some((b) => b.status === 'SENDING');
    if (anySending && !pollRef.current) {
      pollRef.current = setInterval(load, 3000);
    } else if (!anySending && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [broadcasts, load]);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await api.post('/inbox/media/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploaded = res.data?.data;
      if (!uploaded?.url) throw new Error('Upload failed');
      setMedia({
        url: uploaded.url,
        // Send the full MIME so Telegram picks sendPhoto/sendVideo correctly.
        mediaType: uploaded.mimeType || file.type || '',
        kind: uploaded.mediaType || (file.type.split('/')[0] || 'document'),
        name: file.name,
      });
      toast.success('Media attached!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not upload file.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if (!message.trim() && !media) return;
    const n = audience ?? 0;
    if (n === 0) {
      toast.error('No subscribers yet — people must message your bot first.');
      return;
    }
    const ok = await confirm({
      title: `Send to ${n} subscriber${n === 1 ? '' : 's'}?`,
      message: 'This broadcasts your message to every Telegram user who has chatted with your bot.',
      confirmLabel: 'Send Broadcast Now',
    });
    if (!ok) return;

    setSending(true);
    try {
      const validButtons = buttons
        .map((b) => ({ ...b, text: b.text.trim(), value: b.value.trim() }))
        .filter((b) => b.text && b.value);

      await telegram.createBroadcast({
        message: message.trim(),
        buttons: validButtons.length ? validButtons : undefined,
        mediaUrl: media?.url,
        mediaType: media?.mediaType,
      });
      toast.success('Broadcast started!');
      setMessage('');
      setButtons([]);
      setMedia(null);
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not start broadcast.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <PageLoader />;

  const fmt = (s?: string | null) => {
    if (!s) return '';
    try { return new Date(s).toLocaleString(); } catch { return s; }
  };

  const totalDelivered = broadcasts.reduce((acc, b) => acc + (b.sent || 0), 0);
  const previewButtons = buttons.filter((b) => b.text.trim());

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <ChannelHeader
        theme={TH}
        icon={Megaphone}
        title="Telegram Broadcasts"
        subtitle="Deliver announcements and offers straight to the inbox of your Telegram bot subscribers."
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard theme={TH} icon={Users} label="Subscribers" value={(audience ?? 0).toLocaleString('en-IN')} hint="Eligible to receive broadcasts" />
        <StatCard theme={TH} icon={Send} label="Broadcasts Created" value={broadcasts.length} hint="Historical campaigns" />
        <StatCard theme={TH} icon={CheckCircle2} label="Messages Delivered" value={totalDelivered.toLocaleString('en-IN')} hint="Successfully sent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Compose */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard className="border-sky-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-sky-500" /> New Broadcast Message
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Message Content {media && <span className="font-normal text-gray-400">(caption)</span>}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={media ? 'Add a caption for your media...' : 'Write your broadcast announcement...'}
                  rows={4}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 outline-none resize-none focus:border-sky-400 transition-all"
                />
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                hidden
                aria-label="Attach media"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              {media ? (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-sky-200 bg-sky-50/50">
                  {media.kind === 'image' ? (
                    <img src={media.url} alt="attachment" className="w-12 h-12 rounded-lg object-cover border border-sky-200" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-sky-200 flex items-center justify-center text-sky-700 font-bold text-[10px]">VIDEO</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{media.name}</p>
                    <span className="text-[10px] text-sky-600 font-medium">Ready to broadcast</span>
                  </div>
                  <button type="button" onClick={() => setMedia(null)} aria-label="Remove media" className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-dashed border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-sky-300 transition-all disabled:opacity-50"
                >
                  <ImagePlus className="w-4 h-4 text-sky-500" /> {uploading ? 'Uploading media...' : 'Attach Image or Video'}
                </button>
              )}

              {/* Inline buttons */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">Inline Action Buttons</span>
                  <button
                    type="button"
                    onClick={() => setButtons((p) => [...p, { text: '', type: 'url', value: '' }])}
                    className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Button
                  </button>
                </div>

                {buttons.map((btn, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
                    <input
                      type="text"
                      value={btn.text}
                      onChange={(e) => setButtons((p) => p.map((b, j) => (j === i ? { ...b, text: e.target.value } : b)))}
                      placeholder="Button Label"
                      className="flex-1 min-w-[110px] px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none"
                    />
                    <select
                      value={btn.type}
                      onChange={(e) => setButtons((p) => p.map((b, j) => (j === i ? { ...b, type: e.target.value as 'callback' | 'url' } : b)))}
                      className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none"
                    >
                      <option value="url">Opens URL Link</option>
                      <option value="callback">Triggers Keyword</option>
                    </select>
                    <input
                      type="text"
                      value={btn.value}
                      onChange={(e) => setButtons((p) => p.map((b, j) => (j === i ? { ...b, value: e.target.value } : b)))}
                      placeholder={btn.type === 'url' ? 'https://example.com' : 'keyword'}
                      className="flex-1 min-w-[120px] px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono outline-none"
                    />
                    <button type="button" onClick={() => setButtons((p) => p.filter((_, j) => j !== i))} aria-label="Remove button" className="p-1.5 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  Target: <strong className="text-gray-700">{(audience ?? 0).toLocaleString('en-IN')}</strong> subscribers
                </span>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending || uploading || (!message.trim() && !media) || (audience ?? 0) === 0}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white rounded-full shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={primaryBtnStyle(TH)}
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Broadcasting...' : `Send to ${(audience ?? 0).toLocaleString('en-IN')}`}
                </button>
              </div>
            </div>
          </GlassCard>

          {/* History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Broadcast History</h2>
              <button type="button" onClick={load} aria-label="Refresh" className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 shadow-sm">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {broadcasts.length === 0 ? (
              <GlassCard className="text-center border-dashed">
                <p className="text-xs text-gray-400">No broadcasts sent yet.</p>
              </GlassCard>
            ) : (
              <div className="space-y-2.5">
                {broadcasts.map((b) => {
                  const pct = b.total > 0 ? Math.round(((b.sent + b.failed) / b.total) * 100) : 0;
                  return (
                    <GlassCard key={b.id}>
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-medium text-gray-800 break-words flex-1 line-clamp-2">{b.message || 'Media broadcast'}</p>
                        {b.status === 'SENDING' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0" style={{ background: TG.blueSoft, color: TG.blueDark, borderColor: TG.blueBorder }}>
                            <Loader2 className="w-3 h-3 animate-spin" /> Sending ({pct}%)
                          </span>
                        ) : b.status === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 flex-shrink-0">Failed</span>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                        <span className="text-emerald-600 font-bold tabular-nums">{b.sent} sent</span>
                        {b.failed > 0 && <span className="text-red-500 font-bold tabular-nums">{b.failed} failed</span>}
                        <span className="tabular-nums">/ {b.total} total</span>
                        <span className="ml-auto text-gray-400 font-mono text-[10px]">{fmt(b.completedAt || b.createdAt)}</span>
                      </div>
                      {b.status === 'SENDING' && (
                        <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: TG.blue }} />
                        </div>
                      )}
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Live preview — rendered purely from what you typed above */}
        <div className="lg:col-span-5 lg:sticky lg:top-6">
          <div className="bg-slate-900 rounded-[32px] p-3 shadow-2xl border-4 border-slate-800 max-w-sm mx-auto">
            <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950" />
            </div>

            <div className="bg-[#242f3d] rounded-2xl p-3 text-white">
              <div className="flex items-center gap-2.5 mb-3 pb-2 border-b border-slate-700/50">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: TG.blue }}>
                  TG
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">Your Telegram Bot</p>
                  <span className="text-[10px] text-slate-400">bot</span>
                </div>
                <Eye className="w-4 h-4 text-slate-400" />
              </div>

              <div className="min-h-[260px] bg-[#0e1621] rounded-xl p-3 flex flex-col justify-end space-y-2 text-xs">
                {(message || media) ? (
                  <div className="bg-[#182533] rounded-2xl rounded-bl-sm p-3 max-w-[90%] space-y-2 border border-slate-700/30">
                    {media && (
                      <div className="rounded-lg overflow-hidden border border-slate-700/50">
                        {media.kind === 'image' ? (
                          <img src={media.url} alt="preview" className="w-full h-32 object-cover" />
                        ) : (
                          <div className="h-28 bg-slate-800 flex items-center justify-center text-slate-400">Video attachment</div>
                        )}
                      </div>
                    )}
                    {message && <p className="text-slate-200 text-xs leading-relaxed whitespace-pre-wrap break-words">{message}</p>}

                    {previewButtons.length > 0 && (
                      <div className="space-y-1 pt-1">
                        {previewButtons.map((b, i) => (
                          <div key={i} className="w-full py-1.5 px-3 bg-[#242f3d] rounded-lg text-center font-semibold text-[11px] text-[#64b5f6] flex items-center justify-center gap-1.5">
                            {b.type === 'url' ? <ExternalLink className="w-3 h-3" /> : <CornerDownRight className="w-3 h-3" />}
                            {b.text}
                          </div>
                        ))}
                      </div>
                    )}
                    <span className="text-[9px] text-slate-500 block text-right">Preview</span>
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-600">
                    <Smartphone className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-[11px]">Live broadcast preview</p>
                    <span className="text-[10px] text-slate-700">Type a message to see it here</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TelegramBroadcast;
