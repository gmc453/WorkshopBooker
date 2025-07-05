// src/components/WorkshopList.tsx
"use client"; // <-- WAŻNE! To mówi Next.js, że ten komponent jest interaktywny i działa w przeglądarce.

import { useEffect, useState } from "react";
import axios from "axios";
import { Workshop } from "../types/workshop";
import Link from "next/link";

// ZMIEŃ PORT NA TEN, NA KTÓRYM DZIAŁA TWOJE API .NET!
const API_URL = "http://localhost:5197/api/workshops"; 

export default function WorkshopList() {
    // Stany komponentu: do przechowywania danych, statusu ładowania i ewentualnych błędów.
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchWorkshops = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}${searchTerm ? `?searchTerm=${encodeURIComponent(searchTerm)}` : ''}`);
                setWorkshops(response.data);
                setError(null);
            } catch (err: any) {
                setError("Nie udało się pobrać danych z serwera. Sprawdź, czy API jest uruchomione i czy CORS jest poprawnie skonfigurowany.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkshops();
    }, [searchTerm]); // Dodajemy searchTerm jako zależność, aby useEffect uruchamiał się przy zmianie frazy wyszukiwania

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div>
            <div className="mb-6">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg 
                            className="w-5 h-5 text-gray-400" 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Szukaj warsztatów..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
                    <svg 
                        className="mx-auto h-12 w-12 text-red-400 dark:text-red-500 mb-4" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {workshops.length > 0 ? (
                        workshops.map((workshop) => (
                            <Link href={`/workshops/${workshop.id}`} key={workshop.id} className="block group">
                                <div className="p-5 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-800/50 group-hover:border-primary/50 dark:group-hover:border-primary/30 group-hover:translate-y-[-2px]">
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                                        <div className="flex-1">
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors">{workshop.name}</h2>
                                            <p className="mt-2 text-gray-700 dark:text-gray-300">{workshop.description}</p>
                                            
                                            {workshop.address && (
                                                <div className="mt-3 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                    <svg 
                                                        className="w-4 h-4 mr-1" 
                                                        xmlns="http://www.w3.org/2000/svg" 
                                                        viewBox="0 0 24 24" 
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        strokeWidth="2" 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                        <circle cx="12" cy="10" r="3"></circle>
                                                    </svg>
                                                    <span>{workshop.address}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="mt-4 md:mt-0 md:ml-6 flex items-center text-primary">
                                            <span className="font-medium">Zobacz szczegóły</span>
                                            <svg 
                                                className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" 
                                                xmlns="http://www.w3.org/2000/svg" 
                                                viewBox="0 0 24 24" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                strokeWidth="2" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round"
                                            >
                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                                <polyline points="12 5 19 12 12 19"></polyline>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                            <svg 
                                className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" 
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M8 15h8"></path>
                                <path d="M9 9h.01"></path>
                                <path d="M15 9h.01"></path>
                            </svg>
                            <p className="text-xl font-medium text-gray-700 dark:text-gray-300">Nie znaleziono żadnych warsztatów pasujących do wyszukiwania.</p>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">Spróbuj zmienić kryteria wyszukiwania.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}