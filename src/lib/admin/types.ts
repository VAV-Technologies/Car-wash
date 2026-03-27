// ─── Database Table Types ────────────────────────────────────────────

export interface Customer {
  id: string
  name: string
  phone: string
  email: string | null
  address: string | null
  neighborhood: Neighborhood | null
  car_model: string | null
  plate_number: string | null
  acquisition_source: AcquisitionSource | null
  referred_by: string | null
  notes: string | null
  segment: Segment
  created_at: string
  updated_at: string
}

export interface CustomerWithStats extends Customer {
  total_services: number
  total_spent: number
  last_service_date: string | null
}

export interface Employee {
  id: string
  name: string
  phone: string
  role: EmployeeRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  customer_id: string
  tier: SubscriptionTier
  start_date: string
  end_date: string
  is_active: boolean
  washes_remaining: number
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  customer_id: string
  service_type: ServiceType
  scheduled_date: string
  scheduled_time: string
  washer_id?: string | null
  status: BookingStatus
  location_address?: string | null
  address?: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  booking_id: string | null
  customer_id: string
  employee_id: string | null
  service_type: ServiceType
  status: JobStatus
  started_at: string | null
  completed_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  customer_id: string | null
  job_id: string | null
  subscription_id: string | null
  amount: number
  type: TransactionType
  category: string | null
  description: string | null
  payment_method: PaymentMethod | null
  payment_status: PaymentStatus
  payment_confirmed_at: string | null
  payment_confirmed_by: string | null
  notes: string | null
  created_at: string
}

export interface TransactionWithCustomer extends Transaction {
  customer_name: string | null
}

export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'refunded'

export type ExpenseCategory =
  | 'salary'
  | 'bpjs'
  | 'vehicle_installment'
  | 'fuel'
  | 'vehicle_maintenance'
  | 'equipment_maintenance'
  | 'chemical_restock'
  | 'parking'
  | 'phone_data'
  | 'vehicle_tax'
  | 'power_charging'
  | 'insurance'
  | 'uniforms'
  | 'marketing'
  | 'misc'

export type MessageType =
  | 'general'
  | 'booking_request'
  | 'follow_up'
  | 'subscription_pitch'
  | 'complaint'
  | 'referral_ask'
  | 'reengagement'
  | 'receipt'

export type PitchResult = 'converted' | 'declined' | 'thinking'

export interface Conversation {
  id: string
  customer_id: string
  channel: ConversationChannel
  direction: 'inbound' | 'outbound'
  message_type: MessageType
  summary: string
  handled_by: string | null
  follow_up_due_at: string | null
  follow_up_completed: boolean
  subscription_pitched: boolean
  pitch_result: PitchResult | null
  sent_at: string
  created_at: string
}

export interface ConversationWithCustomer extends Conversation {
  customer_name: string | null
  customer_phone: string | null
}

export interface Notification {
  id: string
  customer_id: string | null
  type: NotificationType
  channel: NotificationChannel
  message: string
  sent_at: string | null
  status: 'pending' | 'sent' | 'failed'
  created_at: string
}

// ─── Enum / Union Types ─────────────────────────────────────────────

export type Neighborhood =
  | 'pondok_indah'
  | 'kebayoran_baru'
  | 'kebayoran_lama'
  | 'senayan'
  | 'permata_hijau'
  | 'simprug'
  | 'cilandak'
  | 'tb_simatupang'
  | 'kemang'
  | 'cipete'
  | 'fatmawati'
  | 'gandaria'
  | 'pesanggrahan'
  | 'bintaro'
  | 'other'

export type Segment =
  | 'new'
  | 'standard_only'
  | 'mixed'
  | 'subscriber'
  | 'vip'
  | 'churned'

export type AcquisitionSource =
  | 'instagram'
  | 'google'
  | 'referral'
  | 'walk_in'
  | 'whatsapp'
  | 'flyer'
  | 'event'
  | 'other'

export type ServiceType =
  | 'standard_wash'
  | 'professional'
  | 'elite_wash'
  | 'interior_detail'
  | 'exterior_detail'
  | 'window_detail'
  | 'tire_rims'
  | 'full_detail'

export type BookingStatus =
  | 'requested'
  | 'confirmed'
  | 'en_route'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export type JobStatus =
  | 'queued'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export type TransactionType =
  | 'revenue'
  | 'expense'
  | 'service_payment'
  | 'subscription_payment'
  | 'refund'
  | 'tip'

export type PaymentMethod =
  | 'cash'
  | 'bank_transfer'
  | 'qris'
  | 'credit_card'
  | 'gopay'
  | 'ovo'

export type SubscriptionTier =
  | 'basic'
  | 'standard'
  | 'premium'
  | 'vip'
  | 'essentials'
  | 'plus'
  | 'elite'

export type EmployeeRole =
  | 'washer'
  | 'detailer'
  | 'supervisor'
  | 'admin'
  | 'manager'

export type ConversationChannel =
  | 'whatsapp'
  | 'phone'
  | 'instagram'
  | 'in_person'
  | 'email'

export type NotificationType =
  | 'follow_up'
  | 're_engagement'
  | 'churn_warning'
  | 'booking_reminder'
  | 'subscription_expiry'
  | 'promo'

export type NotificationChannel =
  | 'whatsapp'
  | 'sms'
  | 'email'

// ─── Subscription Extended Types ────────────────────────────────────

export interface SubscriptionWithCustomer extends Subscription {
  customer_name: string
  customer_phone: string
  washes_used_this_month: number
  washes_allocated: number
  renewal_date: string
  monthly_price: number
  status: 'active' | 'paused' | 'cancelled' | 'expired'
  last_service_date: string | null
}

export interface SubscriptionStats {
  totalActive: number
  byTier: { essentials: number; plus: number; elite: number }
  totalMRR: number
}

export interface ChurnRiskSubscription extends SubscriptionWithCustomer {
  risk_reason: string
}

// ─── Extended Employee Types ────────────────────────────────────────

export type EmployeeStatus = 'active' | 'on_leave' | 'terminated'

export interface EmployeeExtended extends Employee {
  email: string | null
  hire_date: string | null
  base_salary: number
  status: EmployeeStatus
  notes: string | null
}

export interface ServiceBonusBreakdown {
  type: string
  count: number
  bonus: number
}

export interface PayslipResult {
  baseSalary: number
  serviceBreakdown: ServiceBonusBreakdown[]
  totalServiceBonus: number
  qualityBonus: number
  attendanceBonus: number
  totalComp: number
  jobCount: number
  avgRating: number
}

export interface EmployeePerformanceStats {
  jobsThisMonth: number
  avgRating: number
  upsellAttemptRate: number
  upsellConversionRate: number
}

// ─── Equipment Types ────────────────────────────────────────────────

export type EquipmentStatus = 'operational' | 'needs_maintenance' | 'out_of_service'

export interface Equipment {
  id: string
  name: string
  brand: string | null
  model: string | null
  purchase_date: string | null
  warranty_expiry: string | null
  status: EquipmentStatus
  last_maintenance_at: string | null
  next_maintenance_at: string | null
  maintenance_interval_days: number
  usage_cycles: number
  max_usage_cycles: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ─── Inventory Types ────────────────────────────────────────────────

export interface InventoryItem {
  id: string
  product_name: string
  brand: string | null
  current_qty: number
  unit: string
  min_threshold: number
  cost_per_unit: number
  last_restocked_at: string | null
  last_restocked_qty: number | null
  created_at: string
  updated_at: string
}

// ─── Filter / Query Types ───────────────────────────────────────────

export interface CustomerFiltersState {
  search: string
  neighborhood: Neighborhood | ''
  segment: Segment | ''
  acquisition_source: AcquisitionSource | ''
}

export interface CustomerQueryParams extends CustomerFiltersState {
  page: number
  limit: number
  sort_by: string
  sort_dir: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
}
