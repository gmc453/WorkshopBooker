import axios from 'axios'
import { RateLimitHandler } from './rateLimitHandler'

// Funkcja do wyświetlania powiadomień o rate limit
const showRateLimitNotification = (info: any) => {
  console.warn(`Rate Limit: ${info.remaining}/${info.limit} (${info.policy})`);
  // Tutaj możesz dodać toast notification
};

// Ustawiam prawidłowy adres API - port 5197 jest poprawny zgodnie z konfiguracją backendu
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_GATEWAY_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

const rateLimitHandler = new RateLimitHandler(showRateLimitNotification, apiClient);

// Dodajemy interceptor, który będzie automatycznie dodawał token do nagłówków
apiClient.interceptors.request.use(
  (config) => {
    // Pobieramy token z localStorage - używamy klucza 'adminToken' zgodnie z AuthContext
    const token = localStorage.getItem('adminToken')
    
    console.log('🔍 Debug autoryzacji:')
    console.log('- Token exists:', !!token)
    console.log('- Token value:', token ? token.substring(0, 20) + '...' : 'null')
    console.log('- Request URL:', config.url)
    
    // Jeśli token istnieje, dodajemy go do nagłówka Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('✅ Authorization header added')
    } else {
      console.log('❌ No token found - user needs to login')
    }
    
    console.log(`Wysyłam żądanie do: ${config.url}`, config)
    return config
  },
  (error) => {
    // W przypadku błędu zwracamy Promise.reject
    console.error('Błąd w interceptorze requestu:', error)
    return Promise.reject(error)
  }
)

// Dodajemy interceptor dla odpowiedzi z obsługą rate limiting
apiClient.interceptors.response.use(
  (response) => {
    console.log(`Otrzymałem odpowiedź z: ${response.config.url}`, response)
    // Przywracamy handleSuccess aby rate limiting działał poprawnie
    return rateLimitHandler.handleSuccess(response)
  },
  async (error) => {
    if (error.response?.status === 429) {
      return await rateLimitHandler.handleRateLimit(error, error.config)
    }
    
    if (error.response) {
      // Serwer zwrócił odpowiedź ze statusem błędu
      console.error('Błąd odpowiedzi:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config?.url,
        method: error.config?.method
      })
      
      // Dodajemy szczegółowe informacje o błędach
      if (error.response.status === 409) {
        console.warn('Wykryto konflikt - prawdopodobnie nakładające się terminy')
      } else if (error.response.status === 404) {
        console.warn('Zasób nie został znaleziony')
      } else if (error.response.status === 401) {
        console.warn('Błąd autoryzacji - użytkownik musi się zalogować')
      }
    } else if (error.request) {
      // Żądanie zostało wysłane, ale nie otrzymano odpowiedzi
      console.error('Brak odpowiedzi z serwera:', error.request)
    } else {
      // Coś poszło nie tak przy tworzeniu żądania
      console.error('Błąd żądania:', error.message)
    }
    return Promise.reject(error)
  }
)

export default apiClient 