// src/components/common/LoadingScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import logo from '../../assets/logo.png';

// ─── Floating Particle ────────────────────────────────────────────────────────
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  delay: number;
  color: string;
}

const COLORS = [
  'rgba(52,211,153,',   // emerald
  'rgba(16,185,129,',   // green
  'rgba(6,182,212,',    // cyan
  'rgba(99,102,241,',   // indigo
];

const generateParticles = (count: number): Particle[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    speed: Math.random() * 3 + 2,
    opacity: Math.random() * 0.5 + 0.2,
    delay: Math.random() * 3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));

// ─── Loading Messages ─────────────────────────────────────────────────────────
const MESSAGES = [
  'Initializing workspace...',
  'Connecting to WhatsApp API...',
  'Loading your conversations...',
  'Almost there...',
  'Welcome to WabMeta!',
];

// ─── Main Component ───────────────────────────────────────────────────────────
const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [particles] = useState<Particle[]>(() => generateParticles(22));
  const [dots, setDots] = useState('');
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  // Smooth progress using requestAnimationFrame
  useEffect(() => {
    const duration = 2800; // ms total fake load
    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const raw = Math.min((elapsed / duration) * 100, 97); // stop at 97 — real data finishes it
      // Ease-out curve
      const eased = 100 - Math.pow(1 - raw / 100, 2) * 100;
      setProgress(Math.min(eased, 97));
      if (raw < 97) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Cycle loading messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => Math.min(prev + 1, MESSAGES.length - 1));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 380);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d1117 0%, #0f1923 40%, #0d1f2d 70%, #0a1628 100%)' }}>

      {/* ── Floating Particles ── */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `${p.color}${p.opacity})`,
            animation: `floatUp ${p.speed}s ease-in-out ${p.delay}s infinite alternate`,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}0.4)`,
          }}
        />
      ))}

      {/* ── Background Glow Blobs ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #10b981, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      {/* ── Grid Lines (subtle) ── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* ── Center Content ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">

        {/* Glassmorphism Card */}
        <div className="relative flex flex-col items-center px-10 py-10 rounded-3xl"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}>

          {/* Outer orbit ring */}
          <div className="relative mb-8">
            {/* Orbit ring 1 — slow spin */}
            <svg className="absolute inset-0" width="160" height="160" viewBox="0 0 160 160"
              style={{ animation: 'spin 4s linear infinite', top: '-8px', left: '-8px' }}>
              <circle cx="80" cy="80" r="76" fill="none" stroke="rgba(16,185,129,0.15)" strokeWidth="1.5" />
              <circle cx="80" cy="80" r="76" fill="none"
                stroke="url(#g1)" strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="80 400" />
              <defs>
                <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                  <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>

            {/* Orbit ring 2 — counter spin */}
            <svg className="absolute inset-0" width="130" height="130" viewBox="0 0 130 130"
              style={{ animation: 'spinReverse 3s linear infinite', top: '7px', left: '7px' }}>
              <circle cx="65" cy="65" r="61" fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth="1" />
              <circle cx="65" cy="65" r="61" fill="none"
                stroke="rgba(99,102,241,0.6)" strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="30 350" />
            </svg>

            {/* Logo circle */}
            <div className="relative w-36 h-36 rounded-full flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle at 40% 35%, rgba(16,185,129,0.12), rgba(10,22,40,0.9))',
                border: '1px solid rgba(16,185,129,0.2)',
                boxShadow: '0 0 40px rgba(16,185,129,0.15), inset 0 0 30px rgba(0,0,0,0.4)',
              }}>
              <img
                src={logo}
                alt="WabMeta"
                className="h-16 w-16 object-contain"
                style={{ filter: 'drop-shadow(0 0 12px rgba(16,185,129,0.5))' }}
              />

              {/* Pulse ring */}
              <div className="absolute inset-0 rounded-full"
                style={{ animation: 'pulse 2s ease-in-out infinite', border: '2px solid rgba(16,185,129,0.3)' }} />
            </div>

            {/* Orbiting dot */}
            <div className="absolute w-3 h-3 rounded-full"
              style={{
                background: 'linear-gradient(135deg,#10b981,#34d399)',
                boxShadow: '0 0 10px #10b981',
                top: '4px',
                left: '50%',
                marginLeft: '-6px',
                transformOrigin: '6px 74px',
                animation: 'orbit 2.5s linear infinite',
              }} />
            <div className="absolute w-2 h-2 rounded-full"
              style={{
                background: 'linear-gradient(135deg,#6366f1,#818cf8)',
                boxShadow: '0 0 8px #6366f1',
                bottom: '10px',
                right: '4px',
                transformOrigin: '-62px -10px',
                animation: 'orbit 3.5s linear infinite reverse',
              }} />
          </div>

          {/* Brand name */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xl font-bold text-white tracking-wide">Wab</span>
            <span className="text-xl font-bold tracking-wide"
              style={{ background: 'linear-gradient(90deg,#10b981,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Meta
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-56 mb-3">
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #059669, #10b981, #34d399)',
                  boxShadow: '0 0 10px rgba(16,185,129,0.6)',
                }}
              />
            </div>
            {/* Percentage */}
            <div className="flex justify-end mt-1">
              <span className="text-xs font-mono" style={{ color: 'rgba(52,211,153,0.7)' }}>
                {Math.floor(progress)}%
              </span>
            </div>
          </div>

          {/* Loading message */}
          <p className="text-sm text-center font-medium" style={{ color: 'rgba(156,163,175,0.9)', minHeight: '20px' }}>
            {MESSAGES[msgIndex]}<span className="inline-block w-6 text-left"
              style={{ color: '#10b981' }}>{dots}</span>
          </p>

          {/* Status dots */}
          <div className="flex items-center gap-2 mt-5">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: '#10b981',
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  boxShadow: '0 0 6px #10b981',
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="mt-8 text-xs font-medium tracking-widest uppercase"
          style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em' }}>
          WhatsApp Business Platform
        </p>
      </div>

      {/* ── Keyframe Styles ── */}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0px) scale(1); opacity: 0.2; }
          100% { transform: translateY(-30px) scale(1.3); opacity: 0.5; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes spinReverse {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.9; transform: scale(1.06); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%            { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;