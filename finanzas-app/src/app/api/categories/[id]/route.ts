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
  const idx = store.categories.findIndex(
    c => c.id === id && (isAdmin || c.userId === session.user.id)
  )

  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  store.categories[idx] = {
    ...store.categories[idx],
    name: body.name ?? store.categories[idx].name,
    color: body.color ?? store.categories[idx].color,
    icon: body.icon ?? store.categories[idx].icon,
  }

  return NextResponse.json(store.categories[idx])
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
  const idx = store.categories.findIndex(
    c => c.id === id && (isAdmin || c.userId === session.user.id)
  )

  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  store.categories.splice(idx, 1)
  return NextResponse.json({ success: true })
}
