import type { AxiosRequestConfig } from 'axios'
import apiGateway from './apiGateway'

export async function callMicroservice<T>(path: string, options: AxiosRequestConfig = {}): Promise<T> {
  try {
    const response = await apiGateway.request<T>({ url: path, ...options })
    return response.data
  } catch (error: any) {
    if (!error.response) {
      throw new Error('Service unavailable')
    }
    throw error
  }
}

export async function checkServiceHealth(service: string): Promise<boolean> {
  try {
    await apiGateway.get(`/api/${service}/health`)
    return true
  } catch {
    return false
  }
}
