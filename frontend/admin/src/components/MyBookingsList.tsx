import type { FC } from 'react'
import { Calendar, Clock, CreditCard, CheckCircle, AlertCircle, XCircle, Loader2 } from 'lucide-react'
import { useMyBookings } from '../hooks/useMyBookings'
import type { Booking } from '../types/booking'

const MyBookingsList: FC = () => {
  const { data, isLoading, isError } = useMyBookings()

  const getStatusIcon = (status: string | number) => {
    const statusValue = typeof status === 'number' ? status : parseInt(status)
    
    switch (statusValue) {
      case 0: // Requested
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 1: // Confirmed
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 2: // Completed
        return <CheckCircle className="w-5 h-5 text-blue-500" />
      case 3: // Canceled
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string | number) => {
    const statusValue = typeof status === 'number' ? status : parseInt(status)
    
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
    const statusValue = typeof status === 'number' ? status : parseInt(status)
    
    switch (statusValue) {
      case 0: // Requested
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 1: // Confirmed
        return 'bg-green-100 text-green-800 border-green-200'
      case 2: // Completed
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 3: // Canceled
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
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
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-600 font-medium">Ładowanie Twoich rezerwacji...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <XCircle className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="text-red-800 font-semibold">Wystąpił błąd</h3>
            <p className="text-red-600">Nie udało się pobrać Twoich rezerwacji. Spróbuj ponownie.</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Brak rezerwacji</h3>
        <p className="text-gray-500">Nie masz jeszcze żadnych rezerwacji.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Twoje rezerwacje</h2>
        <p className="text-gray-600">Znaleziono {data.length} rezerwacji</p>
      </div>
      
      <div className="grid gap-4">
        {data.map((booking: Booking) => {
          const { date, time } = formatDateTime(booking.slotStartTime)
          
          return (
            <div
              key={booking.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {booking.serviceName}
                    </h3>
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span>{getStatusText(booking.status)}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{date}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{time}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2 text-lg font-bold text-gray-800">
                    <CreditCard className="w-5 h-5 text-gray-500" />
                    <span>{formatPrice(booking.servicePrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MyBookingsList 