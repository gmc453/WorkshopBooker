import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Building, 
  DollarSign, 
  Users, 
  Star, 
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  BarChart,
  Download,
  Settings
} from 'lucide-react';
import { useGlobalAnalytics } from '../hooks/useGlobalAnalytics';
import ErrorBoundary from '../components/ErrorBoundary';

// Constants
const TIME_RANGES = [
  { value: '7', label: '7d' },
  { value: '30', label: '30d' },
  { value: '90', label: '90d' }
] as const;

const PERFORMANCE_COLORS = {
  1: 'bg-yellow-500',   // Gold
  2: 'bg-gray-400',     // Silver  
  3: 'bg-orange-500',   // Bronze
  default: 'bg-gray-300'
} as const;

// Utility functions
const formatCurrency = (amount: number | undefined | null): string => {
  const value = amount ?? 0;
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(value);
};

const formatPercentage = (value: number | undefined | null): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.0%';
  }
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

const getDateRange = (days: string): { startDate: string; endDate: string } => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  };
};

const getRankColor = (index: number): string => {
  return PERFORMANCE_COLORS[index + 1 as keyof typeof PERFORMANCE_COLORS] || PERFORMANCE_COLORS.default;
};

// Enhanced KPI Card Component
interface KPICardProps {
  title: string;
  value: string | number;
  growth?: number | null;
  icon: React.ComponentType<any>;
  description?: string;
}

const KPICard: React.FC<KPICardProps> = React.memo(({ title, value, growth, icon: Icon, description }) => {
  const hasGrowth = growth !== null && growth !== undefined && !isNaN(growth);
  const isPositiveGrowth = hasGrowth && growth >= 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
          {hasGrowth && (
            <div className="flex items-center">
              <TrendingUp 
                className={`w-4 h-4 mr-1 ${isPositiveGrowth ? 'text-green-500' : 'text-red-500'}`}
                aria-hidden="true"
              />
              <span 
                className={`text-sm font-medium ${isPositiveGrowth ? 'text-green-600' : 'text-red-600'}`}
                aria-label={`Wzrost: ${formatPercentage(growth)}`}
              >
                {formatPercentage(growth)}
              </span>
            </div>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <Icon className="w-8 h-8 text-gray-400" aria-hidden="true" />
      </div>
    </div>
  );
});

// Workshop Performance Row Component
interface WorkshopRowProps {
  workshop: {
    workshopId: string;
    workshopName: string;
    revenue: number;
    bookings: number;
    averageRating: number;
    revenuePerBooking: number;
  };
  index: number;
}

const WorkshopRow: React.FC<WorkshopRowProps> = React.memo(({ workshop, index }) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className="flex-shrink-0 h-8 w-8">
          <div 
            className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${getRankColor(index)}`}
            aria-label={`Pozycja ${index + 1}`}
          >
            {index + 1}
          </div>
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900">{workshop.workshopName}</div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
      {formatCurrency(workshop.revenue)}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      {workshop.bookings}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      {formatCurrency(workshop.revenuePerBooking)}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <Star className="w-4 h-4 text-yellow-400 mr-1" aria-hidden="true" />
        <span className="text-sm text-gray-900">{workshop.averageRating.toFixed(1)}</span>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm">
      <Link 
        to={`/analytics/${workshop.workshopId}`}
        className="text-purple-600 hover:text-purple-900 flex items-center transition-colors group"
        aria-label={`Zobacz szczegóły analityki dla ${workshop.workshopName}`}
      >
        Szczegóły 
        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </Link>
    </td>
  </tr>
));

// Comparison Card Component
interface ComparisonCardProps {
  workshop: {
    workshopId: string;
    workshopName: string;
    currentMonthRevenue: number;
    growthPercentage: number;
  };
}

const ComparisonCard: React.FC<ComparisonCardProps> = React.memo(({ workshop }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="flex-1 min-w-0">
      <p className="font-medium text-sm text-gray-900 truncate">{workshop.workshopName}</p>
      <p className="text-xs text-gray-500">{formatCurrency(workshop.currentMonthRevenue)}</p>
    </div>
    <div className={`text-sm font-medium ml-3 ${
      workshop.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'
    }`}>
      {formatPercentage(workshop.growthPercentage)}
    </div>
  </div>
));

// AI Insights Component
interface AIInsightsProps {
  analytics: NonNullable<ReturnType<typeof useGlobalAnalytics>['data']>;
}

const AIInsights: React.FC<AIInsightsProps> = React.memo(({ analytics }) => {
  const topWorkshop = analytics.topWorkshops?.[0];
  
  const insights = useMemo(() => [
    {
      type: 'success',
      icon: '💡',
      title: 'Najlepsza wydajność',
      message: topWorkshop 
        ? `Warsztat "${topWorkshop.workshopName}" ma najwyższy wzrost przychodów (${formatPercentage(analytics.revenueGrowth)}) w tym miesiącu.`
        : 'Brak danych o najlepszym warsztacie.',
      color: 'bg-green-50 border-green-200 text-green-800'
    },
    {
      type: 'warning',
      icon: '⚠️',
      title: 'Wymaga uwagi',
      message: 'Sprawdź warsztaty z najniższymi przychodami i rozważ optymalizację slotów czasowych.',
      color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
    },
    {
      type: 'info',
      icon: '📈',
      title: 'Rekomendacja',
      message: `Średnia ocena ${analytics.averageRating.toFixed(1)} wskazuje na dobrą jakość usług. Rozważ program lojalnościowy.`,
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    }
  ], [analytics, topWorkshop]);

  return (
    <div className="space-y-3">
      {insights.map((insight, index) => (
        <div key={index} className={`border rounded-lg p-3 ${insight.color}`}>
          <p className="text-sm">
            <span className="mr-2" aria-hidden="true">{insight.icon}</span>
            <strong>{insight.title}:</strong> {insight.message}
          </p>
        </div>
      ))}
    </div>
  );
});

// Main Component
const GlobalAnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30');
  
  // Calculate date range
  const dateRange = useMemo(() => getDateRange(timeRange), [timeRange]);
  
  // Use the existing hook instead of custom fetch logic
  const { 
    data: analytics, 
    isLoading, 
    error,
    refetch 
  } = useGlobalAnalytics(dateRange.startDate, dateRange.endDate);

  // Memoized handlers
  const handleTimeRangeChange = useCallback((newRange: string) => {
    setTimeRange(newRange);
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Ładowanie globalnej analityki...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Błąd ładowania danych</h3>
            <p className="text-red-700 mb-4">
              {error instanceof Error ? error.message : 'Nie udało się załadować danych analitycznych'}
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Spróbuj ponownie
              </button>
              <Link 
                to="/" 
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Wróć do dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={<div className="p-4 bg-red-50 border border-red-200 rounded-lg">Wystąpił błąd podczas renderowania analityki</div>}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <Link 
                    to="/" 
                    className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Wróć do dashboard"
                  >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                  </Link>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Analityka Globalna</h1>
                    <p className="text-gray-600">Przegląd wszystkich warsztatów</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* Time range selector */}
                <div className="flex items-center space-x-2" role="tablist" aria-label="Wybór zakresu czasu">
                  {TIME_RANGES.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => handleTimeRangeChange(range.value)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        timeRange === range.value 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      role="tab"
                      aria-selected={timeRange === range.value}
                      aria-label={`Pokaż dane z ostatnich ${range.label}`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRefresh}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Odśwież dane"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                  
                  {analytics.topWorkshops?.length > 0 && (
                    <Link 
                      to={`/analytics/${analytics.topWorkshops[0].workshopId}`}
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Szczegóły najlepszego
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Global KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="Łączne przychody"
              value={formatCurrency(analytics.totalRevenue)}
              growth={analytics.revenueGrowth}
              icon={DollarSign}
              description="Wszystkie warsztaty"
            />
            
            <KPICard
              title="Wszystkie warsztaty"
              value={analytics.totalWorkshops}
              icon={Building}
              description="aktywnych"
            />
            
            <KPICard
              title="Łączne rezerwacje"
              value={analytics.totalBookings}
              growth={analytics.bookingsGrowth}
              icon={Users}
              description="w wybranym okresie"
            />
            
            <KPICard
              title="Średnia ocena"
              value={analytics.averageRating.toFixed(1)}
              icon={Star}
              description="wszystkich warsztatów"
            />
          </div>

          {/* Workshop Performance Table */}
          {analytics.topWorkshops?.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Top warsztaty</h3>
                <p className="text-sm text-gray-600">Ranking warsztatów według wydajności</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Warsztat
                      </th>
                      <th 
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Przychody
                      </th>
                      <th 
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Rezerwacje
                      </th>
                      <th 
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Średnia/rezerwacja
                      </th>
                      <th 
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Ocena
                      </th>
                      <th 
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Akcje
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.topWorkshops.map((workshop, index) => (
                      <WorkshopRow 
                        key={workshop.workshopId} 
                        workshop={workshop} 
                        index={index} 
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bottom Grid: Comparison & AI Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Workshop Comparison */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Porównanie wydajności</h3>
                <BarChart className="w-5 h-5 text-gray-400" />
              </div>
              
              {analytics.workshopComparison?.length > 0 ? (
                <div className="space-y-3">
                  {analytics.workshopComparison.slice(0, 5).map((workshop) => (
                    <ComparisonCard key={workshop.workshopId} workshop={workshop} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Brak danych do porównania</p>
                </div>
              )}
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
                <Settings className="w-5 h-5 text-gray-400" />
              </div>
              <AIInsights analytics={analytics} />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default GlobalAnalyticsPage;