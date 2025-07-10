import axios from 'axios'

const apiGateway = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
})

apiGateway.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response) {
      console.error('API Gateway error:', error.response.status)
    } else {
      console.error('API Gateway unavailable')
    }
    return Promise.reject(error)
  }
)

export default apiGateway
