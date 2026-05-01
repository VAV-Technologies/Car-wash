import {
  type ActionDefinition,
  type ActionResult,
  type ActionContext,
  assertUuid,
  assertEnum,
} from './_shared'

// Real DB enum: 'active' | 'on_leave' | 'terminated'
// We expose 'inactive' as a synonym for 'terminated' since "inactive" is more common in chat.
const EMPLOYEE_INPUT_STATUSES = ['active', 'inactive', 'on_leave', 'terminated'] as const

function normaliseStatus(s: string): 'active' | 'on_leave' | 'terminated' {
  if (s === 'inactive') return 'terminated'
  return s as 'active' | 'on_leave' | 'terminated'
}

async function loadEmployee(ctx: ActionContext, id: string) {
  const { data, error } = await ctx.supabaseAdmin
    .from('employees')
    .select('id, name, role, status')
    .eq('id', id)
    .maybeSingle()
  if (error) return { ok: false as const, error: error.message }
  if (!data) return { ok: false as const, error: `Employee ${id} not found` }
  return { ok: true as const, employee: data as any }
}

export const updateEmployeeStatus: ActionDefinition = {
  name: 'update_employee_status',
  description:
    "Change an employee's availability status. active = working / can be assigned, on_leave = temporarily unavailable (no auto-assign), terminated/inactive = no longer with the team.",
  parameters: {
    type: 'object',
    additionalProperties: false,
    required: ['employee_id', 'status'],
    properties: {
      employee_id: { type: 'string', format: 'uuid' },
      status: { type: 'string', enum: EMPLOYEE_INPUT_STATUSES as unknown as string[] },
    },
  },
  risk: 'medium',
  requiresConfirmation: true,
  validate: (raw: any) => ({
    employee_id: assertUuid(raw?.employee_id, 'employee_id'),
    status: normaliseStatus(assertEnum(raw?.status, EMPLOYEE_INPUT_STATUSES, 'status')),
  }),
  execute: async (p, ctx): Promise<ActionResult> => {
    const found = await loadEmployee(ctx, p.employee_id)
    if (!found.ok) return { ok: false, error: found.error, recoverable: true }
    try {
      const { data, error } = await ctx.supabaseAdmin
        .from('employees')
        .update({ status: p.status })
        .eq('id', p.employee_id)
        .select('id, name, status')
        .single()
      if (error) return { ok: false, error: error.message, recoverable: true }
      const id = (data as any).id as string
      return {
        ok: true,
        data,
        affectedIds: [id],
        message: `${found.employee.name} status → ${p.status}`,
      }
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err), recoverable: true }
    }
  },
}
