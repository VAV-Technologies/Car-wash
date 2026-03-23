'use client'

import { Calendar } from 'lucide-react'

interface AdminDateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function AdminDateInput({ className, ...props }: AdminDateInputProps) {
  return (
    <div className="relative inline-flex">
      <input
        type="date"
        {...props}
        className={`appearance-none w-full rounded-lg border border-white/10 bg-[#171717] px-3 pr-11 py-2 text-sm text-white/80 focus:outline-none focus:border-orange-500/50 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer ${className ?? ''}`}
      />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center border-l border-white/10 rounded-r-lg">
        <Calendar className="h-4 w-4 text-white/40" />
      </div>
    </div>
  )
}
