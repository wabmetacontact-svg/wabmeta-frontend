import React, { useState, useEffect } from 'react';
import logo from '../../assets/logo.png';

const LOADING_MESSAGES = [
  'Connecting to WhatsApp...',
  'Loading your workspace...',
  'Almost there...',
  'Setting things up...',
];

const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 92) return prev;
        return prev + Math.random() * 10;
      });
    }, 250);

    const msgTimer = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(msgTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#050816]">

      {/* ✅ Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 70% 60% at 30% 30%, rgba(16, 185, 129, 0.25) 0%, transparent 60%),
              radial-gradient(ellipse 60% 50% at 70% 70%, rgba(59, 130, 246, 0.2) 0%, transparent 60%),
              linear-gradient(135deg, #050816 0%, #0a0e27 50%, #050816 100%)
            `,
          }}
        />

        {/* Floating orbs */}
        <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] 
          bg-gradient-to-r from-green-500/20 to-emerald-500/10 
          rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] 
          bg-gradient-to-r from-blue-500/15 to-cyan-500/10 
          rounded-full blur-[100px] animate-blob animation-delay-2000" />

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
          }}
        />
      </div>

      {/* ✅ Main content */}
      <div className="relative flex flex-col items-center">

        {/* Logo with multi-layer glow + spinner */}
        <div className="relative mb-10">

          {/* Outer pulsing glow */}
          <div className="absolute inset-0 -m-8 bg-green-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '2s' }} />

          {/* Spinner ring - thin & elegant */}
          <svg
            className="absolute -inset-5"
            width="140"
            height="140"
            viewBox="0 0 140 140"
            style={{ animation: 'spin 1.8s linear infinite' }}
          >
            {/* Background ring */}
            <circle
              cx="70" cy="70" r="65"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="2"
            />
            {/* Active arc with gradient */}
            <defs>
              <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle
              cx="70" cy="70" r="65"
              fill="none"
              stroke="url(#loaderGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="100 308"
              style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.6))' }}
            />
          </svg>

          {/* Reverse spinner inner */}
          <svg
            className="absolute -inset-2"
            width="110"
            height="110"
            viewBox="0 0 110 110"
            style={{ animation: 'spin 2.4s linear infinite reverse' }}
          >
            <circle
              cx="55" cy="55" r="50"
              fill="none"
              stroke="rgba(59, 130, 246, 0.3)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeDasharray="20 280"
            />
          </svg>

          {/* Logo container with glass effect */}
          <div className="relative w-24 h-24 rounded-2xl
            bg-white/[0.06] backdrop-blur-xl
            border border-white/[0.12]
            flex items-center justify-center
            shadow-[0_8px_32px_rgba(16,185,129,0.3)]">
            <img
              src={logo}
              alt="WabMeta"
              className="w-16 h-16 object-contain
                drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]
                animate-pulse"
              style={{ animationDuration: '2s' }}
            />
          </div>
        </div>

        {/* Brand name with gradient */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1
            bg-gradient-to-br from-white via-white to-gray-400 
            bg-clip-text text-transparent">
            WabMeta
          </h1>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500">
            WhatsApp Business · Loading
          </p>
        </div>

        {/* Progress bar - glass styled */}
        <div className="relative w-72">
          <div className="h-1 rounded-full overflow-hidden
            bg-white/[0.06] backdrop-blur-xl
            border border-white/[0.08]">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
              style={{
                width: `${Math.min(progress, 100)}%`,
                background: 'linear-gradient(to right, #10b981, #34d399)',
                boxShadow: '0 0 12px rgba(16,185,129,0.6)',
              }}
            >
              {/* Shine sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent
                animate-shimmer" />
            </div>
          </div>

          {/* Progress percentage */}
          <div className="flex justify-between mt-3 text-[10px] font-mono">
            <span className="text-gray-500 transition-all duration-300">
              {LOADING_MESSAGES[messageIndex]}
            </span>
            <span className="text-green-400 tabular-nums">
              {Math.floor(Math.min(progress, 100))}%
            </span>
          </div>
        </div>

        {/* Bottom dots */}
        <div className="flex items-center gap-1.5 mt-10">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce"
              style={{
                animationDelay: `${i * 150}ms`,
                animationDuration: '1.4s',
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;