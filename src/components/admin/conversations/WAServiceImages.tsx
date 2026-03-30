'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Trash2, Image, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const SERVICES = [
  { key: 'standard_wash', label: 'Standard Wash', price: 'Rp 349.000' },
  { key: 'professional', label: 'Professional Wash', price: 'Rp 649.000' },
  { key: 'elite_wash', label: 'Elite Wash', price: 'Rp 949.000' },
  { key: 'interior_detail', label: 'Interior Detail', price: 'Rp 1.039.000' },
  { key: 'exterior_detail', label: 'Exterior Detail', price: 'Rp 1.039.000' },
  { key: 'window_detail', label: 'Window Detail', price: 'Rp 689.000' },
  { key: 'tire_rims', label: 'Tire & Rims', price: 'Rp 289.000' },
  { key: 'full_detail', label: 'Full Detail', price: 'Rp 2.799.000' },
]

export default function WAServiceImages() {
  const [images, setImages] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [initialLoading, setInitialLoading] = useState(true)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // Load existing service images on mount
  useEffect(() => {
    async function loadImages() {
      const { data } = await supabase
        .from('agent_knowledge')
        .select('file_name, content')
        .eq('agent_name', 'shera')
        .like('file_name', 'service_image_%')

      if (data) {
        const map: Record<string, string> = {}
        for (const row of data) {
          const key = row.file_name.replace('service_image_', '')
          map[key] = row.content
        }
        setImages(map)
      }
      setInitialLoading(false)
    }
    loadImages()
  }, [])

  async function handleUpload(serviceKey: string, file: File) {
    setLoading((prev) => ({ ...prev, [serviceKey]: true }))
    try {
      const path = `services/${serviceKey}.jpg`

      // Upload to storage (upsert to overwrite existing)
      const { error: uploadError } = await supabase.storage
        .from('castudio-photos')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('castudio-photos')
        .getPublicUrl(path)

      const publicUrl = urlData.publicUrl

      // Upsert into agent_knowledge
      const { error: dbError } = await supabase
        .from('agent_knowledge')
        .upsert(
          {
            agent_name: 'shera',
            file_name: `service_image_${serviceKey}`,
            content: publicUrl,
          },
          { onConflict: 'agent_name,file_name' }
        )

      if (dbError) throw dbError

      setImages((prev) => ({ ...prev, [serviceKey]: publicUrl }))
    } catch (err) {
      console.error('Upload failed:', err)
      alert('Upload failed. Check console for details.')
    } finally {
      setLoading((prev) => ({ ...prev, [serviceKey]: false }))
    }
  }

  async function handleDelete(serviceKey: string) {
    setLoading((prev) => ({ ...prev, [serviceKey]: true }))
    try {
      const path = `services/${serviceKey}.jpg`

      // Remove from storage
      await supabase.storage.from('castudio-photos').remove([path])

      // Remove from DB
      await supabase
        .from('agent_knowledge')
        .delete()
        .eq('agent_name', 'shera')
        .eq('file_name', `service_image_${serviceKey}`)

      setImages((prev) => {
        const next = { ...prev }
        delete next[serviceKey]
        return next
      })
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Delete failed. Check console for details.')
    } finally {
      setLoading((prev) => ({ ...prev, [serviceKey]: false }))
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/50">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading service images...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Service Images</h2>
        <p className="text-sm text-white/50 mt-1">
          Upload images for each service. Shera will send these to customers when they ask about services or pricing.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SERVICES.map((service) => {
          const imageUrl = images[service.key]
          const isLoading = loading[service.key]

          return (
            <div
              key={service.key}
              className="rounded-xl border border-white/10 bg-[#171717] p-4 space-y-3"
            >
              {/* Service info */}
              <div>
                <p className="text-sm font-medium text-white">{service.label}</p>
                <p className="text-xs text-white/50">{service.price}</p>
              </div>

              {/* Image area */}
              {isLoading ? (
                <div className="flex items-center justify-center h-40 rounded-lg border border-dashed border-white/10">
                  <Loader2 className="h-6 w-6 animate-spin text-white/30" />
                </div>
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt={service.label}
                  className="w-full max-h-40 object-cover rounded-lg"
                />
              ) : (
                <button
                  onClick={() => fileInputRefs.current[service.key]?.click()}
                  className="flex flex-col items-center justify-center w-full h-40 rounded-lg border-2 border-dashed border-white/10 hover:border-white/30 transition-colors cursor-pointer"
                >
                  <Image className="h-8 w-8 text-white/20 mb-2" />
                  <span className="text-xs text-white/30">Click to upload</span>
                </button>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRefs.current[service.key]?.click()}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {imageUrl ? 'Replace' : 'Upload'}
                </button>

                {imageUrl && (
                  <button
                    onClick={() => handleDelete(service.key)}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={(el) => { fileInputRefs.current[service.key] = el }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleUpload(service.key, file)
                  e.target.value = ''
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
