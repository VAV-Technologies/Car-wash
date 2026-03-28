'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAgents, toggleAgentStatus } from '@/lib/admin/agents';
import { Agent } from '@/lib/admin/agents';
import AgentCard from './AgentCard';

const ITEMS_PER_PAGE = 12;

type StatusTab = 'all' | 'active' | 'inactive';

export default function AgentGrid() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState<StatusTab>('all');
  const [page, setPage] = useState(1);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAgents({ search: '', status: '', page: 1, limit: 50 });
      setAgents(result.data);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = currentStatus ? 'paused' : 'active';
      await toggleAgentStatus(id, newStatus as 'active' | 'paused');
      setAgents((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus as any } : a))
      );
    } catch (err) {
      console.error('Failed to toggle agent status:', err);
    }
  };

  // Filter by search
  const searched = agents.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  // Filter by status tab
  const filtered = searched.filter((a) => {
    if (statusTab === 'active') return a.status === 'active';
    if (statusTab === 'inactive') return a.status !== 'active';
    return true;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusTab]);

  const tabs: { label: string; value: StatusTab }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  return (
    <div>
      {/* Search + Status Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search agents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 px-4 py-2 rounded-lg bg-[#171717] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
        />
        <div className="flex items-center gap-1 bg-[#171717] border border-white/10 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusTab(tab.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                statusTab === tab.value
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-xl bg-[#171717] border border-white/10 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty State — only show if actively searching/filtering */}
      {!loading && filtered.length === 0 && search && (
        <div className="flex flex-col items-center justify-center py-12 text-white/40">
          <p className="text-sm">No agents match your search.</p>
          <button
            onClick={() => setSearch('')}
            className="mt-2 text-xs text-orange-500 hover:text-orange-400"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Agent Cards */}
      {!loading && paginated.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onToggle={() => handleToggle(agent.id, agent.status === 'active')}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-[#171717] border border-white/10 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-white/40">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg bg-[#171717] border border-white/10 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
