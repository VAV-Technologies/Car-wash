'use client'

import { usePathname } from 'next/navigation'
import BottomNav from '@/components/wash/BottomNav'

export default function WashLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/wash/login'

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className={isLoginPage ? '' : 'pb-20'}>
        {children}
      </div>
      {!isLoginPage && <BottomNav />}
    </div>
  )
}
