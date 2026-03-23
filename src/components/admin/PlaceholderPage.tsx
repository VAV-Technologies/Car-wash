'use client'

interface PlaceholderPageProps {
  title: string
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="rounded-lg border border-white/10 bg-[#171717] px-8 py-10 max-w-md w-full">
        <h1 className="text-xl font-bold text-white">{title}</h1>
        <p className="text-white/40 mt-3 text-sm">
          This module is coming soon. Check back later for updates.
        </p>
        <div className="mt-6 h-1 w-16 mx-auto rounded-full bg-orange-500/40" />
      </div>
    </div>
  )
}
