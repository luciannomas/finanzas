import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'ARS'): string {
  const locale = currency === 'USD' ? 'en-US' : 'es-AR'
  const decimals = currency === 'USD' ? 2 : 0
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (dateStr === today.toISOString().split('T')[0]) return 'Hoy'
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'Ayer'

  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
  }).format(date)
}

export function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

export function getWeekRange(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now)
  start.setDate(start.getDate() - 7)
  return {
    start: start.toISOString().split('T')[0],
    end: now.toISOString().split('T')[0],
  }
}

export function getMonthRange(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  return {
    start: start.toISOString().split('T')[0],
    end: now.toISOString().split('T')[0],
  }
}

export function today(): string {
  return new Date().toISOString().split('T')[0]
}
