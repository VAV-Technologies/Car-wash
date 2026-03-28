'use client'

import { useState, useEffect } from 'react'
import { Loader2, Plus, Trash2, CheckCircle2, BookOpen } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Rule {
  id: string
  agent_name: string
  title: string
  content: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function WARules() {
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    fetchRules()
  }, [])

  async function fetchRules() {
    setLoading(true)
    const { data, error } = await supabase
      .from('agent_rules')
      .select('*')
      .eq('agent_name', 'shera')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setRules(data)
    }
    setLoading(false)
  }

  async function addRule() {
    if (!newTitle.trim() || !newContent.trim()) return
    setAdding(true)

    const { data, error } = await supabase
      .from('agent_rules')
      .insert({
        agent_name: 'shera',
        title: newTitle.trim(),
        content: newContent.trim(),
        is_active: true,
      })
      .select()
      .single()

    if (!error && data) {
      setRules((prev) => [data, ...prev])
      setNewTitle('')
      setNewContent('')
      setShowForm(false)
    }
    setAdding(false)
  }

  async function deleteRule(id: string) {
    setDeletingId(id)
    const { error } = await supabase.from('agent_rules').delete().eq('id', id)
    if (!error) {
      setRules((prev) => prev.filter((r) => r.id !== id))
    }
    setDeletingId(null)
    setConfirmDeleteId(null)
  }

  async function toggleActive(id: string, current: boolean) {
    const { error } = await supabase
      .from('agent_rules')
      .update({ is_active: !current, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (!error) {
      setRules((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, is_active: !current, updated_at: new Date().toISOString() } : r
        )
      )
    }
  }

  async function saveContent(id: string, content: string) {
    setSavingId(id)
    const { error } = await supabase
      .from('agent_rules')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (!error) {
      setRules((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, content, updated_at: new Date().toISOString() } : r
        )
      )
      setSavedId(id)
      setTimeout(() => setSavedId(null), 2000)
    }
    setSavingId(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg mt-0.5">
            <BookOpen className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">Custom Rules</h2>
            <p className="text-white/40 text-sm mt-0.5">
              Rules you add here get injected into Shera&apos;s context on every message. Use them to
              override behavior, add constraints, or give specific instructions.
            </p>
          </div>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        )}
      </div>

      {/* Add Rule Form */}
      {showForm && (
        <div className="bg-[#171717] border border-orange-500/30 rounded-lg p-5 space-y-4">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Rule title (e.g. 'Always greet in Indonesian')"
            className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-orange-500/50 transition-colors"
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Rule content — be specific about what Shera should or shouldn't do..."
            rows={4}
            className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm font-mono placeholder:text-white/30 focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={addRule}
              disabled={adding || !newTitle.trim() || !newContent.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add
            </button>
            <button
              onClick={() => {
                setShowForm(false)
                setNewTitle('')
                setNewContent('')
              }}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && rules.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No custom rules yet</p>
          <p className="text-white/25 text-xs mt-1">
            Add rules to customize how Shera responds to customers.
          </p>
        </div>
      )}

      {/* Rules List */}
      {!loading &&
        rules.map((rule) => (
          <div
            key={rule.id}
            className="bg-[#171717] border border-white/10 rounded-lg p-5 space-y-3"
          >
            {/* Title Row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <h3 className="text-white font-medium text-sm truncate">{rule.title}</h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${
                    rule.is_active
                      ? 'bg-green-500/15 text-green-400'
                      : 'bg-white/5 text-white/30'
                  }`}
                >
                  {rule.is_active ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Save Feedback */}
                {savedId === rule.id && (
                  <span className="flex items-center gap-1 text-green-400 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Saved
                  </span>
                )}
                {savingId === rule.id && (
                  <Loader2 className="w-3.5 h-3.5 text-white/30 animate-spin" />
                )}

                {/* Toggle */}
                <button
                  onClick={() => toggleActive(rule.id, rule.is_active)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${
                    rule.is_active ? 'bg-green-500' : 'bg-white/10'
                  }`}
                  title={rule.is_active ? 'Disable rule' : 'Enable rule'}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      rule.is_active ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>

                {/* Delete */}
                {confirmDeleteId === rule.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => deleteRule(rule.id)}
                      disabled={deletingId === rule.id}
                      className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium rounded transition-colors"
                    >
                      {deletingId === rule.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        'Confirm'
                      )}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white/40 text-xs rounded transition-colors"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(rule.id)}
                    className="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    title="Delete rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Editable Content */}
            <textarea
              defaultValue={rule.content}
              onBlur={(e) => {
                const val = e.target.value.trim()
                if (val && val !== rule.content) {
                  saveContent(rule.id, val)
                }
              }}
              rows={3}
              className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg px-4 py-2.5 text-white/80 text-sm font-mono focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
            />

            {/* Created Date */}
            <p className="text-white/20 text-xs">
              Created {new Date(rule.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        ))}
    </div>
  )
}
