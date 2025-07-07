import React from 'react';
import { ArrowLeft, User, Mail, Phone, FileText, Calendar, Clock } from 'lucide-react';
import { Slot, BookingFormData } from '../../../hooks/useBookingFlow';

interface FormViewProps {
  selectedSlot: Slot;
  formData: BookingFormData;
  isFormValid: boolean;
  isProcessing: boolean;
  error: string | null;
  onUpdateFormData: (field: keyof BookingFormData, value: string) => void;
  onSubmit: () => void;
  onGoBack: () => void;
}

export const FormView: React.FC<FormViewProps> = ({
  selectedSlot,
  formData,
  isFormValid,
  isProcessing,
  error,
  onUpdateFormData,
  onSubmit,
  onGoBack
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
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onGoBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Powrót do kalendarza</span>
        </button>
      </div>

      {/* Selected Slot Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 rounded-full p-2">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Wybrany termin</h3>
            <p className="text-sm text-gray-600">
              {formatDate(selectedSlot.startTime)} o {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Dane rezerwacji</h3>
        
        <div className="space-y-4">
          {/* Customer Name */}
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
              Imię i nazwisko *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="customerName"
                value={formData.customerName}
                onChange={(e) => onUpdateFormData('customerName', e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Wprowadź imię i nazwisko"
                required
              />
            </div>
          </div>

          {/* Customer Email */}
          <div>
            <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Adres email *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="customerEmail"
                value={formData.customerEmail}
                onChange={(e) => onUpdateFormData('customerEmail', e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Wprowadź adres email"
                required
              />
            </div>
          </div>

          {/* Customer Phone */}
          <div>
            <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
              Numer telefonu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="customerPhone"
                value={formData.customerPhone}
                onChange={(e) => onUpdateFormData('customerPhone', e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Wprowadź numer telefonu (opcjonalnie)"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Dodatkowe informacje
            </label>
            <div className="relative">
              <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => onUpdateFormData('notes', e.target.value)}
                rows={3}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Dodatkowe informacje lub uwagi (opcjonalnie)"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button
            onClick={onSubmit}
            disabled={!isFormValid || isProcessing}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isFormValid && !isProcessing
                ? 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                : 'bg-gray-300 cursor-not-allowed'
            } transition-colors`}
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Przetwarzanie...</span>
              </div>
            ) : (
              'Potwierdź rezerwację'
            )}
          </button>
        </div>

        {/* Form validation info */}
        <div className="mt-4 text-sm text-gray-600">
          <p>* Pola wymagane</p>
          <p>Po potwierdzeniu rezerwacji otrzymasz email z potwierdzeniem.</p>
        </div>
      </div>
    </div>
  );
}; 