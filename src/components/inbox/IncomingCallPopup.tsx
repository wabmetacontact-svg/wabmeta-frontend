// src/components/inbox/IncomingCallPopup.tsx
//
// A customer is calling the business on WhatsApp. Shown on every dashboard
// page to every agent; the first to accept takes the call and it disappears
// for the others.

import React from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import type { IncomingCall } from '../../context/CallContext';

interface Props {
  call: IncomingCall;
  more: number;
  onAccept: (callId: string) => void;
  onDecline: (callId: string) => void;
}

const IncomingCallPopup: React.FC<Props> = ({ call, more, onAccept, onDecline }) => (
  <div
    role="alertdialog"
    aria-label={`Incoming WhatsApp call from ${call.party.name}`}
    className="fixed bottom-4 right-4 left-4 sm:left-auto z-[60] sm:w-[340px] rounded-2xl shadow-2xl overflow-hidden bg-slate-900 text-white"
  >
    <div className="p-5">
      <div className="flex items-center gap-3">
        <span className="relative flex w-12 h-12 shrink-0">
          <span className="absolute inset-0 rounded-full bg-emerald-400/40 animate-ping" />
          <span className="relative w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </span>
        </span>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-emerald-300">Incoming WhatsApp call</p>
          <p className="font-semibold truncate">{call.party.name}</p>
          <p className="text-sm text-white/60 truncate">{call.party.phone}</p>
        </div>
      </div>
      {more > 0 && <p className="mt-3 text-xs text-white/60">+{more} more caller{more > 1 ? 's' : ''} waiting</p>}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={() => onDecline(call.callId)}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-500 hover:bg-red-600 py-2.5 font-semibold"
        >
          <PhoneOff className="w-4 h-4" /> Decline
        </button>
        <button
          onClick={() => onAccept(call.callId)}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 py-2.5 font-semibold"
        >
          <Phone className="w-4 h-4" /> Accept
        </button>
      </div>
      <p className="mt-3 text-[11px] text-white/50">Answers in this browser with your microphone.</p>
    </div>
  </div>
);

export default IncomingCallPopup;
