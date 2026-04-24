'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Car, Loader2 } from 'lucide-react'
import {
  WASH_SERVICES, DETAIL_SERVICES, ALL_SERVICES, DETAILING_VALUES,
  WASH_PREREQ_PRICE, TIME_SLOTS, formatRupiah, isClosedDay,
} from '@/lib/booking-form-constants'

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>}>
      <BookingForm />
    </Suspense>
  )
}

function BookingForm() {
  const searchParams = useSearchParams()

  const [form, setForm] = useState({
    name: '',
    phone: '',
    service_type: '',
    car_model: '',
    plate_number: '',
    address: '',
    date: undefined as Date | undefined,
    time: '',
    add_wash: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [bookingIds, setBookingIds] = useState<string[]>([])

  // Pre-fill from URL params
  useEffect(() => {
    const updates: Partial<typeof form> = {}
    const name = searchParams.get('name')
    const phone = searchParams.get('phone')
    const service = searchParams.get('service')
    const car = searchParams.get('car')
    const plate = searchParams.get('plate')
    const address = searchParams.get('address')
    const date = searchParams.get('date')
    const time = searchParams.get('time')
    const addwash = searchParams.get('addwash')

    if (name) updates.name = name
    if (phone) updates.phone = phone
    if (service && ALL_SERVICES.some(s => s.value === service)) updates.service_type = service
    if (car) updates.car_model = car
    if (plate) updates.plate_number = plate
    if (address) updates.address = address
    if (date) {
      const d = new Date(date + 'T00:00:00')
      if (!isNaN(d.getTime())) updates.date = d
    }
    if (time && TIME_SLOTS.includes(time)) updates.time = time
    if (addwash === '1') updates.add_wash = true

    if (Object.keys(updates).length > 0) {
      setForm(prev => ({ ...prev, ...updates }))
    }
  }, [searchParams])

  const isDetailing = DETAILING_VALUES.includes(form.service_type)
  const selectedService = ALL_SERVICES.find(s => s.value === form.service_type)

  const totalPrice = useMemo(() => {
    if (!selectedService) return 0
    let total = selectedService.price
    if (isDetailing && form.add_wash) total += WASH_PREREQ_PRICE
    return total
  }, [selectedService, isDetailing, form.add_wash])

  const canSubmit = form.name.trim().length >= 2
    && form.phone.trim().length >= 8
    && form.service_type
    && form.car_model.trim().length >= 2
    && form.plate_number.trim().length >= 3
    && form.address.trim().length >= 5
    && form.date
    && form.time
    && !submitting

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    setErrors({})

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          service_type: form.service_type,
          car_model: form.car_model.trim(),
          plate_number: form.plate_number.trim(),
          address: form.address.trim(),
          date: form.date!.toISOString().split('T')[0],
          time: form.time,
          add_wash: isDetailing && form.add_wash,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors)
        } else {
          setErrors({ _form: data.error || 'Terjadi kesalahan' })
        }
        return
      }

      setSuccess(true)
      setBookingIds(data.booking_ids || [])
    } catch {
      setErrors({ _form: 'Koneksi gagal, coba lagi' })
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-6 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Booking Berhasil!</h2>
            <p className="text-slate-600">
              {selectedService?.label} untuk {form.car_model} ({form.plate_number.toUpperCase()})
            </p>
            <p className="text-slate-600">
              {form.date?.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} pukul {form.time}
            </p>
            <p className="text-lg font-semibold text-green-700">{formatRupiah(totalPrice)}</p>
            <p className="text-sm text-slate-500 mt-4">Ga perlu bayar dulu ya, bayarnya nanti setelah selesai 🙂</p>
            <Button
              className="mt-4 w-full"
              onClick={() => { setSuccess(false); setForm({ name: form.name, phone: form.phone, service_type: '', car_model: '', plate_number: '', address: form.address, date: undefined, time: '', add_wash: false }) }}
            >
              <Car className="w-4 h-4 mr-2" /> Booking Mobil Lain
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Castudio Booking</h1>
          <p className="text-slate-500 text-sm">Premium Car Wash & Detailing — ke rumah kamu</p>
        </div>

        {errors._form && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{errors._form}</div>
        )}

        {/* Contact Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Info Kontak</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="name">Nama *</Label>
              <Input id="name" placeholder="Nama lengkap" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="phone">No. HP *</Label>
              <Input id="phone" placeholder="08123456789" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Service Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pilih Layanan *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-slate-500 font-medium">Cuci Mobil</p>
            <div className="grid gap-2">
              {WASH_SERVICES.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, service_type: s.value, add_wash: false }))}
                  className={`flex justify-between items-center p-3 rounded-lg border text-left transition-all ${form.service_type === s.value ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <span className="font-medium text-sm">{s.label}</span>
                  <span className="text-sm text-slate-600">{formatRupiah(s.price)}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 font-medium pt-2">Detailing</p>
            <div className="grid gap-2">
              {DETAIL_SERVICES.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, service_type: s.value }))}
                  className={`flex justify-between items-center p-3 rounded-lg border text-left transition-all ${form.service_type === s.value ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <span className="font-medium text-sm">{s.label}</span>
                  <span className="text-sm text-slate-600">{formatRupiah(s.price)}</span>
                </button>
              ))}
            </div>
            {errors.service_type && <p className="text-red-500 text-xs mt-1">{errors.service_type}</p>}

            {/* Detailing wash prereq */}
            {isDetailing && (
              <label className="flex items-start gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={form.add_wash}
                  onChange={e => setForm(f => ({ ...f, add_wash: e.target.checked }))}
                  className="mt-0.5 rounded"
                />
                <div>
                  <p className="text-sm font-medium">Tambah Standard Wash ({formatRupiah(WASH_PREREQ_PRICE)})</p>
                  <p className="text-xs text-slate-500">Mobil perlu dicuci sebelum detailing. Harga spesial untuk customer detailing.</p>
                </div>
              </label>
            )}
          </CardContent>
        </Card>

        {/* Car Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Info Mobil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="car_model">Model Mobil *</Label>
              <Input id="car_model" placeholder="Toyota Avanza" value={form.car_model} onChange={e => setForm(f => ({ ...f, car_model: e.target.value }))} />
              {errors.car_model && <p className="text-red-500 text-xs mt-1">{errors.car_model}</p>}
            </div>
            <div>
              <Label htmlFor="plate_number">Plat Nomor *</Label>
              <Input id="plate_number" placeholder="B 1234 XYZ" value={form.plate_number} onChange={e => setForm(f => ({ ...f, plate_number: e.target.value.toUpperCase() }))} />
              {errors.plate_number && <p className="text-red-500 text-xs mt-1">{errors.plate_number}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Alamat</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="address">Alamat Lengkap *</Label>
            <textarea
              id="address"
              placeholder="Jl. Sudirman No. 1, Jakarta Selatan"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              rows={3}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tanggal & Waktu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Pilih Tanggal * <span className="text-xs text-slate-400">(kecuali Senin & libur nasional)</span></Label>
              <div className="flex justify-center mt-2">
                <Calendar
                  mode="single"
                  selected={form.date}
                  onSelect={(d) => setForm(f => ({ ...f, date: d || undefined }))}
                  disabled={(date) => isClosedDay(date) || date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-md border"
                />
              </div>
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>
            <div>
              <Label>Pilih Jam *</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {TIME_SLOTS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, time: t }))}
                    className={`p-2 rounded-lg border text-sm font-medium transition-all ${form.time === t ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Price Summary + Submit */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            {selectedService && (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>{selectedService.label}</span>
                  <span>{formatRupiah(selectedService.price)}</span>
                </div>
                {isDetailing && form.add_wash && (
                  <div className="flex justify-between text-amber-700">
                    <span>+ Standard Wash (prereq)</span>
                    <span>{formatRupiah(WASH_PREREQ_PRICE)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-2 border-t">
                  <span>Total</span>
                  <span>{formatRupiah(totalPrice)}</span>
                </div>
                <p className="text-xs text-slate-400 pt-1">Bayar setelah selesai. Ga perlu deposit.</p>
              </div>
            )}
            <Button
              className="w-full h-12 text-base"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...</> : 'Booking Sekarang'}
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400 pb-4">
          Castudio — Premium Car Wash & Detailing
        </p>
      </div>
    </div>
  )
}
