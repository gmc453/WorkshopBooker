import { Navigate, Outlet } from 'react-router-dom'
import type { FC } from 'react'

/**
 * Komponent AuthGuard służy do ochrony tras przed nieautoryzowanym dostępem.
 * Jeśli użytkownik nie jest zalogowany (brak tokenu w localStorage), zostanie przekierowany na stronę logowania.
 */
const AuthGuard: FC = () => {
  const isAuthenticated = localStorage.getItem('authToken') !== null

  // Jeśli użytkownik nie jest zalogowany, przekieruj na stronę logowania
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Jeśli użytkownik jest zalogowany, renderuj chronioną zawartość
  return <Outlet />
}

export default AuthGuard 