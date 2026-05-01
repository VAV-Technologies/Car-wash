'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (digits: string) => void
  initial?: string | null
}

export function LockToCustomerDialog({ open, onOpenChange, onConfirm, initial }: Props) {
  const [phone, setPhone] = useState(initial || '')
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 8) {
      setError('Enter a valid phone number (min 8 digits).')
      return
    }
    onConfirm(digits)
    onOpenChange(false)
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0A0A0A] border-white/10 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading text-base text-white">Lock to customer</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-white/60">
            Drafts in this thread will be tailored to this customer. Johan will load their WhatsApp history before
            replying.
          </p>
          <input
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              setError(null)
            }}
            placeholder="6281234567890"
            className="w-full h-10 bg-[#171717] border border-white/10 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 font-mono"
            autoFocus
          />
          {error && <div className="text-xs text-red-400">{error}</div>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-white/60 hover:text-white hover:bg-white/5">
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="bg-[#F97316] text-black hover:bg-[#EA580C]">
            Lock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
