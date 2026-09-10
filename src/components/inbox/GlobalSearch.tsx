// src/components/inbox/GlobalSearch.tsx
// Search message content across every channel, with a channel filter. Clicking a
// result opens that conversation in the inbox.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaTelegram } from 'react-icons/fa';
import { Layers } from 'lucide-react';
import { inbox as inboxApi } from '../../services/api';
import { getContactName } from '../../utils/inboxHelpers';

type Channel = 'ALL' | 'WHATSAPP' | 'INSTAGRAM' | 'TELEGRAM';

const CHANNELS: { key: Channel; label: string; Icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { key: 'ALL', label: 'All', Icon: Layers, color: '#111827' },
  { key: 'WHATSAPP', label: 'WhatsApp', Icon: FaWhatsapp, color: '#25D366' },
  { key: 'INSTAGRAM', label: 'Instagram', Icon: FaInstagram, color: '#e1306c' },
  { key: 'TELEGRAM', label: 'Telegram', Icon: FaTelegram, color: '#229ED9' },
];

interface ResultMsg {
  id: string;
  content?: string;
  createdAt?: string;
  conversation?: { id: string; channel?: Channel; contact?: any };
}

interface Props {
  onClose: () => void;
  onOpenConversation: (conversationId: string) => void;
}

const badgeFor = (ch?: string) => CHANNELS.find((c) => c.key === (ch || 'WHATSAPP')) || CHANNELS[1];

const GlobalSearch: React.FC<Props> = ({ onClose, onOpenConversation }) => {
  const [q, setQ] = useState('');
  const [channel, setChannel] = useState<Channel>('ALL');
  const [results, setResults] = useState<ResultMsg[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const run = useCallback(async (query: string, ch: Channel) => {
    if (!query.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    try {
      const res = await inboxApi.searchMessages(query.trim(), ch === 'ALL' ? undefined : ch);
      const data = res.data?.data;
      setResults(Array.isArray(data?.messages) ? data.messages : Array.isArray(data) ? data : []);
      setSearched(true);
    } catch {
      setResults([]); setSearched(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search on query/channel change.
  useEffect(() => {
    const t = setTimeout(() => run(q, channel), 300);
    return () => clearTimeout(t);
  }, [q, channel, run]);

  const highlight = (text: string) => {
    if (!q.trim()) return text;
    const i = text.toLowerCase().indexOf(q.trim().toLowerCase());
    if (i === -1) return text.length > 140 ? text.slice(0, 140) + '…' : text;
    const start = Math.max(0, i - 40);
    const snippet = (start > 0 ? '…' : '') + text.slice(start, i + q.length + 80) + (text.length > i + q.length + 80 ? '…' : '');
    const j = snippet.toLowerCase().indexOf(q.trim().toLowerCase());
    return (
      <>
        {snippet.slice(0, j)}
        <mark className="bg-yellow-200 rounded px-0.5">{snippet.slice(j, j + q.trim().length)}</mark>
        {snippet.slice(j + q.trim().length)}
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center p-4 pt-[8vh]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden">
        {/* Search bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search all messages…"
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>

        {/* Channel filter */}
        <div className="flex gap-1 px-4 py-2 border-b border-gray-100 overflow-x-auto">
          {CHANNELS.map(({ key, label, Icon, color }) => {
            const active = channel === key;
            return (
              <button
                key={key}
                onClick={() => setChannel(key)}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${active ? 'text-white shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                style={active ? { backgroundColor: color, borderColor: color } : undefined}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            );
          })}
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {!q.trim() ? (
            <p className="px-4 py-10 text-center text-sm text-gray-400">Type to search across every conversation.</p>
          ) : searched && results.length === 0 && !loading ? (
            <p className="px-4 py-10 text-center text-sm text-gray-400">No messages found for “{q}”.</p>
          ) : (
            results.map((m) => {
              const b = badgeFor(m.conversation?.channel);
              const name = m.conversation?.contact ? getContactName(m.conversation.contact) : 'Conversation';
              return (
                <button
                  key={m.id}
                  onClick={() => { if (m.conversation?.id) { onOpenConversation(m.conversation.id); onClose(); } }}
                  className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: b.color }}>
                    <b.Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-900 truncate">{name}</span>
                      {m.createdAt && <span className="text-[10px] text-gray-400 flex-shrink-0">{new Date(m.createdAt).toLocaleDateString()}</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{highlight(m.content || '')}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
