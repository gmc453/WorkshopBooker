"use client";

import React from 'react';
import { CheckCircle, Calendar, Clock, Mail, ArrowRight, Home } from 'lucide-react';
import { Slot, BookingFormData } from '../../../hooks/useBookingFlow';

interface ConfirmationViewProps {
  selectedSlot: Slot;
  formData: BookingFormData;
  onReset: () => void;
  onGoHome: () => void;
}

export const ConfirmationView: React.FC<ConfirmationViewProps> = ({
  selectedSlot,
  formData,
  onReset,
  onGoHome
}) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="text-center space-y-6">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="bg-green-100 rounded-full p-4">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Rezerwacja potwierdzona!</h2>
        <p className="text-gray-600">
          Twoja rezerwacja została pomyślnie utworzona. Otrzymasz email z potwierdzeniem.
        </p>
      </div>

      {/* Booking Details */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Szczegóły rezerwacji</h3>
        
        <div className="space-y-4 text-left">
          {/* Date and Time */}
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Data i godzina</p>
              <p className="text-sm text-gray-600">
                {formatDate(selectedSlot.startTime)}
              </p>
              <p className="text-sm text-gray-600">
                {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
              </p>
            </div>
          </div>

          {/* Customer Name */}
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
              <Mail className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Klient</p>
              <p className="text-sm text-gray-600">{formData.customerName}</p>
              <p className="text-sm text-gray-600">{formData.customerEmail}</p>
              {formData.customerPhone && (
                <p className="text-sm text-gray-600">{formData.customerPhone}</p>
              )}
            </div>
          </div>

          {/* Notes if provided */}
          {formData.notes && (
            <div className="flex items-start space-x-3">
              <div className="bg-purple-100 rounded-full p-2 flex-shrink-0">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Dodatkowe informacje</p>
                <p className="text-sm text-gray-600">{formData.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
        <h4 className="font-medium text-blue-900 mb-2">Co dalej?</h4>
        <ul className="text-sm text-blue-800 space-y-1 text-left">
          <li>• Sprawdź email z potwierdzeniem rezerwacji</li>
          <li>• Przyjdź 10 minut przed umówionym terminem</li>
          <li>• Zabierz ze sobą dokument tożsamości</li>
          <li>• W razie pytań skontaktuj się z warsztatem</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onReset}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <ArrowRight className="h-4 w-4" />
          <span>Nowa rezerwacja</span>
        </button>
        
        <button
          onClick={onGoHome}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <Home className="h-4 w-4" />
          <span>Powrót do strony głównej</span>
        </button>
      </div>

      {/* Additional Info */}
      <div className="text-xs text-gray-500 max-w-md mx-auto">
        <p>
          Jeśli nie otrzymasz emaila w ciągu 5 minut, sprawdź folder spam lub skontaktuj się z obsługą klienta.
        </p>
      </div>
    </div>
  );
}; 