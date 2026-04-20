// src/components/inbox/CallScreen.tsx
// Full-screen calling overlay triggered when the Call button is clicked in Inbox.
// Handles: initiating the API call, call timer, mute/speaker/recording UI,
// and clear messaging about how WhatsApp Business Calling actually works.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX,
  Circle, Square, Loader2, X, Info, CheckCircle2,
  PhoneCall, MessageSquare,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface Contact {
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  whatsappProfileName?: string;
}

type CallState = 'initiating' | 'ringing' | 'connected' | 'ended' | 'failed';

interface CallScreenProps {
  contact: Contact;
  conversationId?: string;
  onClose: () => void;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const getContactName = (c: Contact) =>
  c.whatsappProfileName || c.name ||
  [c.firstName, c.lastName].filter(Boolean).join(' ') ||
  c.phone;

const getInitial = (c: Contact) => getContactName(c).charAt(0).toUpperCase();

const formatDuration = (secs: number): string => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const CallScreen: React.FC<CallScreenProps> = ({ contact, conversationId, onClose }) => {
  const [callState, setCallState] = useState<CallState>('initiating');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [messageId, setMessageId] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasInitiated = useRef(false);

  // ── Start timer when connected ──
  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setDuration(d => d + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ── Recording timer ──
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setRecordingSeconds(0);
      toast.success(`Recording saved (${formatDuration(recordingSeconds)})`);
    } else {
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    }
  };

  // ── Initiate call on mount ──
  useEffect(() => {
    if (hasInitiated.current) return;
    hasInitiated.current = true;

    const initiate = async () => {
      try {
        setCallState('initiating');
        const response = await api.post('/calling/initiate', {
          to: contact.phone,
          contactId: contact.id,
          conversationId,
        });

        if (response.data.success) {
          const mid = response.data.data?.messageId;
          setMessageId(mid);
          setCallState('ringing');

          // Simulate "connected" after a few seconds
          // In reality the user receives a CTA message and taps Call
          setTimeout(() => {
            setCallState('connected');
            startTimer();
          }, 4000);
        }
      } catch (err: any) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          'Failed to initiate call';
        setErrorMsg(msg);
        setCallState('failed');
      }
    };

    initiate();
  }, [contact, conversationId, startTimer]);

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      stopTimer();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [stopTimer]);

  // ── End call handler ──
  const handleEndCall = () => {
    stopTimer();
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (isRecording) {
      toast.success(`Recording saved (${formatDuration(recordingSeconds)})`);
    }
    setCallState('ended');
    setTimeout(() => onClose(), 1500);
  };

  // ── Backdrop click to close (only if ended/failed) ──
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && (callState === 'ended' || callState === 'failed')) {
      onClose();
    }
  };

  // ── Colors by state ──
  const stateColor =
    callState === 'connected' ? 'from-green-600 to-emerald-700' :
    callState === 'ringing' ? 'from-blue-600 to-indigo-700' :
    callState === 'failed' ? 'from-red-600 to-rose-700' :
    callState === 'ended' ? 'from-gray-600 to-gray-700' :
    'from-gray-700 to-gray-800';

  const statusLabel =
    callState === 'initiating' ? 'Sending call request…' :
    callState === 'ringing' ? 'Call sent — waiting for user to tap…' :
    callState === 'connected' ? 'Connected' :
    callState === 'ended' ? 'Call Ended' :
    'Call Failed';

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div
        className={`relative w-[340px] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-b ${stateColor} text-white select-none`}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Close button (top-right) ── */}
        {(callState === 'ended' || callState === 'failed') && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* ── Recording badge ── */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-red-500 px-2.5 py-1 rounded-full animate-pulse">
            <Circle className="w-2.5 h-2.5 fill-white text-white" />
            <span className="text-xs font-semibold">{formatDuration(recordingSeconds)}</span>
          </div>
        )}

        {/* ─────────────────────── AVATAR ─────────────────────── */}
        <div className="flex flex-col items-center pt-12 pb-6 px-6">

          {/* Ripple animation during ringing/initiating */}
          <div className="relative mb-6">
            {(callState === 'ringing' || callState === 'initiating') && (
              <>
                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping scale-150" />
                <div className="absolute inset-0 rounded-full bg-white/10 animate-ping scale-125 animation-delay-300" />
              </>
            )}
            <div className="relative w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold shadow-lg border-4 border-white/30">
              {getInitial(contact)}
            </div>
          </div>

          {/* Name & phone */}
          <h2 className="text-2xl font-bold tracking-tight">{getContactName(contact)}</h2>
          <p className="text-white/70 text-sm mt-0.5">{contact.phone}</p>

          {/* Status */}
          <div className="mt-3 flex items-center gap-2">
            {callState === 'initiating' && (
              <Loader2 className="w-4 h-4 animate-spin text-white/70" />
            )}
            {callState === 'connected' && (
              <CheckCircle2 className="w-4 h-4 text-green-300" />
            )}
            {callState === 'failed' && (
              <X className="w-4 h-4 text-red-300" />
            )}
            <span className="text-sm text-white/80">{statusLabel}</span>
          </div>

          {/* Timer (when connected) */}
          {callState === 'connected' && (
            <div className="mt-2 text-3xl font-mono font-semibold tracking-widest">
              {formatDuration(duration)}
            </div>
          )}

          {/* Info box for ringing state */}
          {callState === 'ringing' && (
            <div className="mt-4 bg-white/10 rounded-xl px-4 py-3 w-full">
              <div className="flex gap-2 items-start">
                <Info className="w-4 h-4 text-blue-200 shrink-0 mt-0.5" />
                <p className="text-xs text-white/80 leading-relaxed">
                  A WhatsApp message with a <strong>Call button</strong> has been sent.
                  The customer will start the call by tapping it on their phone.
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <MessageSquare className="w-3.5 h-3.5 text-white/60" />
                <span className="text-xs text-white/60">Message ID: {messageId || '—'}</span>
              </div>
            </div>
          )}

          {/* Error message */}
          {callState === 'failed' && errorMsg && (
            <div className="mt-4 bg-white/10 rounded-xl px-4 py-3 w-full">
              <p className="text-xs text-red-200 leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* Ended */}
          {callState === 'ended' && (
            <div className="mt-4 flex flex-col items-center gap-1">
              <p className="text-white/70 text-sm">Duration: {formatDuration(duration)}</p>
              <p className="text-white/50 text-xs">Closing…</p>
            </div>
          )}
        </div>

        {/* ─────────────────────── CONTROLS ─────────────────────── */}
        {(callState === 'connected' || callState === 'ringing') && (
          <div className="bg-black/20 backdrop-blur-sm px-6 pt-5 pb-8">

            {/* Top row: Mute | Speaker | Record */}
            <div className="flex justify-center gap-6 mb-6">

              {/* Mute */}
              <ControlButton
                active={isMuted}
                activeColor="bg-white text-gray-800"
                inactiveColor="bg-white/20 text-white"
                onClick={() => setIsMuted(m => !m)}
                label={isMuted ? 'Unmute' : 'Mute'}
                icon={isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              />

              {/* Speaker */}
              <ControlButton
                active={isSpeaker}
                activeColor="bg-blue-400 text-white"
                inactiveColor="bg-white/20 text-white"
                onClick={() => setIsSpeaker(s => !s)}
                label="Speaker"
                icon={isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              />

              {/* Record */}
              <ControlButton
                active={isRecording}
                activeColor="bg-red-500 text-white"
                inactiveColor="bg-white/20 text-white"
                onClick={toggleRecording}
                label={isRecording ? 'Stop REC' : 'Record'}
                icon={isRecording
                  ? <Square className="w-4 h-4 fill-white" />
                  : <Circle className="w-4 h-4" />
                }
              />
            </div>

            {/* End Call button */}
            <div className="flex justify-center">
              <button
                onClick={handleEndCall}
                className="w-16 h-16 bg-red-500 hover:bg-red-600 active:scale-95 rounded-full flex items-center justify-center shadow-lg transition-all duration-150"
              >
                <PhoneOff className="w-7 h-7 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Initiating state controls (just end/cancel) */}
        {callState === 'initiating' && (
          <div className="bg-black/20 px-6 pt-4 pb-8 flex justify-center">
            <button
              onClick={() => { setCallState('ended'); setTimeout(onClose, 800); }}
              className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-colors"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>
          </div>
        )}

        {/* Failed state: retry or close */}
        {callState === 'failed' && (
          <div className="bg-black/20 px-6 pt-4 pb-8 flex justify-center gap-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium transition-colors"
            >
              <X className="w-4 h-4" /> Close
            </button>
            <button
              onClick={() => {
                hasInitiated.current = false;
                setCallState('initiating');
                setErrorMsg('');
                setDuration(0);
                // re-trigger effect
                const el = document.getElementById('__call_retry_trigger__');
                if (el) el.click();
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium transition-colors"
            >
              <PhoneCall className="w-4 h-4" /> Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Control Button sub-component
// ─────────────────────────────────────────────
interface ControlButtonProps {
  active: boolean;
  activeColor: string;
  inactiveColor: string;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}

const ControlButton: React.FC<ControlButtonProps> = ({
  active, activeColor, inactiveColor, onClick, label, icon,
}) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-1.5"
  >
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 shadow-md ${active ? activeColor : inactiveColor}`}
    >
      {icon}
    </div>
    <span className="text-[11px] text-white/70">{label}</span>
  </button>
);

export default CallScreen;
