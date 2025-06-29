import { useQuery } from '@tanstack/react-query'
import type { Booking } from '../types/booking'
import apiClient from '../api/axiosConfig'

/**
 * Hook do pobierania rezerwacji zalogowanego użytkownika
 */
export const useMyBookings = () =>
  useQuery<Booking[]>({
    queryKey: ['myBookings'],
    queryFn: async (): Promise<Booking[]> => {
      const response = await apiClient.get<Booking[]>('/api/bookings/my')
      return response.data
    },
  }) 