"use client";

import { useState } from "react";
import { useWorkshopDetails } from "../../hooks/useWorkshopDetails";
import { useParams, useRouter } from "next/navigation";
import { Service } from "../../types/workshop";
import BookingModal from "../../components/BookingModal";
import { useAuth } from "../../../context/AuthContext";

export default function WorkshopDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { workshop, loading, error } = useWorkshopDetails(id);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleBookingClick = (service: Service) => {
    if (!isAuthenticated) {
      // Jeśli użytkownik nie jest zalogowany, przekieruj go na stronę logowania
      router.push("/login");
      return;
    }

    // Jeśli użytkownik jest zalogowany, otwórz modal rezerwacji
    setSelectedService(service);
    setIsBookingModalOpen(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <p className="text-center text-gray-500">Ładowanie szczegółów warsztatu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <p className="text-center text-red-500">{error}</p>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="container mx-auto p-8">
        <p className="text-center text-red-500">Nie znaleziono warsztatu.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{workshop.name}</h1>
        <p className="text-gray-700 mb-4">{workshop.description}</p>
        {workshop.address && (
          <p className="text-gray-500">
            <span className="font-semibold">Adres:</span> {workshop.address}
          </p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Dostępne usługi</h2>
        {workshop.services && workshop.services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workshop.services.map((service) => (
              <div
                key={service.id}
                className="border rounded-lg p-4 shadow-sm"
              >
                <h3 className="text-xl font-semibold">{service.name}</h3>
                {service.description && (
                  <p className="text-gray-600 my-2">{service.description}</p>
                )}
                <div className="flex justify-between items-center mt-4">
                  <p className="font-bold text-lg">
                    {service.price.toFixed(2)} zł
                  </p>
                  <p className="text-gray-500">
                    {service.durationInMinutes} min
                  </p>
                </div>
                <button 
                  onClick={() => handleBookingClick(service)}
                  className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Zarezerwuj
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            Ten warsztat nie oferuje jeszcze żadnych usług.
          </p>
        )}
      </div>

      {isBookingModalOpen && selectedService && (
        <BookingModal
          service={selectedService}
          workshopId={id}
          onClose={() => setIsBookingModalOpen(false)}
        />
      )}
    </div>
  );
} 