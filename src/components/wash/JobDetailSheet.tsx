'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { SERVICE_TYPES, formatCurrency, formatWhatsAppLink } from '@/lib/wash/constants'
import { getSOPChecklist, uploadSOPStepPhoto, listSOPStepPhotos } from '@/lib/wash/sop'
import { createJobRecord, updateBookingStatus, updateJobRecord, getJobByBookingId } from '@/lib/wash/jobs'
import { useToast } from '@/hooks/use-toast'
import {
  MapPin, Clock, Camera, Crown, Star, User, X,
  Loader2, MessageCircle, Phone, Navigation, Car,
  ChevronDown, CheckCircle2, ImagePlus, FileText,
  ExternalLink, Play, Send
} from 'lucide-react'

// ── SOP document data ──
const SOP_DOCS: Record<string, { description: string; documentUrl: string | null }> = {
  standard_wash: {
    description: 'SOP Standard Wash — Durasi 60-90 menit. Pre-wash, cuci kontak dua ember, pengeringan, interior cepat, tire dressing, dan sentuhan akhir.',
    documentUrl: '/sops/Castudio_SOP_Standard_Wash_ID.docx',
  },
  professional: {
    description: 'SOP Professional Wash — Durasi 2-2,5 jam. Semua langkah Standard plus dekontaminasi besi & tar, paint sealant, interior mendalam dengan conditioning kulit.',
    documentUrl: '/sops/Castudio_SOP_Professional_Wash_ID.docx',
  },
  elite_wash: {
    description: 'SOP Elite Wash — Durasi 3-3,5 jam. Semua langkah Professional plus clay bar, glass coating, engine bay ringan, detail bagasi, netralisasi bau.',
    documentUrl: '/sops/Castudio_SOP_Elite_Wash_ID.docx',
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

type Phase = 'info' | 'sop-doc' | 'checklist'

interface JobDetailSheetProps {
  booking: Booking | null
  washerId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onJobCompleted?: () => void
}

export default function JobDetailSheet({ booking, washerId, open, onOpenChange, onJobCompleted }: JobDetailSheetProps) {
  const { toast } = useToast()
  const [phase, setPhase] = useState<Phase>('info')
  const [sopSteps, setSopSteps] = useState<SOPStep[]>([])
  const [loadingSop, setLoadingSop] = useState(false)
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null)
  const [stepPhotos, setStepPhotos] = useState<Map<string, string[]>>(new Map())
  const [uploading, setUploading] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadStepRef = useRef<string | null>(null)

  // Reset state when modal closes or booking changes
  useEffect(() => {
    if (!open) {
      setPhase('info')
      setSopSteps([])
      setStepPhotos(new Map())
      setExpandedStepId(null)
      setJobId(null)
      setStarting(false)
      setSubmitting(false)
      return
    }
    if (!booking) return

    // If booking is already in_progress, jump straight to checklist phase
    if (booking.status === 'in_progress') {
      setPhase('checklist')
      // Look up existing job
      getJobByBookingId(booking.id)
        .then((job) => { if (job) setJobId(job.id) })
        .catch(() => {})
    }
  }, [open, booking])

  // Fetch SOP steps + existing photos when entering sop-doc or checklist phase
  const fetchSOP = useCallback(async () => {
    if (!booking) return
    setLoadingSop(true)
    try {
      const [steps, photos] = await Promise.all([
        getSOPChecklist(booking.service_type),
        listSOPStepPhotos(booking.id).catch(() => new Map<string, string[]>()),
      ])
      setSopSteps(steps)
      setStepPhotos(photos)
    } catch {
      setSopSteps([])
    } finally {
      setLoadingSop(false)
    }
  }, [booking])

  useEffect(() => {
    if (open && booking && (phase === 'sop-doc' || phase === 'checklist')) {
      fetchSOP()
    }
  }, [open, booking, phase, fetchSOP])

  if (!open || !booking) return null

  const customer = booking.customers
  const serviceInfo = SERVICE_TYPES[booking.service_type] || { label: booking.service_type, bonus: 0, duration: 0 }
  const sopDoc = SOP_DOCS[booking.service_type]

  // ── Helpers ──
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

  // Check if all required photos are uploaded
  function allPhotosComplete(): boolean {
    for (const step of sopSteps) {
      if (step.photo_required) {
        const photos = stepPhotos.get(step.id) || []
        if (photos.length === 0) return false
      }
    }
    return true
  }

  // ── Start Job ──
  async function handleStartJob() {
    setStarting(true)
    try {
      const job = await createJobRecord({
        booking_id: booking!.id,
        washer_id: washerId,
        started_at: new Date().toISOString(),
        service_type: booking!.service_type,
      })
      setJobId(job.id)

      try {
        await updateBookingStatus(booking!.id, 'in_progress')
      } catch {
        // Non-critical
      }

      setPhase('checklist')
    } catch (err: any) {
      toast({
        title: 'Failed to start job',
        description: err?.message || 'Something went wrong.',
        variant: 'destructive',
      })
    } finally {
      setStarting(false)
    }
  }

  // ── Submit / Complete Job ──
  async function handleSubmit() {
    if (!jobId) return
    setSubmitting(true)
    try {
      const completedAt = new Date().toISOString()
      const durationMin = 0 // We don't have a precise timer in this flow

      // Try to calculate from job started_at if possible
      await updateJobRecord(jobId, {
        completed_at: completedAt,
      })

      await updateBookingStatus(booking!.id, 'completed')

      toast({ title: 'Job completed', description: 'Great work!' })
      onOpenChange(false)
      onJobCompleted?.()
    } catch (err: any) {
      toast({
        title: 'Failed to submit',
        description: err?.message || 'Something went wrong.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // ── Status badge ──
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

  const photosReady = sopSteps.length > 0 && allPhotosComplete()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => onOpenChange(false)} />

      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />

      <div className="relative w-full max-w-md bg-[#171717] rounded-2xl border border-white/10 max-h-[85vh] overflow-y-auto shadow-2xl">
        <button onClick={() => onOpenChange(false)} className="absolute top-4 right-4 z-10 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <X size={16} className="text-white/60" />
        </button>

        <div className="p-5 space-y-5">
          {/* ── Header ── */}
          <div className="space-y-2 pr-8">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[booking.status] || 'bg-white/10 text-white/60'}`}>
                {statusLabels[booking.status] || booking.status}
              </span>
              <span className="text-xs text-white/40">{formatTime(booking.scheduled_time)}</span>
            </div>
            <h2 className="text-lg font-bold text-white">{serviceInfo.label}</h2>
          </div>

          {/* ── Customer + Car + Location ── */}
          <div className="bg-[#0A0A0A] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-medium">{customer.name}</h3>
              {customer.segment === 'vip' && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 flex items-center gap-1"><Crown className="w-3 h-3" /> VIP</span>
              )}
              {customer.segment === 'subscriber' && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 flex items-center gap-1"><Star className="w-3 h-3" /> Subscriber</span>
              )}
              {customer.segment === 'new' && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-1"><User className="w-3 h-3" /> New</span>
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
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address || customer.neighborhood)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg py-2 px-3 text-xs font-medium transition-colors">
                <Navigation className="w-3.5 h-3.5" /> Navigate
              </a>
              <a href={formatWhatsAppLink(customer.phone)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-green-500/10 hover:bg-green-500/15 border border-green-500/20 text-green-400 rounded-lg py-2 px-3 text-xs font-medium transition-colors">
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </a>
              <a href={`tel:${customer.phone}`} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg py-2 px-3 text-xs font-medium transition-colors">
                <Phone className="w-3.5 h-3.5" /> Call
              </a>
            </div>
          </div>

          {/* ── Service info ── */}
          <div className="flex items-center justify-between bg-[#0A0A0A] rounded-xl p-4">
            <div className="space-y-1">
              <p className="text-xs text-white/40 uppercase tracking-wide">Duration</p>
              <p className="text-sm text-white font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-white/40" /> {formatDuration(serviceInfo.duration)}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-xs text-white/40 uppercase tracking-wide">Bonus</p>
              <p className="text-sm text-orange-400 font-medium">{formatCurrency(serviceInfo.bonus)}</p>
            </div>
          </div>

          {/* ── PHASE: info → View SOP button ── */}
          {phase === 'info' && sopDoc && (
            <button
              onClick={() => setPhase('sop-doc')}
              className="w-full flex items-center justify-between bg-[#0A0A0A] rounded-xl p-4 border border-white/5 hover:border-orange-500/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-white">View SOP Document</span>
              </div>
              <ChevronDown className="w-4 h-4 text-white/40 -rotate-90" />
            </button>
          )}

          {/* ── PHASE: sop-doc → SOP description + Start Job button ── */}
          {phase === 'sop-doc' && (
            <div className="space-y-4">
              {/* SOP description */}
              {sopDoc && (
                <div className="bg-[#0A0A0A] rounded-xl p-4 border border-orange-500/10 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-medium text-white">SOP — {serviceInfo.label}</span>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">{sopDoc.description}</p>
                  {sopDoc.documentUrl ? (
                    <a
                      href={sopDoc.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs font-medium rounded-lg transition-colors"
                    >
                      <ExternalLink size={14} /> Open Full Document
                    </a>
                  ) : (
                    <p className="text-xs text-white/25 text-center py-1">Full document will be linked here once ready.</p>
                  )}
                </div>
              )}

              {/* SOP steps preview */}
              {loadingSop ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                </div>
              ) : sopSteps.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs text-white/40 uppercase tracking-wide">Steps overview</p>
                  {sopSteps.map((step) => (
                    <div key={step.id} className="flex items-center gap-2 px-3 py-2 bg-[#0A0A0A] rounded-lg border border-white/5">
                      <span className="w-5 h-5 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{step.step_number}</span>
                      <span className="text-xs text-white/60 flex-1">{step.step_title}</span>
                      {step.photo_required && <Camera className="w-3 h-3 text-orange-400/50" />}
                    </div>
                  ))}
                </div>
              )}

              {/* Start Job button */}
              <button
                onClick={handleStartJob}
                disabled={starting}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-3.5 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Start Job
              </button>
            </div>
          )}

          {/* ── PHASE: checklist → SOP steps with photo upload + Submit ── */}
          {phase === 'checklist' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">
                SOP Checklist — Upload Photos
              </h3>

              {loadingSop ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                </div>
              ) : sopSteps.length === 0 ? (
                <p className="text-sm text-white/30 py-4 text-center">No SOP steps configured.</p>
              ) : (
                <div className="space-y-2">
                  {sopSteps.map((step) => {
                    const isExpanded = expandedStepId === step.id
                    const photos = stepPhotos.get(step.id) || []
                    const hasPhotos = photos.length > 0
                    const isUploading = uploading === step.id
                    const needsPhoto = step.photo_required && !hasPhotos

                    return (
                      <div
                        key={step.id}
                        className={`bg-[#0A0A0A] rounded-xl border overflow-hidden transition-colors ${
                          needsPhoto ? 'border-orange-500/20' : hasPhotos ? 'border-green-500/20' : 'border-white/5'
                        }`}
                      >
                        <button
                          onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                          className="w-full flex items-start gap-3 p-3 text-left"
                        >
                          {/* Step number badge */}
                          <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            hasPhotos ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/10 text-orange-400'
                          }`}>
                            {hasPhotos ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.step_number}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium">{step.step_title}</p>
                            <div className="flex items-center gap-3 mt-1">
                              {step.estimated_minutes && (
                                <span className="text-xs text-white/30 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {step.estimated_minutes}m
                                </span>
                              )}
                              {step.photo_required && !hasPhotos && (
                                <span className="text-xs text-orange-400/60 flex items-center gap-1">
                                  <Camera className="w-3 h-3" /> Photo required
                                </span>
                              )}
                              {hasPhotos && (
                                <span className="text-xs text-green-400 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> {photos.length} photo{photos.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-white/30 flex-shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>

                        {isExpanded && (
                          <div className="px-3 pb-3 space-y-3 border-t border-white/5 pt-3">
                            {step.step_description && (
                              <p className="text-sm text-white/60 leading-relaxed">{step.step_description}</p>
                            )}
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
                            {hasPhotos && (
                              <div className="flex gap-2 overflow-x-auto pb-1">
                                {photos.map((url, i) => (
                                  <div key={i} className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-white/5">
                                    <img src={url} alt={`Step ${step.step_number} photo ${i + 1}`} className="w-full h-full object-cover" />
                                  </div>
                                ))}
                              </div>
                            )}
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
                                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
                                ) : hasPhotos ? (
                                  <><CheckCircle2 className="w-3.5 h-3.5" /> Photo Complete — Add More</>
                                ) : (
                                  <><ImagePlus className="w-3.5 h-3.5" /> Upload Photos</>
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

              {/* Submit button — only when all required photos are done */}
              {sopSteps.length > 0 && (
                <button
                  onClick={handleSubmit}
                  disabled={!photosReady || submitting}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-colors ${
                    photosReady
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-white/5 text-white/30 cursor-not-allowed'
                  } disabled:opacity-60`}
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                  ) : photosReady ? (
                    <><Send className="w-4 h-4" /> Submit &amp; Complete Job</>
                  ) : (
                    <><Camera className="w-4 h-4" /> Upload all required photos to submit</>
                  )}
                </button>
              )}

              {/* Fallback submit for services with no SOP steps */}
              {sopSteps.length === 0 && !loadingSop && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-xl py-3.5 text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit &amp; Complete Job
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
