import { useMemo, useState, useEffect } from 'react'
import type { FC } from 'react'
import { Calendar, Clock, CheckCircle, AlertCircle, XCircle, Loader2, User, Building, X, ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { useWorkshopBookings } from '../hooks/useWorkshopBookings'
import { useMyWorkshopBookings } from '../hooks/useMyWorkshopBookings'
import { useMyWorkshops } from '../hooks/useMyWorkshops'
import { Link } from 'react-router-dom'

import type { Booking } from '../types/booking'

// Komponent statusu rezerwacji
const BookingStatusBadge: FC<{ statusId: string | number }> = ({ statusId }) => {
  const getStatusConfig = (statusId: string | number) => {
    switch (statusId.toString()) {
      case '0': return { label: 'Oczekująca', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', icon: <Clock className="w-3 h-3 mr-1" /> };
      case '1': return { label: 'Potwierdzona', bgColor: 'bg-green-100', textColor: 'text-green-800', icon: <CheckCircle className="w-3 h-3 mr-1" /> };
      case '2': return { label: 'Zakończona', bgColor: 'bg-blue-100', textColor: 'text-blue-800', icon: <CheckCircle className="w-3 h-3 mr-1" /> };
      case '3': return { label: 'Anulowana', bgColor: 'bg-red-100', textColor: 'text-red-800', icon: <XCircle className="w-3 h-3 mr-1" /> };
      default: return { label: 'Nieznany', bgColor: 'bg-gray-100', textColor: 'text-gray-800', icon: <AlertCircle className="w-3 h-3 mr-1" /> };
    }
  };

  const { label, bgColor, textColor, icon } = getStatusConfig(statusId);

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {icon}
      {label}
    </span>
  );
};

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
  onConfirm?: (bookingId: string) => void
  onComplete?: (bookingId: string) => void
  onCancel?: (bookingId: string) => void
}

const BookingList: FC<BookingListProps> = ({ 
  workshopId, 
  statusFilter = 'all', 
  searchQuery = '',
  onConfirm,
  onComplete,
  onCancel
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
  const { data: myWorkshopBookings, isLoading: isLoadingMyWorkshopBookings, isError: isMyWorkshopBookingsError, refetch: refetchMyWorkshopBookings } = 
    useMyWorkshopBookings()
    
  // Stan ładowania i błędów
  const isLoading = workshopId ? isLoadingWorkshopBookings : isLoadingMyWorkshopBookings
  const isError = workshopId ? isWorkshopBookingsError : isMyWorkshopBookingsError
  
  // Określamy, które dane mamy używać
  const bookingsData = workshopId ? workshopBookings : myWorkshopBookings
  
  // Funkcja odświeżenia listy rezerwacji
  const refreshBookings = () => {
    if (workshopId) {
      refetchWorkshopBookings();
    } else {
      refetchMyWorkshopBookings();
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

  // Stan dla paginacji
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  
  // Reset strony przy zmianie filtrów
  useEffect(() => {
    setCurrentPage(1);
  }, [workshopId, statusFilter, searchQuery]);

  // Paginacja rezerwacji
  const paginatedBookings = useMemo(() => {
    if (!filteredBookings) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return filteredBookings.slice(startIndex, endIndex);
  }, [filteredBookings, currentPage, itemsPerPage]);
  
  // Obliczanie całkowitej liczby stron
  const totalPages = useMemo(() => {
    if (!filteredBookings) return 0;
    return Math.ceil(filteredBookings.length / itemsPerPage);
  }, [filteredBookings, itemsPerPage]);
  
  // Nawigacja paginacji
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  // Komponent paginacji
  const Pagination = () => {
    if (totalPages <= 1) return null;
    
    // Generowanie przycisków numerycznych stron
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Dostosowanie, jeśli jesteśmy blisko końca
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="flex items-center justify-between mt-6 border-t border-gray-200 pt-4">
        <div className="flex items-center text-sm text-gray-600">
          <span>Pokazuje {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredBookings.length)} z {filteredBookings.length} rezerwacji</span>
          <select 
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="ml-2 px-2 py-1 border border-gray-200 rounded text-sm"
          >
            <option value={5}>5 / stronę</option>
            <option value={10}>10 / stronę</option>
            <option value={20}>20 / stronę</option>
            <option value={50}>50 / stronę</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className={`p-2 rounded-md ${
              currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
            }`}
            aria-label="Poprzednia strona"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {startPage > 1 && (
            <>
              <button
                onClick={() => goToPage(1)}
                className="px-3 py-1 rounded-md hover:bg-gray-100"
              >
                1
              </button>
              {startPage > 2 && <span className="px-1">...</span>}
            </>
          )}
          
          {pageNumbers.map(page => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`px-3 py-1 rounded-md ${
                currentPage === page 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-1">...</span>}
              <button
                onClick={() => goToPage(totalPages)}
                className="px-3 py-1 rounded-md hover:bg-gray-100"
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-md ${
              currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
            }`}
            aria-label="Następna strona"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  // Nowe funkcje do zarządzania statusem rezerwacji (przekazane jako props)
  const handleConfirmBooking = async (bookingId: string) => {
    if (onConfirm) {
      setProcessingBookings(prev => ({ ...prev, [bookingId]: true }));
      try {
        await onConfirm(bookingId);
        addNotification({
          type: 'success',
          message: 'Rezerwacja została potwierdzona',
          bookingId
        });
      } catch (error) {
        addNotification({
          type: 'error',
          message: 'Nie udało się potwierdzić rezerwacji',
          bookingId
        });
      } finally {
        setProcessingBookings(prev => ({ ...prev, [bookingId]: false }));
      }
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    if (onComplete) {
      setProcessingBookings(prev => ({ ...prev, [bookingId]: true }));
      try {
        await onComplete(bookingId);
        addNotification({
          type: 'success',
          message: 'Rezerwacja została zakończona',
          bookingId
        });
      } catch (error) {
        addNotification({
          type: 'error',
          message: 'Nie udało się zakończyć rezerwacji',
          bookingId
        });
      } finally {
        setProcessingBookings(prev => ({ ...prev, [bookingId]: false }));
      }
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (onCancel) {
      setProcessingBookings(prev => ({ ...prev, [bookingId]: true }));
      try {
        await onCancel(bookingId);
        addNotification({
          type: 'success',
          message: 'Rezerwacja została anulowana',
          bookingId
        });
      } catch (error) {
        addNotification({
          type: 'error',
          message: 'Nie udało się anulować rezerwacji',
          bookingId
        });
      } finally {
        setProcessingBookings(prev => ({ ...prev, [bookingId]: false }));
      }
    }
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

  const getWorkshopName = (booking: Booking) => {
    if (workshopId) {
      return selectedWorkshopName
    }
    return booking.workshopName || 'Nieznany warsztat'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Ładowanie rezerwacji...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Błąd ładowania</h3>
        <p className="text-gray-600 mb-4">Nie udało się załadować listy rezerwacji</p>
        <button 
          onClick={refreshBookings}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Spróbuj ponownie
        </button>
      </div>
    )
  }

  if (!filteredBookings || filteredBookings.length === 0) {
    return (
      <div className="text-center p-8">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak rezerwacji</h3>
        <p className="text-gray-600">
          {searchQuery || statusFilter !== 'all' 
            ? 'Nie znaleziono rezerwacji spełniających kryteria wyszukiwania'
            : 'Nie ma jeszcze żadnych rezerwacji'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Powiadomienia */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow-lg border-l-4 ${
                notification.type === 'success'
                  ? 'bg-green-50 border-green-400 text-green-800'
                  : notification.type === 'error'
                  ? 'bg-red-50 border-red-400 text-red-800'
                  : 'bg-blue-50 border-blue-400 text-blue-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {notification.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
                  {notification.type === 'error' && <XCircle className="w-5 h-5 mr-2" />}
                  {notification.type === 'info' && <AlertCircle className="w-5 h-5 mr-2" />}
                  <span className="font-medium">{notification.message}</span>
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="ml-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista rezerwacji */}
      <div className="space-y-4">
        {paginatedBookings.map((booking) => {
          const { date, time } = formatDateTime(booking.slotStartTime, booking.slotEndTime)
          const isProcessing = processingBookings[booking.id]
          
          return (
            <div
              key={booking.id}
              className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-300 ${
                isProcessing ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1">{getStatusText(booking.status)}</span>
                      </span>
                      <span className="text-sm text-gray-500">#{booking.id.slice(0, 8)}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatPrice(booking.servicePrice)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{booking.serviceName}</h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Building className="w-4 h-4 mr-1" />
                        <span>{getWorkshopName(booking)}</span>
                      </div>
                      {booking.userName && (
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="w-4 h-4 mr-1" />
                          <span>{booking.userName}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{date}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{time}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {/* Status badge */}
                  <BookingStatusBadge statusId={booking.status} />
                  
                  {/* Action buttons */}
                  <div className="flex space-x-2">
                    {booking.status.toString() === '0' && onConfirm && (
                      <button 
                        onClick={() => handleConfirmBooking(booking.id)}
                        disabled={isProcessing}
                        className="p-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Potwierdź rezerwację"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    
                    {booking.status.toString() === '1' && onComplete && (
                      <button 
                        onClick={() => handleCompleteBooking(booking.id)}
                        disabled={isProcessing}
                        className="p-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Zakończ rezerwację"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    
                    {(booking.status.toString() === '0' || booking.status.toString() === '1') && onCancel && (
                      <button 
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={isProcessing}
                        className="p-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Anuluj rezerwację"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    
                    <Link 
                      to={`/bookings/${booking.id}`}
                      className="p-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                      title="Szczegóły rezerwacji"
                    >
                      <Info className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        
        {/* Paginacja */}
        <Pagination />
      </div>
    </div>
  )
}

export default BookingList