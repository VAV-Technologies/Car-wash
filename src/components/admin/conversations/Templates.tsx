'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface Template {
  id: string
  title: string
  description: string
  text: string
}

const TEMPLATES: Template[] = [
  {
    id: 'post_service',
    title: 'Post-Service Follow-Up',
    description: 'Send after completing a service to check satisfaction',
    text: `Halo [Nama Customer]! Terima kasih sudah menggunakan layanan Castudio hari ini. Semoga hasilnya memuaskan ya! Jika ada feedback atau pertanyaan, jangan ragu untuk menghubungi kami. Terima kasih dan sampai jumpa lagi!`,
  },
  {
    id: 'subscription_pitch',
    title: 'Subscription Pitch',
    description: 'Pitch subscription plans to recurring customers',
    text: `Halo [Nama Customer]! Kami perhatikan Anda sudah beberapa kali menggunakan layanan Castudio. Kami punya paket langganan yang bisa lebih hemat untuk Anda:

- Basic: Rp999.000/bulan (4x cuci)
- Standard: Rp1.499.000/bulan (8x cuci)
- Premium: Rp2.499.000/bulan (12x cuci)

Tertarik untuk info lebih lanjut? Kami bisa jelaskan detailnya!`,
  },
  {
    id: 'reengagement_14',
    title: 'Re-engagement (14 Day)',
    description: 'Reach out to customers inactive for 14 days',
    text: `Halo [Nama Customer]! Sudah 2 minggu sejak terakhir kali mobil Anda dirawat di Castudio. Yuk jadwalkan cuci berikutnya supaya mobil tetap bersih dan terawat! Reply pesan ini untuk booking, atau langsung hubungi kami. Terima kasih!`,
  },
  {
    id: 'reengagement_30',
    title: 'Re-engagement (30 Day)',
    description: 'Reach out to customers inactive for 30 days',
    text: `Halo [Nama Customer]! Kami kangen mobil Anda di Castudio! Sudah sebulan sejak perawatan terakhir. Kami punya promo spesial untuk Anda sebagai pelanggan setia kami. Hubungi kami untuk info lebih lanjut ya!`,
  },
  {
    id: 'referral_ask',
    title: 'Referral Ask',
    description: 'Ask satisfied customers for referrals',
    text: `Halo [Nama Customer]! Senang sekali Anda puas dengan layanan Castudio. Jika ada teman, keluarga, atau tetangga yang butuh cuci mobil premium, boleh bantu rekomendasikan Castudio ya! Kami sangat menghargai setiap referral dari pelanggan setia kami. Terima kasih!`,
  },
  {
    id: 'receipt',
    title: 'Receipt Confirmation',
    description: 'Send payment receipt confirmation',
    text: `Halo [Nama Customer]! Berikut konfirmasi pembayaran Anda:

Layanan: [Jenis Layanan]
Tanggal: [Tanggal]
Total: [Jumlah]
Metode: [Metode Pembayaran]
Status: Confirmed

Terima kasih atas kepercayaan Anda pada Castudio!`,
  },
]

export default function Templates() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function copyToClipboard(template: Template) {
    try {
      await navigator.clipboard.writeText(template.text)
      setCopiedId(template.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-white/40 text-sm mb-6">
        Pre-built WhatsApp message templates. Copy and customize placeholders before sending.
      </p>

      {TEMPLATES.map((template) => (
        <div
          key={template.id}
          className="bg-[#171717] border border-white/10 rounded-lg p-5"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="text-white font-medium text-sm">{template.title}</h3>
              <p className="text-white/40 text-xs mt-0.5">{template.description}</p>
            </div>
            <button
              onClick={() => copyToClipboard(template)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                copiedId === template.id
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
              }`}
            >
              {copiedId === template.id ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>

          <div className="bg-[#0A0A0A] border border-white/5 rounded-md p-4">
            <pre className="text-white/60 text-sm whitespace-pre-wrap font-sans leading-relaxed">
              {template.text.split(/(\[.*?\])/).map((part, i) =>
                part.startsWith('[') && part.endsWith(']') ? (
                  <span key={i} className="text-orange-400 font-medium">
                    {part}
                  </span>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </pre>
          </div>
        </div>
      ))}
    </div>
  )
}
