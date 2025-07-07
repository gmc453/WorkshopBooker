import { createContext, useState, useContext, useEffect, type ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'

export type AuthContextType = {
  isAuthenticated: boolean
  token: string | null
  login: (token: string) => void
  logout: () => void
  isLoading: boolean
  userId: string | null
  userEmail: string | null
  userRole: string | null
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
  userId: null,
  userEmail: null,
  userRole: null
})

interface JwtPayload {
  nameid: string
  email: string
  role: string
  exp: number
}

type AuthProviderProps = {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken')
    if (storedToken) {
      try {
        const decoded = jwtDecode<JwtPayload>(storedToken)
        // Sprawdzenie czy token nie wygasł
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken)
          setUserId(decoded.nameid)
          setUserEmail(decoded.email)
          setUserRole(decoded.role)
        } else {
          // Token wygasł, wyloguj
          localStorage.removeItem('adminToken')
          setToken(null)
          setUserId(null)
          setUserEmail(null)
          setUserRole(null)
        }
      } catch (error) {
        // Błędny token, wyloguj
        localStorage.removeItem('adminToken')
        setToken(null)
        setUserId(null)
        setUserEmail(null)
        setUserRole(null)
      }
    }
    setIsLoading(false)
  }, [])

  const login = (newToken: string) => {
    try {
      const decoded = jwtDecode<JwtPayload>(newToken)
      localStorage.setItem('adminToken', newToken)
      setToken(newToken)
      setUserId(decoded.nameid)
      setUserEmail(decoded.email)
      setUserRole(decoded.role)
    } catch (error) {
      console.error('Błąd dekodowania tokenu:', error)
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    setToken(null)
    setUserId(null)
    setUserEmail(null)
    setUserRole(null)
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: !!token, 
      token,
      login,
      logout,
      isLoading,
      userId,
      userEmail,
      userRole
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 