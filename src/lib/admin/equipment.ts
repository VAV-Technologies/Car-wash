import { supabase } from '@/lib/supabase'
import type { Equipment } from './types'

// ─── Get All Equipment ──────────────────────────────────────────────

export async function getEquipment(): Promise<Equipment[]> {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .order('name')

  if (error) {
    throw new Error(`Failed to fetch equipment: ${error.message}`)
  }

  return (data ?? []) as Equipment[]
}

// ─── Get Single Equipment ───────────────────────────────────────────

export async function getEquipmentById(id: string): Promise<Equipment | null> {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch equipment: ${error.message}`)
  }

  return data as Equipment
}

// ─── Update Equipment ───────────────────────────────────────────────

export async function updateEquipment(
  id: string,
  data: Partial<Omit<Equipment, 'id' | 'created_at' | 'updated_at'>>
): Promise<Equipment> {
  const { data: updated, error } = await supabase
    .from('equipment')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update equipment: ${error.message}`)
  }

  return updated as Equipment
}

// ─── Log Maintenance ────────────────────────────────────────────────

export async function logMaintenance(id: string): Promise<Equipment> {
  // First get the item to read maintenance_interval_days
  const item = await getEquipmentById(id)
  if (!item) throw new Error('Equipment not found')

  const today = new Date()
  const nextDate = new Date(today)
  nextDate.setDate(nextDate.getDate() + item.maintenance_interval_days)

  const { data: updated, error } = await supabase
    .from('equipment')
    .update({
      last_maintenance_at: today.toISOString().split('T')[0],
      next_maintenance_at: nextDate.toISOString().split('T')[0],
      status: 'operational',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to log maintenance: ${error.message}`)
  }

  return updated as Equipment
}

// ─── Get Maintenance Due ────────────────────────────────────────────

export async function getMaintenanceDue(): Promise<Equipment[]> {
  const today = new Date()
  const weekFromNow = new Date(today)
  weekFromNow.setDate(weekFromNow.getDate() + 7)
  const weekStr = weekFromNow.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .or(`next_maintenance_at.lte.${weekStr},status.eq.needs_maintenance`)
    .order('next_maintenance_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch maintenance due: ${error.message}`)
  }

  return (data ?? []) as Equipment[]
}

// ─── Increment Usage Cycles ─────────────────────────────────────────

export async function incrementUsageCycles(
  id: string,
  count: number
): Promise<Equipment> {
  const item = await getEquipmentById(id)
  if (!item) throw new Error('Equipment not found')

  const newCycles = item.usage_cycles + count

  const { data: updated, error } = await supabase
    .from('equipment')
    .update({
      usage_cycles: newCycles,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update usage cycles: ${error.message}`)
  }

  return updated as Equipment
}
