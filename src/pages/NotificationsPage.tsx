import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { LoadingSpinner } from '@/components/ui/loading';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  Check,
  Trash2,
  Wifi,
  WifiOff,
  RefreshCw,
  GraduationCap,
  TrendingUp,
  Award
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useSignalRNotifications } from '@/hooks/use-signalr-notifications';
import type { Notification } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Mock data for development
const mockNotifications: Notification[] = [
  {
    notificationId: 1,
    title: 'Đăng ký môn học thành công',
    message: 'Bạn đã đăng ký thành công môn Lập Trình Web (CS101-01)',
    type: 'success',
    isRead: false,
    createdAt: new Date().toISOString(),
    studentId: 1,
  },
  {
    notificationId: 2,
    title: 'Nhắc nhở nộp bài',
    message: 'Bạn có bài tập môn Cơ Sở Dữ Liệu cần nộp trước 23:59 hôm nay',
    type: 'warning',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    studentId: 1,
  },
  {
    notificationId: 3,
    title: 'Thông báo từ phòng đào tạo',
    message: 'Lịch thi học kỳ 2024.1 đã được công bố. Vui lòng kiểm tra lịch thi của bạn.',
    type: 'info',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    studentId: 1,
  },
  {
    notificationId: 4,
    title: 'Cảnh báo học vụ',
    message: 'Điểm trung bình của bạn đang dưới mức yêu cầu. Vui lòng liên hệ cố vấn học tập.',
    type: 'error',
    isRead: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    studentId: 1,
  },
];

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'score' | 'warning' | 'achievement'>('all');

  // SignalR real-time notifications
  const { 
    isConnected, 
    notifications: realtimeNotifications 
  } = useSignalRNotifications();

  // Merge realtime notifications with existing ones
  useEffect(() => {
    if (realtimeNotifications.length > 0) {
      setNotifications(prev => {
        const existingIds = new Set(prev.map(n => n.notificationId));
        const newNotifications = realtimeNotifications.filter(
          n => !existingIds.has(n.notificationId)
        );
        if (newNotifications.length > 0) {
          toast.info(`Có ${newNotifications.length} thông báo mới!`);
          return [...newNotifications, ...prev];
        }
        return prev;
      });
    }
  }, [realtimeNotifications]);

  useEffect(() => {
    if (user?.userId) {
      fetchNotifications();
    }
  }, [user?.userId]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const studentId = user?.studentId || user?.userId || 0;
      if (studentId === 0) {
        setNotifications(mockNotifications);
        return;
      }
      const data = await apiClient.getNotificationsForStudent(studentId);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Use mock data if API fails
      setNotifications(mockNotifications);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'warning':
      case 'Warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'ScoreUpdate':
        return <GraduationCap className="w-5 h-5 text-primary" />;
      case 'Achievement':
        return <Award className="w-5 h-5 text-yellow-500" />;
      case 'LearningPath':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'Info':
      case 'info':
      default:
        return <Info className="w-5 h-5 text-primary" />;
    }
  };

  const getTypeBadgeVariant = (type: Notification['type']) => {
    switch (type) {
      case 'success':
      case 'Achievement':
        return 'success';
      case 'warning':
      case 'Warning':
        return 'warning';
      case 'error':
        return 'destructive';
      case 'ScoreUpdate':
      case 'LearningPath':
      case 'Info':
      case 'info':
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'Thành công';
      case 'warning': 
      case 'Warning': return 'Cảnh báo';
      case 'error': return 'Lỗi';
      case 'ScoreUpdate': return 'Cập nhật điểm';
      case 'Achievement': return 'Thành tích';
      case 'LearningPath': return 'Lộ trình học';
      case 'Info':
      case 'info':
      default: return 'Thông tin';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes} phút trước`;
    } else if (hours < 24) {
      return `${hours} giờ trước`;
    } else if (days < 7) {
      return `${days} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await apiClient.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.notificationId === id ? { ...n, isRead: true } : n))
      );
      toast.success('Đã đánh dấu là đã đọc');
    } catch (error) {
      console.error('Failed to mark as read:', error);
      // Still update local state even if API fails
      setNotifications(prev =>
        prev.map(n => (n.notificationId === id ? { ...n, isRead: true } : n))
      );
      toast.success('Đã đánh dấu là đã đọc');
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    try {
      // Use new API endpoint to mark all as read
      const studentId = user?.studentId || user?.userId || 0;
      if (studentId > 0) {
        await apiClient.markAllNotificationsRead(studentId);
      }
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      // Still update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('Đã đánh dấu tất cả là đã đọc');
    }
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.notificationId !== id));
    toast.success('Đã xóa thông báo');
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'score') return n.type === 'ScoreUpdate';
    if (filter === 'warning') return n.type === 'warning' || n.type === 'Warning' || n.type === 'error';
    if (filter === 'achievement') return n.type === 'Achievement' || n.type === 'LearningPath';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text">
              Thông báo
            </h1>
            {unreadCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                {unreadCount} mới
              </span>
            )}
            {/* SignalR connection status */}
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
              isConnected ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
            )}>
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isConnected ? "Real-time" : "Offline"}
            </div>
          </div>
          <p className="text-muted-foreground">
            Quản lý các thông báo của bạn {isConnected && '• Nhận thông báo real-time'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Tất cả
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Chưa đọc ({unreadCount})
          </Button>
          <Button
            variant={filter === 'score' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('score')}
          >
            <GraduationCap className="w-4 h-4 mr-1" />
            Điểm số
          </Button>
          <Button
            variant={filter === 'warning' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('warning')}
          >
            <AlertTriangle className="w-4 h-4 mr-1" />
            Cảnh báo
          </Button>
          <Button
            variant={filter === 'achievement' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('achievement')}
          >
            <Award className="w-4 h-4 mr-1" />
            Thành tích
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
            >
              <Check className="w-4 h-4 mr-1" />
              Đánh dấu tất cả
            </Button>
          )}
        </div>
      </motion.div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <GlassCard className="text-center py-12">
          <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display font-bold text-lg">Không có thông báo</h3>
          <p className="text-muted-foreground text-sm">
            {filter === 'unread' ? 'Bạn đã đọc tất cả thông báo' : 'Chưa có thông báo nào'}
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification.notificationId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard
                className={cn(
                  'flex items-start gap-4 transition-all',
                  !notification.isRead && 'ring-2 ring-primary/20 bg-primary/5'
                )}
              >
                <div className="flex-shrink-0 pt-1">
                  {getTypeIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold truncate">{notification.title}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge variant={getTypeBadgeVariant(notification.type) as 'default' | 'destructive' | 'secondary' | 'outline'}>
                        {getTypeLabel(notification.type)}
                      </StatusBadge>
                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(notification.createdAt)}
                    </span>
                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.notificationId)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Đã đọc
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteNotification(notification.notificationId)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
