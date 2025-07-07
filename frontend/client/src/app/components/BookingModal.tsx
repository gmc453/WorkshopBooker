"use client";

import { useState, useMemo } from "react";
import { Service } from "../types/workshop";
import { useCreateBooking } from "../hooks/useCreateBooking";
import { useWorkshopSlots } from "../hooks/useWorkshopSlots";
import DatePicker, { registerLocale } from "react-datepicker";
import { pl } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { format, isToday, isTomorrow, isSameDay, parseISO, addDays } from "date-fns";
import { X, Calendar, Clock, CheckCircle, Info, ArrowLeft, CreditCard } from 'lucide-react';

registerLocale("pl", pl);

type BookingModalProps = {
  service: Service;
  workshopId: string;
  onClose: () => void;
};

// Interfejs stanu procesu rezerwacji
type BookingStep = 'calendar' | 'time' | 'confirmation';

export default function BookingModal({ service, workshopId, onClose }: BookingModalProps) {
  // Stan procesu rezerwacji
  const [currentStep, setCurrentStep] = useState<BookingStep>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<{startTime: string, endTime: string} | null>(null);
  
  const { mutate, isLoading, error, isSuccess } = useCreateBooking();
  const { data: slots, isLoading: isLoadingSlots } = useWorkshopSlots(workshopId);

  // Grupowanie slotów według dat
  const slotsByDate = useMemo(() => {
    if (!slots) return new Map<string, typeof slots>();

    const grouped = new Map<string, typeof slots>();
    
    slots.forEach(slot => {
      const date = format(parseISO(slot.startTime), 'yyyy-MM-dd');
      
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      
      grouped.get(date)?.push(slot);
    });
    
    return grouped;
  }, [slots]);
  
  // Dostępne daty, na które można dokonać rezerwacji
  const availableDates = useMemo(() => 
    Array.from(slotsByDate.keys()).map(dateStr => parseISO(dateStr)),
    [slotsByDate]
  );
  
  // Sloty dla wybranej daty
  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate || !slots) return [];
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return slotsByDate.get(dateStr) || [];
  }, [selectedDate, slots, slotsByDate]);

  // Obsługa zmiany daty
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      setCurrentStep('time');
    }
  };
  
  // Obsługa wyboru slotu
  const handleSlotSelect = (slotId: string, startTime: string, endTime: string) => {
    setSelectedSlotId(slotId);
    setSelectedSlotInfo({ startTime, endTime });
    setCurrentStep('confirmation');
  };
  
  // Obsługa powrotu do poprzedniego kroku
  const handleBack = () => {
    if (currentStep === 'time') {
      setCurrentStep('calendar');
    } else if (currentStep === 'confirmation') {
      setCurrentStep('time');
      setSelectedSlotId(null);
      setSelectedSlotInfo(null);
    }
  };

  // Obsługa wysłania rezerwacji
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSlotId) {
      return;
    }

    mutate(
      { serviceId: service.id, slotId: selectedSlotId },
      {
        onSuccess: () => {
          // Nie zamykamy okna od razu, zamiast tego pokazujemy potwierdzenie
        }
      }
    );
  };
  
  // Funkcja wyświetlająca nagłówek zależnie od kroku
  const renderStepHeader = () => {
    switch(currentStep) {
      case 'calendar':
        return 'Wybierz datę wizyty';
      case 'time':
        return 'Wybierz godzinę wizyty';
      case 'confirmation':
        return isSuccess ? 'Potwierdzenie rezerwacji' : 'Potwierdź rezerwację';
    }
  };
  
  // Funkcja formatująca datę w przyjazny sposób
  const formatDateFriendly = (dateStr: string) => {
    const date = parseISO(dateStr);
    
    if (isToday(date)) {
      return 'Dzisiaj';
    } else if (isTomorrow(date)) {
      return 'Jutro';
    } else {
      return format(date, 'EEEE, d MMMM', { locale: pl });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xl p-6 w-full max-w-lg transform transition-all">
        {/* Nagłówek */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center">
            {currentStep !== 'calendar' && (
              <button 
                onClick={handleBack}
                className="mr-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Powrót"
              >
                <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            )}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {renderStepHeader()}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Zamknij modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informacje o usłudze - stały element widoczny na każdym kroku */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{service.name}</h3>
          <div className="flex justify-between">
            <div className="flex items-center space-x-2 text-primary font-medium text-lg">
              <CreditCard className="w-5 h-5" />
              <span>{service.price.toFixed(2)} zł</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              <span>Czas trwania: {service.durationInMinutes} min</span>
            </div>
          </div>
        </div>

        {/* Błąd */}
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

        {/* Treść zależna od kroku */}
        <div className="mb-6">
          {/* Krok 1: Wybór daty */}
          {currentStep === 'calendar' && (
            <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              {isLoadingSlots ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-gray-200"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">Ładowanie dostępnych terminów...</p>
                </div>
              ) : availableDates.length === 0 ? (
                <div className="text-center py-8 text-gray-600 dark:text-gray-300">
                  <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="mb-1 font-medium">Brak dostępnych terminów</p>
                  <p className="text-sm">Niestety, nie ma dostępnych terminów dla tej usługi.</p>
                </div>
              ) : (
                <DatePicker
                  inline
                  locale="pl"
                  selected={selectedDate}
                  onChange={handleDateChange}
                  minDate={new Date()}
                  maxDate={addDays(new Date(), 60)}
                  includeDates={availableDates}
                  highlightDates={availableDates}
                  calendarClassName="w-full"
                  dayClassName={(date) => {
                    if (!date) return "";
                    const hasSlots = availableDates.some((d) => isSameDay(date, d));
                    if (selectedDate && isSameDay(date, selectedDate)) return "bg-blue-500 text-white rounded-full";
                    if (hasSlots) return "bg-blue-100 text-blue-800 font-medium rounded-full hover:bg-blue-200";
                    return "";
                  }}
                  renderDayContents={(day, date) => {
                    if (!date) return day;
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const slotsForDate = slotsByDate.get(dateStr);
                    
                    return (
                      <div className="relative flex flex-col items-center justify-center">
                        <span>{day}</span>
                        {slotsForDate && slotsForDate.length > 0 && (
                          <span className="absolute bottom-0 text-xs font-medium text-blue-700">
                            {slotsForDate.length}
                          </span>
                        )}
                      </div>
                    );
                  }}
                />
              )}
              
              <div className="mt-4 flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <Info className="w-4 h-4" />
                <p className="text-xs">
                  Wybierz datę, aby zobaczyć dostępne godziny. Liczba pod datą wskazuje ilość dostępnych terminów.
                </p>
              </div>
            </div>
          )}
          
          {/* Krok 2: Wybór godziny */}
          {currentStep === 'time' && selectedDate && (
            <div>
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-300 font-medium">
                  <Calendar className="inline-block w-5 h-5 mr-2 align-middle" />
                  <span className="align-middle">{formatDateFriendly(format(selectedDate, 'yyyy-MM-dd'))}</span>
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {slotsForSelectedDate.length === 0 ? (
                  <div className="col-span-2 text-center py-6 text-gray-500">
                    <Clock className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                    <p>Brak dostępnych godzin na wybraną datę.</p>
                  </div>
                ) : (
                  slotsForSelectedDate.map(slot => (
                    <button
                      type="button"
                      key={slot.id}
                      onClick={() => handleSlotSelect(slot.id, slot.startTime, slot.endTime)}
                      className="p-3 border rounded-lg flex flex-col items-center justify-center transition-colors hover:bg-blue-50 hover:border-blue-200"
                    >
                      <span className="text-lg font-medium">
                        {format(parseISO(slot.startTime), "HH:mm")}
                      </span>
                      <span className="text-xs text-gray-500">
                        do {format(parseISO(slot.endTime), "HH:mm")}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
          
          {/* Krok 3: Potwierdzenie rezerwacji */}
          {currentStep === 'confirmation' && selectedSlotInfo && (
            <>
              {isSuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Rezerwacja potwierdzona!</h3>
                  <p className="text-gray-600 mb-6">
                    Twoja rezerwacja została pomyślnie utworzona. Szczegóły zostały wysłane na Twój adres e-mail.
                  </p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Data:</span>
                      <span className="font-medium">{formatDateFriendly(selectedSlotInfo.startTime)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Godzina:</span>
                      <span className="font-medium">
                        {format(parseISO(selectedSlotInfo.startTime), "HH:mm")} - {format(parseISO(selectedSlotInfo.endTime), "HH:mm")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cena:</span>
                      <span className="font-medium">{service.price.toFixed(2)} zł</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Zamknij
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 mb-6">
                    <h4 className="font-medium mb-4">Podsumowanie rezerwacji</h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Usługa:</span>
                        <span className="font-medium">{service.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Data:</span>
                        <span className="font-medium">{formatDateFriendly(selectedSlotInfo.startTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Godzina:</span>
                        <span className="font-medium">
                          {format(parseISO(selectedSlotInfo.startTime), "HH:mm")} - {format(parseISO(selectedSlotInfo.endTime), "HH:mm")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Czas trwania:</span>
                        <span className="font-medium">{service.durationInMinutes} min</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between">
                        <span className="font-semibold">Do zapłaty:</span>
                        <span className="font-bold text-lg">{service.price.toFixed(2)} zł</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-6">
                    Klikając przycisk "Zatwierdź rezerwację" zgadzasz się z warunkami rezerwacji i polityką anulowania.
                  </p>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Wróć
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !selectedSlotId}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed flex items-center"
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
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}