import {
  Agent,
  Lead,
  Conversation,
  Message,
  Property,
  Appointment,
  Task,
  CreditTransaction,
  CreditPackage,
  Notification,
  Team,
  TeamMember,
  DashboardMetrics,
  LeadsByStageData,
  LeadsTrendData,
} from '@/types';

// --- AGENTE ACTUAL (MOCK AUTH) ---
export const currentAgent: Agent = {
  id: 'agent-001',
  email: 'carlos.martinez@inmobiliaria.mx',
  name: 'Carlos Martínez',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
  role: 'agent',
  phone: '+52 55 1234 5678',
  bio: 'Especialista en propiedades residenciales de lujo con más de 10 años de experiencia en el mercado inmobiliario de la Ciudad de México.',
  specialties: ['Residencial de lujo', 'Desarrollos nuevos', 'Inversiones'],
  serviceAreas: ['Polanco', 'Santa Fe', 'Condesa', 'Roma Norte'],
  licenseNumber: 'CDMX-2024-12345',
  yearsExperience: 10,
  languages: ['Español', 'Inglés'],
  profileCompleteness: 85,
  agentScore: {
    overall: 92,
    responseTime: 95,
    conversionRate: 88,
    clientSatisfaction: 94,
    activityLevel: 90,
  },
  availability: {
    monday: [{ start: '09:00', end: '18:00' }],
    tuesday: [{ start: '09:00', end: '18:00' }],
    wednesday: [{ start: '09:00', end: '18:00' }],
    thursday: [{ start: '09:00', end: '18:00' }],
    friday: [{ start: '09:00', end: '17:00' }],
    saturday: [{ start: '10:00', end: '14:00' }],
    sunday: [],
  },
  teamId: 'team-001',
  isPaused: false,
  createdAt: new Date('2020-03-15'),
};

// --- LEADS ---
export const mockLeads: Lead[] = [
  {
    id: 'lead-001',
    name: 'María García López',
    email: 'maria.garcia@email.com',
    phone: '+52 55 9876 5432',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    stage: 'nuevo',
    source: 'portal',
    priority: 'alta',
    budget: { min: 5000000, max: 8000000 },
    propertyType: 'casa',
    preferredZones: ['Polanco', 'Lomas de Chapultepec'],
    notes: [],
    tags: ['urgente', 'pre-aprobado'],
    assignedAgentId: 'agent-001',
    propertyInterestId: 'prop-001',
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 'lead-002',
    name: 'Roberto Hernández',
    email: 'roberto.h@gmail.com',
    phone: '+52 55 1111 2222',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto',
    stage: 'contactado',
    source: 'referido',
    priority: 'media',
    budget: { min: 3000000, max: 5000000 },
    propertyType: 'departamento',
    preferredZones: ['Condesa', 'Roma Norte'],
    notes: [
      {
        id: 'note-001',
        content: 'Busca departamento para inversión. Interesado en rentas.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        authorId: 'agent-001',
      },
    ],
    tags: ['inversionista'],
    assignedAgentId: 'agent-001',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    lastContactAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 'lead-003',
    name: 'Ana Sofía Ramírez',
    email: 'ana.ramirez@corp.com',
    phone: '+52 55 3333 4444',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    stage: 'calificado',
    source: 'sitio_web',
    priority: 'alta',
    budget: { min: 8000000, max: 15000000 },
    propertyType: 'casa',
    preferredZones: ['Santa Fe', 'Pedregal'],
    notes: [
      {
        id: 'note-002',
        content: 'Ejecutiva de corporativo. Busca casa amplia con jardín.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        authorId: 'agent-001',
      },
    ],
    tags: ['premium', 'jardín'],
    assignedAgentId: 'agent-001',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    lastContactAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    nextFollowUpAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
  },
  {
    id: 'lead-004',
    name: 'Fernando Díaz',
    email: 'fdiaz@hotmail.com',
    phone: '+52 55 5555 6666',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fernando',
    stage: 'cita',
    source: 'redes_sociales',
    priority: 'media',
    budget: { min: 2500000, max: 4000000 },
    propertyType: 'departamento',
    preferredZones: ['Nápoles', 'Del Valle'],
    notes: [],
    tags: ['primera-compra'],
    assignedAgentId: 'agent-001',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    lastContactAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
  {
    id: 'lead-005',
    name: 'Patricia Morales',
    email: 'patricia.m@yahoo.com',
    phone: '+52 55 7777 8888',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia',
    stage: 'visitado',
    source: 'portal',
    priority: 'alta',
    budget: { min: 6000000, max: 9000000 },
    propertyType: 'casa',
    preferredZones: ['Coyoacán', 'San Ángel'],
    notes: [
      {
        id: 'note-003',
        content: 'Visitó 3 propiedades. Le gustó mucho la de San Ángel.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        authorId: 'agent-001',
      },
    ],
    tags: ['interesado', 'visita-realizada'],
    assignedAgentId: 'agent-001',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    lastContactAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    id: 'lead-006',
    name: 'Jorge Luis Vega',
    email: 'jlvega@empresa.com',
    phone: '+52 55 9999 0000',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jorge',
    stage: 'oferta',
    source: 'referido',
    priority: 'alta',
    budget: { min: 10000000, max: 15000000 },
    propertyType: 'casa',
    preferredZones: ['Lomas de Chapultepec'],
    notes: [
      {
        id: 'note-004',
        content: 'Oferta enviada por $12,500,000. Esperando respuesta del vendedor.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        authorId: 'agent-001',
      },
    ],
    tags: ['oferta-activa', 'premium'],
    assignedAgentId: 'agent-001',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    lastContactAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 'lead-007',
    name: 'Carmen Ortiz',
    email: 'carmen.ortiz@gmail.com',
    phone: '+52 55 1234 0000',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carmen',
    stage: 'cerrado',
    source: 'portal',
    priority: 'media',
    budget: { min: 4000000, max: 6000000 },
    propertyType: 'departamento',
    preferredZones: ['Polanco'],
    notes: [
      {
        id: 'note-005',
        content: '¡Cerrado! Compró el depto en Polanco por $5,200,000.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        authorId: 'agent-001',
      },
    ],
    tags: ['cerrado', 'satisfecho'],
    assignedAgentId: 'agent-001',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    lastContactAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
];

// --- CONVERSACIONES ---
export const mockConversations: Conversation[] = [
  {
    id: 'conv-001',
    leadId: 'lead-001',
    agentId: 'agent-001',
    channel: 'whatsapp',
    unreadCount: 2,
    isPinned: true,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: 'conv-002',
    leadId: 'lead-002',
    agentId: 'agent-001',
    channel: 'email',
    unreadCount: 0,
    isPinned: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 'conv-003',
    leadId: 'lead-003',
    agentId: 'agent-001',
    channel: 'portal',
    unreadCount: 1,
    isPinned: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: 'conv-004',
    leadId: 'lead-005',
    agentId: 'agent-001',
    channel: 'whatsapp',
    unreadCount: 0,
    isPinned: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
];

// --- MENSAJES ---
export const mockMessages: Message[] = [
  {
    id: 'msg-001',
    conversationId: 'conv-001',
    senderId: 'lead-001',
    senderType: 'lead',
    content: 'Hola, estoy interesada en la casa de Polanco que vi en el portal.',
    type: 'texto',
    status: 'leido',
    createdAt: new Date(Date.now() - 1000 * 60 * 25),
  },
  {
    id: 'msg-002',
    conversationId: 'conv-001',
    senderId: 'agent-001',
    senderType: 'agent',
    content: '¡Hola María! Gracias por contactarnos. Es una excelente propiedad. ¿Le gustaría agendar una visita?',
    type: 'texto',
    status: 'leido',
    createdAt: new Date(Date.now() - 1000 * 60 * 20),
  },
  {
    id: 'msg-003',
    conversationId: 'conv-001',
    senderId: 'lead-001',
    senderType: 'lead',
    content: 'Sí, me encantaría. ¿Tienen disponibilidad este fin de semana?',
    type: 'texto',
    status: 'leido',
    createdAt: new Date(Date.now() - 1000 * 60 * 10),
  },
  {
    id: 'msg-004',
    conversationId: 'conv-001',
    senderId: 'lead-001',
    senderType: 'lead',
    content: 'También me gustaría saber si aceptan crédito bancario.',
    type: 'texto',
    status: 'entregado',
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: 'msg-005',
    conversationId: 'conv-002',
    senderId: 'agent-001',
    senderType: 'agent',
    content: 'Buen día Roberto, le comparto información de los departamentos disponibles en la zona.',
    type: 'texto',
    status: 'leido',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
  },
  {
    id: 'msg-006',
    conversationId: 'conv-002',
    senderId: 'lead-002',
    senderType: 'lead',
    content: 'Excelente, gracias. Me interesa el de la Condesa. ¿Cuál es el rendimiento esperado?',
    type: 'texto',
    status: 'leido',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 'msg-007',
    conversationId: 'conv-003',
    senderId: 'lead-003',
    senderType: 'lead',
    content: 'Hola, quisiera más información sobre casas en Santa Fe con jardín amplio.',
    type: 'texto',
    status: 'entregado',
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
  },
];

// --- PROPIEDADES ---
export const mockProperties: Property[] = [
  {
    id: 'prop-001',
    title: 'Casa de Lujo en Polanco',
    description: 'Espectacular residencia en una de las zonas más exclusivas de la ciudad. Acabados de primera calidad, amplios espacios y jardín privado.',
    type: 'casa',
    transactionType: 'venta',
    status: 'activo',
    price: 12500000,
    currency: 'MXN',
    address: {
      street: 'Av. Presidente Masaryk 123',
      neighborhood: 'Polanco',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '11560',
      country: 'México',
      latitude: 19.4326,
      longitude: -99.1886,
    },
    features: {
      bedrooms: 4,
      bathrooms: 4.5,
      parkingSpaces: 3,
      constructionSize: 450,
      lotSize: 600,
      yearBuilt: 2020,
      amenities: ['Jardín', 'Alberca', 'Gimnasio', 'Cuarto de servicio', 'Roof garden'],
    },
    images: [
      { id: 'img-001', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', isPrimary: true, order: 1 },
      { id: 'img-002', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', isPrimary: false, order: 2 },
    ],
    agentId: 'agent-001',
    views: 245,
    saves: 18,
    inquiries: 12,
    isVerified: true,
    isBoosted: true,
    boostExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 'prop-002',
    title: 'Departamento Moderno en Condesa',
    description: 'Hermoso departamento con diseño contemporáneo en el corazón de la Condesa. Ideal para inversionistas.',
    type: 'departamento',
    transactionType: 'venta',
    status: 'activo',
    price: 4800000,
    currency: 'MXN',
    address: {
      street: 'Calle Tamaulipas 45',
      neighborhood: 'Condesa',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '06140',
      country: 'México',
    },
    features: {
      bedrooms: 2,
      bathrooms: 2,
      parkingSpaces: 1,
      constructionSize: 95,
      amenities: ['Roof garden común', 'Gimnasio', 'Pet friendly'],
    },
    images: [
      { id: 'img-003', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', isPrimary: true, order: 1 },
    ],
    agentId: 'agent-001',
    views: 189,
    saves: 24,
    inquiries: 8,
    isVerified: true,
    isBoosted: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  },
  {
    id: 'prop-003',
    title: 'Casa con Jardín en San Ángel',
    description: 'Encantadora casa con amplio jardín en una de las colonias más tradicionales de la ciudad.',
    type: 'casa',
    transactionType: 'venta',
    status: 'activo',
    price: 8900000,
    currency: 'MXN',
    address: {
      street: 'Calle de la Amargura 78',
      neighborhood: 'San Ángel',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '01000',
      country: 'México',
    },
    features: {
      bedrooms: 3,
      bathrooms: 3,
      parkingSpaces: 2,
      constructionSize: 280,
      lotSize: 400,
      yearBuilt: 1985,
      amenities: ['Jardín amplio', 'Estudio', 'Bodega'],
    },
    images: [
      { id: 'img-004', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', isPrimary: true, order: 1 },
    ],
    agentId: 'agent-001',
    views: 156,
    saves: 12,
    inquiries: 5,
    isVerified: false,
    isBoosted: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  {
    id: 'prop-004',
    title: 'Penthouse en Santa Fe',
    description: 'Impresionante penthouse con vista panorámica. Acabados de lujo y amenidades de primer nivel.',
    type: 'departamento',
    transactionType: 'venta',
    status: 'verificacion',
    price: 15000000,
    currency: 'MXN',
    address: {
      street: 'Av. Santa Fe 200',
      neighborhood: 'Santa Fe',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '05348',
      country: 'México',
    },
    features: {
      bedrooms: 3,
      bathrooms: 3.5,
      parkingSpaces: 3,
      constructionSize: 320,
      yearBuilt: 2022,
      amenities: ['Terraza privada', 'Vista panorámica', 'Smart home', 'Cava de vinos'],
    },
    images: [
      { id: 'img-005', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', isPrimary: true, order: 1 },
    ],
    agentId: 'agent-001',
    views: 0,
    saves: 0,
    inquiries: 0,
    isVerified: false,
    isBoosted: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
];

// --- CITAS ---
export const mockAppointments: Appointment[] = [
  {
    id: 'apt-001',
    title: 'Visita casa Polanco - María García',
    type: 'visita',
    status: 'programada',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 3),
    leadId: 'lead-001',
    propertyId: 'prop-001',
    agentId: 'agent-001',
    location: 'Av. Presidente Masaryk 123, Polanco',
    reminder: 30,
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: 'apt-002',
    title: 'Llamada de seguimiento - Fernando Díaz',
    type: 'llamada',
    status: 'programada',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 5),
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 5.5),
    leadId: 'lead-004',
    agentId: 'agent-001',
    reminder: 15,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 'apt-003',
    title: 'Presentación de oferta - Jorge Vega',
    type: 'reunion',
    status: 'programada',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 25),
    leadId: 'lead-006',
    agentId: 'agent-001',
    location: 'Oficina central',
    notes: 'Traer comparables y documentación',
    reminder: 60,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
  {
    id: 'apt-004',
    title: 'Visita departamento Condesa',
    type: 'visita',
    status: 'completada',
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    endTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 60),
    leadId: 'lead-002',
    propertyId: 'prop-002',
    agentId: 'agent-001',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
];

// --- TAREAS ---
export const mockTasks: Task[] = [
  {
    id: 'task-001',
    title: 'Llamar a María García',
    description: 'Confirmar disponibilidad para visita del fin de semana',
    status: 'pendiente',
    priority: 'alta',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 2),
    leadId: 'lead-001',
    agentId: 'agent-001',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 'task-002',
    title: 'Enviar comparables a Ana Sofía',
    description: 'Preparar análisis de mercado para Santa Fe',
    status: 'en_progreso',
    priority: 'media',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    leadId: 'lead-003',
    agentId: 'agent-001',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 'task-003',
    title: 'Actualizar fotos propiedad San Ángel',
    status: 'pendiente',
    priority: 'baja',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    agentId: 'agent-001',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    id: 'task-004',
    title: 'Seguimiento oferta Jorge Vega',
    description: 'Contactar al vendedor para respuesta',
    status: 'pendiente',
    priority: 'alta',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 4),
    leadId: 'lead-006',
    agentId: 'agent-001',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
];

// --- TRANSACCIONES DE CRÉDITOS ---
export const mockCreditTransactions: CreditTransaction[] = [
  {
    id: 'tx-001',
    agentId: 'agent-001',
    type: 'compra',
    amount: 500,
    description: 'Compra de paquete Pro',
    balanceAfter: 500,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
  },
  {
    id: 'tx-002',
    agentId: 'agent-001',
    type: 'consumo',
    amount: -50,
    description: 'Lead premium recibido',
    balanceAfter: 450,
    relatedEntityId: 'lead-001',
    relatedEntityType: 'lead',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25),
  },
  {
    id: 'tx-003',
    agentId: 'agent-001',
    type: 'consumo',
    amount: -100,
    description: 'Boost propiedad Polanco (7 días)',
    balanceAfter: 350,
    relatedEntityId: 'prop-001',
    relatedEntityType: 'boost',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  },
  {
    id: 'tx-004',
    agentId: 'agent-001',
    type: 'bonus',
    amount: 25,
    description: 'Bonus por referido',
    balanceAfter: 375,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
];

// --- PAQUETES DE CRÉDITOS ---
export const mockCreditPackages: CreditPackage[] = [
  {
    id: 'pkg-001',
    name: 'Starter',
    type: 'starter',
    credits: 100,
    price: 999,
    currency: 'MXN',
    features: ['100 créditos', 'Válido por 30 días'],
  },
  {
    id: 'pkg-002',
    name: 'Pro',
    type: 'pro',
    credits: 500,
    price: 3999,
    currency: 'MXN',
    bonusCredits: 50,
    isPopular: true,
    features: ['500 créditos', '50 créditos bonus', 'Válido por 60 días', 'Soporte prioritario'],
  },
  {
    id: 'pkg-003',
    name: 'Enterprise',
    type: 'enterprise',
    credits: 1500,
    price: 9999,
    currency: 'MXN',
    bonusCredits: 200,
    features: ['1500 créditos', '200 créditos bonus', 'Válido por 90 días', 'Account manager dedicado', 'Reportes avanzados'],
  },
];

// --- NOTIFICACIONES ---
export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    type: 'nuevo_lead',
    title: 'Nuevo lead recibido',
    message: 'María García está interesada en Casa de Lujo en Polanco',
    isRead: false,
    actionUrl: '/agents/leads',
    agentId: 'agent-001',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 'notif-002',
    type: 'nuevo_mensaje',
    title: 'Nuevo mensaje',
    message: 'María García: "También me gustaría saber si aceptan crédito bancario."',
    isRead: false,
    actionUrl: '/agents/inbox',
    agentId: 'agent-001',
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: 'notif-003',
    type: 'cita_recordatorio',
    title: 'Cita en 2 horas',
    message: 'Visita casa Polanco con María García',
    isRead: true,
    actionUrl: '/agents/calendar',
    agentId: 'agent-001',
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: 'notif-004',
    type: 'propiedad_vista',
    title: 'Tu propiedad está siendo vista',
    message: 'Casa de Lujo en Polanco tiene 15 nuevas vistas hoy',
    isRead: true,
    actionUrl: '/agents/listings',
    agentId: 'agent-001',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
  },
];

// --- EQUIPO ---
export const mockTeam: Team = {
  id: 'team-001',
  name: 'Equipo Élite Polanco',
  leaderId: 'agent-001',
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180),
};

export const mockTeamMembers: TeamMember[] = [
  {
    id: 'member-001',
    teamId: 'team-001',
    agentId: 'agent-001',
    role: 'lider',
    status: 'activo',
    leadRoutingWeight: 40,
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180),
  },
  {
    id: 'member-002',
    teamId: 'team-001',
    agentId: 'agent-002',
    role: 'agente',
    status: 'activo',
    leadRoutingWeight: 30,
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
  },
  {
    id: 'member-003',
    teamId: 'team-001',
    agentId: 'agent-003',
    role: 'agente',
    status: 'pausado',
    leadRoutingWeight: 30,
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
  },
];

// --- ZONAS DISPONIBLES ---
export const mockZones: string[] = [
  'Polanco',
  'Condesa',
  'Roma Norte',
  'Roma Sur',
  'Santa Fe',
  'Lomas de Chapultepec',
  'Pedregal',
  'Coyoacán',
  'San Ángel',
  'Del Valle',
  'Nápoles',
  'Interlomas',
  'Bosques de las Lomas',
  'Anzures',
  'Juárez',
];

// --- REGLAS DE RUTEO ---
export const mockRoutingRules: import('@/types').LeadRoutingRule[] = [
  {
    id: 'rule-001',
    teamId: 'team-001',
    name: 'Leads Premium Polanco',
    conditions: {
      zone: ['Polanco', 'Lomas de Chapultepec'],
      propertyType: ['casa'],
    },
    assignTo: ['agent-001'],
    distribution: 'round_robin',
    isActive: true,
  },
  {
    id: 'rule-002',
    teamId: 'team-001',
    name: 'Departamentos Condesa/Roma',
    conditions: {
      zone: ['Condesa', 'Roma Norte', 'Roma Sur'],
      propertyType: ['departamento'],
    },
    assignTo: ['agent-001', 'agent-002'],
    distribution: 'weighted',
    isActive: true,
  },
];

// --- INVITACIONES PENDIENTES ---
export const mockPendingInvitations: {
  id: string;
  email: string;
  role: import('@/types').TeamMemberRole;
  sentAt: Date;
}[] = [
  {
    id: 'invite-001',
    email: 'sofia.torres@email.com',
    role: 'agente',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  {
    id: 'invite-002',
    email: 'pedro.garcia@email.com',
    role: 'admin',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
];

// --- PERFORMANCE DEL EQUIPO ---
export const mockTeamPerformance: {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  leadsReceived: number;
  respondedUnder5Min: number;
  appointmentsScheduled: number;
  conversions: number;
  score: number;
}[] = [
  {
    id: 'agent-001',
    name: 'Carlos Martínez',
    email: 'carlos.martinez@inmobiliaria.mx',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    leadsReceived: 12,
    respondedUnder5Min: 11,
    appointmentsScheduled: 8,
    conversions: 2,
    score: 92,
  },
  {
    id: 'agent-002',
    name: 'Laura Sánchez',
    email: 'laura.sanchez@inmobiliaria.mx',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
    leadsReceived: 8,
    respondedUnder5Min: 7,
    appointmentsScheduled: 5,
    conversions: 1,
    score: 85,
  },
  {
    id: 'agent-003',
    name: 'Miguel Rodríguez',
    email: 'miguel.rodriguez@inmobiliaria.mx',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel',
    leadsReceived: 6,
    respondedUnder5Min: 4,
    appointmentsScheduled: 2,
    conversions: 0,
    score: 68,
  },
];

// --- ETIQUETAS DISPONIBLES ---
export const mockAvailableTags: string[] = [
  'urgente',
  'pre-aprobado',
  'inversionista',
  'premium',
  'jardín',
  'primera-compra',
  'interesado',
  'visita-realizada',
  'oferta-activa',
  'cerrado',
  'satisfecho',
  'vip',
  'corporativo',
  'familiar',
];

// --- TEAM ACTIVITY LOG ---
export const mockTeamActivity: import('@/types').TeamActivityEvent[] = [
  {
    id: 'activity-001',
    teamId: 'team-001',
    type: 'invitation_sent',
    description: 'Invitación enviada a sofia.torres@email.com',
    actorId: 'agent-001',
    actorName: 'Carlos Martínez',
    actorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  {
    id: 'activity-002',
    teamId: 'team-001',
    type: 'member_paused',
    description: 'Miguel Rodríguez fue pausado',
    details: 'Leads reasignados a Laura Sánchez',
    actorId: 'agent-001',
    actorName: 'Carlos Martínez',
    actorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    targetId: 'agent-003',
    targetName: 'Miguel Rodríguez',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  },
  {
    id: 'activity-003',
    teamId: 'team-001',
    type: 'invitation_accepted',
    description: 'Laura Sánchez aceptó la invitación',
    actorId: 'agent-002',
    actorName: 'Laura Sánchez',
    actorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
  },
  {
    id: 'activity-004',
    teamId: 'team-001',
    type: 'role_changed',
    description: 'Rol de Laura Sánchez cambiado a Agente',
    details: 'Antes: Admin',
    actorId: 'agent-001',
    actorName: 'Carlos Martínez',
    actorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    targetId: 'agent-002',
    targetName: 'Laura Sánchez',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
  },
  {
    id: 'activity-005',
    teamId: 'team-001',
    type: 'leads_reassigned',
    description: '5 leads reasignados de Miguel a Carlos',
    actorId: 'agent-001',
    actorName: 'Carlos Martínez',
    actorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  },
];

// --- MÉTRICAS DEL DASHBOARD ---
export const mockDashboardMetrics: DashboardMetrics = {
  leadsNuevosHoy: 3,
  leadsTotalMes: 24,
  citasHoy: 2,
  tareasUrgentes: 2,
  tasaRespuesta: 94,
  tasaConversion: 18,
  tiempoRespuestaPromedio: 12,
  creditosDisponibles: 375,
};

export const mockLeadsByStage: LeadsByStageData[] = [
  { stage: 'nuevo', count: 5 },
  { stage: 'contactado', count: 8 },
  { stage: 'calificado', count: 4 },
  { stage: 'cita', count: 3 },
  { stage: 'visitado', count: 2 },
  { stage: 'oferta', count: 1 },
  { stage: 'cerrado', count: 1 },
];

export const mockLeadsTrend: LeadsTrendData[] = [
  { date: '2024-01-01', leads: 12, conversiones: 2 },
  { date: '2024-01-08', leads: 18, conversiones: 3 },
  { date: '2024-01-15', leads: 15, conversiones: 2 },
  { date: '2024-01-22', leads: 22, conversiones: 4 },
  { date: '2024-01-29', leads: 24, conversiones: 3 },
];

// --- HELPER FUNCTIONS ---
export function getLeadById(id: string): Lead | undefined {
  return mockLeads.find(lead => lead.id === id);
}

export function getConversationsByAgentId(agentId: string): Conversation[] {
  return mockConversations.filter(conv => conv.agentId === agentId);
}

export function getMessagesByConversationId(conversationId: string): Message[] {
  return mockMessages.filter(msg => msg.conversationId === conversationId);
}

export function getPropertyById(id: string): Property | undefined {
  return mockProperties.find(prop => prop.id === id);
}

export function getAppointmentsByAgentId(agentId: string): Appointment[] {
  return mockAppointments.filter(apt => apt.agentId === agentId);
}

export function getTasksByAgentId(agentId: string): Task[] {
  return mockTasks.filter(task => task.agentId === agentId);
}
