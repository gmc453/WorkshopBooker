"use client";

import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600">
          WorkshopBooker
        </Link>

        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link
                href="/"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Strona główna
              </Link>
            </li>
            {isAuthenticated ? (
              <>
                <li>
                  <Link
                    href="/my-bookings"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Moje rezerwacje
                  </Link>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Wyloguj
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Zaloguj
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    Zarejestruj
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
} 