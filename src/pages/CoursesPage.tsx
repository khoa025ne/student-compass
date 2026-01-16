import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { LoadingSpinner } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  Clock,
  MapPin,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { AvailableClass, Semester, DayOfWeekPair, TimeSlot } from '@/types';

const getDayPairLabel = (dayPair: DayOfWeekPair) => {
  const labels: Record<number, string> = {
    1: 'Thứ 2 - Thứ 5',
    2: 'Thứ 3 - Thứ 6',
    3: 'Thứ 4 - Thứ 7',
  };
  return labels[dayPair] || '';
};

const getSlotLabel = (slot: TimeSlot) => {
  const labels: Record<number, string> = {
    1: '7:30 - 9:50',
    2: '10:00 - 12:20',
    3: '12:50 - 15:10',
    4: '15:20 - 17:40',
  };
  return labels[slot] || '';
};

export default function CoursesPage() {
  const { user } = useAuthStore();
  const [availableClasses, setAvailableClasses] = useState<AvailableClass[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollingId, setEnrollingId] = useState<number | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<number[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedSemester) {
      fetchAvailableClasses(selectedSemester);
    }
  }, [selectedSemester]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const semestersData = await apiClient.getSemesters();
      setSemesters(semestersData);
      
      // Auto-select active semester
      const activeSemester = semestersData.find(s => s.isActive);
      if (activeSemester) {
        setSelectedSemester(activeSemester.semesterId);
      } else if (semestersData.length > 0) {
        setSelectedSemester(semestersData[0].semesterId);
      }
    } catch (error) {
      console.error('Failed to fetch semesters:', error);
      toast.error('Không thể tải danh sách học kỳ');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableClasses = async (semesterId: number) => {
    setIsLoading(true);
    try {
      const data = await apiClient.getAvailableClasses(semesterId);
      setAvailableClasses(data);
    } catch (error) {
      console.error('Failed to fetch available classes:', error);
      setAvailableClasses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClasses = availableClasses.filter((cls) => {
    const matchesSearch =
      cls.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cls.courseCode && cls.courseCode.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handleEnroll = async (classId: number) => {
    const classInfo = availableClasses.find((c) => c.classId === classId);
    
    if (!classInfo) return;

    if (!classInfo.canRegister) {
      toast.error(classInfo.statusText || 'Không thể đăng ký lớp này');
      return;
    }

    // Get studentId from user - ưu tiên studentId, fallback userId
    const studentId = user?.studentId || user?.userId || 0;
    
    if (!studentId) {
      toast.error('Không tìm thấy thông tin sinh viên');
      return;
    }

    setEnrollingId(classId);

    try {
      const response = await apiClient.registerCourse({ studentId, classId });
      
      if (response.message.includes('thành công')) {
        setEnrolledIds((prev) => [...prev, classId]);
        toast.success(
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <div>
              <p className="font-semibold">Đăng ký thành công!</p>
              <p className="text-sm text-muted-foreground">{classInfo.courseName}</p>
            </div>
          </div>
        );
        // Refresh list
        if (selectedSemester) {
          fetchAvailableClasses(selectedSemester);
        }
      } else {
        toast.error(response.message || 'Đăng ký thất bại');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setEnrollingId(null);
    }
  };

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
        className="space-y-2"
      >
        <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text">
          Đăng ký môn học
        </h1>
        <p className="text-muted-foreground">
          Tìm và đăng ký các lớp học phần
        </p>
      </motion.div>

      {/* Filters */}
      <GlassCard delay={0.1}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm môn học, mã lớp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-xl"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <Select 
              value={selectedSemester?.toString()} 
              onValueChange={(v) => setSelectedSemester(parseInt(v))}
            >
              <SelectTrigger className="w-[200px] h-12 rounded-xl">
                <SelectValue placeholder="Chọn học kỳ" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((semester) => (
                  <SelectItem key={semester.semesterId} value={semester.semesterId.toString()}>
                    {semester.semesterName} {semester.isActive && '(Hiện tại)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </GlassCard>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 text-sm">
        <StatusBadge variant="default">
          <BookOpen className="w-4 h-4 mr-1" />
          {filteredClasses.length} lớp học phần
        </StatusBadge>
        <StatusBadge variant="success">
          <CheckCircle2 className="w-4 h-4 mr-1" />
          {filteredClasses.filter((c) => c.canRegister).length} còn chỗ
        </StatusBadge>
        <StatusBadge variant="destructive">
          <XCircle className="w-4 h-4 mr-1" />
          {filteredClasses.filter((c) => !c.canRegister).length} đã đầy
        </StatusBadge>
      </div>

      {/* Course Cards Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {filteredClasses.map((cls, index) => {
            const isEnrolled = enrolledIds.includes(cls.classId);
            const isEnrolling = enrollingId === cls.classId;
            const isFull = !cls.canRegister;
            const canEnroll = cls.canRegister && !isEnrolled;
            const availableSlots = cls.maxCapacity - cls.currentEnrollment;

            return (
              <motion.div
                key={cls.classId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard
                  className={cn(
                    'h-full flex flex-col',
                    isEnrolled && 'ring-2 ring-success',
                    isFull && 'opacity-75'
                  )}
                  hover={canEnroll}
                  delay={0}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-bold text-lg">{cls.courseName}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge variant="secondary">{cls.className}</StatusBadge>
                        {cls.courseCode && (
                          <StatusBadge variant="outline">{cls.courseCode}</StatusBadge>
                        )}
                      </div>
                    </div>
                    {isEnrolled && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      </motion.div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-2 text-sm text-muted-foreground flex-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{getDayPairLabel(cls.dayOfWeekPair)} • {getSlotLabel(cls.timeSlot)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>Phòng {cls.room}</span>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className="mt-4">
                    <ProgressBar
                      value={cls.currentEnrollment}
                      max={cls.maxCapacity}
                      size="sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {availableSlots > 0 ? `Còn ${availableSlots} chỗ trống` : 'Đã đầy'}
                    </p>
                  </div>

                  {/* Status Warning */}
                  {!cls.canRegister && cls.statusText && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-warning bg-warning/10 rounded-lg p-3">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{cls.statusText}</span>
                    </div>
                  )}

                  {/* Action */}
                  <div className="mt-4">
                    {isEnrolled ? (
                      <Button disabled className="w-full gradient-bg text-primary-foreground">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Đã đăng ký
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleEnroll(cls.classId)}
                        disabled={!canEnroll || isEnrolling}
                        className={cn(
                          'w-full transition-all duration-300',
                          canEnroll
                            ? 'gradient-bg text-primary-foreground hover:opacity-90'
                            : ''
                        )}
                      >
                        {isEnrolling ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Đang xử lý...
                          </>
                        ) : isFull ? (
                          <>
                            <XCircle className="w-4 h-4 mr-2" />
                            {cls.statusText || 'Đã đầy'}
                          </>
                        ) : (
                          'Đăng ký ngay'
                        )}
                      </Button>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filteredClasses.length === 0 && (
        <GlassCard className="text-center py-12">
          <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display font-bold text-lg mb-2">Không tìm thấy kết quả</h3>
          <p className="text-muted-foreground">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
        </GlassCard>
      )}
    </div>
  );
}
