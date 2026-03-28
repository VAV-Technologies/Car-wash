'use client';

import Link from 'next/link';
import { Agent } from '@/lib/admin/agents';

interface AgentCardProps {
  agent: Agent;
  onToggle: () => void;
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const fileTypeBadgeColors: Record<string, string> = {
  TS: 'bg-blue-500/20 text-blue-400',
  PY: 'bg-yellow-500/20 text-yellow-400',
  MD: 'bg-green-500/20 text-green-400',
  JS: 'bg-amber-500/20 text-amber-400',
  SQL: 'bg-purple-500/20 text-purple-400',
  SH: 'bg-red-500/20 text-red-400',
};

function getFileTypeBadgeColor(fileType: string): string {
  const upper = fileType.toUpperCase();
  return fileTypeBadgeColors[upper] || 'bg-white/10 text-white/60';
}

export default function AgentCard({ agent, onToggle }: AgentCardProps) {
  const connectorCount = agent.connector_ids?.length ?? 0;

  return (
    <div className="relative rounded-xl bg-[#171717] border border-white/10 hover:border-orange-500/30 transition-all duration-200 group">
      {/* Card Link */}
      <Link
        href={`/admin/agents/${agent.id}`}
        className="block p-5"
        aria-label={`View agent: ${agent.name}`}
      >
        {/* Top Row: Name + Badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-sm font-semibold text-white truncate flex-1">
            {agent.name}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* File Type Badge */}
            {agent.file_type && (
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${getFileTypeBadgeColor(
                  agent.file_type
                )}`}
              >
                {agent.file_type.toUpperCase()}
              </span>
            )}
            {/* Status Badge */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                agent.status === 'active'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-white/10 text-white/40'
              }`}
            >
              {agent.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Description */}
        {agent.description && (
          <p className="text-xs text-white/40 line-clamp-2 mb-3">
            {agent.description}
          </p>
        )}

        {/* Bottom Row: Connector Count + Time */}
        <div className="flex items-center justify-between text-[11px] text-white/30">
          <div className="flex items-center gap-2">
            {connectorCount > 0 && (
              <span className="text-white/40">
                {connectorCount} connector{connectorCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {agent.updated_at && (
            <span>Updated {timeAgo(agent.updated_at)}</span>
          )}
        </div>
      </Link>

      {/* Toggle Switch */}
      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle();
          }}
          aria-label={`Toggle agent ${agent.name} ${agent.status === 'active' ? 'off' : 'on'}`}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            agent.status === 'active' ? 'bg-orange-500' : 'bg-white/20'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              agent.status === 'active' ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
