import React, { useState, useMemo, useCallback } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Star, 
  ArrowRight,
  BarChart3,
  PieChart,
  Eye,
  Plus,
  Calendar,
  Clock,
  Zap,
  Target,
  AlertTriangle,
  Search,
  Filter,
  ChevronDown,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGlobalAnalytics } from '../hooks/useGlobalAnalytics';
import { useWorkshopQuickStats } from '../hooks/useWorkshopQuickStats';
import { useSmartQuery } from '../hooks/useSmartQuery';
import { SmartLoadingState } from '../components/SmartLoadingState';
import ErrorBoundary from '../components/ErrorBoundary';
import apiClient from '../api/axiosConfig';

// Constants
const SEARCH_DEBOUNCE_MS = 100;
const CACHE_STALE_TIME_MS = 2 * 60 * 1000;

const COLOR_CLASSES = {
  green: {
    bg: 'from-green-50 to-green-100',
    border: 'border-green-200',
    text: 'text-green-800',
    textValue: 'text-green-900',
    textSub: 'text-green-600',
    iconColor: 'text-green-600'
  },
  blue: {
    bg: 'from-blue-50 to-blue-100',
    border: 'border-blue-200',
    text: 'text-blue-800',
    textValue: 'text-blue-900',
    textSub: 'text-blue-600',
    iconColor: 'text-blue-600'
  },
  yellow: {
    bg: 'from-yellow-50 to-yellow-100',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    textValue: 'text-yellow-900',
    textSub: 'text-yellow-600',
    iconColor: 'text-yellow-600'
  },
  purple: {
    bg: 'from-purple-50 to-purple-100',
    border: 'border-purple-200',
    text: 'text-purple-800',
    textValue: 'text-purple-900',
    textSub: 'text-purple-600',
    iconColor: 'text-purple-600'
  }
} as const;

// Enhanced interfaces
interface Workshop {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phoneNumber?: string;
  ownerId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WorkshopAnalyticsCardProps {
  workshop: Workshop;
}

interface StatusInfo {
  color: string;
  text: string;
  icon: React.ReactElement;
  ariaLabel: string;
}

// Utility functions moved outside component
const fetchMyWorkshops = () => apiClient.get('/api/workshops/my').then(res => res.data);

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(amount);
};

const formatPercentage = (value: number): string => {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
};

const WorkshopAnalyticsCard: React.FC<WorkshopAnalyticsCardProps> = React.memo(({ workshop }) => {
  const { data: stats, isLoading, error } = useWorkshopQuickStats(workshop.id);

  const getStatusInfo = useCallback((revenueGrowth: number): StatusInfo => {
    if (revenueGrowth >= 10) {
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        text: 'Doskonały',
        icon: <Target className="w-4 h-4" />,
        ariaLabel: 'Status: Doskonały wzrost'
      };
    }
    if (revenueGrowth >= 0) {
      return {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        text: 'Dobry',
        icon: <TrendingUp className="w-4 h-4" />,
        ariaLabel: 'Status: Dobry wzrost'
      };
    }
    if (revenueGrowth >= -5) {
      return {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        text: 'Uwaga',
        icon: <AlertTriangle className="w-4 h-4" />,
        ariaLabel: 'Status: Wymaga uwagi'
      };
    }
    return {
      color: 'bg-red-100 text-red-800 border-red-200',
      text: 'Wymaga uwagi',
      icon: <AlertTriangle className="w-4 h-4" />,
      ariaLabel: 'Status: Wymaga natychmiastowej uwagi'
    };
  }, []);

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-xl p-5 hover:shadow-lg transition-all">
        <div className="text-center py-4">
          <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">Błąd ładowania danych</p>
        </div>
      </div>
    );
  }

  const statusInfo = stats ? getStatusInfo(stats.revenueGrowth) : null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-purple-300 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            {workshop.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="ml-3">
            <h4 className="font-semibold text-gray-900 text-sm">{workshop.name}</h4>
            {statusInfo && (
              <div 
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${statusInfo.color}`}
                aria-label={statusInfo.ariaLabel}
              >
                {statusInfo.icon}
                <span className="ml-1">{statusInfo.text}</span>
              </div>
            )}
          </div>
        </div>
        <Link 
          to={`/analytics/${workshop.id}`} 
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 transition-all"
          aria-label={`Zobacz szczegóły analityki dla ${workshop.name}`}
        >
          <Eye className="w-4 h-4 text-gray-500" />
        </Link>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 mb-4" role="status" aria-label="Ładowanie statystyk">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-1"></div>
              <div className="h-4 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="w-4 h-4 text-green-600 mr-1" aria-hidden="true" />
              <span className="font-bold text-gray-900 text-sm">
                {formatCurrency(stats.monthlyRevenue)}
              </span>
            </div>
            <p className="text-xs text-gray-600">Przychody</p>
            <div className={`text-xs mt-1 ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(stats.revenueGrowth)}
            </div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="w-4 h-4 text-blue-600 mr-1" aria-hidden="true" />
              <span className="font-bold text-gray-900 text-sm">
                {stats.monthlyBookings}
              </span>
            </div>
            <p className="text-xs text-gray-600">Rezerwacje</p>
            <p className="text-xs text-gray-500 mt-1">Ten miesiąc</p>
          </div>
          
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Star className="w-4 h-4 text-yellow-600 mr-1" aria-hidden="true" />
              <span className="font-bold text-gray-900 text-sm">
                {stats.averageRating.toFixed(1)}/5
              </span>
            </div>
            <p className="text-xs text-gray-600">Ocena</p>
            <p className="text-xs text-gray-500 mt-1">Średnia</p>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4 text-purple-600 mr-1" aria-hidden="true" />
              <span className="font-bold text-gray-900 text-sm">
                {stats.monthlyBookings > 0 ? (stats.monthlyRevenue / stats.monthlyBookings).toFixed(0) : '0'}
              </span>
            </div>
            <p className="text-xs text-gray-600">PLN/rezerwacja</p>
            <p className="text-xs text-gray-500 mt-1">Średnia</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">Brak danych</p>
        </div>
      )}

      {/* Action Button */}
      <Link 
        to={`/analytics/${workshop.id}`}
        className="w-full flex items-center justify-center px-3 py-2 bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-purple-700 rounded-lg transition-all text-sm font-medium group-hover:bg-purple-50 group-hover:text-purple-700"
        aria-label={`Zobacz szczegółową analitykę dla warsztatu ${workshop.name}`}
      >
        Zobacz szczegóły
        <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
});

const GlobalStatsCard: React.FC<{
  icon: React.ComponentType<any>;
  label: string;
  value: string | number;
  subtext?: string;
  color?: keyof typeof COLOR_CLASSES;
}> = React.memo(({ icon: Icon, label, value, subtext, color = 'blue' }) => {
  const colors = COLOR_CLASSES[color];

  return (
    <div className={`bg-gradient-to-br ${colors.bg} rounded-xl p-4 border ${colors.border}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${colors.text}`}>{label}</p>
          <p className={`text-xl font-bold ${colors.textValue}`}>{value}</p>
          {subtext && <p className={`text-xs ${colors.textSub} mt-1`}>{subtext}</p>}
        </div>
        <Icon className={`w-8 h-8 ${colors.iconColor}`} aria-hidden="true" />
      </div>
    </div>
  );
});

const AnalyticsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Enhanced query with proper error handling
  const { 
    data: workshops, 
    isLoading: isLoadingWorkshops,
    error: workshopsError 
  } = useSmartQuery({
    queryFn: fetchMyWorkshops,
    deduplication: true,
    debounceMs: SEARCH_DEBOUNCE_MS,
  });

  // Global analytics with error handling
  const { 
    data: globalStats, 
    isLoading: isLoadingGlobalStats,
    error: globalStatsError 
  } = useGlobalAnalytics();

  // Enhanced global stats calculation with error handling
  const calculatedGlobalStats = useMemo(() => {
    if (!globalStats) return null;

    try {
      const totalRevenue = globalStats.totalRevenue || 0;
      const totalBookings = globalStats.totalBookings || 0;
      const averageRating = globalStats.averageRating || 0;
      const totalWorkshops = globalStats.totalWorkshops || 0;
      
      const topPerformer = globalStats.topWorkshops?.[0] || null;
      const averageGrowth = globalStats.topWorkshops?.length 
        ? globalStats.topWorkshops.reduce((sum, w) => sum + (w.revenuePerBooking || 0), 0) / globalStats.topWorkshops.length
        : 0;

      return {
        totalRevenue,
        totalBookings,
        averageRating,
        totalWorkshops,
        topPerformer,
        averageGrowth
      };
    } catch (error) {
      console.error('Error calculating global stats:', error);
      return null;
    }
  }, [globalStats]);

  // Optimized filtering
  const filteredWorkshops = useMemo(() => {
    if (!workshops) return [];
    if (!searchQuery.trim()) return workshops;
    
    const query = searchQuery.toLowerCase().trim();
    return workshops.filter((workshop: { name: string; description: string; }) =>
      workshop.name.toLowerCase().includes(query) ||
      workshop.description?.toLowerCase().includes(query)
    );
  }, [workshops, searchQuery]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setShowFilters(false);
  }, []);

  const hasActiveFilters = searchQuery.trim() !== '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📊 Analityka Biznesowa</h1>
            <p className="text-gray-600 mt-1">Szczegółowe raporty i kluczowe wskaźniki wydajności</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-white/80 backdrop-blur-sm border border-white/50 text-purple-700 px-4 py-2 rounded-lg hover:bg-white transition-all shadow-sm">
              📈 Raporty
            </button>
            <Link 
              to="/analytics/global"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
            >
              🌍 Globalna analityka →
            </Link>
          </div>
        </div>
      </div>

      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-600" aria-hidden="true" />
                <span className="font-medium text-gray-900">Filtry</span>
                {hasActiveFilters && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Aktywne
                  </span>
                )}
              </div>
              
              {/* Quick search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Szukaj warsztatów..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  aria-label="Szukaj warsztatów"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Wyczyść filtry"
                >
                  <X className="w-4 h-4 mr-1" aria-hidden="true" />
                  Wyczyść
                </button>
              )}

              {/* Advanced filters toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                aria-expanded={showFilters}
                aria-controls="advanced-filters"
              >
                Więcej filtrów
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div id="advanced-filters" className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="date-range" className="block text-sm font-medium text-gray-700 mb-2">Zakres dat</label>
                  <input
                    id="date-range"
                    type="date"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-2">Sortuj według</label>
                  <select 
                    id="sort-by"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option>Najnowsze</option>
                    <option>Najstarsze</option>
                    <option>Przychody (rosnąco)</option>
                    <option>Przychody (malejąco)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="performance-filter" className="block text-sm font-medium text-gray-700 mb-2">Wydajność</label>
                  <select 
                    id="performance-filter"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option>Wszystkie warsztaty</option>
                    <option>Doskonałe</option>
                    <option>Dobre</option>
                    <option>Wymagające uwagi</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Global Stats */}
        <ErrorBoundary fallback={<div className="p-4 bg-red-50 border border-red-200 mb-8 rounded-lg">Wystąpił błąd podczas ładowania statystyk globalnych</div>}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {isLoadingGlobalStats ? (
              // Skeleton
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl p-4 border bg-gray-100 animate-pulse h-24" role="status" aria-label="Ładowanie statystyk globalnych" />
              ))
            ) : globalStatsError ? (
              <div className="col-span-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">Błąd ładowania statystyk: {globalStatsError.message}</p>
              </div>
            ) : calculatedGlobalStats ? (
              <>
                <GlobalStatsCard
                  icon={DollarSign}
                  label="Łączne przychody"
                  value={formatCurrency(calculatedGlobalStats.totalRevenue)}
                  subtext="Wszystkie warsztaty"
                  color="green"
                />
                <GlobalStatsCard
                  icon={Calendar}
                  label="Wszystkie rezerwacje"
                  value={calculatedGlobalStats.totalBookings}
                  subtext="Ten miesiąc"
                  color="blue"
                />
                <GlobalStatsCard
                  icon={Star}
                  label="Średnia ocena"
                  value={`${calculatedGlobalStats.averageRating.toFixed(1)}/5`}
                  subtext="Ogółem"
                  color="yellow"
                />
                <GlobalStatsCard
                  icon={Users}
                  label="Aktywne warsztaty"
                  value={calculatedGlobalStats.totalWorkshops}
                  subtext={calculatedGlobalStats.topPerformer ? `Top: ${calculatedGlobalStats.topPerformer.workshopName}` : "Brak danych"}
                  color="purple"
                />
              </>
            ) : (
              <div className="col-span-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">Brak dostępnych statystyk globalnych</p>
              </div>
            )}
          </div>
        </ErrorBoundary>

        {/* Workshops Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Warsztaty - podgląd analityki</h3>
            <div className="flex items-center space-x-2">
              <button className="flex items-center px-3 py-2 text-sm bg-white/80 backdrop-blur-sm border border-white/50 text-gray-700 rounded-lg hover:bg-white transition-all">
                <Plus className="w-4 h-4 mr-1" />
                Dodaj warsztat
              </button>
              <button className="flex items-center px-3 py-2 text-sm bg-white/80 backdrop-blur-sm border border-white/50 text-gray-700 rounded-lg hover:bg-white transition-all">
                <PieChart className="w-4 h-4 mr-1" />
                Porównaj
              </button>
            </div>
          </div>
          
          <ErrorBoundary fallback={<div className="p-4 bg-red-50 border border-red-200 rounded-lg">Wystąpił błąd podczas ładowania warsztatów</div>}>
            <SmartLoadingState
              isLoading={isLoadingWorkshops}
              isRateLimited={false}
              rateLimitInfo={null}
              error={workshopsError}
              loadingText="Ładowanie warsztatów..."
              errorText="Błąd ładowania warsztatów"
            >
              {filteredWorkshops.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredWorkshops.map((workshop: Workshop) => (
                    <WorkshopAnalyticsCard key={workshop.id} workshop={workshop} />
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nie znaleziono warsztatów</h3>
                  <p className="text-gray-600">Spróbuj zmienić kryteria wyszukiwania</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Brak warsztatów</h3>
                  <p className="text-gray-600">Dodaj warsztat, aby zobaczyć analitykę</p>
                </div>
              )}
            </SmartLoadingState>
          </ErrorBoundary>
        </div>

        {/* Quick Insights */}
        <ErrorBoundary fallback={<div className="p-4 bg-red-50 border border-red-200 rounded-lg">Wystąpił błąd podczas ładowania spostrzeżeń</div>}>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 p-6">
            <div className="flex items-center mb-4">
              <Zap className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Szybkie spostrzeżenia</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <Target className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-900">Najlepszy warsztat</p>
                  <p className="text-xs text-green-700">
                    {calculatedGlobalStats?.topPerformer?.workshopName || 'Brak danych'}
                    {calculatedGlobalStats?.topPerformer && (
                      <span className="ml-1">
                        (+{formatPercentage(calculatedGlobalStats.topPerformer.revenuePerBooking || 0)})
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <TrendingUp className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Średni wzrost</p>
                  <p className="text-xs text-blue-700">
                    {calculatedGlobalStats ? formatPercentage(calculatedGlobalStats.averageGrowth) : '0%'} przychody
                  </p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                <Clock className="w-5 h-5 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Ostatnia aktualizacja</p>
                  <p className="text-xs text-purple-700">Przed 2 minutami</p>
                </div>
              </div>
            </div>
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default AnalyticsPage;