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
                <input
                    type="text"
                    placeholder="Szukaj warsztatów..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {loading ? (
                <p className="text-center text-gray-500">Ładowanie listy warsztatów...</p>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : (
                <div className="space-y-4">
                    {workshops.length > 0 ? (
                        workshops.map((workshop) => (
                            <Link href={`/workshops/${workshop.id}`} key={workshop.id} className="block">
                                <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                    <h2 className="text-xl font-bold">{workshop.name}</h2>
                                    <p className="text-gray-700">{workshop.description}</p>
                                    {workshop.address && <p className="mt-2 text-sm text-gray-500">{workshop.address}</p>}
                                    <p className="mt-2 text-sm text-blue-500">Zobacz szczegóły i usługi →</p>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p>Nie znaleziono żadnych warsztatów pasujących do wyszukiwania.</p>
                    )}
                </div>
            )}
        </div>
    );
}