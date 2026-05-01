import type { ChatCompletionTool } from 'openai/resources/chat/completions'
import type { ActionDefinition } from './_shared'
import * as bookings from './bookings'
import * as customers from './customers'
import * as subscriptions from './subscriptions'
import * as conversations from './conversations'
import * as finance from './finance'
import * as inventory from './inventory'
import * as equipment from './equipment'
import * as team from './team'

const ALL_ACTIONS: ActionDefinition[] = [
  // Phase 1 — Bookings
  bookings.createBooking,
  bookings.rescheduleBooking,
  bookings.changeBookingService,
  bookings.reassignWasher,
  bookings.updateBookingNotes,
  bookings.cancelBooking,
  bookings.markBookingNoShow,
  bookings.markBookingCompleted,
  // Phase 2 — Customers
  customers.createCustomer,
  customers.updateCustomerProfile,
  customers.changeCustomerSegment,
  // Phase 2 — Subscriptions
  subscriptions.createSubscription,
  subscriptions.updateSubscriptionStatus,
  subscriptions.extendSubscription,
  // Phase 2 — Conversations
  conversations.logConversation,
  conversations.completeFollowUp,
  // Phase 3 — Finance
  finance.recordTransaction,
  finance.confirmPayment,
  finance.markPaymentFailed,
  // Phase 3 — Inventory
  inventory.restockInventory,
  inventory.updateInventoryThreshold,
  // Phase 3 — Equipment
  equipment.logEquipmentMaintenance,
  // Phase 3 — Team
  team.updateEmployeeStatus,
]

const ACTION_MAP = new Map<string, ActionDefinition>(
  ALL_ACTIONS.map((a) => [a.name, a]),
)

export function getAction(name: string): ActionDefinition | undefined {
  return ACTION_MAP.get(name)
}

export function listActions(): ActionDefinition[] {
  return ALL_ACTIONS.slice()
}

const PROPOSE_ACTION_TOOL: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'propose_action',
    description:
      "Stage a destructive or medium/high-risk action for the team to confirm with a Yes/No button. Use this BEFORE calling reschedule_booking, cancel_booking, change_booking_service, mark_booking_no_show, change_customer_segment, update_subscription_status, extend_subscription, large transactions, or any action whose risk is medium or high. The team will see a confirmation card. Only after you receive a system note saying 'User confirmed pending action <id>' may you call the real tool. Always include a clear, front-loaded human_summary of what will change (e.g. 'CANCEL booking 88a3...e1 for kak Andi on Sat 10am').",
    parameters: {
      type: 'object',
      additionalProperties: false,
      required: ['tool_name', 'params', 'human_summary'],
      properties: {
        tool_name: { type: 'string', description: 'Name of the tool to stage (e.g. cancel_booking)' },
        params: {
          type: 'object',
          additionalProperties: true,
          description: 'Exact params you would pass to the staged tool',
        },
        human_summary: {
          type: 'string',
          description: 'Concise, front-loaded summary the team will see. Lead with the verb and the target. Example: "CANCEL booking 88a3...e1 for kak Andi on Sat 10am — reason: customer sick".',
        },
      },
    },
  },
}

function isWritesEnabled(): boolean {
  return process.env.JOHAN_WRITE_ENABLED === 'true'
}

export function getActionToolSpecs(): ChatCompletionTool[] {
  if (!isWritesEnabled()) return []
  const specs: ChatCompletionTool[] = ALL_ACTIONS.map((a) => ({
    type: 'function',
    function: {
      name: a.name,
      description: a.description,
      parameters: a.parameters,
    },
  }))
  specs.push(PROPOSE_ACTION_TOOL)
  return specs
}
