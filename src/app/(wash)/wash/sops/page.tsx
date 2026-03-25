'use client'

import { useState } from 'react'
import { ChevronRight, FileText, X, ExternalLink, Wrench, ShieldCheck, Car, SprayCan, Droplets, CircleDot, Layers, Sparkles, MessageSquare, ClipboardCheck, Zap, PackageCheck } from 'lucide-react'

interface SOP {
  id: string
  title: string
  category: 'wash' | 'detail' | 'general'
  description: string
  icon: React.ElementType
  documentUrl: string | null // null = placeholder, will be replaced with real document links
}

const sops: SOP[] = [
  // ── Wash Services ──
  {
    id: 'standard-wash',
    title: 'Standard Wash',
    category: 'wash',
    description: 'SOP Standard Wash — Durasi 60-90 menit. Pre-wash, cuci kontak dua ember, pengeringan, interior cepat, tire dressing, dan sentuhan akhir.',
    icon: Car,
    documentUrl: '/sops/Castudio_SOP_Standard_Wash_ID.docx',
  },
  {
    id: 'professional-wash',
    title: 'Professional Wash',
    category: 'wash',
    description: 'SOP Professional Wash — Durasi 2-2,5 jam. Semua langkah Standard plus dekontaminasi besi & tar, paint sealant, interior mendalam dengan conditioning kulit.',
    icon: Sparkles,
    documentUrl: '/sops/Castudio_SOP_Professional_Wash_ID.docx',
  },
  {
    id: 'elite-wash',
    title: 'Elite Wash',
    category: 'wash',
    description: 'SOP Elite Wash — Durasi 3-3,5 jam. Semua langkah Professional plus clay bar, glass coating, engine bay ringan, detail bagasi, netralisasi bau.',
    icon: Layers,
    documentUrl: '/sops/Castudio_SOP_Elite_Wash_ID.docx',
  },

  // ── Detailing Services ──
  {
    id: 'interior-detail',
    title: 'Interior Detailing',
    category: 'detail',
    description: 'Full procedure for Interior Detailing — deep vacuum, upholstery extraction cleaning, leather conditioning, dashboard UV treatment, air vent detail, and odour neutralisation.',
    icon: SprayCan,
    documentUrl: null,
  },
  {
    id: 'exterior-detail',
    title: 'Exterior Detailing',
    category: 'detail',
    description: 'Full procedure for Exterior Detailing — foam pre-wash, clay bar treatment, machine polish, premium sealant coating, trim restoration, and door jamb cleaning.',
    icon: Droplets,
    documentUrl: null,
  },
  {
    id: 'window-detail',
    title: 'Window Detailing',
    category: 'detail',
    description: 'Full procedure for Window Detailing — interior & exterior glass deep clean, water scale/mineral removal, film & haze removal, and hydrophobic coating.',
    icon: CircleDot,
    documentUrl: null,
  },
  {
    id: 'tire-rims-detail',
    title: 'Tire & Rims Detailing',
    category: 'detail',
    description: 'Full procedure for Tire & Rims Detailing — brake dust removal, tar removal, rim polish, tire sidewall cleaning & dressing.',
    icon: Wrench,
    documentUrl: null,
  },
  {
    id: 'full-detail',
    title: 'Full Detail Package',
    category: 'detail',
    description: 'Full procedure for the complete Full Detail Package — combines interior, exterior, window, and tire & rims detailing into one end-to-end workflow.',
    icon: PackageCheck,
    documentUrl: null,
  },

  // ── General SOPs ──
  {
    id: 'vehicle-inspection',
    title: 'Vehicle Inspection',
    category: 'general',
    description: 'How to perform the pre-service and post-service vehicle inspection — documenting existing damage, taking before/after photos, and noting customer concerns.',
    icon: ClipboardCheck,
    documentUrl: null,
  },
  {
    id: 'equipment-setup',
    title: 'Equipment Setup & Teardown',
    category: 'general',
    description: 'Proper setup, operation, and teardown of all equipment — pressure washers, polishers, vacuums, power stations, and portable water tanks.',
    icon: Zap,
    documentUrl: null,
  },
  {
    id: 'chemical-handling',
    title: 'Chemical Handling & Safety',
    category: 'general',
    description: 'Safe handling, storage, dilution ratios, and disposal of all chemicals — foam shampoo, glass cleaner, tar remover, clay lubricant, sealants, and dressing products.',
    icon: ShieldCheck,
    documentUrl: null,
  },
  {
    id: 'customer-communication',
    title: 'Customer Communication',
    category: 'general',
    description: 'Guidelines for communicating with customers — arrival etiquette, service explanations, upsell opportunities, handling complaints, and follow-up procedures.',
    icon: MessageSquare,
    documentUrl: null,
  },
]

const categoryLabels: Record<string, string> = {
  wash: 'Wash Services',
  detail: 'Detailing Services',
  general: 'General Procedures',
}

export default function SOPsPage() {
  const [selectedSOP, setSelectedSOP] = useState<SOP | null>(null)

  const categories = ['wash', 'detail', 'general'] as const
  const grouped = categories.map((cat) => ({
    key: cat,
    label: categoryLabels[cat],
    items: sops.filter((s) => s.category === cat),
  }))

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-white/5 px-4 py-4">
        <h1 className="text-xl font-bold text-white">SOPs</h1>
        <p className="text-sm text-white/40">Standard Operating Procedures</p>
      </div>

      <div className="px-4 py-4 space-y-6">
        {grouped.map((group) => (
          <section key={group.key} className="space-y-3">
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">
              {group.label} ({group.items.length})
            </h2>

            <div className="space-y-2">
              {group.items.map((sop) => (
                <button
                  key={sop.id}
                  onClick={() => setSelectedSOP(sop)}
                  className="w-full text-left bg-[#171717] rounded-xl border border-white/10 p-4 flex items-center gap-3 hover:border-white/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <sop.icon size={20} className="text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm">{sop.title}</p>
                    <p className="text-xs text-white/40 mt-0.5 truncate">{sop.description}</p>
                  </div>
                  <ChevronRight size={16} className="text-white/30 flex-shrink-0" />
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* SOP Detail Modal */}
      {selectedSOP && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedSOP(null)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg bg-[#171717] rounded-t-2xl sm:rounded-2xl border border-white/10 max-h-[80vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setSelectedSOP(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X size={16} className="text-white/60" />
            </button>

            <div className="p-5 space-y-4">
              {/* Icon + Title */}
              <div className="flex items-start gap-3 pr-8">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <selectedSOP.icon size={24} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wide">
                    {categoryLabels[selectedSOP.category]}
                  </p>
                  <h2 className="text-lg font-bold text-white mt-0.5">{selectedSOP.title}</h2>
                </div>
              </div>

              {/* Description */}
              <div className="bg-[#0A0A0A] rounded-xl p-4 border border-white/5">
                <p className="text-sm text-white/70 leading-relaxed">{selectedSOP.description}</p>
              </div>

              {/* Open Document Button */}
              {selectedSOP.documentUrl ? (
                <a
                  href={selectedSOP.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors"
                >
                  <ExternalLink size={18} />
                  Open SOP Document
                </a>
              ) : (
                <div className="space-y-2">
                  <button
                    disabled
                    className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 text-white/30 font-medium rounded-xl cursor-not-allowed"
                  >
                    <FileText size={18} />
                    Document Coming Soon
                  </button>
                  <p className="text-xs text-white/25 text-center">
                    This SOP document is being prepared and will be linked here once ready.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
