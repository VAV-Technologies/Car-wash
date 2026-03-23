'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Loader2, AlertTriangle, X, UserX, BarChart3 } from 'lucide-react'
import { getChurnRiskSubscriptions } from '@/lib/admin/subscriptions'
import { getTierConfig } from '@/lib/admin/constants'
import type { ChurnRiskSubscription } from '@/lib/admin/types'

function TierBadge({ tier }: { tier: string }) {
  const config = getTierConfig(tier)
  if (!config) return null
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bgClass} ${config.textClass}`}
    >
      {config.label}
    </span>
  )
}

export default function ChurnAlerts() {
  const [risks, setRisks] = useState<ChurnRiskSubscription[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getChurnRiskSubscriptions()
        setRisks(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load churn risks')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id))
  }

  const visibleRisks = risks.filter((r) => !dismissed.has(r.id))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Analyzing churn risks...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-400">{error}</div>
    )
  }

  if (visibleRisks.length === 0) {
    return (
      <div className="text-center py-16 text-white/40">
        <BarChart3 className="h-10 w-10 mx-auto mb-3 text-green-500/50" />
        <p className="text-sm">No churn risks detected. All subscribers look healthy.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <AlertTriangle className="h-5 w-5 text-red-400" />
        <p className="text-sm text-white/50">
          {visibleRisks.length} subscriber{visibleRisks.length !== 1 ? 's' : ''} at risk of churning
        </p>
      </div>

      <div className="space-y-2">
        {visibleRisks.map((sub) => {
          const reasons = sub.risk_reason.split('; ')
          const suggestedAction = reasons.some((r) => r.includes('14+ days'))
            ? 'Send a booking reminder via WhatsApp'
            : 'Reach out about unused washes and offer scheduling help'

          return (
            <div
              key={sub.id}
              className="border border-white/10 bg-[#171717] rounded-lg p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      href={`/admin/customers/${sub.customer_id}`}
                      className="font-medium text-white hover:text-orange-400 transition-colors"
                    >
                      {sub.customer_name}
                    </Link>
                    <TierBadge tier={sub.tier} />
                  </div>

                  {/* Risk Reasons */}
                  <div className="space-y-1 mb-3">
                    {reasons.map((reason, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <UserX className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                        <span className="text-red-300">{reason}</span>
                      </div>
                    ))}
                  </div>

                  {/* Suggested Action */}
                  <div className="rounded-lg bg-orange-500/5 border border-orange-500/10 px-3 py-2">
                    <p className="text-xs text-white/40 mb-0.5">Suggested action</p>
                    <p className="text-sm text-orange-300">{suggestedAction}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDismiss(sub.id)}
                  className="flex-shrink-0 text-white/30 hover:text-white/60 transition-colors p-1"
                  title="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
