import React from 'react';

const PageSkeleton: React.FC = () => {
  return (
    <div className="w-full mx-auto p-6 space-y-6">

      {/* ✅ Header Area */}
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <SkeletonBox className="h-8 w-48" />
          <SkeletonBox className="h-4 w-64" />
        </div>
        <SkeletonBox className="h-10 w-32 rounded-xl hidden sm:block" />
      </div>

      {/* ✅ Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="relative h-32 rounded-2xl overflow-hidden
              bg-white/[0.03] backdrop-blur-xl
              border border-white/[0.06]
              p-5"
            style={{
              animation: `pulse 2s ease-in-out ${i * 100}ms infinite`,
            }}
          >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)',
              }}
            />

            <div className="relative space-y-3">
              {/* Icon */}
              <SkeletonBox className="h-10 w-10 rounded-xl" />
              {/* Value */}
              <SkeletonBox className="h-6 w-20" />
              {/* Label */}
              <SkeletonBox className="h-3 w-24" />
            </div>

            {/* Sliding shimmer */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute inset-y-0 -inset-x-full
                bg-gradient-to-r from-transparent via-white/[0.04] to-transparent
                animate-skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Big card - left */}
        <div className="lg:col-span-2 relative h-[400px] rounded-2xl overflow-hidden
          bg-white/[0.03] backdrop-blur-xl
          border border-white/[0.06]
          p-6">

          <div className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)',
            }}
          />

          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <SkeletonBox className="h-6 w-40" />
              <SkeletonBox className="h-8 w-24 rounded-lg" />
            </div>

            {/* Fake chart bars */}
            <div className="flex items-end gap-2 h-48 mt-8">
              {[60, 45, 80, 35, 95, 70, 55, 85, 40, 75, 90, 50].map((height, i) => (
                <SkeletonBox
                  key={i}
                  className="flex-1 rounded-t-lg"
                  style={{
                    height: `${height}%`,
                    animationDelay: `${i * 60}ms`,
                  }}
                />
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
              <SkeletonBox className="h-4 w-32" />
              <SkeletonBox className="h-4 w-20" />
            </div>
          </div>

          {/* Sliding shimmer */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-y-0 -inset-x-full
              bg-gradient-to-r from-transparent via-white/[0.04] to-transparent
              animate-skeleton-shimmer" />
          </div>
        </div>

        {/* Right card */}
        <div className="relative h-[400px] rounded-2xl overflow-hidden
          bg-white/[0.03] backdrop-blur-xl
          border border-white/[0.06]
          p-6">

          <div className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)',
            }}
          />

          <div className="relative space-y-4">
            <SkeletonBox className="h-6 w-32" />

            {/* List items */}
            <div className="space-y-3 mt-6">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <SkeletonBox className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <SkeletonBox className="h-3 w-3/4" />
                    <SkeletonBox className="h-2 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sliding shimmer */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-y-0 -inset-x-full
              bg-gradient-to-r from-transparent via-white/[0.04] to-transparent
              animate-skeleton-shimmer" />
          </div>
        </div>
      </div>

      {/* ✅ List/Table Area */}
      <div className="relative rounded-2xl overflow-hidden
        bg-white/[0.03] backdrop-blur-xl
        border border-white/[0.06]
        p-6">

      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)',
        }}
      />

        <div className="relative space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.05]">
            <SkeletonBox className="h-5 w-32" />
            <SkeletonBox className="h-8 w-24 rounded-lg" />
          </div>

          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 py-3"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <SkeletonBox className="h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <SkeletonBox className="h-3 w-1/3" />
                <SkeletonBox className="h-2 w-1/4" />
              </div>
              <SkeletonBox className="h-6 w-20 rounded-full hidden sm:block" />
              <SkeletonBox className="h-8 w-8 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Sliding shimmer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-y-0 -inset-x-full
            bg-gradient-to-r from-transparent via-white/[0.04] to-transparent
            animate-skeleton-shimmer" />
        </div>
      </div>

      <style>{`
        @keyframes skeleton-shimmer {
          0% { transform: translateX(0%); }
          100% { transform: translateX(200%); }
        }
        .animate-skeleton-shimmer {
          animation: skeleton-shimmer 2.5s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

// ✅ Reusable skeleton box
const SkeletonBox: React.FC<{ 
  className?: string; 
  style?: React.CSSProperties;
}> = ({ className = '', style }) => (
  <div
    className={`bg-white/[0.06] rounded-md ${className}`}
    style={{
      animation: 'pulse 2s ease-in-out infinite',
      ...style,
    }}
  />
);

export default PageSkeleton;
