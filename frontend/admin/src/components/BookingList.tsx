import type { FC } from 'react'
import { useWorkshopBookings } from '../hooks/useWorkshopBookings'

import type { Booking } from '../types/booking'

type BookingListProps = {
  workshopId: string
}

const BookingList: FC<BookingListProps> = ({ workshopId }) => {
  const { data, isLoading, isError } = useWorkshopBookings(workshopId)

  if (isLoading) {
    return <p>Ładowanie...</p>
  }

  if (isError) {
    return <p>Wystąpił błąd podczas pobierania danych.</p>
  }

  return (
    <ul>
      {data &&
        data.map((booking: Booking) => (
          <li key={booking.id}>{booking.serviceName}</li>
        ))}
    </ul>
  )
}

export default BookingList
