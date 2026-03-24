'use client'

import { useState } from 'react'
import { Check, Circle, SkipForward, ChevronDown, ChevronUp, Clock, Beaker, Wrench, Camera } from 'lucide-react'
import PhotoCapture from './PhotoCapture'

export interface SOPStep {
  id: string
  step_number: number
  step_title: string
  step_description: string
  equipment_needed: string[] | null
  chemicals_needed: string[] | null
  estimated_minutes: number | null
  photo_required: boolean
  photo_description: string | null
}

type StepStatus = 'completed' | 'current' | 'upcoming' | 'skipped'

interface SOPChecklistProps {
  steps: SOPStep[]
  completedSteps: Set<string>
  skippedSteps: Map<string, string> // stepId -> reason
  currentStepIndex: number
  onCompleteStep: (stepId: string) => void
  onSkipStep: (stepId: string, reason: string) => void
  /** Called when photo upload is needed for a step; returns the URL */
  onPhotoUpload?: (file: File, stepId: string) => Promise<string>
  /** Photos already uploaded per step */
  uploadedPhotos?: Map<string, number>
}

export default function SOPChecklist({
  steps,
  completedSteps,
  skippedSteps,
  currentStepIndex,
  onCompleteStep,
  onSkipStep,
  onPhotoUpload,
  uploadedPhotos,
}: SOPChecklistProps) {
  const [skipReason, setSkipReason] = useState('')
  const [showSkipInput, setShowSkipInput] = useState<string | null>(null)
  const [photoUploaded, setPhotoUploaded] = useState<Set<string>>(new Set())

  function getStepStatus(step: SOPStep, index: number): StepStatus {
    if (completedSteps.has(step.id)) return 'completed'
    if (skippedSteps.has(step.id)) return 'skipped'
    if (index === currentStepIndex) return 'current'
    return 'upcoming'
  }

  function handleSkipSubmit(stepId: string) {
    if (!skipReason.trim()) return
    onSkipStep(stepId, skipReason.trim())
    setSkipReason('')
    setShowSkipInput(null)
  }

  async function handlePhotoUpload(file: File, stepId: string): Promise<string> {
    if (!onPhotoUpload) throw new Error('Photo upload not configured')
    const url = await onPhotoUpload(file, stepId)
    setPhotoUploaded((prev) => new Set(prev).add(stepId))
    return url
  }

  function canCompleteStep(step: SOPStep): boolean {
    if (!step.photo_required) return true
    // Must have uploaded at least one photo
    const uploaded = uploadedPhotos?.get(step.id) || 0
    return uploaded > 0 || photoUploaded.has(step.id)
  }

  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const status = getStepStatus(step, index)
        const photoCount = uploadedPhotos?.get(step.id) || 0

        return (
          <div
            key={step.id}
            className={`rounded-xl border transition-all ${
              status === 'completed'
                ? 'bg-green-500/10 border-green-500/30'
                : status === 'current'
                ? 'bg-[#171717] border-orange-500/50'
                : status === 'skipped'
                ? 'bg-yellow-500/5 border-yellow-500/20'
                : 'bg-[#171717]/50 border-white/5'
            }`}
          >
            {/* Step header */}
            <div className="flex items-start gap-3 p-4">
              {/* Status icon */}
              <div className="mt-0.5 flex-shrink-0">
                {status === 'completed' && (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                {status === 'current' && (
                  <div className="w-6 h-6 rounded-full border-2 border-orange-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                  </div>
                )}
                {status === 'upcoming' && (
                  <Circle className="w-6 h-6 text-white/20" />
                )}
                {status === 'skipped' && (
                  <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <SkipForward className="w-3.5 h-3.5 text-yellow-500" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    status === 'completed' ? 'text-green-400' :
                    status === 'current' ? 'text-white' :
                    status === 'skipped' ? 'text-yellow-400' :
                    'text-white/40'
                  }`}>
                    {step.step_number}. {step.step_title}
                  </span>
                  {step.estimated_minutes && (
                    <span className="text-xs text-white/30 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {step.estimated_minutes}m
                    </span>
                  )}
                  {step.photo_required && (
                    <Camera className={`w-3.5 h-3.5 ${
                      status === 'completed' ? 'text-green-400' : 'text-orange-400'
                    }`} />
                  )}
                </div>

                {/* Completed: show photo count if any */}
                {status === 'completed' && photoCount > 0 && (
                  <p className="text-xs text-green-400/60 mt-1">
                    <Camera className="inline w-3 h-3 mr-1" />
                    {photoCount} photo{photoCount > 1 ? 's' : ''} uploaded
                  </p>
                )}

                {/* Skipped: show reason */}
                {status === 'skipped' && (
                  <p className="text-xs text-yellow-400/60 mt-1">
                    Skipped: {skippedSteps.get(step.id)}
                  </p>
                )}

                {/* Current step: expanded */}
                {status === 'current' && (
                  <div className="mt-3 space-y-3">
                    <p className="text-sm text-white/70 leading-relaxed">
                      {step.step_description}
                    </p>

                    {/* Equipment */}
                    {step.equipment_needed && step.equipment_needed.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-white/40 flex items-center gap-1">
                          <Wrench className="w-3 h-3" /> Equipment
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {step.equipment_needed.map((eq) => (
                            <span key={eq} className="text-xs bg-white/5 border border-white/10 rounded px-2 py-0.5 text-white/60">
                              {eq}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Chemicals */}
                    {step.chemicals_needed && step.chemicals_needed.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-white/40 flex items-center gap-1">
                          <Beaker className="w-3 h-3" /> Chemicals
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {step.chemicals_needed.map((ch) => (
                            <span key={ch} className="text-xs bg-blue-500/10 border border-blue-500/20 rounded px-2 py-0.5 text-blue-300/70">
                              {ch}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Photo capture (if required) */}
                    {step.photo_required && (
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                        <PhotoCapture
                          description={step.photo_description || 'Photo required to complete this step'}
                          onUpload={(file) => handlePhotoUpload(file, step.id)}
                        />
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onCompleteStep(step.id)}
                        disabled={!canCompleteStep(step)}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-lg py-3 text-sm transition-colors"
                      >
                        {step.photo_required && !canCompleteStep(step)
                          ? 'Upload Photo First'
                          : 'Mark Complete'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSkipInput(showSkipInput === step.id ? null : step.id)}
                        className="bg-white/10 hover:bg-white/15 border border-white/10 text-white/60 rounded-lg py-3 px-4 text-sm transition-colors"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Skip reason input */}
                    {showSkipInput === step.id && (
                      <div className="space-y-2 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3">
                        <p className="text-xs text-yellow-400/70">Reason for skipping (required):</p>
                        <input
                          type="text"
                          value={skipReason}
                          onChange={(e) => setSkipReason(e.target.value)}
                          placeholder="e.g. Customer declined this step"
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/40"
                        />
                        <button
                          type="button"
                          onClick={() => handleSkipSubmit(step.id)}
                          disabled={!skipReason.trim()}
                          className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-medium rounded-lg py-2 text-sm transition-colors disabled:opacity-40"
                        >
                          Skip Step
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
