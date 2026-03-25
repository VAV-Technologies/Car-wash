'use client'

import { useEffect, useState } from 'react'
import { Loader2, Camera, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { SERVICE_TYPES, formatDate } from '@/lib/admin/constants'

interface PhotoJob {
  id: string
  service_type: string
  completed_at: string | null
  photos_before: string[]
  photos_after: string[]
  customer_name: string | null
}

export default function PhotoGallery() {
  const [jobs, setJobs] = useState<PhotoJob[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [showFilter, setShowFilter] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        let query = supabase
          .from('jobs')
          .select('id, service_type, completed_at, bookings!left(customers(name)), job_photos(photo_url, photo_type)')
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: false })
          .limit(50)

        if (filter) {
          query = query.eq('service_type', filter)
        }

        const { data, error } = await query

        if (error) throw error

        const mapped: PhotoJob[] = (data ?? [])
          .map((row: any) => {
            const booking = Array.isArray(row.bookings) ? row.bookings[0] : row.bookings
            const customer = booking?.customers
            const customerName = Array.isArray(customer) ? customer[0]?.name : customer?.name
            const photos = (row.job_photos as any[]) || []
            return {
              id: row.id as string,
              service_type: row.service_type as string,
              completed_at: row.completed_at as string | null,
              photos_before: photos.filter((p: any) => p.photo_type?.startsWith('before')).map((p: any) => p.photo_url),
              photos_after: photos.filter((p: any) => !p.photo_type?.startsWith('before')).map((p: any) => p.photo_url),
              customer_name: customerName ?? null,
            }
          })
          .filter((j) => j.photos_before.length > 0 || j.photos_after.length > 0)

        setJobs(mapped)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [filter])

  const serviceLabel = (type: string) =>
    SERVICE_TYPES.find((s) => s.value === type)?.label ?? type.replace(/_/g, ' ')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading photo gallery...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-white/10 bg-[#171717] rounded-lg text-white/70 hover:text-white"
          >
            <Camera className="h-4 w-4" />
            {filter ? serviceLabel(filter) : 'All Service Types'}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {showFilter && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-10 py-1">
              <button
                onClick={() => {
                  setFilter('')
                  setShowFilter(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-white/5 ${
                  !filter ? 'text-orange-400' : 'text-white/70'
                }`}
              >
                All Service Types
              </button>
              {SERVICE_TYPES.map((st) => (
                <button
                  key={st.value}
                  onClick={() => {
                    setFilter(st.value)
                    setShowFilter(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-white/5 ${
                    filter === st.value ? 'text-orange-400' : 'text-white/70'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="text-sm text-white/40">{jobs.length} jobs with photos</span>
      </div>

      {/* Gallery Grid */}
      {jobs.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          No jobs with photos found{filter ? ' for this service type' : ''}.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="border border-white/10 bg-[#171717] rounded-lg overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-sm font-medium text-white">{serviceLabel(job.service_type)}</p>
                <p className="text-xs text-white/40 mt-0.5">
                  {job.customer_name ?? 'Unknown'} &middot; {formatDate(job.completed_at)}
                </p>
              </div>

              {/* Before/After */}
              <div className="grid grid-cols-2 gap-px bg-white/5">
                <div className="bg-[#171717]">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider px-3 pt-2">Before</p>
                  <div className="p-2 space-y-1">
                    {job.photos_before.length > 0 ? (
                      job.photos_before.slice(0, 2).map((url, i) => (
                        <div
                          key={i}
                          className="w-full aspect-video bg-white/5 rounded overflow-hidden"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`Before ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="w-full aspect-video bg-white/5 rounded flex items-center justify-center">
                        <span className="text-xs text-white/20">No photos</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-[#171717]">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider px-3 pt-2">After</p>
                  <div className="p-2 space-y-1">
                    {job.photos_after.length > 0 ? (
                      job.photos_after.slice(0, 2).map((url, i) => (
                        <div
                          key={i}
                          className="w-full aspect-video bg-white/5 rounded overflow-hidden"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`After ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="w-full aspect-video bg-white/5 rounded flex items-center justify-center">
                        <span className="text-xs text-white/20">No photos</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
