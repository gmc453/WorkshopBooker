import axios from 'axios'

const baseURL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || '/api'

const apiGateway = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default apiGateway
