import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  autoDismiss?: boolean;
  duration?: number;
}

interface AnalyticsNotificationsProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  maxNotifications?: number;
}

export const AnalyticsNotifications: React.FC<AnalyticsNotificationsProps> = ({
  notifications,
  onDismiss,
  maxNotifications = 3
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setVisibleNotifications(notifications.slice(0, maxNotifications));
  }, [notifications, maxNotifications]);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'warning':
        return 'text-yellow-800';
      case 'error':
        return 'text-red-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`max-w-sm w-full p-4 rounded-lg border shadow-lg transition-all duration-300 ${getBackgroundColor(notification.type)}`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${getTextColor(notification.type)}`}>
                {notification.title}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {notification.message}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {notification.timestamp.toLocaleTimeString('pl-PL')}
              </div>
            </div>
            <div className="flex-shrink-0 ml-3">
              <button
                onClick={() => onDismiss(notification.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsNotifications; 