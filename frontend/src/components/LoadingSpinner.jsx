import React from 'react';

/**
 * LoadingSpinner component
 * @param {boolean} fullPage - Whether to show as a full-page overlay
 * @param {'sm'|'md'|'lg'} size - Size variant
 * @param {boolean} dots - Show pulsing dots instead of ring
 */
const LoadingSpinner = ({ fullPage = false, size = 'md', dots = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-20 h-20 border-4',
  };

  const dotSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const spinner = dots ? (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${dotSizeClasses[size]} rounded-full bg-red-500 dark:bg-red-400 animate-bounce`}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  ) : (
    <div className="relative">
      {/* Outer gradient ring */}
      <div
        className={`${sizeClasses[size]} rounded-full border-transparent animate-spin`}
        style={{
          borderTopColor: '#ef4444',
          borderRightColor: '#3b82f6',
          borderBottomColor: '#eab308',
          borderLeftColor: 'transparent',
        }}
      />
      {/* Inner pulse */}
      <div
        className={`absolute inset-0 m-auto rounded-full bg-gradient-to-br from-red-500 to-blue-500 opacity-20 animate-pulse`}
        style={{ width: '40%', height: '40%' }}
      />
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
            جارٍ التحميل... / Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
