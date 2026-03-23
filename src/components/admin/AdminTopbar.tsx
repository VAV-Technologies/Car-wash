'use client'

import { usePathname } from 'next/navigation'

const titles: Record<string, string> = {
  '/admin/customers': 'Customers',
  '/admin/customers/new': 'Add Customer',
  '/admin/customers/follow-ups': 'Follow-Up Queue',
  '/admin/bookings': 'Bookings',
  '/admin/jobs': 'Jobs',
  '/admin/finance': 'Finance',
  '/admin/inventory': 'Inventory',
  '/admin/settings': 'Settings',
}

export default function AdminTopbar() {
  const pathname = usePathname()

  const title = titles[pathname] || (
    pathname.includes('/admin/customers/') && pathname.includes('/edit')
      ? 'Edit Customer'
      : pathname.includes('/admin/customers/')
        ? 'Customer Profile'
        : 'Admin'
  )

  return (
    <header className="h-14 border-b border-white/10 bg-[#0A0A0A] flex items-center px-6 sticky top-0 z-10">
      <h1 className="text-white font-medium text-sm">{title}</h1>
    </header>
  )
}
