import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { GlassCard } from '@/components/ui/glass-card';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge, GradeBadge } from '@/components/ui/status-badge';
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
import type { MyEnrollment, CourseGrade, TranscriptResponse } from '@/types';

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
      if (transcript && transcript.courses && transcript.courses.length > 0) {
        const totalCredits = transcript.courses.reduce((sum: number, g: CourseGrade) => sum + g.credits, 0);

        setStats({
          gpa: transcript.cumulativeGPA,
          credits: totalCredits,
          courses: enrollments.length,
          attendance: 95, // Placeholder, API doesn't provide this
        });
      } else {
        setStats({
          gpa: 0,
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

      // Filter today's schedule
      const todayItems = enrollments
        .filter((e: MyEnrollment) => e.schedule.includes(todayName))
        .map((e: MyEnrollment, index: number) => {
          // Extract time from schedule like "Thứ 2, 08:00-10:00"
          const timeMatch = e.schedule.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
          const time = timeMatch ? `${timeMatch[1]} - ${timeMatch[2]}` : 'TBD';

          return {
            id: index + 1,
            time,
            course: e.courseName,
            code: e.classCode,
            room: e.room,
            teacher: e.teacherName,
          };
        });

      setTodaySchedule(todayItems);

      // Map enrollments to current courses with grades
      const coursesWithGrades = enrollments.map((e: MyEnrollment, index: number) => {
        const gradeInfo = transcript?.courses?.find((g: CourseGrade) => g.courseCode === e.courseCode);
        return {
          id: index + 1,
          code: e.courseCode,
          name: e.courseName,
          credits: e.credits,
          grade: gradeInfo?.letterGrade || 'N/A',
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
    <div className="container mx-auto px-4 sm:px-6 space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl gradient-bg p-8 md:p-12"
      >
        <div className="relative z-10">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-primary-foreground/80 text-lg"
          >
            Xin chào,
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mt-2"
          >
            {user?.fullName}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-primary-foreground/70 mt-4 max-w-lg"
          >
            Chào mừng bạn quay lại. Học kỳ này bạn đang học{' '}
            <span className="text-primary-foreground font-semibold">
              {stats.courses} môn
            </span>{' '}
            với tổng cộng{' '}
            <span className="text-primary-foreground font-semibold">
              {stats.credits} tín chỉ
            </span>
            .
          </motion.p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2" />
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="GPA Tích Lũy"
          value={stats.gpa.toFixed(2)}
          icon={<TrendingUp className="w-6 h-6" />}
          trend={{ value: 3.2, isPositive: true }}
          delay={0.1}
        />
        <StatCard
          title="Tín Chỉ Tích Lũy"
          value={stats.credits}
          icon={<BookOpen className="w-6 h-6" />}
          delay={0.2}
        />
        <StatCard
          title="Môn Đang Học"
          value={stats.courses}
          icon={<Calendar className="w-6 h-6" />}
          delay={0.3}
        />
        <StatCard
          title="Tỷ Lệ Chuyên Cần"
          value={`${stats.attendance}%`}
          icon={<Clock className="w-6 h-6" />}
          delay={0.4}
        />
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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold">Lịch học hôm nay</h2>
            <Link to="/schedule">
              <Button variant="ghost" size="sm" className="text-primary">
                Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {todaySchedule.map((item, index) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="flex items-center gap-4 p-4" delay={0.1 * index}>
                  <div className="w-16 text-center">
                    <div className="gradient-bg rounded-xl p-3">
                      <Clock className="w-5 h-5 mx-auto text-primary-foreground" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold truncate">{item.course}</p>
                      <StatusBadge variant="secondary">{item.code}</StatusBadge>
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
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Current Courses */}
          <GlassCard delay={0.3}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold">Môn đang học</h3>
              <Link to="/grades">
                <Button variant="ghost" size="sm" className="text-primary h-8 px-2">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {currentCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted/80 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{course.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {course.code} • {course.credits} TC
                    </p>
                  </div>
                  <GradeBadge grade={course.grade} />
                </div>
              ))}
            </div>
          </GlassCard>

          {/* AI Advisor Teaser */}
          <GlassCard className="gradient-border" delay={0.4}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shrink-0 glow-primary">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-bold">Tư vấn AI</h3>
                <p className="text-sm text-muted-foreground">
                  Nhận lời khuyên học tập được cá nhân hóa dựa trên kết quả của bạn.
                </p>
                <Link to="/ai-advisor">
                  <Button size="sm" className="gradient-bg text-primary-foreground mt-2">
                    Khám phá ngay
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
