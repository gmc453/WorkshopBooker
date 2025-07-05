import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { FC, ReactNode } from 'react'

type ProtectedRouteProps = {
  children: ReactNode
}

/**
 * Komponent chroniący trasy przed nieautoryzowanym dostępem.
 * Jeśli użytkownik nie jest zalogowany, zostanie przekierowany na stronę logowania.
 */
const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Przekierowujemy tylko gdy proces ładowania został zakończony i użytkownik nie jest zalogowany
    if (!isLoading && !isAuthenticated) {
      console.log('Użytkownik nie jest zalogowany, przekierowanie do /login')
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  // Podczas ładowania wyświetlamy ekran ładowania
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie...</p>
        </div>
      </div>
    )
  }

  // Jeśli użytkownik jest zalogowany, renderujemy chronioną zawartość
  return isAuthenticated ? <>{children}</> : null
}

export default ProtectedRoute 