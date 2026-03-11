'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff, AlertTriangle, CheckCircle, TrendingDown, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCurrency } from '@/lib/currency'
import type { NotificationSettings, Expense } from '@/lib/types'

interface Alert {
  type: 'warning' | 'danger' | 'ok'
  period: 'weekly' | 'monthly'
  spent: number
  limit: number
  percent: number
  label: string
}

export default function NotificationsPage() {
  const { format } = useCurrency()
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [form, setForm] = useState({ weeklyLimit: '', monthlyLimit: '', enabled: true })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loadingAlerts, setLoadingAlerts] = useState(true)

  useEffect(() => {
    fetch('/api/notifications').then(r => r.json()).then((data: NotificationSettings) => {
      setSettings(data)
      setForm({
        weeklyLimit: data.weeklyLimit != null ? String(data.weeklyLimit) : '',
        monthlyLimit: data.monthlyLimit != null ? String(data.monthlyLimit) : '',
        enabled: data.enabled,
      })
    })
  }, [])

  useEffect(() => {
    setLoadingAlerts(true)
    Promise.all([
      fetch('/api/expenses?period=week').then(r => r.json()),
      fetch('/api/expenses?period=month').then(r => r.json()),
      fetch('/api/notifications').then(r => r.json()),
    ]).then(([weekExpenses, monthExpenses, notifSettings]: [Expense[], Expense[], NotificationSettings]) => {
      const weekSpent = weekExpenses.reduce((s, e) => s + e.amount, 0)
      const monthSpent = monthExpenses.reduce((s, e) => s + e.amount, 0)
      const computed: Alert[] = []

      if (notifSettings.weeklyLimit && notifSettings.weeklyLimit > 0) {
        const pct = (weekSpent / notifSettings.weeklyLimit) * 100
        computed.push({
          type: pct >= 100 ? 'danger' : pct >= 80 ? 'warning' : 'ok',
          period: 'weekly',
          spent: weekSpent,
          limit: notifSettings.weeklyLimit,
          percent: Math.min(pct, 100),
          label: 'esta semana',
        })
      }

      if (notifSettings.monthlyLimit && notifSettings.monthlyLimit > 0) {
        const pct = (monthSpent / notifSettings.monthlyLimit) * 100
        computed.push({
          type: pct >= 100 ? 'danger' : pct >= 80 ? 'warning' : 'ok',
          period: 'monthly',
          spent: monthSpent,
          limit: notifSettings.monthlyLimit,
          percent: Math.min(pct, 100),
          label: 'este mes',
        })
      }

      setAlerts(computed)
      setLoadingAlerts(false)
    })
  }, [saved])

  async function handleSave() {
    setSaving(true)
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weeklyLimit: form.weeklyLimit ? Number(form.weeklyLimit) : null,
        monthlyLimit: form.monthlyLimit ? Number(form.monthlyLimit) : null,
        enabled: form.enabled,
      }),
    })
    setSaving(false)
    setSaved(prev => !prev)
  }

  const alertColors = {
    danger: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', bar: 'bg-rose-500', icon: AlertTriangle },
    warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', bar: 'bg-amber-400', icon: AlertTriangle },
    ok: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', bar: 'bg-emerald-400', icon: CheckCircle },
  }

  return (
    <div className="px-4 pt-12 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl gradient-violet flex items-center justify-center">
          <Bell size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Notificaciones</h1>
          <p className="text-slate-400 text-sm">Alertas de presupuesto</p>
        </div>
      </div>

      {/* Alerts section */}
      {settings?.enabled && (
        <div className="mb-6">
          <h2 className="text-white font-semibold mb-3">Estado actual</h2>
          {loadingAlerts ? (
            <div className="flex justify-center py-6">
              <Loader2 size={20} className="animate-spin text-slate-500" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
              <TrendingDown size={32} className="text-slate-700 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Configurá límites abajo para ver alertas</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {alerts.map(alert => {
                const styles = alertColors[alert.type]
                const Icon = styles.icon
                const remaining = alert.limit - alert.spent
                return (
                  <div
                    key={alert.period}
                    className={`${styles.bg} border ${styles.border} rounded-2xl p-4`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Icon size={18} className={`${styles.text} mt-0.5 flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm">
                          {alert.type === 'danger'
                            ? `Superaste el límite ${alert.label}`
                            : alert.type === 'warning'
                            ? `Estás por alcanzar el límite ${alert.label}`
                            : `Dentro del presupuesto ${alert.label}`}
                        </p>
                        <p className={`text-xs mt-0.5 ${styles.text}`}>
                          {alert.type === 'danger'
                            ? `Excediste por ${format(alert.spent - alert.limit)}`
                            : `Te quedan ${format(Math.max(remaining, 0))} de ${format(alert.limit)}`}
                        </p>
                      </div>
                      <span className={`text-xs font-bold ${styles.text} flex-shrink-0`}>
                        {Math.round(alert.percent)}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${styles.bar}`}
                        style={{ width: `${alert.percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-slate-500 text-xs">{format(alert.spent)} gastado</span>
                      <span className="text-slate-500 text-xs">Límite: {format(alert.limit)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 className="text-white font-semibold mb-4">Configuración</h2>

        {/* Enable toggle */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            {form.enabled
              ? <Bell size={18} className="text-violet-400" />
              : <BellOff size={18} className="text-slate-500" />}
            <div>
              <p className="text-white text-sm font-medium">Alertas activas</p>
              <p className="text-slate-500 text-xs">Recibir avisos de presupuesto</p>
            </div>
          </div>
          <button
            onClick={() => setForm(p => ({ ...p, enabled: !p.enabled }))}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              form.enabled ? 'bg-violet-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                form.enabled ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {form.enabled && (
          <div className="flex flex-col gap-4">
            <div>
              <Label className="mb-1.5 block">
                Límite semanal (ARS)
              </Label>
              <p className="text-slate-500 text-xs mb-2">
                Te avisamos cuando alcancés el 80% o lo superés
              </p>
              <Input
                type="number"
                placeholder="Ej: 10000"
                value={form.weeklyLimit}
                onChange={e => setForm(p => ({ ...p, weeklyLimit: e.target.value }))}
              />
            </div>

            <div>
              <Label className="mb-1.5 block">
                Límite mensual (ARS)
              </Label>
              <p className="text-slate-500 text-xs mb-2">
                Te avisamos cuando alcancés el 80% o lo superés
              </p>
              <Input
                type="number"
                placeholder="Ej: 40000"
                value={form.monthlyLimit}
                onChange={e => setForm(p => ({ ...p, monthlyLimit: e.target.value }))}
              />
            </div>

            <Button onClick={handleSave} className="w-full mt-1" disabled={saving}>
              {saving
                ? <><Loader2 size={16} className="mr-2 animate-spin" />Guardando...</>
                : <><Save size={16} className="mr-2" />Guardar límites</>}
            </Button>
          </div>
        )}

        {!form.enabled && (
          <p className="text-slate-500 text-sm text-center py-2">
            Activá las alertas para configurar límites de presupuesto
          </p>
        )}
      </div>

      {/* Info card */}
      <div className="mt-4 bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4">
        <p className="text-slate-500 text-xs leading-relaxed">
          Las notificaciones se calculan en tiempo real cada vez que abrís esta pantalla.
          Los límites se aplican a tus gastos en pesos (ARS).
        </p>
      </div>
    </div>
  )
}
