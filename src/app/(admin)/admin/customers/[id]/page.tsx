'use client'

import { useParams } from 'next/navigation'
import CustomerProfile from '@/components/admin/customers/CustomerProfile'

export default function CustomerDetailPage() {
  const params = useParams()
  const id = params.id as string

  return <CustomerProfile customerId={id} />
}
