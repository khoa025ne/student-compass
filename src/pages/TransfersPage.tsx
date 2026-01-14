import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { RequestStatusBadge, StatusBadge } from '@/components/ui/status-badge';
import { LoadingSpinner } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ArrowRightLeft,
  Plus,
  Clock,
  Calendar,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import type { TransferRequest, MyEnrollment } from '@/types';

// Extended transfer request type with additional fields
interface ExtendedTransferRequest extends TransferRequest {
  fromCourseName?: string;
  toCourseName?: string;
  reason?: string;
  processedAt?: string;
  rejectionReason?: string;
}

export default function TransfersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFrom, setSelectedFrom] = useState<string>('');
  const [selectedTo, setSelectedTo] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requests, setRequests] = useState<ExtendedTransferRequest[]>([]);
  const [enrollments, setEnrollments] = useState<MyEnrollment[]>([]);
  const [availableTargets, setAvailableTargets] = useState<{ id: number; classCode: string; schedule: string; availableSlots: number }[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [transferData, enrollmentData] = await Promise.all([
        apiClient.getTransferRequests(),
        apiClient.getMyEnrollments(),
      ]);
      setRequests(transferData);
      setEnrollments(enrollmentData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // Set empty state on error
      setRequests([]);
      setEnrollments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFrom || !selectedTo) {
      toast.error('Vui lòng chọn đầy đủ thông tin');
      return;
    }

    setIsSubmitting(true);

    try {
      const fromEnrollment = enrollments.find((e) => e.classCode === selectedFrom);
      const toTarget = availableTargets.find((t) => t.classCode === selectedTo);

      if (fromEnrollment && toTarget) {
        const response = await apiClient.createTransferRequest({
          fromCourseClassId: fromEnrollment.enrollmentId,
          toCourseClassId: toTarget.id,
        });

        setRequests((prev) => [{
          ...response,
          fromCourseName: fromEnrollment.courseName,
          toCourseName: fromEnrollment.courseName,
        }, ...prev]);
        
        toast.success('Yêu cầu chuyển lớp đã được gửi!');
      }
    } catch (error: unknown) {
      console.error('Failed to create transfer request:', error);
      toast.error('Không thể tạo yêu cầu chuyển lớp. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
      setIsDialogOpen(false);
      setSelectedFrom('');
      setSelectedTo('');
    }
  };

  const getStatusIcon = (status: 'Pending' | 'Approved' | 'Rejected') => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-5 h-5 text-warning" />;
      case 'Approved':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-destructive" />;
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text">
            Chuyển lớp
          </h1>
          <p className="text-muted-foreground">
            Quản lý các yêu cầu chuyển lớp học phần
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg text-primary-foreground gap-2">
              <Plus className="w-5 h-5" />
              Tạo yêu cầu mới
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card-elevated border-0">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Yêu cầu chuyển lớp</DialogTitle>
              <DialogDescription>
                Chọn lớp hiện tại và lớp muốn chuyển đến
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 pt-4">
              {/* From class */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Lớp hiện tại</label>
                <Select value={selectedFrom} onValueChange={(value) => {
                  setSelectedFrom(value);
                  setSelectedTo('');
                }}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Chọn lớp muốn chuyển" />
                  </SelectTrigger>
                  <SelectContent>
                    {enrollments.map((enrollment) => (
                      <SelectItem key={enrollment.enrollmentId} value={enrollment.classCode}>
                        <div className="flex flex-col">
                          <span className="font-medium">{enrollment.courseName}</span>
                          <span className="text-xs text-muted-foreground">
                            {enrollment.classCode} • {enrollment.schedule}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Arrow */}
              {selectedFrom && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-center"
                >
                  <div className="w-10 h-10 rounded-full gradient-bg-subtle flex items-center justify-center">
                    <ArrowRightLeft className="w-5 h-5 text-primary" />
                  </div>
                </motion.div>
              )}

              {/* To class */}
              {selectedFrom && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium">Lớp muốn chuyển đến</label>
                  {availableTargets.length > 0 ? (
                    <Select value={selectedTo} onValueChange={setSelectedTo}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Chọn lớp đích" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTargets.map((target) => (
                          <SelectItem key={target.id} value={target.classCode}>
                            <div className="flex flex-col">
                              <span className="font-medium">{target.classCode}</span>
                              <span className="text-xs text-muted-foreground">
                                {target.schedule} • Còn {target.availableSlots} chỗ
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-warning bg-warning/10 rounded-lg p-3">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Không có lớp nào khả dụng để chuyển</span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Submit button */}
              <Button
                onClick={handleSubmit}
                disabled={!selectedFrom || !selectedTo || isSubmitting}
                className="w-full h-12 gradient-bg text-primary-foreground"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Đang gửi...
                  </>
                ) : (
                  'Gửi yêu cầu'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard delay={0.1}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Đang chờ</p>
              <p className="text-2xl font-display font-bold text-warning">
                {requests.filter((r) => r.status === 'Pending').length}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.15}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Đã duyệt</p>
              <p className="text-2xl font-display font-bold text-success">
                {requests.filter((r) => r.status === 'Approved').length}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.2}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Từ chối</p>
              <p className="text-2xl font-display font-bold text-destructive">
                {requests.filter((r) => r.status === 'Rejected').length}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Transfer Requests List */}
      <div className="space-y-4">
        <h2 className="font-display font-bold text-xl">Lịch sử yêu cầu</h2>

        {requests.length === 0 ? (
          <GlassCard className="text-center py-12">
            <ArrowRightLeft className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-display font-bold text-lg mb-2">Chưa có yêu cầu nào</h3>
            <p className="text-muted-foreground">
              Tạo yêu cầu chuyển lớp đầu tiên của bạn
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {requests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-0 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(request.status)}
                        <div>
                          <p className="font-semibold">{request.fromCourseName}</p>
                          <p className="text-sm text-muted-foreground">
                            Yêu cầu #{request.id}
                          </p>
                        </div>
                      </div>
                      <RequestStatusBadge status={request.status} />
                    </div>

                    {/* Transfer direction */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Từ lớp</p>
                        <StatusBadge variant="secondary">{request.fromClass}</StatusBadge>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Đến lớp</p>
                        <StatusBadge variant="default">{request.toClass}</StatusBadge>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Tạo lúc: {new Date(request.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Rejection reason */}
                    {request.status === 'Rejected' && 'rejectionReason' in request && (
                      <div className="mt-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Lý do từ chối: {request.rejectionReason}</span>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
