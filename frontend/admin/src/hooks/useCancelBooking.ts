import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../api/axiosConfig'

export const useCancelBooking = (workshopId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await apiClient.post(`/api/bookings/${bookingId}/cancel`)
      return response.data
    },
    onSuccess: () => {
      // Unieważnienie zapytania o rezerwacje dla danego warsztatu
      queryClient.invalidateQueries({ queryKey: ['bookings', workshopId] })
    }
  })
} 