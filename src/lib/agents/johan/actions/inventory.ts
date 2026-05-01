import {
  restockItem as adminRestockItem,
  updateInventoryItem as adminUpdateInventoryItem,
} from '@/lib/admin/inventory'
import {
  type ActionDefinition,
  type ActionResult,
  type ActionContext,
  assertUuid,
} from './_shared'

async function loadInventoryItem(ctx: ActionContext, id: string) {
  const { data, error } = await ctx.supabaseAdmin
    .from('inventory')
    .select('id, product_name, current_qty, min_threshold, unit')
    .eq('id', id)
    .maybeSingle()
  if (error) return { ok: false as const, error: error.message }
  if (!data) return { ok: false as const, error: `Inventory item ${id} not found` }
  return { ok: true as const, item: data as any }
}

export const restockInventory: ActionDefinition = {
  name: 'restock_inventory',
  description:
    'Add stock to an inventory item after a purchase or replenishment. Pass the item UUID and the quantity added (positive number). Stamps last_restocked_at automatically.',
  parameters: {
    type: 'object',
    additionalProperties: false,
    required: ['inventory_id', 'qty'],
    properties: {
      inventory_id: { type: 'string', format: 'uuid' },
      qty: { type: 'number', minimum: 0.01, description: 'Quantity to add (in the item\'s unit)' },
    },
  },
  risk: 'low',
  requiresConfirmation: false,
  validate: (raw: any) => {
    const qty = Number(raw?.qty)
    if (!Number.isFinite(qty) || qty <= 0) throw new Error('qty must be a positive number')
    return {
      inventory_id: assertUuid(raw?.inventory_id, 'inventory_id'),
      qty: Math.round(qty * 1000) / 1000,
    }
  },
  execute: async (p, ctx): Promise<ActionResult> => {
    const found = await loadInventoryItem(ctx, p.inventory_id)
    if (!found.ok) return { ok: false, error: found.error, recoverable: true }
    try {
      const updated = await adminRestockItem(p.inventory_id, p.qty)
      return {
        ok: true,
        data: updated,
        affectedIds: [(updated as any).id],
        message: `Restocked ${found.item.product_name} +${p.qty}${found.item.unit ? ' ' + found.item.unit : ''} → ${(updated as any).current_qty}`,
      }
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err), recoverable: true }
    }
  },
}

export const updateInventoryThreshold: ActionDefinition = {
  name: 'update_inventory_threshold',
  description:
    'Change an inventory item\'s low-stock threshold (the qty at which the system flags it for reorder). Higher threshold = warned earlier.',
  parameters: {
    type: 'object',
    additionalProperties: false,
    required: ['inventory_id', 'min_threshold'],
    properties: {
      inventory_id: { type: 'string', format: 'uuid' },
      min_threshold: { type: 'number', minimum: 0 },
    },
  },
  risk: 'low',
  requiresConfirmation: false,
  validate: (raw: any) => {
    const threshold = Number(raw?.min_threshold)
    if (!Number.isFinite(threshold) || threshold < 0) throw new Error('min_threshold must be a non-negative number')
    return {
      inventory_id: assertUuid(raw?.inventory_id, 'inventory_id'),
      min_threshold: Math.round(threshold * 1000) / 1000,
    }
  },
  execute: async (p, ctx): Promise<ActionResult> => {
    const found = await loadInventoryItem(ctx, p.inventory_id)
    if (!found.ok) return { ok: false, error: found.error, recoverable: true }
    try {
      const updated = await adminUpdateInventoryItem(p.inventory_id, { min_threshold: p.min_threshold } as any)
      return {
        ok: true,
        data: updated,
        affectedIds: [(updated as any).id],
        message: `${found.item.product_name} threshold → ${p.min_threshold}`,
      }
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err), recoverable: true }
    }
  },
}
