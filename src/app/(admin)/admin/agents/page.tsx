'use client';

import { useState } from 'react';
import AgentGrid from '@/components/admin/agents/AgentGrid';
import CreateAgentModal from '@/components/admin/agents/CreateAgentModal';
import ConnectorsPanel from '@/components/admin/agents/ConnectorsPanel';

export default function AgentsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showConnectors, setShowConnectors] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Agent Library</h1>
            <p className="text-sm text-white/50 mt-1">Manage your automated agents</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowConnectors(true)}
              className="px-4 py-2 rounded-lg border border-white/10 bg-[#171717] text-white/70 hover:text-white hover:border-white/20 transition-colors text-sm font-medium"
            >
              Connectors
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors text-sm font-medium"
            >
              + Create New
            </button>
          </div>
        </div>

        {/* Agent Grid */}
        <AgentGrid key={refreshKey} />

        {/* Modals */}
        {showCreate && (
          <CreateAgentModal
            onClose={() => setShowCreate(false)}
            onCreated={() => {
              setShowCreate(false);
              setRefreshKey((k) => k + 1);
            }}
          />
        )}

        {showConnectors && (
          <ConnectorsPanel onClose={() => setShowConnectors(false)} />
        )}
      </div>
    </div>
  );
}
