import * as React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'destructive'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        {
          'bg-violet-500/20 text-violet-300': variant === 'default',
          'border border-slate-600 text-slate-400': variant === 'outline',
          'bg-emerald-500/20 text-emerald-300': variant === 'success',
          'bg-amber-500/20 text-amber-300': variant === 'warning',
          'bg-rose-500/20 text-rose-300': variant === 'destructive',
        },
        className
      )}
      {...props}
    />
  )
}
