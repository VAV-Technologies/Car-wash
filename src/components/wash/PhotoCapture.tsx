'use client'

import { useRef, useState } from 'react'
import { Camera, Image as ImageIcon, Upload, X, Loader2 } from 'lucide-react'

interface PhotoCaptureProps {
  onUpload: (file: File) => Promise<string>
  description?: string
  disabled?: boolean
}

export default function PhotoCapture({ onUpload, description, disabled }: PhotoCaptureProps) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setSelectedFile(file)
    setUploaded(false)

    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  async function handleConfirmUpload() {
    if (!selectedFile) return
    setUploading(true)
    setError(null)

    try {
      await onUpload(selectedFile)
      setUploaded(true)
    } catch (err: any) {
      setError(err?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function handleClear() {
    setPreview(null)
    setSelectedFile(null)
    setUploaded(false)
    setError(null)
    if (cameraRef.current) cameraRef.current.value = ''
    if (galleryRef.current) galleryRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      {description && (
        <p className="text-sm text-white/60">
          <Camera className="inline w-4 h-4 mr-1" />
          {description}
        </p>
      )}

      {/* Hidden file inputs */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
      />

      {!preview ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            disabled={disabled}
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg py-3 px-4 text-sm font-medium transition-colors disabled:opacity-40"
          >
            <Camera className="w-4 h-4" />
            Take Photo
          </button>
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            disabled={disabled}
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg py-3 px-4 text-sm font-medium transition-colors disabled:opacity-40"
          >
            <ImageIcon className="w-4 h-4" />
            Gallery
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Preview */}
          <div className="relative rounded-lg overflow-hidden">
            <img src={preview} alt="Preview" className="w-full max-h-48 object-cover" />
            {!uploaded && !uploading && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-2 right-2 bg-black/60 rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {uploaded && (
              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                <span className="bg-green-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                  Uploaded
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          {!uploaded && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClear}
                disabled={uploading}
                className="flex-1 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg py-2 px-3 text-sm transition-colors disabled:opacity-40"
              >
                Retake
              </button>
              <button
                type="button"
                onClick={handleConfirmUpload}
                disabled={uploading}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 rounded-lg py-2 px-3 text-sm font-medium transition-colors disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Confirm Upload
                  </>
                )}
              </button>
            </div>
          )}

          {uploaded && (
            <button
              type="button"
              onClick={handleClear}
              className="w-full bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg py-2 px-3 text-sm transition-colors"
            >
              Take Another Photo
            </button>
          )}
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  )
}
