import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { GlassCard } from '@/components/ui/glass-card';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge, GradeBadge } from '@/components/ui/status-badge';
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

// Mock data for dashboard
const mockStats = {
  gpa: 7.85,
  credits: 42,
  courses: 5,
  attendance: 95,
};

const mockTodaySchedule = [
  {
    id: 1,
    time: '08:00 - 10:00',
    course: 'Lập Trình Web',
    code: 'CS101-01',
    room: 'A101',
    teacher: 'Nguyễn Văn A',
  },
  {
    id: 2,
    time: '10:30 - 12:30',
    course: 'Cơ Sở Dữ Liệu',
    code: 'CS102-02',
    room: 'B205',
    teacher: 'Trần Thị B',
  },
  {
    id: 3,
    time: '14:00 - 16:00',
    course: 'Toán Cao Cấp',
    code: 'MA101-01',
    room: 'C301',
    teacher: 'Lê Văn C',
  },
];

const mockCurrentCourses = [
  { id: 1, code: 'CS101', name: 'Lập Trình Web', credits: 3, grade: 'B+' },
  { id: 2, code: 'CS102', name: 'Cơ Sở Dữ Liệu', credits: 3, grade: 'A' },
  { id: 3, code: 'MA101', name: 'Toán Cao Cấp', credits: 4, grade: 'B' },
  { id: 4, code: 'EN101', name: 'Tiếng Anh 1', credits: 3, grade: 'A+' },
];

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
            {user?.firstName} {user?.lastName}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-primary-foreground/70 mt-4 max-w-lg"
          >
            Chào mừng bạn quay lại. Học kỳ này bạn đang học{' '}
            <span className="text-primary-foreground font-semibold">
              {mockStats.courses} môn
            </span>{' '}
            với tổng cộng{' '}
            <span className="text-primary-foreground font-semibold">
              {mockStats.credits} tín chỉ
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
          value={mockStats.gpa.toFixed(2)}
          icon={<TrendingUp className="w-6 h-6" />}
          trend={{ value: 3.2, isPositive: true }}
          delay={0.1}
        />
        <StatCard
          title="Tín Chỉ Tích Lũy"
          value={mockStats.credits}
          icon={<BookOpen className="w-6 h-6" />}
          delay={0.2}
        />
        <StatCard
          title="Môn Đang Học"
          value={mockStats.courses}
          icon={<Calendar className="w-6 h-6" />}
          delay={0.3}
        />
        <StatCard
          title="Tỷ Lệ Chuyên Cần"
          value={`${mockStats.attendance}%`}
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
            {mockTodaySchedule.map((item, index) => (
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
              {mockCurrentCourses.map((course) => (
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
