"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useMyBookings, Booking } from "../hooks/useMyBookings";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export default function MyBookingsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { data: bookings, isLoading, error } = useMyBookings();

  // Przekieruj na stronę logowania, jeśli użytkownik nie jest zalogowany
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // Nie renderuj nic, jeśli użytkownik nie jest zalogowany
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Moje rezerwacje</h1>
        <p className="text-center text-gray-500">Ładowanie rezerwacji...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Moje rezerwacje</h1>
        <p className="text-center text-red-500">
          Wystąpił błąd podczas pobierania rezerwacji. Spróbuj ponownie później.
        </p>
      </div>
    );
  }

  // Funkcja pomocnicza do mapowania statusu rezerwacji
  const getStatusText = (status: number): string => {
    switch (status) {
      case 0: return "Oczekująca";
      case 1: return "Potwierdzona";
      case 2: return "Zakończona";
      case 3: return "Anulowana";
      default: return "Nieznany";
    }
  };

  // Funkcja pomocnicza do określania koloru statusu
  const getStatusColor = (status: number): string => {
    switch (status) {
      case 0: return "bg-yellow-100 text-yellow-800";
      case 1: return "bg-green-100 text-green-800";
      case 2: return "bg-blue-100 text-blue-800";
      case 3: return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Moje rezerwacje</h1>

      {bookings && bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking: Booking) => (
            <div
              key={booking.id}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{booking.serviceName}</h2>
                  {booking.workshopName && (
                    <p className="text-gray-600">{booking.workshopName}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {format(new Date(booking.bookingDateTime), "PPpp", { locale: pl })}
                  </p>
                  {booking.durationInMinutes && (
                    <p className="text-sm text-gray-500">
                      Czas trwania: {booking.durationInMinutes} min
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{booking.servicePrice.toFixed(2)} zł</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}
                  >
                    {getStatusText(booking.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          Nie masz jeszcze żadnych rezerwacji.
        </p>
      )}
    </div>
  );
} 