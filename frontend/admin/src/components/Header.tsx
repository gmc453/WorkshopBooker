import type { FC } from 'react'
import { useAuth } from '../context/AuthContext'

const Header: FC = () => {
  const { logout } = useAuth()

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Panel administracyjny</h1>
        
        <button
          onClick={logout}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Wyloguj
        </button>
      </div>
    </header>
  )
}

export default Header 