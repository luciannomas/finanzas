import * as React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

export function Button({
  className,
  variant = 'default',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40': variant === 'default',
          'border border-slate-600 text-slate-200 hover:bg-slate-800 hover:border-slate-500': variant === 'outline',
          'text-slate-400 hover:text-slate-200 hover:bg-slate-800': variant === 'ghost',
          'bg-rose-600 hover:bg-rose-500 text-white': variant === 'destructive',
          'bg-slate-700 hover:bg-slate-600 text-slate-200': variant === 'secondary',
        },
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-11 px-5 text-sm': size === 'md',
          'h-13 px-6 text-base': size === 'lg',
          'h-10 w-10 p-0': size === 'icon',
        },
        className
      )}
      {...props}
    />
  )
}
