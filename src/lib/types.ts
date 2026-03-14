export type UserRole = 'seller' | 'buyer' | 'admin';

export type VerificationStatus = 'anonymous' | 'pending_verification' | 'verified' | 'rejected';

export type BuyerType = 'Individual Investor' | 'Investment Firm' | 'Strategic Acquirer'; // Legacy
export const buyerTypes: BuyerType[] = ['Individual Investor', 'Investment Firm', 'Strategic Acquirer'];

export const BuyerPersonaTypes = [
  "Individual Investor / Entrepreneur",
  "Private Equity Firm",
  "Strategic Acquirer / Corporate Representative",
  "Family Office Representative",
  "Search Fund Principal",
  "Angel Investor",
  "Company Executive (MBI/MBO)",
  "Other"
] as const;
export type BuyerPersona = typeof BuyerPersonaTypes[number];

export const PreferredInvestmentSizes = [
  "Up to $100,000 USD",
  "$100,000 - $500,000 USD",
  "$500,000 - $2,000,000 USD",
  "$2,000,000 - $10,000,000 USD",
  "$10,000,000+ USD",
  "Flexible / Varies"
] as const;
export type PreferredInvestmentSize = typeof PreferredInvestmentSizes[number];


export type DealStructure = 'Full Acquisition' | 'Partial Sale/Investment' | 'Open to Offers';
export const dealStructures: DealStructure[] = ['Full Acquisition', 'Partial Sale/Investment', 'Open to Offers'];

export const revenueRanges = [
  "< $50K USD", "$50K - $100K USD", "$100K - $250K USD",
  "$250K - $500K USD", "$500K - $1M USD", "$1M+ USD"
];

export const askingPriceRanges = [
  "< $50K USD", "$50K - $100K USD", "$100K - $250K USD",
  "$250K - $500K USD", "$500K - $1M USD", "$1M - $2M USD",
  "$2M - $5M USD", "$5M+ USD"
];

export const profitMarginRanges = [
  "< 0% (Loss-making)", "0% - 10%", "10% - 20%",
  "20% - 30%", "30%+"
];

export const industries = [
  "Accounting & Legal",
  "Agriculture",
  "Arts & Entertainment",
  "Automotive (Sales & Repair)",
  "Banking & Finance",
  "Construction & Trades",
  "Consulting",
  "Education",
  "Energy & Mining",
  "Events & Recreation",
  "Government & Public Service",
  "Health & Wellness",
  "Hospitality (Hotels & Accommodations)",
  "Information Technology (IT)",
  "Insurance",
  "Manufacturing & Production",
  "Marketing & Advertising",
  "Media & Communications",
  "Personal Care & Services",
  "Real Estate",
  "Restaurants & Food Service",
  "Retail & E-commerce",
  "Transportation & Logistics",
  "Other"
];
export const asianCountries = ["Singapore", "Malaysia", "Indonesia", "Thailand", "Vietnam", "Philippines", "Hong Kong", "Japan", "South Korea", "India", "China", "Other"];

export type EmployeeCountRange = "Sole Operator" | "1-5" | "6-10" | "11-25" | "26-50" | "50+";
export const employeeCountRanges: EmployeeCountRange[] = ["Sole Operator", "1-5", "6-10", "11-25", "26-50", "50+"];

export const placeholderKeywords: string[] = ["SaaS", "E-commerce", "Retail", "Service", "Business", "High Growth"];


export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  country: string;
  role: UserRole;
  isEmailVerified: boolean;
  verificationStatus: VerificationStatus;
  isPaid: boolean;
  initialCompanyName?: string;
  buyerType?: BuyerType; // Legacy, prefer buyerPersonaType
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  listingCount?: number;
  inquiryCount?: number;

  // Buyer Persona Fields
  buyerPersonaType?: BuyerPersona;
  buyerPersonaOther?: string;
  investmentFocusDescription?: string;
  preferredInvestmentSize?: PreferredInvestmentSize;
  keyIndustriesOfInterest?: string;

  // Onboarding Fields
  is_onboarding_completed: boolean;
  onboarding_completed_at?: Date;
  onboarding_step_completed: number; // Changed from optional to required, defaults to 0
  submitted_documents?: Record<string, any>; // e.g. { "identity_proof_path": "path/to/id.pdf", "business_reg_path": "path/to/reg.pdf" }
}

export type ListingStatus =
  | 'active'
  | 'inactive'
  | 'pending_verification'
  | 'verified_anonymous'
  | 'verified_public'
  | 'rejected_by_admin'
  | 'closed_deal'
  // New admin workflow states
  | 'draft'                // Seller is still editing, not submitted
  | 'pending_approval'     // Submitted and waiting for admin review
  | 'under_review'         // Admin is actively reviewing
  | 'appealing_rejection'; // Seller has appealed a rejection

// Listing Verification System Types
export type ListingVerificationStatus = 'unverified' | 'verified' | 'deactivated';

export interface ListingVerificationInfo {
  status: ListingVerificationStatus;
  verifiedBy?: string;
  verifiedByName?: string;
  verifiedAt?: Date;
  notes?: string;
}

export interface Listing {
  id: string;
  sellerId: string;
  listingTitleAnonymous: string;
  industry: string;
  locationCountry: string;
  locationCityRegionGeneral: string;
  anonymousBusinessDescription: string;
  keyStrengthsAnonymous: string[];

  businessModel?: string;
  yearEstablished?: number;
  registeredBusinessName?: string;
  actualCompanyName?: string;
  fullBusinessAddress?: string;
  businessWebsiteUrl?: string;
  socialMediaLinks?: string;
  numberOfEmployees?: EmployeeCountRange;
  technologyStack?: string;

  annualRevenueRange: string;
  netProfitMarginRange?: string;
  askingPrice?: number;
  specificAnnualRevenueLastYear?: number;
  specificNetProfitLastYear?: number;
  adjustedCashFlow?: number;
  adjustedCashFlowExplanation?: string;

  dealStructureLookingFor?: string[];
  reasonForSellingAnonymous?: string;
  detailedReasonForSelling?: string;
  sellerRoleAndTimeCommitment?: string;
  postSaleTransitionSupport?: string;

  specificGrowthOpportunities?: string;

  status: ListingStatus;
  isSellerVerified: boolean;
  
  // New listing verification system (independent of seller verification)
  listingVerificationStatus?: ListingVerificationStatus;
  listingVerificationBy?: string;
  listingVerificationAt?: Date;
  listingVerificationNotes?: string;

  imageUrls?: string[];
  financialDocumentsUrl?: string;
  keyMetricsReportUrl?: string;
  ownershipDocumentsUrl?: string;
  financialSnapshotUrl?: string;
  ownershipDetailsUrl?: string;
  locationRealEstateInfoUrl?: string;
  webPresenceInfoUrl?: string;
  secureDataRoomLink?: string;

  createdAt: Date;
  updatedAt: Date;
  inquiryCount?: number;
}


export type InquiryStatusBuyerPerspective =
  | 'Inquiry Sent'
  | 'Seller Engaged - Your Verification Required'
  | 'Seller Engaged - Seller Verification Pending'
  | 'Ready for Admin Connection'
  | 'Connection Facilitated - Chat Open'
  | 'Archived';

export type InquiryStatusSellerPerspective =
  | 'New Inquiry'
  | 'You Engaged - Buyer Verification Pending'
  | 'You Engaged - Your Listing Verification Pending'
  | 'Ready for Admin Connection'
  | 'Connection Facilitated - Chat Open'
  | 'Archived';

export type InquiryStatusSystem =
  | 'new_inquiry'
  | 'seller_engaged_buyer_pending_verification'
  | 'seller_engaged_seller_pending_verification'
  | 'ready_for_admin_connection'
  | 'connection_facilitated_in_app_chat_opened'
  | 'archived';

export interface Inquiry {
  id: string;
  listingId: string;
  listingTitleAnonymous: string;
  sellerStatus?: 'Anonymous Seller' | 'Platform Verified Seller';
  buyerId: string;
  buyerName?: string;
  buyerVerificationStatus?: VerificationStatus;
  sellerId: string;
  inquiryTimestamp: Date;
  engagementTimestamp?: Date;
  status: InquiryStatusSystem;
  statusBuyerPerspective?: InquiryStatusBuyerPerspective;
  statusSellerPerspective?: InquiryStatusSellerPerspective;
  createdAt: Date;
  updatedAt: Date;
  conversationId?: string;
}

export interface AdminDashboardMetrics {
  newUserRegistrations24hSellers: number;
  newUserRegistrations24hBuyers: number;
  newUserRegistrations7dSellers: number;
  newUserRegistrations7dBuyers: number;
  newListingsCreated24h: number;
  newListingsCreated7d: number;
  totalActiveSellers: number;
  totalPaidSellers: number;
  totalFreeSellers: number;
  totalActiveBuyers: number;
  totalPaidBuyers: number;
  totalFreeBuyers: number;
  totalActiveListingsAnonymous: number;
  totalActiveListingsVerified: number;
  totalListingsAllStatuses: number;
  closedOrDeactivatedListings: number;
  buyerVerificationQueueCount: number;
  sellerVerificationQueueCount: number;
  readyToEngageQueueCount: number;
  successfulConnectionsMTD: number;
  activeSuccessfulConnections: number;
  closedSuccessfulConnections: number;
  dealsClosedMTD?: number;
  totalRevenueMTD?: number;
  revenueFromBuyers: number;
  revenueFromSellers: number;
}


export type VerificationQueueStatus = "New Request" | "Contacted" | "Docs Under Review" | "More Info Requested" | "Approved" | "Rejected";

export interface AdminNote {
  id: string;
  note: string; // Renamed from 'content' to 'note' for consistency with newNoteText
  timestamp: Date;
  operationalStatusAtTimeOfNote: VerificationQueueStatus;
  profileStatusAtTimeOfNote: VerificationStatus;
  adminId: string;
  adminName?: string;
}

export interface VerificationRequestItem {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: UserRole;
  userEmail?: string;
  userPhone?: string;
  userCountry?: string;
  isEmailVerified?: boolean;
  listingId?: string;
  listingTitle?: string;
  triggeringUserId?: string;
  reason: string;
  operationalStatus: VerificationQueueStatus;
  profileStatus: VerificationStatus;
  adminNotes?: AdminNote[];
  documentsSubmitted?: { name: string, type: 'id_proof' | 'business_reg' | 'financials' }[];
  updatedAt?: Date;

  // Contact preferences from verification form
  phoneNumber?: string;  // Alternative to userPhone for consistency
  bestTimeToCall?: string;
  userNotes?: string;  // User's additional notes/questions
}


export interface ReadyToEngageItem {
  id: string;
  timestamp: Date;
  buyerId: string;
  buyerName: string;
  buyerVerificationStatus: VerificationStatus;
  sellerId: string;
  sellerName: string;
  sellerVerificationStatus: VerificationStatus;
  listingId: string;
  listingTitle: string;
  listingVerificationStatus: ListingStatus;
}

export type NotificationType = 'inquiry' | 'verification' | 'system' | 'engagement' | 'listing_update' | 'new_message';

export interface NotificationItem {
  id: string;
  timestamp: Date;
  message: string;
  link?: string;
  isRead: boolean;
  userId: string;
  type: NotificationType;
}

// Admin Listing Management Types
export type AdminActionType = 'approved' | 'rejected' | 'status_changed' | 'appeal_reviewed' | 'notes_updated' | 'bulk_action' | 'listing_verified' | 'listing_unverified' | 'listing_verification_deactivated';

export type RejectionCategory = 'quality' | 'compliance' | 'incomplete' | 'fraud' | 'duplicate' | 'inappropriate' | 'other';

export interface AdminListingAction {
  id: string;
  listingId: string;
  adminUserId: string;
  adminName?: string;
  actionType: AdminActionType;
  previousStatus?: ListingStatus;
  newStatus?: ListingStatus;
  reasonCategory?: RejectionCategory;
  adminNotes?: string;
  createdAt: Date;
}

export type AppealStatus = 'pending' | 'under_review' | 'approved' | 'denied' | 'withdrawn';

export interface ListingAppeal {
  id: string;
  listingId: string;
  sellerId: string;
  originalRejectionReason?: string;
  originalRejectionCategory?: RejectionCategory;
  appealMessage: string;
  status: AppealStatus;
  adminResponse?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  createdAt: Date;
  reviewedAt?: Date;
}

export interface AdminListingWithContext {
  listing: Listing & {
    adminNotes?: string;
    adminActionBy?: string;
    adminActionAt?: Date;
    rejectionCategory?: RejectionCategory;
    // Listing verification fields for admin context
    listingVerificationStatus?: ListingVerificationStatus;
    listingVerificationBy?: string;
    listingVerificationAt?: Date;
    listingVerificationNotes?: string;
  };
  seller: {
    id: string;
    fullName: string;
    email: string;
    verificationStatus: VerificationStatus;
    isPaid: boolean;
    createdAt: Date;
  };
  adminHistory: AdminListingAction[];
  appeal?: ListingAppeal;
}

export type ConversationStatus = 'ACTIVE' | 'ARCHIVED_BY_ADMIN' | 'CLOSED_BY_PARTICIPANT';

export interface Conversation {
  conversationId: string;
  inquiryId: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageSnippet?: string;
  buyerUnreadCount?: number;
  sellerUnreadCount?: number;
  status: ConversationStatus;
}

export interface Message {
  messageId: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  contentText: string;
  timestamp: Date;
  isRead: boolean;
  attachmentUrl?: string;
  attachmentType?: string;
}

// Added for onboarding document tracking
export interface OnboardingDocument {
  id: string;
  user_id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type?: string;
  uploaded_at: Date;
  metadata?: Record<string, any>;
}

// Universal Sync System Observability Types
export interface SyncPerformanceMetrics {
  averageProcessingTimeMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  totalOperationsLastHour: number;
  errorRatePercent: number;
}

export interface SyncCachePerformance {
  hitRatioPercent: number;
  totalEntries: number;
  averageEntrySizeBytes?: number;
  readThroughputPerSecond?: number;
}

export interface CircuitBreakerInfo {
  name: string;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failures: number;
  lastFailureAt: string | null;
}

export interface SyncCircuitBreakerStatus {
  circuitBreakers: CircuitBreakerInfo[];
}

export interface SyncAlertItem {
  id: string;
  ruleName: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  triggeredAt: string;
  details: string;
  resolvedAt?: string | null;
}

export interface SyncAlertsSummary {
  activeCriticalAlerts: number;
  activeHighAlerts: number;
  recentAlerts: SyncAlertItem[];
}
