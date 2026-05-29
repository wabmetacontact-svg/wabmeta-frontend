// src/components/inbox/VoiceRecorder.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Send, Trash2, Pause, Play, X } from 'lucide-react';
import { formatDuration } from '../../utils/inboxHelpers';
import toast from 'react-hot-toast';

interface Props {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  onCancel: () => void;
  onSend: (audioBlob: Blob, duration: number) => Promise<void>;
}

const VoiceRecorder: React.FC<Props> = ({ isRecording, onStart, onStop, onCancel, onSend }) => {
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sending, setSending] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Waveform visualization
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(30).fill(20));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  // ── Start recording ─────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Audio analyser for waveform
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Start waveform animation
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateWaveform = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const levels = Array.from({ length: 30 }, (_, i) => {
          const idx = Math.floor((i / 30) * dataArray.length);
          return Math.max(20, (dataArray[idx] / 255) * 100);
        });
        setAudioLevels(levels);
        animationRef.current = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();

      // MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));

        // Stop all tracks
        streamRef.current?.getTracks().forEach((t) => t.stop());

        // Cleanup audio context
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        audioContextRef.current?.close();
        audioContextRef.current = null;
        analyserRef.current = null;
      };

      mediaRecorder.start();
      setDuration(0);
      setIsPaused(false);

      // Duration timer
      intervalRef.current = setInterval(() => {
        setDuration((d) => {
          // Max 5 min recording
          if (d >= 300) {
            stopRecording();
            return 300;
          }
          return d + 1;
        });
      }, 1000);

      onStart();
    } catch (e) {
      console.error('Recording failed:', e);
      toast.error('Microphone access denied');
      onCancel();
    }
  }, [onStart, onCancel]);

  // ── Stop recording ──────────────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    onStop();
  }, [onStop]);

  // ── Cancel recording ────────────────────────────────────────────────────
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioContextRef.current?.close();
    audioContextRef.current = null;

    setDuration(0);
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPaused(false);
    setIsPlaying(false);
    if (audioUrl) URL.revokeObjectURL(audioUrl);

    onCancel();
  }, [onCancel, audioUrl]);

  // ── Send recording ──────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!audioBlob) return;
    try {
      setSending(true);
      await onSend(audioBlob, duration);
      cancelRecording();
    } catch (e) {
      console.error('Send voice failed:', e);
      toast.error('Failed to send voice message');
    } finally {
      setSending(false);
    }
  };

  // ── Toggle play/pause preview ──────────────────────────────────────────
  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  // ── Auto-start recording when isRecording becomes true ─────────────────
  useEffect(() => {
    if (isRecording && !mediaRecorderRef.current) {
      startRecording();
    }
  }, [isRecording, startRecording]);

  // ── Cleanup on unmount ──────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioContextRef.current?.close();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Preview mode (recording stopped, ready to send) ────────────────────
  if (audioBlob && audioUrl) {
    return (
      <div className="
        flex items-center gap-3 w-full
        bg-[#0f1729]/95 backdrop-blur-xl
        border border-emerald-500/30
        rounded-2xl px-3 py-2.5
        animate-slide-right
      ">
        {/* Cancel */}
        <button
          onClick={cancelRecording}
          disabled={sending}
          className="
            p-2 rounded-full
            bg-red-500/15 hover:bg-red-500/25
            text-red-400 hover:text-red-300
            transition-colors disabled:opacity-50
          "
          title="Discard"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={togglePlayback}
          disabled={sending}
          className="
            w-9 h-9 rounded-full
            bg-emerald-500 hover:bg-emerald-600
            text-white
            flex items-center justify-center
            transition-colors disabled:opacity-50
            shadow-md
          "
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>

        {/* Waveform / Duration */}
        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 h-8 flex items-center gap-0.5">
            {audioLevels.map((level, i) => (
              <div
                key={i}
                className="w-0.5 rounded-full bg-emerald-400/40"
                style={{ height: `${level * 0.3 + 20}%` }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-300 font-mono font-medium tabular-nums">
            {formatDuration(duration)}
          </span>
        </div>

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={sending}
          className="
            w-10 h-10 rounded-full
            bg-emerald-500 hover:bg-emerald-600
            text-white
            flex items-center justify-center
            transition-all shadow-md hover:shadow-emerald-500/40
            disabled:opacity-50 hover:scale-105 active:scale-95
          "
          title="Send voice message"
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>

        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          src={audioUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      </div>
    );
  }

  // ── Recording mode (active recording) ──────────────────────────────────
  if (isRecording) {
    return (
      <div className="
        flex items-center gap-3 w-full
        bg-[#0f1729]/95 backdrop-blur-xl
        border border-red-500/30
        rounded-2xl px-3 py-2.5
        animate-slide-right
      ">
        {/* Cancel */}
        <button
          onClick={cancelRecording}
          className="
            p-2 rounded-full
            bg-white/10 hover:bg-white/15
            text-gray-300 hover:text-white
            transition-colors
          "
          title="Cancel"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Recording indicator */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative w-3 h-3">
            <div className="absolute inset-0 bg-red-500 rounded-full animate-record-pulse" />
            <div className="relative w-3 h-3 bg-red-500 rounded-full" />
          </div>
          <span className="text-xs text-red-400 font-semibold uppercase tracking-wider">
            Recording
          </span>
        </div>

        {/* Live waveform */}
        <div className="flex-1 h-8 flex items-center gap-0.5">
          {audioLevels.map((level, i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-emerald-400 transition-all"
              style={{
                height: `${level * 0.5 + 15}%`,
                opacity: 0.4 + (level / 100) * 0.6,
              }}
            />
          ))}
        </div>

        {/* Duration */}
        <span className="text-sm text-white font-mono font-medium tabular-nums">
          {formatDuration(duration)}
        </span>

        {/* Stop (will go to preview) */}
        <button
          onClick={stopRecording}
          className="
            w-10 h-10 rounded-full
            bg-emerald-500 hover:bg-emerald-600
            text-white
            flex items-center justify-center
            transition-all shadow-md
            hover:scale-105 active:scale-95
          "
          title="Stop recording"
        >
          <div className="w-3 h-3 bg-white rounded-sm" />
        </button>
      </div>
    );
  }

  return null;
};

export default VoiceRecorder;
