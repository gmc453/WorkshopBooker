import { useQuery } from '@tanstack/react-query'
import type { Booking } from '../types/booking'
import apiClient from '../api/axiosConfig'

/**
 * Hook do pobierania wszystkich rezerwacji dla warsztatów których jestem właścicielem
 */
export const useMyWorkshopBookings = () =>
  useQuery<Booking[]>({
    queryKey: ['myWorkshopBookings'],
    queryFn: async (): Promise<Booking[]> => {
      const response = await apiClient.get<Booking[]>('/api/bookings/my-workshops')
      return response.data
    },
  }) 