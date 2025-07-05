import axios from 'axios'

// Ustawiam prawidłowy adres API - port 5197 jest poprawny zgodnie z konfiguracją backendu
const apiClient = axios.create({
  baseURL: 'http://localhost:5197',
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
    
    console.log(`Wysyłam żądanie do: ${config.url}`, config)
    return config
  },
  (error) => {
    // W przypadku błędu zwracamy Promise.reject
    console.error('Błąd w interceptorze requestu:', error)
    return Promise.reject(error)
  }
)

// Dodajemy interceptor dla odpowiedzi
apiClient.interceptors.response.use(
  (response) => {
    console.log(`Otrzymałem odpowiedź z: ${response.config.url}`, response)
    return response
  },
  (error) => {
    if (error.response) {
      // Serwer zwrócił odpowiedź ze statusem błędu
      console.error('Błąd odpowiedzi:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      })
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