import bcrypt from 'bcryptjs'
import type { User, Category, Expense, Income, NotificationSettings } from './types'

export interface FinanzasStore {
  users: User[]
  categories: Category[]
  expenses: Expense[]
  incomes: Income[]
  notificationSettings: NotificationSettings[]
}

declare global {
  // eslint-disable-next-line no-var
  var __finanzasStore: FinanzasStore | undefined
}

function createInitialStore(): FinanzasStore {
  const now = new Date()

  const users: User[] = [
    {
      id: 'user-superadmin',
      name: 'Super Admin',
      email: 'superadmin@app.com',
      password: bcrypt.hashSync('super123', 10),
      role: 'superadmin',
      createdAt: now.toISOString(),
    },
    {
      id: 'user-admin',
      name: 'Administrador',
      email: 'admin@app.com',
      password: bcrypt.hashSync('admin123', 10),
      role: 'admin',
      createdAt: now.toISOString(),
    },
    {
      id: 'user-1',
      name: 'Juan Garcia',
      email: 'juan@app.com',
      password: bcrypt.hashSync('user123', 10),
      role: 'user',
      createdAt: now.toISOString(),
    },
  ]

  const categories: Category[] = [
    { id: 'cat-1', name: 'Comida', color: '#4ade80', icon: 'utensils', userId: 'global', createdAt: now.toISOString() },
    { id: 'cat-2', name: 'Transporte', color: '#60a5fa', icon: 'car', userId: 'global', createdAt: now.toISOString() },
    { id: 'cat-3', name: 'Entretenimiento', color: '#c084fc', icon: 'gamepad-2', userId: 'global', createdAt: now.toISOString() },
    { id: 'cat-4', name: 'Salud', color: '#f87171', icon: 'heart', userId: 'global', createdAt: now.toISOString() },
    { id: 'cat-5', name: 'Ropa', color: '#f9a8d4', icon: 'shirt', userId: 'global', createdAt: now.toISOString() },
    { id: 'cat-6', name: 'Servicios', color: '#fbbf24', icon: 'zap', userId: 'global', createdAt: now.toISOString() },
    { id: 'cat-7', name: 'Educacion', color: '#fb923c', icon: 'book-open', userId: 'global', createdAt: now.toISOString() },
    { id: 'cat-8', name: 'Otros', color: '#94a3b8', icon: 'circle-ellipsis', userId: 'global', createdAt: now.toISOString() },
  ]

  // Sample expenses for the last 3 months
  const expenses: Expense[] = []
  const descriptions = ['Almuerzo', 'Taxi/Uber', 'Netflix', 'Farmacia', 'Zapatillas', 'Luz y Gas', 'Curso Online', 'Varios']
  const amounts = [450, 180, 299, 850, 1200, 1500, 400, 150]

  for (let i = 0; i < 45; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - Math.floor(i * 2.1))
    const catIdx = i % 8

    expenses.push({
      id: `exp-${i}`,
      description: descriptions[catIdx],
      amount: amounts[catIdx] + Math.floor((i * 17) % 200),
      currency: 'ARS',
      categoryId: categories[catIdx].id,
      userId: 'user-1',
      date: date.toISOString().split('T')[0],
      createdAt: date.toISOString(),
      notes: '',
    })
  }

  const incomes: Income[] = [
    {
      id: 'inc-1',
      description: 'Sueldo',
      amount: 150000,
      currency: 'ARS' as const,
      userId: 'user-1',
      date: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
      createdAt: now.toISOString(),
      notes: '',
    },
    {
      id: 'inc-2',
      description: 'Freelance',
      amount: 30000,
      currency: 'ARS' as const,
      userId: 'user-1',
      date: new Date(now.getFullYear(), now.getMonth(), 10).toISOString().split('T')[0],
      createdAt: now.toISOString(),
      notes: 'Proyecto web',
    },
  ]

  const notificationSettings: NotificationSettings[] = [
    { userId: 'user-1', weeklyLimit: 10000, monthlyLimit: 40000, enabled: true },
  ]

  return { users, categories, expenses, incomes, notificationSettings }
}

export function getStore(): FinanzasStore {
  if (!global.__finanzasStore) {
    global.__finanzasStore = createInitialStore()
  }
  return global.__finanzasStore
}
