'use client'

import { ChevronDown } from 'lucide-react'

interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
  width?: string
}

export default function AdminSelect({ children, className, width, ...props }: AdminSelectProps) {
  return (
    <div className={`relative inline-flex ${width ?? ''}`}>
      <select
        {...props}
        className={`appearance-none w-full rounded-lg border border-white/10 bg-[#171717] px-3 pr-11 py-2 text-sm text-white/80 focus:outline-none focus:border-orange-500/50 cursor-pointer ${className ?? ''}`}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center border-l border-white/10 rounded-r-lg">
        <ChevronDown className="h-4 w-4 text-white/40" />
      </div>
    </div>
  )
}
