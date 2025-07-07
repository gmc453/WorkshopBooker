"use client";

import React, { useState, useMemo } from 'react';
import { Calendar, Clock, User, CreditCard, MapPin, Star, Phone, Mail, CheckCircle, AlertCircle, X, ArrowLeft } from 'lucide-react';
import { Service } from "../types/workshop";
import { useCreateBooking } from "../hooks/useCreateBooking";
import { useWorkshopSlots } from "../hooks/useWorkshopSlots";
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import { pl } from "date-fns/locale";

type BookingModalProps = {
  service: Service;
  workshopId: string;
  onClose: () => void;
};

const EnhancedBookingFlow = ({ service, workshopId, onClose }: BookingModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    carBrand: '',
    carModel: '',
    notes: ''
  });

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

  // Dostępne daty
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

  // Dostępne godziny dla wybranej daty
  const availableTimes = useMemo(() => {
    return slotsForSelectedDate.map(slot => ({
      time: format(parseISO(slot.startTime), 'HH:mm'),
      slotId: slot.id,
      endTime: format(parseISO(slot.endTime), 'HH:mm')
    }));
  }, [slotsForSelectedDate]);

  const steps = [
    { number: 1, title: "Wybierz usługę", completed: currentStep > 1 },
    { number: 2, title: "Wybierz termin", completed: currentStep > 2 },
    { number: 3, title: "Dane kontaktowe", completed: currentStep > 3 },
    { number: 4, title: "Potwierdzenie", completed: currentStep > 4 }
  ];

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleTimeSelect = (time: string, slotId: string) => {
    setSelectedTime(time);
    setSelectedSlotId(slotId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSlotId) {
      return;
    }

    mutate(
      { 
        serviceId: service.id, 
        slotId: selectedSlotId,
        customerInfo: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          carBrand: customerInfo.carBrand,
          carModel: customerInfo.carModel,
          notes: customerInfo.notes
        }
      },
      {
        onSuccess: () => {
          // Rezerwacja została utworzona pomyślnie
        }
      }
    );
  };

  // Funkcja formatująca datę w przyjazny sposób
  const formatDateFriendly = (date: Date) => {
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
      <div className="bg-white rounded-xl border border-gray-100 shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              {currentStep !== 1 && (
                <button 
                  onClick={prevStep}
                  className="mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Powrót"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
              )}
              <h2 className="text-2xl font-bold text-gray-900">
                Rezerwacja usługi
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Zamknij modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm
                    ${step.completed ? 'bg-green-500 text-white' :
                       currentStep === step.number ? 'bg-blue-500 text-white' :
                       'bg-gray-200 text-gray-600'}
                  `}>
                    {step.completed ? <CheckCircle className="w-5 h-5" /> : step.number}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      step.completed || currentStep === step.number ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-20 h-1 mx-4 ${
                      step.completed ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="min-h-96">
            {/* Step 1: Service Selection */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Wybierz usługę</h2>
                <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">🔧</div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">{service.name}</h3>
                          <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium animate-pulse">
                            Wybrana
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{service.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="ml-1 text-sm text-gray-600">4.8</span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span className="ml-1 text-sm">{service.durationInMinutes} min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{service.price.toFixed(2)} zł</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Date & Time Selection */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Wybierz termin</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Calendar */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                      Wybierz datę
                    </h3>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="grid grid-cols-7 gap-2 text-center">
                        {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'].map(day => (
                          <div key={day} className="font-medium text-gray-500 py-2">{day}</div>
                        ))}
                        {Array.from({length: 31}, (_, i) => i + 1).map(day => {
                          const date = new Date(2025, 0, day);
                          const dateStr = format(date, 'yyyy-MM-dd');
                          const hasSlots = slotsByDate.has(dateStr);
                          const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === dateStr;
                          
                          return (
                            <button
                              key={day}
                              disabled={!hasSlots}
                              className={`p-2 rounded hover:bg-blue-100 transition-colors ${
                                isSelected ? 'bg-blue-500 text-white shadow-lg' : 
                                hasSlots ? 'hover:bg-blue-50' : 'opacity-30 cursor-not-allowed'
                              }`}
                              onClick={() => hasSlots && setSelectedDate(date)}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Time slots */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-green-500" />
                      Dostępne godziny
                    </h3>
                    {selectedDate ? (
                      <div className="grid grid-cols-2 gap-2">
                        {availableTimes.map(({ time, slotId, endTime }) => (
                          <button
                            key={slotId}
                            className={`p-3 border rounded-lg text-center transition-all transform hover:scale-105 ${
                              selectedTime === time ? 'bg-green-500 text-white border-green-500 shadow-lg' : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                            }`}
                            onClick={() => handleTimeSelect(time, slotId)}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>Wybierz datę, aby zobaczyć dostępne godziny</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Customer Info */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <User className="w-6 h-6 mr-2 text-purple-500" />
                  Dane kontaktowe
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Imię i nazwisko *
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Jan Kowalski"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        Telefon *
                      </label>
                      <input
                        type="tel"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="+48 123 456 789"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        Email *
                      </label>
                      <input
                        type="email"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="jan@example.com"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Marka pojazdu
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Toyota"
                        value={customerInfo.carBrand}
                        onChange={(e) => setCustomerInfo({...customerInfo, carBrand: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Model pojazdu
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Corolla"
                        value={customerInfo.carModel}
                        onChange={(e) => setCustomerInfo({...customerInfo, carModel: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dodatkowe uwagi
                      </label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        rows={3}
                        placeholder="Dodatkowe informacje..."
                        value={customerInfo.notes}
                        onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
                  Potwierdzenie rezerwacji
                </h2>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center">
                        <span className="text-2xl mr-2">🔧</span>
                        Usługa:
                      </span>
                      <span className="font-medium">{service.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Data:
                      </span>
                      <span className="font-medium">{selectedDate && formatDateFriendly(selectedDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Godzina:
                      </span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Czas trwania:</span>
                      <span className="font-medium">{service.durationInMinutes} min</span>
                    </div>
                    <hr className="border-gray-300" />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Koszt:</span>
                      <span className="text-blue-600 text-2xl">{service.price.toFixed(2)} zł</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-200">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Ważne informacje:</p>
                        <ul className="mt-1 space-y-1">
                          <li>• Otrzymasz SMS z potwierdzeniem w ciągu 30 minut</li>
                          <li>• Możesz odwołać rezerwację do 24h przed wizytą</li>
                          <li>• Prosimy o punktualne przybycie</li>
                          <li>• W przypadku spóźnienia powyżej 15 min rezerwacja może zostać anulowana</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Błąd */}
                {error && (
                  <div className="mt-4 p-4 border-l-4 border-red-500 bg-red-50 text-red-700 rounded-r-md">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      <p>Wystąpił błąd podczas tworzenia rezerwacji. Spróbuj ponownie.</p>
                    </div>
                  </div>
                )}

                {/* Sukces */}
                {isSuccess && (
                  <div className="mt-4 p-4 border-l-4 border-green-500 bg-green-50 text-green-700 rounded-r-md">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <p>Rezerwacja została pomyślnie utworzona!</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium"
            >
              Wstecz
            </button>
            
            {currentStep === 4 ? (
              <button
                onClick={handleSubmit}
                disabled={isLoading || !selectedSlotId}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg transform hover:scale-105 flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Przetwarzanie...
                  </>
                ) : (
                  'Potwierdź rezerwację'
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={
                  (currentStep === 1) ||
                  (currentStep === 2 && (!selectedDate || !selectedTime)) ||
                  (currentStep === 3 && (!customerInfo.name || !customerInfo.phone || !customerInfo.email))
                }
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg transform hover:scale-105"
              >
                Dalej
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBookingFlow;