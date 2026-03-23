'use client'

import MonthlyScorecard from '@/components/admin/scorecard/MonthlyScorecard'
import ScorecardTimeline from '@/components/admin/scorecard/ScorecardTimeline'

export default function ScorecardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Monthly Scorecard</h1>
        <p className="text-sm text-white/40 mt-1">Track performance against scenario targets month by month.</p>
      </div>

      <div className="border border-white/10 rounded-xl bg-[#171717] p-5">
        <h2 className="text-white font-semibold text-base mb-4">Monthly Performance</h2>
        <MonthlyScorecard />
      </div>

      <div className="border border-white/10 rounded-xl bg-[#171717] p-5">
        <h2 className="text-white font-semibold text-base mb-4">Timeline Overview</h2>
        <ScorecardTimeline />
      </div>
    </div>
  )
}
