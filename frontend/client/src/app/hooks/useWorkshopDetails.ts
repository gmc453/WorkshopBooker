"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Workshop } from "../types/workshop";

// ✅ POPRAWKA: Port 5000 zgodnie z docker-compose.yml
const API_URL = "http://localhost:5000/api/workshops";

export function useWorkshopDetails(id: string) {
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkshopDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/${id}`);
        setWorkshop(response.data);
        setError(null);
      } catch (err: unknown) {
        setError(
          "Nie udało się pobrać szczegółów warsztatu. Sprawdź, czy API jest uruchomione."
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchWorkshopDetails();
    }
  }, [id]);

  return { workshop, loading, error };
} 