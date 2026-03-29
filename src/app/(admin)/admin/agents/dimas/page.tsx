'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, FileText, Search, BarChart3, BookOpen, Play, Settings, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'posts', label: 'Posts' },
  { key: 'keywords', label: 'Keywords' },
  { key: 'logs', label: 'Logs' },
  { key: 'settings', label: 'Settings' },
] as const

type TabKey = (typeof TABS)[number]['key']

interface BlogPost {
  id: string
  title: string
  slug: string
  keyword: string | null
  status: string
  word_count: number | null
  published_at: string | null
  created_at: string
}

interface KeywordRow {
  id: string
  keyword: string
  source: string | null
  status: string | null
  impressions: number | null
  current_position: number | null
  ctr: number | null
  last_checked: string | null
}

interface LogRow {
  id: string
  action: string
  details: Record<string, unknown> | null
  created_at: string
}

// ─── Dashboard Tab ───────────────────────────────────────────────
function DashboardTab() {
  const [stats, setStats] = useState({ totalPosts: 0, keywordsTracked: 0, avgPosition: 0, wordsWritten: 0 })
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [runResult, setRunResult] = useState<string | null>(null)
  const [lastRun, setLastRun] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)

      // Total posts
      const { count: postCount } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')

      // Keywords tracked
      const { count: kwCount } = await supabase
        .from('keyword_research')
        .select('*', { count: 'exact', head: true })

      // Avg position
      const { data: rankData } = await supabase
        .from('rank_tracking')
        .select('position')
      const positions = (rankData || []).map((r) => r.position).filter(Boolean)
      const avgPos = positions.length > 0 ? positions.reduce((a, b) => a + b, 0) / positions.length : 0

      // Words written
      const { data: wordData } = await supabase
        .from('blog_posts')
        .select('word_count')
        .eq('status', 'published')
      const totalWords = (wordData || []).reduce((sum, p) => sum + (p.word_count || 0), 0)

      // Last run
      const { data: lastLog } = await supabase
        .from('agent_logs')
        .select('created_at, action')
        .eq('action', 'daily_start')
        .order('created_at', { ascending: false })
        .limit(1)
      if (lastLog && lastLog.length > 0) {
        setLastRun(lastLog[0].created_at)
      }

      setStats({
        totalPosts: postCount || 0,
        keywordsTracked: kwCount || 0,
        avgPosition: Math.round(avgPos * 10) / 10,
        wordsWritten: totalWords,
      })
      setLoading(false)
    }
    fetchStats()
  }, [])

  async function handleRunDaily() {
    setRunning(true)
    setRunResult(null)
    try {
      const res = await fetch('/api/cron/dimas/daily')
      const data = await res.json()
      if (data.ok) {
        if (data.skipped) {
          setRunResult(`Skipped: ${data.reason}`)
        } else {
          setRunResult(`Published "${data.title}" (${data.word_count} words)`)
        }
      } else {
        setRunResult(`Error: ${data.error}`)
      }
    } catch (err: any) {
      setRunResult(`Failed: ${err.message}`)
    }
    setRunning(false)
  }

  const cards = [
    { label: 'Total Posts', value: stats.totalPosts, icon: FileText, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Keywords Tracked', value: stats.keywordsTracked, icon: Search, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Avg Position', value: stats.avgPosition || '-', icon: BarChart3, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Words Written', value: stats.wordsWritten.toLocaleString(), icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ]

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-white/10 bg-[#171717] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <span className="text-sm text-white/50">{card.label}</span>
            </div>
            {loading ? (
              <div className="h-8 w-16 rounded bg-white/5 animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-white">{card.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Run daily pipeline */}
      <div className="rounded-xl border border-white/10 bg-[#171717] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white">Daily Pipeline</h3>
            <p className="text-xs text-white/40 mt-1">Research, write, and publish a new blog post</p>
          </div>
          <button
            onClick={handleRunDaily}
            disabled={running}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            {running ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {running ? 'Running...' : 'Run Daily Pipeline'}
          </button>
        </div>
        {runResult && (
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
            {runResult}
          </div>
        )}
        {lastRun && (
          <div className="flex items-center gap-2 text-xs text-white/30">
            <Clock className="w-3 h-3" />
            Last run: {new Date(lastRun).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Posts Tab ────────────────────────────────────────────────────
function PostsTab() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('blog_posts')
      .select('id, title, slug, keyword, status, word_count, published_at, created_at')
      .order('created_at', { ascending: false })

    if (filter === 'published') query = query.eq('status', 'published')
    else if (filter === 'draft') query = query.eq('status', 'draft')

    const { data, error } = await query
    if (error) {
      console.error('Error fetching posts:', error)
    } else {
      setPosts(data || [])
    }
    setLoading(false)
  }, [filter])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'published', label: 'Published' },
    { key: 'draft', label: 'Draft' },
  ]

  const statusColors: Record<string, { bg: string; text: string }> = {
    published: { bg: 'bg-green-500/20', text: 'text-green-400' },
    draft: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f.key
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'bg-white/5 text-white/50 border border-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={fetchPosts}
          className="ml-auto p-1.5 rounded-lg border border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-[#171717] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-white/50 font-medium">Title</th>
                <th className="text-left px-4 py-3 text-white/50 font-medium hidden md:table-cell">Keyword</th>
                <th className="text-left px-4 py-3 text-white/50 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-white/50 font-medium hidden sm:table-cell">Words</th>
                <th className="text-left px-4 py-3 text-white/50 font-medium hidden lg:table-cell">Published</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-white/30">
                    Loading posts...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-white/30">
                    No posts found
                  </td>
                </tr>
              ) : (
                posts.map((post) => {
                  const style = statusColors[post.status] || { bg: 'bg-white/10', text: 'text-white/50' }
                  return (
                    <tr key={post.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-white font-medium max-w-[300px] truncate">{post.title}</td>
                      <td className="px-4 py-3 text-white/50 hidden md:table-cell max-w-[200px] truncate">{post.keyword || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/50 hidden sm:table-cell">{post.word_count?.toLocaleString() || '-'}</td>
                      <td className="px-4 py-3 text-white/50 hidden lg:table-cell">
                        {post.published_at ? new Date(post.published_at).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Keywords Tab ────────────────────────────────────────────────
function KeywordsTab() {
  const [keywords, setKeywords] = useState<KeywordRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  const fetchKeywords = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('keyword_research')
      .select('id, keyword, source, status, impressions, current_position, ctr, last_checked')
      .order('impressions', { ascending: false, nullsFirst: false })

    if (filter === 'pending') query = query.eq('status', 'pending')
    else if (filter === 'used') query = query.eq('status', 'used')
    else if (filter === 'rejected') query = query.eq('status', 'rejected')

    const { data, error } = await query
    if (error) {
      console.error('Error fetching keywords:', error)
    } else {
      setKeywords(data || [])
    }
    setLoading(false)
  }, [filter])

  useEffect(() => {
    fetchKeywords()
  }, [fetchKeywords])

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'used', label: 'Used' },
    { key: 'rejected', label: 'Rejected' },
  ]

  const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    used: { bg: 'bg-green-500/20', text: 'text-green-400' },
    rejected: { bg: 'bg-red-500/20', text: 'text-red-400' },
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f.key
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'bg-white/5 text-white/50 border border-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={fetchKeywords}
          className="ml-auto p-1.5 rounded-lg border border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-[#171717] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-white/50 font-medium">Keyword</th>
                <th className="text-left px-4 py-3 text-white/50 font-medium hidden sm:table-cell">Source</th>
                <th className="text-left px-4 py-3 text-white/50 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-white/50 font-medium hidden md:table-cell">Impressions</th>
                <th className="text-left px-4 py-3 text-white/50 font-medium hidden md:table-cell">Position</th>
                <th className="text-left px-4 py-3 text-white/50 font-medium hidden lg:table-cell">CTR</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-white/30">
                    Loading keywords...
                  </td>
                </tr>
              ) : keywords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-white/30">
                    No keywords found
                  </td>
                </tr>
              ) : (
                keywords.map((kw) => {
                  const style = statusColors[kw.status || ''] || { bg: 'bg-white/10', text: 'text-white/50' }
                  return (
                    <tr key={kw.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-white font-medium max-w-[250px] truncate">{kw.keyword}</td>
                      <td className="px-4 py-3 text-white/50 hidden sm:table-cell">{kw.source || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
                          {kw.status || 'unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/50 hidden md:table-cell">{kw.impressions?.toLocaleString() || '-'}</td>
                      <td className="px-4 py-3 text-white/50 hidden md:table-cell">{kw.current_position || '-'}</td>
                      <td className="px-4 py-3 text-white/50 hidden lg:table-cell">
                        {kw.ctr != null ? `${(kw.ctr * 100).toFixed(1)}%` : '-'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Logs Tab ────────────────────────────────────────────────────
function LogsTab() {
  const [logs, setLogs] = useState<LogRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('agent_logs')
      .select('id, action, details, created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Error fetching logs:', error)
    } else {
      setLogs(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchLogs()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLogs, 30000)
    return () => clearInterval(interval)
  }, [fetchLogs])

  const actionColors: Record<string, { bg: string; text: string }> = {
    daily_start: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    research: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
    write: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
    publish: { bg: 'bg-green-500/20', text: 'text-green-400' },
    error: { bg: 'bg-red-500/20', text: 'text-red-400' },
    daily_skip: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    deep_research: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/30">Auto-refreshes every 30 seconds</p>
        <button
          onClick={fetchLogs}
          className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#171717] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-white/50 font-medium">Action</th>
                <th className="text-left px-4 py-3 text-white/50 font-medium">Details</th>
                <th className="text-left px-4 py-3 text-white/50 font-medium hidden sm:table-cell">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-white/30">
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-white/30">
                    No logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const style = actionColors[log.action] || { bg: 'bg-white/10', text: 'text-white/50' }
                  const detailStr = log.details ? JSON.stringify(log.details) : '-'
                  const truncatedDetail = detailStr.length > 120 ? detailStr.slice(0, 120) + '...' : detailStr
                  return (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/50 max-w-[400px] truncate font-mono text-xs">{truncatedDetail}</td>
                      <td className="px-4 py-3 text-white/40 text-xs hidden sm:table-cell whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Settings Tab ────────────────────────────────────────────────
function SettingsTab() {
  const [claudeApiKey, setClaudeApiKey] = useState('')
  const [siteUrl, setSiteUrl] = useState('')
  const [blogNiche, setBlogNiche] = useState('')
  const [targetCountry, setTargetCountry] = useState('ID')
  const [postsPerDay, setPostsPerDay] = useState(1)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [runningResearch, setRunningResearch] = useState(false)
  const [researchResult, setResearchResult] = useState<string | null>(null)

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase
        .from('agent_settings')
        .select('api_key, system_prompt')
        .eq('agent_name', 'dimas')
        .single()

      if (data) {
        if (data.api_key) {
          try {
            setClaudeApiKey(atob(data.api_key))
          } catch {
            setClaudeApiKey(data.api_key)
          }
        }
        if (data.system_prompt) {
          try {
            const parsed = JSON.parse(data.system_prompt)
            if (parsed.site_url) setSiteUrl(parsed.site_url)
            if (parsed.blog_niche) setBlogNiche(parsed.blog_niche)
            if (parsed.target_country) setTargetCountry(parsed.target_country)
            if (parsed.posts_per_day) setPostsPerDay(parsed.posts_per_day)
          } catch {
            // ignore parse error
          }
        }
      }
      setLoaded(true)
    }
    loadSettings()
  }, [])

  async function handleSave() {
    setSaving(true)
    const encoded = btoa(claudeApiKey)
    const systemPrompt = JSON.stringify({
      site_url: siteUrl,
      blog_niche: blogNiche,
      target_country: targetCountry,
      posts_per_day: postsPerDay,
    })

    const { error } = await supabase
      .from('agent_settings')
      .upsert(
        { agent_name: 'dimas', api_key: encoded, system_prompt: systemPrompt },
        { onConflict: 'agent_name' }
      )

    if (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    }
    setSaving(false)
  }

  async function handleRunResearch() {
    setRunningResearch(true)
    setResearchResult(null)
    try {
      const res = await fetch('/api/cron/dimas/research')
      const data = await res.json()
      if (data.ok) {
        setResearchResult(`Stored ${data.keywords_stored} keywords`)
      } else {
        setResearchResult(`Error: ${data.error}`)
      }
    } catch (err: any) {
      setResearchResult(`Failed: ${err.message}`)
    }
    setRunningResearch(false)
  }

  if (!loaded) {
    return <div className="text-white/30 text-sm py-8 text-center">Loading settings...</div>
  }

  const countries = [
    { code: 'ID', label: 'Indonesia' },
    { code: 'US', label: 'United States' },
    { code: 'MY', label: 'Malaysia' },
    { code: 'SG', label: 'Singapore' },
    { code: 'AU', label: 'Australia' },
    { code: 'GB', label: 'United Kingdom' },
  ]

  return (
    <div className="max-w-2xl space-y-6">
      {/* Main settings */}
      <div className="rounded-xl border border-white/10 bg-[#171717] p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1.5">Claude API Key</label>
          <input
            type="password"
            value={claudeApiKey}
            onChange={(e) => setClaudeApiKey(e.target.value)}
            placeholder="Enter your Claude API key"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1.5">Site URL</label>
          <input
            type="text"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="https://castudio.id"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1.5">Blog Niche</label>
          <input
            type="text"
            value={blogNiche}
            onChange={(e) => setBlogNiche(e.target.value)}
            placeholder="car wash, car detailing, auto care"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1.5">Target Country</label>
          <select
            value={targetCountry}
            onChange={(e) => setTargetCountry(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code} className="bg-[#171717] text-white">
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1.5">Posts Per Day</label>
          <input
            type="number"
            min={1}
            max={10}
            value={postsPerDay}
            onChange={(e) => setPostsPerDay(parseInt(e.target.value) || 1)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Deep research */}
      <div className="rounded-xl border border-white/10 bg-[#171717] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white">Deep Research</h3>
            <p className="text-xs text-white/40 mt-1">Run keyword research from GSC, autocomplete, and AI brainstorming</p>
          </div>
          <button
            onClick={handleRunResearch}
            disabled={runningResearch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white text-sm font-medium transition-colors border border-white/10"
          >
            {runningResearch ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {runningResearch ? 'Researching...' : 'Run Deep Research'}
          </button>
        </div>
        {researchResult && (
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
            {researchResult}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────
export default function DimasAgentPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/agents"
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Dimas</h1>
          <p className="text-sm text-white/50 mt-1">SEO Blog Autopilot</p>
        </div>
        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-orange-500/20 text-orange-400">
          Active
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/10">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'text-orange-500 border-orange-500'
                : 'text-white/50 border-transparent hover:text-white hover:border-white/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && <DashboardTab />}
      {activeTab === 'posts' && <PostsTab />}
      {activeTab === 'keywords' && <KeywordsTab />}
      {activeTab === 'logs' && <LogsTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </div>
  )
}
