import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';

// Mock schedule data
const mockSchedule = [
  {
    id: 1,
    courseCode: 'CS101',
    courseName: 'Lập Trình Web',
    classCode: 'CS101-01',
    room: 'A101',
    teacher: 'Nguyễn Văn A',
    dayOfWeek: 'Monday',
    startTime: '08:00',
    endTime: '10:00',
    color: 'from-cyan-500 to-teal-500',
  },
  {
    id: 2,
    courseCode: 'CS102',
    courseName: 'Cơ Sở Dữ Liệu',
    classCode: 'CS102-02',
    room: 'B205',
    teacher: 'Trần Thị B',
    dayOfWeek: 'Monday',
    startTime: '10:30',
    endTime: '12:30',
    color: 'from-violet-500 to-purple-500',
  },
  {
    id: 3,
    courseCode: 'MA101',
    courseName: 'Toán Cao Cấp',
    classCode: 'MA101-01',
    room: 'C301',
    teacher: 'Lê Văn C',
    dayOfWeek: 'Tuesday',
    startTime: '08:00',
    endTime: '10:00',
    color: 'from-orange-500 to-amber-500',
  },
  {
    id: 4,
    courseCode: 'EN101',
    courseName: 'Tiếng Anh 1',
    classCode: 'EN101-01',
    room: 'D102',
    teacher: 'Phạm Thị D',
    dayOfWeek: 'Wednesday',
    startTime: '14:00',
    endTime: '16:00',
    color: 'from-rose-500 to-pink-500',
  },
  {
    id: 5,
    courseCode: 'CS101',
    courseName: 'Lập Trình Web',
    classCode: 'CS101-01',
    room: 'A101',
    teacher: 'Nguyễn Văn A',
    dayOfWeek: 'Thursday',
    startTime: '08:00',
    endTime: '10:00',
    color: 'from-cyan-500 to-teal-500',
  },
  {
    id: 6,
    courseCode: 'CS103',
    courseName: 'Thuật Toán',
    classCode: 'CS103-01',
    room: 'A203',
    teacher: 'Hoàng Văn E',
    dayOfWeek: 'Friday',
    startTime: '10:30',
    endTime: '12:30',
    color: 'from-emerald-500 to-green-500',
  },
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dayLabels: Record<string, string> = {
  Monday: 'Thứ 2',
  Tuesday: 'Thứ 3',
  Wednesday: 'Thứ 4',
  Thursday: 'Thứ 5',
  Friday: 'Thứ 6',
  Saturday: 'Thứ 7',
};

const timeSlots = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
];

const getSchedulePosition = (startTime: string, endTime: string) => {
  const parseTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + minutes / 60;
  };

  const startHour = parseTime(startTime);
  const endHour = parseTime(endTime);
  const baseHour = 7; // 07:00

  const top = ((startHour - baseHour) / 11) * 100;
  const height = ((endHour - startHour) / 11) * 100;

  return { top: `${top}%`, height: `${height}%` };
};

export default function SchedulePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text">
          Thời khóa biểu
        </h1>
        <p className="text-muted-foreground">
          Học kỳ 2024.1 • Xem lịch học của bạn trong tuần
        </p>
      </motion.div>

      {/* Schedule Legend */}
      <GlassCard delay={0.1}>
        <div className="flex flex-wrap gap-3">
          {mockSchedule
            .filter((item, index, self) => 
              index === self.findIndex((t) => t.courseCode === item.courseCode)
            )
            .map((item) => (
              <div key={item.courseCode} className="flex items-center gap-2">
                <div className={cn('w-3 h-3 rounded-full bg-gradient-to-r', item.color)} />
                <span className="text-sm">{item.courseName}</span>
              </div>
            ))}
        </div>
      </GlassCard>

      {/* Timetable Grid */}
      <GlassCard className="p-0 overflow-hidden" delay={0.2}>
        <div className="grid grid-cols-[80px_repeat(6,1fr)]">
          {/* Header row */}
          <div className="p-4 border-b border-border bg-muted/30" />
          {days.map((day) => (
            <div
              key={day}
              className="p-4 text-center font-semibold border-b border-l border-border bg-muted/30"
            >
              <span className="hidden sm:inline">{dayLabels[day]}</span>
              <span className="sm:hidden">{dayLabels[day].replace('Thứ ', 'T')}</span>
            </div>
          ))}

          {/* Time slots and schedule */}
          <div className="col-span-7 grid grid-cols-[80px_repeat(6,1fr)]">
            {/* Time column */}
            <div className="border-r border-border">
              {timeSlots.map((time) => (
                <div
                  key={time}
                  className="h-16 flex items-center justify-center text-xs text-muted-foreground border-b border-border"
                >
                  {time}
                </div>
              ))}
            </div>

            {/* Days columns */}
            {days.map((day) => (
              <div key={day} className="relative border-l border-border">
                {/* Time slot backgrounds */}
                {timeSlots.map((time) => (
                  <div
                    key={time}
                    className="h-16 border-b border-border hover:bg-muted/30 transition-colors"
                  />
                ))}

                {/* Schedule items */}
                {mockSchedule
                  .filter((item) => item.dayOfWeek === day)
                  .map((item, index) => {
                    const position = getSchedulePosition(item.startTime, item.endTime);
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="absolute left-1 right-1 group cursor-pointer"
                        style={{ top: position.top, height: position.height }}
                      >
                        <div
                          className={cn(
                            'h-full rounded-lg p-2 bg-gradient-to-br shadow-lg',
                            'transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl',
                            item.color
                          )}
                        >
                          <div className="h-full flex flex-col text-white">
                            <p className="font-semibold text-xs truncate">
                              {item.courseName}
                            </p>
                            <p className="text-[10px] opacity-80 truncate">
                              {item.startTime} - {item.endTime}
                            </p>
                            <p className="text-[10px] opacity-80 mt-auto truncate">
                              {item.room}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Schedule list for mobile */}
      <div className="lg:hidden space-y-4">
        <h2 className="text-xl font-display font-bold">Danh sách môn học</h2>
        <div className="space-y-3">
          {mockSchedule.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg shrink-0',
                      item.color
                    )}
                  >
                    {item.courseCode.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold truncate">{item.courseName}</p>
                      <StatusBadge variant="secondary">{item.classCode}</StatusBadge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {dayLabels[item.dayOfWeek]} • {item.startTime} - {item.endTime}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Phòng {item.room} • {item.teacher}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
