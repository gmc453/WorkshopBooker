import { useQuery } from '@tanstack/react-query'
import { callService } from '../services/microserviceClient'

export const useMicroserviceHealth = (service: string) => {
  return useQuery(['service-health', service], async () => {
    return await callService(service, '/health', { method: 'GET' })
  }, {
    retry: false
  })
}
