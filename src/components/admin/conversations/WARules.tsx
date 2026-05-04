'use client'

import AgentRulesEditor from '@/components/admin/agents/AgentRulesEditor'

export default function WARules() {
  return (
    <AgentRulesEditor
      agentName="shera"
      displayName="Shera"
      description="Rules you add here get injected into Shera's context on every message. Use them to override behavior, add constraints, or give specific instructions."
      contentPlaceholder="Rule content — be specific about what Shera should or shouldn't do..."
    />
  )
}
