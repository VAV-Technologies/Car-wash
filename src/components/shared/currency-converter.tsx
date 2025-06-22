'use client'

import { useState, useEffect } from 'react'
import { SUPPORTED_CURRENCIES, getCurrency } from '@/lib/currency-config'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, TrendingUp } from 'lucide-react'

interface CurrencyConverterProps {
  usdAmount: number
}

// Formatter for displaying currency values
const currencyFormatter = (amount: number, currencyCode: string) => {
  const currency = getCurrency(currencyCode)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function CurrencyConverter({ usdAmount }: CurrencyConverterProps) {
  const [rates, setRates] = useState<Record<string, number> | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/currency/rates')
        if (!response.ok) {
          throw new Error('Failed to fetch exchange rates.')
        }
        const data = await response.json()
        setRates(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchRates()
  }, [])

  const convertedAmount = rates && rates[selectedCurrency]
    ? usdAmount * rates[selectedCurrency]
    : null

  const selectedCurrencyInfo = getCurrency(selectedCurrency)

  if (isLoading) {
    return <Skeleton className="h-9 w-48" />
  }

  if (error) {
    return (
      <div className="flex items-center text-sm text-red-500 gap-2">
        <AlertTriangle className="h-4 w-4" />
        <span>Could not load rates</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-md border">
      <div className="flex-grow">
        {selectedCurrency === 'USD' ? (
          <span className="text-2xl font-bold text-gray-800">
            {currencyFormatter(usdAmount, 'USD')}
          </span>
        ) : (
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-primary">
              {convertedAmount ? currencyFormatter(convertedAmount, selectedCurrency) : '...'}
            </span>
            <span className="text-xs text-gray-500">
              (Original: {currencyFormatter(usdAmount, 'USD')})
            </span>
          </div>
        )}
      </div>
      <Select onValueChange={setSelectedCurrency} defaultValue="USD">
        <SelectTrigger className="w-[120px] bg-white">
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_CURRENCIES.map(currency => (
            <SelectItem key={currency.code} value={currency.code}>
              {currency.code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
