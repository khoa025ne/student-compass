import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { LoadingSpinner } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BookOpen,
  Plus,
  Search,
  Users,
  MapPin,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import type { CourseClass, Course, Semester, CreateClassRequest, DayOfWeekPair, TimeSlot } from '@/types';
import { cn } from '@/lib/utils';

const DAY_OF_WEEK_PAIRS = [
  { value: 1, label: 'Thứ 2 - Thứ 5' },
  { value: 2, label: 'Thứ 3 - Thứ 6' },
  { value: 3, label: 'Thứ 4 - Thứ 7' },
];

const TIME_SLOTS = [
  { value: 1, label: 'Slot 1 (7:30 - 9:50)' },
  { value: 2, label: 'Slot 2 (10:00 - 12:20)' },
  { value: 3, label: 'Slot 3 (12:50 - 15:10)' },
  { value: 4, label: 'Slot 4 (15:20 - 17:40)' },
];

const getSlotLabel = (slot: TimeSlot) => {
  const found = TIME_SLOTS.find(s => s.value === slot);
  return found ? found.label : `Slot ${slot}`;
};

const getDayPairLabel = (dayPair: DayOfWeekPair) => {
  const found = DAY_OF_WEEK_PAIRS.find(d => d.value === dayPair);
  return found ? found.label : `Day ${dayPair}`;
};

export default function ClassManagementPage() {
  const [classes, setClasses] = useState<CourseClass[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<CreateClassRequest>({
    className: '',
    courseId: 0,
    semesterId: 0,
    room: '',
    maxCapacity: 30,
    dayOfWeekPair: 1 as DayOfWeekPair,
    timeSlot: 1 as TimeSlot,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedSemester) {
      fetchClasses(selectedSemester);
    }
  }, [selectedSemester]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [coursesData, semestersData] = await Promise.all([
        apiClient.getCourses(),
        apiClient.getSemesters(),
      ]);
      setCourses(coursesData);
      setSemesters(semestersData);
      
      // Auto-select active semester
      const activeSemester = semestersData.find(s => s.isActive);
      if (activeSemester) {
        setSelectedSemester(activeSemester.semesterId);
        setFormData(prev => ({ ...prev, semesterId: activeSemester.semesterId }));
      } else if (semestersData.length > 0) {
        setSelectedSemester(semestersData[0].semesterId);
        setFormData(prev => ({ ...prev, semesterId: semestersData[0].semesterId }));
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClasses = async (semesterId: number) => {
    try {
      const data = await apiClient.getClassesBySemester(semesterId);
      setClasses(data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      setClasses([]);
    }
  };

  const handleCreate = async () => {
    if (!formData.className || !formData.courseId || !formData.semesterId || !formData.room) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.createClass(formData);
      toast.success('Mở lớp thành công!');
      setIsCreateDialogOpen(false);
      resetForm();
      if (selectedSemester) {
        fetchClasses(selectedSemester);
      }
    } catch (error: unknown) {
      console.error('Failed to create class:', error);
      const err = error as { response?: { data?: string } };
      toast.error(err.response?.data || 'Không thể mở lớp');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      className: '',
      courseId: 0,
      semesterId: selectedSemester || 0,
      room: '',
      maxCapacity: 30,
      dayOfWeekPair: 1 as DayOfWeekPair,
      timeSlot: 1 as TimeSlot,
    });
  };

  const filteredClasses = classes.filter(cls => 
    cls.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            Quản lý lớp học
          </h1>
          <p className="text-muted-foreground">
            Mở lớp và quản lý các lớp học phần
          </p>
        </div>

        <Button
          className="gradient-bg text-primary-foreground gap-2"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="w-5 h-5" />
          Mở lớp mới
        </Button>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm lớp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select
          value={selectedSemester?.toString()}
          onValueChange={(v) => setSelectedSemester(parseInt(v))}
        >
          <SelectTrigger className="w-[200px]">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng lớp</p>
              <p className="text-2xl font-bold">{classes.length}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng sinh viên</p>
              <p className="text-2xl font-bold text-success">
                {classes.reduce((sum, c) => sum + c.currentEnrollment, 0)}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Table */}
      <GlassCard className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã lớp</TableHead>
              <TableHead>Tên môn</TableHead>
              <TableHead>Phòng</TableHead>
              <TableHead>Lịch học</TableHead>
              <TableHead>Sĩ số</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClasses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {selectedSemester ? 'Chưa có lớp nào trong học kỳ này' : 'Vui lòng chọn học kỳ'}
                </TableCell>
              </TableRow>
            ) : (
              filteredClasses.map((cls) => (
                <TableRow key={cls.classId}>
                  <TableCell className="font-medium">{cls.className}</TableCell>
                  <TableCell>{cls.courseName || '-'}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {cls.room}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getDayPairLabel(cls.dayOfWeekPair)} - {getSlotLabel(cls.timeSlot)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "font-medium",
                      cls.currentEnrollment >= cls.maxCapacity ? 'text-destructive' : 'text-success'
                    )}>
                      {cls.currentEnrollment}/{cls.maxCapacity}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </GlassCard>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Mở lớp mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để mở lớp học phần mới
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="className">Tên lớp</Label>
              <Input
                id="className"
                placeholder="VD: SE1801"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Môn học</Label>
                <Select
                  value={formData.courseId?.toString()}
                  onValueChange={(v) => setFormData({ ...formData, courseId: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn môn" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.courseId} value={course.courseId.toString()}>
                        {course.courseCode} - {course.courseName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Học kỳ</Label>
                <Select
                  value={formData.semesterId?.toString()}
                  onValueChange={(v) => setFormData({ ...formData, semesterId: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn học kỳ" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester.semesterId} value={semester.semesterId.toString()}>
                        {semester.semesterName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room">Phòng học</Label>
                <Input
                  id="room"
                  placeholder="VD: P.304"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxCapacity">Sĩ số tối đa</Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  min={1}
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 30 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngày học</Label>
                <Select
                  value={formData.dayOfWeekPair?.toString()}
                  onValueChange={(v) => setFormData({ ...formData, dayOfWeekPair: parseInt(v) as DayOfWeekPair })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ngày" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAY_OF_WEEK_PAIRS.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Slot</Label>
                <Select
                  value={formData.timeSlot?.toString()}
                  onValueChange={(v) => setFormData({ ...formData, timeSlot: parseInt(v) as TimeSlot })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value.toString()}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? <LoadingSpinner size="sm" /> : 'Mở lớp'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
