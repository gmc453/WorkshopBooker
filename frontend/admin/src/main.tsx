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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minut - dane są świeże przez 5 minut
      gcTime: 10 * 60 * 1000, // 10 minut - cache trzymany przez 10 minut
      refetchOnWindowFocus: false, // Wyłączamy refetch przy focusie okna
      refetchOnMount: false, // Wyłączamy refetch przy montowaniu
      refetchOnReconnect: false, // Wyłączamy refetch przy ponownym połączeniu
      retry: 1, // Maksymalnie 1 retry
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
    mutations: {
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})

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
    path: '/analytics',
    element: (
      <ProtectedRoute>
        <AnalyticsPage />
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
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>,
)
