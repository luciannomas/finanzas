'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Eye, EyeOff, Loader2, LogOut, KeyRound, User, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useCurrency, type Currency } from '@/lib/currency'

export default function ProfilePage() {
  const { data: session } = useSession()
  const [showPassForm, setShowPassForm] = useState(false)
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const { currency, setCurrency } = useCurrency()
  const user = session?.user
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  const roleBadge = {
    superadmin: { variant: 'warning' as const, label: 'Super Admin' },
    admin: { variant: 'default' as const, label: 'Admin' },
    user: { variant: 'outline' as const, label: 'Usuario' },
  }[(user?.role as string) || 'user'] || { variant: 'outline' as const, label: 'Usuario' }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    if (newPass !== confirmPass) {
      setMessage({ type: 'error', text: 'Las contraseñas nuevas no coinciden' })
      return
    }
    if (newPass.length < 6) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres' })
      return
    }

    setSaving(true)

    // Verify current password by trying to sign in
    const { signIn } = await import('next-auth/react')
    const verifyResult = await signIn('credentials', {
      email: user?.email,
      password: currentPass,
      redirect: false,
    })

    if (verifyResult?.error) {
      setSaving(false)
      setMessage({ type: 'error', text: 'La contraseña actual es incorrecta' })
      return
    }

    const res = await fetch(`/api/users/${user?.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPass }),
    })

    setSaving(false)

    if (res.ok) {
      setMessage({ type: 'success', text: '¡Contraseña actualizada correctamente!' })
      setCurrentPass('')
      setNewPass('')
      setConfirmPass('')
      setShowPassForm(false)
    } else {
      setMessage({ type: 'error', text: 'Error al actualizar la contraseña' })
    }
  }

  return (
    <div className="px-4 pt-12 pb-4">
      <h1 className="text-2xl font-bold text-white mb-6">Mi perfil</h1>

      {/* Avatar card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-4 text-center">
        <div className="w-20 h-20 rounded-3xl gradient-violet flex items-center justify-center mx-auto mb-4 shadow-xl shadow-violet-900/30">
          <span className="text-white font-bold text-2xl">{initials}</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-1">{user?.name}</h2>
        <p className="text-slate-400 text-sm mb-3">{user?.email}</p>
        <Badge variant={roleBadge.variant}>{roleBadge.label}</Badge>
      </div>

      {/* Currency selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <DollarSign size={16} className="text-slate-400" />
          <span className="text-slate-400 text-sm font-medium">Moneda</span>
        </div>
        <div className="flex gap-2">
          {([
            { value: 'ARS', label: 'Pesos', sub: 'ARS $' },
            { value: 'USD', label: 'Dólares', sub: 'USD $' },
          ] as { value: Currency; label: string; sub: string }[]).map(opt => (
            <button
              key={opt.value}
              onClick={() => setCurrency(opt.value)}
              className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                currency === opt.value
                  ? 'border-violet-500 bg-violet-500/10 text-violet-400'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <p>{opt.label}</p>
              <p className="text-xs font-normal opacity-70">{opt.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 mb-4">
        <button
          onClick={() => { setShowPassForm(!showPassForm); setMessage(null) }}
          className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all"
        >
          <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
            <KeyRound size={18} className="text-violet-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-white font-semibold text-sm">Cambiar contraseña</p>
            <p className="text-slate-500 text-xs">Actualizá tu clave de acceso</p>
          </div>
          <span className="text-slate-600 text-lg">{showPassForm ? '−' : '+'}</span>
        </button>

        {/* Change password form */}
        {showPassForm && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 animate-slide-up">
            <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
              <div>
                <Label className="mb-1.5 block">Contraseña actual</Label>
                <div className="relative">
                  <Input
                    type={showCurrent ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={currentPass}
                    onChange={e => setCurrentPass(e.target.value)}
                    required
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <Label className="mb-1.5 block">Nueva contraseña</Label>
                <div className="relative">
                  <Input
                    type={showNew ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                    required
                    minLength={6}
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <Label className="mb-1.5 block">Confirmar nueva contraseña</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  required
                />
              </div>

              {message && (
                <div
                  className={`rounded-xl px-4 py-3 text-sm ${
                    message.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={saving}>
                {saving
                  ? <><Loader2 size={16} className="mr-2 animate-spin" />Guardando...</>
                  : 'Actualizar contraseña'}
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Account info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <User size={16} className="text-slate-400" />
          <span className="text-slate-400 text-sm font-medium">Información de cuenta</span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Nombre</span>
            <span className="text-white text-sm font-medium">{user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Email</span>
            <span className="text-white text-sm font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Rol</span>
            <span className="text-white text-sm font-medium">{roleBadge.label}</span>
          </div>
        </div>
      </div>

      {/* Logout */}
      <Button
        variant="destructive"
        className="w-full"
        size="lg"
        onClick={() => signOut({ callbackUrl: '/login' })}
      >
        <LogOut size={18} className="mr-2" />
        Cerrar sesión
      </Button>
    </div>
  )
}
