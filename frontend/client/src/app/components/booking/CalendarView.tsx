"use client";

import React from 'react';
import { Calendar, Clock, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { Slot } from '../../../hooks/useBookingFlow';

interface CalendarViewProps {
  availableSlots: Slot[];
  nextAvailableSlot: Slot | null;
  quickSlots: Slot[];
  isLoadingSlots: boolean;
  onSelectSlot: (slot: Slot) => void;
  onQuickBook: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  availableSlots,
  nextAvailableSlot,
  quickSlots,
  isLoadingSlots,
  onSelectSlot,
  onQuickBook
}) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Dzisiaj';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Jutro';
    } else {
      return date.toLocaleDateString('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }
  };

  const groupSlotsByDate = (slots: Slot[]) => {
    return slots.reduce((groups, slot) => {
      const date = new Date(slot.startTime).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(slot);
      return groups;
    }, {} as Record<string, Slot[]>);
  };

  const available = availableSlots.filter(s => s.isAvailable);
  const groupedSlots = groupSlotsByDate(available);

  if (isLoadingSlots) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Ładowanie dostępnych terminów...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Booking Section */}
      {nextAvailableSlot && nextAvailableSlot.isAvailable && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 rounded-full p-2">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Szybka rezerwacja</h3>
                <p className="text-sm text-gray-600">
                  Najbliższy dostępny termin: {formatDate(nextAvailableSlot.startTime)} o {formatTime(nextAvailableSlot.startTime)}
                </p>
              </div>
            </div>
            <button
              onClick={onQuickBook}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Zap className="h-4 w-4" />
              <span>Zarezerwuj teraz</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Slots */}
      {quickSlots && quickSlots.filter(s => s.isAvailable).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Najbliższe terminy
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickSlots.filter(s => s.isAvailable).map((slot) => (
              <button
                key={slot.id}
                onClick={() => onSelectSlot(slot)}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all text-left"
              >
                <div className="font-medium text-gray-900">
                  {formatDate(slot.startTime)}
                </div>
                <div className="text-sm text-gray-600">
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Calendar View */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Kalendarz terminów
        </h3>
        
        {Object.keys(groupedSlots).length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Brak dostępnych terminów</h3>
            <p className="text-gray-600">Sprawdź ponownie później lub skontaktuj się z warsztatem.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSlots).map(([date, slots]) => (
              <div key={date} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="font-medium text-gray-900">
                    {formatDate(slots[0].startTime)}
                  </h4>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {slots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => onSelectSlot(slot)}
                        className={`bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 rounded-lg p-3 transition-all text-center ${!slot.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!slot.isAvailable}
                        title={!slot.isAvailable ? 'Termin niedostępny' : ''}
                      >
                        <div className="font-medium text-blue-900">
                          {formatTime(slot.startTime)}
                        </div>
                        <div className="text-xs text-blue-700 mt-1">
                          {formatTime(slot.endTime)}
                        </div>
                        {!slot.isAvailable && (
                          <div className="text-xs text-red-500 mt-2">Niedostępny</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 