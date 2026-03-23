'use client'

import ServiceMixChart from '@/components/admin/analytics/ServiceMixChart'
import AcquisitionCurve from '@/components/admin/analytics/AcquisitionCurve'
import RetentionCohorts from '@/components/admin/analytics/RetentionCohorts'
import RevenueConcentration from '@/components/admin/analytics/RevenueConcentration'
import SeasonalPatterns from '@/components/admin/analytics/SeasonalPatterns'
import UpsellReport from '@/components/admin/analytics/UpsellReport'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-white/10 rounded-xl bg-[#171717] p-5">
      <h2 className="text-white font-semibold text-base mb-4">{title}</h2>
      {children}
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics Engine</h1>
        <p className="text-sm text-white/40 mt-1">Deep insights into service mix, customer behavior, and revenue patterns.</p>
      </div>

      <Section title="Service Mix Trend">
        <ServiceMixChart />
      </Section>

      <Section title="Customer Acquisition">
        <AcquisitionCurve />
      </Section>

      <Section title="Retention Cohorts">
        <RetentionCohorts />
      </Section>

      <Section title="Revenue Concentration">
        <RevenueConcentration />
      </Section>

      <Section title="Seasonal Patterns">
        <SeasonalPatterns />
      </Section>

      <Section title="Upsell Effectiveness">
        <UpsellReport />
      </Section>
    </div>
  )
}
