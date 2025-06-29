import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

// Importujemy strony
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import AuthGuard from './components/AuthGuard'

const queryClient = new QueryClient()

// Konfiguracja routera
const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthGuard />,
    children: [
      {
        path: '',
        element: <DashboardPage />
      }
    ]
  },
  {
    path: '/login',
    element: <LoginPage />
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
