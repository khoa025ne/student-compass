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
  User,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import type { AvailableClass } from '@/types';

// Extended type with department for filtering
interface AvailableClassWithDepartment extends AvailableClass {
  department?: string;
}

// Mock available classes (fallback when API fails)
const mockAvailableClasses: AvailableClassWithDepartment[] = [
  {
    courseClassId: 1,
    classCode: 'CS201-01',
    courseName: 'Kỹ Thuật Phần Mềm',
    credits: 3,
    availableSlots: 5,
    maxCapacity: 40,
    schedule: 'Thứ 2 08:00-10:00',
    room: 'A301',
    teacherName: 'Nguyễn Văn A',
    prerequisiteMet: true,
    prerequisiteCode: null,
    department: 'CNTT',
  },
  {
    courseClassId: 2,
    classCode: 'CS201-02',
    courseName: 'Kỹ Thuật Phần Mềm',
    credits: 3,
    availableSlots: 12,
    maxCapacity: 40,
    schedule: 'Thứ 4 14:00-16:00',
    room: 'A302',
    teacherName: 'Trần Thị B',
    prerequisiteMet: true,
    prerequisiteCode: null,
    department: 'CNTT',
  },
  {
    courseClassId: 3,
    classCode: 'CS301-01',
    courseName: 'Trí Tuệ Nhân Tạo',
    credits: 3,
    availableSlots: 0,
    maxCapacity: 35,
    schedule: 'Thứ 3 10:30-12:30',
    room: 'B201',
    teacherName: 'Lê Văn C',
    prerequisiteMet: true,
    prerequisiteCode: 'CS201',
    department: 'CNTT',
  },
  {
    courseClassId: 4,
    classCode: 'CS302-01',
    courseName: 'Machine Learning',
    credits: 3,
    availableSlots: 8,
    maxCapacity: 30,
    schedule: 'Thứ 5 08:00-10:00',
    room: 'B202',
    teacherName: 'Phạm Văn D',
    prerequisiteMet: false,
    prerequisiteCode: 'CS301',
    department: 'CNTT',
  },
  {
    courseClassId: 5,
    classCode: 'BA201-01',
    courseName: 'Marketing Căn Bản',
    credits: 3,
    availableSlots: 25,
    maxCapacity: 50,
    schedule: 'Thứ 6 14:00-16:00',
    room: 'C101',
    teacherName: 'Hoàng Thị E',
    prerequisiteMet: true,
    prerequisiteCode: null,
    department: 'QTKD',
  },
  {
    courseClassId: 6,
    classCode: 'EN201-01',
    courseName: 'Tiếng Anh Chuyên Ngành',
    credits: 2,
    availableSlots: 15,
    maxCapacity: 40,
    schedule: 'Thứ 2 14:00-16:00',
    room: 'D201',
    teacherName: 'Smith John',
    prerequisiteMet: true,
    prerequisiteCode: 'EN101',
    department: 'Ngoại ngữ',
  },
];

const departments = ['Tất cả', 'CNTT', 'QTKD', 'Ngoại ngữ'];

export default function CoursesPage() {
  const [availableClasses, setAvailableClasses] = useState<AvailableClassWithDepartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('Tất cả');
  const [enrollingId, setEnrollingId] = useState<number | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<number[]>([]);

  useEffect(() => {
    fetchAvailableClasses();
  }, []);

  const fetchAvailableClasses = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getAvailableClasses();
      // Add mock department for filtering (in production, this would come from API)
      const classesWithDept = data.map(cls => ({
        ...cls,
        department: cls.classCode.startsWith('CS') ? 'CNTT' : 
                   cls.classCode.startsWith('BA') ? 'QTKD' : 
                   cls.classCode.startsWith('EN') ? 'Ngoại ngữ' : 'Khác'
      }));
      setAvailableClasses(classesWithDept);
    } catch (error) {
      console.error('Failed to fetch available classes:', error);
      // Use mock data if API fails
      setAvailableClasses(mockAvailableClasses);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClasses = availableClasses.filter((cls) => {
    const matchesSearch =
      cls.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.classCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      selectedDepartment === 'Tất cả' || cls.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleEnroll = async (courseClassId: number) => {
    const classInfo = availableClasses.find((c) => c.courseClassId === courseClassId);
    
    if (!classInfo) return;

    if (classInfo.availableSlots === 0) {
      toast.error('Lớp học phần đã đầy. Vui lòng chọn lớp khác.');
      return;
    }

    if (!classInfo.prerequisiteMet) {
      toast.error(`Bạn chưa đạt điều kiện tiên quyết ${classInfo.prerequisiteCode}`);
      return;
    }

    setEnrollingId(courseClassId);

    try {
      const response = await apiClient.enroll({ courseClassId });
      
      if (response.success) {
        setEnrolledIds((prev) => [...prev, courseClassId]);
        toast.success(
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <div>
              <p className="font-semibold">Đăng ký thành công!</p>
              <p className="text-sm text-muted-foreground">{classInfo.courseName}</p>
            </div>
          </div>
        );
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
          Học kỳ 2024.1 • Tìm và đăng ký các lớp học phần
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
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[180px] h-12 rounded-xl">
                <SelectValue placeholder="Khoa" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
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
          {filteredClasses.filter((c) => c.prerequisiteMet).length} đủ điều kiện
        </StatusBadge>
        <StatusBadge variant="destructive">
          <XCircle className="w-4 h-4 mr-1" />
          {filteredClasses.filter((c) => c.availableSlots === 0).length} đã đầy
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
            const isEnrolled = enrolledIds.includes(cls.courseClassId);
            const isEnrolling = enrollingId === cls.courseClassId;
            const isFull = cls.availableSlots === 0;
            const canEnroll = cls.prerequisiteMet && !isFull && !isEnrolled;

            return (
              <motion.div
                key={cls.courseClassId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard
                  className={cn(
                    'h-full flex flex-col',
                    isEnrolled && 'ring-2 ring-success',
                    !cls.prerequisiteMet && 'opacity-75'
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
                        <StatusBadge variant="secondary">{cls.classCode}</StatusBadge>
                        <StatusBadge variant="outline">{cls.credits} TC</StatusBadge>
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
                      <span>{cls.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>Phòng {cls.room}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{cls.teacherName}</span>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className="mt-4">
                    <ProgressBar
                      value={cls.maxCapacity - cls.availableSlots}
                      max={cls.maxCapacity}
                      size="sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Còn {cls.availableSlots} chỗ trống
                    </p>
                  </div>

                  {/* Prerequisite Warning */}
                  {!cls.prerequisiteMet && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-warning bg-warning/10 rounded-lg p-3">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Yêu cầu hoàn thành {cls.prerequisiteCode}</span>
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
                        onClick={() => handleEnroll(cls.courseClassId)}
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
                            Đã đầy
                          </>
                        ) : !cls.prerequisiteMet ? (
                          'Chưa đủ điều kiện'
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
