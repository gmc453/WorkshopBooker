"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useMyBookings, Booking } from "../hooks/useMyBookings";
import { useCancelBooking } from "../../hooks/useCancelBooking";
import { format, parseISO, differenceInMinutes, isAfter } from "date-fns";
import { pl } from "date-fns/locale";
import { Calendar, Clock, CreditCard, CheckCircle, AlertCircle, XCircle, Search, Filter, Building } from 'lucide-react';
import { SkeletonList } from "../components/SkeletonList";
import { Breadcrumbs } from "../components/Breadcrumbs";

export default function MyBookingsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { data: bookings, isLoading, error } = useMyBookings();
  
  // Hook do anulowania rezerwacji
  const { 
    mutate: cancelBooking, 
    isPending: isCancelling, 
    error: cancelError 
  } = useCancelBooking();
  
  // Stan dla filtrowania
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Przekieruj na stronę logowania, jeśli użytkownik nie jest zalogowany
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Przetwarzanie rezerwacji
  const { upcomingBookings, pastBookings, filteredBookings } = useMemo(() => {
    if (!bookings) {
      return { upcomingBookings: [], pastBookings: [], filteredBookings: [] };
    }
    
    const now = new Date();
    
    // Podział na nadchodzące i minione rezerwacje
    const upcoming = bookings.filter(booking => 
      (booking.status === 0 || booking.status === 1) && 
      isAfter(parseISO(booking.slotStartTime), now)
    ).sort((a, b) => 
      parseISO(a.slotStartTime).getTime() - parseISO(b.slotStartTime).getTime()
    );
    
    const past = bookings.filter(booking => 
      booking.status === 2 || booking.status === 3 || 
      !isAfter(parseISO(booking.slotStartTime), now)
    ).sort((a, b) => 
      parseISO(b.slotStartTime).getTime() - parseISO(a.slotStartTime).getTime()
    );
    
    // Filtrowanie rezerwacji
    const toFilter = activeTab === 'upcoming' ? upcoming : past;
    const filtered = toFilter.filter(booking => {
      // Filtrowanie po statusie
      if (statusFilter !== 'all' && booking.status.toString() !== statusFilter) {
        return false;
      }
      
      // Filtrowanie po wyszukiwaniu
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesService = booking.serviceName?.toLowerCase().includes(query);
        const matchesWorkshop = booking.workshopName?.toLowerCase().includes(query);
        
        if (!matchesService && !matchesWorkshop) {
          return false;
        }
      }
      
      return true;
    });
    
    return { upcomingBookings: upcoming, pastBookings: past, filteredBookings: filtered };
  }, [bookings, statusFilter, searchQuery, activeTab]);

  if (!isAuthenticated) {
    return null; // Nie renderuj nic, jeśli użytkownik nie jest zalogowany
  }

  // Funkcja pomocnicza do mapowania statusu rezerwacji
  const getStatusText = (status: number): string => {
    switch (status) {
      case 0: return "Oczekująca";
      case 1: return "Potwierdzona";
      case 2: return "Zakończona";
      case 3: return "Anulowana";
      default: return "Nieznany";
    }
  };

  // Funkcja pomocnicza do określania koloru statusu
  const getStatusColor = (status: number): string => {
    switch (status) {
      case 0: return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case 1: return "bg-green-100 text-green-800 border-green-300";
      case 2: return "bg-blue-100 text-blue-800 border-blue-300";
      case 3: return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };
  
  // Funkcja pomocnicza do określania ikony statusu
  const getStatusIcon = (status: number) => {
    switch (status) {
      case 0: return <AlertCircle className="w-4 h-4" />;
      case 1: return <CheckCircle className="w-4 h-4" />;
      case 2: return <CheckCircle className="w-4 h-4" />;
      case 3: return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Funkcja pomocnicza do obliczania czasu trwania w minutach
  const getDuration = (startTime: string, endTime: string): number => {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    return differenceInMinutes(end, start);
  };
  
  // Funkcja formatująca datę w przyjazny sposób
  const formatDateFriendly = (dateStr: string): string => {
    return format(parseISO(dateStr), "EEEE, d MMMM", { locale: pl });
  };

  // Funkcja do anulowania rezerwacji
  const handleCancelBooking = (bookingId: string, serviceName: string) => {
    const isConfirmed = window.confirm(
      `Czy na pewno chcesz anulować rezerwację "${serviceName}"?\n\nTej operacji nie można cofnąć.`
    );
    
    if (isConfirmed) {
      cancelBooking(bookingId, {
        onSuccess: () => {
          // Toast notification lub alert o sukcesie
          alert('Rezerwacja została pomyślnie anulowana!');
        },
        onError: (error: Error) => {
          // Pokazuj konkretny błąd użytkownikowi
          alert(`Błąd: ${error.message}`);
        }
      });
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Breadcrumbs 
        items={[
          { label: "Moje rezerwacje" }
        ]} 
        className="mb-6"
      />
      <h1 className="text-3xl font-bold mb-6">Moje rezerwacje</h1>
      
      {isLoading ? (
        <SkeletonList count={5} />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <XCircle className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="text-red-800 font-semibold">Wystąpił błąd</h3>
              <p className="text-red-600">
                Nie udało się pobrać rezerwacji. Spróbuj ponownie później.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Panel filtrowania i zakładek */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              {/* Zakładki: Nadchodzące / Minione */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'upcoming'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Nadchodzące
                  {upcomingBookings.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                      {upcomingBookings.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'past'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Historia
                  {pastBookings.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-gray-500 text-white text-xs rounded-full">
                      {pastBookings.length}
                    </span>
                  )}
                </button>
              </div>
              
              {/* Licznik */}
              <div className="text-sm text-gray-600">
                <span>Znaleziono {filteredBookings.length} rezerwacji</span>
              </div>
            </div>
            
            {/* Filtry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Filtr statusu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status rezerwacji
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Filter className="w-4 h-4 text-gray-500" />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 p-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="all">Wszystkie statusy</option>
                    <option value="0">Oczekujące</option>
                    <option value="1">Potwierdzone</option>
                    <option value="2">Zakończone</option>
                    <option value="3">Anulowane</option>
                  </select>
                </div>
              </div>
              
              {/* Wyszukiwanie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wyszukiwanie
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-4 h-4 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Szukaj po nazwie usługi lub warsztatu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 p-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lista rezerwacji */}
          {filteredBookings.length > 0 ? (
            <div className="grid gap-4">
              {filteredBookings.map((booking) => {
                const startDate = parseISO(booking.slotStartTime);
                const endDate = parseISO(booking.slotEndTime);
                const duration = getDuration(booking.slotStartTime, booking.slotEndTime);
                
                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-5"
                  >
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="mb-4 md:mb-0">
                        {/* Status */}
                        <div className="flex items-center mb-2">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1">{getStatusText(booking.status)}</span>
                          </span>
                        </div>
                        
                        {/* Usługa i warsztat */}
                        <h3 className="text-lg font-semibold">{booking.serviceName}</h3>
                        {booking.workshopName && (
                          <div className="flex items-center text-gray-600 mt-1">
                            <Building className="w-4 h-4 mr-1" />
                            <span>{booking.workshopName}</span>
                          </div>
                        )}
                        
                        {/* Data i czas */}
                        <div className="mt-3 space-y-1">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{formatDateFriendly(booking.slotStartTime)}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>
                              {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
                            </span>
                          </div>
                          {duration && (
                            <div className="text-sm text-gray-500">
                              Czas trwania: {duration} min
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Cena */}
                      <div className="text-right">
                        <div className="flex items-center justify-end space-x-1 text-lg font-bold text-gray-800">
                          <CreditCard className="w-5 h-5 text-gray-500" />
                          <span>{booking.servicePrice.toFixed(2)} zł</span>
                        </div>
                        
                        {/* Akcje dla nadchodzących rezerwacji */}
                        {activeTab === 'upcoming' && (booking.status === 0 || booking.status === 1) && (
                          <button
                            className={`mt-4 px-4 py-2 border rounded-lg transition-colors text-sm ${
                              isCancelling 
                                ? 'border-gray-300 text-gray-500 cursor-not-allowed bg-gray-50' 
                                : 'border-red-300 text-red-700 hover:bg-red-50'
                            }`}
                            onClick={() => handleCancelBooking(booking.id, booking.serviceName)}
                            disabled={isCancelling}
                          >
                            {isCancelling ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Anulowanie...
                              </span>
                            ) : (
                              'Anuluj rezerwację'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {searchQuery || statusFilter !== 'all'
                  ? 'Nie znaleziono rezerwacji'
                  : activeTab === 'upcoming'
                    ? 'Nie masz nadchodzących rezerwacji'
                    : 'Nie masz historycznych rezerwacji'}
              </h3>
              <p className="text-gray-500">
                {searchQuery || statusFilter !== 'all'
                  ? 'Spróbuj zmienić kryteria wyszukiwania'
                  : activeTab === 'upcoming'
                    ? 'Zarezerwuj termin, aby zobaczyć go na tej liście'
                    : 'Twoja historia rezerwacji będzie widoczna tutaj'}
              </p>
              
              {activeTab === 'upcoming' && !(searchQuery || statusFilter !== 'all') && (
                <button
                  onClick={() => router.push('/')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Przeglądaj warsztaty
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
} 