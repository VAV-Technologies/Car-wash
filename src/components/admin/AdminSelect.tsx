import { ChevronDown } from 'lucide-react'

interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  width?: string
}

export default function AdminSelect({ width, className, children, ...props }: AdminSelectProps) {
  return (
    <div className={`relative ${width || ''}`}>
      <select
        className={`w-full appearance-none rounded-lg border border-white/10 bg-[#171717] px-3 py-2 pr-8 text-sm text-white outline-none transition focus:border-orange-500/50 ${className || ''}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
    </div>
  )
}
