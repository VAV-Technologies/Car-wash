'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Clock, DollarSign, User, ClipboardList } from 'lucide-react'

const tabs = [
  { label: 'Today', icon: Calendar, href: '/wash/today' },
  { label: 'History', icon: Clock, href: '/wash/history' },
  { label: 'SOPs', icon: ClipboardList, href: '/wash/sops' },
  { label: 'Earnings', icon: DollarSign, href: '/wash/earnings' },
  { label: 'Profile', icon: User, href: '/wash/profile' },
]

export default function BottomNav() {
  const pathname = usePathname()

  // Hide on login and job detail pages
  if (pathname === '/wash/login' || pathname.startsWith('/wash/job/')) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#111111] border-t border-white/10 flex items-center justify-around z-50">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-1 text-xs ${
              isActive ? 'text-orange-500' : 'text-white/40'
            }`}
          >
            <tab.icon size={20} />
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
