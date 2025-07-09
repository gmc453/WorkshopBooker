import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import BookingList from '../components/BookingList'
import WorkshopAnalyticsCard from '../components/WorkshopAnalyticsCard'
import '../App.css'
import type { FC } from 'react'
import { useSmartQuery } from '../hooks/useSmartQuery'
import { SmartLoadingState, RateLimitStatus } from '../components/SmartLoadingState'
import ErrorBoundary from '../components/ErrorBoundary'
import { useOptimisticMutation } from '../hooks/useOptimisticMutation'
import { 
  Bell,
  Calendar,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Star,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  BarChart3,
  Activity,
  Settings,
  Wifi,
  WifiOff,
  X,
  ChevronDown,
  Download,
  AlertTriangle
} from 'lucide-react'
import { Link } from 'react-router-dom'
import apiClient from '../api/axiosConfig'
import { useTodayStats } from '../hooks/useGlobalAnalytics'

// Typy (bez zmian)
interface Workshop {
  id: string;
  name: string;
}

interface BookingStatus {
  value: string;
  label: string;
  icon: React.ReactElement;
}

interface StatCardProps {
  icon: React.ComponentType<any>;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
  color: 'blue' | 'green' | 'yellow' | 'purple';
  onClick?: () => void;
}

// Usunięte - nieużywane

// Statusy rezerwacji
const BOOKING_STATUSES: BookingStatus[] = [
  { value: 'all', label: 'Wszystkie', icon: <Clock className="w-4 h-4" /> },
  { value: '0', label: 'Oczekujące', icon: <AlertCircle className="w-4 h-4 text-yellow-500" /> },
  { value: '1', label: 'Potwierdzone', icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
  { value: '2', label: 'Zakończone', icon: <CheckCircle className="w-4 h-4 text-blue-500" /> },
  { value: '3', label: 'Anulowane', icon: <XCircle className="w-4 h-4 text-red-500" /> }
]

// Statyczne klasy kolorów
const colorClasses = {
  blue: {
    gradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
    border: 'border-blue-200',
    bg: 'bg-blue-500',
    text: 'text-blue-900',
    textSecondary: 'text-blue-700',
    textTertiary: 'text-blue-600',
    hover: 'hover:shadow-lg'
  },
  green: {
    gradient: 'bg-gradient-to-br from-green-50 to-green-100',
    border: 'border-green-200',
    bg: 'bg-green-500',
    text: 'text-green-900',
    textSecondary: 'text-green-700',
    textTertiary: 'text-green-600',
    hover: 'hover:shadow-lg'
  },
  yellow: {
    gradient: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
    border: 'border-yellow-200',
    bg: 'bg-yellow-500',
    text: 'text-yellow-900',
    textSecondary: 'text-yellow-700',
    textTertiary: 'text-yellow-600',
    hover: 'hover:shadow-lg'
  },
  purple: {
    gradient: 'bg-gradient-to-br from-purple-50 to-purple-100',
    border: 'border-purple-200',
    bg: 'bg-purple-500',
    text: 'text-purple-900',
    textSecondary: 'text-purple-700',
    textTertiary: 'text-purple-600',
    hover: 'hover:shadow-lg'
  }
}

// Funkcja obsługi klawiatury dla przycisków
const handleKeyDown = (event: React.KeyboardEvent, callback: () => void) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    callback();
  }
};

// Komponent wyświetlający błędy z możliwością ponowienia
interface ErrorWithRetryProps {
  message: string;
  onRetry: () => void;
}

const ErrorWithRetry: FC<ErrorWithRetryProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col items-center justify-center">
      <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
      <p className="text-red-700 mb-2">{message}</p>
      <button 
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        aria-label="Spróbuj ponownie"
      >
        <RefreshCw className="w-4 h-4 mr-1 inline" /> Spróbuj ponownie
      </button>
    </div>
  );
};

// Komponent wyświetlający pusty stan
interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
}

const EmptyState: FC<EmptyStateProps> = ({ message, icon }) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center">
      {icon || <AlertCircle className="w-10 h-10 text-gray-400 mb-3" />}
      <p className="text-gray-600 text-center">{message}</p>
    </div>
  );
};

const DashboardPage: FC = () => {
  // State
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('')
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showFilters, setShowFilters] = useState(false)
  
  // Refs dla debounce
  const searchDebounceTimerRef = useRef<number | null>(null);

  // API calls
  const fetchWorkshops = useCallback(() => {
    return apiClient.get('/api/workshops/my').then(res => res.data)
  }, [])
  
  const { 
    data: workshops, 
    isLoading: isLoadingWorkshops,
    isRateLimited: isWorkshopsRateLimited,
    rateLimitInfo: workshopsRateLimitInfo,
    error: workshopsError,
    refetch: refetchWorkshops
  } = useSmartQuery({
    queryFn: fetchWorkshops,
    deduplication: true,
    debounceMs: 300
  })

  // Funkcje do zarządzania statusem rezerwacji
  const { mutate: updateBookingStatus } = useOptimisticMutation({
    mutationFn: (data: { bookingId: string; statusId: number }) => {
      return apiClient.patch(`/api/bookings/${data.bookingId}/status`, { statusId: data.statusId });
    },
    queryKey: 'updateBookingStatus'
  });

  // Funkcje pomocnicze do obsługi konkretnych akcji
  const handleConfirmBooking = async (bookingId: string) => {
    if (window.confirm('Czy na pewno chcesz potwierdzić tę rezerwację?')) {
      try {
        await updateBookingStatus({ bookingId, statusId: 1 }); // 1 = Potwierdzona
        refetchWorkshops();
        refetchTodayStats();
        alert('Status rezerwacji został zaktualizowany');
      } catch (error: any) {
        alert(`Błąd: ${error.message || 'Nie udało się zaktualizować statusu'}`);
      }
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    if (window.confirm('Czy na pewno chcesz oznaczyć rezerwację jako zakończoną?')) {
      try {
        await updateBookingStatus({ bookingId, statusId: 2 }); // 2 = Zakończona
        refetchWorkshops();
        refetchTodayStats();
        alert('Status rezerwacji został zaktualizowany');
      } catch (error: any) {
        alert(`Błąd: ${error.message || 'Nie udało się zaktualizować statusu'}`);
      }
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Czy na pewno chcesz anulować tę rezerwację?')) {
      try {
        await updateBookingStatus({ bookingId, statusId: 3 }); // 3 = Anulowana
        refetchWorkshops();
        refetchTodayStats();
        alert('Status rezerwacji został zaktualizowany');
      } catch (error: any) {
        alert(`Błąd: ${error.message || 'Nie udało się zaktualizować statusu'}`);
      }
    }
  };

  // Nowe: statystyki dzisiejsze
  const {
    data: todayStats,
    isLoading: isLoadingTodayStats,
    error: todayStatsError,
    refetch: refetchTodayStats
  } = useTodayStats()

  // Nowe: globalne statystyki (może być potrzebne w przyszłości)
  // const { data: globalStats } = useGlobalAnalytics()

  // Effects (bez zmian)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 5000) // Zmniejszamy częstotliwość odświeżania czasu
    return () => clearInterval(timer)
  }, [])
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (isOnline) {
        // Używamy try-catch aby uniknąć błędów które mogą powodować miganie
        try {
          refetchWorkshops();
          refetchTodayStats();
          setLastUpdated(new Date());
        } catch (error) {
          console.warn('Błąd podczas automatycznego odświeżania:', error);
        }
      }
    }, 60000); // Zwiększamy interwał do 60 sekund aby zmniejszyć częstotliwość migania

    return () => clearInterval(interval);
  }, [refetchWorkshops, refetchTodayStats, isOnline]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handlers
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchWorkshops();
      await refetchTodayStats();
      setLastUpdated(new Date());
    } finally {
      setIsRefreshing(false);
    }
  };

  const clearFilters = useCallback(() => {
    setSelectedWorkshopId('all');
    setStatusFilter('all');
    setSearchQuery('');
    setDebouncedSearchQuery('');
  }, []);

  // Debounce dla wyszukiwania
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current);
    }
    
    searchDebounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(value);
      searchDebounceTimerRef.current = null;
    }, 300) as unknown as number;
  }, []);

  // Efekt czyszczący timer debounce
  useEffect(() => {
    return () => {
      if (searchDebounceTimerRef.current) {
        clearTimeout(searchDebounceTimerRef.current);
      }
    };
  }, []);

  const hasActiveFilters = useMemo(() => 
    selectedWorkshopId !== 'all' || statusFilter !== 'all' || searchQuery !== '',
  [selectedWorkshopId, statusFilter, searchQuery]);

  // Memoized values
  const workshopOptions = useMemo(() => {
    if (!workshops) return [{ id: 'all', name: 'Wszystkie warsztaty' }]
    return [
      { id: 'all', name: 'Wszystkie warsztaty' },
      ...workshops
    ]
  }, [workshops])

  // Zamiast mockStats - używamy prawdziwych danych
  const stats = useMemo(() => {
    if (!todayStats) return null;
    return {
      todaysBookings: todayStats.todaysBookings,
      weeklyRevenue: todayStats.weeklyRevenue, // Tymczasowo używamy dzisiejszych przychodów
      activeWorkshops: todayStats.activeWorkshops,
      avgRating: todayStats.avgRating,
      pendingBookings: todayStats.pendingBookings,
      completedBookings: todayStats.completedBookings,
      canceledBookings: todayStats.canceledBookings
    }
  }, [todayStats])

  // Utility functions
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount);
  };

  // Components
  const StatCard: FC<StatCardProps> = ({ 
    icon: Icon, 
    title, 
    value, 
    subtitle, 
    trend, 
    color = 'blue', 
    onClick 
  }) => {
    const colors = colorClasses[color];
    
    return (
      <div 
        className={`${colors.gradient} rounded-xl p-6 border ${colors.border} ${colors.hover} transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-3">
          <div className={`p-3 ${colors.bg} rounded-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              trend.direction === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {trend.value}
            </div>
          )}
        </div>
        <div>
          <p className={`text-2xl font-bold ${colors.text}`}>{value}</p>
          <p className={`text-sm ${colors.textSecondary}`}>{title}</p>
          {subtitle && <p className={`text-xs ${colors.textTertiary} mt-1`}>{subtitle}</p>}
        </div>
      </div>
    );
  };

  // Usunięte - nieużywane

  // Nowy komponent - Sticky Filter Bar zoptymalizowany przez memoizację
  const StickyFilterBar = useMemo(() => {
    return () => (
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-600" aria-hidden="true" />
                <span className="font-medium text-gray-900">Filtry</span>
                {hasActiveFilters && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800" role="status">
                    Aktywne
                  </span>
                )}
              </div>
              
              {/* Quick search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Szukaj rezerwacji..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  aria-label="Szukaj rezerwacji"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Workshop selector */}
              <SmartLoadingState
                isLoading={isLoadingWorkshops}
                isRateLimited={isWorkshopsRateLimited}
                rateLimitInfo={workshopsRateLimitInfo}
                error={workshopsError}
                loadingText="Ładowanie..."
                errorText="Błąd"
              >
                <select 
                  value={selectedWorkshopId} 
                  onChange={(e) => setSelectedWorkshopId(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  aria-label="Wybierz warsztat"
                >
                  {workshopOptions.map(workshop => (
                    <option key={workshop.id} value={workshop.id}>
                      {workshop.name}
                    </option>
                  ))}
                </select>
              </SmartLoadingState>

              {/* Status selector */}
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                aria-label="Filtruj według statusu"
              >
                {BOOKING_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  onKeyDown={(e) => handleKeyDown(e, clearFilters)}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Wyczyść filtry"
                  role="button"
                  tabIndex={0}
                >
                  <X className="w-4 h-4 mr-1" aria-hidden="true" />
                  Wyczyść
                </button>
              )}

              {/* Advanced filters toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                onKeyDown={(e) => handleKeyDown(e, () => setShowFilters(!showFilters))}
                className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                aria-expanded={showFilters}
                aria-controls="advanced-filters"
                aria-label={showFilters ? "Ukryj dodatkowe filtry" : "Pokaż dodatkowe filtry"}
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
                    <option>Cena (rosnąco)</option>
                    <option>Cena (malejąco)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="service-filter" className="block text-sm font-medium text-gray-700 mb-2">Usługa</label>
                  <select 
                    id="service-filter"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option>Wszystkie usługi</option>
                    <option>Myjnia Premium</option>
                    <option>Detailing</option>
                    <option>Quick Wash</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }, [
    hasActiveFilters, 
    searchQuery, 
    selectedWorkshopId, 
    statusFilter, 
    workshopOptions, 
    isLoadingWorkshops, 
    isWorkshopsRateLimited, 
    workshopsRateLimitInfo, 
    workshopsError, 
    showFilters,
    handleSearchChange,
    clearFilters
  ]);

  // Funkcja do ponownego ładowania wszystkich danych
  const reloadAllData = useCallback(() => {
    refetchWorkshops();
    refetchTodayStats();
  }, [refetchWorkshops, refetchTodayStats]);

  return (
    <div className="min-h-screen bg-gray-50 transition-all duration-300">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🏭 Panel administracyjny</h1>
            <p className="text-gray-600">
              {currentTime.toLocaleDateString('pl-PL', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} • {currentTime.toLocaleTimeString('pl-PL')}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Connection Status */}
            <div className="flex items-center space-x-2" role="status" aria-live="polite">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" aria-hidden="true" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" aria-hidden="true" />
              )}
              <span className={`text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Last Updated */}
            <div className="text-sm text-gray-500" aria-live="polite">
              Ostatnia aktualizacja: {lastUpdated.toLocaleTimeString('pl-PL')}
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={handleManualRefresh}
              onKeyDown={(e) => handleKeyDown(e, handleManualRefresh)}
              disabled={isRefreshing || !isOnline}
              className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                isRefreshing || !isOnline
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
              aria-label="Odśwież dane"
              aria-disabled={isRefreshing || !isOnline}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>{isRefreshing ? 'Odświeżanie...' : 'Odśwież'}</span>
            </button>

            <div className="flex items-center bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-200" role="status">
              <Activity className="w-4 h-4 mr-2" aria-hidden="true" />
              <span className="text-sm font-medium">Online</span>
            </div>
            
            <button 
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              aria-label={`Powiadomienia: ${stats?.pendingBookings || 0} nowych`}
            >
              <Bell className="w-5 h-5" aria-hidden="true" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center" aria-hidden="true">
                {stats?.pendingBookings}
              </span>
            </button>
            
            <button 
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              aria-label="Otwórz ustawienia"
            >
              <Settings className="w-4 h-4 mr-2" aria-hidden="true" />
              Ustawienia
            </button>
          </div>
        </div>
      </div>

      {/* NOWY: Sticky Filter Bar */}
      <ErrorBoundary fallback={<div className="p-4 bg-red-50 border border-red-200 m-4 rounded-lg">Wystąpił błąd podczas ładowania filtrów</div>}>
        <StickyFilterBar />
      </ErrorBoundary>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Quick Stats */}
        <ErrorBoundary fallback={<div className="p-4 bg-red-50 border border-red-200 mb-8 rounded-lg">Wystąpił błąd podczas ładowania statystyk</div>}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {isLoadingTodayStats ? (
              // Skeleton
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl p-6 border bg-gray-100 animate-pulse h-32" role="status" aria-label="Ładowanie statystyk" />
              ))
            ) : todayStatsError ? (
              <div className="col-span-4">
                <ErrorWithRetry 
                  message="Nie udało się załadować statystyk dzisiejszych. Sprawdź połączenie internetowe i spróbuj ponownie." 
                  onRetry={reloadAllData}
                />
              </div>
            ) : stats ? (
              <>
                <StatCard
                  icon={Calendar}
                  title="Dzisiejsze rezerwacje"
                  value={stats.todaysBookings}
                  subtitle="Aktywne sesje"
                  color="blue"
                  trend={{ direction: 'up', value: '+12%' }}
                />
                <StatCard
                  icon={DollarSign}
                  title="Przychody dzisiejsze"
                  value={formatCurrency(stats.weeklyRevenue)}
                  subtitle="Dzisiaj"
                  color="green"
                  trend={{ direction: 'up', value: '+8.5%' }}
                />
                <StatCard
                  icon={Star}
                  title="Średnia ocena"
                  value={`${stats.avgRating.toFixed(1)}/5`}
                  subtitle="Ostatnie 30 dni"
                  color="yellow"
                />
                <StatCard
                  icon={Users}
                  title="Aktywne warsztaty"
                  value={stats.activeWorkshops}
                  subtitle="Wszystkie online"
                  color="purple"
                />
              </>
            ) : (
              <div className="col-span-4">
                <EmptyState 
                  message="Brak dostępnych statystyk. Spróbuj odświeżyć stronę lub sprawdź połączenie internetowe."
                  icon={<AlertCircle className="w-10 h-10 text-gray-400 mb-3" />}
                />
              </div>
            )}
          </div>
        </ErrorBoundary>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings - USUNIĘTO STARE FILTRY */}
          <div className="lg:col-span-2">
            <ErrorBoundary fallback={<div className="p-4 bg-red-50 border border-red-200 rounded-lg">Wystąpił błąd podczas ładowania rezerwacji</div>}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">📋 Zarządzanie rezerwacjami</h2>
                    <p className="text-gray-600 text-sm">
                      Przeglądaj i zarządzaj rezerwacjami w systemie
                      {hasActiveFilters && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Filtrowane
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      aria-label="Eksportuj dane rezerwacji"
                    >
                      <Download className="w-4 h-4 mr-1" aria-hidden="true" />
                      Eksportuj
                    </button>
                    <button 
                      className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      aria-label="Pokaż raporty"
                    >
                      <BarChart3 className="w-4 h-4 mr-1" aria-hidden="true" />
                      Raporty
                    </button>
                  </div>
                </div>

                {/* Booking Status Summary */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <CheckCircle className="w-6 h-6 text-blue-600 mx-auto mb-1" aria-hidden="true" />
                    <p className="text-lg font-bold text-blue-900">{stats?.completedBookings || 0}</p>
                    <p className="text-xs text-blue-700">Zakończone</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-1" aria-hidden="true" />
                    <p className="text-lg font-bold text-yellow-900">{stats?.pendingBookings || 0}</p>
                    <p className="text-xs text-yellow-700">Oczekujące</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-1" aria-hidden="true" />
                    <p className="text-lg font-bold text-green-900">{stats?.todaysBookings || 0}</p>
                    <p className="text-xs text-green-700">Dziś</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <XCircle className="w-6 h-6 text-red-600 mx-auto mb-1" aria-hidden="true" />
                    <p className="text-lg font-bold text-red-900">{stats?.canceledBookings || 0}</p>
                    <p className="text-xs text-red-700">Anulowane</p>
                  </div>
                </div>

                {/* Rate Limit Status */}
                <div className="mb-4 flex space-x-2">
                  <RateLimitStatus endpoint="/api/workshops/my" method="GET" />
                  <RateLimitStatus endpoint="/api/workshops/{id}/bookings" method="GET" />
                </div>

                {/* Lista rezerwacji */}
                <div className="bg-white rounded-lg transition-all duration-300">
                  <BookingList 
                    workshopId={selectedWorkshopId === 'all' ? null : selectedWorkshopId}
                    statusFilter={statusFilter}
                    searchQuery={debouncedSearchQuery}
                    onConfirm={handleConfirmBooking}
                    onComplete={handleCompleteBooking}
                    onCancel={handleCancelBooking}
                  />
                </div>
              </div>
            </ErrorBoundary>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Szybkie akcje</h3>
              <div className="space-y-3">
                <Link to="/" className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                  <Calendar className="h-5 w-5 text-blue-600 mr-3" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-gray-900">Rezerwacje</p>
                    <p className="text-sm text-gray-600">Zarządzaj rezerwacjami</p>
                  </div>
                </Link>
                <Link to="/slots" className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                  <Clock className="h-5 w-5 text-green-600 mr-3" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-gray-900">Dostępne terminy</p>
                    <p className="text-sm text-gray-600">Zarządzaj slotami czasowymi</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Analytics Preview */}
            <ErrorBoundary fallback={<div className="p-4 bg-red-50 border border-red-200 rounded-lg">Wystąpił błąd podczas ładowania analityki</div>}>
              {workshops && workshops.length > 0 ? (
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-2 mr-3">
                        <BarChart3 className="w-5 h-5 text-white" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Analityka</h3>
                        <p className="text-xs text-gray-600">Szczegółowe raporty</p>
                      </div>
                    </div>
                    <Link to="/analytics/global" className="text-purple-600 hover:text-purple-800" aria-label="Przejdź do globalnej analityki">
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </div>
                  
                  {/* Grid warsztatów z quick stats */}
                  <div className="grid grid-cols-1 gap-3 mb-4">
                    {workshops.slice(0, 3).map((workshop: Workshop) => (
                      <WorkshopAnalyticsCard key={workshop.id} workshop={workshop} />
                    ))}
                  </div>
                  
                  <Link 
                    to="/analytics/global" 
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 text-sm font-medium text-center block"
                    aria-label="Przejdź do globalnej analityki"
                  >
                    🌍 Globalna analityka
                  </Link>
                </div>
              ) : isLoadingWorkshops ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse h-64"></div>
              ) : (
                <EmptyState 
                  message="Brak dostępnych warsztatów. Dodaj warsztat, aby zobaczyć analitykę."
                  icon={<BarChart3 className="w-10 h-10 text-gray-400 mb-3" />}
                />
              )}
            </ErrorBoundary>

            {/* Workshop Status */}
            <ErrorBoundary fallback={<div className="p-4 bg-red-50 border border-red-200 rounded-lg">Wystąpił błąd podczas ładowania statusu warsztatów</div>}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🏭 Status warsztatów</h3>
                <SmartLoadingState
                  isLoading={isLoadingWorkshops}
                  isRateLimited={isWorkshopsRateLimited}
                  rateLimitInfo={workshopsRateLimitInfo}
                  error={workshopsError}
                  loadingText="Ładowanie warsztatów..."
                  errorText="Błąd ładowania warsztatów"
                >
                  {workshops && workshops.length > 0 ? (
                    <div className="space-y-3">
                      {workshops.map((workshop: Workshop) => (
                        <div key={workshop.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-3" aria-hidden="true"></div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{workshop.name}</p>
                              <p className="text-xs text-gray-600">Online</p>
                            </div>
                          </div>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Online
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="Brak warsztatów do wyświetlenia." />
                  )}
                </SmartLoadingState>
              </div>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage