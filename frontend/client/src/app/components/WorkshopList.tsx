// src/components/WorkshopList.tsx
"use client"; // <-- WAŻNE! To mówi Next.js, że ten komponent jest interaktywny i działa w przeglądarce.

import { useEffect, useState } from "react";
import axios from "axios";
import { Workshop } from "../types/workshop";
import Link from "next/link";
import { Search, MapPin, ArrowRight, Briefcase, Star, Clock, Calendar, X, AlertCircle, Filter, SlidersHorizontal } from 'lucide-react';

// ZMIEŃ PORT NA TEN, NA KTÓRYM DZIAŁA TWOJE API .NET!
const API_URL = "http://localhost:5197/api/workshops"; 

interface WorkshopListProps {
    initialSearchTerm?: string;
}

export default function WorkshopList({ initialSearchTerm = '' }: WorkshopListProps) {
    // Stany komponentu: do przechowywania danych, statusu ładowania i ewentualnych błędów.
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [filterRating, setFilterRating] = useState<number | null>(null);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'name' | 'rating' | 'price' | 'distance'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

        // Dodaj małe opóźnienie, aby nie wysyłać zbyt wielu żądań podczas pisania
        const timeoutId = setTimeout(() => {
            fetchWorkshops();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]); // Dodajemy searchTerm jako zależność, aby useEffect uruchamiał się przy zmianie frazy wyszukiwania

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };
    
    // Zaawansowane filtrowanie i sortowanie warsztatów
    const filteredAndSortedWorkshops = workshops
        .filter(workshop => {
            // Filtr oceny
            if (filterRating && workshop.rating) {
                if (workshop.rating < filterRating) return false;
            }
            
            // Filtr kategorii (mock - w rzeczywistej aplikacji warsztaty miałyby kategorie)
            if (selectedCategory !== 'all') {
                // Tutaj byłaby logika filtrowania po kategorii
                return true; // Na razie przepuszczamy wszystkie
            }
            
            // Filtr ceny (na podstawie najniższej ceny usługi)
            if (workshop.services && workshop.services.length > 0) {
                const minPrice = Math.min(...workshop.services.map(s => s.price));
                if (minPrice < priceRange[0] || minPrice > priceRange[1]) {
                    return false;
                }
            }
            
            return true;
        })
        .sort((a, b) => {
            let comparison = 0;
            
            switch (sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'rating':
                    const ratingA = a.rating || 0;
                    const ratingB = b.rating || 0;
                    comparison = ratingA - ratingB;
                    break;
                case 'price':
                    const priceA = a.services && a.services.length > 0 ? Math.min(...a.services.map(s => s.price)) : 0;
                    const priceB = b.services && b.services.length > 0 ? Math.min(...b.services.map(s => s.price)) : 0;
                    comparison = priceA - priceB;
                    break;
                case 'distance':
                    // Mock distance - w rzeczywistej aplikacji byłaby obliczana na podstawie lokalizacji
                    comparison = 0;
                    break;
            }
            
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    
    // Pomocnicza funkcja do generowania gwiazdek oceny
    const renderRating = (rating: number | undefined) => {
        if (!rating) return null;
        
        return (
            <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, index) => (
                    <Star 
                        key={index} 
                        className={`w-4 h-4 ${index < Math.round(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                    />
                ))}
                <span className="ml-1 text-sm font-medium text-gray-600 dark:text-gray-400">{rating.toFixed(1)}</span>
            </div>
        );
    };

    return (
        <div>
            <div className="mb-6">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Szukaj warsztatów..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition-all"
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm('')}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
                
                {/* Podstawowe filtry */}
                <div className="mt-4 flex flex-wrap items-center gap-4">
                    <div className="flex flex-wrap gap-2">
                        <button 
                            onClick={() => setFilterRating(null)}
                            className={`px-3 py-1.5 text-sm rounded-full border ${!filterRating ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-white border-gray-300 text-gray-700'}`}
                        >
                            Wszystkie
                        </button>
                        {[4, 3, 2].map(rating => (
                            <button 
                                key={rating}
                                onClick={() => setFilterRating(rating)}
                                className={`px-3 py-1.5 text-sm rounded-full border flex items-center ${filterRating === rating ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-white border-gray-300 text-gray-700'}`}
                            >
                                <span>Od {rating}+ </span>
                                <Star className="w-3 h-3 ml-1 fill-current" />
                            </button>
                        ))}
                    </div>
                    
                    <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span>Zaawansowane filtry</span>
                    </button>
                </div>

                {/* Zaawansowane filtry */}
                {showAdvancedFilters && (
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Zakres cenowy */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Zakres cenowy (zł)
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={priceRange[0]}
                                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Od"
                                    />
                                    <span className="text-gray-500">-</span>
                                    <input
                                        type="number"
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Do"
                                    />
                                </div>
                            </div>

                            {/* Kategoria */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Kategoria
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">Wszystkie kategorie</option>
                                    <option value="mechanic">Mechanika</option>
                                    <option value="electric">Elektryka</option>
                                    <option value="bodywork">Blacharstwo</option>
                                    <option value="diagnostic">Diagnostyka</option>
                                </select>
                            </div>

                            {/* Sortowanie */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Sortuj według
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'name' | 'rating' | 'price' | 'distance')}
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="name">Nazwa</option>
                                    <option value="rating">Ocena</option>
                                    <option value="price">Cena</option>
                                    <option value="distance">Odległość</option>
                                </select>
                            </div>

                            {/* Kolejność sortowania */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Kolejność
                                </label>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="asc">Rosnąco</option>
                                    <option value="desc">Malejąco</option>
                                </select>
                            </div>
                        </div>

                        {/* Przycisk wyczyszczenia filtrów */}
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => {
                                    setFilterRating(null);
                                    setPriceRange([0, 1000]);
                                    setSelectedCategory('all');
                                    setSortBy('name');
                                    setSortOrder('asc');
                                }}
                                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Wyczyść wszystkie filtry
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Ładowanie warsztatów...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-400 dark:text-red-500 mb-4" />
                    <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
                </div>
            ) : (
                <div>
                    {filteredAndSortedWorkshops.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredAndSortedWorkshops.map((workshop: Workshop) => (
                                <Link href={`/workshops/${workshop.id}`} key={workshop.id} className="block group">
                                    <div className="h-full flex flex-col border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-800/50 group-hover:border-blue-300 group-hover:translate-y-[-2px]">
                                        {/* Card Header - można dodać zdjęcie tła warsztatów w przyszłości */}
                                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-24 rounded-t-xl relative overflow-hidden">
                                            <div className="absolute inset-0 bg-blue-900 opacity-30"></div>
                                            <div className="absolute bottom-0 left-0 w-full p-4">
                                                <div className="flex justify-between items-start">
                                                    <h2 className="text-xl font-bold text-white truncate pr-4">{workshop.name}</h2>
                                                    {workshop.rating !== undefined && renderRating(workshop.rating)}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Card Body */}
                                        <div className="p-4 flex-1 flex flex-col">
                                            {workshop.description && (
                                                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">{workshop.description}</p>
                                            )}
                                            
                                            <div className="mt-auto space-y-2">
                                                {workshop.address && (
                                                    <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                                                        <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                                        <span className="line-clamp-1">{workshop.address}</span>
                                                    </div>
                                                )}
                                                
                                                {workshop.services && workshop.services.length > 0 && (
                                                    <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                                                        <Briefcase className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                                        <span>{workshop.services.length} dostępnych usług</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Card Footer */}
                                        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                                            <div className="flex justify-between items-center">
                                                <div className="text-sm text-gray-500">
                                                    <Calendar className="w-4 h-4 inline mr-1" />
                                                    <span>Sprawdź dostępne terminy</span>
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-blue-600 group-hover:transform group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <p className="text-xl font-medium text-gray-700 dark:text-gray-300">Nie znaleziono żadnych warsztatów pasujących do wyszukiwania.</p>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">Spróbuj zmienić kryteria wyszukiwania.</p>
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm('')}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Wyczyść wyszukiwanie
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}