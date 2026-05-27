import React from 'react';
import logo from '../../assets/logo.png';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050816]">
      <div className="flex flex-col items-center">

        {/* Logo with subtle pulse */}
        <img
          src={logo}
          alt="WabMeta"
          className="w-16 h-16 object-contain mb-8 animate-pulse"
          style={{ animationDuration: '1.8s' }}
        />

        {/* Thin loading bar */}
        <div className="w-32 h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full animate-loading-bar" />
        </div>
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); width: 40%; }
          50% { transform: translateX(60%); width: 60%; }
          100% { transform: translateX(250%); width: 40%; }
        }
        .animate-loading-bar {
          animation: loading-bar 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;