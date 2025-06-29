import type { FC } from 'react'
import { Calendar, Clock, CreditCard, CheckCircle, AlertCircle, XCircle, Loader2, User } from 'lucide-react'
import { useWorkshopBookings } from '../hooks/useWorkshopBookings'
import { useConfirmBooking } from '../hooks/useConfirmBooking'
import { useCancelBooking } from '../hooks/useCancelBooking'

import type { Booking } from '../types/booking'

type BookingListProps = {
  workshopId: string
}

const BookingList: FC<BookingListProps> = ({ workshopId }) => {
  const { data, isLoading, isError } = useWorkshopBookings(workshopId)
  const { mutate: confirmBooking, isPending: isConfirming } = useConfirmBooking(workshopId)
  const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking(workshopId)

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

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return {
      date: date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(price)
  }

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

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
        <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Brak rezerwacji</h3>
        <p className="text-gray-500 dark:text-gray-400">Nie ma jeszcze żadnych rezerwacji w tym warsztacie.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Lista rezerwacji</h2>
        <div className="flex items-center text-gray-600 dark:text-gray-300 space-x-1">
          <Calendar className="w-4 h-4" />
          <span>Znaleziono {data.length} rezerwacji</span>
        </div>
      </div>
      
      <div className="grid gap-5">
        {data.map((booking: Booking) => {
          const { date, time } = formatDateTime(booking.bookingDateTime)
          const statusValue = typeof booking.status === 'number' ? booking.status : parseInt(booking.status);
          
          return (
            <div
              key={booking.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 p-6"
            >
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
                    onClick={() => confirmBooking(booking.id)}
                    disabled={isConfirming || isCancelling}
                    className="bg-success hover:bg-success-hover text-white py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    {isConfirming && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                    <span>Potwierdź</span>
                  </button>
                )}
                
                {(statusValue === 0 || statusValue === 1) && (
                  <button
                    onClick={() => cancelBooking(booking.id)}
                    disabled={isConfirming || isCancelling}
                    className="bg-danger hover:bg-danger-hover text-white py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    {isCancelling && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
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