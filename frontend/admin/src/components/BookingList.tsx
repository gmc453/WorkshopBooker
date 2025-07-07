import { useMemo, useState } from 'react'
import type { FC } from 'react'
import { Calendar, Clock, CreditCard, CheckCircle, AlertCircle, XCircle, Loader2, User, Building, X } from 'lucide-react'
import { useWorkshopBookings } from '../hooks/useWorkshopBookings'
import { useConfirmBooking } from '../hooks/useConfirmBooking'
import { useCancelBooking } from '../hooks/useCancelBooking'
import { useMyBookings } from '../hooks/useMyBookings'
import { useMyWorkshops } from '../hooks/useMyWorkshops'

import type { Booking } from '../types/booking'

// Typ powiadomienia
type Notification = {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
  bookingId?: string;
}

type BookingListProps = {
  workshopId: string | null
  statusFilter?: string
  searchQuery?: string
}

const BookingList: FC<BookingListProps> = ({ 
  workshopId, 
  statusFilter = 'all', 
  searchQuery = '' 
}) => {
  // Stan dla powiadomień
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Stan dla śledzenia aktualnie procesowanych rezerwacji
  const [processingBookings, setProcessingBookings] = useState<{[key: string]: boolean}>({});
  
  // Funkcja do dodawania powiadomień
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now();
    const newNotification = { ...notification, id };
    setNotifications(prev => [...prev, newNotification]);
    
    // Automatyczne usuwanie powiadomień po 5 sekundach
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };
  
  // Usuwanie powiadomienia
  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  // Pobieramy dane o wszystkich warsztatach, żeby wyświetlić nazwę warsztatu
  // gdy pokazujemy rezerwacje ze wszystkich warsztatów
  const { data: workshops } = useMyWorkshops()
  
  // Pobieramy rezerwacje w zależności od tego czy wybrano konkretny warsztat
  const { data: workshopBookings, isLoading: isLoadingWorkshopBookings, isError: isWorkshopBookingsError, refetch: refetchWorkshopBookings } = 
    useWorkshopBookings(workshopId)
  const { data: allBookings, isLoading: isLoadingAllBookings, isError: isAllBookingsError, refetch: refetchAllBookings } = 
    useMyBookings()
    
  // Stan ładowania i błędów
  const isLoading = workshopId ? isLoadingWorkshopBookings : isLoadingAllBookings
  const isError = workshopId ? isWorkshopBookingsError : isAllBookingsError
  
  // Określamy, które dane mamy używać
  const bookingsData = workshopId ? workshopBookings : allBookings
  
  // Funkcja odświeżenia listy rezerwacji
  const refreshBookings = () => {
    if (workshopId) {
      refetchWorkshopBookings();
    } else {
      refetchAllBookings();
    }
  };
  
  // Znajdź nazwę wybranego warsztatu
  const selectedWorkshopName = useMemo(() => {
    if (!workshopId || !workshops) return null
    const workshop = workshops.find(w => w.id === workshopId)
    return workshop?.name || null
  }, [workshopId, workshops])
  
  // Filtrowanie rezerwacji
  const filteredBookings = useMemo(() => {
    if (!bookingsData) return []
    
    return bookingsData.filter(booking => {
      // Filtrowanie po statusie
      if (statusFilter !== 'all') {
        if (booking.status.toString() !== statusFilter) {
          return false
        }
      }
      
      // Filtrowanie po frazie wyszukiwania
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesService = booking.serviceName?.toLowerCase().includes(query)
        const matchesUser = booking.userName?.toLowerCase().includes(query)
        
        if (!matchesService && !matchesUser) {
          return false
        }
      }
      
      return true
    })
  }, [bookingsData, statusFilter, searchQuery])

  // Obsługa potwierdzania rezerwacji z informacją zwrotną
  const { mutate: confirmBookingMutation, isPending: isConfirmingGlobal } = useConfirmBooking(workshopId || 'default')
  const confirmBooking = (bookingId: string, serviceName?: string) => {
    // Ustawiamy flagę przetwarzania dla tej rezerwacji
    setProcessingBookings(prev => ({ ...prev, [bookingId]: true }));
    
    confirmBookingMutation(bookingId, {
      onSuccess: () => {
        // Dodaj powiadomienie o sukcesie
        addNotification({
          type: 'success',
          message: `Rezerwacja ${serviceName ? `"${serviceName}"` : ''} została potwierdzona`,
          bookingId
        });
        
        // Usuwamy flagę przetwarzania
        setProcessingBookings(prev => ({ ...prev, [bookingId]: false }));
        
        // Odświeżamy listę rezerwacji po potwierdzeniu
        setTimeout(() => {
          refreshBookings();
        }, 500);
      },
      onError: () => {
        addNotification({
          type: 'error',
          message: 'Nie udało się potwierdzić rezerwacji. Spróbuj ponownie.',
          bookingId
        });
        
        // Usuwamy flagę przetwarzania
        setProcessingBookings(prev => ({ ...prev, [bookingId]: false }));
      }
    });
  };

  // Obsługa anulowania rezerwacji z informacją zwrotną
  const { mutate: cancelBookingMutation, isPending: isCancellingGlobal } = useCancelBooking(workshopId || 'default')
  const cancelBooking = (bookingId: string, serviceName?: string) => {
    // Ustawiamy flagę przetwarzania dla tej rezerwacji
    setProcessingBookings(prev => ({ ...prev, [bookingId]: true }));
    
    cancelBookingMutation(bookingId, {
      onSuccess: () => {
        addNotification({
          type: 'success',
          message: `Rezerwacja ${serviceName ? `"${serviceName}"` : ''} została anulowana`,
          bookingId
        });
        
        // Usuwamy flagę przetwarzania
        setProcessingBookings(prev => ({ ...prev, [bookingId]: false }));
        
        // Odświeżamy listę rezerwacji po anulowaniu
        setTimeout(() => {
          refreshBookings();
        }, 500);
      },
      onError: () => {
        addNotification({
          type: 'error',
          message: 'Nie udało się anulować rezerwacji. Spróbuj ponownie.',
          bookingId
        });
        
        // Usuwamy flagę przetwarzania
        setProcessingBookings(prev => ({ ...prev, [bookingId]: false }));
      }
    });
  };

  const getStatusIcon = (status: string | number) => {
    const statusValue = typeof status === 'number' ? status : parseInt(status);
    
    switch (statusValue) {
      case 0: // Requested
        return <AlertCircle className="w-5 h-5 text-warning" />
      case 1: // Confirmed
        return <CheckCircle className="w-5 h-5 text-success" />
      case 2: // Completed
        return <CheckCircle className="w-5 h-5 text-primary" />
      case 3: // Canceled
        return <XCircle className="w-5 h-5 text-danger" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string | number) => {
    const statusValue = typeof status === 'number' ? status : parseInt(status);
    
    switch (statusValue) {
      case 0: // Requested
        return 'Oczekująca'
      case 1: // Confirmed
        return 'Potwierdzona'
      case 2: // Completed
        return 'Zakończona'
      case 3: // Canceled
        return 'Anulowana'
      default:
        return 'Nieznany'
    }
  }

  const getStatusColor = (status: string | number) => {
    const statusValue = typeof status === 'number' ? status : parseInt(status);
    
    switch (statusValue) {
      case 0: // Requested
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700'
      case 1: // Confirmed
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700'
      case 2: // Completed
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700'
      case 3: // Canceled
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700'
    }
  }

  const formatDateTime = (start: string, end: string) => {
    const date = new Date(start)
    return {
      date: date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: `${new Date(start).toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit'
      })} - ${new Date(end).toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit'
      })}`
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(price)
  }

  // Znajdź warsztat dla rezerwacji
  const getWorkshopName = (booking: Booking) => {
    if (!workshops || workshopId) return null;
    // Zakładamy, że booking może mieć property workshopName lub workshopId
    if (booking.workshopName) return booking.workshopName;
    if (booking.workshopId) {
      const workshop = workshops.find(w => w.id === booking.workshopId);
      return workshop?.name || 'Nieznany warsztat';
    }
    return 'Nieznany warsztat';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-t-primary border-gray-200 dark:border-gray-700 animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Ładowanie rezerwacji...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <XCircle className="w-6 h-6 text-danger" />
          <div>
            <h3 className="text-red-800 dark:text-red-400 font-semibold">Wystąpił błąd</h3>
            <p className="text-red-600 dark:text-red-400">Nie udało się pobrać listy rezerwacji. Spróbuj ponownie.</p>
          </div>
        </div>
      </div>
    )
  }

  if (!filteredBookings || filteredBookings.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
        <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Brak rezerwacji</h3>
        <p className="text-gray-500 dark:text-gray-400">
          {searchQuery || statusFilter !== 'all' 
            ? 'Nie znaleziono rezerwacji spełniających kryteria wyszukiwania.'
            : workshopId 
              ? 'Nie ma jeszcze żadnych rezerwacji w tym warsztacie.' 
              : 'Nie ma jeszcze żadnych rezerwacji.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 relative">
      {/* System powiadomień */}
      <div className="fixed top-5 right-5 z-50 space-y-3" style={{ maxWidth: '350px' }}>
        {notifications.map((notification) => (
          <div 
            key={notification.id}
            className={`flex items-center justify-between p-4 rounded-lg shadow-lg animate-slideIn ${
              notification.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500 dark:bg-green-900/50 dark:text-green-300' :
              notification.type === 'error' ? 'bg-red-100 text-red-800 border-l-4 border-red-500 dark:bg-red-900/50 dark:text-red-300' :
              'bg-blue-100 text-blue-800 border-l-4 border-blue-500 dark:bg-blue-900/50 dark:text-blue-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {notification.type === 'error' && <XCircle className="w-5 h-5" />}
              {notification.type === 'info' && <AlertCircle className="w-5 h-5" />}
              <span>{notification.message}</span>
            </div>
            <button 
              onClick={() => removeNotification(notification.id)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {workshopId ? `Rezerwacje: ${selectedWorkshopName || 'Wybrany warsztat'}` : 'Wszystkie rezerwacje'}
          </h2>
          <div className="flex items-center text-gray-600 dark:text-gray-300 space-x-1">
            <Calendar className="w-4 h-4" />
            <span>Znaleziono {filteredBookings.length} rezerwacji</span>
          </div>
        </div>
        
        <button 
          onClick={refreshBookings}
          className="flex items-center gap-2 py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
            <path d="M21 3v5h-5"></path>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
            <path d="M3 21v-5h5"></path>
          </svg>
          <span>Odśwież</span>
        </button>
      </div>
      
      <div className="grid gap-5">
        {filteredBookings.map((booking: Booking) => {
          const { date, time } = formatDateTime(booking.slotStartTime, booking.slotEndTime)
          const statusValue = typeof booking.status === 'number' ? booking.status : parseInt(booking.status);
          const workshopName = getWorkshopName(booking);
          
          // Sprawdź, czy istnieje powiadomienie dla tej rezerwacji (animacja podświetlenia)
          const hasNotification = notifications.some(n => n.bookingId === booking.id);
          
          // Sprawdź, czy ta rezerwacja jest obecnie przetwarzana
          const isProcessing = processingBookings[booking.id];
          
          return (
            <div
              key={booking.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 p-6 ${
                hasNotification ? 'ring-2 ring-green-400 dark:ring-green-500 animate-pulse' : ''
              } ${
                isProcessing ? 'opacity-70' : ''
              }`}
            >
              {isProcessing && (
                <div className="absolute inset-0 bg-white/40 dark:bg-gray-800/40 flex items-center justify-center rounded-xl z-10">
                  <div className="flex flex-col items-center gap-2 bg-white dark:bg-gray-700 p-4 rounded-lg shadow-lg">
                    <div className="w-10 h-10 border-4 border-t-primary border-gray-200 dark:border-gray-600 rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Przetwarzanie...</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {booking.serviceName}
                    </h3>
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span className="ml-1">{getStatusText(booking.status)}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                      <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span>{date}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                      <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span>{time}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                      <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span>{booking.userName || 'Brak danych użytkownika'}</span>
                    </div>

                    {!workshopId && workshopName && (
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                        <Building className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span>{workshopName}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center justify-end space-x-2 text-lg font-bold text-primary">
                    <CreditCard className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span>{formatPrice(booking.servicePrice)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 flex justify-end space-x-3">
                {statusValue === 0 && (
                  <button
                    onClick={() => confirmBooking(booking.id, booking.serviceName)}
                    disabled={isProcessing || isConfirmingGlobal || isCancellingGlobal}
                    className="bg-success hover:bg-success-hover text-white py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    {(isProcessing || (isConfirmingGlobal && processingBookings[booking.id])) && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                    <span>Potwierdź</span>
                  </button>
                )}
                
                {(statusValue === 0 || statusValue === 1) && (
                  <button
                    onClick={() => cancelBooking(booking.id, booking.serviceName)}
                    disabled={isProcessing || isConfirmingGlobal || isCancellingGlobal}
                    className="bg-danger hover:bg-danger-hover text-white py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    {(isProcessing || (isCancellingGlobal && processingBookings[booking.id])) && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                    <span>Anuluj</span>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BookingList