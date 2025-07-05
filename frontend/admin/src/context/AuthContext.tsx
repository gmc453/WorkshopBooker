import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import apiClient from '../api/axiosConfig'
import { jwtDecode } from 'jwt-decode'

// Interfejs dla zdekodowanego tokenu JWT
interface DecodedToken {
  exp: number;
  sub: string;
  email?: string;
  [key: string]: any;
}

// Definiujemy typ dla kontekstu autentykacji
type AuthContextType = {
  isAuthenticated: boolean
  isLoading: boolean
  userEmail: string | null
  login: (token: string) => void
  logout: () => void
}

// Tworzymy kontekst z domyślnymi wartościami
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  userEmail: null,
  login: () => {},
  logout: () => {}
})

// Props dla AuthProvider
type AuthProviderProps = {
  children: ReactNode
}

// Funkcja pomocnicza do sprawdzania ważności tokenu
const isTokenValid = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token)
    // Sprawdź czy token nie wygasł (exp to czas wygaśnięcia w sekundach od epoki Unix)
    return decoded.exp * 1000 > Date.now()
  } catch (error) {
    console.error("Błąd dekodowania tokenu:", error)
    return false
  }
}

// Komponent dostawcy kontekstu autentykacji
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Sprawdzamy, czy token istnieje w localStorage przy pierwszym załadowaniu
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken')
      
      if (token && isTokenValid(token)) {
        try {
          // Opcjonalnie: możesz tutaj dodać zapytanie do API, aby zweryfikować token po stronie serwera
          // const response = await apiClient.get('/api/auth/verify-token')
          
          // Zdekoduj token, aby pobrać dane użytkownika
          const decoded = jwtDecode<DecodedToken>(token)
          
          setUserEmail(decoded.email || decoded.sub)
          setIsAuthenticated(true)
          
          console.log('Użytkownik uwierzytelniony:', {
            email: decoded.email || decoded.sub,
            expiry: new Date(decoded.exp * 1000).toLocaleString()
          })
        } catch (error) {
          console.error('Błąd weryfikacji tokenu:', error)
          localStorage.removeItem('authToken')
          setIsAuthenticated(false)
          setUserEmail(null)
        }
      } else {
        if (token) {
          // Token istnieje, ale jest nieważny
          console.log('Znaleziono nieważny token - usuwam')
          localStorage.removeItem('authToken')
        }
        setIsAuthenticated(false)
        setUserEmail(null)
      }
      
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  // Funkcja logowania - zapisuje token i ustawia stan autentykacji
  const login = (token: string) => {
    try {
      if (isTokenValid(token)) {
        localStorage.setItem('authToken', token)
        
        // Zdekoduj token, aby pobrać dane użytkownika
        const decoded = jwtDecode<DecodedToken>(token)
        setUserEmail(decoded.email || decoded.sub)
        
        setIsAuthenticated(true)
        console.log('Zalogowano pomyślnie')
      } else {
        throw new Error('Otrzymano nieważny token')
      }
    } catch (error) {
      console.error('Błąd podczas logowania:', error)
      logout()
    }
  }

  // Funkcja wylogowania - usuwa token i resetuje stan autentykacji
  const logout = () => {
    localStorage.removeItem('authToken')
    setIsAuthenticated(false)
    setUserEmail(null)
    console.log('Wylogowano pomyślnie')
  }

  // Wartości przekazywane przez kontekst
  const contextValue: AuthContextType = {
    isAuthenticated,
    isLoading,
    userEmail,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Własny hook ułatwiający korzystanie z kontekstu
export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth musi być używany wewnątrz AuthProvider')
  }
  
  return context
} 