import { auth } from '@/auth'
import { getStore } from '@/lib/store'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const store = getStore()
  const categories = store.categories.filter(
    c => c.userId === 'global' || c.userId === session.user.id
  )

  return NextResponse.json(categories)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const store = getStore()

  const newCategory = {
    id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: body.name,
    color: body.color || '#94a3b8',
    icon: body.icon || 'circle-ellipsis',
    userId: session.user.role === 'admin' || session.user.role === 'superadmin' ? 'global' : session.user.id,
    createdAt: new Date().toISOString(),
  }

  store.categories.push(newCategory)
  return NextResponse.json(newCategory, { status: 201 })
}
