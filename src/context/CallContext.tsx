// src/context/CallContext.tsx
//
// WhatsApp voice calls for the whole dashboard: a customer's call rings on
// every page, and an agent can call from the inbox.
//
// The browser does the media (src/lib/webrtcCall.ts); the backend carries the
// SDP to and from Meta (/calling/*) and tells every agent's browser what
// happened over the socket:
//   call:incoming   a customer is calling (with Meta's SDP offer)
//   call:answered   a teammate picked it up - stop ringing here
//   call:status     our call is RINGING / ACCEPTED / REJECTED
//   call:answer-sdp Meta's SDP answer to our call
//   call:ended      the call is over (with how it ended)

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useSocket } from './SocketContext';
import {
  createAnswerSdp,
  createOfferSdp,
  createPeer,
  getMicrophone,
  startRingtone,
  stopStream,
} from '../lib/webrtcCall';
import CallPanel from '../components/inbox/CallScreen';
import IncomingCallPopup from '../components/inbox/IncomingCallPopup';

export interface CallParty {
  id?: string;
  name: string;
  phone: string;
}

export type CallPhase =
  | 'mic' // waiting for microphone permission
  | 'connecting' // preparing the connection / answering
  | 'calling' // our call sent to WhatsApp
  | 'ringing' // the customer's phone is ringing
  | 'connected'
  | 'permission' // customer has not allowed calls
  | 'ended'
  | 'failed';

export interface ActiveCall {
  direction: 'INBOUND' | 'OUTBOUND';
  callId: string | null;
  party: CallParty;
  conversationId?: string | null;
  phase: CallPhase;
  connectedAt: number | null;
  muted: boolean;
  message?: string;
  canSendRequest?: boolean;
  requestSent?: boolean;
}

export interface IncomingCall {
  callId: string;
  sdp: string;
  from: string;
  conversationId: string | null;
  party: CallParty;
  startedAt: string;
}

interface CallContextValue {
  active: ActiveCall | null;
  incoming: IncomingCall[];
  startCall: (party: CallParty, conversationId?: string | null) => void;
  acceptCall: (callId: string) => void;
  declineCall: (callId: string) => void;
  hangup: () => void;
  toggleMute: () => void;
  requestPermission: () => void;
  dismiss: () => void;
}

const CallContext = createContext<CallContextValue | null>(null);

export const useCall = (): CallContextValue => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used inside CallProvider');
  return ctx;
};

/** Meta gives about a minute to answer; drop rings older than that. */
const RING_WINDOW_MS = 60_000;

const END_TEXT: Record<string, string> = {
  COMPLETED: 'Call ended',
  MISSED: 'Missed call',
  NOT_ANSWERED: 'No answer',
  REJECTED: 'The customer declined the call',
  FAILED: 'Call failed',
};

const errorText = (err: any, fallback: string) =>
  err?.response?.data?.message || err?.message || fallback;

const toIncoming = (d: any): IncomingCall => ({
  callId: d.callId,
  sdp: d.sdp,
  from: d.from,
  conversationId: d.conversationId ?? null,
  startedAt: d.startedAt || new Date().toISOString(),
  party: {
    id: d.contact?.id,
    name: d.contact?.name || (d.from ? `+${d.from}` : 'Unknown caller'),
    phone: d.contact?.phone || (d.from ? `+${d.from}` : ''),
  },
});

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket } = useSocket() || ({} as any);
  const [active, setActive] = useState<ActiveCall | null>(null);
  const [incoming, setIncoming] = useState<IncomingCall[]>([]);

  const activeRef = useRef<ActiveCall | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const micRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Meta's answer / statuses for our call can beat the HTTP response that
  // tells us its call id; hold them until we know it.
  const earlyAnswer = useRef(new Map<string, string>());
  const earlyStatus = useRef(new Map<string, string[]>());
  // Bumped per call, so a slow step of an abandoned call cannot touch the next one.
  const attempt = useRef(0);

  const update = useCallback((patch: Partial<ActiveCall> | ((a: ActiveCall) => Partial<ActiveCall>)) => {
    setActive((cur) => {
      if (!cur) return cur;
      const next = { ...cur, ...(typeof patch === 'function' ? patch(cur) : patch) };
      activeRef.current = next;
      return next;
    });
  }, []);

  const set = useCallback((call: ActiveCall | null) => {
    activeRef.current = call;
    setActive(call);
  }, []);

  const releaseMedia = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    stopStream(micRef.current);
    micRef.current = null;
    if (audioRef.current) audioRef.current.srcObject = null;
  }, []);

  /** End the call on screen; an ended call closes itself, a failed one waits for the user. */
  const finish = useCallback(
    (phase: 'ended' | 'failed', message: string) => {
      releaseMedia();
      update({ phase, message });
      if (phase === 'ended') {
        const mine = attempt.current;
        setTimeout(() => {
          if (attempt.current === mine && activeRef.current?.phase === 'ended') set(null);
        }, 2500);
      }
    },
    [releaseMedia, update, set]
  );

  const applyStatus = useCallback(
    (status: string) => {
      const a = activeRef.current;
      if (!a) return;
      if (status === 'RINGING' && (a.phase === 'calling' || a.phase === 'connecting')) update({ phase: 'ringing' });
      else if (status === 'ACCEPTED' && a.phase !== 'connected') update({ phase: 'connected', connectedAt: Date.now() });
      else if (status === 'REJECTED') finish('ended', END_TEXT.REJECTED);
    },
    [update, finish]
  );

  const applyAnswer = useCallback(async (sdp: string) => {
    const pc = pcRef.current;
    if (!pc || pc.signalingState !== 'have-local-offer') return;
    try {
      await pc.setRemoteDescription({ type: 'answer', sdp });
    } catch (e) {
      console.error('[Call] Could not apply the SDP answer', e);
    }
  }, []);

  const watchConnection = useCallback(
    (pc: RTCPeerConnection) => {
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' && pcRef.current === pc) {
          const id = activeRef.current?.callId;
          if (id) api.post(`/calling/${id}/terminate`).catch(() => undefined);
          finish('failed', 'The call connection was lost.');
        }
      };
    },
    [finish]
  );

  // ── Socket ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onIncoming = (d: any) => {
      if (!d?.callId || !d?.sdp) return;
      setIncoming((list) => (list.some((c) => c.callId === d.callId) ? list : [...list, toIncoming(d)]));
    };
    const onAnswered = (d: any) => setIncoming((list) => list.filter((c) => c.callId !== d?.callId));
    const onEnded = (d: any) => {
      setIncoming((list) => list.filter((c) => c.callId !== d?.callId));
      const a = activeRef.current;
      if (a?.callId && a.callId === d?.callId && a.phase !== 'ended' && a.phase !== 'failed') {
        finish('ended', END_TEXT[d.status] || 'Call ended');
      }
    };
    const onStatus = (d: any) => {
      const a = activeRef.current;
      if (a?.callId === d?.callId) applyStatus(d.status);
      else if (a?.direction === 'OUTBOUND' && !a.callId && d?.callId) {
        earlyStatus.current.set(d.callId, [...(earlyStatus.current.get(d.callId) || []), d.status]);
      }
    };
    const onAnswerSdp = (d: any) => {
      const a = activeRef.current;
      if (a?.callId === d?.callId) applyAnswer(d.sdp);
      else if (a?.direction === 'OUTBOUND' && !a.callId && d?.callId) earlyAnswer.current.set(d.callId, d.sdp);
    };

    socket.on('call:incoming', onIncoming);
    socket.on('call:answered', onAnswered);
    socket.on('call:ended', onEnded);
    socket.on('call:status', onStatus);
    socket.on('call:answer-sdp', onAnswerSdp);
    return () => {
      socket.off('call:incoming', onIncoming);
      socket.off('call:answered', onAnswered);
      socket.off('call:ended', onEnded);
      socket.off('call:status', onStatus);
      socket.off('call:answer-sdp', onAnswerSdp);
    };
  }, [socket, applyStatus, applyAnswer, finish]);

  // A call already ringing when this page opened (or the socket reconnected)
  useEffect(() => {
    api
      .get('/calling/active')
      .then((res) => {
        const calls: any[] = res.data?.data || [];
        if (calls.length) {
          setIncoming((list) => [...list, ...calls.filter((c) => !list.some((l) => l.callId === c.callId)).map(toIncoming)]);
        }
      })
      .catch(() => undefined);
  }, [socket]);

  // Forget rings Meta has certainly dropped
  useEffect(() => {
    if (incoming.length === 0) return;
    const t = setInterval(() => {
      const cutoff = Date.now() - RING_WINDOW_MS;
      setIncoming((list) => list.filter((c) => new Date(c.startedAt).getTime() > cutoff));
    }, 5000);
    return () => clearInterval(t);
  }, [incoming.length]);

  // Ring while a call waits and we are not already on one
  useEffect(() => {
    if (incoming.length === 0 || active) return;
    return startRingtone();
  }, [incoming.length, active]);

  // Leaving the dashboard ends any call
  useEffect(() => () => releaseMedia(), [releaseMedia]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const startCall = useCallback(
    async (party: CallParty, conversationId?: string | null) => {
      if (activeRef.current && !['ended', 'failed', 'permission'].includes(activeRef.current.phase)) {
        toast.error('Finish the current call first.');
        return;
      }
      releaseMedia();
      const mine = ++attempt.current;
      earlyAnswer.current.clear();
      earlyStatus.current.clear();
      set({ direction: 'OUTBOUND', callId: null, party, conversationId, phase: 'mic', connectedAt: null, muted: false });

      let sdp: string;
      try {
        micRef.current = await getMicrophone();
        if (attempt.current !== mine) return stopStream(micRef.current);
        update({ phase: 'connecting' });
        const pc = createPeer(micRef.current, audioRef.current);
        pcRef.current = pc;
        watchConnection(pc);
        sdp = await createOfferSdp(pc);
      } catch (err: any) {
        if (attempt.current === mine) finish('failed', errorText(err, 'Could not start the call.'));
        return;
      }
      if (attempt.current !== mine) return;

      try {
        const res = await api.post('/calling/start', { to: party.phone, contactId: party.id, conversationId, sdp });
        const callId: string = res.data?.data?.callId;
        if (attempt.current !== mine) {
          // The agent hung up while we were dialling
          api.post(`/calling/${callId}/terminate`).catch(() => undefined);
          return;
        }
        update({ callId, phase: 'calling' });
        const answer = earlyAnswer.current.get(callId);
        if (answer) applyAnswer(answer);
        for (const s of earlyStatus.current.get(callId) || []) applyStatus(s);
      } catch (err: any) {
        if (attempt.current !== mine) return;
        if (err?.response?.data?.code === 'CALL_PERMISSION_REQUIRED') {
          releaseMedia();
          let canSendRequest = true;
          try {
            const p = await api.get('/calling/permission', { params: { phone: party.phone } });
            canSendRequest = !!p.data?.data?.canSendRequest;
          } catch {
            /* keep the button; the request call reports any limit */
          }
          update({ phase: 'permission', canSendRequest, message: errorText(err, '') });
          return;
        }
        finish('failed', errorText(err, 'Could not start the call.'));
      }
    },
    [releaseMedia, set, update, watchConnection, finish, applyAnswer, applyStatus]
  );

  const acceptCall = useCallback(
    async (callId: string) => {
      const call = incoming.find((c) => c.callId === callId);
      if (!call) return;
      if (activeRef.current && !['ended', 'failed', 'permission'].includes(activeRef.current.phase)) {
        toast.error('Finish the current call first.');
        return;
      }
      setIncoming((list) => list.filter((c) => c.callId !== callId));
      releaseMedia();
      const mine = ++attempt.current;
      set({ direction: 'INBOUND', callId, party: call.party, conversationId: call.conversationId, phase: 'mic', connectedAt: null, muted: false });

      try {
        micRef.current = await getMicrophone();
        if (attempt.current !== mine) return stopStream(micRef.current);
        update({ phase: 'connecting' });
        const pc = createPeer(micRef.current, audioRef.current);
        pcRef.current = pc;
        watchConnection(pc);
        const sdp = await createAnswerSdp(pc, call.sdp);
        await api.post(`/calling/${callId}/accept`, { sdp });
        if (attempt.current === mine) update({ phase: 'connected', connectedAt: Date.now() });
      } catch (err: any) {
        if (attempt.current === mine) finish('failed', errorText(err, 'Could not answer the call.'));
      }
    },
    [incoming, releaseMedia, set, update, watchConnection, finish]
  );

  const declineCall = useCallback((callId: string) => {
    setIncoming((list) => list.filter((c) => c.callId !== callId));
    api.post(`/calling/${callId}/reject`).catch((err) => toast.error(errorText(err, 'Could not decline the call.')));
  }, []);

  const hangup = useCallback(() => {
    const a = activeRef.current;
    if (!a) return;
    attempt.current++;
    if (['permission', 'failed', 'ended'].includes(a.phase)) {
      releaseMedia();
      set(null);
      return;
    }
    if (a.callId) api.post(`/calling/${a.callId}/terminate`).catch(() => undefined);
    finish('ended', 'Call ended');
  }, [releaseMedia, set, finish]);

  const toggleMute = useCallback(() => {
    const tracks = micRef.current?.getAudioTracks() || [];
    const muted = !activeRef.current?.muted;
    tracks.forEach((t) => (t.enabled = !muted));
    update({ muted });
  }, [update]);

  const requestPermission = useCallback(async () => {
    const a = activeRef.current;
    if (!a) return;
    try {
      await api.post('/calling/permission-request', { to: a.party.phone, conversationId: a.conversationId });
      update({ requestSent: true });
      toast.success('Call permission request sent');
    } catch (err: any) {
      toast.error(errorText(err, 'Could not send the request.'));
    }
  }, [update]);

  const dismiss = useCallback(() => {
    releaseMedia();
    set(null);
  }, [releaseMedia, set]);

  return (
    <CallContext.Provider
      value={{ active, incoming, startCall, acceptCall, declineCall, hangup, toggleMute, requestPermission, dismiss }}
    >
      {children}
      <audio ref={audioRef} autoPlay playsInline className="hidden" />
      {!active && incoming.length > 0 && (
        <IncomingCallPopup call={incoming[0]} more={incoming.length - 1} onAccept={acceptCall} onDecline={declineCall} />
      )}
      {active && <CallPanel />}
    </CallContext.Provider>
  );
};
