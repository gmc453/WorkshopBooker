"use client";

import React, { useState } from 'react';
import { CheckCircle, Calendar, Clock, Mail, ArrowRight, Home, Download, Printer, Star, Share2, Plus } from 'lucide-react';
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
  const [rating, setRating] = useState<number>(0);
  const [showRating, setShowRating] = useState(false);

  // Generate booking reference number
  const bookingReference = `BK-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

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

  const formatDateForICS = (dateString: string) => {
    return new Date(dateString).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const downloadCalendar = () => {
    const startDate = formatDateForICS(selectedSlot.startTime);
    const endDate = formatDateForICS(selectedSlot.endTime);
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//WorkshopBooker//Booking//PL',
      'BEGIN:VEVENT',
      `UID:${bookingReference}@workshopbooker.com`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:Rezerwacja warsztatu - ${formData.customerName}`,
      `DESCRIPTION:Rezerwacja warsztatu dla ${formData.customerName}. Email: ${formData.customerEmail}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rezerwacja-${bookingReference}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const printConfirmation = () => {
    window.print();
  };

  const shareBooking = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Moja rezerwacja warsztatu',
        text: `Zarezerwowałem termin w warsztacie na ${formatDate(selectedSlot.startTime)} o ${formatTime(selectedSlot.startTime)}`,
        url: window.location.href
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(`Moja rezerwacja warsztatu: ${formatDate(selectedSlot.startTime)} o ${formatTime(selectedSlot.startTime)}`);
      alert('Link skopiowany do schowka!');
    }
  };

  const handleRating = (stars: number) => {
    setRating(stars);
    setShowRating(false);
    // Tutaj można dodać API call do zapisania oceny
    console.log(`Ocena warsztatu: ${stars} gwiazdek`);
  };

  return (
    <div className="text-center space-y-6">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-full p-6 shadow-lg">
          <CheckCircle className="h-16 w-16 text-white" />
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Rezerwacja potwierdzona!</h2>
        <p className="text-gray-600 text-lg">
          Twoja rezerwacja została pomyślnie utworzona. Otrzymasz email z potwierdzeniem.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 inline-block">
          <p className="text-sm font-medium text-blue-800">
            Numer rezerwacji: <span className="font-mono text-blue-900">{bookingReference}</span>
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={downloadCalendar}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Dodaj do kalendarza</span>
        </button>
        
        <button
          onClick={printConfirmation}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Printer className="h-4 w-4" />
          <span>Drukuj potwierdzenie</span>
        </button>
        
        <button
          onClick={shareBooking}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Share2 className="h-4 w-4" />
          <span>Udostępnij</span>
        </button>
      </div>

      {/* Booking Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-md mx-auto shadow-sm">
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

      {/* Rating Prompt */}
      {!showRating && rating === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
          <h4 className="font-medium text-yellow-900 mb-2">Oceń warsztat</h4>
          <p className="text-sm text-yellow-800 mb-3">
            Jak oceniasz swoje doświadczenie z rezerwacją?
          </p>
          <div className="flex justify-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                className="text-yellow-400 hover:text-yellow-500 transition-colors"
              >
                <Star className="h-6 w-6" />
              </button>
            ))}
          </div>
        </div>
      )}

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
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 shadow-lg"
        >
          <Plus className="h-4 w-4" />
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