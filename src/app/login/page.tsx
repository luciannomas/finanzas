'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Wallet, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Email o contraseña incorrectos')
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header decorativo */}
      <div className="gradient-violet rounded-b-[2.5rem] px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
          <Wallet size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white">FinanzApp</h1>
        <p className="text-violet-200 mt-1 text-sm">Controlá tus gastos fácil</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pt-8">
        <h2 className="text-2xl font-bold text-white mb-1">Bienvenido</h2>
        <p className="text-slate-400 text-sm mb-8">Ingresá con tu cuenta</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3">
              <p className="text-rose-400 text-sm">{error}</p>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
            {loading ? (
              <><Loader2 size={18} className="mr-2 animate-spin" />Ingresando...</>
            ) : (
              'Ingresar'
            )}
          </Button>
        </form>

        {/* Demo credentials */}
        <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Cuentas de prueba
          </p>
          <div className="flex flex-col gap-2">
            {[
              { role: 'SuperAdmin', email: 'superadmin@app.com', pass: 'super123' },
              { role: 'Admin', email: 'admin@app.com', pass: 'admin123' },
              { role: 'Usuario', email: 'juan@app.com', pass: 'user123' },
            ].map(({ role, email: e, pass }) => (
              <button
                key={role}
                type="button"
                onClick={() => { setEmail(e); setPassword(pass) }}
                className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 rounded-xl px-3 py-2.5 transition-colors text-left"
              >
                <div>
                  <span className="text-xs font-semibold text-violet-400">{role}</span>
                  <p className="text-xs text-slate-400 mt-0.5">{e}</p>
                </div>
                <span className="text-xs text-slate-500 font-mono">{pass}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
