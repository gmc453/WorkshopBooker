import axios from 'axios'

// Tworzymy instancję axios z domyślną konfiguracją
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
    
    return config
  },
  (error) => {
    // W przypadku błędu zwracamy Promise.reject
    return Promise.reject(error)
  }
)

export default apiClient 