import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { LoadingSpinner } from '@/components/ui/loading';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { ScheduleItem as APIScheduleItem, DayOfWeekPair, TimeSlot } from '@/types';

interface ScheduleDisplayItem {
  id: number;
  courseCode: string;
  courseName: string;
  className: string;
  room: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  color: string;
}

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

// Convert DayOfWeekPair and TimeSlot to display values
const getDaysFromPair = (pair: DayOfWeekPair): string[] => {
  const mapping: Record<number, string[]> = {
    1: ['Monday', 'Thursday'],  // 2-5
    2: ['Tuesday', 'Friday'],   // 3-6
    3: ['Wednesday', 'Saturday'], // 4-7
  };
  return mapping[pair] || [];
};

const getTimeFromSlot = (slot: TimeSlot): { start: string; end: string } => {
  const mapping: Record<number, { start: string; end: string }> = {
    1: { start: '07:30', end: '09:50' },
    2: { start: '10:00', end: '12:20' },
    3: { start: '12:50', end: '15:10' },
    4: { start: '15:20', end: '17:40' },
  };
  return mapping[slot] || { start: '08:00', end: '10:00' };
};

// Generate color based on course code
const getColorForCourse = (courseCode: string): string => {
  const colors = [
    'from-cyan-500 to-teal-500',
    'from-violet-500 to-purple-500',
    'from-orange-500 to-amber-500',
    'from-rose-500 to-pink-500',
    'from-emerald-500 to-green-500',
    'from-blue-500 to-indigo-500',
    'from-red-500 to-orange-500',
  ];
  const hash = courseCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export default function SchedulePage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [schedule, setSchedule] = useState<ScheduleDisplayItem[]>([]);

  useEffect(() => {
    if (user?.userId) {
      fetchSchedule();
    }
  }, [user?.userId]);

  const fetchSchedule = async () => {
    setIsLoading(true);
    try {
      // Get studentId from user - for now use userId directly
      // In production, you might need to map userId to studentId
      const studentId = user?.studentId || user?.userId || 0;
      
      if (studentId === 0) {
        setSchedule([]);
        return;
      }

      const scheduleData = await apiClient.getStudentSchedule(studentId);
      
      // Convert API schedule items to display items
      const scheduleItems: ScheduleDisplayItem[] = scheduleData.flatMap((item, index) => {
        const days = getDaysFromPair(item.dayOfWeekPair);
        const time = getTimeFromSlot(item.timeSlot);
        const color = getColorForCourse(item.courseCode);
        
        // Create an entry for each day in the pair
        return days.map((dayOfWeek, dayIndex) => ({
          id: index * 2 + dayIndex + 1,
          courseCode: item.courseCode,
          courseName: item.courseName,
          className: item.className,
          room: item.room,
          dayOfWeek,
          startTime: time.start,
          endTime: time.end,
          color,
        }));
      });
      
      setSchedule(scheduleItems);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
      setSchedule([]);
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
          {schedule
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
                {schedule
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
          {schedule.map((item, index) => (
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
                      <span className="px-2 py-0.5 rounded-full text-xs bg-muted">{item.className}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {dayLabels[item.dayOfWeek]} • {item.startTime} - {item.endTime}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Phòng {item.room}
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
