'use client'

import { useEffect, useState } from 'react'
import { Loader2, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/admin/constants'

interface AgingRow {
  id: string
  customer_name: string | null
  amount: number
  created_at: string
  days_pending: number
  description: string | null
}

export default function PaymentAgingReport() {
  const [data, setData] = useState<AgingRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const cutoff = new Date()
        cutoff.setHours(cutoff.getHours() - 48)

        const { data: rows, error } = await supabase
          .from('transactions')
          .select('id, amount, created_at, description, customers!left(name)')
          .eq('payment_status', 'pending')
          .lt('created_at', cutoff.toISOString())
          .order('created_at', { ascending: true })

        if (error) throw error

        const mapped: AgingRow[] = (rows ?? []).map((row: Record<string, unknown>) => {
          const { customers, ...rest } = row
          const createdAt = rest.created_at as string
          const daysPending = Math.floor(
            (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
          )
          return {
            id: rest.id as string,
            customer_name: (customers as { name: string } | null)?.name ?? null,
            amount: rest.amount as number,
            created_at: createdAt,
            days_pending: daysPending,
            description: rest.description as string | null,
          }
        })

        setData(mapped)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading aging report...
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-16 text-white/40">
        No pending payments older than 48 hours. All clear.
      </div>
    )
  }

  const totalPending = data.reduce((s, r) => s + r.amount, 0)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-3 border border-yellow-500/30 bg-yellow-500/5 rounded-lg p-4">
        <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0" />
        <div>
          <p className="text-sm font-medium text-yellow-400">
            {data.length} payment{data.length > 1 ? 's' : ''} pending &gt; 48 hours
          </p>
          <p className="text-xs text-yellow-400/70 mt-0.5">
            Total: {formatCurrency(totalPending)}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="border border-white/10 bg-[#171717] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-white/50 font-medium">Customer</th>
              <th className="text-right px-4 py-3 text-white/50 font-medium">Amount</th>
              <th className="text-right px-4 py-3 text-white/50 font-medium">Days Pending</th>
              <th className="text-left px-4 py-3 text-white/50 font-medium">Created</th>
              <th className="text-left px-4 py-3 text-white/50 font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.id}
                className="border-b border-white/5 hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3 text-white/70">
                  {row.customer_name ?? 'Unknown'}
                </td>
                <td className="px-4 py-3 text-right text-white font-medium">
                  {formatCurrency(row.amount)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      row.days_pending >= 7
                        ? 'bg-red-500/20 text-red-400'
                        : row.days_pending >= 3
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-white/10 text-white/50'
                    }`}
                  >
                    {row.days_pending}d
                  </span>
                </td>
                <td className="px-4 py-3 text-white/50">{formatDate(row.created_at)}</td>
                <td className="px-4 py-3 text-white/40 truncate max-w-[200px]">
                  {row.description ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
