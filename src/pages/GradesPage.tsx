import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { GradeBadge } from '@/components/ui/status-badge';
import { LoadingSpinner } from '@/components/ui/loading';
import { cn } from '@/lib/utils';
import { TrendingUp, Award, BookOpen, Target } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { TranscriptResponse, TranscriptSemester, TranscriptCourse } from '@/types';

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

const getGPAClassification = (gpa: number) => {
  if (gpa >= 9.0) return 'Xuất sắc';
  if (gpa >= 8.0) return 'Giỏi';
  if (gpa >= 7.0) return 'Khá';
  if (gpa >= 5.5) return 'Trung bình';
  return 'Yếu';
};

interface ExtendedTranscript extends TranscriptResponse {
  totalCredits: number;
  allCourses: TranscriptCourse[];
}

export default function GradesPage() {
  const { user } = useAuthStore();
  const [transcript, setTranscript] = useState<ExtendedTranscript | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.userId) {
      fetchGrades();
    }
  }, [user?.userId]);

  const fetchGrades = async () => {
    setIsLoading(true);
    try {
      // Get studentId from user
      const studentId = user?.studentId || user?.userId || 0;
      
      if (studentId === 0) {
        setTranscript(null);
        return;
      }

      const data = await apiClient.getStudentTranscript(studentId);
      
      // Flatten all courses from all semesters
      const allCourses = data.details.flatMap((semester: TranscriptSemester) => semester.courses);
      
      // Calculate total credits
      const totalCredits = allCourses
        .filter((c: TranscriptCourse) => c.status === 'Passed')
        .reduce((sum: number, c: TranscriptCourse) => sum + c.credits, 0);
      
      setTranscript({ ...data, totalCredits, allCourses });
    } catch (error) {
      console.error('Failed to fetch grades:', error);
      setTranscript(null);
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

  if (!transcript) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="text-center text-muted-foreground">
          Không có dữ liệu bảng điểm
        </div>
      </div>
    );
  }

  const allCourses = transcript.allCourses;
  const passedCourses = allCourses.filter((c) => c.status === 'Passed');
  const failedCourses = allCourses.filter((c) => c.status === 'Failed');
  const inProgressCourses = allCourses.filter((c) => c.status === 'InProgress');

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
          {transcript.fullName} • MSSV: {transcript.studentCode}
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
                  getGPAColor(transcript.overallGPA)
                )}
              >
                {transcript.overallGPA.toFixed(2)}
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
                {transcript.totalCredits}
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
              <p className="text-3xl font-display font-bold text-accent">{getGPAClassification(transcript.overallGPA)}</p>
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
                {allCourses.length}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* GPA Visualization */}
      <GlassCard delay={0.3}>
        <h2 className="font-display font-bold text-lg mb-6">Phân bố điểm</h2>
        <div className="flex items-end justify-center gap-4 h-48 overflow-x-auto pb-4">
          {allCourses.slice(0, 10).map((course, index) => {
            const scoreValue = course.score ?? 0;
            const height = (scoreValue / 10) * 100;
            return (
              <motion.div
                key={`${course.courseCode}-${index}`}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                className="group relative"
              >
                <div
                  className={cn(
                    'w-12 sm:w-16 rounded-t-lg transition-all duration-300 group-hover:opacity-80 h-full',
                    scoreValue >= 8.5
                      ? 'bg-gradient-to-t from-success/60 to-success'
                      : scoreValue >= 7.0
                      ? 'bg-gradient-to-t from-primary/60 to-primary'
                      : scoreValue >= 5.5
                      ? 'bg-gradient-to-t from-warning/60 to-warning'
                      : 'bg-gradient-to-t from-destructive/60 to-destructive'
                  )}
                />
                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="glass-card-elevated px-3 py-2 rounded-lg text-sm whitespace-nowrap">
                    <p className="font-semibold">{course.courseName}</p>
                    <p className="text-muted-foreground">{scoreValue.toFixed(2)}</p>
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

      {/* Grades by Semester */}
      {transcript.details.map((semester, semesterIndex) => (
        <div key={semesterIndex} className="space-y-4">
          <h2 className="font-display font-bold text-xl">
            {semester.semester}
            {semester.semesterGPA > 0 && (
              <span className={cn('ml-4 text-base', getGPAColor(semester.semesterGPA))}>
                GPA: {semester.semesterGPA.toFixed(2)}
              </span>
            )}
          </h2>
          <GlassCard className="overflow-hidden p-0" delay={0.4 + semesterIndex * 0.1}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-4 font-semibold">Môn học</th>
                    <th className="text-center p-4 font-semibold hidden sm:table-cell">TC</th>
                    <th className="text-center p-4 font-semibold">Điểm</th>
                    <th className="text-center p-4 font-semibold">Xếp loại</th>
                    <th className="text-center p-4 font-semibold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {semester.courses.map((course, index) => (
                    <motion.tr
                      key={`${course.courseCode}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{course.courseName}</p>
                          <p className="text-xs text-muted-foreground">
                            {course.courseCode}
                          </p>
                        </div>
                      </td>
                      <td className="text-center p-4 hidden sm:table-cell">
                        {course.credits}
                      </td>
                      <td className="text-center p-4">
                        <span
                          className={cn(
                            'font-bold text-lg',
                            getScoreColor(course.score ?? 0)
                          )}
                        >
                          {(course.score ?? 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="text-center p-4">
                        <GradeBadge grade={course.grade || ''} />
                      </td>
                      <td className="text-center p-4">
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          course.status === 'Passed' && 'bg-success/20 text-success',
                          course.status === 'Failed' && 'bg-destructive/20 text-destructive',
                          course.status === 'InProgress' && 'bg-warning/20 text-warning'
                        )}>
                          {course.status === 'Passed' ? 'Đạt' : course.status === 'Failed' ? 'Không đạt' : 'Đang học'}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      ))}

      {/* Summary */}
      {(failedCourses.length > 0 || inProgressCourses.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {failedCourses.length > 0 && (
            <GlassCard className="border-destructive/30 bg-destructive/5" delay={0.6}>
              <h3 className="font-display font-bold text-lg mb-4 text-destructive">
                Môn chưa đạt ({failedCourses.length})
              </h3>
              <div className="space-y-2">
                {failedCourses.map((course, index) => (
                  <div key={`failed-${course.courseCode}-${index}`} className="flex justify-between items-center py-2 border-b border-destructive/20 last:border-0">
                    <div>
                      <p className="font-medium">{course.courseName}</p>
                      <p className="text-xs text-muted-foreground">{course.courseCode}</p>
                    </div>
                    <span className="text-destructive font-bold">{(course.score ?? 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {inProgressCourses.length > 0 && (
            <GlassCard className="border-warning/30 bg-warning/5" delay={0.65}>
              <h3 className="font-display font-bold text-lg mb-4 text-warning">
                Đang học ({inProgressCourses.length})
              </h3>
              <div className="space-y-2">
                {inProgressCourses.map((course, index) => (
                  <div key={`progress-${course.courseCode}-${index}`} className="flex justify-between items-center py-2 border-b border-warning/20 last:border-0">
                    <div>
                      <p className="font-medium">{course.courseName}</p>
                      <p className="text-xs text-muted-foreground">{course.courseCode}</p>
                    </div>
                    <span className="text-warning font-bold">{course.credits} TC</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
