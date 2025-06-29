"use client";

import { useState } from "react";
import { Service } from "../types/workshop";
import { useCreateBooking } from "../hooks/useCreateBooking";

type BookingModalProps = {
  service: Service;
  onClose: () => void;
};

export default function BookingModal({ service, onClose }: BookingModalProps) {
  const [bookingDateTime, setBookingDateTime] = useState("");
  const { mutate, isLoading, error } = useCreateBooking();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingDateTime) {
      return;
    }

    mutate(
      { serviceId: service.id, bookingDateTime: new Date(bookingDateTime).toISOString() },
      {
        onSuccess: () => {
          onClose();
          // Można by tu dodać toast/powiadomienie o sukcesie
        }
      }
    );
  };

  // Obliczamy minimalną datę (dzisiaj)
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const minDate = today.toISOString().slice(0, 16);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Rezerwacja usługi</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="font-semibold">{service.name}</p>
          <p className="text-gray-600">{service.price.toFixed(2)} zł</p>
          <p className="text-sm text-gray-500">Czas trwania: {service.durationInMinutes} min</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            Wystąpił błąd podczas tworzenia rezerwacji. Spróbuj ponownie.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="bookingDateTime" className="block text-sm font-medium text-gray-700 mb-1">
              Wybierz datę i godzinę
            </label>
            <input
              type="datetime-local"
              id="bookingDateTime"
              value={bookingDateTime}
              onChange={(e) => setBookingDateTime(e.target.value)}
              min={minDate}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isLoading || !bookingDateTime}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isLoading ? "Przetwarzanie..." : "Zatwierdź rezerwację"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 