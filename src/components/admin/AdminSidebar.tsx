'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, CreditCard, Calendar, Wrench, DollarSign, FileText, MessageCircle, UserCog, MapPin, Cog, Package, BarChart3, Target, LogOut } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { label: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { label: 'Jobs', href: '/admin/jobs', icon: Wrench },
  { label: 'Finance', href: '/admin/finance', icon: DollarSign },
  { label: 'Invoicing', href: '/admin/invoicing', icon: FileText },
  { label: 'Conversations', href: '/admin/conversations', icon: MessageCircle },
  { label: 'Team', href: '/admin/team', icon: UserCog },
  { label: 'Routes', href: '/admin/routes', icon: MapPin },
  { label: 'Equipment', href: '/admin/equipment', icon: Cog },
  { label: 'Inventory', href: '/admin/inventory', icon: Package },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Scorecard', href: '/admin/scorecard', icon: Target },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

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

      <nav className="flex-1 py-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'text-orange-500 bg-orange-500/10 border-r-2 border-orange-500'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
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
