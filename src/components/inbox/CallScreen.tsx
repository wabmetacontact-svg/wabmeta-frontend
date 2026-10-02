// src/components/inbox/CallScreen.tsx
//
// The live call panel. Everything it shows comes from CallContext, which
// follows the real call: microphone, WebRTC connection and Meta's webhooks.
// (It used to pretend: "connected" after a fixed 4 seconds and a record
// button that recorded nothing.)

import React, { useEffect, useState } from 'react';
import { Loader2, Mic, MicOff, Phone, PhoneOff, Send, X } from 'lucide-react';
import { useCall, type CallPhase } from '../../context/CallContext';

const formatDuration = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

const PHASE_TEXT: Partial<Record<CallPhase, string>> = {
  mic: 'Allow microphone access…',
  connecting: 'Connecting…',
  calling: 'Calling on WhatsApp…',
  ringing: 'Ringing…',
};

const initials = (name: string) =>
  name.replace(/[^A-Za-z0-9 ]/g, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

const CallPanel: React.FC = () => {
  const { active, hangup, toggleMute, requestPermission, dismiss } = useCall();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (active?.phase !== 'connected') return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active?.phase]);

  if (!active) return null;
  const { phase, party } = active;
  const live = ['mic', 'connecting', 'calling', 'ringing', 'connected'].includes(phase);

  const tone =
    phase === 'connected' ? 'from-emerald-600 to-emerald-700' :
    phase === 'failed' ? 'from-red-600 to-rose-700' :
    phase === 'permission' ? 'from-amber-500 to-orange-600' :
    phase === 'ended' ? 'from-slate-600 to-slate-700' :
    'from-slate-800 to-slate-900';

  const statusLine =
    phase === 'connected' ? formatDuration(now - (active.connectedAt || now)) :
    phase === 'ended' || phase === 'failed' ? active.message || 'Call ended' :
    phase === 'permission' ? 'This customer has not allowed calls yet' :
    PHASE_TEXT[phase];

  return (
    <div
      role="dialog"
      aria-label={`Call with ${party.name}`}
      className="fixed bottom-4 right-4 left-4 sm:left-auto z-[60] sm:w-[340px] rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className={`bg-gradient-to-br ${tone} text-white p-5`}>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center text-lg font-semibold shrink-0">
            {initials(party.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-wide text-white/70">
              WhatsApp call · {active.direction === 'INBOUND' ? 'Incoming' : 'Outgoing'}
            </p>
            <p className="font-semibold truncate">{party.name}</p>
            <p className="text-sm text-white/70 truncate">{party.phone}</p>
          </div>
          {!live && (
            <button onClick={dismiss} aria-label="Close" className="p-1 rounded-lg hover:bg-white/10">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm min-h-[20px]" aria-live="polite">
          {['mic', 'connecting', 'calling', 'ringing'].includes(phase) && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
          {phase === 'connected' && <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />}
          <span className={phase === 'connected' ? 'font-mono text-base' : ''}>{statusLine}</span>
        </div>

        {phase === 'permission' && (
          <div className="mt-3 text-sm text-white/90 space-y-3">
            <p>
              WhatsApp lets a business call a customer only after they allow it. Send a request; when they tap
              <strong> Allow</strong>, call again. (Needs a chat reply from them in the last 24 hours.)
            </p>
            {active.requestSent ? (
              <p className="font-medium">Request sent. Wait for the customer to allow calls.</p>
            ) : active.canSendRequest === false ? (
              <p className="font-medium">WhatsApp limits requests (1 a day, 2 a week). Try again later.</p>
            ) : (
              <button
                onClick={requestPermission}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-amber-700 font-semibold py-2.5 hover:bg-amber-50"
              >
                <Send className="w-4 h-4" /> Send call permission request
              </button>
            )}
          </div>
        )}

        {live && (
          <div className="mt-5 flex items-center justify-center gap-6">
            <button
              onClick={toggleMute}
              disabled={phase !== 'connected'}
              aria-label={active.muted ? 'Unmute' : 'Mute'}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors disabled:opacity-40 ${
                active.muted ? 'bg-white text-slate-900' : 'bg-white/15 hover:bg-white/25'
              }`}
            >
              {active.muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button
              onClick={hangup}
              aria-label="End call"
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        )}

        {phase === 'failed' && (
          <button onClick={dismiss} className="mt-4 w-full rounded-xl bg-white/15 hover:bg-white/25 py-2 text-sm font-medium">
            Close
          </button>
        )}
      </div>
      {phase === 'connected' && (
        <p className="bg-white text-[11px] text-gray-500 px-4 py-2 flex items-center gap-1.5">
          <Phone className="w-3 h-3" /> Voice goes through this browser. Keep this tab open.
        </p>
      )}
    </div>
  );
};

export default CallPanel;
