import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Sparkles, Brain, TrendingUp, BookOpen, Target, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock AI advice data
const mockAdvice = {
  studentId: 1,
  studentName: 'Nguyễn Văn A',
  cumulativeGPA: 7.85,
  advice: `Dựa trên kết quả học tập của bạn, tôi có một số gợi ý để cải thiện:

**📊 Phân tích tổng quan:**
- GPA hiện tại của bạn là 7.85 - thuộc loại Khá, rất gần với mức Giỏi (8.0)
- Bạn có thế mạnh ở các môn Tiếng Anh và Cơ Sở Dữ Liệu
- Môn Toán Cao Cấp cần được cải thiện

**💡 Đề xuất cho học kỳ tới:**

1. **Ưu tiên cải thiện Toán:** Với điểm C+ ở Toán Cao Cấp, bạn nên:
   - Tham gia các buổi ôn tập nhóm
   - Làm thêm bài tập từ sách tham khảo
   - Có thể tìm gia sư nếu cần

2. **Tận dụng thế mạnh Tiếng Anh:** Với điểm A+ ở Tiếng Anh, bạn nên:
   - Đăng ký môn Tiếng Anh Chuyên Ngành sớm
   - Cân nhắc tham gia CLB Tiếng Anh để duy trì

3. **Số tín chỉ đề xuất:** Không nên đăng ký quá 18 tín chỉ để đảm bảo chất lượng học tập

4. **Lộ trình môn học:**
   - Nên học CS201 (Kỹ Thuật Phần Mềm) - là tiền đề cho nhiều môn chuyên ngành
   - Có thể học thêm 1 môn đại cương để cân bằng

**🎯 Mục tiêu khả thi:**
Nâng GPA lên 8.0+ trong học kỳ tới nếu cải thiện được môn Toán và duy trì các môn còn lại.`,
  generatedAt: '2024-01-11T10:00:00Z',
};

const thinkingPhrases = [
  'Đang phân tích bảng điểm...',
  'Đang đánh giá điểm mạnh và yếu...',
  'Đang tạo lộ trình học tập...',
  'Đang hoàn thiện gợi ý...',
];

export default function AIAdvisorPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [advice, setAdvice] = useState<typeof mockAdvice | null>(null);

  useEffect(() => {
    // Simulate loading with thinking phrases
    const phraseInterval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % thinkingPhrases.length);
    }, 1500);

    // Simulate API call
    const loadTimeout = setTimeout(() => {
      setAdvice(mockAdvice);
      setIsLoading(false);
      clearInterval(phraseInterval);
    }, 5000);

    return () => {
      clearInterval(phraseInterval);
      clearTimeout(loadTimeout);
    };
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setAdvice(null);
    setCurrentPhrase(0);

    setTimeout(() => {
      setAdvice(mockAdvice);
      setIsLoading(false);
    }, 3000);
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
              Lời khuyên học tập được cá nhân hóa dựa trên kết quả của bạn
            </p>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
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
      {!isLoading && advice && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4">
            <GlassCard delay={0.1}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">GPA</p>
                  <p className="text-xl font-display font-bold gradient-text">
                    {advice.cumulativeGPA.toFixed(2)}
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard delay={0.15}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Xếp Loại</p>
                  <p className="text-xl font-display font-bold text-success">Khá</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard delay={0.2}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Mục tiêu</p>
                  <p className="text-xl font-display font-bold text-accent">8.0+</p>
                </div>
              </div>
            </GlassCard>
          </div>

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
                      Cập nhật: {new Date(advice.generatedAt).toLocaleDateString('vi-VN')}
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
                {advice.advice.split('\n\n').map((paragraph, index) => (
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
    </div>
  );
}
