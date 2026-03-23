'use client'

import { ChevronDown } from 'lucide-react'

interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
}

export default function AdminSelect({ children, className, ...props }: AdminSelectProps) {
  return (
    <div className="relative inline-flex">
      <select
        {...props}
        className={`appearance-none rounded-lg border border-white/10 bg-[#171717] pl-3 pr-10 py-2 text-sm text-white/80 focus:outline-none focus:border-orange-500/50 cursor-pointer ${className ?? ''}`}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-9 flex items-center justify-center border-l border-white/10 rounded-r-lg">
        <ChevronDown className="h-4 w-4 text-white/40" />
      </div>
    </div>
  )
}
