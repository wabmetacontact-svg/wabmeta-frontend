// src/lib/webrtcCall.ts
//
// The browser side of a WhatsApp call: microphone, one RTCPeerConnection, and
// the SDP that travels to Meta through our backend.
//
// Meta takes a single complete SDP (no trickle ICE), so every offer/answer
// waits for ICE gathering to finish before it is handed over.

/** STUN lets the browser learn its public address; Meta's media servers are public. */
export const ICE_SERVERS: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }];

const ICE_GATHER_TIMEOUT_MS = 3000;

/** The microphone, with the browser's voice processing on. Errors in words. */
export async function getMicrophone(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('This browser cannot make calls. Use the latest Chrome, Edge or Firefox over https.');
  }
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      video: false,
    });
  } catch (err: any) {
    if (err?.name === 'NotAllowedError' || err?.name === 'SecurityError') {
      throw new Error('Microphone access is blocked. Allow the microphone for this site in the browser address bar, then try again.');
    }
    if (err?.name === 'NotFoundError' || err?.name === 'OverconstrainedError') {
      throw new Error('No microphone found. Connect a microphone or headset and try again.');
    }
    if (err?.name === 'NotReadableError') {
      throw new Error('The microphone is in use by another app. Close it and try again.');
    }
    throw new Error(err?.message || 'Could not open the microphone.');
  }
}

/** A peer connection that plays whatever the other side says into `audio`. */
export function createPeer(mic: MediaStream, audio: HTMLAudioElement | null): RTCPeerConnection {
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
  for (const track of mic.getAudioTracks()) pc.addTrack(track, mic);
  pc.ontrack = (e) => {
    if (!audio) return;
    audio.srcObject = e.streams[0] ?? new MediaStream([e.track]);
    audio.play().catch(() => {
      /* autoplay is allowed after the user's click on Call / Accept */
    });
  };
  return pc;
}

/** Resolve once ICE gathering is complete (or after a short timeout with what we have). */
export function waitForIceGathering(pc: RTCPeerConnection, timeoutMs = ICE_GATHER_TIMEOUT_MS): Promise<void> {
  if (pc.iceGatheringState === 'complete') return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer);
      pc.removeEventListener('icegatheringstatechange', onChange);
      resolve();
    };
    const onChange = () => {
      if (pc.iceGatheringState === 'complete') done();
    };
    const timer = setTimeout(done, timeoutMs);
    pc.addEventListener('icegatheringstatechange', onChange);
  });
}

/** Our call: the SDP offer Meta sends on to the customer. */
export async function createOfferSdp(pc: RTCPeerConnection): Promise<string> {
  const offer = await pc.createOffer({ offerToReceiveAudio: true });
  await pc.setLocalDescription(offer);
  await waitForIceGathering(pc);
  return pc.localDescription!.sdp;
}

/** A customer's call: answer the SDP offer Meta delivered. */
export async function createAnswerSdp(pc: RTCPeerConnection, offerSdp: string): Promise<string> {
  await pc.setRemoteDescription({ type: 'offer', sdp: offerSdp });
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  await waitForIceGathering(pc);
  return pc.localDescription!.sdp;
}

export function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((t) => t.stop());
}

/** A soft two-tone ring, made in the browser (no audio file to load). */
export function startRingtone(): () => void {
  const Ctx = window.AudioContext || (window as any).webkitAudioContext;
  if (!Ctx) return () => undefined;
  let ctx: AudioContext | null = null;
  try {
    ctx = new Ctx();
  } catch {
    return () => undefined;
  }
  const ring = () => {
    if (!ctx) return;
    const t = ctx.currentTime;
    for (const [offset, freq] of [[0, 440], [0, 480], [0.45, 440], [0.45, 480]] as const) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t + offset);
      gain.gain.linearRampToValueAtTime(0.05, t + offset + 0.02);
      gain.gain.linearRampToValueAtTime(0, t + offset + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t + offset);
      osc.stop(t + offset + 0.4);
    }
  };
  ring();
  const timer = setInterval(ring, 2500);
  return () => {
    clearInterval(timer);
    ctx?.close().catch(() => undefined);
    ctx = null;
  };
}
