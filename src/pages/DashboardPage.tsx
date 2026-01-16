import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { GradeBadge } from '@/components/ui/status-badge';
import { LoadingSpinner } from '@/components/ui/loading';
import {
  BookOpen,
  Calendar,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import type { MyEnrollment, TranscriptCourse, TranscriptResponse } from '@/types';

interface DashboardStats {
  gpa: number;
  credits: number;
  courses: number;
  attendance: number;
}

interface TodayScheduleItem {
  id: number;
  time: string;
  course: string;
  code: string;
  room: string;
  teacher: string;
}

interface CurrentCourseItem {
  id: number;
  code: string;
  name: string;
  credits: number;
  grade: string;
}

// Default empty stats
const defaultStats: DashboardStats = {
  gpa: 0,
  credits: 0,
  courses: 0,
  attendance: 0,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [todaySchedule, setTodaySchedule] = useState<TodayScheduleItem[]>([]);
  const [currentCourses, setCurrentCourses] = useState<CurrentCourseItem[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [enrollments, transcript] = await Promise.all([
        apiClient.getMyEnrollments(),
        apiClient.getMyGrades(),
      ]);

      // Calculate stats from transcript
      // Flatten all courses from all semesters
      const allCourses = transcript.details?.flatMap(sem => sem.courses) || [];
      
      if (allCourses.length > 0) {
        const totalCredits = allCourses
          .filter((c: TranscriptCourse) => c.status === 'Passed')
          .reduce((sum: number, c: TranscriptCourse) => sum + c.credits, 0);

        setStats({
          gpa: transcript.overallGPA,
          credits: totalCredits,
          courses: enrollments.length,
          attendance: 95, // Placeholder, API doesn't provide this
        });
      } else {
        setStats({
          gpa: transcript.overallGPA || 0,
          credits: 0,
          courses: enrollments.length,
          attendance: 0,
        });
      }

      // Get today's day in Vietnamese format
      const dayOfWeek = new Date().getDay();
      const dayMap: Record<number, string> = {
        0: 'CN',
        1: 'Thứ 2',
        2: 'Thứ 3',
        3: 'Thứ 4',
        4: 'Thứ 5',
        5: 'Thứ 6',
        6: 'Thứ 7',
      };
      const todayName = dayMap[dayOfWeek];

      // Filter today's schedule - schedule có thể undefined
      const todayItems = enrollments
        .filter((e: MyEnrollment) => e.schedule?.includes(todayName))
        .map((e: MyEnrollment, index: number) => {
          // Extract time from schedule like "Thứ 2, 08:00-10:00"
          const timeMatch = e.schedule?.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
          const time = timeMatch ? `${timeMatch[1]} - ${timeMatch[2]}` : 'TBD';

          return {
            id: index + 1,
            time,
            course: e.courseName,
            code: e.courseCode, // Dùng courseCode thay vì classCode
            room: e.room,
            teacher: e.semesterName || '', // Dùng semesterName thay vì teacherName
          };
        });

      setTodaySchedule(todayItems);

      // Map enrollments to current courses with grades
      // Use the already flattened allCourses from above
      const coursesWithGrades = enrollments.map((e: MyEnrollment, index: number) => {
        const gradeInfo = allCourses.find((g: TranscriptCourse) => g.courseCode === e.courseCode);
        return {
          id: index + 1,
          code: e.courseCode,
          name: e.courseName,
          credits: e.credits,
          grade: gradeInfo?.grade || 'N/A',
        };
      });

      setCurrentCourses(coursesWithGrades.slice(0, 4));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Reset to empty state on error
      setStats(defaultStats);
      setTodaySchedule([]);
      setCurrentCourses([]);
    } finally {
      setIsLoading(false);
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
    <div className="space-y-6">
      {/* Hero Section - Đơn giản hơn, chuyên nghiệp */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-lg p-8 border border-border shadow-sm"
      >
        <p className="text-muted-foreground text-base">Xin chào,</p>
        <h1 className="text-3xl font-display font-bold text-foreground mt-2">
          {user?.fullName}
        </h1>
        <p className="text-muted-foreground mt-3">
          Chào mừng bạn quay lại. Học kỳ này bạn đang học{' '}
          <span className="text-foreground font-semibold">{stats.courses} môn</span>
          {' '}với tổng cộng{' '}
          <span className="text-foreground font-semibold">{stats.credits} tín chỉ</span>.
        </p>
      </motion.div>

      {/* Stats Grid - Style mới */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={itemVariants} className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">GPA Tích Lũy</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.gpa.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-secondary" />
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tín Chỉ Tích Lũy</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.credits}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-accent-foreground" />
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Môn Đang Học</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.courses}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-secondary" />
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Chuyên Cần</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.attendance}%</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2 space-y-4"
        >
          <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 table-header-bg border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-display font-bold text-foreground">
                  Lịch học hôm nay
                </h2>
                <Link to="/schedule">
                  <Button variant="ghost" size="sm" className="text-secondary hover:text-secondary/80">
                    Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              {todaySchedule.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Không có lịch học hôm nay</p>
                </div>
              ) : (
                todaySchedule.map((item, index) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-14 text-center">
                      <div className="bg-secondary rounded-lg p-3">
                        <Clock className="w-5 h-5 mx-auto text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold truncate text-foreground">{item.course}</p>
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-primary/20 text-foreground">
                          {item.code}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.time}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {item.room}
                        </span>
                        <span>|</span>
                        <span>{item.teacher}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Current Courses */}
          <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 table-header-bg border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-foreground">Môn đang học</h3>
                <Link to="/grades">
                  <Button variant="ghost" size="sm" className="text-secondary h-8 px-2">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {currentCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm text-foreground">{course.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {course.code} • {course.credits} TC
                    </p>
                  </div>
                  <GradeBadge grade={course.grade} />
                </div>
              ))}
            </div>
          </div>

          {/* AI Advisor Teaser */}
          <div className="bg-card rounded-lg border border-border shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-bold text-foreground">Tư vấn AI</h3>
                <p className="text-sm text-muted-foreground">
                  Nhận lời khuyên học tập được cá nhân hóa dựa trên kết quả của bạn.
                </p>
                <Link to="/ai-advisor">
                  <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-white mt-2">
                    Khám phá ngay
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
