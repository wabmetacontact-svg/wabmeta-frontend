import React from 'react';
import logo from '../../assets/logo.png';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  fullScreen = false,
  text = 'Loading...',
}) => {
  const sizeConfig = {
    sm: { logo: 'w-8 h-8', spinner: 60, container: 'w-12 h-12', stroke: 2 },
    md: { logo: 'w-12 h-12', spinner: 88, container: 'w-16 h-16', stroke: 2 },
    lg: { logo: 'w-16 h-16', spinner: 120, container: 'w-24 h-24', stroke: 2.5 },
  };

  const config = sizeConfig[size];

  const content = (
    <div className="flex flex-col items-center justify-center">

      {/* Logo with spinner */}
      <div className="relative mb-4">

        {/* Glow */}
        <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl animate-pulse" />

        {/* Spinner */}
        <svg
          className="absolute"
          width={config.spinner}
          height={config.spinner}
          viewBox={`0 0 ${config.spinner} ${config.spinner}`}
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'spin 1.5s linear infinite',
          }}
        >
          <circle
            cx={config.spinner / 2}
            cy={config.spinner / 2}
            r={config.spinner / 2 - 3}
            fill="none"
            stroke="rgba(16,185,129,0.1)"
            strokeWidth={config.stroke}
          />
          <circle
            cx={config.spinner / 2}
            cy={config.spinner / 2}
            r={config.spinner / 2 - 3}
            fill="none"
            stroke="#10b981"
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={`${config.spinner * 0.4} ${config.spinner * 3}`}
            style={{ filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.5))' }}
          />
        </svg>

        {/* Logo container */}
        <div className={`relative ${config.container} rounded-xl
          bg-white
          border border-gray-200
          shadow-sm
          flex items-center justify-center`}>
          <img
            src={logo}
            alt="WabMeta"
            className={`${config.logo} object-contain`}
          />
        </div>
      </div>

      {/* Text */}
      {text && (
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-700 font-medium">{text}</p>
          <span className="flex items-center gap-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce"
                style={{
                  animationDelay: `${i * 150}ms`,
                  animationDuration: '1.4s',
                }}
              />
            ))}
          </span>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center 
        bg-white/80 backdrop-blur-md">
        {/* Subtle gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
          }}
        />

        {/* Glass card */}
        <div className="relative rounded-2xl overflow-hidden
          bg-white
          border border-gray-200
          shadow-[0_20px_60px_rgba(16,185,129,0.12)]
          p-8">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.04) 0%, transparent 50%)',
            }}
          />
          <div className="relative">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  );
};

export default Loader;