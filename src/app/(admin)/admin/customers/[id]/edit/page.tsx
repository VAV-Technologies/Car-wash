'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import CustomerForm from '@/components/admin/customers/CustomerForm'
import { getCustomerById } from '@/lib/admin/customers'
import type { Customer } from '@/lib/admin/types'

export default function EditCustomerPage() {
  const params = useParams()
  const id = params.id as string
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCustomerById(id).then((data) => {
      setCustomer(data)
      setLoading(false)
    })
  }, [id])

  if (loading) return <div className="text-white/40 py-12">Loading...</div>
  if (!customer) return <div className="text-red-400 py-12">Customer not found</div>

  return (
    <div className="max-w-2xl">
      <CustomerForm customer={customer} />
    </div>
  )
}
