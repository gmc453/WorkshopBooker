import React from 'react';
import { Link } from 'react-router-dom';
import { useWorkshopQuickStats } from '../hooks/useWorkshopQuickStats';

interface WorkshopAnalyticsCardProps {
  workshop: {
    id: string;
    name: string;
  };
}

const formatCurrency = (amount: number | undefined | null) => {
  const value = amount ?? 0;
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(value);
};

const formatPercentage = (value: number | undefined | null) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.0%';
  }
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export const WorkshopAnalyticsCard: React.FC<WorkshopAnalyticsCardProps> = ({ workshop }) => {
  const { data: quickStats, isLoading } = useWorkshopQuickStats(workshop.id);

  return (
    <Link
      to={`/analytics/${workshop.id}`}
      className="block bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">{workshop.name}</h4>
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
          📊
        </span>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Przychody:</span>
            <div className="font-semibold">{formatCurrency(quickStats?.monthlyRevenue)}</div>
          </div>
          <div>
            <span className="text-gray-500">Rezerwacje:</span>
            <div className="font-semibold">{quickStats?.monthlyBookings}</div>
          </div>
          <div>
            <span className="text-gray-500">Ocena:</span>
            <div className="font-semibold">⭐ {quickStats?.averageRating?.toFixed(1)}</div>
          </div>
          <div>
            <span className="text-gray-500">Wzrost:</span>
            <div className={`font-semibold ${(quickStats?.revenueGrowth ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(quickStats?.revenueGrowth)}
            </div>
          </div>
        </div>
      )}
    </Link>
  );
}; 