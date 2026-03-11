'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { TrendingDown, TrendingUp, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useCurrency } from '@/lib/currency'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import type { Expense, Category, Income } from '@/lib/types'

type Period = 'day' | 'week' | 'month'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [period, setPeriod] = useState<Period>('month')
  const [loading, setLoading] = useState(true)

  const { format } = useCurrency()
  const firstName = session?.user?.name?.split(' ')[0] || 'Usuario'

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : []))
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/expenses?period=${period}`).then(r => r.json()),
      fetch(`/api/incomes?period=${period}`).then(r => r.json()),
    ]).then(([expData, incData]) => {
      setExpenses(Array.isArray(expData) ? expData : [])
      setIncomes(Array.isArray(incData) ? incData : [])
      setLoading(false)
    })
  }, [period])

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0)
  const balance = totalIncome - totalSpent

  // Category breakdown
  const categoryTotals = categories.map(cat => {
    const total = expenses.filter(e => e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0)
    return { ...cat, total }
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

  const maxCatTotal = Math.max(...categoryTotals.map(c => c.total), 1)

  // Recent expenses (last 5)
  const recentExpenses = expenses.slice(0, 5)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 19) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const periodLabel = { day: 'hoy', week: 'esta semana', month: 'este mes' }[period]

  return (
    <div className="px-4 pt-12 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-slate-400 text-sm">{greeting()},</p>
          <h1 className="text-2xl font-bold text-white">{firstName} 👋</h1>
        </div>
        <div className="w-11 h-11 rounded-2xl gradient-violet flex items-center justify-center">
          <span className="text-white font-bold text-base">
            {firstName.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Main balance card */}
      <div className="gradient-violet rounded-3xl p-5 mb-4 shadow-xl shadow-violet-900/30">
        <p className="text-violet-200 text-sm mb-1">Balance {periodLabel}</p>
        <p className={`text-4xl font-bold mb-1 ${balance >= 0 ? 'text-white' : 'text-rose-300'}`}>
          {loading ? '...' : (balance >= 0 ? '+' : '') + format(balance)}
        </p>
        <p className="text-violet-300 text-xs mb-4">
          {loading ? '' : `${format(totalIncome)} ingresos · ${format(totalSpent)} gastos`}
        </p>
        <div className="flex gap-1.5">
          {(['day', 'week', 'month'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                period === p
                  ? 'bg-white text-violet-700'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {p === 'day' ? 'Hoy' : p === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>

      {/* Income / Expense summary row */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Link href="/incomes" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 active:scale-95 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-400 text-xs">Ingresos</p>
            <p className="text-emerald-400 font-bold text-sm truncate">
              {loading ? '...' : `+${format(totalIncome)}`}
            </p>
          </div>
        </Link>
        <Link href="/expenses" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 active:scale-95 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center flex-shrink-0">
            <TrendingDown size={16} className="text-rose-400" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-400 text-xs">Gastos</p>
            <p className="text-rose-400 font-bold text-sm truncate">
              {loading ? '...' : `-${format(totalSpent)}`}
            </p>
          </div>
        </Link>
      </div>

      {/* Category breakdown */}
      {categoryTotals.length > 0 && (
        <Card className="mb-5">
          <CardContent className="pt-4">
            <h2 className="text-white font-bold mb-3">Por categoría</h2>
            <div className="flex flex-col gap-3">
              {categoryTotals.slice(0, 5).map(cat => (
                <div key={cat.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                      <span className="text-slate-300 text-sm">{cat.name}</span>
                    </div>
                    <span className="text-white text-sm font-semibold">{format(cat.total)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(cat.total / maxCatTotal) * 100}%`,
                        background: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly bar chart */}
      {period === 'month' && expenses.length > 0 && (
        <Card className="mb-5">
          <CardContent className="pt-4">
            <h2 className="text-white font-bold mb-3">Últimas semanas</h2>
            <WeeklyChart expenses={expenses} />
          </CardContent>
        </Card>
      )}

      {/* Recent transactions */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold">Recientes</h2>
          <Link href="/expenses" className="text-violet-400 text-sm flex items-center gap-1 hover:text-violet-300">
            Ver todo <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : recentExpenses.length === 0 ? (
          <div className="text-center py-10">
            <TrendingDown size={40} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">Sin gastos {periodLabel}</p>
            <Link href="/expenses" className="text-violet-400 text-sm mt-2 inline-block">
              Agregar gasto
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {recentExpenses.map(expense => {
              const cat = categories.find(c => c.id === expense.categoryId)
              return (
                <div key={expense.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${cat?.color}22` }}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ background: cat?.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{expense.description}</p>
                    <p className="text-slate-500 text-xs">{formatDate(expense.date)} · {cat?.name}</p>
                  </div>
                  <span className="text-rose-400 font-bold text-sm flex-shrink-0">
                    -{format(expense.amount)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function WeeklyChart({ expenses }: { expenses: Expense[] }) {
  const weeks = [3, 2, 1, 0].map(weeksAgo => {
    const end = new Date()
    end.setDate(end.getDate() - weeksAgo * 7)
    const start = new Date(end)
    start.setDate(start.getDate() - 7)

    const total = expenses.filter(e => {
      return e.date > start.toISOString().split('T')[0] && e.date <= end.toISOString().split('T')[0]
    }).reduce((s, e) => s + e.amount, 0)

    return {
      label: weeksAgo === 0 ? 'Esta' : weeksAgo === 1 ? 'Ant.' : `S-${weeksAgo + 1}`,
      total,
    }
  })

  const max = Math.max(...weeks.map(w => w.total), 1)

  return (
    <div className="flex items-end gap-2 h-20">
      {weeks.map((week, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex items-end justify-center" style={{ height: '60px' }}>
            <div
              className={`w-full rounded-t-lg transition-all duration-500 ${i === weeks.length - 1 ? 'bg-violet-500' : 'bg-slate-700'}`}
              style={{ height: `${Math.max((week.total / max) * 100, 4)}%` }}
            />
          </div>
          <span className="text-slate-500 text-[10px]">{week.label}</span>
        </div>
      ))}
    </div>
  )
}
