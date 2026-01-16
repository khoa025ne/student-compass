import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle2, AlertTriangle, Info, AlertCircle, GraduationCap, TrendingUp, Award } from 'lucide-react';
import { Button } from './button';
import { GlassCard } from './glass-card';
import { cn } from '@/lib/utils';
import { useSignalRNotifications } from '@/hooks/use-signalr-notifications';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { Notification } from '@/types';
import { useNavigate } from 'react-router-dom';

export function NotificationBell() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // SignalR hook
  const { isConnected, notifications: realtimeNotifications } = useSignalRNotifications();

  // Fetch initial notifications
  useEffect(() => {
    if (user?.userId) {
      fetchNotifications();
    }
  }, [user?.userId]);

  // Handle realtime notifications
  useEffect(() => {
    if (realtimeNotifications.length > 0) {
      setNotifications(prev => {
        const existingIds = new Set(prev.map(n => n.notificationId));
        const newNotifications = realtimeNotifications.filter(
          n => !existingIds.has(n.notificationId)
        );
        return [...newNotifications, ...prev].slice(0, 10);
      });
      
      // Update unread count
      const newUnread = realtimeNotifications.filter(n => !n.isRead).length;
      setUnreadCount(prev => prev + newUnread);
    }
  }, [realtimeNotifications]);

  const fetchNotifications = async () => {
    try {
      const studentId = user?.userId || 0;
      if (studentId === 0) return;
      
      const data = await apiClient.getNotificationsForStudent(studentId);
      setNotifications(data.slice(0, 10));
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'warning':
      case 'Warning':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'ScoreUpdate':
        return <GraduationCap className="w-4 h-4 text-primary" />;
      case 'Achievement':
        return <Award className="w-4 h-4 text-yellow-500" />;
      case 'LearningPath':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'Info':
      case 'info':
      default:
        return <Info className="w-4 h-4 text-primary" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  const markAsRead = async (id: number) => {
    try {
      await apiClient.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.notificationId === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate('/notifications');
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
        {isConnected && (
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500" />
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 z-50"
            >
              <GlassCard className="p-0 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                  <div>
                    <h3 className="font-semibold">Thông báo</h3>
                    <p className="text-xs text-muted-foreground">
                      {unreadCount > 0 ? `${unreadCount} chưa đọc` : 'Đã đọc tất cả'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Chưa có thông báo</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <motion.div
                        key={notification.notificationId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(
                          "p-3 border-b border-border/30 hover:bg-muted/50 cursor-pointer transition-colors",
                          !notification.isRead && "bg-primary/5"
                        )}
                        onClick={() => {
                          if (!notification.isRead) {
                            markAsRead(notification.notificationId);
                          }
                        }}
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getTypeIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium text-sm truncate">
                                {notification.title}
                              </p>
                              {!notification.isRead && (
                                <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-border/50">
                  <Button
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={handleViewAll}
                  >
                    Xem tất cả thông báo
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
