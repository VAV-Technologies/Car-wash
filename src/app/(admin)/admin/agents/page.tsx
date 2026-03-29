'use client';

import Link from 'next/link';
import { MessageCircle, Mail, PenTool } from 'lucide-react';

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Agent Library</h1>
          <p className="text-sm text-white/50 mt-1">Manage your automated agents</p>
        </div>

        {/* Agent Cards */}
        <div className="space-y-4">
          {/* Shera */}
          <Link
            href="/admin/agents/shera"
            className="block rounded-xl border border-green-500/20 bg-[#171717] p-5 hover:border-green-500/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Shera</h3>
                  <p className="text-sm text-white/50">WhatsApp AI Agent</p>
                  <p className="text-xs text-white/30 mt-0.5">Runs 24/7</p>
                </div>
              </div>
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-green-500/20 text-green-400">
                Active
              </span>
            </div>
          </Link>

          {/* Ryan */}
          <Link
            href="/admin/agents/plusvibe"
            className="block rounded-xl border border-purple-500/20 bg-[#171717] p-5 hover:border-purple-500/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Ryan</h3>
                  <p className="text-sm text-white/50">Email Reply Agent</p>
                  <p className="text-xs text-white/30 mt-0.5">Runs 24/7</p>
                </div>
              </div>
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-green-500/20 text-green-400">
                Active
              </span>
            </div>
          </Link>

          {/* Dimas */}
          <Link
            href="/admin/agents/dimas"
            className="block rounded-xl border border-blue-500/20 bg-[#171717] p-5 hover:border-blue-500/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <PenTool className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Dimas</h3>
                  <p className="text-sm text-white/50">SEO Blog Autopilot</p>
                  <p className="text-xs text-white/30 mt-0.5">Runs daily at 6:00 AM</p>
                </div>
              </div>
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-green-500/20 text-green-400">
                Active
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
