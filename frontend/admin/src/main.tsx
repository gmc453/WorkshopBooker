import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

// Importujemy strony
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import SlotsPage from './pages/SlotsPage/index'
import AnalyticsPage from './pages/AnalyticsPage'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

const queryClient = new QueryClient()

// Konfiguracja routera
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/slots',
    element: (
      <ProtectedRoute>
        <SlotsPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/analytics/:workshopId',
    element: (
      <ProtectedRoute>
        <AnalyticsPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/login',
    element: <LoginPage />
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
