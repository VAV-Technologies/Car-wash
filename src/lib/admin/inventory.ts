import { supabase } from '@/lib/supabase'
import type { InventoryItem } from './types'

// ─── Get All Inventory Items ──────────────────────────────────────────

export async function getInventoryItems(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .order('product_name', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch inventory: ${error.message}`)
  }

  return (data ?? []) as InventoryItem[]
}

// ─── Update Inventory Item ────────────────────────────────────────────

export async function updateInventoryItem(
  id: string,
  data: Partial<Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>>
): Promise<InventoryItem> {
  const { data: updated, error } = await supabase
    .from('inventory')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update inventory item: ${error.message}`)
  }

  return updated as InventoryItem
}

// ─── Restock Item ─────────────────────────────────────────────────────

export async function restockItem(
  id: string,
  qty: number
): Promise<InventoryItem> {
  // First get current qty
  const { data: current, error: fetchError } = await supabase
    .from('inventory')
    .select('current_qty')
    .eq('id', id)
    .single()

  if (fetchError) {
    throw new Error(`Failed to fetch item: ${fetchError.message}`)
  }

  const newQty = (current?.current_qty ?? 0) + qty

  const { data: updated, error } = await supabase
    .from('inventory')
    .update({
      current_qty: newQty,
      last_restocked_at: new Date().toISOString(),
      last_restocked_qty: qty,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to restock item: ${error.message}`)
  }

  return updated as InventoryItem
}

// ─── Delete Inventory Item ────────────────────────────────────────────

export async function deleteInventoryItem(id: string): Promise<void> {
  const { error } = await supabase.from('inventory').delete().eq('id', id)
  if (error) throw new Error(`Failed to delete inventory item: ${error.message}`)
}

// ─── Low Stock Items ──────────────────────────────────────────────────

export async function getLowStockItems(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .order('product_name', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch inventory: ${error.message}`)
  }

  return ((data ?? []) as InventoryItem[]).filter(
    (item) => item.current_qty < item.min_threshold
  )
}

// ─── Critical Stock Items ─────────────────────────────────────────────

export async function getCriticalStockItems(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .order('product_name', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch inventory: ${error.message}`)
  }

  return ((data ?? []) as InventoryItem[]).filter(
    (item) => item.current_qty < item.min_threshold * 0.5
  )
}

// ─── Chemical Templates per Service Type (spec section 3.4) ─────────

export const CHEMICAL_TEMPLATES: Record<string, Record<string, number>> = {
  standard_wash: {
    car_shampoo_ml: 30,
    snow_foam_ml: 50,
    apc_ml: 20,
    glass_cleaner_ml: 10,
    tire_dressing_ml: 10,
    quick_detailer_ml: 15,
    microfiber_towels_pcs: 3,
    water_liters: 80,
  },
  professional: {
    car_shampoo_ml: 40,
    snow_foam_ml: 60,
    apc_ml: 30,
    iron_remover_ml: 15,
    glass_cleaner_ml: 15,
    tire_dressing_ml: 15,
    quick_detailer_ml: 20,
    paint_sealant_ml: 10,
    microfiber_towels_pcs: 5,
    water_liters: 100,
  },
  elite_wash: {
    car_shampoo_ml: 40,
    snow_foam_ml: 60,
    apc_ml: 40,
    iron_remover_ml: 20,
    tar_remover_ml: 10,
    glass_cleaner_ml: 20,
    glass_coating_ml: 5,
    tire_dressing_ml: 20,
    quick_detailer_ml: 25,
    paint_sealant_ml: 15,
    microfiber_towels_pcs: 6,
    water_liters: 120,
  },
  interior_detail: {
    apc_ml: 60,
    glass_cleaner_ml: 20,
    leather_conditioner_ml: 30,
    fabric_cleaner_ml: 40,
    odor_eliminator_ml: 15,
    quick_detailer_ml: 10,
    microfiber_towels_pcs: 8,
    water_liters: 40,
  },
  exterior_detail: {
    car_shampoo_ml: 40,
    snow_foam_ml: 60,
    apc_ml: 30,
    iron_remover_ml: 25,
    tar_remover_ml: 15,
    clay_bar_g: 20,
    compound_ml: 30,
    polish_ml: 30,
    paint_sealant_ml: 20,
    glass_cleaner_ml: 15,
    tire_dressing_ml: 15,
    microfiber_towels_pcs: 10,
    water_liters: 120,
  },
  window_detail: {
    glass_cleaner_ml: 50,
    glass_coating_ml: 15,
    iron_remover_ml: 10,
    microfiber_towels_pcs: 4,
    water_liters: 20,
  },
  tire_rims: {
    apc_ml: 40,
    iron_remover_ml: 20,
    tire_dressing_ml: 30,
    microfiber_towels_pcs: 3,
    water_liters: 30,
  },
  full_detail: {
    car_shampoo_ml: 50,
    snow_foam_ml: 70,
    apc_ml: 80,
    iron_remover_ml: 30,
    tar_remover_ml: 20,
    clay_bar_g: 30,
    compound_ml: 40,
    polish_ml: 40,
    paint_sealant_ml: 25,
    glass_cleaner_ml: 30,
    glass_coating_ml: 10,
    tire_dressing_ml: 25,
    quick_detailer_ml: 30,
    leather_conditioner_ml: 30,
    fabric_cleaner_ml: 40,
    odor_eliminator_ml: 15,
    microfiber_towels_pcs: 15,
    water_liters: 160,
  },
}

// ─── Map chemical keys to inventory product names ───────────────────

export const CHEMICAL_TO_PRODUCT: Record<string, string> = {
  car_shampoo_ml: 'Car Shampoo',
  snow_foam_ml: 'Snow Foam Concentrate',
  apc_ml: 'All-Purpose Cleaner',
  iron_remover_ml: 'Iron Remover',
  tar_remover_ml: 'Tar Remover',
  glass_cleaner_ml: 'Glass Cleaner',
  glass_coating_ml: 'Glass Coating',
  tire_dressing_ml: 'Tire Dressing',
  quick_detailer_ml: 'Quick Detailer',
  paint_sealant_ml: 'Paint Sealant',
  leather_conditioner_ml: 'Leather Conditioner',
  fabric_cleaner_ml: 'Fabric Cleaner',
  odor_eliminator_ml: 'Odor Eliminator',
  clay_bar_g: 'Clay Bar',
  compound_ml: 'Compound',
  polish_ml: 'Polish',
  microfiber_towels_pcs: 'Microfiber Towels',
  water_liters: 'Water',
}

// ─── Deduct Chemicals After Job Completion ──────────────────────────

export async function deductChemicals(jobId: string): Promise<{
  deducted: { product: string; amount: number }[]
  alerts: string[]
}> {
  // 1. Fetch job with chemicals_used
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('id, service_type, chemicals_used')
    .eq('id', jobId)
    .single()

  if (jobError || !job) {
    throw new Error(`Failed to fetch job: ${jobError?.message ?? 'Not found'}`)
  }

  // Use chemicals_used from job if available, otherwise fall back to template
  const chemicals: Record<string, number> =
    (job.chemicals_used as Record<string, number> | null) ??
    CHEMICAL_TEMPLATES[job.service_type] ??
    {}

  const deducted: { product: string; amount: number }[] = []
  const alerts: string[] = []

  // 2. For each chemical, find matching inventory item and decrement
  for (const [chemicalKey, amount] of Object.entries(chemicals)) {
    const productName = CHEMICAL_TO_PRODUCT[chemicalKey]
    if (!productName) continue

    // Find inventory item by product_name
    const { data: item, error: itemError } = await supabase
      .from('inventory')
      .select('id, product_name, current_qty, min_threshold')
      .eq('product_name', productName)
      .single()

    if (itemError || !item) continue

    const newQty = Math.max(0, item.current_qty - amount)

    // 3. Decrement current_qty
    await supabase
      .from('inventory')
      .update({
        current_qty: newQty,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id)

    deducted.push({ product: productName, amount })

    // 4. If below threshold, create notification
    if (newQty < item.min_threshold) {
      const message =
        newQty === 0
          ? `${productName} is OUT OF STOCK. Restock immediately.`
          : `${productName} is below minimum threshold (${newQty} remaining, min: ${item.min_threshold}).`

      await supabase.from('notifications').insert({
        type: 'follow_up',
        channel: 'whatsapp',
        message,
        status: 'pending',
        created_at: new Date().toISOString(),
      })

      alerts.push(message)
    }
  }

  return { deducted, alerts }
}

// ─── Get Default Chemicals for a Service Type ───────────────────────

export function getDefaultChemicals(serviceType: string): Record<string, number> {
  return CHEMICAL_TEMPLATES[serviceType] ?? {}
}
