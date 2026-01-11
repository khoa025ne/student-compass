import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  hover?: boolean;
  delay?: number;
}

export function GlassCard({
  children,
  className,
  elevated = false,
  hover = true,
  delay = 0,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        'rounded-2xl p-6',
        elevated ? 'glass-card-elevated' : 'glass-card',
        hover && 'card-hover',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
