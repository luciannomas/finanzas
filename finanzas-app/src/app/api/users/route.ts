import { auth } from '@/auth'
import { getStore } from '@/lib/store'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = session.user.role === 'admin' || session.user.role === 'superadmin'
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const store = getStore()
  const users = store.users.map(({ password: _pw, ...u }) => u)
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = session.user.role === 'admin' || session.user.role === 'superadmin'
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const store = getStore()

  if (store.users.find(u => u.email === body.email)) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
  }

  // Superadmin can create any role; admin can only create users
  let role = body.role || 'user'
  if (session.user.role === 'admin' && role !== 'user') {
    role = 'user'
  }

  const newUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: body.name,
    email: body.email,
    password: await bcrypt.hash(body.password, 10),
    role,
    createdAt: new Date().toISOString(),
  }

  store.users.push(newUser)
  const { password: _pw, ...safeUser } = newUser
  return NextResponse.json(safeUser, { status: 201 })
}
