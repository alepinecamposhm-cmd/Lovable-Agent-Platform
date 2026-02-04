// ============ CORE ENTITIES ============

export interface Agent {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  licenseNumber?: string;
  licenseState?: string;
  licenseExpiry?: Date;
  bio?: string;
  specialties: AgentSpecialty[];
  zones: Zone[];
  languages: string[];
  teamId?: string;
  role: TeamRole;
  status: AgentStatus;
  profileCompletion: number;
  createdAt: Date;
  updatedAt: Date;
}

export type AgentSpecialty = 
  | 'residential_buy'
  | 'residential_sell'
  | 'residential_rent'
  | 'commercial'
  | 'luxury'
  | 'first_time_buyer'
  | 'investment'
  | 'relocation';

export type AgentStatus = 'active' | 'paused' | 'pending_verification' | 'suspended';

export interface Zone {
  id: string;
  name: string;
  type: 'zip' | 'city' | 'neighborhood' | 'polygon';
}

// ============ TEAM ============

export interface Team {
  id: string;
  name: string;
  logoUrl?: string;
  ownerId: string;
  members: TeamMember[];
  createdAt: Date;
}

export interface TeamMember {
  agentId: string;
  role: TeamRole;
  joinedAt: Date;
  invitedBy: string;
}

export type TeamRole = 'owner' | 'admin' | 'broker' | 'agent' | 'assistant';

// ============ LEADS ============

export interface Lead {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  stage: LeadStage;
  score?: number;
  temperature: 'cold' | 'warm' | 'hot';
  assignedTo: string;
  teamId?: string;
  source: LeadSource;
  sourceDetails?: string;
  interestedIn: 'buy' | 'sell' | 'rent';
  propertyType?: string;
  zip?: string;
  priceBucket?: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredZones?: string[];
  notes?: string;
  tags?: string[];
  assignedAt?: Date;
  acceptedAt?: Date;
  lastContactedAt?: Date;
  lastActivityAt?: Date;
  nextFollowUpAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  closeReason?: CloseReason;
}

export type LeadStage = 
  | 'new'
  | 'contacted'
  | 'appointment_set'
  | 'toured'
  | 'closed'
  | 'closed_lost';

export type LeadSource = 
  | 'marketplace'
  | 'referral'
  | 'manual'
  | 'website'
  | 'social'
  | 'integration';

export type CloseReason = 
  | 'deal_closed'
  | 'lost_to_competitor'
  | 'not_ready'
  | 'unresponsive'
  | 'budget_mismatch'
  | 'other';

export interface LeadActivity {
  id: string;
  leadId: string;
  type: LeadActivityType;
  description: string;
  metadata?: Record<string, unknown>;
  createdBy: string;
  createdAt: Date;
}

export type LeadActivityType = 
  | 'stage_change'
  | 'note_added'
  | 'message_sent'
  | 'message_received'
  | 'call_made'
  | 'appointment_scheduled'
  | 'appointment_completed'
  | 'assignment_changed'
  | 'property_viewed';

// ============ CONTACTS ============

export interface Contact {
  id: string;
  firstName: string;
  lastName?: string;
  emails?: string[];
  phones?: string[];
  linkedLeadIds?: string[];
  tags?: string[];
  notes?: string;
  mergedWith?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============ CONVERSATIONS ============

export interface Conversation {
  id: string;
  leadId: string;
  lead?: Lead;
  lastMessage?: Message;
  unreadCount: number;
  status: ConversationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ConversationStatus = 'active' | 'archived' | 'blocked';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'agent' | 'lead';
  content: string;
  contentType: 'text' | 'image' | 'file' | 'internal_note';
  attachments?: Attachment[];
  status: MessageStatus;
  createdAt: Date;
  readAt?: Date;
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Attachment {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

// ============ APPOINTMENTS ============

export interface Appointment {
  id: string;
  leadId: string;
  lead?: Lead;
  agentId: string;
  listingId?: string;
  listing?: Listing;
  type: AppointmentType;
  status: AppointmentStatus;
  scheduledAt: Date;
  duration: number;
  location?: string;
  virtualLink?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export type AppointmentType = 'showing' | 'consultation' | 'listing_presentation' | 'closing' | 'open_house';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

// ============ LISTINGS ============

export interface Listing {
  id: string;
  agentId: string;
  teamId?: string;
  address: Address;
  propertyType: PropertyType;
  listingType: 'sale' | 'rent';
  price: number;
  currency: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  yearBuilt?: number;
  amenities: string[];
  description: string;
  media: ListingMedia[];
  virtualTourUrl?: string;
  status: ListingStatus;
  archivedFromStatus?: ListingStatus;
  verificationStatus: VerificationStatus;
  verificationSubmittedAt?: Date;
  verificationDocs?: VerificationDoc[];
  verificationReviewNote?: string;
  viewCount: number;
  saveCount: number;
  inquiryCount: number;
  listedAt?: Date;
  expiresAt?: Date;
  soldAt?: Date;
  closedPrice?: number;
  closedBuyerName?: string;
  featuredUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  lat?: number;
  lng?: number;
}

export type PropertyType = 
  | 'house'
  | 'apartment'
  | 'condo'
  | 'townhouse'
  | 'land'
  | 'commercial'
  | 'multi_family';

export type ListingStatus = 'draft' | 'active' | 'paused' | 'sold' | 'rented' | 'expired' | 'archived';
export type VerificationStatus = 'none' | 'pending' | 'verified' | 'rejected';

export interface ListingMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
  order: number;
  caption?: string;
}

export interface VerificationDoc {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface ListingActivityEvent {
  id: string;
  listingId: string;
  type: 'view' | 'save' | 'unsave' | 'inquiry' | 'share';
  userId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// ============ CREDITS & BILLING ============

export interface CreditAccount {
  id: string;
  ownerId: string;
  ownerType: 'agent' | 'team';
  balance: number;
  currency: 'credits';
  lowBalanceThreshold: number;
  dailyLimit?: number;
  currencyRate?: number; // equivalencia 1 crédito = currencyRate USD/MXN
  rules: CreditRule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditRule {
  id: string;
  action: CreditAction;
  cost: number;
  isEnabled: boolean;
}

export type CreditAction = 
  | 'lead_basic'
  | 'lead_premium'
  | 'boost_24h'
  | 'boost_7d'
  | 'featured_listing'
  | 'verification_request';

export interface CreditLedgerEntry {
  id: string;
  accountId: string;
  type: 'credit' | 'debit';
  amount: number;
  balance: number;
  description: string;
  referenceType?: 'lead' | 'listing' | 'recharge' | 'refund';
  referenceId?: string;
  createdAt: Date;
}

export interface CreditInvoice {
  id: string;
  amount: number;
  credits: number;
  paymentMethod: string;
  createdAt: Date;
  description?: string;
}

// ============ NOTIFICATIONS ============

export interface Notification {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
  read: boolean;
  createdAt: Date;
}

export type NotificationType = 
  | 'new_lead'
  | 'new_message'
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'appointment_reminder'
  | 'listing_verified'
  | 'listing_activity'
  | 'lead_stale'
  | 'task_due'
  | 'low_balance'
  | 'weekly_digest';

// ============ TASKS ============

export interface Task {
  id: string;
  agentId: string;
  leadId?: string;
  listingId?: string;
  title: string;
  description?: string;
  dueAt?: Date;
  snoozedUntil?: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'cancelled';
  completedAt?: Date;
  createdAt: Date;
  tags?: string[];
  origin?: 'manual' | 'auto';
  originKey?: string;
}

// ============ METRICS ============

export interface AgentMetrics {
  responseTimeAvg: number;
  responseRate: number;
  leadsActive: number;
  appointmentsThisWeek: number;
  noShowRate: number;
  conversionToAppointment: number;
  closedWonRate: number;
  healthScore: number;
}

export interface AgentPerformanceRow {
  agentId: string;
  leadsReceived: number;
  responseUnder5m: number; // %
  appointmentsSet: number;
  avgRating?: number;
}

// ============ FEEDBACK / CX ============
export interface AgentFeedback {
  id: string;
  agentId: string;
  rating: number; // 1-5
  comment: string;
  source: 'post_visit' | 'post_close' | 'survey';
  createdAt: Date;
}
