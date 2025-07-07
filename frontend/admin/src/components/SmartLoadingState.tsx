import React from 'react';
import { Loader2, AlertCircle, Clock, CheckCircle } from 'lucide-react';

interface SmartLoadingStateProps {
  isLoading: boolean;
  isRateLimited: boolean;
  rateLimitInfo: any;
  error: Error | null;
  children: React.ReactNode;
  loadingText?: string;
  errorText?: string;
}

export const SmartLoadingState: React.FC<SmartLoadingStateProps> = ({
  isLoading,
  isRateLimited,
  rateLimitInfo,
  error,
  children,
  loadingText = 'Ładowanie...',
  errorText = 'Wystąpił błąd'
}) => {
  if (isRateLimited) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-yellow-100 rounded-full p-4 mb-4">
          <Clock className="h-8 w-8 text-yellow-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Limit żądań przekroczony
        </h3>
        <p className="text-gray-600 mb-4">
          Zbyt wiele żądań. Spróbuj ponownie za chwilę.
        </p>
        {rateLimitInfo && (
          <div className="bg-gray-50 rounded-lg p-4 text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Polityka:</span>
              <span className="font-medium">{rateLimitInfo.policy}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Pozostało:</span>
              <span className="font-medium">{rateLimitInfo.remaining}/{rateLimitInfo.limit}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Reset za:</span>
              <span className="font-medium">
                {Math.ceil(rateLimitInfo.retryAfterSeconds / 60)} min
              </span>
            </div>
          </div>
        )}
        <div className="mt-4">
          <div className="animate-pulse text-yellow-600">
            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
            Automatyczne ponowienie...
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">{loadingText}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-red-100 rounded-full p-4 mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {errorText}
        </h3>
        <p className="text-gray-600 mb-4">
          {error.message || 'Wystąpił nieoczekiwany błąd'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

// Komponent dla rate limit statusu (opcjonalny dla debug/admin)
interface RateLimitStatusProps {
  endpoint: string;
  method: string;
  showDetails?: boolean;
}

export const RateLimitStatus: React.FC<RateLimitStatusProps> = ({
  endpoint,
  method,
  showDetails = false
}) => {
  const getPolicyForEndpoint = (endpoint: string, method: string) => {
    if (endpoint.includes('/analytics')) return 'AnalyticsPolicy';
    if (method === 'GET') return 'ReadPolicy';
    if (method === 'POST' && endpoint.includes('/bookings')) return 'CriticalPolicy';
    if (['PUT', 'DELETE', 'PATCH'].includes(method)) return 'WritePolicy';
    return 'ReadPolicy';
  };

  const policy = getPolicyForEndpoint(endpoint, method);
  const limits = {
    AnalyticsPolicy: { limit: 200, window: '1 min' },
    ReadPolicy: { limit: 100, window: '1 min' },
    WritePolicy: { limit: 20, window: '1 min' },
    CriticalPolicy: { limit: 10, window: '1 min' }
  };

  const limit = limits[policy as keyof typeof limits];

  if (!showDetails) {
    return (
      <div className="inline-flex items-center text-xs text-gray-500">
        <CheckCircle className="h-3 w-3 mr-1" />
        {policy}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3 text-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600">Endpoint:</span>
        <span className="font-mono text-xs">{method} {endpoint}</span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600">Polityka:</span>
        <span className="font-medium">{policy}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Limit:</span>
        <span className="font-medium">{limit.limit} żądań/{limit.window}</span>
      </div>
    </div>
  );
}; 