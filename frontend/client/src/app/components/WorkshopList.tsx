// src/components/WorkshopList.tsx
"use client"; // <-- WAŻNE! To mówi Next.js, że ten komponent jest interaktywny i działa w przeglądarce.

import { useEffect, useState } from "react";
import axios from "axios";
import { Workshop } from "../types/workshop";

// ZMIEŃ PORT NA TEN, NA KTÓRYM DZIAŁA TWOJE API .NET!
const API_URL = "http://localhost:5197/api/workshops"; 

export default function WorkshopList() {
    // Stany komponentu: do przechowywania danych, statusu ładowania i ewentualnych błędów.
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWorkshops = async () => {
            try {
                setLoading(true);
                const response = await axios.get(API_URL);
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
    }, []); // Pusta tablica zależności sprawia, że useEffect uruchomi się tylko raz, po zamontowaniu komponentu.

    if (loading) {
        return <p className="text-center text-gray-500">Ładowanie listy warsztatów...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    return (
        <div className="space-y-4">
            {workshops.length > 0 ? (
                workshops.map((workshop) => (
                    <div key={workshop.id} className="p-4 border rounded-lg shadow-sm">
                        <h2 className="text-xl font-bold">{workshop.name}</h2>
                        <p className="text-gray-700">{workshop.description}</p>
                        {workshop.address && <p className="mt-2 text-sm text-gray-500">{workshop.address}</p>}
                    </div>
                ))
            ) : (
                <p>Nie znaleziono żadnych warsztatów. Może dodaj pierwszy przez Swaggera?</p>
            )}
        </div>
    );
}