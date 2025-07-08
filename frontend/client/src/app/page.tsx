"use client";

// src/app/page.tsx
import { useState } from "react";
import WorkshopList from "./components/WorkshopList";
import { Search, CalendarCheck, Clock, User, MapPin } from 'lucide-react';

export default function Home() {
  const [heroSearchTerm, setHeroSearchTerm] = useState('');

  const handleHeroSearch = () => {
    // Przewiń do sekcji warsztatów
    const workshopsSection = document.getElementById('workshops-section');
    if (workshopsSection) {
      workshopsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Rezerwacje warsztatów online
            </h1>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8">
              Odkryj i zarezerwuj terminy w najlepszych warsztatach. Szybko, wygodnie i bezpiecznie.
            </p>
            
            {/* Search bar */}
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Wyszukaj warsztaty..."
                value={heroSearchTerm}
                onChange={(e) => setHeroSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleHeroSearch()}
                className="w-full pl-12 py-4 pr-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <button 
                onClick={handleHeroSearch}
                className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Szukaj
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white mb-12">
            Dlaczego warto korzystać z naszej platformy?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <CalendarCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Łatwa rezerwacja</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Wybierz usługę, sprawdź dostępne terminy i zarezerwuj w kilku kliknięciach.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Oszczędność czasu</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Koniec z telefonami i oczekiwaniem. Rezerwuj o dowolnej porze dnia i nocy.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Lokalne warsztaty</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Znajdź najlepsze warsztaty w Twojej okolicy z łatwym dostępem.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Osobiste konto</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Zarządzaj swoimi rezerwacjami i śledź historię wizyt w jednym miejscu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workshops Section */}
      <main id="workshops-section" className="container mx-auto px-4 md:px-8 py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Dostępne warsztaty
        </h2>
        <WorkshopList initialSearchTerm={heroSearchTerm} />
      </main>
    </>
  );
}