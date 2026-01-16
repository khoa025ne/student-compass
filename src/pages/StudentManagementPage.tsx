import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { LoadingSpinner } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  Users,
  Plus,
  Search,
  GraduationCap,
  Mail,
  Phone,
  Edit,
  Trash2,
  Eye,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import type { Student } from '@/types';

const MAJORS = [
  { value: 'all', label: 'Tất cả ngành' },
  { value: 'SE', label: 'Software Engineering' },
  { value: 'IA', label: 'Information Assurance' },
  { value: 'AI', label: 'Artificial Intelligence' },
];

const TERMS = [
  { value: 'all', label: 'Tất cả kỳ' },
  { value: '1', label: 'Kỳ 1' },
  { value: '2', label: 'Kỳ 2' },
  { value: '3', label: 'Kỳ 3' },
  { value: '4', label: 'Kỳ 4' },
  { value: '5', label: 'Kỳ 5' },
  { value: '6', label: 'Kỳ 6' },
  { value: '7', label: 'Kỳ 7' },
  { value: '8', label: 'Kỳ 8' },
  { value: '9', label: 'Kỳ 9' },
];

export default function StudentManagementPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [majorFilter, setMajorFilter] = useState('all');
  const [termFilter, setTermFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    classCode: '',
    major: 'SE',
  });

  useEffect(() => {
    fetchStudents();
  }, [majorFilter, termFilter]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const filters: { major?: string; termNo?: number } = {};
      if (majorFilter && majorFilter !== 'all') filters.major = majorFilter;
      if (termFilter && termFilter !== 'all') filters.termNo = parseInt(termFilter);
      
      const data = await apiClient.getStudents(filters);
      setStudents(data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Không thể tải danh sách sinh viên');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.fullName || !formData.email || !formData.dateOfBirth || !formData.major) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await apiClient.createStudent({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        classCode: formData.classCode,
        major: formData.major,
      });
      toast.success(`Tạo sinh viên thành công! MSSV: ${result.studentCode}`);
      toast.info(`Mật khẩu mặc định: ${result.defaultPassword}`);
      setIsCreateDialogOpen(false);
      resetForm();
      fetchStudents();
    } catch (error: unknown) {
      console.error('Failed to create student:', error);
      const err = error as { response?: { data?: string } };
      toast.error(err.response?.data || 'Không thể tạo sinh viên');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) return;
    
    try {
      await apiClient.deleteStudent(id);
      toast.success('Xóa sinh viên thành công!');
      fetchStudents();
    } catch (error: unknown) {
      console.error('Failed to delete student:', error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Không thể xóa sinh viên');
    }
  };

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setIsViewDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      dateOfBirth: '',
      classCode: '',
      major: 'SE',
    });
  };

  const filteredStudents = students.filter(s => 
    s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMajorBadge = (major: string) => {
    switch (major) {
      case 'SE':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">SE</Badge>;
      case 'IA':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">IA</Badge>;
      case 'AI':
        return <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/30">AI</Badge>;
      default:
        return <Badge variant="outline">{major}</Badge>;
    }
  };

  if (isLoading && students.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-foreground">
            <Users className="w-8 h-8 text-primary" />
            Quản lý sinh viên
          </h1>
          <p className="text-muted-foreground">
            Quản lý danh sách sinh viên theo ngành và kỳ học
          </p>
        </div>

        <Button
          className="bg-primary text-primary-foreground gap-2"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="w-5 h-5" />
          Thêm sinh viên
        </Button>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên, MSSV, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={majorFilter} onValueChange={setMajorFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Lọc theo ngành" />
          </SelectTrigger>
          <SelectContent>
            {MAJORS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={termFilter} onValueChange={setTermFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Lọc theo kỳ" />
          </SelectTrigger>
          <SelectContent>
            {TERMS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng sinh viên</p>
              <p className="text-2xl font-bold">{filteredStudents.length}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngành SE</p>
              <p className="text-2xl font-bold text-blue-500">
                {students.filter(s => s.major === 'SE').length}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngành IA</p>
              <p className="text-2xl font-bold text-green-500">
                {students.filter(s => s.major === 'IA').length}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngành AI</p>
              <p className="text-2xl font-bold text-purple-500">
                {students.filter(s => s.major === 'AI').length}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Table */}
      <GlassCard className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow className="table-header-bg">
              <TableHead>MSSV</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ngành</TableHead>
              <TableHead>Kỳ</TableHead>
              <TableHead>GPA</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy sinh viên nào
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.studentId}>
                  <TableCell className="font-mono font-medium">{student.studentCode}</TableCell>
                  <TableCell className="font-medium">{student.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">{student.email}</TableCell>
                  <TableCell>{getMajorBadge(student.major || '')}</TableCell>
                  <TableCell>
                    <Badge variant="outline">Kỳ {student.currentTermNo || 1}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${
                      (student.overallGPA || 0) >= 8 ? 'text-green-500' :
                      (student.overallGPA || 0) >= 6.5 ? 'text-blue-500' :
                      (student.overallGPA || 0) >= 5 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {student.overallGPA?.toFixed(2) || '0.00'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(student)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(student.studentId)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </GlassCard>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm sinh viên mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo tài khoản sinh viên mới
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Họ và tên *</Label>
              <Input
                placeholder="Nguyen Van A"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="email@fpt.edu.vn"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input
                placeholder="0901234567"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Ngày sinh *</Label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Chuyên ngành *</Label>
              <Select
                value={formData.major}
                onValueChange={(v) => setFormData({ ...formData, major: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SE">Software Engineering</SelectItem>
                  <SelectItem value="IA">Information Assurance</SelectItem>
                  <SelectItem value="AI">Artificial Intelligence</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mã lớp</Label>
              <Input
                placeholder="SE1801"
                value={formData.classCode}
                onChange={(e) => setFormData({ ...formData, classCode: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? <LoadingSpinner size="sm" /> : 'Tạo sinh viên'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thông tin sinh viên</DialogTitle>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedStudent.fullName}</h3>
                  <p className="text-muted-foreground font-mono">{selectedStudent.studentCode}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email
                  </p>
                  <p className="font-medium">{selectedStudent.email}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" /> SĐT
                  </p>
                  <p className="font-medium">{selectedStudent.phoneNumber || 'Chưa có'}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Ngành</p>
                  {getMajorBadge(selectedStudent.major || '')}
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Kỳ hiện tại</p>
                  <Badge variant="outline">Kỳ {selectedStudent.currentTermNo || 1}</Badge>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">GPA</p>
                  <p className="font-bold text-xl">{selectedStudent.overallGPA?.toFixed(2) || '0.00'}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Mã lớp</p>
                  <p className="font-medium">{selectedStudent.classCode || 'Chưa có'}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
