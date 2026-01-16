import { useEffect, useState, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '@/store/authStore';
import type { Notification } from '@/types';

const SIGNALR_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5172';

interface UseSignalRNotificationsResult {
  isConnected: boolean;
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  clearNotifications: () => void;
}

export function useSignalRNotifications(): UseSignalRNotificationsResult {
  const { user } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    if (!user?.userId) {
      return;
    }

    const studentId = user.userId;
    const token = localStorage.getItem('auth_token');

    // Tạo connection
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${SIGNALR_URL}/notificationHub`, {
        accessTokenFactory: () => token || '',
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    // Xử lý nhận thông báo
    connection.on('ReceiveNotification', (notification: Notification) => {
      console.log('📬 Received notification:', notification);
      addNotification(notification);
      
      // Hiển thị browser notification nếu được phép
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        });
      }
    });

    connection.on('JoinedGroup', (message: string) => {
      console.log('✅ SignalR:', message);
    });

    // Xử lý connection events
    connection.onreconnecting(() => {
      console.log('🔄 SignalR reconnecting...');
      setIsConnected(false);
    });

    connection.onreconnected(() => {
      console.log('✅ SignalR reconnected');
      setIsConnected(true);
      // Rejoin group after reconnection
      connection.invoke('JoinStudentGroup', studentId).catch(console.error);
    });

    connection.onclose(() => {
      console.log('❌ SignalR disconnected');
      setIsConnected(false);
    });

    // Start connection
    const startConnection = async () => {
      try {
        await connection.start();
        console.log('✅ SignalR connected');
        setIsConnected(true);

        // Join student group
        await connection.invoke('JoinStudentGroup', studentId);
        console.log(`✅ Joined student group: student_${studentId}`);
      } catch (error) {
        console.error('❌ SignalR connection failed:', error);
        setIsConnected(false);
      }
    };

    startConnection();

    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup
    return () => {
      if (connectionRef.current) {
        connectionRef.current.invoke('LeaveStudentGroup', studentId).catch(() => {});
        connectionRef.current.stop();
        connectionRef.current = null;
      }
    };
  }, [user?.userId, addNotification]);

  return {
    isConnected,
    notifications,
    unreadCount,
    addNotification,
    clearNotifications
  };
}
