import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { Booking } from '../types/booking'

export const useWorkshopBookings = (workshopId: string) =>
  useQuery<Booking[]>({
    queryKey: ['bookings', workshopId],
    queryFn: async (): Promise<Booking[]> => {
      const response = await axios.get<Booking[]>(`http://localhost:5197/api/workshops/${workshopId}/bookings`)
      return response.data 
    },
  })
