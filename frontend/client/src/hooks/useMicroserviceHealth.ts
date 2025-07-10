import { useQuery } from '@tanstack/react-query'
import apiClient from '../api/axiosConfig'

export const useMicroserviceHealth = (service: string) =>
  useQuery(['service-health', service], async () => {
    try {
      await apiClient.get(`/api/${service}/health`)
      return true
    } catch {
      return false
    }
  }, { retry: false })
