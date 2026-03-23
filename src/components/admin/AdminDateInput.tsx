'use client'

import { Calendar } from 'lucide-react'

interface AdminDateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function AdminDateInput({ className, ...props }: AdminDateInputProps) {
  return (
    <div className="relative inline-flex">
      <input
        type="date"
        {...props}
        className={`appearance-none rounded-lg border border-white/10 bg-[#171717] pl-3 pr-10 py-2 text-sm text-white/80 focus:outline-none focus:border-orange-500/50 [color-scheme:dark] ${className ?? ''}`}
      />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-9 flex items-center justify-center border-l border-white/10 rounded-r-lg">
        <Calendar className="h-4 w-4 text-white/40" />
      </div>
    </div>
  )
}
