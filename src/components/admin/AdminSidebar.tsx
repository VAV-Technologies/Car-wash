'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, CreditCard, MessageCircle,
  Calendar, Wrench, MapPin,
  DollarSign, FileText, Package,
  UserCog, Cog,
  Zap,
  BarChart3, Target, Bot, Settings,
  ChevronDown, LogOut,
} from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: 'Sales & Marketing',
    items: [
      { label: 'Customers', href: '/admin/customers', icon: Users },
      { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
      { label: 'Conversations', href: '/admin/conversations', icon: MessageCircle },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Bookings', href: '/admin/bookings', icon: Calendar },
      { label: 'Job Tracker', href: '/admin/jobs', icon: Wrench },
      { label: 'Route Planner', href: '/admin/routes', icon: MapPin },
      { label: 'Team & Bonus', href: '/admin/team', icon: UserCog },
      { label: 'Equipment', href: '/admin/equipment', icon: Cog },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Finance', href: '/admin/finance', icon: DollarSign },
      { label: 'Invoicing', href: '/admin/invoicing', icon: FileText },
      { label: 'Inventory', href: '/admin/inventory', icon: Package },
    ],
  },
  {
    label: 'Technology',
    items: [
      { label: 'Automations', href: '/admin/automations', icon: Zap },
    ],
  },
  {
    label: 'Analysis',
    items: [
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      { label: 'Scorecard', href: '/admin/scorecard', icon: Target },
    ],
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  // Auto-open groups that contain the active page
  const initialOpen = new Set<string>()
  for (const group of navGroups) {
    if (group.items.some(item => pathname.startsWith(item.href))) {
      initialOpen.add(group.label)
    }
  }

  const [openGroups, setOpenGroups] = useState<Set<string>>(initialOpen)

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev)
      if (next.has(label)) {
        next.delete(label)
      } else {
        next.add(label)
      }
      return next
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="w-56 bg-[#111111] border-r border-white/10 flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-white/10">
        <Link href="/admin" className="text-white font-bold text-lg">
          Castudio <span className="text-orange-500 text-xs font-normal">Admin</span>
        </Link>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {/* Dashboard — standalone */}
        <Link
          href="/admin/dashboard"
          className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
            pathname.startsWith('/admin/dashboard')
              ? 'text-orange-500 bg-orange-500/10 border-r-2 border-orange-500'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>

        {/* Grouped sections */}
        {navGroups.map((group) => {
          const isOpen = openGroups.has(group.label)
          const hasActive = group.items.some(item => pathname.startsWith(item.href))

          return (
            <div key={group.label} className="mt-1">
              <button
                onClick={() => toggleGroup(group.label)}
                className={`w-full flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  hasActive ? 'text-orange-400' : 'text-white/30 hover:text-white/50'
                }`}
              >
                {group.label}
                <ChevronDown
                  className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isOpen && (
                <div className="pb-1">
                  {group.items.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 pl-6 pr-4 py-2 text-sm transition-colors ${
                          isActive
                            ? 'text-orange-500 bg-orange-500/10 border-r-2 border-orange-500'
                            : 'text-white/50 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="border-t border-white/10">
        <Link
          href="/admin/settings"
          className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
            pathname.startsWith('/admin/settings')
              ? 'text-orange-500 bg-orange-500/10'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/40 hover:text-red-400 transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
