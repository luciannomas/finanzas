'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { formatCurrency } from './utils'

export type Currency = 'ARS' | 'USD'

interface CurrencyContextValue {
  currency: Currency
  setCurrency: (c: Currency) => void
  format: (amount: number) => string
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'ARS',
  setCurrency: () => {},
  format: (n) => formatCurrency(n, 'ARS'),
})

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('ARS')

  useEffect(() => {
    const stored = localStorage.getItem('currency') as Currency | null
    if (stored === 'ARS' || stored === 'USD') setCurrencyState(stored)
  }, [])

  function setCurrency(c: Currency) {
    setCurrencyState(c)
    localStorage.setItem('currency', c)
  }

  const format = (amount: number) => formatCurrency(amount, currency)

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
