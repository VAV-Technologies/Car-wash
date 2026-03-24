import { supabase } from './supabase'

/** Fetch SOP checklist steps for a service type, ordered by step_number */
export async function getSOPChecklist(serviceType: string) {
  const { data, error } = await supabase
    .from('sop_checklists')
    .select('*')
    .eq('service_type', serviceType)
    .eq('is_active', true)
    .order('step_number', { ascending: true })

  if (error) throw error
  return data ?? []
}

/**
 * Compress an image file client-side using canvas.
 * Resizes to max 1200px width, 80% JPEG quality.
 */
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      const MAX_WIDTH = 1200
      let width = img.width
      let height = img.height

      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width)
        width = MAX_WIDTH
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas context unavailable'))

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Image compression failed'))
        },
        'image/jpeg',
        0.8
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * Compress + upload a photo to Supabase Storage, then insert a job_photos record.
 * Returns the public URL.
 */
export async function uploadJobPhoto(
  file: File,
  jobId: string,
  photoType: 'before_overall' | 'before_detail' | 'after_checkpoint' | 'after_overall' | 'issue',
  sopStepId: string | null,
  washerId: string,
  caption?: string
): Promise<string> {
  // 1. Compress
  const compressed = await compressImage(file)

  // 2. Build storage path
  const timestamp = Date.now()
  const stepSuffix = sopStepId ? `_${sopStepId.slice(0, 8)}` : ''
  const filePath = `jobs/${jobId}/${photoType}${stepSuffix}_${timestamp}.jpg`

  // 3. Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('castudio-photos')
    .upload(filePath, compressed, {
      contentType: 'image/jpeg',
      cacheControl: '31536000',
    })

  if (uploadError) throw uploadError

  // 4. Get public URL
  const { data: urlData } = supabase.storage
    .from('castudio-photos')
    .getPublicUrl(filePath)

  const photoUrl = urlData.publicUrl

  // 5. Insert job_photos record
  const { error: insertError } = await supabase.from('job_photos').insert({
    job_id: jobId,
    washer_id: washerId,
    photo_type: photoType,
    sop_step_id: sopStepId,
    photo_url: photoUrl,
    caption: caption || null,
  })

  if (insertError) throw insertError

  return photoUrl
}

/** Get all photos for a job */
export async function getJobPhotos(jobId: string) {
  const { data, error } = await supabase
    .from('job_photos')
    .select('*')
    .eq('job_id', jobId)
    .order('taken_at', { ascending: true })

  if (error) throw error
  return data ?? []
}
