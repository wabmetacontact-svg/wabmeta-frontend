import React from 'react';
import logo from '../../assets/logo.png';

const AuthLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050816]">

      {/* ✅ Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 50% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 70%),
              linear-gradient(135deg, #050816 0%, #0a0e27 100%)
            `,
          }}
        />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
          }}
        />
      </div>

      {/* ✅ Glass card */}
      <div className="relative rounded-3xl overflow-hidden
        bg-white/[0.04] backdrop-blur-2xl
        border border-white/[0.1]
        shadow-[0_20px_60px_rgba(0,0,0,0.3)]
        px-12 py-10">

        {/* Shimmer */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)',
          }}
        />

        {/* Top edge highlight */}
        <div className="absolute top-0 left-[15%] right-[15%] h-px 
          bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="relative flex flex-col items-center">

          {/* Logo with spinner */}
          <div className="relative mb-6">
            {/* Outer glow */}
            <div className="absolute inset-0 -m-4 bg-green-500/20 rounded-full blur-2xl animate-pulse" />

            {/* Spinner ring */}
            <svg
              className="absolute -inset-3"
              width="88"
              height="88"
              viewBox="0 0 88 88"
              style={{ animation: 'spin 1.6s linear infinite' }}
            >
              <circle
                cx="44" cy="44" r="40"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="2"
              />
              <circle
                cx="44" cy="44" r="40"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="60 200"
                style={{ filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.6))' }}
              />
            </svg>

            {/* Logo */}
            <div className="relative w-16 h-16 rounded-xl
              bg-white/[0.06] backdrop-blur-xl
              border border-white/[0.1]
              flex items-center justify-center">
              <img
                src={logo}
                alt="WabMeta"
                className="w-10 h-10 object-contain
                  drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              />
            </div>
          </div>

          {/* Text */}
          <div className="text-center">
            <h3 className="text-base font-semibold text-white mb-1">
              Verifying your session
            </h3>
            <p className="text-xs text-gray-400 flex items-center gap-1.5 justify-center">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
              </span>
              Just a moment...
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthLoadingScreen;