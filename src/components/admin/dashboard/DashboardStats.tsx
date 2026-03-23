'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Loader2,
  Wrench,
  DollarSign,
  Clock,
  TrendingUp,
  Users,
  Bell,
  AlertTriangle,
  Wallet,
  Gauge,
  AlertCircle,
} from 'lucide-react'
import {
  getDashboardStats,
  getMonthNumber,
  getTargetsForMonth,
  type DashboardStatsData,
} from '@/lib/admin/dashboard'
import { formatCurrency } from '@/lib/admin/constants'

function StatCard({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="border border-white/10 bg-[#171717] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-white/30" />
        <p className="text-white/50 text-xs uppercase tracking-wide">{title}</p>
      </div>
      {children}
    </div>
  )
}

function ProgressBar({
  value,
  target,
  worstTarget,
}: {
  value: number
  target: number
  worstTarget: number
}) {
  const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0
  let barColor = 'bg-green-500'
  if (value < worstTarget) barColor = 'bg-red-500'
  else if (value < target) barColor = 'bg-yellow-500'

  return (
    <div className="w-full h-1.5 bg-white/5 rounded-full mt-2">
      <div
        className={`h-full rounded-full transition-all ${barColor}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getDashboardStats()
        setStats(data)
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
        Loading dashboard...
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-16 text-white/40">
        Failed to load dashboard data.
      </div>
    )
  }

  const monthNum = getMonthNumber()
  const targets = getTargetsForMonth(monthNum)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Services This Month */}
      <StatCard title="Services This Month" icon={Wrench}>
        <p className="text-2xl font-bold text-white">{stats.servicesThisMonth}</p>
        <p className="text-sm text-white/40 mt-1">
          Target: {targets.base.services} (base)
        </p>
        <ProgressBar
          value={stats.servicesThisMonth}
          target={targets.base.services}
          worstTarget={targets.worst.services}
        />
      </StatCard>

      {/* Revenue This Month */}
      <StatCard title="Revenue This Month" icon={DollarSign}>
        <p className="text-2xl font-bold text-white">{formatCurrency(stats.revenueThisMonth)}</p>
        <p className="text-sm text-white/40 mt-1">
          Target: {formatCurrency(targets.base.revenue)}
        </p>
        <ProgressBar
          value={stats.revenueThisMonth}
          target={targets.base.revenue}
          worstTarget={targets.worst.revenue}
        />
      </StatCard>

      {/* Pending Payments */}
      <StatCard title="Pending Payments" icon={Clock}>
        <p className="text-2xl font-bold text-white">{stats.pendingPayments.count}</p>
        <p className="text-sm text-orange-400 mt-1">
          {formatCurrency(stats.pendingPayments.total)} pending
        </p>
        {stats.pendingPayments.count > 0 && (
          <Link
            href="/admin/finance"
            className="inline-block mt-2 text-xs text-orange-500 hover:text-orange-400 underline underline-offset-2"
          >
            Review payments
          </Link>
        )}
      </StatCard>

      {/* Avg Revenue Per Service */}
      <StatCard title="Avg Revenue / Service" icon={TrendingUp}>
        <p className="text-2xl font-bold text-white">
          {formatCurrency(stats.avgRevenuePerService)}
        </p>
        {stats.avgRevenuePerService > 0 && stats.avgRevenuePerService < 400000 && (
          <div className="flex items-center gap-1.5 mt-2 text-yellow-400 text-xs">
            <AlertTriangle className="h-3.5 w-3.5" />
            Below Rp 400.000 threshold
          </div>
        )}
      </StatCard>

      {/* Active Subscriptions */}
      <StatCard title="Active Subscriptions" icon={Users}>
        <p className="text-2xl font-bold text-white">
          {stats.activeSubscriptions.basic +
            stats.activeSubscriptions.standard +
            stats.activeSubscriptions.premium +
            stats.activeSubscriptions.vip}
        </p>
        <div className="flex flex-wrap gap-2 mt-2 text-xs">
          {stats.activeSubscriptions.basic > 0 && (
            <span className="text-white/50">Basic: {stats.activeSubscriptions.basic}</span>
          )}
          {stats.activeSubscriptions.standard > 0 && (
            <span className="text-white/50">Standard: {stats.activeSubscriptions.standard}</span>
          )}
          {stats.activeSubscriptions.premium > 0 && (
            <span className="text-white/50">Premium: {stats.activeSubscriptions.premium}</span>
          )}
          {stats.activeSubscriptions.vip > 0 && (
            <span className="text-white/50">VIP: {stats.activeSubscriptions.vip}</span>
          )}
        </div>
        <p className="text-sm text-green-400 mt-1">
          MRR: {formatCurrency(stats.activeSubscriptions.totalMRR)}
        </p>
      </StatCard>

      {/* Follow-Up Queue */}
      <StatCard title="Follow-Up Queue" icon={Bell}>
        <p className="text-2xl font-bold text-white">{stats.followUpsDue}</p>
        <p className="text-sm text-white/40 mt-1">customers need follow-up</p>
        {stats.followUpsDue > 0 && (
          <Link
            href="/admin/customers/follow-ups"
            className="inline-block mt-2 text-xs text-orange-500 hover:text-orange-400 underline underline-offset-2"
          >
            View follow-ups
          </Link>
        )}
      </StatCard>

      {/* Cash Position */}
      <StatCard title="Cash Position" icon={Wallet}>
        <p className={`text-2xl font-bold ${stats.cashPosition.balance >= 0 ? 'text-white' : 'text-red-400'}`}>
          {formatCurrency(stats.cashPosition.balance)}
        </p>
        <div className="mt-2 space-y-1">
          <p className="text-xs text-white/40">
            Burn rate: {formatCurrency(stats.cashPosition.burnRate)}/mo
          </p>
          <p className={`text-xs ${stats.cashPosition.runwayMonths < 3 ? 'text-red-400' : 'text-white/40'}`}>
            Runway: {stats.cashPosition.runwayMonths >= 99 ? 'N/A' : `${stats.cashPosition.runwayMonths.toFixed(1)} months`}
          </p>
        </div>
        {stats.cashPosition.runwayMonths < 3 && stats.cashPosition.runwayMonths < 99 && (
          <div className="flex items-center gap-1.5 mt-2 text-red-400 text-xs">
            <AlertTriangle className="h-3.5 w-3.5" />
            Low runway warning
          </div>
        )}
      </StatCard>

      {/* Capacity Utilization */}
      <StatCard title="Capacity Utilization" icon={Gauge}>
        <p className="text-2xl font-bold text-white">
          {stats.capacityUtilization.toFixed(0)}%
        </p>
        <p className="text-sm text-white/40 mt-1">
          {stats.servicesThisMonth} / 65 max capacity
        </p>
        <div className="w-full h-2 bg-white/5 rounded-full mt-3">
          <div
            className={`h-full rounded-full transition-all ${
              stats.capacityUtilization >= 90
                ? 'bg-red-500'
                : stats.capacityUtilization >= 70
                ? 'bg-orange-500'
                : stats.capacityUtilization >= 40
                ? 'bg-green-500'
                : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(stats.capacityUtilization, 100)}%` }}
          />
        </div>
      </StatCard>

      {/* Alerts Feed */}
      <StatCard title="Alerts Feed" icon={AlertCircle}>
        {stats.recentNotifications.length === 0 ? (
          <p className="text-sm text-white/30 mt-1">No unread alerts</p>
        ) : (
          <div className="space-y-2 mt-1">
            {stats.recentNotifications.map((notif) => (
              <div key={notif.id} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-white/70 truncate">{notif.message}</p>
                  <p className="text-[10px] text-white/30">
                    {new Date(notif.created_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </StatCard>
    </div>
  )
}
