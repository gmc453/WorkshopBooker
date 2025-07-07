import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../api/axiosConfig'

export const useConfirmBooking = (workshopId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await apiClient.post(`/api/workshops/${workshopId}/bookings/${bookingId}/confirm`)
      return response.data
    },
    onSuccess: (_data, variables) => {
      // Natychmiastowa aktualizacja cache
      queryClient.setQueryData(['bookings', workshopId], (oldData: any) => {
        if (!oldData) return oldData;
        
        // Aktualizujemy status rezerwacji bezpośrednio w cache
        return oldData.map((booking: any) => {
          if (booking.id === variables) {
            return { ...booking, status: 1 }; // 1 = Confirmed
          }
          return booking;
        });
      });
      
      // Następnie invalidujemy zapytanie, aby dane zostały odświeżone
      queryClient.invalidateQueries({ queryKey: ['bookings', workshopId] });
    }
  })
} 