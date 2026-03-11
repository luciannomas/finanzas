import { auth } from '@/auth'
import { getStore } from '@/lib/store'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

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
  const isSelf = session.user.id === id

  if (!isAdmin && !isSelf) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const idx = store.users.findIndex(u => u.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (body.name) store.users[idx].name = body.name
  if (body.email) store.users[idx].email = body.email
  if (body.role && isAdmin) {
    // Admin can't promote to superadmin
    if (session.user.role === 'admin' && body.role === 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    store.users[idx].role = body.role
  }
  if (body.password) {
    store.users[idx].password = await bcrypt.hash(body.password, 10)
  }

  const { password: _pw, ...safeUser } = store.users[idx]
  return NextResponse.json(safeUser)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const isAdmin = session.user.role === 'admin' || session.user.role === 'superadmin'
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Can't delete yourself
  if (session.user.id === id) {
    return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })
  }

  const store = getStore()
  const idx = store.users.findIndex(u => u.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  store.users.splice(idx, 1)
  return NextResponse.json({ success: true })
}
