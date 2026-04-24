'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, Check, CheckCircle2, ChevronLeft, ChevronRight, Droplets, Lock,
  Loader2, MapPin, MessageCircle, Pencil, Sparkles, Car, CalendarDays, X,
} from 'lucide-react'
import {
  WASH_SERVICES, DETAIL_SERVICES, ALL_SERVICES, DETAILING_VALUES,
  WASH_PREREQ_PRICE, TIME_SLOTS, formatRupiah,
} from '@/lib/booking-form-constants'

// ─── Types ──────────────────────────────────────────────────────────

interface FormState {
  category: 'wash' | 'detailing' | ''
  name: string
  phone: string
  service_type: string
  car_model: string
  plate_number: string
  address: string
  date: Date | undefined
  time: string
  add_wash: boolean
}

const EMPTY_FORM: FormState = {
  category: '', name: '', phone: '', service_type: '', car_model: '',
  plate_number: '', address: '', date: undefined, time: '', add_wash: false,
}

const TOTAL_STEPS = 7
const STEP_LABELS = ['Kategori', 'Layanan', 'Info Kamu', 'Mobil', 'Alamat', 'Jadwal', 'Konfirmasi']

// ─── Animation Variants ─────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '40%' : '-40%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-40%' : '40%', opacity: 0 }),
}

// ─── Main Component ─────────────────────────────────────────────────

export default function TokenBookingPage() {
  const { token } = useParams<{ token: string }>()
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [whatsappPhone, setWhatsappPhone] = useState('')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─── Load saved data ────────────────────────────────────────────
  useEffect(() => {
    if (!token) return
    fetch(`/api/book/${token}`)
      .then(r => r.json())
      .then(data => {
        if (!data.ok) { setNotFound(true); setLoading(false); return }
        if (data.status === 'submitted') { setAlreadySubmitted(true); setLoading(false); return }
        const fd = data.formData || {}
        const loaded: FormState = {
          category: fd.category || (fd.service_type ? (DETAILING_VALUES.includes(fd.service_type) ? 'detailing' : 'wash') : ''),
          name: fd.name || '',
          phone: fd.phone || '',
          service_type: fd.service_type || '',
          car_model: fd.car_model || '',
          plate_number: fd.plate_number || '',
          address: fd.address || '',
          date: fd.date ? new Date(fd.date + 'T00:00:00') : undefined,
          time: fd.time || '',
          add_wash: fd.add_wash === true,
        }
        setForm(loaded)
        setWhatsappPhone(fd.phone || '')
        // Restore to furthest completed step
        if (loaded.time && loaded.date) setStep(6)
        else if (loaded.address) setStep(5)
        else if (loaded.car_model) setStep(4)
        else if (loaded.name) setStep(3)
        else if (loaded.service_type) setStep(2)
        else if (loaded.category) setStep(1)
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [token])

  // ─── Auto-save ──────────────────────────────────────────────────
  const autoSave = useCallback((f: FormState) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSaveStatus('saving')
    saveTimer.current = setTimeout(async () => {
      try {
        await fetch(`/api/book/${token}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: f.category, name: f.name, phone: f.phone,
            service_type: f.service_type, car_model: f.car_model,
            plate_number: f.plate_number, address: f.address,
            date: f.date?.toISOString().split('T')[0] || '',
            time: f.time, add_wash: f.add_wash,
          }),
        })
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch { setSaveStatus('idle') }
    }, 1200)
  }, [token])

  function update(patch: Partial<FormState>) {
    setForm(prev => {
      const next = { ...prev, ...patch }
      autoSave(next)
      return next
    })
  }

  // ─── Navigation ─────────────────────────────────────────────────
  const [editingFromReview, setEditingFromReview] = useState(false)

  function goNext() { setDirection(1); setStep(s => Math.min(s + 1, TOTAL_STEPS - 1)) }
  function goBack() { setDirection(-1); setStep(s => Math.max(s - 1, 0)) }
  function goTo(s: number) { setDirection(s > step ? 1 : -1); setStep(s) }
  function editFromReview(s: number) { setEditingFromReview(true); setDirection(-1); setStep(s) }
  function returnToReview() { setEditingFromReview(false); setDirection(1); setStep(6) }
  // Auto-advance steps (no Lanjut button) jump straight to review when editing
  function advanceOrReturn() { if (editingFromReview) returnToReview(); else goNext() }

  // ─── Derived values ─────────────────────────────────────────────
  const selectedService = ALL_SERVICES.find(s => s.value === form.service_type)
  const isDetailing = DETAILING_VALUES.includes(form.service_type)
  const totalPrice = useMemo(() => {
    if (!selectedService) return 0
    return selectedService.price + (isDetailing && form.add_wash ? WASH_PREREQ_PRICE : 0)
  }, [selectedService, isDetailing, form.add_wash])
  const waNumber = whatsappPhone.replace(/[^0-9]/g, '')

  // ─── Submit ─────────────────────────────────────────────────────
  async function handleSubmit() {
    if (submitting) return
    setSubmitting(true)
    setErrors({})
    try {
      const res = await fetch(`/api/book/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(), phone: form.phone.trim(),
          service_type: form.service_type, car_model: form.car_model.trim(),
          plate_number: form.plate_number.trim(), address: form.address.trim(),
          date: form.date!.toISOString().split('T')[0], time: form.time,
          add_wash: isDetailing && form.add_wash,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setErrors(data.errors || { _form: data.error || 'Terjadi kesalahan' }); return }
      setSuccess(true)
    } catch { setErrors({ _form: 'Koneksi gagal, coba lagi' }) }
    finally { setSubmitting(false) }
  }

  // ─── Loading / Error states ─────────────────────────────────────
  if (loading) return (
    <div className="min-h-dvh flex items-center justify-center bg-[#0A0A0A]">
      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
    </div>
  )
  if (notFound) return (
    <div className="min-h-dvh flex items-center justify-center bg-[#0A0A0A] p-6">
      <div className="text-center space-y-3">
        <h2 className="text-xl font-bold text-white">Link Tidak Ditemukan</h2>
        <p className="text-white/50 text-sm">Link booking ini tidak valid atau sudah kedaluwarsa.</p>
      </div>
    </div>
  )
  if (alreadySubmitted) return (
    <div className="min-h-dvh flex items-center justify-center bg-[#0A0A0A] p-6">
      <div className="text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Booking Sudah Dikirim</h2>
        <p className="text-white/50 text-sm">Kalau mau booking lagi, chat Shera ya!</p>
        {waNumber && (
          <a href={`https://wa.me/${waNumber}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors font-medium text-sm">
            <MessageCircle className="w-4 h-4" /> Chat Shera
          </a>
        )}
      </div>
    </div>
  )

  // ─── Success ────────────────────────────────────────────────────
  if (success) return (
    <div className="min-h-dvh flex items-center justify-center bg-[#0A0A0A] p-6">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', duration: 0.5 }} className="text-center space-y-5 max-w-sm mx-auto">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white">Booking Berhasil!</h2>
        {selectedService && (
          <div className="bg-white/5 rounded-2xl p-4 space-y-2 text-left border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0">
                <Image src={selectedService.image} alt={selectedService.label} fill className="object-cover" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{selectedService.label}</p>
                <p className="text-orange-400 font-bold text-sm">{formatRupiah(totalPrice)}</p>
              </div>
            </div>
            <div className="text-white/50 text-xs space-y-1 pt-2 border-t border-white/10">
              <p>{form.car_model} — {form.plate_number.toUpperCase()}</p>
              <p>{form.date?.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })} pukul {form.time}</p>
            </div>
          </div>
        )}
        <p className="text-white/40 text-xs">Ga perlu bayar dulu — bayarnya nanti setelah selesai</p>
        <div className="flex flex-col gap-3 pt-2">
          {waNumber && (
            <a href={`https://wa.me/${waNumber}`} className="flex items-center justify-center gap-2 px-5 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors font-medium">
              <MessageCircle className="w-4 h-4" /> Kembali ke WhatsApp
            </a>
          )}
        </div>
      </motion.div>
    </div>
  )

  // ─── Progress Bar ───────────────────────────────────────────────
  const progress = ((step + 1) / TOTAL_STEPS) * 100

  return (
    <div className="h-[calc(100dvh-120px)] bg-brand-black text-white flex flex-col overflow-hidden section-lines-light">
      {/* Header: progress + nav — normal flex item at top; no sticky needed since content scrolls inside its own region */}
      <div className="flex-shrink-0 bg-brand-black border-b border-white/10 shadow-[0_1px_0_0_rgba(0,0,0,0.6)] relative z-10">
        <div className="container mx-auto pt-4">
          <div className="h-1 rounded-full overflow-hidden">
            <motion.div className="h-full bg-orange-500 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: 'easeOut' }} />
          </div>
          <div className="flex items-center justify-between pt-3">
            <div className="w-10 flex justify-start">
              <button
                onClick={goBack}
                aria-hidden={step === 0}
                tabIndex={step === 0 ? -1 : 0}
                className={`p-2 rounded-full hover:bg-white/10 transition-colors ${step === 0 ? 'invisible pointer-events-none' : ''}`}
              >
                <ArrowLeft className="w-5 h-5 text-white/70" />
              </button>
            </div>
            <p className="text-[14px] text-white/40 font-medium tracking-wide uppercase leading-none text-center">
              {STEP_LABELS[step]}
            </p>
            <div className="w-10 flex justify-end">
              <span className="text-[14px] text-white/30 font-medium">{step + 1}/{TOTAL_STEPS}</span>
            </div>
          </div>
          {/* Save status — visual gap above and below the text are equal */}
          <div className="pt-3 pb-6 flex items-center justify-center">
            <p className={`text-[13px] leading-none min-h-[0.9rem] transition-opacity duration-200 ${
              saveStatus === 'saving' ? 'text-white/20 opacity-100'
              : saveStatus === 'saved' ? 'text-green-500/60 opacity-100'
              : 'opacity-0'
            }`}>
              {saveStatus === 'saved' ? 'Tersimpan' : 'Menyimpan...'}
            </p>
          </div>
        </div>
        {/* Continue the vertical guide lines through the header so nav sits BEHIND them */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 w-px bg-white/[0.12] z-10" style={{ left: 'calc((100% - var(--guide-container-max)) / 2)' }} />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 w-px bg-white/[0.12] z-10" style={{ right: 'calc((100% - var(--guide-container-max)) / 2)' }} />
      </div>

      {/* Step Content — scrolls WITHIN this area only, can never reach above the nav */}
      <div className="flex-1 flex flex-col relative z-0 isolate overflow-y-auto overscroll-contain">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex-1 flex flex-col items-center"
          >
            <div className="container mx-auto flex-1 flex flex-col items-center justify-start py-10">
              {step === 0 && <StepCategory form={form} update={update} goNext={advanceOrReturn} />}
              {step === 1 && <StepService form={form} update={update} goNext={advanceOrReturn} />}
              {step === 2 && <StepInfo form={form} update={update} goNext={goNext} errors={errors} editingFromReview={editingFromReview} returnToReview={returnToReview} />}
              {step === 3 && <StepCar form={form} update={update} goNext={goNext} errors={errors} editingFromReview={editingFromReview} returnToReview={returnToReview} />}
              {step === 4 && <StepAddress form={form} update={update} goNext={goNext} errors={errors} editingFromReview={editingFromReview} returnToReview={returnToReview} />}
              {step === 5 && <StepSchedule form={form} update={update} goNext={goNext} errors={errors} editingFromReview={editingFromReview} returnToReview={returnToReview} />}
              {step === 6 && <StepReview form={form} goTo={editFromReview} onSubmit={handleSubmit} submitting={submitting} errors={errors} totalPrice={totalPrice} selectedService={selectedService} isDetailing={isDetailing} />}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer — full-width outline, guide lines continue through */}
      <div className="flex-shrink-0 relative border-t border-white/10 bg-brand-black">
        <div className="py-4 text-center">
          <p className="text-[11px] text-white/20">Castudio — Premium Car Wash & Detailing</p>
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-y-0 w-px bg-white/[0.12] z-10" style={{ left: 'calc((100% - var(--guide-container-max)) / 2)' }} />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 w-px bg-white/[0.12] z-10" style={{ right: 'calc((100% - var(--guide-container-max)) / 2)' }} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// STEP 0 — Category Pick
// ═══════════════════════════════════════════════════════════════════

function StepCategory({ form, update, goNext }: { form: FormState; update: (p: Partial<FormState>) => void; goNext: () => void }) {
  function pick(cat: 'wash' | 'detailing') {
    update({ category: cat })
    setTimeout(goNext, 200)
  }

  return (
    <div className="w-full max-w-lg space-y-8">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Mau cuci atau detailing?</h1>
        <p className="text-white/40 mt-2 text-sm">Pilih kategori layanan</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {[
          { key: 'wash' as const, title: 'Cuci Mobil', subtitle: 'Cuci premium ke rumah kamu', image: '/images/wash/professional-wash.jpg', icon: Droplets },
          { key: 'detailing' as const, title: 'Detailing', subtitle: 'Poles & proteksi level showroom', image: '/images/detailing/full-detail.jpg', icon: Sparkles },
        ].map((cat, i) => (
          <motion.button
            key={cat.key}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            onClick={() => pick(cat.key)}
            className={`relative group overflow-hidden rounded-2xl border-2 transition-all duration-200 aspect-[4/5] sm:aspect-[3/4] ${
              form.category === cat.key
                ? 'border-orange-500 ring-2 ring-orange-500/30'
                : 'border-white/10 hover:border-white/30'
            }`}
          >
            <Image src={cat.image} alt={cat.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 50vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <cat.icon className="w-8 h-8 text-orange-400 mb-3" />
              <h3 className="text-2xl font-bold text-white">{cat.title}</h3>
              <p className="text-white/60 text-sm mt-1">{cat.subtitle}</p>
            </div>
            {form.category === cat.key && (
              <div className="absolute top-3 right-3 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// STEP 1 — Service Selection
// ═══════════════════════════════════════════════════════════════════

function StepService({ form, update, goNext }: { form: FormState; update: (p: Partial<FormState>) => void; goNext: () => void }) {
  const services = form.category === 'detailing' ? DETAIL_SERVICES : WASH_SERVICES
  const [showWashOption, setShowWashOption] = useState(false)
  const [pendingService, setPendingService] = useState<string | null>(null)

  function pick(value: string) {
    update({ service_type: value })
    const isDetail = DETAILING_VALUES.includes(value)
    if (isDetail) {
      setPendingService(value)
      setShowWashOption(true)
    } else {
      setTimeout(goNext, 300)
    }
  }

  function confirmDetailChoice() {
    setShowWashOption(false)
    setTimeout(goNext, 200)
  }

  return (
    <div className="w-full max-w-6xl space-y-6">
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">Pilih paket</h2>
        <p className="text-white/40 text-sm mt-1">
          {form.category === 'wash' ? 'Cuci mobil premium ke rumah kamu' : 'Detailing profesional ke lokasi kamu'}
        </p>
      </motion.div>

      {/* Wash prereq overlay for detailing */}
      <AnimatePresence>
        {showWashOption && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="bg-[#171717] rounded-2xl p-6 w-full max-w-md border border-white/10 space-y-4">
              <h3 className="text-lg font-bold text-white">Perlu cuci dulu?</h3>
              <p className="text-white/50 text-sm">Sebelum detailing, mobilnya perlu dicuci dulu. Mau kita cuciin sekalian?</p>
              <button
                onClick={() => { update({ add_wash: true }); confirmDetailChoice() }}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  form.add_wash ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white text-sm">Standard Wash</p>
                    <p className="text-white/40 text-xs mt-0.5">Harga spesial untuk customer detailing</p>
                  </div>
                  <span className="text-orange-400 font-bold text-sm">{formatRupiah(WASH_PREREQ_PRICE)}</span>
                </div>
              </button>
              <button
                onClick={() => { update({ add_wash: false }); confirmDetailChoice() }}
                className="w-full p-3 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all text-sm"
              >
                Ga perlu, saya cuci sendiri
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Service cards — TL name/desc/price, TR image, Bottom merged features list */}
      <div>
        <div className="w-full flex flex-wrap justify-center gap-4 items-stretch">
          {services.map((svc, i) => {
            const selected = form.service_type === svc.value
            const allFeatures = [
              ...svc.includes.map(f => ({ text: f, included: true })),
              ...svc.excludes.map(f => ({ text: f, included: false })),
            ]
            return (
              <motion.button
                key={svc.value}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                onClick={() => pick(svc.value)}
                className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-200 w-full sm:w-[calc(50%-0.5rem)] aspect-square bg-[#111] ${
                  selected ? 'border-orange-500 ring-2 ring-orange-500/30' : 'border-white/10 hover:border-white/25'
                }`}
                aria-label={svc.label}
              >
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-[65%_35%] text-left">
                  {/* ── Top Left: name + description + price + duration ── */}
                  <div className="p-5 sm:p-6 flex flex-col justify-between border-r border-b border-white/10 overflow-hidden">
                    <div className="space-y-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">{svc.label}</h3>
                      <p className="text-sm text-white/60 leading-snug">{svc.description}</p>
                    </div>
                    <div className="pt-3">
                      <p className="text-2xl sm:text-3xl font-bold text-orange-400 leading-none">{formatRupiah(svc.price)}</p>
                      <p className="text-xs sm:text-sm text-white/40 mt-1.5">{svc.duration}</p>
                    </div>
                  </div>

                  {/* ── Top Right: image ── */}
                  <div className="relative overflow-hidden border-b border-white/10 bg-[#0a0a0a]">
                    <Image src={svc.image} alt={svc.label} fill className="object-cover" sizes="(max-width: 640px) 50vw, 320px" />
                    {'badge' in svc && svc.badge && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 bg-orange-500 text-white text-[11px] font-bold uppercase tracking-wider rounded-full shadow-lg">
                          {svc.badge}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ── Bottom: ONE merged feature list spanning full width ── */}
                  <div className="col-span-2 p-5 sm:p-6 overflow-hidden flex items-center justify-center">
                    {allFeatures.length === 0 ? (
                      <span className="text-sm text-white/30 italic text-center">Semua sudah termasuk 🎉</span>
                    ) : (
                      <div className="columns-2 gap-x-5 w-full">
                        {allFeatures.map((item, idx) => (
                          <div
                            key={idx}
                            className={`flex items-start gap-2 text-sm leading-snug mb-1.5 last:mb-0 break-inside-avoid ${
                              item.included ? 'text-white/85' : 'text-white/35'
                            }`}
                          >
                            {item.included ? (
                              <Check className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" strokeWidth={3} />
                            ) : (
                              <X className="w-4 h-4 text-white/30 flex-shrink-0 mt-0.5" strokeWidth={3} />
                            )}
                            <span className="truncate">{item.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {selected && (
                  <div className="absolute top-3 right-3 w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center shadow-lg z-10">
                    <Check className="w-5 h-5 text-white" strokeWidth={3} />
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// STEP 2 — Your Info (Name + Phone)
// ═══════════════════════════════════════════════════════════════════

function StepInfo({ form, update, goNext, errors, editingFromReview, returnToReview }: { form: FormState; update: (p: Partial<FormState>) => void; goNext: () => void; errors: Record<string, string>; editingFromReview?: boolean; returnToReview?: () => void }) {
  const nameRef = useRef<HTMLInputElement>(null)
  useEffect(() => { nameRef.current?.focus() }, [])

  const canAdvance = form.name.trim().length >= 2

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && canAdvance) goNext()
  }

  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">Siapa namanya?</h2>
          <p className="text-white/40 text-sm mt-1">Biar kita bisa sapa kamu</p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs text-white/50 font-medium uppercase tracking-wide">Nama</label>
            <input
              ref={nameRef}
              value={form.name}
              onChange={e => update({ name: e.target.value })}
              onKeyDown={handleKey}
              placeholder="Nama lengkap kamu"
              className="w-full bg-transparent border-b-2 border-white/20 focus:border-orange-500 outline-none text-xl sm:text-2xl text-white py-3 placeholder:text-white/20 transition-colors"
            />
            {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs text-white/50 font-medium uppercase tracking-wide flex items-center gap-1.5">
              No. HP <Lock className="w-3 h-3 text-white/30" />
            </label>
            <input
              value={form.phone}
              readOnly
              className="w-full bg-transparent border-b-2 border-white/10 text-lg text-white/40 py-3 cursor-not-allowed"
            />
            <p className="text-[11px] text-white/20">Otomatis dari WhatsApp</p>
          </div>
        </div>

        <div className="space-y-3">
          {editingFromReview && returnToReview && (
            <Button onClick={returnToReview} disabled={!canAdvance} variant="outline" className="w-full h-12 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white text-sm font-medium disabled:opacity-30">
              Kembali ke konfirmasi
            </Button>
          )}
          <Button onClick={goNext} disabled={!canAdvance} className="w-full h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-base font-semibold disabled:opacity-30 disabled:bg-white/10">
            Lanjut <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// STEP 3 — Car Info
// ═══════════════════════════════════════════════════════════════════

function StepCar({ form, update, goNext, errors, editingFromReview, returnToReview }: { form: FormState; update: (p: Partial<FormState>) => void; goNext: () => void; errors: Record<string, string>; editingFromReview?: boolean; returnToReview?: () => void }) {
  const carRef = useRef<HTMLInputElement>(null)
  useEffect(() => { carRef.current?.focus() }, [])

  const canAdvance = form.car_model.trim().length >= 2 && form.plate_number.trim().length >= 3

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && canAdvance) goNext()
  }

  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Car className="w-10 h-10 text-orange-400 mx-auto mb-3" />
          <h2 className="text-2xl sm:text-3xl font-bold">Mobilnya apa?</h2>
          <p className="text-white/40 text-sm mt-1">Model dan plat nomor</p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs text-white/50 font-medium uppercase tracking-wide">Model Mobil</label>
            <input
              ref={carRef}
              value={form.car_model}
              onChange={e => update({ car_model: e.target.value })}
              onKeyDown={handleKey}
              placeholder="Toyota Avanza, Honda CRV..."
              className="w-full bg-transparent border-b-2 border-white/20 focus:border-orange-500 outline-none text-xl sm:text-2xl text-white py-3 placeholder:text-white/20 transition-colors"
            />
            {errors.car_model && <p className="text-red-400 text-xs">{errors.car_model}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs text-white/50 font-medium uppercase tracking-wide">Plat Nomor</label>
            <input
              value={form.plate_number}
              onChange={e => update({ plate_number: e.target.value.toUpperCase() })}
              onKeyDown={handleKey}
              placeholder="B 1234 XYZ"
              className="w-full bg-transparent border-b-2 border-white/20 focus:border-orange-500 outline-none text-xl sm:text-2xl text-white py-3 placeholder:text-white/20 transition-colors font-mono tracking-wider"
            />
            {errors.plate_number && <p className="text-red-400 text-xs">{errors.plate_number}</p>}
          </div>
        </div>

        <div className="space-y-3">
          {editingFromReview && returnToReview && (
            <Button onClick={returnToReview} disabled={!canAdvance} variant="outline" className="w-full h-12 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white text-sm font-medium disabled:opacity-30">
              Kembali ke konfirmasi
            </Button>
          )}
          <Button onClick={goNext} disabled={!canAdvance} className="w-full h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-base font-semibold disabled:opacity-30 disabled:bg-white/10">
            Lanjut <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// STEP 4 — Address
// ═══════════════════════════════════════════════════════════════════

function StepAddress({ form, update, goNext, errors, editingFromReview, returnToReview }: { form: FormState; update: (p: Partial<FormState>) => void; goNext: () => void; errors: Record<string, string>; editingFromReview?: boolean; returnToReview?: () => void }) {
  const addrRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => { addrRef.current?.focus() }, [])

  const canAdvance = form.address.trim().length >= 5

  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md space-y-8">
        <div className="text-center">
          <MapPin className="w-10 h-10 text-orange-400 mx-auto mb-3" />
          <h2 className="text-2xl sm:text-3xl font-bold">Dimana lokasinya?</h2>
          <p className="text-white/40 text-sm mt-1">Kita datang ke kamu — pastikan ada akses air & listrik</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-white/50 font-medium uppercase tracking-wide">Alamat Lengkap</label>
          <textarea
            ref={addrRef}
            value={form.address}
            onChange={e => update({ address: e.target.value })}
            placeholder="Jl. Sudirman No. 1, Jakarta Selatan"
            rows={3}
            className="w-full bg-transparent border-2 border-white/20 focus:border-orange-500 outline-none text-lg text-white p-4 rounded-xl placeholder:text-white/20 transition-colors resize-none"
          />
          {errors.address && <p className="text-red-400 text-xs">{errors.address}</p>}
        </div>

        <div className="space-y-3">
          {editingFromReview && returnToReview && (
            <Button onClick={returnToReview} disabled={!canAdvance} variant="outline" className="w-full h-12 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white text-sm font-medium disabled:opacity-30">
              Kembali ke konfirmasi
            </Button>
          )}
          <Button onClick={goNext} disabled={!canAdvance} className="w-full h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-base font-semibold disabled:opacity-30 disabled:bg-white/10">
            Lanjut <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// STEP 5 — Schedule (Date + Time) — Cal.com-inspired
// ═══════════════════════════════════════════════════════════════════

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

function getCalendarDays(year: number, month: number): { date: Date; isCurrentMonth: boolean }[] {
  const firstDay = new Date(year, month, 1)
  // Monday-based: 0=Mon ... 6=Sun
  const startDow = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const days: { date: Date; isCurrentMonth: boolean }[] = []

  // Previous month fill
  for (let i = startDow - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month - 1, daysInPrevMonth - i), isCurrentMonth: false })
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ date: new Date(year, month, d), isCurrentMonth: true })
  }
  // Next month fill (always show 6 rows = 42 cells)
  while (days.length < 42) {
    const nd = days.length - startDow - daysInMonth + 1
    days.push({ date: new Date(year, month + 1, nd), isCurrentMonth: false })
  }
  return days
}

function isSameDay(a: Date | undefined, b: Date): boolean {
  if (!a) return false
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function isToday(d: Date): boolean {
  return isSameDay(new Date(), d)
}

function StepSchedule({ form, update, goNext, errors, editingFromReview, returnToReview }: { form: FormState; update: (p: Partial<FormState>) => void; goNext: () => void; errors: Record<string, string>; editingFromReview?: boolean; returnToReview?: () => void }) {
  const now = new Date()
  const [viewMonth, setViewMonth] = useState(form.date ? form.date.getMonth() : now.getMonth())
  const [viewYear, setViewYear] = useState(form.date ? form.date.getFullYear() : now.getFullYear())

  const calendarDays = useMemo(() => getCalendarDays(viewYear, viewMonth), [viewYear, viewMonth])

  const todayStart = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d }, [])

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  function isDisabled(d: Date): boolean {
    return d.getDay() === 0 || d < todayStart
  }

  function selectDate(d: Date) {
    if (isDisabled(d)) return
    update({ date: d, time: '' })
  }

  function pickTime(t: string) {
    update({ time: t })
    // When editing, auto-jump back to review; otherwise advance normally
    setTimeout(() => { if (editingFromReview && returnToReview) returnToReview(); else goNext() }, 300)
  }

  // Can go prev only if not before current month
  const canGoPrev = viewYear > now.getFullYear() || (viewYear === now.getFullYear() && viewMonth > now.getMonth())

  return (
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-2xl space-y-4">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">Kapan jadwalnya?</h2>
          <p className="text-white/40 text-sm mt-1">Senin — Sabtu, 08:00 — 16:00</p>
        </div>

        {/* Cal.com-style: side-by-side on desktop, stacked on mobile */}
        <div className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            {/* ── Calendar Grid ── */}
            <div className="flex-1 p-4 sm:p-5">
              {/* Month nav */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={prevMonth}
                  disabled={!canGoPrev}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 text-white/70" />
                </button>
                <h3 className="text-sm font-semibold text-white">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </h3>
                <button
                  onClick={nextMonth}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-white/70" />
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS.map(d => (
                  <div key={d} className="h-8 flex items-center justify-center">
                    <span className={`text-[11px] font-medium ${d === 'Min' ? 'text-white/20' : 'text-white/40'}`}>{d}</span>
                  </div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-y-0.5">
                {calendarDays.map(({ date: d, isCurrentMonth }, i) => {
                  const disabled = !isCurrentMonth || isDisabled(d)
                  const selected = isSameDay(form.date, d)
                  const today = isToday(d)

                  return (
                    <div key={i} className="flex items-center justify-center">
                      <button
                        onClick={() => !disabled && selectDate(d)}
                        disabled={disabled}
                        className={`
                          relative w-10 h-10 sm:w-11 sm:h-11 rounded-full text-sm font-medium transition-all duration-150 flex items-center justify-center
                          ${selected
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                            : disabled
                              ? 'text-white/15 cursor-not-allowed'
                              : 'text-white/80 hover:bg-white/10 cursor-pointer'
                          }
                        `}
                      >
                        {d.getDate()}
                        {today && !selected && (
                          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500" />
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
              {errors.date && <p className="text-red-400 text-xs text-center mt-2">{errors.date}</p>}
            </div>

            {/* ── Time Slots Panel ── */}
            <AnimatePresence>
              {form.date && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="hidden sm:block border-l border-white/10 overflow-hidden"
                >
                  <div className="w-48 p-4 h-full flex flex-col">
                    <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-1">
                      {form.date.toLocaleDateString('id-ID', { weekday: 'long' })}
                    </p>
                    <p className="text-sm font-bold text-white mb-4">
                      {form.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                    </p>
                    <div className="flex-1 overflow-y-auto space-y-1.5 -mr-2 pr-2">
                      {TIME_SLOTS.map(t => (
                        <button
                          key={t}
                          onClick={() => pickTime(t)}
                          className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
                            form.time === t
                              ? 'bg-orange-500 text-white'
                              : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    {errors.time && <p className="text-red-400 text-xs mt-2">{errors.time}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile time slots (stacked below calendar) */}
          <AnimatePresence>
            {form.date && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="sm:hidden border-t border-white/10 overflow-hidden"
              >
                <div className="p-4 space-y-3">
                  <p className="text-sm font-bold text-white">
                    {form.date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map(t => (
                      <button
                        key={t}
                        onClick={() => pickTime(t)}
                        className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                          form.time === t
                            ? 'bg-orange-500 text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  {errors.time && <p className="text-red-400 text-xs">{errors.time}</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {form.date && form.time && (
          <div className="space-y-3">
            {editingFromReview && returnToReview && (
              <Button onClick={returnToReview} variant="outline" className="w-full h-12 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white text-sm font-medium">
                Kembali ke konfirmasi
              </Button>
            )}
            <Button onClick={goNext} className="w-full h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-base font-semibold">
              Lanjut <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        )}
      </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// STEP 6 — Review & Confirm
// ═══════════════════════════════════════════════════════════════════

function StepReview({ form, goTo, onSubmit, submitting, errors, totalPrice, selectedService, isDetailing }: {
  form: FormState; goTo: (s: number) => void; onSubmit: () => void; submitting: boolean
  errors: Record<string, string>; totalPrice: number
  selectedService: (typeof ALL_SERVICES)[number] | undefined; isDetailing: boolean
}) {
  return (
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md space-y-4">
        <div className="text-center mb-2">
          <h2 className="text-2xl sm:text-3xl font-bold">Cek dulu ya</h2>
          <p className="text-white/40 text-sm mt-1">Pastikan semuanya bener sebelum booking</p>
        </div>

        {errors._form && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">{errors._form}</div>
        )}

        {/* Service */}
        {selectedService && (
          <ReviewRow label="Layanan" onEdit={() => goTo(1)}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0">
                <Image src={selectedService.image} alt={selectedService.label} fill className="object-cover" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{selectedService.label}</p>
                <p className="text-orange-400 font-bold text-sm">{formatRupiah(selectedService.price)}</p>
              </div>
            </div>
            {isDetailing && form.add_wash && (
              <p className="text-white/40 text-xs mt-2">+ Standard Wash (prereq) {formatRupiah(WASH_PREREQ_PRICE)}</p>
            )}
          </ReviewRow>
        )}

        {/* Contact */}
        <ReviewRow label="Kontak" onEdit={() => goTo(2)}>
          <p className="text-white text-sm font-medium">{form.name}</p>
          <p className="text-white/40 text-xs">{form.phone}</p>
        </ReviewRow>

        {/* Car */}
        <ReviewRow label="Mobil" onEdit={() => goTo(3)}>
          <p className="text-white text-sm font-medium">{form.car_model}</p>
          <p className="text-white/40 text-xs font-mono">{form.plate_number.toUpperCase()}</p>
        </ReviewRow>

        {/* Address */}
        <ReviewRow label="Alamat" onEdit={() => goTo(4)}>
          <p className="text-white text-sm">{form.address}</p>
        </ReviewRow>

        {/* Schedule */}
        <ReviewRow label="Jadwal" onEdit={() => goTo(5)}>
          <p className="text-white text-sm font-medium">
            {form.date?.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p className="text-orange-400 font-bold text-sm">Pukul {form.time}</p>
        </ReviewRow>

        {/* Total */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-white/70 font-medium">Total</span>
          <span className="text-orange-400 font-bold text-xl">{formatRupiah(totalPrice)}</span>
        </div>
        <p className="text-white/20 text-[11px] text-center">Bayar setelah selesai. Ga perlu deposit.</p>

        <Button onClick={onSubmit} disabled={submitting} className="w-full h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-base font-bold mt-2">
          {submitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Memproses...</> : 'Booking Sekarang'}
        </Button>
      </motion.div>
  )
}

function ReviewRow({ label, onEdit, children }: { label: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-white/30 font-semibold uppercase tracking-wider">{label}</span>
        <button onClick={onEdit} className="text-orange-400 hover:text-orange-300 transition-colors p-1 -mr-1">
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
      {children}
    </div>
  )
}
