"use client";

import React from 'react';

interface SkeletonCalendarProps {
  className?: string;
}

export const SkeletonCalendar: React.FC<SkeletonCalendarProps> = ({ className = "" }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header skeleton */}
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>

      {/* Calendar grid skeleton */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="h-8 bg-gray-200 rounded animate-pulse"></div>
        ))}
        
        {/* Calendar cells */}
        {Array.from({ length: 35 }).map((_, index) => (
          <div key={index} className="h-16 bg-gray-100 rounded animate-pulse"></div>
        ))}
      </div>

      {/* Time slots skeleton */}
      <div className="space-y-3">
        <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-12 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}; 