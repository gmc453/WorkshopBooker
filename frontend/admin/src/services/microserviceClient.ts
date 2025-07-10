import apiGateway from './apiGateway'

export async function callService(service: string, path: string, options: any = {}) {
  try {
    const response = await apiGateway.request({
      url: `/${service}${path}`,
      ...options
    })
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Service error')
    }
    throw new Error('Service unavailable')
  }
}
