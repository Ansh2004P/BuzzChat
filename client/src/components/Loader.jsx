import React from "react";

// Optimized CSS-only loader to replace heavy Lottie animations
const Loader = React.memo(({ size = "medium", message = "Loading..." }) => {
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-12 h-12", 
    large: "w-16 h-16"
  };

  return (
    <div className="flex flex-col justify-center items-center p-8">
      <div className={`${sizeClasses[size]} border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin`} />
      {message && (
        <p className="mt-4 text-white text-sm opacity-70">
          {message}
        </p>
      )}
    </div>
  );
});

Loader.displayName = 'Loader';

// Skeleton loader for better perceived performance
export const SkeletonLoader = React.memo(({ lines = 3, className = "" }) => (
  <div className={`animate-pulse ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <div 
        key={index}
        className="h-4 bg-neutral-600 rounded mb-2 last:mb-0"
        style={{ width: `${100 - index * 10}%` }}
      />
    ))}
  </div>
));

SkeletonLoader.displayName = 'SkeletonLoader';

export default Loader;
