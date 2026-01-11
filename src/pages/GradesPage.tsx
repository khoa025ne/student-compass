import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { GradeBadge, StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';
import { TrendingUp, Award, BookOpen, Target } from 'lucide-react';

// Mock transcript data
const mockTranscript = {
  studentName: 'Nguyễn Văn A',
  cumulativeGPA: 7.85,
  currentSemester: '2024.1',
  totalCredits: 42,
  courses: [
    {
      courseCode: 'CS101',
      courseName: 'Lập Trình Web',
      credits: 3,
      classCode: 'CS101-01',
      participation: 8.5,
      quiz: 7.5,
      assignment: 8.0,
      midterm: 7.5,
      final: 8.0,
      finalScore: 7.85,
      letterGrade: 'B',
      isOfficial: true,
    },
    {
      courseCode: 'CS102',
      courseName: 'Cơ Sở Dữ Liệu',
      credits: 3,
      classCode: 'CS102-02',
      participation: 9.0,
      quiz: 8.5,
      assignment: 9.0,
      midterm: 8.0,
      final: 9.0,
      finalScore: 8.65,
      letterGrade: 'A',
      isOfficial: true,
    },
    {
      courseCode: 'MA101',
      courseName: 'Toán Cao Cấp',
      credits: 4,
      classCode: 'MA101-01',
      participation: 7.0,
      quiz: 7.0,
      assignment: 7.5,
      midterm: 6.5,
      final: 7.0,
      finalScore: 6.95,
      letterGrade: 'C+',
      isOfficial: true,
    },
    {
      courseCode: 'EN101',
      courseName: 'Tiếng Anh 1',
      credits: 3,
      classCode: 'EN101-01',
      participation: 9.5,
      quiz: 9.0,
      assignment: 9.5,
      midterm: 9.0,
      final: 9.5,
      finalScore: 9.35,
      letterGrade: 'A+',
      isOfficial: true,
    },
    {
      courseCode: 'CS103',
      courseName: 'Thuật Toán',
      credits: 3,
      classCode: 'CS103-01',
      participation: 8.0,
      quiz: 7.5,
      assignment: 8.5,
      midterm: 7.0,
      final: 8.0,
      finalScore: 7.75,
      letterGrade: 'B',
      isOfficial: false,
    },
  ],
};

const getGPAColor = (gpa: number) => {
  if (gpa >= 8.5) return 'text-success';
  if (gpa >= 7.0) return 'text-primary';
  if (gpa >= 5.5) return 'text-warning';
  return 'text-destructive';
};

const getScoreColor = (score: number) => {
  if (score >= 8.5) return 'text-success';
  if (score >= 7.0) return 'text-primary';
  if (score >= 5.5) return 'text-warning';
  return 'text-destructive';
};

export default function GradesPage() {
  const officialCourses = mockTranscript.courses.filter((c) => c.isOfficial);
  const pendingCourses = mockTranscript.courses.filter((c) => !c.isOfficial);

  return (
    <div className="container mx-auto px-4 sm:px-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text">
          Bảng điểm
        </h1>
        <p className="text-muted-foreground">
          Học kỳ {mockTranscript.currentSemester} • {mockTranscript.studentName}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard delay={0.1}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">GPA Tích Lũy</p>
              <p
                className={cn(
                  'text-3xl font-display font-bold',
                  getGPAColor(mockTranscript.cumulativeGPA)
                )}
              >
                {mockTranscript.cumulativeGPA.toFixed(2)}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.15}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-success/20 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tín Chỉ</p>
              <p className="text-3xl font-display font-bold text-success">
                {mockTranscript.totalCredits}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.2}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center">
              <Award className="w-7 h-7 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Xếp Loại</p>
              <p className="text-3xl font-display font-bold text-accent">Khá</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.25}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-warning/20 flex items-center justify-center">
              <Target className="w-7 h-7 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Số Môn</p>
              <p className="text-3xl font-display font-bold text-warning">
                {mockTranscript.courses.length}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* GPA Visualization */}
      <GlassCard delay={0.3}>
        <h2 className="font-display font-bold text-lg mb-6">Phân bố điểm</h2>
        <div className="flex items-end justify-center gap-4 h-48">
          {mockTranscript.courses.map((course, index) => {
            const height = (course.finalScore / 10) * 100;
            return (
              <motion.div
                key={course.courseCode}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                className="group relative"
              >
                <div
                  className={cn(
                    'w-12 sm:w-16 rounded-t-lg transition-all duration-300 group-hover:opacity-80 h-full',
                    course.finalScore >= 8.5
                      ? 'bg-gradient-to-t from-success/60 to-success'
                      : course.finalScore >= 7.0
                      ? 'bg-gradient-to-t from-primary/60 to-primary'
                      : course.finalScore >= 5.5
                      ? 'bg-gradient-to-t from-warning/60 to-warning'
                      : 'bg-gradient-to-t from-destructive/60 to-destructive'
                  )}
                />
                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="glass-card-elevated px-3 py-2 rounded-lg text-sm whitespace-nowrap">
                    <p className="font-semibold">{course.courseName}</p>
                    <p className="text-muted-foreground">{course.finalScore.toFixed(2)}</p>
                  </div>
                </div>
                {/* Label */}
                <p className="text-xs text-muted-foreground text-center mt-2 truncate max-w-[60px]">
                  {course.courseCode}
                </p>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      {/* Official Grades Table */}
      <div className="space-y-4">
        <h2 className="font-display font-bold text-xl">Điểm chính thức</h2>
        <GlassCard className="overflow-hidden p-0" delay={0.4}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 font-semibold">Môn học</th>
                  <th className="text-center p-4 font-semibold hidden sm:table-cell">TC</th>
                  <th className="text-center p-4 font-semibold hidden md:table-cell">CC</th>
                  <th className="text-center p-4 font-semibold hidden md:table-cell">BT</th>
                  <th className="text-center p-4 font-semibold hidden lg:table-cell">GK</th>
                  <th className="text-center p-4 font-semibold hidden lg:table-cell">CK</th>
                  <th className="text-center p-4 font-semibold">Điểm TB</th>
                  <th className="text-center p-4 font-semibold">Xếp loại</th>
                </tr>
              </thead>
              <tbody>
                {officialCourses.map((course, index) => (
                  <motion.tr
                    key={course.courseCode}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{course.courseName}</p>
                        <p className="text-xs text-muted-foreground">
                          {course.classCode}
                        </p>
                      </div>
                    </td>
                    <td className="text-center p-4 hidden sm:table-cell">
                      {course.credits}
                    </td>
                    <td className="text-center p-4 hidden md:table-cell">
                      <span className={getScoreColor(course.participation)}>
                        {course.participation.toFixed(1)}
                      </span>
                    </td>
                    <td className="text-center p-4 hidden md:table-cell">
                      <span className={getScoreColor(course.assignment)}>
                        {course.assignment.toFixed(1)}
                      </span>
                    </td>
                    <td className="text-center p-4 hidden lg:table-cell">
                      <span className={getScoreColor(course.midterm)}>
                        {course.midterm.toFixed(1)}
                      </span>
                    </td>
                    <td className="text-center p-4 hidden lg:table-cell">
                      <span className={getScoreColor(course.final)}>
                        {course.final.toFixed(1)}
                      </span>
                    </td>
                    <td className="text-center p-4">
                      <span
                        className={cn(
                          'font-bold text-lg',
                          getScoreColor(course.finalScore)
                        )}
                      >
                        {course.finalScore.toFixed(2)}
                      </span>
                    </td>
                    <td className="text-center p-4">
                      <GradeBadge grade={course.letterGrade} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* Pending Grades */}
      {pendingCourses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-xl">Điểm chưa chính thức</h2>
            <StatusBadge variant="warning">Đang chờ duyệt</StatusBadge>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {pendingCourses.map((course, index) => (
              <motion.div
                key={course.courseCode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <GlassCard className="border-warning/30 bg-warning/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{course.courseName}</p>
                      <p className="text-sm text-muted-foreground">{course.classCode}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          'text-2xl font-display font-bold',
                          getScoreColor(course.finalScore)
                        )}
                      >
                        {course.finalScore.toFixed(2)}
                      </p>
                      <GradeBadge grade={course.letterGrade} />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
