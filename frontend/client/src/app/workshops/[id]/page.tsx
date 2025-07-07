"use client";

import { useState, useEffect } from "react";
import { useWorkshopDetails } from "../../hooks/useWorkshopDetails";
import { useParams, useRouter } from "next/navigation";
import { Service } from "../../types/workshop";
import { EnhancedBookingModal } from "../../components/EnhancedBookingModal";
import { useAuth } from "../../../context/AuthContext";
import { MapPin, Clock, CreditCard, ArrowLeft, Star, Phone, Mail, Globe, ChevronRight, Briefcase } from "lucide-react";
import Link from "next/link";

export default function WorkshopDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { workshop, loading, error } = useWorkshopDetails(id);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Efekt do przewijania do góry przy wczytywaniu
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
  
  // Pomocnicza funkcja do generowania gwiazdek oceny
  const renderRating = (rating: number | undefined) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star 
            key={index} 
            className={`w-5 h-5 ${index < Math.round(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
          />
        ))}
        <span className="ml-2 text-lg font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Ładowanie szczegółów warsztatu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 font-semibold text-lg mb-2">Wystąpił błąd</h2>
          <p className="text-red-600">{error}</p>
          <Link href="/" className="inline-flex items-center mt-4 text-blue-600 hover:underline">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Wróć do listy warsztatów
          </Link>
        </div>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-yellow-800 font-semibold text-lg mb-2">Nie znaleziono warsztatu</h2>
          <p className="text-yellow-700">Niestety, nie znaleźliśmy warsztatu o podanym identyfikatorze.</p>
          <Link href="/" className="inline-flex items-center mt-4 text-blue-600 hover:underline">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Wróć do listy warsztatów
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Ścieżka nawigacyjna */}
      <div className="bg-gray-50 dark:bg-gray-800 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Strona główna
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="font-medium text-gray-900 dark:text-white">{workshop.name}</span>
          </div>
        </div>
      </div>
      
      {/* Header warsztatu */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {workshop.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-600 dark:text-gray-300">
                {workshop.rating && renderRating(workshop.rating)}
                
                {workshop.address && (
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-1 text-gray-500" />
                    <span>{workshop.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lewa kolumna - informacje i opis */}
          <div className="lg:col-span-1 space-y-6">
            {/* Karta informacyjna */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Informacje o warsztacie
              </h2>
              
              {workshop.address && (
                <div className="flex items-start py-3 border-b border-gray-100 dark:border-gray-700">
                  <MapPin className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Adres</div>
                    <div className="font-medium text-gray-900 dark:text-white">{workshop.address}</div>
                  </div>
                </div>
              )}
              
              {/* Przykładowe informacje kontaktowe - można dodać do obiektu warsztatu */}
              <div className="flex items-start py-3 border-b border-gray-100 dark:border-gray-700">
                <Phone className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Telefon</div>
                  <div className="font-medium text-gray-900 dark:text-white">+48 123 456 789</div>
                </div>
              </div>
              
              <div className="flex items-start py-3 border-b border-gray-100 dark:border-gray-700">
                <Mail className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</div>
                  <div className="font-medium text-gray-900 dark:text-white">kontakt@warsztat.pl</div>
                </div>
              </div>
              
              <div className="flex items-start py-3">
                <Globe className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Strona internetowa</div>
                  <a href="#" className="font-medium text-blue-600 hover:underline">www.warsztat.pl</a>
                </div>
              </div>
            </div>
            
            {/* Opis */}
            {workshop.description && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  O warsztacie
                </h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{workshop.description}</p>
              </div>
            )}
          </div>
          
          {/* Prawa kolumna - usługi */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Dostępne usługi
                </h2>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Briefcase className="w-5 h-5 mr-2" />
                  <span>{workshop.services?.length || 0} usług</span>
                </div>
              </div>
              
              {workshop.services && workshop.services.length > 0 ? (
                <div className="space-y-6">
                  {workshop.services.map((service) => (
                    <div
                      key={service.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:border-blue-300 transition-colors bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {service.name}
                          </h3>
                          
                          {service.description && (
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                              {service.description}
                            </p>
                          )}
                          
                          <div className="mt-3 flex flex-wrap gap-3">
                            <div className="flex items-center text-gray-700 dark:text-gray-300">
                              <Clock className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                              <span>{service.durationInMinutes} min</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center md:items-end space-y-3">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {service.price.toFixed(2)} zł
                          </div>
                          
                          <button 
                            onClick={() => handleBookingClick(service)}
                            className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            <span>Zarezerwuj</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <p className="text-lg font-medium">
                    Ten warsztat nie oferuje jeszcze żadnych usług.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isBookingModalOpen && selectedService && (
        <EnhancedBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          workshopId={id}
          serviceId={selectedService.id}
          serviceName={selectedService.name}
          onGoHome={() => router.push('/')}
        />
      )}
    </>
  );
} 