'use client';

import { useState, useEffect, useRef } from 'react';
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
  FileText,
  Upload,
  Trash2,
  X,
  File,
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

interface KnowledgeFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

const DEFAULT_PROMPT = `You are Shera, the friendly customer service agent for Castudio — a premium mobile car wash and detailing service in Jakarta Selatan, Indonesia.

Personality:
- Warm, professional, and helpful
- Use the customer's language (Bahasa Indonesia or English — match what they write in)
- Keep messages concise and clear — this is WhatsApp, not email
- Use emojis sparingly but naturally (✅, 📋, 🚗, 👋)
- Address customers politely (Pak/Bu in Indonesian, or by name)

Services & Pricing:
- Standard Wash — Rp 349.000 (60-90 menit)
- Professional Wash — Rp 649.000 (2-2.5 jam)
- Elite Wash — Rp 949.000 (3-3.5 jam)
- Interior Detail — Rp 1.039.000 (4 jam)
- Exterior Detail — Rp 1.039.000 (5 jam)
- Window Detail — Rp 689.000 (2 jam)
- Tire & Rims — Rp 289.000 (1.5 jam)
- Full Detail — Rp 2.799.000 (8 jam)

Subscriptions:
- Essentials — Rp 339.000/bulan (4x Standard Wash)
- Plus — Rp 449.000/bulan (4x Professional Wash)
- Elite — Rp 1.000.000/bulan (4x Professional + 2x Elite Wash)

Service Area: Jakarta Selatan neighborhoods including Pondok Indah, Kebayoran, Senayan, Permata Hijau, Kemang, Cipete, Cilandak, and surrounding areas.

What you CAN do:
- Answer questions about services, pricing, and service area
- Help customers book a new service
- Check existing bookings
- Reschedule bookings (change date/time)
- Cancel bookings
- Look up customer info by phone number

What you CANNOT do:
- Process payments (direct them to transfer or payment link)
- Handle complaints about service quality (say you'll connect them with the team)
- Give discounts or negotiate prices
- Access data outside of Castudio

Booking flow:
1. Greet the customer
2. If new: ask for name, phone, car model, plate number, neighborhood
3. Ask which service they want
4. Ask preferred date and time (Mon-Sat, 8AM-5PM)
5. Create the booking and confirm details
6. If existing customer: skip to service selection

Important rules:
- Always confirm booking details before creating
- If a date/time seems full, suggest alternatives
- Operating hours: Monday-Saturday, 8:00 AM - 5:00 PM
- No service on Sundays
- Minimum 2 hours notice for same-day bookings`;

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

  // Section C: Prompt editing state
  const [localPrompt, setLocalPrompt] = useState(DEFAULT_PROMPT);
  const [promptSaving, setPromptSaving] = useState(false);
  const [promptSaved, setPromptSaved] = useState(false);

  // Section E: Knowledge Base state
  const [knowledgeFiles, setKnowledgeFiles] = useState<KnowledgeFile[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [loadingKnowledge, setLoadingKnowledge] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
    loadKnowledgeFiles();
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
        setLocalPrompt(data.system_prompt || DEFAULT_PROMPT);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadKnowledgeFiles() {
    try {
      setLoadingKnowledge(true);
      const res = await fetch('/api/admin/whatsapp?action=list-knowledge');
      if (res.ok) {
        const data = await res.json();
        setKnowledgeFiles(data);
      }
    } catch (err) {
      console.error('Failed to load knowledge files:', err);
    } finally {
      setLoadingKnowledge(false);
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

  async function savePrompt() {
    setPromptSaving(true);
    try {
      const res = await fetch('/api/admin/whatsapp?action=save-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system_prompt: localPrompt }),
      });
      if (res.ok) {
        setSettings((prev) => ({ ...prev, system_prompt: localPrompt }));
        setPromptSaved(true);
        setTimeout(() => setPromptSaved(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save prompt:', err);
    } finally {
      setPromptSaving(false);
    }
  }

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingFiles(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        await fetch('/api/admin/whatsapp?action=upload-knowledge', {
          method: 'POST',
          body: formData,
        });
      }
      await loadKnowledgeFiles();
    } catch (err) {
      console.error('Failed to upload files:', err);
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function deleteKnowledgeFile(id: string) {
    try {
      await fetch(`/api/admin/whatsapp?action=delete-knowledge&id=${id}`, {
        method: 'DELETE',
      });
      setKnowledgeFiles((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error('Failed to delete knowledge file:', err);
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  function getTypeBadge(fileType: string): string {
    const ext = fileType.toUpperCase().replace('.', '');
    if (['TXT', 'MD', 'PDF', 'DOCX'].includes(ext)) return ext;
    return ext || 'FILE';
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

      {/* Section C: Agent Configuration */}
      <div className="rounded-xl border border-white/10 bg-[#171717] p-6">
        <div className="mb-1 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10">
            <Bot className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Agent Configuration</h3>
            <p className="text-sm text-white/40">
              Customize Shera&apos;s personality, knowledge, and behavior
            </p>
          </div>
        </div>

        {/* System Prompt */}
        <div className="mt-6">
          <h4 className="mb-2 text-sm font-medium text-white/70">System Prompt</h4>

          {promptSaved && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400">Prompt saved</span>
            </div>
          )}

          <textarea
            rows={16}
            value={localPrompt}
            onChange={(e) => setLocalPrompt(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#0f0f0f] p-4 font-mono text-xs leading-relaxed text-white/80 outline-none transition focus:border-orange-500/50"
          />
          <p className="mt-1 text-xs text-white/30">{localPrompt.length} characters</p>

          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={savePrompt}
              disabled={promptSaving}
              className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600 disabled:opacity-50"
            >
              {promptSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                'Save Prompt'
              )}
            </button>
            <button
              onClick={() => setLocalPrompt(DEFAULT_PROMPT)}
              className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white/50 transition hover:border-white/20 hover:text-white"
            >
              Reset to Default
            </button>
          </div>
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

      {/* Section E: Knowledge Base */}
      <div className="rounded-xl border border-white/10 bg-[#171717] p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10">
            <FileText className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Knowledge Base</h3>
            <p className="text-sm text-white/40">
              Upload reference documents that Shera uses as context in every conversation
            </p>
          </div>
        </div>

        {/* Upload area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="mb-6 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-white/10 bg-[#0f0f0f] px-6 py-10 transition hover:border-orange-500/30 hover:bg-[#0f0f0f]/80"
        >
          {uploadingFiles ? (
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          ) : (
            <Upload className="h-8 w-8 text-white/30" />
          )}
          <div className="text-center">
            <p className="text-sm font-medium text-white/70">
              {uploadingFiles ? 'Uploading...' : 'Click to upload documents'}
            </p>
            <p className="mt-1 text-xs text-white/30">
              Supports .txt, .md, .pdf, .docx
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.md,.pdf,.docx"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
        </div>

        {/* File list */}
        {loadingKnowledge ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
            <span className="ml-2 text-sm text-white/50">Loading documents...</span>
          </div>
        ) : knowledgeFiles.length === 0 ? (
          <div className="rounded-lg border border-white/5 bg-[#0f0f0f] px-4 py-8 text-center">
            <File className="mx-auto h-8 w-8 text-white/20" />
            <p className="mt-2 text-sm text-white/40">
              No documents uploaded. Upload reference files to give Shera additional context.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {knowledgeFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-[#0f0f0f] px-4 py-3"
              >
                <FileText className="h-5 w-5 flex-shrink-0 text-white/40" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white/80">{file.file_name}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-white/40">
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white/60">
                      {getTypeBadge(file.file_type)}
                    </span>
                    <span>{formatFileSize(file.file_size)}</span>
                    <span>&middot;</span>
                    <span>{new Date(file.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteKnowledgeFile(file.id)}
                  className="flex-shrink-0 rounded-lg p-2 text-white/30 transition hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
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
