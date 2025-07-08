'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'

interface CancelBookingResponse {
  success: boolean
  message: string
}

export const useCancelBooking = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<CancelBookingResponse, Error, string>({
    mutationFn: async (bookingId: string) => {
      if (!token) {
        throw new Error('Nie jesteś zalogowany')
      }

      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesja wygasła. Zaloguj się ponownie.')
        }
        if (response.status === 403) {
          throw new Error('Nie masz uprawnień do anulowania tej rezerwacji.')
        }
        if (response.status === 404) {
          throw new Error('Rezerwacja nie została znaleziona.')
        }
        
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Nie udało się anulować rezerwacji')
      }

      return { success: true, message: 'Rezerwacja została anulowana' }
    },
    
    onSuccess: (_data, bookingId) => {
      // Aktualizuj cache dla "Moje rezerwacje"
      queryClient.setQueryData(['my-bookings'], (oldData: any) => {
        if (!oldData) return oldData
        
        return oldData.map((booking: any) => {
          if (booking.id === bookingId) {
            return { ...booking, status: 3 } // 3 = Canceled
          }
          return booking
        })
      })
      
      // Invaliduj zapytania dla pewności
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
    },
    
    onError: (error) => {
      console.error('Błąd anulowania rezerwacji:', error)
      // Error handling będzie w komponencie
    }
  })
} 