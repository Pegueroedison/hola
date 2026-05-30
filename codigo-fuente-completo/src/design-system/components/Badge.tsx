import React from 'react';
import { cn } from '@/lib/utils';

export function Badge({ className, tone = 'neutral', ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: 'neutral' | 'success' | 'warning' | 'danger' }) {
  const tones = {
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    success: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    danger: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
  };
  return <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-bold', tones[tone], className)} {...props} />;
}
