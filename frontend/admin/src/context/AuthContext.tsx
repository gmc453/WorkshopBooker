import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

// Definiujemy typ dla kontekstu autentykacji
type AuthContextType = {
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
}

// Tworzymy kontekst z domyślnymi wartościami
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {}
})

// Props dla AuthProvider
type AuthProviderProps = {
  children: ReactNode
}

// Komponent dostawcy kontekstu autentykacji
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Sprawdzamy, czy token istnieje w localStorage przy pierwszym załadowaniu
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  // Funkcja logowania - zapisuje token i ustawia stan autentykacji
  const login = (token: string) => {
    localStorage.setItem('authToken', token)
    setIsAuthenticated(true)
  }

  // Funkcja wylogowania - usuwa token i resetuje stan autentykacji
  const logout = () => {
    localStorage.removeItem('authToken')
    setIsAuthenticated(false)
  }

  // Wartości przekazywane przez kontekst
  const contextValue: AuthContextType = {
    isAuthenticated,
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