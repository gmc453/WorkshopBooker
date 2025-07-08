import { useState, useMemo, useCallback, useEffect } from 'react'
import BookingList from '../components/BookingList'
import Header from '../components/Header'
import '../App.css'
import type { FC } from 'react'
import { useSmartQuery } from '../hooks/useSmartQuery'
import { SmartLoadingState, RateLimitStatus } from '../components/SmartLoadingState'
import { Building, Calendar, Filter, Clock, CheckCircle, AlertCircle, XCircle, Search, TrendingUp, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import apiClient from '../api/axiosConfig'

// Statusy rezerwacji
const BOOKING_STATUSES = [
  { value: 'all', label: 'Wszystkie', icon: <Clock className="w-4 h-4" /> },
  { value: '0', label: 'Oczekujące', icon: <AlertCircle className="w-4 h-4 text-yellow-500" /> },
  { value: '1', label: 'Potwierdzone', icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
  { value: '2', label: 'Zakończone', icon: <CheckCircle className="w-4 h-4 text-blue-500" /> },
  { value: '3', label: 'Anulowane', icon: <XCircle className="w-4 h-4 text-red-500" /> }
]

const DashboardPage: FC = () => {
  // Warsztaty i filtry
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  
  // Real-time updates state
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  // Memoizowana funkcja zapytania
  const fetchWorkshops = useCallback(() => {
    return apiClient.get('/api/workshops/my').then(res => res.data)
  }, [])
  
  // Smart query dla warsztatów z obsługą rate limiting
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
  
  // Manual polling dla real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (isOnline) {
        refetchWorkshops();
        setLastUpdated(new Date());
      }
    }, 30000); // Co 30 sekund

    return () => clearInterval(interval);
  }, [refetchWorkshops, isOnline]);

  // Connection status monitoring
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

  // Manual refresh function
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchWorkshops();
      setLastUpdated(new Date());
    } finally {
      setIsRefreshing(false);
    }
  };

  // Memoizacja dostępnych warsztatów ze wszystkimi opcjami
  const workshopOptions = useMemo(() => {
    if (!workshops) return [{ id: 'all', name: 'Wszystkie warsztaty' }]
    return [
      { id: 'all', name: 'Wszystkie warsztaty' },
      ...workshops
    ]
  }, [workshops])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Zarządzanie rezerwacjami</h2>
              <p className="text-gray-600">Przeglądaj i zarządzaj rezerwacjami w systemie</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Last Updated */}
              <div className="text-sm text-gray-500">
                Ostatnia aktualizacja: {lastUpdated.toLocaleTimeString('pl-PL')}
              </div>

              {/* Manual Refresh Button */}
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing || !isOnline}
                className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  isRefreshing || !isOnline
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Odświeżanie...' : 'Odśwież'}</span>
              </button>

              <div className="flex space-x-2">
                <RateLimitStatus endpoint="/api/workshops/my" method="GET" />
                <RateLimitStatus endpoint="/api/workshops/{id}/bookings" method="GET" />
              </div>
            </div>
          </div>
        </div>

        {/* Skróty do najważniejszych funkcji */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/" className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-center">
            <div className="bg-blue-100 rounded-full p-3 mr-4 text-blue-600">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-medium">Rezerwacje</h3>
              <p className="text-sm text-gray-500">Zarządzaj rezerwacjami</p>
            </div>
          </Link>
          <Link to="/slots" className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4 text-green-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-medium">Dostępne terminy</h3>
              <p className="text-sm text-gray-500">Zarządzaj slotami czasowymi</p>
            </div>
          </Link>
          {workshops && workshops.length > 0 && (
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-purple-100 rounded-full p-3 mr-4 text-purple-600">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium">Analityka</h3>
                    <p className="text-sm text-gray-500">Przegląd wyników</p>
                  </div>
                </div>
                <Link 
                  to="/analytics/global" 
                  className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                >
                  Wszystkie →
                </Link>
              </div>
              
              <div className="space-y-2">
                {workshops.slice(0, 3).map((workshop: any) => (
                  <Link
                    key={workshop.id}
                    to={`/analytics/${workshop.id}`}
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-50 border"
                  >
                    <span className="font-medium">{workshop.name}</span>
                    <span className="text-xs text-gray-500">📊 Zobacz</span>
                  </Link>
                ))}
                {workshops.length > 3 && (
                  <p className="text-xs text-gray-500 pt-2">
                    +{workshops.length - 3} więcej warsztatów
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Filtrowanie i wyszukiwanie rezerwacji */}
        <div className="mb-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filtrowanie rezerwacji</h3>
            <div className="flex items-center text-sm text-gray-500">
              <Filter className="h-4 w-4 mr-1" />
              <span>Filtruj wyniki</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Wybór warsztatu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warsztat</label>
              <SmartLoadingState
                isLoading={isLoadingWorkshops}
                isRateLimited={isWorkshopsRateLimited}
                rateLimitInfo={workshopsRateLimitInfo}
                error={workshopsError}
                loadingText="Ładowanie warsztatów..."
                errorText="Błąd ładowania warsztatów"
              >
                <select 
                  value={selectedWorkshopId} 
                  onChange={(e) => setSelectedWorkshopId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {workshopOptions.map(workshop => (
                    <option key={workshop.id} value={workshop.id}>
                      {workshop.name}
                    </option>
                  ))}
                </select>
              </SmartLoadingState>
            </div>
            
            {/* Filtr statusu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status rezerwacji</label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {BOOKING_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Wyszukiwanie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wyszukiwanie</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-500" />
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Szukaj po nazwie usługi lub użytkowniku..."
                  className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Lista rezerwacji */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          {selectedWorkshopId === 'all' ? (
            <BookingList 
              workshopId={null} 
              statusFilter={statusFilter}
              searchQuery={searchQuery}
            />
          ) : (
            <BookingList 
              workshopId={selectedWorkshopId} 
              statusFilter={statusFilter}
              searchQuery={searchQuery}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default DashboardPage 