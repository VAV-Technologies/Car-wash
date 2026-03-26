'use client';

import { useState, useEffect } from 'react';
import {
  Key,
  Cpu,
  Bot,
  Activity,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

interface Settings {
  api_key: string;
  model: string;
  max_tokens: number;
  system_prompt: string;
  has_key: boolean;
}

interface HealthResult {
  label: string;
  description: string;
  status: 'pass' | 'fail' | 'loading' | 'idle';
  error?: string;
}

const DEFAULT_TOOLS = [
  { name: 'search_customer', description: 'Find customer by phone number or name' },
  { name: 'get_customer_bookings', description: "Get a customer's booking history" },
  { name: 'check_date_availability', description: 'Check if a date has available slots' },
  { name: 'create_booking', description: 'Create a new booking for a customer' },
  { name: 'update_booking', description: 'Reschedule a booking (change date/time)' },
  { name: 'cancel_booking', description: 'Cancel an existing booking' },
  { name: 'create_customer', description: 'Register a new customer' },
];

const DATA_ACCESS = [
  { label: 'Customers', description: 'search, create, lookup by phone' },
  { label: 'Bookings', description: 'create, update, cancel, check availability' },
  { label: 'Services', description: 'pricing and duration info (built into prompt)' },
];

const MODEL_OPTIONS = [
  {
    value: 'claude-sonnet-4-20250514',
    label: 'Claude Sonnet 4 (Recommended \u2014 balanced speed & quality)',
  },
  {
    value: 'claude-haiku-4-5-20251001',
    label: 'Claude Haiku 4.5 (Fastest, cheapest)',
  },
  {
    value: 'claude-opus-4-6-20250610',
    label: 'Claude Opus 4.6 (Most capable, most expensive)',
  },
];

export default function WASettings() {
  const [settings, setSettings] = useState<Settings>({
    api_key: '',
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system_prompt: '',
    has_key: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingKey, setEditingKey] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [keySaved, setKeySaved] = useState(false);
  const [modelSaving, setModelSaving] = useState(false);
  const [modelSaved, setModelSaved] = useState(false);
  const [localModel, setLocalModel] = useState('claude-sonnet-4-20250514');
  const [localMaxTokens, setLocalMaxTokens] = useState(1024);
  const [runningHealth, setRunningHealth] = useState(false);
  const [healthResults, setHealthResults] = useState<HealthResult[]>([
    { label: 'Claude API Key', description: 'API key is valid and can reach Claude', status: 'idle' },
    { label: 'Castudio Database', description: 'Can query customer and booking data', status: 'idle' },
    { label: 'WAHA Server', description: 'WhatsApp server is reachable', status: 'idle' },
    { label: 'Webhook Endpoint', description: 'Webhook is live and responding', status: 'idle' },
  ]);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/whatsapp?action=settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setLocalModel(data.model || 'claude-sonnet-4-20250514');
        setLocalMaxTokens(data.max_tokens || 1024);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  }

  async function saveApiKey() {
    if (!keyInput.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/whatsapp?action=save-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: btoa(keyInput.trim()) }),
      });
      if (res.ok) {
        setSettings((prev) => ({
          ...prev,
          has_key: true,
          api_key: `\u2022\u2022\u2022\u2022${keyInput.trim().slice(-4)}`,
        }));
        setEditingKey(false);
        setKeyInput('');
        setKeySaved(true);
        setTimeout(() => setKeySaved(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save API key:', err);
    } finally {
      setSaving(false);
    }
  }

  async function saveModelConfig() {
    setModelSaving(true);
    try {
      const res = await fetch('/api/admin/whatsapp?action=save-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: localModel, max_tokens: localMaxTokens }),
      });
      if (res.ok) {
        setSettings((prev) => ({
          ...prev,
          model: localModel,
          max_tokens: localMaxTokens,
        }));
        setModelSaved(true);
        setTimeout(() => setModelSaved(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save model config:', err);
    } finally {
      setModelSaving(false);
    }
  }

  async function runHealthCheck() {
    setRunningHealth(true);
    setHealthResults((prev) =>
      prev.map((r) => ({ ...r, status: 'loading' as const, error: undefined }))
    );

    try {
      const res = await fetch('/api/admin/whatsapp?action=health-check');
      if (res.ok) {
        const data = await res.json();
        setHealthResults([
          {
            label: 'Claude API Key',
            description: 'API key is valid and can reach Claude',
            status: data.claude_api?.ok ? 'pass' : 'fail',
            error: data.claude_api?.error,
          },
          {
            label: 'Castudio Database',
            description: 'Can query customer and booking data',
            status: data.database?.ok ? 'pass' : 'fail',
            error: data.database?.error,
          },
          {
            label: 'WAHA Server',
            description: 'WhatsApp server is reachable',
            status: data.waha?.ok ? 'pass' : 'fail',
            error: data.waha?.error,
          },
          {
            label: 'Webhook Endpoint',
            description: 'Webhook is live and responding',
            status: data.webhook?.ok ? 'pass' : 'fail',
            error: data.webhook?.error,
          },
        ]);
      } else {
        setHealthResults((prev) =>
          prev.map((r) => ({
            ...r,
            status: 'fail' as const,
            error: 'Health check request failed',
          }))
        );
      }
    } catch (err) {
      setHealthResults((prev) =>
        prev.map((r) => ({
          ...r,
          status: 'fail' as const,
          error: 'Network error running health check',
        }))
      );
    } finally {
      setRunningHealth(false);
    }
  }

  const failedCount = healthResults.filter((r) => r.status === 'fail').length;
  const allPassed = healthResults.every((r) => r.status === 'pass');
  const hasResults = healthResults.some((r) => r.status !== 'idle');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        <span className="ml-3 text-white/50">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section A: API Key */}
      <div className="rounded-xl border border-orange-500/30 bg-[#171717] p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10">
            <Key className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Claude API Key</h3>
            <p className="text-sm text-white/50">
              Dedicated API key for the Shera WhatsApp agent. Separate from the admin chatbot key.
            </p>
          </div>
        </div>

        <p className="mb-4 text-xs text-white/40">
          Get your key at{' '}
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-orange-400 hover:text-orange-300"
          >
            console.anthropic.com/settings/keys
            <ExternalLink className="h-3 w-3" />
          </a>
        </p>

        {keySaved && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span className="text-sm text-green-400">Key saved</span>
          </div>
        )}

        {settings.has_key && !editingKey ? (
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-lg border border-white/10 bg-[#0f0f0f] px-4 py-2.5 font-mono text-sm text-white/70">
              {settings.api_key || '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
            </div>
            <button
              onClick={() => setEditingKey(true)}
              className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:border-white/20 hover:text-white"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="flex-1 rounded-lg border border-white/10 bg-[#0f0f0f] px-4 py-2.5 font-mono text-sm text-white placeholder-white/30 outline-none transition focus:border-orange-500/50"
            />
            <button
              onClick={saveApiKey}
              disabled={saving || !keyInput.trim()}
              className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Save'
              )}
            </button>
            {editingKey && (
              <button
                onClick={() => {
                  setEditingKey(false);
                  setKeyInput('');
                }}
                className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:border-white/20 hover:text-white"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>

      {/* Section B: Model & Parameters */}
      <div className="rounded-xl border border-white/10 bg-[#171717] p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10">
            <Cpu className="h-5 w-5 text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold text-white">Model Configuration</h3>
        </div>

        {modelSaved && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span className="text-sm text-green-400">Configuration saved</span>
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/70">Model</label>
            <div className="relative">
              <select
                value={localModel}
                onChange={(e) => setLocalModel(e.target.value)}
                className="w-full appearance-none rounded-lg border border-white/10 bg-[#0f0f0f] px-4 py-2.5 pr-10 text-sm text-white outline-none transition focus:border-orange-500/50"
              >
                {MODEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/70">Max Tokens</label>
            <input
              type="number"
              min={256}
              max={4096}
              value={localMaxTokens}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v)) setLocalMaxTokens(Math.min(4096, Math.max(256, v)));
              }}
              className="w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-4 py-2.5 text-sm text-white outline-none transition focus:border-orange-500/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <p className="mt-1 text-xs text-white/30">Min 256, Max 4096. Default: 1024</p>
          </div>

          <button
            onClick={saveModelConfig}
            disabled={modelSaving}
            className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600 disabled:opacity-50"
          >
            {modelSaving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>

      {/* Section C: Agent Configuration (read-only) */}
      <div className="rounded-xl border border-white/10 bg-[#171717] p-6">
        <div className="mb-1 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10">
            <Bot className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Agent Configuration</h3>
            <p className="text-sm text-white/40">
              How Shera is configured &mdash; edit via Claude Code in your terminal
            </p>
          </div>
        </div>

        {/* System Prompt */}
        <div className="mt-6">
          <h4 className="mb-2 text-sm font-medium text-white/70">System Prompt</h4>
          <pre className="max-h-64 overflow-auto rounded-lg border border-white/5 bg-[#0f0f0f] p-4 font-mono text-xs leading-relaxed text-white/60">
            {settings.system_prompt || 'No system prompt configured. The default agent prompt will be used.'}
          </pre>
        </div>

        {/* Tools */}
        <div className="mt-6">
          <h4 className="mb-3 text-sm font-medium text-white/70">Tools</h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {DEFAULT_TOOLS.map((tool) => (
              <div
                key={tool.name}
                className="rounded-lg border border-white/5 bg-[#0f0f0f] px-4 py-3"
              >
                <p className="font-mono text-sm text-orange-400">{tool.name}</p>
                <p className="mt-0.5 text-xs text-white/50">{tool.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Data Access */}
        <div className="mt-6">
          <h4 className="mb-3 text-sm font-medium text-white/70">Data Access</h4>
          <div className="space-y-2">
            {DATA_ACCESS.map((item) => (
              <div key={item.label} className="flex items-start gap-3 rounded-lg border border-white/5 bg-[#0f0f0f] px-4 py-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
                <div>
                  <span className="text-sm font-medium text-white/80">{item.label}</span>
                  <span className="text-sm text-white/40"> &mdash; {item.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section D: Health Check */}
      <div className="rounded-xl border border-white/10 bg-[#171717] p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10">
              <Activity className="h-5 w-5 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-white">System Health Check</h3>
          </div>
          <button
            onClick={runHealthCheck}
            disabled={runningHealth}
            className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600 disabled:opacity-50"
          >
            {runningHealth ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Running...
              </span>
            ) : (
              'Run Health Check'
            )}
          </button>
        </div>

        {/* Overall summary */}
        {hasResults && !runningHealth && (
          <div
            className={`mb-5 rounded-lg border px-4 py-3 text-sm font-medium ${
              allPassed
                ? 'border-green-500/30 bg-green-500/10 text-green-400'
                : 'border-red-500/30 bg-red-500/10 text-red-400'
            }`}
          >
            {allPassed
              ? 'All systems operational'
              : `${failedCount} of 4 checks failed`}
          </div>
        )}

        {/* Check rows */}
        <div className="space-y-3">
          {healthResults.map((check, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border border-white/5 bg-[#0f0f0f] px-4 py-3"
            >
              <div className="mt-0.5 flex-shrink-0">
                {check.status === 'loading' && (
                  <Loader2 className="h-5 w-5 animate-spin text-orange-400" />
                )}
                {check.status === 'pass' && (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                )}
                {check.status === 'fail' && (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
                {check.status === 'idle' && (
                  <div className="h-5 w-5 rounded-full border-2 border-white/10" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white/80">{check.label}</p>
                <p className="text-xs text-white/40">{check.description}</p>
                {check.status === 'fail' && check.error && (
                  <p className="mt-1 text-xs text-red-400">{check.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
