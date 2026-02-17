// ============================================
// PORTAL INMOBILIARIO - TIPOS PRINCIPALES
// ============================================

// --- USUARIO Y AGENTE ---
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'agent' | 'admin' | 'broker';
  phone?: string;
  createdAt: Date;
}

export interface Agent extends User {
  bio?: string;
  specialties: string[];
  serviceAreas: string[];
  licenseNumber?: string;
  yearsExperience?: number;
  languages: string[];
  availability: WeeklySchedule;
  profileCompleteness: number;
  agentScore: AgentScore;
  teamId?: string;
  isPaused: boolean;
}

export interface AgentScore {
  overall: number;
  responseTime: number;
  conversionRate: number;
  clientSatisfaction: number;
  activityLevel: number;
}

export interface WeeklySchedule {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:mm
  end: string;
}

// --- LEADS ---
export type LeadStage = 
  | 'nuevo'
  | 'contactado'
  | 'calificado'
  | 'cita'
  | 'visitado'
  | 'oferta'
  | 'cerrado'
  | 'perdido';

export type LeadSource = 
  | 'portal'
  | 'referido'
  | 'redes_sociales'
  | 'sitio_web'
  | 'llamada'
  | 'otro';

export type LeadPriority = 'alta' | 'media' | 'baja';

export interface StageHistoryEntry {
  from: LeadStage;
  to: LeadStage;
  changedAt: Date;
  changedBy: string;
}

export interface LostReason {
  reason: string;
  comment?: string;
  date: Date;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  stage: LeadStage;
  source: LeadSource;
  priority: LeadPriority;
  budget?: {
    min: number;
    max: number;
  };
  propertyType?: PropertyType;
  preferredZones?: string[];
  notes: LeadNote[];
  tags: string[];
  assignedAgentId: string;
  propertyInterestId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastContactAt?: Date;
  nextFollowUpAt?: Date;
  stageHistory?: StageHistoryEntry[];
  lostReason?: LostReason;
}

export interface LeadNote {
  id: string;
  content: string;
  createdAt: Date;
  authorId: string;
}

// --- MENSAJES Y CONVERSACIONES ---
export type MessageStatus = 'enviado' | 'entregado' | 'leido';
export type MessageType = 'texto' | 'imagen' | 'documento' | 'audio';
export type ConversationChannel = 'whatsapp' | 'email' | 'sms' | 'portal';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'agent' | 'lead';
  content: string;
  type: MessageType;
  status: MessageStatus;
  attachments?: Attachment[];
  createdAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Conversation {
  id: string;
  leadId: string;
  agentId: string;
  channel: ConversationChannel;
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// --- PROPIEDADES (LISTINGS) ---
export type PropertyStatus = 'activo' | 'pausado' | 'vendido' | 'verificacion' | 'borrador';
export type PropertyType = 'casa' | 'departamento' | 'terreno' | 'oficina' | 'local' | 'bodega';
export type TransactionType = 'venta' | 'renta';

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  transactionType: TransactionType;
  status: PropertyStatus;
  price: number;
  currency: 'MXN' | 'USD';
  address: PropertyAddress;
  features: PropertyFeatures;
  images: PropertyImage[];
  agentId: string;
  views: number;
  saves: number;
  inquiries: number;
  isVerified: boolean;
  isBoosted: boolean;
  boostExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyAddress {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface PropertyFeatures {
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  constructionSize?: number;
  lotSize?: number;
  yearBuilt?: number;
  amenities: string[];
}

export interface PropertyImage {
  id: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
  order: number;
}

// --- CITAS ---
export type AppointmentStatus = 'programada' | 'completada' | 'cancelada' | 'no_show';
export type AppointmentType = 'visita' | 'llamada' | 'videollamada' | 'reunion';

export interface Appointment {
  id: string;
  title: string;
  description?: string;
  type: AppointmentType;
  status: AppointmentStatus;
  startTime: Date;
  endTime: Date;
  leadId?: string;
  propertyId?: string;
  agentId: string;
  location?: string;
  notes?: string;
  reminder?: number; // minutes before
  createdAt: Date;
  updatedAt: Date;
}

// --- TAREAS ---
export type TaskStatus = 'pendiente' | 'en_progreso' | 'completada';
export type TaskPriority = 'alta' | 'media' | 'baja';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  leadId?: string;
  agentId: string;
  completedAt?: Date;
  createdAt: Date;
}

// --- CRÉDITOS Y TRANSACCIONES ---
export type TransactionType2 = 'compra' | 'consumo' | 'reembolso' | 'bonus';
export type CreditPackageType = 'starter' | 'pro' | 'enterprise';

export interface CreditTransaction {
  id: string;
  agentId: string;
  type: TransactionType2;
  amount: number;
  description: string;
  balanceAfter: number;
  relatedEntityId?: string;
  relatedEntityType?: 'lead' | 'boost' | 'feature';
  createdAt: Date;
}

export interface CreditPackage {
  id: string;
  name: string;
  type: CreditPackageType;
  credits: number;
  price: number;
  currency: string;
  bonusCredits?: number;
  isPopular?: boolean;
  features: string[];
}

export interface CreditBalance {
  agentId: string;
  balance: number;
  lastUpdated: Date;
}

// --- EQUIPOS ---
export type TeamMemberRole = 'lider' | 'admin' | 'agente';
export type TeamMemberStatus = 'activo' | 'pausado' | 'invitado';

export interface Team {
  id: string;
  name: string;
  leaderId: string;
  createdAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  agentId: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  leadRoutingWeight: number; // 0-100
  joinedAt: Date;
}

// --- TEAM ACTIVITY ---
export type TeamActivityEventType =
  | 'invitation_sent'
  | 'invitation_accepted'
  | 'role_changed'
  | 'member_paused'
  | 'member_activated'
  | 'member_removed'
  | 'leads_reassigned'
  | 'leadership_transferred';

export interface TeamActivityEvent {
  id: string;
  teamId: string;
  type: TeamActivityEventType;
  description: string;
  details?: string;
  actorId: string;
  actorName: string;
  actorAvatar?: string;
  targetId?: string;
  targetName?: string;
  timestamp: Date;
}

export interface LeadRoutingRule {
  id: string;
  teamId: string;
  name: string;
  conditions: {
    source?: LeadSource[];
    zone?: string[];
    propertyType?: PropertyType[];
  };
  assignTo: string[]; // agent IDs
  distribution: 'round_robin' | 'weighted' | 'random';
  isActive: boolean;
}

// --- NOTIFICACIONES ---
export type NotificationType = 
  | 'nuevo_lead'
  | 'nuevo_mensaje'
  | 'cita_recordatorio'
  | 'tarea_vencida'
  | 'creditos_bajos'
  | 'propiedad_vista'
  | 'sistema';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  agentId: string;
  createdAt: Date;
}

export interface NotificationPreferences {
  agentId: string;
  email: {
    nuevoLead: boolean;
    nuevoMensaje: boolean;
    citaRecordatorio: boolean;
    tareaVencida: boolean;
    creditosBajos: boolean;
    resumenDiario: boolean;
  };
  push: {
    nuevoLead: boolean;
    nuevoMensaje: boolean;
    citaRecordatorio: boolean;
  };
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm
    end: string;
  };
}

// --- ANALYTICS ---
export interface DashboardMetrics {
  leadsNuevosHoy: number;
  leadsTotalMes: number;
  citasHoy: number;
  tareasUrgentes: number;
  tasaRespuesta: number;
  tasaConversion: number;
  tiempoRespuestaPromedio: number; // minutes
  creditosDisponibles: number;
}

export interface LeadsByStageData {
  stage: LeadStage;
  count: number;
}

export interface LeadsTrendData {
  date: string;
  leads: number;
  conversiones: number;
}

export interface PropertyPerformance {
  propertyId: string;
  views: number;
  saves: number;
  inquiries: number;
  period: 'day' | 'week' | 'month';
}
