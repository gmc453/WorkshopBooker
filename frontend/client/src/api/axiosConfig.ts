import axios from 'axios'

// Tworzymy instancję axios z domyślną konfiguracją
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_GATEWAY_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Dodajemy interceptor, który będzie automatycznie dodawał token do nagłówków
apiClient.interceptors.request.use(
  (config) => {
    // Pobieramy token z localStorage
    const token = localStorage.getItem('authToken')
    
    // Jeśli token istnieje, dodajemy go do nagłówka Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    // W przypadku błędu zwracamy Promise.reject
    return Promise.reject(error)
  }
)

// Dodajemy interceptor dla odpowiedzi z obsługą błędów
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      // Serwer zwrócił odpowiedź ze statusem błędu
      console.error('Błąd odpowiedzi:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method
      })
      
      // Dodajemy szczegółowe informacje o błędach
      if (error.response.status === 409) {
        console.warn('Wykryto konflikt - prawdopodobnie nakładające się terminy lub zarezerwowany termin')
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