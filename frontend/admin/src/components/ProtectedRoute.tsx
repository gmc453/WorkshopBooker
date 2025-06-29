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
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Jeśli użytkownik jest zalogowany, renderujemy chronioną zawartość
  return isAuthenticated ? <>{children}</> : null
}

export default ProtectedRoute 