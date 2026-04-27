// src/components/common/LoadingScreen.tsx
import React, { useState, useEffect } from 'react';
import logo from '../../assets/logo.png';

const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 12;
      });
    }, 220);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-gray-950">

      {/* Logo */}
      <div className="relative mb-8">
        {/* Thin spinner ring */}
        <svg
          className="absolute -inset-3"
          width="96"
          height="96"
          viewBox="0 0 96 96"
          style={{ animation: 'spin 1.4s linear infinite' }}
        >
          <circle
            cx="48" cy="48" r="44"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="3"
          />
          <circle
            cx="48" cy="48" r="44"
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="60 220"
          />
        </svg>

        <img
          src={logo}
          alt="WabMeta"
          className="w-[72px] h-[72px] object-contain relative z-10"
        />
      </div>

      {/* Brand */}
      <p className="text-lg font-semibold text-gray-800 dark:text-white mb-6 tracking-wide">
        WabMeta
      </p>

      {/* Progress bar */}
      <div className="w-48 h-[3px] bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Label */}
      <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 font-medium">
        Loading your workspace...
      </p>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;