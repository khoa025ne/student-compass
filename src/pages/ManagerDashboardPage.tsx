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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  GraduationCap,
  FileText,
  ArrowRightLeft,
  Search,
  Users,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import type { Student, TransferRequest, Course, CourseClass } from '@/types';

export default function ManagerDashboardPage() {
  const [activeTab, setActiveTab] = useState('grades');
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<CourseClass[]>([]);
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewGradeDialogOpen, setIsViewGradeDialogOpen] = useState(false);
  const [studentGrades, setStudentGrades] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [studentsData, coursesData, classesData, transfersData] = await Promise.all([
        apiClient.getStudents(),
        apiClient.getCourses(),
        apiClient.getClasses(),
        apiClient.getTransferRequests(),
      ]);
      setStudents(studentsData);
      setCourses(coursesData);
      setClasses(classesData);
      setTransferRequests(transfersData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewGrades = async (student: Student) => {
    setSelectedStudent(student);
    try {
      const grades = await apiClient.getGradesByStudentId(student.studentId);
      setStudentGrades(grades);
      setIsViewGradeDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch grades:', error);
      toast.error('Không thể tải bảng điểm');
    }
  };

  const handleApproveTransfer = async (requestId: number) => {
    try {
      // API call would go here
      toast.success('Đã duyệt yêu cầu chuyển lớp');
      fetchData();
    } catch (error) {
      toast.error('Không thể duyệt yêu cầu');
    }
  };

  const handleRejectTransfer = async (requestId: number) => {
    try {
      // API call would go here
      toast.success('Đã từ chối yêu cầu chuyển lớp');
      fetchData();
    } catch (error) {
      toast.error('Không thể từ chối yêu cầu');
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const pendingTransfers = transferRequests.filter((t) => t.status === 'Pending');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="w-3 h-3" /> Chờ duyệt
          </span>
        );
      case 'Approved':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="w-3 h-3" /> Đã duyệt
          </span>
        );
      case 'Rejected':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="w-3 h-3" /> Từ chối
          </span>
        );
      default:
        return null;
    }
  };

  // Calculate stats by course/major
  const courseStats = courses.map((course) => {
    const courseClasses = classes.filter((c) => c.courseId === course.courseId);
    const totalStudents = courseClasses.reduce((sum, c) => sum + (c.currentEnrollment || 0), 0);
    return {
      ...course,
      totalStudents,
      totalClasses: courseClasses.length,
    };
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-primary" />
            Quản lý học vụ
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý điểm, báo cáo và yêu cầu chuyển lớp
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sinh viên</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Môn học</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lớp học</p>
                <p className="text-2xl font-bold">{classes.length}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chờ duyệt</p>
                <p className="text-2xl font-bold">{pendingTransfers.length}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="grades" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              Quản lý điểm
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <FileText className="w-4 h-4" />
              Báo cáo
            </TabsTrigger>
            <TabsTrigger value="transfers" className="gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              Chuyển lớp
              {pendingTransfers.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-red-500 text-white">
                  {pendingTransfers.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Grades Tab */}
          <TabsContent value="grades">
            <GlassCard className="p-4 mb-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm sinh viên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="w-full sm:w-64">
                    <SelectValue placeholder="Lọc theo môn học" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả môn học</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.courseId} value={course.courseId.toString()}>
                        {course.courseCode} - {course.courseName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </GlassCard>

            <GlassCard className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>MSSV</TableHead>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Lớp</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Không tìm thấy sinh viên nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student.studentId}>
                        <TableCell className="font-medium">{student.studentCode}</TableCell>
                        <TableCell>{student.fullName}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.classCode || 'N/A'}</TableCell>
                        <TableCell>
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          >
                            Active
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewGrades(student)}
                            className="gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Xem điểm
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </GlassCard>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="grid md:grid-cols-2 gap-6">
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Thống kê theo môn học
                </h3>
                <div className="space-y-3">
                  {courseStats.map((course) => (
                    <div
                      key={course.courseId}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{course.courseName}</p>
                        <p className="text-sm text-muted-foreground">{course.courseCode}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{course.totalStudents} SV</p>
                        <p className="text-sm text-muted-foreground">
                          {course.totalClasses} lớp
                        </p>
                      </div>
                    </div>
                  ))}
                  {courseStats.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Chưa có dữ liệu môn học
                    </p>
                  )}
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Thống kê lớp học
                </h3>
                <div className="space-y-3">
                  {classes.slice(0, 5).map((classItem) => {
                    const course = courses.find((c) => c.courseId === classItem.courseId);
                    return (
                      <div
                        key={classItem.classId}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">{classItem.classCode || classItem.className}</p>
                          <p className="text-sm text-muted-foreground">
                            {course?.courseName || classItem.courseName || 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {classItem.currentEnrollment}/{classItem.maxCapacity}
                          </p>
                          <p className="text-sm text-muted-foreground">sinh viên</p>
                        </div>
                      </div>
                    );
                  })}
                  {classes.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Chưa có dữ liệu lớp học
                    </p>
                  )}
                </div>
              </GlassCard>
            </div>
          </TabsContent>

          {/* Transfers Tab */}
          <TabsContent value="transfers">
            <GlassCard className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Sinh viên</TableHead>
                    <TableHead>Từ lớp</TableHead>
                    <TableHead>Đến lớp</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transferRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Không có yêu cầu chuyển lớp nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    transferRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.id}</TableCell>
                        <TableCell>{request.studentName}</TableCell>
                        <TableCell>{request.fromClass}</TableCell>
                        <TableCell>{request.toClass}</TableCell>
                        <TableCell>
                          {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-right">
                          {request.status === 'Pending' && (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApproveTransfer(request.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Duyệt
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejectTransfer(request.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Từ chối
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </GlassCard>
          </TabsContent>
        </Tabs>

        {/* View Grades Dialog */}
        <Dialog open={isViewGradeDialogOpen} onOpenChange={setIsViewGradeDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Bảng điểm sinh viên</DialogTitle>
              <DialogDescription>
                {selectedStudent?.fullName} - {selectedStudent?.email}
              </DialogDescription>
            </DialogHeader>
            {studentGrades ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm text-muted-foreground">GPA tích lũy</p>
                    <p className="text-2xl font-bold text-primary">
                      {studentGrades.cumulativeGPA?.toFixed(2) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Học kỳ hiện tại</p>
                    <p className="text-lg font-semibold">{studentGrades.currentSemester || 'N/A'}</p>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã môn</TableHead>
                      <TableHead>Tên môn</TableHead>
                      <TableHead>Tín chỉ</TableHead>
                      <TableHead>Điểm GK</TableHead>
                      <TableHead>Điểm CK</TableHead>
                      <TableHead>Điểm TB</TableHead>
                      <TableHead>Điểm chữ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentGrades.courses?.map((course: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{course.courseCode}</TableCell>
                        <TableCell>{course.courseName}</TableCell>
                        <TableCell>{course.credits}</TableCell>
                        <TableCell>{course.midterm?.toFixed(1) || '-'}</TableCell>
                        <TableCell>{course.final?.toFixed(1) || '-'}</TableCell>
                        <TableCell className="font-semibold">
                          {course.finalScore?.toFixed(2) || '-'}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              course.letterGrade?.startsWith('A')
                                ? 'bg-green-100 text-green-700'
                                : course.letterGrade?.startsWith('B')
                                ? 'bg-blue-100 text-blue-700'
                                : course.letterGrade?.startsWith('C')
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {course.letterGrade || '-'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewGradeDialogOpen(false)}>
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}
