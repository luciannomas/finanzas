import { auth } from '@/auth'
import { getStore } from '@/lib/store'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const store = getStore()
  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') || 'month'

  const isAdmin = session.user.role === 'admin' || session.user.role === 'superadmin'
  let incomes = isAdmin
    ? store.incomes
    : store.incomes.filter(i => i.userId === session.user.id)

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]

  if (period === 'day') {
    incomes = incomes.filter(i => i.date === todayStr)
  } else if (period === 'week') {
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoStr = weekAgo.toISOString().split('T')[0]
    incomes = incomes.filter(i => i.date >= weekAgoStr)
  } else if (period === 'month') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthStartStr = monthStart.toISOString().split('T')[0]
    incomes = incomes.filter(i => i.date >= monthStartStr)
  }
  // 'all' returns everything

  return NextResponse.json(incomes.sort((a, b) => b.date.localeCompare(a.date)))
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const store = getStore()

  const newIncome = {
    id: `inc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    description: body.description,
    amount: Number(body.amount),
    currency: (body.currency === 'USD' ? 'USD' : 'ARS') as 'ARS' | 'USD',
    userId: session.user.id,
    date: body.date,
    createdAt: new Date().toISOString(),
    notes: body.notes || '',
  }

  store.incomes.push(newIncome)
  return NextResponse.json(newIncome, { status: 201 })
}
