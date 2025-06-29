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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xl p-6 w-full max-w-md transform transition-all">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Rezerwacja usługi</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Zamknij modal"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-5 h-5"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{service.name}</h3>
          <div className="flex items-center space-x-2 text-primary font-medium text-lg">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-5 h-5"
            >
              <path d="M20.91 8.84L8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a1.93 1.93 0 0 0-.98 1.67v13.73a1.93 1.93 0 0 0 .98 1.68L6.75 23a1.93 1.93 0 0 0 1.81 0L20.91 16.4a1.93 1.93 0 0 0 .98-1.68V10.51a1.93 1.93 0 0 0-.98-1.67z"></path>
              <path d="M16.01 12.48V6.5a1.5 1.5 0 0 0-1.5-1.5H9.5a1.5 1.5 0 0 0-1.5 1.5v5.98c0 .83.67 1.5 1.5 1.5h5.01a1.5 1.5 0 0 0 1.5-1.5z"></path>
              <circle cx="6" cy="12" r="1"></circle>
              <circle cx="18" cy="12" r="1"></circle>
            </svg>
            <span>{service.price.toFixed(2)} zł</span>
          </div>
          <div className="mt-2 flex items-center text-gray-600 dark:text-gray-300 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 mr-1"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Czas trwania: {service.durationInMinutes} min</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-r-md">
            <div className="flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="w-5 h-5 mr-2" 
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p>Wystąpił błąd podczas tworzenia rezerwacji. Spróbuj ponownie.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="bookingDateTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Wybierz datę i godzinę
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-gray-400"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <input
                type="datetime-local"
                id="bookingDateTime"
                value={bookingDateTime}
                onChange={(e) => setBookingDateTime(e.target.value)}
                min={minDate}
                required
                className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isLoading || !bookingDateTime}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <svg 
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Przetwarzanie...
                </>
              ) : "Zatwierdź rezerwację"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 