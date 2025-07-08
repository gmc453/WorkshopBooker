import React from 'react';
import { lazy } from 'react';

// Lazy loading dla Charts
export const RevenueChart = lazy(() => import('./RevenueChart'));
export const ServicesChart = lazy(() => import('./ServicesChart'));
export const TimeSlotChart = lazy(() => import('./TimeSlotChart'));
export const ComparisonChart = lazy(() => import('./ComparisonChart'));
export const HeatmapChart = lazy(() => import('./HeatmapChart'));

// ChartSkeleton component dla loading states
export const ChartSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow p-6 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="h-64 bg-gray-200 rounded"></div>
    <div className="mt-4 flex justify-center space-x-4">
      <div className="h-3 bg-gray-200 rounded w-16"></div>
      <div className="h-3 bg-gray-200 rounded w-16"></div>
      <div className="h-3 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
); 