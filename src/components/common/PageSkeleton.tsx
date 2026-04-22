// src/components/common/PageSkeleton.tsx
import React from 'react';

const PageSkeleton: React.FC = () => {
  return (
    <div className="w-full mx-auto p-6 space-y-6 animate-pulse">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded mt-3" />
        </div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl hidden sm:block" />
      </div>

      {/* Top Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        ))}
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[400px] bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        <div className="h-[400px] bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      </div>
      
      {/* List Area */}
      <div className="space-y-4 pt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
        ))}
      </div>
    </div>
  );
};

export default PageSkeleton;
