'use client'

import { useEffect, useState, useRef } from 'react'
import { SERVICE_TYPES, formatCurrency, formatWhatsAppLink } from '@/lib/wash/constants'
import { getSOPChecklist, uploadSOPStepPhoto, listSOPStepPhotos } from '@/lib/wash/sop'
import {
  MapPin, Clock, Camera, Crown, Star, User, X,
  Loader2, MessageCircle, Phone, Navigation, Car,
  ChevronDown, CheckCircle2, ImagePlus, FileText, ExternalLink
} from 'lucide-react'

// ── SOP document data (mirrors the SOPs page) ──
const SOP_DOCS: Record<string, { description: string; documentUrl: string | null }> = {
  standard_wash: {
    description: 'Full procedure for the Standard Wash service — foam pre-wash, premium hand wash, interior clean & vacuum, tire polish & rim clean, and body spot remover.',
    documentUrl: null,
  },
  professional: {
    description: 'Full procedure for the Professional Wash service — everything in Standard plus glass spot remover and tar remover.',
    documentUrl: null,
  },
  elite_wash: {
    description: 'Full procedure for the Elite Wash service — everything in Professional plus clay bar decontamination and sealant coating.',
    documentUrl: null,
  },
  interior_detail: {
    description: 'Full procedure for Interior Detailing — deep vacuum, upholstery extraction cleaning, leather conditioning, dashboard UV treatment, air vent detail, and odour neutralisation.',
    documentUrl: null,
  },
  exterior_detail: {
    description: 'Full procedure for Exterior Detailing — foam pre-wash, clay bar treatment, machine polish, premium sealant coating, trim restoration, and door jamb cleaning.',
    documentUrl: null,
  },
  window_detail: {
    description: 'Full procedure for Window Detailing — interior & exterior glass deep clean, water scale/mineral removal, film & haze removal, and hydrophobic coating.',
    documentUrl: null,
  },
  tire_rims: {
    description: 'Full procedure for Tire & Rims Detailing — brake dust removal, tar removal, rim polish, tire sidewall cleaning & dressing.',
    documentUrl: null,
  },
  full_detail: {
    description: 'Full procedure for the complete Full Detail Package — combines interior, exterior, window, and tire & rims detailing into one end-to-end workflow.',
    documentUrl: null,
  },
}

interface Booking {
  id: string
  scheduled_time: string
  scheduled_date: string
  status: string
  service_type: string
  address?: string
  customers: {
    id: string
    name: string
    phone: string
    car_model: string
    plate_number: string
    neighborhood: string
    segment: string
  }
}

interface SOPStep {
  id: string
  step_number: number
  step_title: string
  step_description: string
  estimated_minutes: number | null
  photo_required: boolean
  photo_description: string | null
  equipment_needed: string[] | null
  chemicals_needed: string[] | null
}

interface JobDetailSheetProps {
  booking: Booking | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function JobDetailSheet({ booking, open, onOpenChange }: JobDetailSheetProps) {
  const [sopSteps, setSopSteps] = useState<SOPStep[]>([])
  const [loadingSop, setLoadingSop] = useState(false)
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null)
  const [stepPhotos, setStepPhotos] = useState<Map<string, string[]>>(new Map())
  const [uploading, setUploading] = useState<string | null>(null)
  const [showSOPDoc, setShowSOPDoc] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadStepRef = useRef<string | null>(null)

  useEffect(() => {
    if (!open || !booking) {
      setSopSteps([])
      setStepPhotos(new Map())
      setExpandedStepId(null)
      setShowSOPDoc(false)
      return
    }

    let cancelled = false
    async function fetchData() {
      setLoadingSop(true)
      try {
        const [steps, photos] = await Promise.all([
          getSOPChecklist(booking!.service_type),
          listSOPStepPhotos(booking!.id).catch(() => new Map<string, string[]>()),
        ])
        if (!cancelled) {
          setSopSteps(steps)
          setStepPhotos(photos)
        }
      } catch {
        if (!cancelled) setSopSteps([])
      } finally {
        if (!cancelled) setLoadingSop(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [open, booking])

  if (!open || !booking) return null

  const customer = booking.customers
  const serviceInfo = SERVICE_TYPES[booking.service_type] || {
    label: booking.service_type,
    bonus: 0,
    duration: 0,
  }
  const sopDoc = SOP_DOCS[booking.service_type]

  function formatTime(time: string) {
    if (!time) return ''
    const [h, m] = time.split(':')
    const hour = parseInt(h, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${hour12}:${m} ${ampm}`
  }

  function formatDuration(minutes: number) {
    if (minutes < 60) return `${minutes} min`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  function triggerUpload(stepId: string) {
    uploadStepRef.current = stepId
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    const stepId = uploadStepRef.current
    if (!files || files.length === 0 || !stepId || !booking) return

    setUploading(stepId)
    try {
      const newUrls: string[] = []
      for (const file of Array.from(files)) {
        const url = await uploadSOPStepPhoto(file, booking.id, stepId)
        newUrls.push(url)
      }
      setStepPhotos((prev) => {
        const next = new Map(prev)
        const existing = next.get(stepId) || []
        next.set(stepId, [...existing, ...newUrls])
        return next
      })
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const statusStyles: Record<string, string> = {
    confirmed: 'bg-blue-500/20 text-blue-400',
    en_route: 'bg-yellow-500/20 text-yellow-400',
    in_progress: 'bg-orange-500/20 text-orange-400',
    completed: 'bg-green-500/20 text-green-400',
  }
  const statusLabels: Record<string, string> = {
    confirmed: 'Confirmed',
    en_route: 'On The Way',
    in_progress: 'In Progress',
    completed: 'Completed',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Hidden multi-file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Floating modal */}
      <div className="relative w-full max-w-md bg-[#171717] rounded-2xl border border-white/10 max-h-[85vh] overflow-y-auto shadow-2xl">
        {/* Close */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X size={16} className="text-white/60" />
        </button>

        <div className="p-5 space-y-5">
          {/* Header */}
          <div className="space-y-2 pr-8">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[booking.status] || 'bg-white/10 text-white/60'}`}>
                {statusLabels[booking.status] || booking.status}
              </span>
              <span className="text-xs text-white/40">{formatTime(booking.scheduled_time)}</span>
            </div>
            <h2 className="text-lg font-bold text-white">{serviceInfo.label}</h2>
          </div>

          {/* Customer + Car + Location */}
          <div className="bg-[#0A0A0A] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-medium">{customer.name}</h3>
              {customer.segment === 'vip' && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 flex items-center gap-1">
                  <Crown className="w-3 h-3" /> VIP
                </span>
              )}
              {customer.segment === 'subscriber' && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 flex items-center gap-1">
                  <Star className="w-3 h-3" /> Subscriber
                </span>
              )}
              {customer.segment === 'new' && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                  <User className="w-3 h-3" /> New
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Car className="w-4 h-4 text-white/30" />
              <span>{customer.car_model}</span>
              <span className="text-white/30">&middot;</span>
              <span className="text-white/50">{customer.plate_number}</span>
            </div>
            {(booking.address || customer.neighborhood) && (
              <div className="flex items-start gap-2 text-sm text-white/50">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/30" />
                <div>
                  {booking.address && <p className="text-white/60">{booking.address}</p>}
                  <p className="text-white/40">{customer.neighborhood}</p>
                </div>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address || customer.neighborhood)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg py-2 px-3 text-xs font-medium transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                Navigate
              </a>
              <a
                href={formatWhatsAppLink(customer.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-green-500/10 hover:bg-green-500/15 border border-green-500/20 text-green-400 rounded-lg py-2 px-3 text-xs font-medium transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
              <a
                href={`tel:${customer.phone}`}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg py-2 px-3 text-xs font-medium transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                Call
              </a>
            </div>
          </div>

          {/* Service info */}
          <div className="flex items-center justify-between bg-[#0A0A0A] rounded-xl p-4">
            <div className="space-y-1">
              <p className="text-xs text-white/40 uppercase tracking-wide">Duration</p>
              <p className="text-sm text-white font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-white/40" />
                {formatDuration(serviceInfo.duration)}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-xs text-white/40 uppercase tracking-wide">Bonus</p>
              <p className="text-sm text-orange-400 font-medium">{formatCurrency(serviceInfo.bonus)}</p>
            </div>
          </div>

          {/* View SOP Document button */}
          {sopDoc && (
            <button
              onClick={() => setShowSOPDoc(!showSOPDoc)}
              className="w-full flex items-center justify-between bg-[#0A0A0A] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-white">View SOP Document</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${showSOPDoc ? 'rotate-180' : ''}`} />
            </button>
          )}

          {/* SOP Document expanded */}
          {showSOPDoc && sopDoc && (
            <div className="bg-[#0A0A0A] rounded-xl p-4 border border-orange-500/10 space-y-3">
              <p className="text-sm text-white/70 leading-relaxed">{sopDoc.description}</p>
              {sopDoc.documentUrl ? (
                <a
                  href={sopDoc.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <ExternalLink size={16} />
                  Open Full Document
                </a>
              ) : (
                <p className="text-xs text-white/25 text-center py-1">
                  Full document will be linked here once ready.
                </p>
              )}
            </div>
          )}

          {/* SOP Checklist */}
          <div>
            <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-3">
              SOP Checklist
            </h3>
            {loadingSop ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
              </div>
            ) : sopSteps.length === 0 ? (
              <p className="text-sm text-white/30 py-4 text-center">No SOP steps configured for this service.</p>
            ) : (
              <div className="space-y-2">
                {sopSteps.map((step) => {
                  const isExpanded = expandedStepId === step.id
                  const photos = stepPhotos.get(step.id) || []
                  const hasPhotos = photos.length > 0
                  const isUploading = uploading === step.id

                  return (
                    <div
                      key={step.id}
                      className={`bg-[#0A0A0A] rounded-xl border overflow-hidden transition-colors ${
                        isExpanded ? 'border-orange-500/30' : 'border-white/5'
                      }`}
                    >
                      {/* Step header — tap to expand */}
                      <button
                        onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                        className="w-full flex items-start gap-3 p-3 text-left"
                      >
                        <span className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {step.step_number}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium">{step.step_title}</p>
                          <div className="flex items-center gap-3 mt-1">
                            {step.estimated_minutes && (
                              <span className="text-xs text-white/30 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {step.estimated_minutes}m
                              </span>
                            )}
                            {step.photo_required && !hasPhotos && (
                              <span className="text-xs text-orange-400/60 flex items-center gap-1">
                                <Camera className="w-3 h-3" />
                                Photo required
                              </span>
                            )}
                            {hasPhotos && (
                              <span className="text-xs text-green-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-white/30 flex-shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="px-3 pb-3 space-y-3 border-t border-white/5 pt-3">
                          {/* Description */}
                          {step.step_description && (
                            <p className="text-sm text-white/60 leading-relaxed">{step.step_description}</p>
                          )}

                          {/* Equipment + Chemicals */}
                          {step.equipment_needed && step.equipment_needed.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {step.equipment_needed.map((item) => (
                                <span key={item} className="text-xs bg-white/5 text-white/50 px-2 py-0.5 rounded-full">{item}</span>
                              ))}
                            </div>
                          )}
                          {step.chemicals_needed && step.chemicals_needed.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {step.chemicals_needed.map((item) => (
                                <span key={item} className="text-xs bg-blue-500/10 text-blue-400/70 px-2 py-0.5 rounded-full">{item}</span>
                              ))}
                            </div>
                          )}

                          {/* Uploaded photos gallery */}
                          {hasPhotos && (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                              {photos.map((url, i) => (
                                <div key={i} className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-white/5">
                                  <img src={url} alt={`Step ${step.step_number} photo ${i + 1}`} className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Upload button */}
                          {step.photo_required && (
                            <button
                              type="button"
                              onClick={() => triggerUpload(step.id)}
                              disabled={isUploading}
                              className={`w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-medium transition-colors ${
                                hasPhotos
                                  ? 'bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/15'
                                  : 'bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/15'
                              } disabled:opacity-50`}
                            >
                              {isUploading ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  Uploading...
                                </>
                              ) : hasPhotos ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Photo Complete — Add More
                                </>
                              ) : (
                                <>
                                  <ImagePlus className="w-3.5 h-3.5" />
                                  Upload Photos
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
