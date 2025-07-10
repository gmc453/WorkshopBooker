import { useMutation } from '@tanstack/react-query'
import { callService } from '../services/microserviceClient'

export const useEmergencyService = () => {
  return useMutation({
    mutationFn: async (payload: any) =>
      await callService('emergency', '/request', { method: 'POST', data: payload }),
  })
}
