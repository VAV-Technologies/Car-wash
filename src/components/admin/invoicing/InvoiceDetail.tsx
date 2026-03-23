'use client'

import { formatCurrency, formatDate, SERVICE_TYPES } from '@/lib/admin/constants'
import type { InvoiceRow } from '@/lib/admin/invoicing'
import type { PaymentStatus } from '@/lib/admin/types'

function getCategoryLabel(category: string | null): string {
  if (!category) return '-'
  const found = SERVICE_TYPES.find((s) => s.value === category)
  return found?.label ?? category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatMethodLabel(method: string | null): string {
  if (!method) return '-'
  if (method === 'bank_transfer') return 'Bank Transfer'
  return method.toUpperCase()
}

function StatusDot({ status }: { status: PaymentStatus }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-400',
    confirmed: 'bg-green-400',
    failed: 'bg-red-400',
    refunded: 'bg-gray-400',
  }
  return <span className={`inline-block w-2 h-2 rounded-full mr-2 ${colors[status] ?? colors.pending}`} />
}

interface InvoiceDetailProps {
  invoice: InvoiceRow
}

export default function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  return (
    <div className="max-w-md mx-auto bg-[#171717] rounded-lg border border-white/10 p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-orange-500">CASTUDIO</h3>
        <p className="text-white/40 text-xs mt-1">Premium Car Wash & Detailing</p>
        <div className="w-full h-px bg-white/10 mt-4" />
      </div>

      {/* Invoice Number */}
      <div className="text-center mb-4">
        <p className="text-white/40 text-xs uppercase tracking-wider">Invoice</p>
        <p className="text-white font-mono text-sm">{invoice.id.slice(0, 8).toUpperCase()}</p>
      </div>

      {/* Customer */}
      <div className="mb-4">
        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Customer</p>
        <p className="text-white text-sm">{invoice.customer_name ?? '-'}</p>
        {invoice.customer_phone && (
          <p className="text-white/50 text-xs">{invoice.customer_phone}</p>
        )}
      </div>

      {/* Service */}
      <div className="mb-4">
        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Service</p>
        <p className="text-white text-sm">{getCategoryLabel(invoice.category)}</p>
        <p className="text-white/50 text-xs">{formatDate(invoice.created_at)}</p>
      </div>

      <div className="w-full h-px bg-white/10 my-4" />

      {/* Amount */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-white/40 text-xs uppercase tracking-wider">Amount</span>
        <span className="text-white text-lg font-bold">{formatCurrency(invoice.amount)}</span>
      </div>

      {/* Payment Details */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-white/40 text-xs">Method</span>
          <span className="text-white/70 text-sm">{formatMethodLabel(invoice.payment_method)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/40 text-xs">Status</span>
          <span className="text-white/70 text-sm flex items-center">
            <StatusDot status={invoice.payment_status} />
            {invoice.payment_status.charAt(0).toUpperCase() + invoice.payment_status.slice(1)}
          </span>
        </div>
        {invoice.payment_confirmed_at && (
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-xs">Confirmed At</span>
            <span className="text-white/70 text-sm">{formatDate(invoice.payment_confirmed_at)}</span>
          </div>
        )}
        {invoice.payment_confirmed_by && (
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-xs">Confirmed By</span>
            <span className="text-white/70 text-sm">{invoice.payment_confirmed_by}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {invoice.description && (
        <>
          <div className="w-full h-px bg-white/10 my-4" />
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Notes</p>
            <p className="text-white/60 text-sm">{invoice.description}</p>
          </div>
        </>
      )}
    </div>
  )
}
