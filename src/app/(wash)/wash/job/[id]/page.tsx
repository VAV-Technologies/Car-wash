'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getJobById, updateJobRecord, updateBookingStatus } from '@/lib/wash/jobs'
import { getSOPChecklist, uploadJobPhoto, getJobPhotos } from '@/lib/wash/sop'
import { SERVICE_TYPES, formatWhatsAppLink } from '@/lib/wash/constants'
import SOPChecklist, { type SOPStep } from '@/components/wash/SOPChecklist'
import {
  Phone, AlertTriangle, CheckCircle2, ArrowLeft, Clock,
  Loader2, Camera, X, MessageCircle
} from 'lucide-react'

export default function ActiveJobPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [job, setJob] = useState<any>(null)
  const [steps, setSteps] = useState<SOPStep[]>([])
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [skippedSteps, setSkippedSteps] = useState<Map<string, string>>(new Map())
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [uploadedPhotos, setUploadedPhotos] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [issueText, setIssueText] = useState('')
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch job + SOP
  const fetchData = useCallback(async () => {
    try {
      const jobData = await getJobById(jobId)
      if (!jobData) {
        setError('Job not found')
        setLoading(false)
        return
      }
      setJob(jobData)

      const serviceType = jobData.service_type || jobData.bookings?.service_type
      if (serviceType) {
        const sopSteps = await getSOPChecklist(serviceType)
        setSteps(sopSteps)
      }

      // Load existing photos to count per step
      const photos = jobData.job_photos || []
      const photoMap = new Map<string, number>()
      for (const photo of photos) {
        if (photo.sop_step_id) {
          photoMap.set(photo.sop_step_id, (photoMap.get(photo.sop_step_id) || 0) + 1)
        }
      }
      setUploadedPhotos(photoMap)

      // Restore completed steps from washer_notes (stored as JSON)
      if (jobData.washer_notes) {
        try {
          const notes = JSON.parse(jobData.washer_notes)
          if (notes.completedSteps) {
            setCompletedSteps(new Set(notes.completedSteps))
          }
          if (notes.skippedSteps) {
            setSkippedSteps(new Map(Object.entries(notes.skippedSteps)))
          }
          if (notes.currentStepIndex !== undefined) {
            setCurrentStepIndex(notes.currentStepIndex)
          }
        } catch {
          // washer_notes isn't JSON — that's fine
        }
      }

      // Start timer from job.started_at
      if (jobData.started_at) {
        const started = new Date(jobData.started_at).getTime()
        setElapsedSeconds(Math.floor((Date.now() - started) / 1000))
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load job')
    } finally {
      setLoading(false)
    }
  }, [jobId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1)
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Persist checklist progress to washer_notes
  const persistProgress = useCallback(
    async (
      completed: Set<string>,
      skipped: Map<string, string>,
      stepIdx: number
    ) => {
      try {
        const notes = JSON.stringify({
          completedSteps: Array.from(completed),
          skippedSteps: Object.fromEntries(skipped),
          currentStepIndex: stepIdx,
        })
        await updateJobRecord(jobId, { washer_notes: notes })
      } catch (err) {
        console.error('Failed to persist progress:', err)
      }
    },
    [jobId]
  )

  function handleCompleteStep(stepId: string) {
    const newCompleted = new Set(completedSteps)
    newCompleted.add(stepId)
    setCompletedSteps(newCompleted)

    // Advance to next non-completed, non-skipped step
    const nextIdx = findNextStep(newCompleted, skippedSteps, currentStepIndex)
    setCurrentStepIndex(nextIdx)

    persistProgress(newCompleted, skippedSteps, nextIdx)
  }

  function handleSkipStep(stepId: string, reason: string) {
    const newSkipped = new Map(skippedSteps)
    newSkipped.set(stepId, reason)
    setSkippedSteps(newSkipped)

    // Advance
    const nextIdx = findNextStep(completedSteps, newSkipped, currentStepIndex)
    setCurrentStepIndex(nextIdx)

    persistProgress(completedSteps, newSkipped, nextIdx)
  }

  function findNextStep(
    completed: Set<string>,
    skipped: Map<string, string>,
    fromIndex: number
  ): number {
    for (let i = fromIndex + 1; i < steps.length; i++) {
      if (!completed.has(steps[i].id) && !skipped.has(steps[i].id)) {
        return i
      }
    }
    // All done — return past end
    return steps.length
  }

  async function handlePhotoUpload(file: File, stepId: string): Promise<string> {
    if (!job) throw new Error('No active job')
    const url = await uploadJobPhoto(
      file,
      jobId,
      'after_checkpoint',
      stepId,
      job.washer_id
    )
    // Update photo count
    setUploadedPhotos((prev) => {
      const next = new Map(prev)
      next.set(stepId, (next.get(stepId) || 0) + 1)
      return next
    })
    return url
  }

  // Check if all required steps are done
  function allRequiredStepsDone(): boolean {
    for (const step of steps) {
      if (!completedSteps.has(step.id) && !skippedSteps.has(step.id)) {
        return false
      }
    }
    return true
  }

  async function handleCompleteJob() {
    if (!job) return
    setCompleting(true)
    try {
      const completedAt = new Date().toISOString()
      const startedAt = new Date(job.started_at).getTime()
      const durationMin = Math.round((Date.now() - startedAt) / 60000)

      // Update job
      await updateJobRecord(jobId, {
        completed_at: completedAt,
        actual_duration_min: durationMin,
      })

      // Update booking status
      if (job.booking_id || job.bookings?.id) {
        await updateBookingStatus(job.booking_id || job.bookings.id, 'completed')
      }

      // Navigate back to today
      router.push('/wash/today')
    } catch (err: any) {
      setError(err?.message || 'Failed to complete job')
    } finally {
      setCompleting(false)
      setShowCompleteConfirm(false)
    }
  }

  // Format timer
  function formatTimer(seconds: number) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <p className="text-red-400">{error || 'Job not found'}</p>
          <button onClick={() => router.push('/wash/today')} className="text-orange-400 underline text-sm">
            Back to Today
          </button>
        </div>
      </div>
    )
  }

  const booking = job.bookings
  const customer = booking?.customers
  const serviceType = job.service_type || booking?.service_type
  const serviceInfo = SERVICE_TYPES[serviceType] || { label: serviceType, bonus: 0, duration: 0 }

  // Format started time
  const startedTime = job.started_at
    ? new Date(job.started_at).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : ''

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-white/5">
        <div className="px-4 py-3 space-y-2">
          {/* Back + service type */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/wash/today')}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white/60" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white">
                {serviceInfo.label}
              </h1>
              {customer && (
                <p className="text-sm text-white/50">
                  {customer.name} &middot; {customer.car_model} &middot; {customer.plate_number}
                </p>
              )}
            </div>
          </div>

          {/* Timer bar */}
          <div className="flex items-center justify-between bg-[#171717] rounded-lg px-3 py-2">
            <span className="text-xs text-white/40">
              Started {startedTime}
            </span>
            <span className="text-sm font-mono text-orange-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {formatTimer(elapsedSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* SOP Checklist */}
      <div className="px-4 py-4">
        <SOPChecklist
          steps={steps}
          completedSteps={completedSteps}
          skippedSteps={skippedSteps}
          currentStepIndex={currentStepIndex}
          onCompleteStep={handleCompleteStep}
          onSkipStep={handleSkipStep}
          onPhotoUpload={handlePhotoUpload}
          uploadedPhotos={uploadedPhotos}
        />
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A]/95 backdrop-blur-sm border-t border-white/5 px-4 py-3">
        <div className="flex gap-2">
          {/* Call Customer */}
          {customer?.phone && (
            <a
              href={`tel:${customer.phone}`}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg py-3 px-4 text-sm font-medium transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call
            </a>
          )}

          {/* WhatsApp */}
          {customer?.phone && (
            <a
              href={formatWhatsAppLink(customer.phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-green-500/10 hover:bg-green-500/15 border border-green-500/20 text-green-400 rounded-lg py-3 px-4 text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WA
            </a>
          )}

          {/* Report Issue */}
          <button
            type="button"
            onClick={() => setShowIssueModal(true)}
            className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-400 rounded-lg py-3 px-4 text-sm font-medium transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            Issue
          </button>

          {/* Complete Job */}
          <button
            type="button"
            onClick={() => setShowCompleteConfirm(true)}
            disabled={!allRequiredStepsDone() || completing}
            className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 disabled:bg-green-500/30 disabled:text-green-400/50 text-white rounded-lg py-3 px-4 text-sm font-medium transition-colors"
          >
            {completing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Complete Job
          </button>
        </div>
      </div>

      {/* Complete confirmation modal */}
      {showCompleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6">
          <div className="bg-[#171717] border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Complete Job?</h3>
            <p className="text-sm text-white/60">
              Have you completed all steps and uploaded all required photos?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCompleteConfirm(false)}
                className="flex-1 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg py-3 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompleteJob}
                disabled={completing}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg py-3 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {completing ? 'Completing...' : 'Yes, Complete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue report modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6">
          <div className="bg-[#171717] border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Report Issue</h3>
              <button
                type="button"
                onClick={() => setShowIssueModal(false)}
                className="p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5 text-white/40" />
              </button>
            </div>
            <textarea
              value={issueText}
              onChange={(e) => setIssueText(e.target.value)}
              placeholder="Describe the issue (scratch found, stain won't come out, etc.)"
              rows={3}
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500/40 resize-none"
            />
            <button
              type="button"
              onClick={async () => {
                if (!issueText.trim()) return
                try {
                  // Append issue to washer_notes
                  const existingNotes = job.washer_notes || ''
                  let parsed: any = {}
                  try { parsed = JSON.parse(existingNotes) } catch {}
                  parsed.issues = parsed.issues || []
                  parsed.issues.push({
                    text: issueText.trim(),
                    timestamp: new Date().toISOString(),
                  })
                  await updateJobRecord(jobId, {
                    washer_notes: JSON.stringify(parsed),
                  })
                  setIssueText('')
                  setShowIssueModal(false)
                } catch (err) {
                  console.error('Failed to save issue:', err)
                }
              }}
              disabled={!issueText.trim()}
              className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg py-3 text-sm font-medium transition-colors disabled:opacity-40"
            >
              Submit Issue
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
