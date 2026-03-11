import { auth } from '@/auth'
import { getStore } from '@/lib/store'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const store = getStore()

  const isAdmin = session.user.role === 'admin' || session.user.role === 'superadmin'
  const idx = store.expenses.findIndex(
    e => e.id === id && (isAdmin || e.userId === session.user.id)
  )

  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  store.expenses[idx] = {
    ...store.expenses[idx],
    description: body.description ?? store.expenses[idx].description,
    amount: body.amount != null ? Number(body.amount) : store.expenses[idx].amount,
    currency: (body.currency === 'USD' ? 'USD' : body.currency === 'ARS' ? 'ARS' : store.expenses[idx].currency) as 'ARS' | 'USD',
    categoryId: body.categoryId ?? store.expenses[idx].categoryId,
    date: body.date ?? store.expenses[idx].date,
    notes: body.notes ?? store.expenses[idx].notes,
  }

  return NextResponse.json(store.expenses[idx])
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const store = getStore()

  const isAdmin = session.user.role === 'admin' || session.user.role === 'superadmin'
  const idx = store.expenses.findIndex(
    e => e.id === id && (isAdmin || e.userId === session.user.id)
  )

  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  store.expenses.splice(idx, 1)
  return NextResponse.json({ success: true })
}
