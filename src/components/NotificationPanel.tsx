import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Bell, AlertTriangle, Info, CheckCircle, XCircle, X, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();

  // Auto-close after 4 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="text-orange-500" size={16} />;
      case 'error':
        return <XCircle className="text-red-500" size={16} />;
      case 'success':
        return <CheckCircle className="text-green-500" size={16} />;
      default:
        return <Info className="text-blue-500" size={16} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overscrollBehavior: 'none',
          touchAction: 'none',
        }}
      />
      
      {/* Panel */}
      <motion.div 
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 border-l"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          overscrollBehavior: 'contain',
        }}
        onClick={onClose}
      >
        <div 
          className="flex flex-col h-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Bell size={20} />
              <h2 className="text-lg font-semibold">Notifications</h2>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="flex gap-2 p-4 border-b">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark All Read
              </Button>
            </div>
          )}

          {/* Notifications List */}
          <ScrollArea className="flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Bell className="text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No notifications</h3>
                <p className="text-sm text-gray-500">You're all caught up!</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {notifications.map((notification, index) => (
                  <Card 
                    key={notification.id}
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                      !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium text-gray-900 leading-tight">
                            {notification.title}
                          </h4>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="p-1 h-6 w-6 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearNotification(notification.id);
                            }}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getTypeColor(notification.type)}`}
                          >
                            {notification.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </span>
                          {notification.source && (
                            <span className="text-xs text-gray-400">
                              • {notification.source}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </motion.div>
    </>
  );
};

export default NotificationPanel; 