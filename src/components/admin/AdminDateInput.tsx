interface AdminDateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function AdminDateInput({ className, ...props }: AdminDateInputProps) {
  return (
    <input
      type="date"
      className={`w-full rounded-lg border border-white/10 bg-[#171717] px-3 py-2 text-sm text-white outline-none transition focus:border-orange-500/50 [color-scheme:dark] ${className || ''}`}
      {...props}
    />
  )
}
