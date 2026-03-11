import { auth } from '@/auth'
import { getStore } from '@/lib/store'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const store = getStore()
  const settings = store.notificationSettings.find(s => s.userId === session.user.id)

  if (!settings) {
    const defaultSettings = { userId: session.user.id, weeklyLimit: null, monthlyLimit: null, enabled: true }
    store.notificationSettings.push(defaultSettings)
    return NextResponse.json(defaultSettings)
  }

  return NextResponse.json(settings)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const store = getStore()

  const idx = store.notificationSettings.findIndex(s => s.userId === session.user.id)
  const updated = {
    userId: session.user.id,
    weeklyLimit: body.weeklyLimit ?? null,
    monthlyLimit: body.monthlyLimit ?? null,
    enabled: body.enabled ?? true,
  }

  if (idx >= 0) {
    store.notificationSettings[idx] = updated
  } else {
    store.notificationSettings.push(updated)
  }

  return NextResponse.json(updated)
}
