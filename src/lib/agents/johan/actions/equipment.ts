import {
  type ActionDefinition,
  type ActionResult,
  type ActionContext,
  assertUuid,
} from './_shared'

async function loadEquipment(ctx: ActionContext, id: string) {
  const { data, error } = await ctx.supabaseAdmin
    .from('equipment')
    .select('id, name, status, maintenance_interval_days, last_maintenance_at, next_maintenance_at')
    .eq('id', id)
    .maybeSingle()
  if (error) return { ok: false as const, error: error.message }
  if (!data) return { ok: false as const, error: `Equipment ${id} not found` }
  return { ok: true as const, item: data as any }
}

export const logEquipmentMaintenance: ActionDefinition = {
  name: 'log_equipment_maintenance',
  description:
    'Record that maintenance was just performed on a piece of equipment. Stamps last_maintenance_at to today, computes next_maintenance_at from maintenance_interval_days, and sets status to operational.',
  parameters: {
    type: 'object',
    additionalProperties: false,
    required: ['equipment_id'],
    properties: { equipment_id: { type: 'string', format: 'uuid' } },
  },
  risk: 'low',
  requiresConfirmation: false,
  validate: (raw: any) => ({ equipment_id: assertUuid(raw?.equipment_id, 'equipment_id') }),
  execute: async (p, ctx): Promise<ActionResult> => {
    const found = await loadEquipment(ctx, p.equipment_id)
    if (!found.ok) return { ok: false, error: found.error, recoverable: true }

    const interval = Number(found.item.maintenance_interval_days) || 30
    const today = new Date()
    const next = new Date(today)
    next.setDate(next.getDate() + interval)
    const todayStr = today.toISOString().split('T')[0]
    const nextStr = next.toISOString().split('T')[0]

    try {
      const { data, error } = await ctx.supabaseAdmin
        .from('equipment')
        .update({
          last_maintenance_at: todayStr,
          next_maintenance_at: nextStr,
          status: 'operational',
        })
        .eq('id', p.equipment_id)
        .select('id, name, last_maintenance_at, next_maintenance_at, status')
        .single()
      if (error) return { ok: false, error: error.message, recoverable: true }
      const id = (data as any).id as string
      return {
        ok: true,
        data,
        affectedIds: [id],
        message: `${found.item.name} maintained, next due ${(data as any).next_maintenance_at}`,
      }
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err), recoverable: true }
    }
  },
}
