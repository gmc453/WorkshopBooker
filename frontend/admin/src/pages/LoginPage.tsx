import type { FC, FormEvent } from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/axiosConfig'
import { useAuth } from '../context/AuthContext'

const LoginPage: FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<'idle' | 'checking' | 'online' | 'offline'>('idle')
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()

  // Jeśli użytkownik jest już zalogowany, przekieruj go na stronę główną
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      console.log('Próba logowania z danymi:', { email, password: '***' })
      
      const response = await apiClient.post('/api/auth/login', {
        email,
        password
      })
      
      console.log('Odpowiedź z serwera:', response.data)
      
      // Upewnijmy się, że odpowiedź zawiera token
      if (!response.data.token) {
        console.error('Odpowiedź nie zawiera tokenu:', response.data)
        setError('Błąd logowania: odpowiedź serwera nie zawiera tokenu autoryzacyjnego')
        return
      }
      
      // Używamy funkcji login z kontekstu autentykacji
      login(response.data.token)
      
      // Przekierowanie na stronę główną nastąpi automatycznie dzięki useEffect
    } catch (err: any) {
      console.error('Błąd logowania:', err)
      
      if (err.response) {
        // Serwer zwrócił odpowiedź z kodem błędu
        const status = err.response.status
        const responseData = err.response.data
        
        if (status === 401 || status === 403) {
          setError('Niepoprawny email lub hasło')
        } else if (status === 500) {
          setError('Błąd serwera. Spróbuj ponownie później.')
        } else {
          setError(`Błąd ${status}: ${responseData.message || JSON.stringify(responseData)}`)
        }
      } else if (err.request) {
        // Nie otrzymano odpowiedzi z serwera
        setError('Brak odpowiedzi z serwera. Sprawdź połączenie internetowe lub upewnij się, że serwer API jest uruchomiony.')
      } else {
        // Błąd przy tworzeniu żądania
        setError(`Błąd: ${err.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const checkApiConnection = async () => {
    setApiStatus('checking')
    try {
      // Próbujemy uzyskać dostęp do zasobu który nie wymaga autoryzacji
      await apiClient.get('/api/health')
      setApiStatus('online')
    } catch (error: any) {
      // Nawet jeśli endpoint /health nie istnieje, ale otrzymamy odpowiedź od serwera (np. 404),
      // to oznacza że API jest dostępne
      if (error.response) {
        setApiStatus('online')
      } else {
        setApiStatus('offline')
        setError('API jest niedostępne. Upewnij się, że serwer backend jest uruchomiony.')
      }
    }
    
    // Resetujemy status po 3 sekundach
    setTimeout(() => {
      setApiStatus('idle')
    }, 3000)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">Logowanie</h2>
          <p className="mt-2 text-gray-600">Zaloguj się do panelu administracyjnego</p>
        </div>
        
        {error && (
          <div className="p-4 text-sm text-red-800 bg-red-100 border border-red-200 rounded-lg">
            {error}
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Adres email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="twoj@email.pl"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Hasło
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Logowanie...' : 'Zaloguj się'}
            </button>
          </div>
        </form>
        
        <div className="pt-4 text-center">
          <button 
            onClick={checkApiConnection}
            disabled={apiStatus === 'checking'}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {apiStatus === 'idle' && 'Sprawdź połączenie z API'}
            {apiStatus === 'checking' && 'Sprawdzanie...'}
            {apiStatus === 'online' && '✅ API jest dostępne'}
            {apiStatus === 'offline' && '❌ API jest niedostępne'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage 