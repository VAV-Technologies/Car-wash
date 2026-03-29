'use client'

import {
  Globe,
  Shield,
  Smartphone,
  Bot,
  Mail,
  PenTool,
  Database,
  Cloud,
  MessageCircle,
  Calendar,
  Cpu,
  Image,
  Server,
  Clock,
  ArrowRight,
  Layers,
  Users,
  CreditCard,
  Wrench,
  DollarSign,
  BarChart3,
  Network,
} from 'lucide-react'

// ─── Section Title ───────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white">{children}</h2>
      <div className="mt-2 h-px w-full bg-white/10" />
    </div>
  )
}

// ─── Pill for table names ────────────────────────────────────────
function TablePill({ name }: { name: string }) {
  return (
    <span className="bg-white/5 text-white/50 px-2 py-0.5 rounded text-xs font-mono">
      {name}
    </span>
  )
}

// ─── Flow step pill ──────────────────────────────────────────────
function FlowStep({
  label,
  color,
}: {
  label: string
  color: string
}) {
  const bg: Record<string, string> = {
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  }
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${bg[color]}`}
    >
      {label}
    </span>
  )
}

function FlowArrow({ color }: { color: string }) {
  const fill: Record<string, string> = {
    green: 'text-green-500/40',
    purple: 'text-purple-500/40',
    blue: 'text-blue-500/40',
    orange: 'text-orange-500/40',
  }
  return <ArrowRight className={`w-4 h-4 shrink-0 ${fill[color]}`} />
}

// ─── Status dot ──────────────────────────────────────────────────
function StatusDot({ status }: { status: 'connected' | 'running' | 'hosting' | 'pending' }) {
  const colors: Record<string, string> = {
    connected: 'bg-green-400',
    running: 'bg-green-400',
    hosting: 'bg-green-400',
    pending: 'bg-yellow-400',
  }
  const labels: Record<string, string> = {
    connected: 'Connected',
    running: 'Running',
    hosting: 'Hosting',
    pending: 'Pending',
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-white/50">
      <span className={`w-1.5 h-1.5 rounded-full ${colors[status]}`} />
      {labels[status]}
    </span>
  )
}

// ═════════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════════

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 md:p-10 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Architecture</h1>
        <p className="text-sm text-white/40 mt-1">Castudio platform overview</p>
      </div>

      {/* ── Section 1: Platforms ──────────────────────────────── */}
      <section className="space-y-4">
        <SectionTitle>Platforms</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Public Site */}
          <div className="bg-[#171717] border border-white/10 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Globe className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">castudio.id</p>
                <p className="text-xs text-white/40">Public Website</p>
              </div>
            </div>
            <ul className="text-xs text-white/60 space-y-1 pl-1">
              <li>Homepage</li>
              <li>Services</li>
              <li>Subscriptions</li>
              <li>Detailing</li>
              <li>Blog (25 posts)</li>
              <li>Contact</li>
              <li>FAQ</li>
            </ul>
          </div>

          {/* Admin Panel */}
          <div className="bg-[#171717] border border-white/10 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">castudio.id/admin</p>
                <p className="text-xs text-white/40">Business Operations</p>
              </div>
            </div>
            <div className="text-xs text-white/60 space-y-2 pl-1">
              <div>
                <p className="text-white/30 uppercase tracking-wider text-[10px] font-medium mb-1">Sales</p>
                <p>Customers, Subscriptions, Conversations</p>
              </div>
              <div>
                <p className="text-white/30 uppercase tracking-wider text-[10px] font-medium mb-1">Operations</p>
                <p>Bookings, Jobs, Team, Equipment</p>
              </div>
              <div>
                <p className="text-white/30 uppercase tracking-wider text-[10px] font-medium mb-1">Finance</p>
                <p>Finance, Invoicing, Inventory</p>
              </div>
              <div>
                <p className="text-white/30 uppercase tracking-wider text-[10px] font-medium mb-1">Technology</p>
                <p>Agents, Accounts</p>
              </div>
              <div>
                <p className="text-white/30 uppercase tracking-wider text-[10px] font-medium mb-1">Analysis</p>
                <p>Analytics, Customer Map, Scorecard, Architecture</p>
              </div>
            </div>
          </div>

          {/* Washer Panel */}
          <div className="bg-[#171717] border border-white/10 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Smartphone className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">castudio.id/wash</p>
                <p className="text-xs text-white/40">Field Operations</p>
              </div>
            </div>
            <ul className="text-xs text-white/60 space-y-1 pl-1">
              <li>Today&apos;s Jobs</li>
              <li>Job History</li>
              <li>Earnings</li>
              <li>SOPs</li>
              <li>Profile</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Section 2: AI Agents ─────────────────────────────── */}
      <section className="space-y-4">
        <SectionTitle>AI Agents</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Shera */}
          <div className="bg-[#171717] border border-green-500/30 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <MessageCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">Shera</p>
                <p className="text-xs text-white/40">WhatsApp AI Agent</p>
              </div>
              <span className="ml-auto text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">
                Runs 24/7
              </span>
            </div>
            <div className="text-xs text-white/60 space-y-2 pl-1">
              <div>
                <p className="text-white/30 uppercase tracking-wider text-[10px] font-medium mb-1">Trigger</p>
                <p>Incoming WhatsApp messages</p>
              </div>
              <div>
                <p className="text-white/30 uppercase tracking-wider text-[10px] font-medium mb-1">Capabilities</p>
                <p>Booking, Rescheduling, Cancellation, Customer Registration, Rating Collection</p>
              </div>
              <div>
                <p className="text-white/30 uppercase tracking-wider text-[10px] font-medium mb-1">Model</p>
                <p>Claude Sonnet 4</p>
              </div>
              <div>
                <p className="text-white/30 uppercase tracking-wider text-[10px] font-medium mb-1">Infra</p>
                <p>WAHA on Azure ($4.75/mo)</p>
              </div>
            </div>
          </div>

          {/* Ryan */}
          <div className="bg-[#171717] border border-purple-500/30 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Mail className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">Ryan</p>
                <p className="text-xs text-white/40">Email Reply Agent</p>
              </div>
              <span className="ml-auto text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">
                Runs 24/7
              </span>
            </div>
            <div className="text-xs text-white/60 space-y-2 pl-1">
              <div>
                <p className="text-white/30 uppercase tracking-wider text-[10px] font-medium mb-1">Trigger</p>
                <p>Plusvibe webhook (email replies)</p>
              </div>
              <div>
                <p className="text-white/30 uppercase tracking-wider text-[10px] font-medium mb-1">Capabilities</p>
                <p>Reply Classification, Objection Handling, Phone Extraction, WhatsApp Handoff</p>
              </div>
              <div>
                <p className="text-white/30 uppercase tracking-wider text-[10px] font-medium mb-1">Model</p>
                <p>Claude Sonnet 4</p>
              </div>
              <div>
                <p className="text-white/30 uppercase tracking-wider text-[10px] font-medium mb-1">Infra</p>
                <p>Vercel Serverless (free)</p>
              </div>
            </div>
          </div>

          {/* Dimas */}
          <div className="bg-[#171717] border border-blue-500/30 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <PenTool className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">Dimas</p>
                <p className="text-xs text-white/40">SEO Blog Autopilot</p>
              </div>
              <span className="ml-auto text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                Daily 6:00 AM
              </span>
            </div>
            <div className="text-xs text-white/60 space-y-2 pl-1">
              <div>
                <p className="text-white/30 uppercase tracking-wider text-[10px] font-medium mb-1">Trigger</p>
                <p>Vercel Cron</p>
              </div>
              <div>
                <p className="text-white/30 uppercase tracking-wider text-[10px] font-medium mb-1">Pipeline</p>
                <p>Research &rarr; Write &rarr; Publish</p>
              </div>
              <div>
                <p className="text-white/30 uppercase tracking-wider text-[10px] font-medium mb-1">Model</p>
                <p>Claude Sonnet 4</p>
              </div>
              <div>
                <p className="text-white/30 uppercase tracking-wider text-[10px] font-medium mb-1">Infra</p>
                <p>Vercel Cron + GSC + Pexels</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: Data Flows ────────────────────────────── */}
      <section className="space-y-4">
        <SectionTitle>Data Flows</SectionTitle>

        <div className="space-y-3">
          {/* Flow 1: WhatsApp Booking */}
          <div className="bg-[#171717] border border-white/10 rounded-xl p-4">
            <p className="text-xs text-green-400 font-medium mb-3">WhatsApp Booking</p>
            <div className="flex items-center gap-2 flex-wrap">
              <FlowStep label="Customer" color="green" />
              <FlowArrow color="green" />
              <FlowStep label="WAHA (Azure)" color="green" />
              <FlowArrow color="green" />
              <FlowStep label="Webhook" color="green" />
              <FlowArrow color="green" />
              <FlowStep label="Shera (Claude)" color="green" />
              <FlowArrow color="green" />
              <FlowStep label="Supabase" color="green" />
              <FlowArrow color="green" />
              <FlowStep label="Washer Panel" color="green" />
            </div>
          </div>

          {/* Flow 2: Email Lead */}
          <div className="bg-[#171717] border border-white/10 rounded-xl p-4">
            <p className="text-xs text-purple-400 font-medium mb-3">Email Lead</p>
            <div className="flex items-center gap-2 flex-wrap">
              <FlowStep label="Email Reply" color="purple" />
              <FlowArrow color="purple" />
              <FlowStep label="Plusvibe Webhook" color="purple" />
              <FlowArrow color="purple" />
              <FlowStep label="Ryan (Claude)" color="purple" />
              <FlowArrow color="purple" />
              <FlowStep label="Reply via Plusvibe / Handoff to Shera" color="purple" />
            </div>
          </div>

          {/* Flow 3: Blog Publishing */}
          <div className="bg-[#171717] border border-white/10 rounded-xl p-4">
            <p className="text-xs text-blue-400 font-medium mb-3">Blog Publishing</p>
            <div className="flex items-center gap-2 flex-wrap">
              <FlowStep label="Cron (6am)" color="blue" />
              <FlowArrow color="blue" />
              <FlowStep label="Researcher (GSC/Autocomplete)" color="blue" />
              <FlowArrow color="blue" />
              <FlowStep label="Writer (Claude)" color="blue" />
              <FlowArrow color="blue" />
              <FlowStep label="Publisher (Supabase)" color="blue" />
              <FlowArrow color="blue" />
              <FlowStep label="castudio.id/tips" color="blue" />
            </div>
          </div>

          {/* Flow 4: Post-Service */}
          <div className="bg-[#171717] border border-white/10 rounded-xl p-4">
            <p className="text-xs text-orange-400 font-medium mb-3">Post-Service</p>
            <div className="flex items-center gap-2 flex-wrap">
              <FlowStep label="Job Completed" color="orange" />
              <FlowArrow color="orange" />
              <FlowStep label="2hr Cron" color="orange" />
              <FlowArrow color="orange" />
              <FlowStep label="Follow-up WhatsApp" color="orange" />
              <FlowArrow color="orange" />
              <FlowStep label="Customer Rates" color="orange" />
              <FlowArrow color="orange" />
              <FlowStep label="30 Days" color="orange" />
              <FlowArrow color="orange" />
              <FlowStep label="Re-engage / Upsell" color="orange" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 4: External Services ─────────────────────── */}
      <section className="space-y-4">
        <SectionTitle>External Services</SectionTitle>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Supabase', icon: Database, status: 'connected' as const, detail: '30 tables, PostgreSQL' },
            { name: 'WAHA', icon: Cloud, status: 'running' as const, detail: 'Azure Container, $4.75/mo' },
            { name: 'Claude API', icon: Cpu, status: 'connected' as const, detail: 'Sonnet 4, powers all agents' },
            { name: 'Plusvibe', icon: Mail, status: 'connected' as const, detail: 'Email outreach platform' },
            { name: 'Google Search Console', icon: BarChart3, status: 'connected' as const, detail: 'SEO tracking' },
            { name: 'Pexels', icon: Image, status: 'connected' as const, detail: 'Blog cover images' },
            { name: 'Vercel', icon: Server, status: 'hosting' as const, detail: 'Next.js 15, 6 cron jobs' },
          ].map((svc) => (
            <div
              key={svc.name}
              className="bg-[#171717] border border-white/10 rounded-xl p-4 space-y-2"
            >
              <div className="flex items-center gap-2">
                <svc.icon className="w-4 h-4 text-white/40" />
                <p className="text-sm font-medium truncate">{svc.name}</p>
              </div>
              <StatusDot status={svc.status} />
              <p className="text-[11px] text-white/40 leading-tight">{svc.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 5: Scheduled Tasks ───────────────────────── */}
      <section className="space-y-4">
        <SectionTitle>Scheduled Tasks</SectionTitle>

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#171717] text-white/50 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-medium">Task</th>
                <th className="text-left px-4 py-3 font-medium">Schedule</th>
                <th className="text-left px-4 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-white/70 text-xs">
              {[
                {
                  task: 'Post-Job Follow-up',
                  schedule: 'Every 2 hours',
                  desc: 'Sends rating request 2hrs after job completion',
                },
                {
                  task: 'Customer Re-engage',
                  schedule: 'Daily 10:00 AM',
                  desc: 'Nudges one-time customers after 30 days',
                },
                {
                  task: 'Subscription Upsell',
                  schedule: 'Daily 11:00 AM',
                  desc: 'Offers subscription to repeat customers',
                },
                {
                  task: 'Blog Publishing',
                  schedule: 'Daily 6:00 AM (23:00 UTC)',
                  desc: 'Research \u2192 Write \u2192 Publish pipeline',
                },
                {
                  task: 'SEO Rank Tracking',
                  schedule: 'Weekly Monday',
                  desc: 'Tracks keyword positions via GSC',
                },
                {
                  task: 'Keyword Research',
                  schedule: 'Monthly 1st',
                  desc: 'Deep keyword research batch',
                },
              ].map((row, i) => (
                <tr key={i} className="border-t border-white/5 bg-[#171717]">
                  <td className="px-4 py-3 font-medium text-white/80">{row.task}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.schedule}</td>
                  <td className="px-4 py-3">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Section 6: Database Schema ───────────────────────── */}
      <section className="space-y-4">
        <SectionTitle>Database (30 Tables)</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Core Business */}
          <div className="bg-[#171717] border border-white/10 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
              Core Business (5)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['customers', 'bookings', 'jobs', 'employees', 'subscriptions'].map((t) => (
                <TablePill key={t} name={t} />
              ))}
            </div>
          </div>

          {/* Financial */}
          <div className="bg-[#171717] border border-white/10 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
              Financial (3)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['transactions', 'ratings', 'upsell_attempts'].map((t) => (
                <TablePill key={t} name={t} />
              ))}
            </div>
          </div>

          {/* Operations */}
          <div className="bg-[#171717] border border-white/10 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
              Operations (3)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['equipment', 'inventory', 'sop_checklists'].map((t) => (
                <TablePill key={t} name={t} />
              ))}
            </div>
          </div>

          {/* Communications */}
          <div className="bg-[#171717] border border-white/10 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
              Communications (4)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['whatsapp_conversations', 'email_leads', 'conversations', 'human_escalations'].map(
                (t) => (
                  <TablePill key={t} name={t} />
                )
              )}
            </div>
          </div>

          {/* Content & SEO */}
          <div className="bg-[#171717] border border-white/10 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
              Content & SEO (3)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['blog_posts', 'keyword_research', 'rank_tracking'].map((t) => (
                <TablePill key={t} name={t} />
              ))}
            </div>
          </div>

          {/* AI & Automation */}
          <div className="bg-[#171717] border border-white/10 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
              AI & Automation (7)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                'agent_settings',
                'agent_logs',
                'agent_knowledge',
                'agent_rules',
                'automations',
                'connectors',
                'automation_runs',
              ].map((t) => (
                <TablePill key={t} name={t} />
              ))}
            </div>
          </div>

          {/* Storage */}
          <div className="bg-[#171717] border border-white/10 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
              Storage (2)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['job_photos', 'castudio-photos (bucket)'].map((t) => (
                <TablePill key={t} name={t} />
              ))}
            </div>
          </div>

          {/* Analytics */}
          <div className="bg-[#171717] border border-white/10 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
              Analytics (2)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['customer_stats', 'notifications'].map((t) => (
                <TablePill key={t} name={t} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
