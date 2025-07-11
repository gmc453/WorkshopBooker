import type { FC } from 'react'
import { Calendar, Clock, CheckCircle, AlertCircle, XCircle, Loader2, User, Building, X, ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { BookingListTableHeader } from './BookingListTableHeader'
import { BookingListTableRow } from './BookingListTableRow'
import type { Booking } from '../../types/booking'
import type { Notification } from './useBookingListState'

type BookingListTableProps = {
  bookings: Booking[]
  processingBookings: {[key: string]: boolean}
  onConfirm?: (bookingId: string) => void
  onComplete?: (bookingId: string) => void
  onCancel?: (bookingId: string) => void
  onProcessingChange: (bookingId: string, isProcessing: boolean) => void
  onNotification: (notification: Omit<Notification, 'id'>) => void
}

export const BookingListTable: FC<BookingListTableProps> = ({
  bookings,
  processingBookings,
  onConfirm,
  onComplete,
  onCancel,
  onProcessingChange,
  onNotification
}) => {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <Info className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Brak rezerwacji</h3>
        <p className="mt-1 text-sm text-gray-500">
          Nie znaleziono żadnych rezerwacji spełniających kryteria wyszukiwania.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <BookingListTableHeader />
        <tbody className="divide-y divide-gray-200 bg-white">
          {bookings.map(booking => (
            <BookingListTableRow 
              key={booking.id} 
              booking={booking}
              isProcessing={processingBookings[booking.id] || false}
              onConfirm={onConfirm}
              onComplete={onComplete}
              onCancel={onCancel}
              onProcessingChange={onProcessingChange}
              onNotification={onNotification}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}; 