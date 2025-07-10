import { useQuery } from '@tanstack/react-query'
import { checkServiceHealth } from '../services/microserviceClient'

export const useMicroserviceHealth = (service: string) =>
  useQuery(['service-health', service], () => checkServiceHealth(service), {
    retry: false
  })
