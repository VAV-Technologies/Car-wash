'use client'

import { Sparkles } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div className="h-14 w-14 flex items-center justify-center bg-[#F97316]/10 border border-[#F97316]/30 mb-6">
        <Sparkles className="h-6 w-6 text-[#F97316]" />
      </div>
      <h1 className="font-heading text-2xl text-white mb-2">Selamat datang di Johan</h1>
      <p className="text-sm text-white/60 max-w-md mb-8">
        Private back-office co-pilot for the Castudio team. Draft customer replies in Shera's voice or ask
        biz questions for your own reference.
      </p>
      <div className="grid sm:grid-cols-2 gap-3 max-w-2xl w-full">
        <ExamplePrompt
          title="Draft a reply"
          description='"/customer 6281234567890" then ask "balas dia, tanya kapan free hari Jumat"'
        />
        <ExamplePrompt
          title="Reference a fact"
          description='"What is the difference between Standard and Professional?"'
        />
      </div>
      <p className="text-xs text-white/30 mt-8">Click "New chat" on the left to start.</p>
    </div>
  )
}

function ExamplePrompt({ title, description }: { title: string; description: string }) {
  return (
    <div className="border border-white/10 bg-[#171717] p-4 text-left">
      <div className="text-xs uppercase tracking-wider text-[#F97316] mb-2">{title}</div>
      <div className="text-sm text-white/70 font-mono">{description}</div>
    </div>
  )
}
