import { useMutation, useQuery } from '@tanstack/react-query'
import { callMicroservice } from '../services/microserviceClient'

type EmergencyRequest = {
  description: string
  location: string
}

export const useEmergencyService = () => {
  const operators = useQuery(['emergency-operators'], () =>
    callMicroservice<any[]>('/api/emergency/operators', { method: 'GET' })
  )

  const requestAssist = useMutation((payload: EmergencyRequest) =>
    callMicroservice('/api/emergency/requests', { method: 'POST', data: payload })
  )

  return { operators, requestAssist }
}
