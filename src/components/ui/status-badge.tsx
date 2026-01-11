import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary border border-primary/20',
        secondary: 'bg-secondary text-secondary-foreground',
        success: 'bg-success/10 text-success border border-success/20',
        warning: 'bg-warning/10 text-warning border border-warning/20',
        destructive: 'bg-destructive/10 text-destructive border border-destructive/20',
        outline: 'border border-border text-foreground',
        gradient: 'gradient-bg text-primary-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function StatusBadge({ className, variant, ...props }: StatusBadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

// Grade-specific badge
export function GradeBadge({ grade }: { grade: string }) {
  const getVariant = (): StatusBadgeProps['variant'] => {
    switch (grade) {
      case 'A':
      case 'A+':
        return 'gradient';
      case 'B':
      case 'B+':
        return 'success';
      case 'C':
      case 'C+':
        return 'warning';
      case 'D':
      case 'D+':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return <StatusBadge variant={getVariant()}>{grade}</StatusBadge>;
}

// Status-specific badge
export function RequestStatusBadge({ status }: { status: 'Pending' | 'Approved' | 'Rejected' }) {
  const variants: Record<string, StatusBadgeProps['variant']> = {
    Pending: 'warning',
    Approved: 'success',
    Rejected: 'destructive',
  };

  const labels: Record<string, string> = {
    Pending: 'Đang chờ',
    Approved: 'Đã duyệt',
    Rejected: 'Từ chối',
  };

  return <StatusBadge variant={variants[status]}>{labels[status]}</StatusBadge>;
}
