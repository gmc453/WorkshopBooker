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
import GlobalAnalyticsPage from './pages/GlobalAnalyticsPage'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'

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
    path: '/analytics/global',
    element: (
      <ProtectedRoute>
        <GlobalAnalyticsPage />
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
      <ErrorBoundary>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ErrorBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
