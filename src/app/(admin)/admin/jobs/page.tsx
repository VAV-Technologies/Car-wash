'use client'

import { useState } from 'react'
import JobStats from '@/components/admin/jobs/JobStats'
import JobsTable from '@/components/admin/jobs/JobsTable'
import PhotoGallery from '@/components/admin/jobs/PhotoGallery'
import TimeAnalysis from '@/components/admin/jobs/TimeAnalysis'

const TABS = [
  { key: 'tracker', label: 'Job Tracker' },
  { key: 'photos', label: 'Photos' },
  { key: 'time', label: 'Time Analysis' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('tracker')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Job Tracker</h1>
        <p className="text-sm text-white/50 mt-1">Monitor job quality and performance</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/10">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'text-orange-400 border-orange-500'
                : 'text-white/50 border-transparent hover:text-white/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'tracker' && (
        <div className="space-y-8">
          <JobStats />
          <JobsTable />
        </div>
      )}
      {activeTab === 'photos' && <PhotoGallery />}
      {activeTab === 'time' && <TimeAnalysis />}
    </div>
  )
}
