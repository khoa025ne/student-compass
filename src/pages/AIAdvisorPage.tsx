import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Sparkles, Brain, TrendingUp, BookOpen, Target, RefreshCw, AlertTriangle, CheckCircle2, MapPin, GraduationCap, Award, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { LearningPathRecommendation, AcademicWarning } from '@/types';
import { toast } from 'sonner';

// Mock AI advice data (fallback when API fails)
const mockAnalysis = `Dựa trên kết quả học tập của bạn, tôi có một số gợi ý để cải thiện:

**📊 Phân tích tổng quan:**
- GPA hiện tại của bạn thuộc loại Khá
- Bạn có thế mạnh ở các môn chuyên ngành
- Một số môn đại cương cần được cải thiện

**💡 Đề xuất cho học kỳ tới:**

1. **Ưu tiên cải thiện các môn yếu:** 
   - Tham gia các buổi ôn tập nhóm
   - Làm thêm bài tập từ sách tham khảo
   - Có thể tìm gia sư nếu cần

2. **Tận dụng thế mạnh:** 
   - Đăng ký các môn chuyên ngành sớm
   - Cân nhắc tham gia CLB học thuật

3. **Số tín chỉ đề xuất:** Không nên đăng ký quá 18 tín chỉ để đảm bảo chất lượng học tập

**🎯 Mục tiêu khả thi:**
Nâng GPA lên mức tốt hơn trong học kỳ tới nếu cải thiện được các môn yếu và duy trì các môn còn lại.`;

const thinkingPhrases = [
  'Đang phân tích bảng điểm...',
  'Đang đánh giá điểm mạnh và yếu...',
  'Đang tạo lộ trình học tập...',
  'Đang hoàn thiện gợi ý...',
];

interface AIAnalysisResult {
  analysis: string;
  generatedAt: string;
}

// Severity colors
const severityColors: Record<string, string> = {
  'Critical': 'text-red-500 bg-red-500/10 border-red-500/20',
  'Warning': 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  'Info': 'text-blue-500 bg-blue-500/10 border-blue-500/20'
};

// Priority colors for courses
const priorityColors: Record<string, string> = {
  'High': 'border-red-500/50 bg-red-500/5',
  'Medium': 'border-yellow-500/50 bg-yellow-500/5',
  'Normal': 'border-green-500/50 bg-green-500/5'
};

export default function AIAdvisorPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPath, setIsGeneratingPath] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [learningPath, setLearningPath] = useState<LearningPathRecommendation | null>(null);
  const [warnings, setWarnings] = useState<AcademicWarning[]>([]);
  const [activeTab, setActiveTab] = useState<'advice' | 'path' | 'warnings'>('advice');
  const phraseIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user?.userId) {
      fetchAdvice();
      fetchLearningPath();
      fetchWarnings();
    }
    return () => {
      if (phraseIntervalRef.current) {
        clearInterval(phraseIntervalRef.current);
      }
    };
  }, [user?.userId]);

  const fetchLearningPath = async () => {
    try {
      const studentId = user?.studentId || user?.userId || 0;
      if (studentId === 0) return;
      
      const data = await apiClient.getLearningPathRecommendation(studentId);
      setLearningPath(data);
    } catch (error) {
      console.error('Failed to fetch learning path:', error);
    }
  };

  const fetchWarnings = async () => {
    try {
      const studentId = user?.studentId || user?.userId || 0;
      if (studentId === 0) return;
      
      const data = await apiClient.getAcademicWarnings(studentId);
      setWarnings(data);
    } catch (error) {
      console.error('Failed to fetch warnings:', error);
    }
  };

  const generateNewLearningPath = async () => {
    setIsGeneratingPath(true);
    try {
      const studentId = user?.studentId || user?.userId || 0;
      if (studentId === 0) return;
      
      const data = await apiClient.generateLearningPath({ studentId });
      setLearningPath(data);
      toast.success('Đã tạo lộ trình học tập mới!');
    } catch (error) {
      console.error('Failed to generate learning path:', error);
      toast.error('Không thể tạo lộ trình. Vui lòng thử lại.');
    } finally {
      setIsGeneratingPath(false);
    }
  };

  const checkNewWarnings = async () => {
    try {
      const studentId = user?.studentId || user?.userId || 0;
      if (studentId === 0) return;
      
      const data = await apiClient.checkWarnings(studentId);
      setWarnings(data);
      if (data.length > 0) {
        toast.warning(`Phát hiện ${data.length} cảnh báo học vụ!`);
      } else {
        toast.success('Không có cảnh báo học vụ nào.');
      }
    } catch (error) {
      console.error('Failed to check warnings:', error);
    }
  };

  const fetchAdvice = async () => {
    setIsLoading(true);
    setCurrentPhrase(0);
    
    // Start thinking animation
    phraseIntervalRef.current = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % thinkingPhrases.length);
    }, 1500);

    try {
      const studentId = user?.studentId || user?.userId || 0;
      if (studentId === 0) {
        setAnalysisResult({ analysis: mockAnalysis, generatedAt: new Date().toISOString() });
        return;
      }
      
      const data = await apiClient.getStudentAIAnalysis(studentId);
      setAnalysisResult({ analysis: data.analysis, generatedAt: new Date().toISOString() });
    } catch (error) {
      console.error('Failed to fetch AI advice:', error);
      // Use mock data if API fails
      setAnalysisResult({ analysis: mockAnalysis, generatedAt: new Date().toISOString() });
    } finally {
      setIsLoading(false);
      if (phraseIntervalRef.current) {
        clearInterval(phraseIntervalRef.current);
      }
    }
  };

  const handleRefresh = () => {
    setAnalysisResult(null);
    fetchAdvice();
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center glow-primary">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text">
              Tư vấn AI
            </h1>
            <p className="text-muted-foreground">
              Lời khuyên học tập và lộ trình được cá nhân hóa dựa trên kết quả của bạn
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-2"
      >
        <Button
          variant={activeTab === 'advice' ? 'default' : 'outline'}
          onClick={() => setActiveTab('advice')}
          className="gap-2"
        >
          <Brain className="w-4 h-4" />
          Lời khuyên
        </Button>
        <Button
          variant={activeTab === 'path' ? 'default' : 'outline'}
          onClick={() => setActiveTab('path')}
          className="gap-2"
        >
          <MapPin className="w-4 h-4" />
          Lộ trình học tập
          {learningPath && !learningPath.isViewed && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </Button>
        <Button
          variant={activeTab === 'warnings' ? 'default' : 'outline'}
          onClick={() => setActiveTab('warnings')}
          className="gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Cảnh báo học vụ
          {warnings.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs">
              {warnings.length}
            </span>
          )}
        </Button>
      </motion.div>

      {/* Loading State */}
      {isLoading && activeTab === 'advice' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-[400px]"
        >
          {/* Animated brain */}
          <div className="relative mb-8">
            <motion.div
              className="w-32 h-32 rounded-full gradient-bg opacity-20"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Brain className="w-16 h-16 text-primary" />
            </motion.div>

            {/* Orbiting dots */}
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="absolute w-4 h-4 rounded-full gradient-bg"
                style={{
                  top: '50%',
                  left: '50%',
                }}
                animate={{
                  x: [
                    Math.cos((index * 2 * Math.PI) / 3) * 60,
                    Math.cos((index * 2 * Math.PI) / 3 + Math.PI) * 60,
                    Math.cos((index * 2 * Math.PI) / 3) * 60,
                  ],
                  y: [
                    Math.sin((index * 2 * Math.PI) / 3) * 60,
                    Math.sin((index * 2 * Math.PI) / 3 + Math.PI) * 60,
                    Math.sin((index * 2 * Math.PI) / 3) * 60,
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.3,
                }}
              />
            ))}
          </div>

          {/* Thinking text */}
          <motion.p
            key={currentPhrase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-lg font-medium text-muted-foreground"
          >
            {thinkingPhrases[currentPhrase]}
          </motion.p>

          {/* Progress dots */}
          <div className="flex gap-2 mt-4">
            {[0, 1, 2, 3].map((index) => (
              <motion.div
                key={index}
                className={cn(
                  'w-2 h-2 rounded-full',
                  index <= currentPhrase ? 'gradient-bg' : 'bg-muted'
                )}
                animate={
                  index <= currentPhrase
                    ? { scale: [1, 1.3, 1] }
                    : {}
                }
                transition={{ duration: 0.5 }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Advice Content */}
      {!isLoading && analysisResult && activeTab === 'advice' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Advice Card */}
          <GlassCard className="relative overflow-hidden" delay={0.3}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 gradient-bg opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg">Lời khuyên cho bạn</h2>
                    <p className="text-xs text-muted-foreground">
                      Cập nhật: {new Date(analysisResult.generatedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Làm mới
                </Button>
              </div>

              {/* Markdown-like content */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {analysisResult.analysis.split('\n\n').map((paragraph, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="mb-4"
                  >
                    {paragraph.startsWith('**') ? (
                      <h3 className="font-display font-bold text-lg mb-2">
                        {paragraph.replace(/\*\*/g, '')}
                      </h3>
                    ) : paragraph.startsWith('-') || paragraph.match(/^\d\./) ? (
                      <div className="pl-4 space-y-2">
                        {paragraph.split('\n').map((line, lineIndex) => (
                          <p
                            key={lineIndex}
                            className="text-muted-foreground leading-relaxed"
                          >
                            {line.replace(/\*\*/g, '').replace(/^[-\d.]+\s*/, '• ')}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground leading-relaxed">
                        {paragraph.replace(/\*\*/g, '')}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Learning Path Content */}
      {activeTab === 'path' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Generate Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-display font-bold">Lộ trình học tập cá nhân hóa</h2>
            <Button
              onClick={generateNewLearningPath}
              disabled={isGeneratingPath}
              className="gap-2"
            >
              {isGeneratingPath ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Tạo lộ trình mới
                </>
              )}
            </Button>
          </div>

          {learningPath ? (
            <>
              {/* Overall Strategy */}
              <GlassCard className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 gradient-bg opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg">Chiến lược tổng thể</h3>
                      <p className="text-xs text-muted-foreground">
                        Được tạo bởi AI: {learningPath.aiModelUsed}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {learningPath.overallStrategy}
                  </p>
                </div>
              </GlassCard>

              {/* Recommended Courses */}
              {learningPath.recommendedCourses && learningPath.recommendedCourses.length > 0 && (
                <GlassCard>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-display font-bold text-lg">Môn học đề xuất</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {learningPath.recommendedCourses.map((course, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                          "p-4 rounded-xl border-2",
                          priorityColors[course.priority] || 'border-gray-500/50'
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{course.courseName}</h4>
                            <p className="text-sm text-muted-foreground">{course.courseCode}</p>
                          </div>
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            course.priority === 'High' ? 'bg-red-500/20 text-red-500' :
                            course.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-green-500/20 text-green-500'
                          )}>
                            {course.priority === 'High' ? 'Ưu tiên cao' :
                             course.priority === 'Medium' ? 'Ưu tiên vừa' : 'Bình thường'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{course.reason}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" />
                            {course.credits} tín chỉ
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            Điểm dự kiến: {course.expectedScore}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* Warnings from Learning Path */}
              {learningPath.warnings && learningPath.warnings.length > 0 && (
                <GlassCard>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-display font-bold text-lg">Lưu ý quan trọng</h3>
                  </div>
                  <div className="space-y-2">
                    {learningPath.warnings.map((warning, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10"
                      >
                        <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                        <span className="text-sm">{warning}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </>
          ) : (
            <GlassCard className="text-center py-12">
              <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-display font-bold text-lg mb-2">Chưa có lộ trình học tập</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Nhấn "Tạo lộ trình mới" để AI phân tích và đề xuất lộ trình học tập phù hợp với bạn
              </p>
              <Button onClick={generateNewLearningPath} disabled={isGeneratingPath}>
                <Sparkles className="w-4 h-4 mr-2" />
                Tạo lộ trình
              </Button>
            </GlassCard>
          )}
        </motion.div>
      )}

      {/* Warnings Content */}
      {activeTab === 'warnings' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Check Warnings Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-display font-bold">Cảnh báo học vụ</h2>
            <Button onClick={checkNewWarnings} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Kiểm tra cảnh báo
            </Button>
          </div>

          {warnings.length > 0 ? (
            <div className="space-y-4">
              {warnings.map((warning, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className={cn(
                    "border-l-4",
                    warning.severity === 'Critical' ? 'border-l-red-500' :
                    warning.severity === 'Warning' ? 'border-l-orange-500' : 'border-l-blue-500'
                  )}>
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-3 rounded-xl",
                        severityColors[warning.severity]
                      )}>
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-display font-bold">{warning.title}</h3>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium",
                            warning.severity === 'Critical' ? 'bg-red-500/20 text-red-500' :
                            warning.severity === 'Warning' ? 'bg-orange-500/20 text-orange-500' :
                            'bg-blue-500/20 text-blue-500'
                          )}>
                            {warning.severity === 'Critical' ? 'Nghiêm trọng' :
                             warning.severity === 'Warning' ? 'Cảnh báo' : 'Thông tin'}
                          </span>
                          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
                            {warning.type === 'LowGPA' ? 'GPA thấp' :
                             warning.type === 'MultipleF' ? 'Nhiều môn F' :
                             warning.type === 'NoEnrollment' ? 'Chưa đăng ký' :
                             warning.type === 'WeakSubjects' ? 'Môn yếu' : warning.type}
                          </span>
                        </div>
                        <p className="text-muted-foreground mb-3">{warning.message}</p>
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                          <p className="text-sm">
                            <span className="font-medium text-primary">💡 Đề xuất: </span>
                            {warning.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          ) : (
            <GlassCard className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <h3 className="font-display font-bold text-lg mb-2">Không có cảnh báo</h3>
              <p className="text-muted-foreground text-sm">
                Kết quả học tập của bạn đang ổn định. Hãy tiếp tục phát huy!
              </p>
            </GlassCard>
          )}
        </motion.div>
      )}
    </div>
  );
}
