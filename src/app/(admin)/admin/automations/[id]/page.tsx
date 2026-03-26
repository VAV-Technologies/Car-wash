'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AutomationDetailRedirect() {
  const params = useParams()
  const router = useRouter()
  useEffect(() => {
    router.replace(`/admin/agents/${params.id}`)
  }, [params.id, router])
  return null
}
