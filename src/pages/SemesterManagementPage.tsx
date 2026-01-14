import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { LoadingSpinner } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Calendar,
  Plus,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import type { Semester, CreateSemesterRequest } from '@/types';
import { cn } from '@/lib/utils';

export default function SemesterManagementPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateSemesterRequest>({
    semesterName: '',
    semesterCode: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getSemesters();
      setSemesters(data);
    } catch (error) {
      console.error('Failed to fetch semesters:', error);
      toast.error('Không thể tải danh sách học kỳ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.semesterName || !formData.semesterCode || !formData.startDate || !formData.endDate) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('Ngày bắt đầu phải trước ngày kết thúc');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.createSemester(formData);
      toast.success('Tạo học kỳ thành công!');
      setIsCreateDialogOpen(false);
      resetForm();
      fetchSemesters();
    } catch (error) {
      console.error('Failed to create semester:', error);
      toast.error('Không thể tạo học kỳ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetActive = async (semesterId: number) => {
    try {
      await apiClient.setActiveSemester(semesterId);
      toast.success('Đã kích hoạt học kỳ!');
      fetchSemesters();
    } catch (error) {
      console.error('Failed to set active semester:', error);
      toast.error('Không thể kích hoạt học kỳ');
    }
  };

  const resetForm = () => {
    setFormData({
      semesterName: '',
      semesterCode: '',
      startDate: '',
      endDate: '',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
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
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text flex items-center gap-3">
            <Calendar className="w-8 h-8" />
            Quản lý học kỳ
          </h1>
          <p className="text-muted-foreground">
            Tạo và quản lý các học kỳ trong hệ thống
          </p>
        </div>

        <Button
          className="gradient-bg text-primary-foreground gap-2"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="w-5 h-5" />
          Tạo học kỳ mới
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng học kỳ</p>
              <p className="text-2xl font-bold">{semesters.length}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đang hoạt động</p>
              <p className="text-2xl font-bold text-success">
                {semesters.filter(s => s.isActive).length}
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
              <TableHead>Mã học kỳ</TableHead>
              <TableHead>Tên học kỳ</TableHead>
              <TableHead>Ngày bắt đầu</TableHead>
              <TableHead>Ngày kết thúc</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {semesters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Chưa có học kỳ nào
                </TableCell>
              </TableRow>
            ) : (
              semesters.map((semester) => (
                <TableRow key={semester.semesterId}>
                  <TableCell className="font-medium">{semester.semesterCode}</TableCell>
                  <TableCell>{semester.semesterName}</TableCell>
                  <TableCell>{formatDate(semester.startDate)}</TableCell>
                  <TableCell>{formatDate(semester.endDate)}</TableCell>
                  <TableCell>
                    {semester.isActive ? (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 w-fit">
                        <CheckCircle2 className="w-3 h-3" /> Đang hoạt động
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 w-fit">
                        <Clock className="w-3 h-3" /> Chưa kích hoạt
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!semester.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetActive(semester.semesterId)}
                      >
                        Kích hoạt
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </GlassCard>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo học kỳ mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo học kỳ mới
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="semesterCode">Mã học kỳ</Label>
                <Input
                  id="semesterCode"
                  placeholder="VD: SPR25"
                  value={formData.semesterCode}
                  onChange={(e) => setFormData({ ...formData, semesterCode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semesterName">Tên học kỳ</Label>
                <Input
                  id="semesterName"
                  placeholder="VD: Spring 2025"
                  value={formData.semesterName}
                  onChange={(e) => setFormData({ ...formData, semesterName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày bắt đầu</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Ngày kết thúc</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? <LoadingSpinner size="sm" /> : 'Tạo học kỳ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
