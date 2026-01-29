# Plataforma de Agentes - Especificación Completa
## Feature-Page-DashboardAgents-28-01-2026

---

# 1. EXECUTIVE SUMMARY

## Visión
Construir una plataforma CRM inmobiliaria que iguale Zillow Premier Agent en funcionalidad core pero lo **supere en experiencia interactiva**: micro-interacciones que guían, confirman y generan hábito de retorno sin recurrir a dark patterns.

## MVP: Qué construir primero (6-8 semanas)

| Prioridad | Módulo | Desbloquea |
|-----------|--------|------------|
| P0 | **Inbox Unificado + Pipeline Leads** | Gestión centralizada de comunicación y estados. Sin esto no hay CRM |
| P0 | **Chat básico** | Conversación bidireccional con plantillas y adjuntos |
| P0 | **Calendario de visitas** | Scheduling de citas, confirmaciones, recordatorios |
| P1 | **Listings con actividad** | Gestión de propiedades + feed de actividad (views/saves/messages) |
| P1 | **Créditos/Billing UI** | Saldo, ledger, reglas de consumo (sin backend vendor) |
| P2 | **Team básico** | Roles, invitaciones, routing simple |
| P2 | **Reporting mínimo** | Métricas de respuesta, conversiones, desempeño |

## ROI por release

- **MVP (P0)**: Agentes pueden operar día a día. Retención base establecida.
- **V1 (P0+P1)**: Monetización habilitada. Listings como "gancho" de retorno.
- **V2 (P0+P1+P2)**: Equipos e inmobiliarias. Escalabilidad comercial.

## Diferenciadores vs Zillow

| Zillow | Nosotros |
|--------|----------|
| UI funcional pero estática | **UI viva**: optimistic updates, micro-feedback, progress loops |
| Notificaciones push agresivas | **Respeto al usuario**: quiet hours, digest configurable, controles claros |
| CRM genérico | **Habit loops explícitos**: sensación de progreso, next best action, micro-rewards |
| Mobile-first (app nativa) | **Web-first responsive** con experiencia comparable |

---

# 2. FEATURE MAP

| Módulo | Feature | Prioridad | Trigger Retorno | Valor | Complejidad | Dependencias | Motion Notes | Métrica |
|--------|---------|-----------|-----------------|-------|-------------|--------------|--------------|---------|
| **Inbox** | Lista unificada de conversaciones | MVP | ✅ Mensaje nuevo | Alto | Media | - | Skeleton → fade-in, badge pulse | Tiempo respuesta |
| Inbox | Filtros por estado/tipo/fecha | MVP | ❌ | Medio | Baja | Inbox base | Tab slide | Filter usage |
| Inbox | Búsqueda de conversaciones | V1 | ❌ | Medio | Media | Inbox base | Input focus glow | Search CTR |
| Inbox | Templates de respuesta rápida | MVP | ❌ | Alto | Baja | Chat | Insert animation | Template usage |
| **Leads** | Pipeline kanban/lista | MVP | ✅ Stage change | Alto | Alta | - | Drag ghost, drop confetti sutil | Stage velocity |
| Leads | Filtros multi-criterio | MVP | ❌ | Medio | Media | Pipeline | Pill animate-in | Filter sessions |
| Leads | Detalle de lead con timeline | MVP | ✅ Nueva actividad | Alto | Media | Pipeline | Panel slide-in | Engagement depth |
| Leads | Lead scoring visible | V1 | ✅ Score change | Alto | Media | Pipeline | Number morph | Score accuracy |
| Leads | Tareas/reminders por lead | MVP | ✅ Tarea vence | Alto | Media | Pipeline | Checkbox spring | Task completion |
| **Chat** | Conversación bidireccional | MVP | ✅ Mensaje nuevo | Alto | Alta | - | Message slide-up, typing dots | Messages/day |
| Chat | Adjuntos (imágenes, docs) | MVP | ❌ | Medio | Media | Chat base | Upload progress ring | Attachment rate |
| Chat | Indicadores envío/entrega/lectura | V1 | ❌ | Medio | Media | Chat base | Check marks animate | Read rate |
| Chat | Notas internas | MVP | ❌ | Alto | Baja | Chat base | Sticky note appear | Notes/lead |
| Chat | Historial completo | MVP | ❌ | Alto | Baja | Chat base | Virtualized scroll | History depth |
| **Calendar** | Vista semana/mes | MVP | ✅ Cita confirmada | Alto | Alta | - | Day cell highlight | Appointments/week |
| Calendar | Crear/editar cita | MVP | ❌ | Alto | Media | Calendar base | Modal scale-in | Create success |
| Calendar | Confirmar/reprogramar/cancelar | MVP | ✅ Status change | Alto | Media | Calendar base | Status badge morph | Confirmation rate |
| Calendar | Recordatorios configurables | MVP | ✅ Reminder | Medio | Baja | Calendar base | Bell shake | Reminder CTR |
| Calendar | Slots de disponibilidad | V1 | ❌ | Medio | Media | Calendar base | Slot highlight | Utilization |
| **Listings** | Grid/lista de propiedades | MVP | ✅ Activity spike | Alto | Media | - | Card hover lift | Listings/agent |
| Listings | Estados (draft/active/paused/sold) | MVP | ✅ Status change | Alto | Baja | Listings base | Status pill morph | Status velocity |
| Listings | Feed de actividad (views/saves) | MVP | ✅ Nueva actividad | Alto | Media | Listings base | Activity item fade-in | Engagement/listing |
| Listings | Editor de listing | V1 | ❌ | Alto | Alta | Listings base | Section expand | Edit completion |
| Listings | Request verificación | MVP | ✅ Verified! | Medio | Baja | Listings base | Badge animate | Verification rate |
| Listings | Media gallery manager | V1 | ❌ | Medio | Alta | Editor | Drag reorder, upload % | Media/listing |
| **Credits** | Saldo + historial | MVP | ✅ Low balance | Alto | Media | - | Number count-up | Balance checks/day |
| Credits | Reglas de consumo | MVP | ❌ | Medio | Media | Saldo | Toggle slide | Rules configured |
| Credits | Recarga (UI) | V1 | ❌ | Alto | Media | Saldo | Success confetti | Recharge events |
| Credits | Facturas | V2 | ❌ | Bajo | Baja | Recarga | List fade-in | Downloads |
| **Team** | Lista de miembros | MVP | ❌ | Medio | Baja | - | Avatar stack | Team size |
| Team | Roles básicos | MVP | ❌ | Medio | Media | Members | Permission toggle | Role changes |
| Team | Invitaciones | MVP | ✅ Invite accepted | Medio | Media | Members | Invite pulse | Invite rate |
| Team | Routing rules | V1 | ❌ | Alto | Alta | Members | Rule card animate | Routing efficiency |
| Team | Pausar/reactivar agente | V1 | ❌ | Medio | Baja | Members | Status morph | Pause events |
| **Reports** | Dashboard overview | MVP | ✅ Metric improved | Alto | Media | All data | Chart animate | Dashboard visits |
| Reports | Response time metrics | MVP | ❌ | Alto | Baja | Inbox | Gauge animate | Avg response time |
| Reports | Conversion funnels | V1 | ❌ | Alto | Media | Leads | Funnel animate | Conversion rate |
| Reports | Desempeño por zona | V1 | ❌ | Medio | Media | Listings | Map heat animate | Zone performance |
| Reports | Export (CSV) | V2 | ❌ | Bajo | Baja | Reports | Download button | Exports |
| **Settings** | Perfil del agente | MVP | ❌ | Alto | Baja | - | Save indicator | Profile completion |
| Settings | Zonas de operación | MVP | ❌ | Medio | Media | Perfil | Map pin drop | Zones configured |
| Settings | Notificaciones | MVP | ❌ | Alto | Baja | - | Toggle slide | Notification prefs |
| Settings | Quiet hours | MVP | ❌ | Medio | Baja | Notificaciones | Time picker | Quiet hours set |
| Settings | Integraciones (UI only) | V2 | ❌ | Bajo | Baja | - | Card flip | Integrations enabled |

---

# 3. BENCHMARK ZILLOW PREMIER AGENT

## Módulos Confirmados (fuentes públicas, docs, reviews 2024-2025)

| Módulo Zillow | Features Confirmadas | Fuente |
|---------------|---------------------|--------|
| **Inbox** | Lista de conversaciones, filtros por estado, búsqueda | zillow.com/agents/app-overview |
| **Contacts/Leads** | Pipeline con estados: New, Attempted Contact, Spoke With, Appointment Set, Met With, Closed Won/Lost | zillow.com/premier-agent/manage-your-real-estate-team-leads |
| **Lead Insights** | Homes viewed/saved/searched por cliente (opt-in) | zillow.com/premier-agent/crm |
| **Team Routing** | Routing rules por tipo de lead, zona, round-robin | zillow.com/premier-agent/lead-routing-teams |
| **Reviews** | Sistema de reviews/ratings de clientes | zillow.com/premieragent/agent-reviews-and-ratings-faq |
| **Mobile App** | CRM móvil con notificaciones push | zillow.com/premier-agent/app |
| **Tasks/Reminders** | Sistema de tareas y recordatorios por lead | Inferido de reviews y training materials |

## Hipótesis (requieren validación)

| Hipótesis | Evidencia parcial | Cómo validar |
|-----------|-------------------|--------------|
| Zillow muestra "time on market" y comparables | Mencionado en reviews, no confirmado en docs | User interviews con agentes Zillow |
| Auto-responders con IA | Marketing materials sugieren, sin detalles técnicos | Product demo o trial |
| Calendario integrado con showings | ShowingTime es producto separado de Zillow | Confirmar integración en CRM |
| Lead scoring algorítmico | Mencionado indirectamente ("quality leads") | Entrevistar agentes |
| Gamification (badges, rankings) | No encontrado | Probable que NO exista |

## Gaps de Zillow (oportunidades para nosotros)

1. **UI estática**: Sin micro-interacciones visibles, feedback genérico
2. **Notificaciones agresivas**: Reportes de spam en reviews
3. **Precio alto**: $300-1000+/mes por zip code
4. **Lock-in**: Leads solo funcionan en su ecosistema
5. **Sin transparencia de score**: Agentes no entienden cómo se priorizan

---

# 4. ARQUITECTURA DE INFORMACIÓN + NAVEGACIÓN

## Sitemap

```
/agents
├── /overview          → Dashboard principal (KPIs, actividad reciente, next actions)
├── /leads             → Pipeline + lista de leads
│   └── /leads/:id     → Detalle de lead (timeline, notas, tareas)
├── /inbox             → Conversaciones unificadas
│   └── /inbox/:id     → Thread de conversación
├── /calendar          → Calendario de visitas
│   └── /calendar/new  → Crear cita (modal o drawer)
├── /listings          → Grid de propiedades
│   ├── /listings/:id  → Detalle de listing (actividad, edición)
│   └── /listings/new  → Crear listing (wizard)
├── /credits           → Saldo, historial, reglas
│   └── /credits/recharge → Recarga (modal o página)
├── /team              → Miembros, roles, routing
│   └── /team/invite   → Invitar miembro (modal)
├── /reports           → Dashboards analíticos
│   └── /reports/:type → Reporte específico
└── /settings          → Configuración
    ├── /settings/profile
    ├── /settings/notifications
    ├── /settings/zones
    └── /settings/integrations
```

## Layout Principal

```
┌─────────────────────────────────────────────────────────────────┐
│ [☰] Logo          🔍 Search (⌘K)     🔔 Notif  👤 Agent Menu   │ ← Topbar
├──────────┬──────────────────────────────────────────────────────┤
│          │                                                      │
│  Overview│     Main Content Area                                │
│  Leads   │     (routed component)                               │
│  Inbox   │                                                      │
│  Calendar│     ┌─────────────────────────────────────────────┐  │
│  Listings│     │  Content with panels, tables, cards         │  │
│  Credits │     │  Drawer/modals for detail views             │  │
│  Team    │     └─────────────────────────────────────────────┘  │
│  Reports │                                                      │
│  ──────  │                                                      │
│  Settings│                                                      │
│          │                                                      │
└──────────┴──────────────────────────────────────────────────────┘
   Sidebar (collapsible)
```

## Componentes de Navegación

| Componente | Comportamiento | Keyboard |
|------------|----------------|----------|
| **Sidebar** | Collapsible a iconos, sticky, scroll interno | - |
| **Topbar** | Fixed, search global, notificaciones, user menu | ⌘K = search |
| **Command Palette** | Overlay, fuzzy search, acciones rápidas | ⌘K |
| **Breadcrumbs** | Solo en vistas anidadas (lead detail, listing detail) | - |
| **Tabs** | Dentro de módulos (leads: pipeline/list, calendar: week/month) | ←→ |

## Responsive Breakpoints

| Breakpoint | Sidebar | Topbar | Content |
|------------|---------|--------|---------|
| Desktop (≥1280px) | Expanded 240px | Full | Fluid max-w-7xl |
| Tablet (768-1279px) | Collapsed 64px (icons) | Full | Fluid |
| Mobile (<768px) | Hidden (hamburger) | Simplified | Full-width |

## Atajos de Teclado (Power Users)

| Atajo | Acción |
|-------|--------|
| ⌘K | Command palette |
| ⌘/ | Keyboard shortcuts help |
| g + o | Go to Overview |
| g + l | Go to Leads |
| g + i | Go to Inbox |
| g + c | Go to Calendar |
| n | New (contextual: lead, message, appointment) |
| Esc | Close modal/drawer/palette |
| j/k | Navigate list items |
| Enter | Open selected item |

---

# 5. MOTION SYSTEM Y MICRO-INTERACTIONS SPEC

## Principios

1. **Rapidez**: Las animaciones no deben sentirse lentas. Máximo 300ms para feedback, 400ms para transiciones.
2. **Propósito**: Cada animación comunica algo (confirmación, cambio de estado, jerarquía, conexión).
3. **Consistencia**: Mismos tokens de easing y duration en toda la app.
4. **Accesibilidad**: Respetar `prefers-reduced-motion`. Fallback a transiciones instantáneas.
5. **Performance**: 60fps. Usar `transform` y `opacity`. Evitar layout thrash.

## Tokens de Motion

```typescript
// src/lib/motion/tokens.ts

export const duration = {
  instant: 0,          // Para reduced-motion
  fast: 150,           // Micro-feedback (hover, focus, toggle)
  normal: 250,         // Standard transitions
  slow: 400,           // Modals, drawers, page transitions
  emphasis: 600,       // Celebrations, onboarding
} as const;

export const easing = {
  // Para entradas y movimientos naturales
  easeOut: [0.16, 1, 0.3, 1],           // Desacelera al final
  // Para salidas
  easeIn: [0.4, 0, 1, 1],               // Acelera al inicio
  // Para movimientos con rebote sutil
  spring: { type: "spring", stiffness: 400, damping: 30 },
  // Para elementos que "aparecen" (scale)
  springBouncy: { type: "spring", stiffness: 300, damping: 20 },
  // Linear para progress bars
  linear: [0, 0, 1, 1],
} as const;

export const distance = {
  xs: 4,    // Micro-shifts
  sm: 8,    // Subtle movements
  md: 16,   // Standard movements
  lg: 24,   // Emphasis
  xl: 40,   // Large transitions
} as const;
```

## Animaciones por Componente

### Botones

```typescript
// Hover: scale sutil
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}
transition={{ duration: duration.fast / 1000 }}

// Loading state: spinner fade-in
// Success state: check icon spring-in, button bg transition
// Error state: shake (translateX oscillation 3 cycles)
```

### Tabs

```typescript
// Active indicator: layoutId animation (shared layout)
<motion.div layoutId="activeTab" transition={easing.spring} />

// Content: fade + slide desde dirección de tab
initial={{ opacity: 0, x: direction * distance.md }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -direction * distance.md }}
```

### Modals / Dialogs

```typescript
// Backdrop: fade-in
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}

// Content: scale + fade desde centro
initial={{ opacity: 0, scale: 0.95, y: distance.sm }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.95, y: distance.sm }}
transition={{ duration: duration.normal / 1000, ease: easing.easeOut }}
```

### Drawers (Side Panels)

```typescript
// Slide desde el lado correspondiente
initial={{ x: "100%" }}  // Right drawer
animate={{ x: 0 }}
exit={{ x: "100%" }}
transition={{ duration: duration.slow / 1000, ease: easing.easeOut }}
```

### Cards

```typescript
// Hover: lift con shadow
whileHover={{ 
  y: -distance.xs, 
  boxShadow: "0 12px 24px -8px rgba(0,0,0,0.15)" 
}}

// Drag preview (Kanban)
whileDrag={{ 
  scale: 1.02, 
  boxShadow: "0 20px 40px -12px rgba(0,0,0,0.25)",
  cursor: "grabbing"
}}
```

### Skeleton Loading

```typescript
// Shimmer: gradient animation continuo
background: linear-gradient(
  90deg,
  hsl(var(--muted)) 0%,
  hsl(var(--muted-foreground) / 0.1) 50%,
  hsl(var(--muted)) 100%
)
animation: shimmer 1.5s infinite
@keyframes shimmer {
  0% { background-position: -200% 0 }
  100% { background-position: 200% 0 }
}
```

### Content Reveal

```typescript
// Staggered children: cada item con delay incremental
<motion.ul variants={containerVariants}>
  {items.map((item, i) => (
    <motion.li
      variants={itemVariants}
      custom={i}
    />
  ))}
</motion.ul>

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: distance.sm },
  visible: { opacity: 1, y: 0 }
};
```

### Empty States

```typescript
// Ilustración: fade-in lento con float sutil
animate={{ 
  y: [0, -distance.xs, 0] 
}}
transition={{ 
  duration: 3, 
  repeat: Infinity, 
  ease: "easeInOut" 
}}
```

### Toasts / Snackbars

```typescript
// Entrada desde arriba/abajo según posición
initial={{ opacity: 0, y: position === "top" ? -distance.md : distance.md, scale: 0.95 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
exit={{ opacity: 0, scale: 0.95, transition: { duration: duration.fast / 1000 } }}

// Auto-dismiss: progress bar underline
<motion.div 
  initial={{ scaleX: 1 }} 
  animate={{ scaleX: 0 }} 
  transition={{ duration: dismissTime / 1000, ease: "linear" }}
/>
```

### Progress + Celebrations

```typescript
// Progress bar: width transition suave
transition={{ duration: duration.normal / 1000, ease: easing.easeOut }}

// Milestone confetti (solo en hitos importantes):
// - Usar canvas-confetti (OSS, MIT)
// - Disparar con < 50 partículas
// - Duración máxima 1.5s
// - Solo en: verificación aprobada, 100% perfil, primer cierre, badge ganado
```

## Estados y Transiciones

### Optimistic Updates

```typescript
// 1. Inmediatamente mostrar estado esperado (opacity reducida ligeramente)
// 2. Animar hacia estado confirmado cuando llegue respuesta
// 3. Si falla: revertir con shake + toast de error

// Ejemplo: Mover lead en pipeline
const handleDrop = async (leadId, newStage) => {
  // Optimistic
  updateLeadLocally(leadId, newStage);
  playSuccessHaptic(); // Vibración móvil si aplica
  
  try {
    await api.updateLead(leadId, { stage: newStage });
    showMicroConfirmation(); // Check verde sutil
  } catch (error) {
    revertLeadLocally(leadId);
    shakeCard(leadId);
    toast.error("No se pudo mover el lead");
  }
};
```

### Error Recoverable

```typescript
// Shake suave: 3 oscilaciones, ±3px
animate={{ x: [0, -3, 3, -3, 3, 0] }}
transition={{ duration: 0.4 }}

// Inline hint: aparecer debajo del campo con fade + slide
initial={{ opacity: 0, height: 0, y: -4 }}
animate={{ opacity: 1, height: "auto", y: 0 }}
```

### Save Indicator (Autosave)

```typescript
// Estados: idle → saving → saved → idle
// saving: spinner pequeño + "Guardando..."
// saved: check verde + "Guardado" → fade out después de 2s
// Posición: esquina superior derecha del formulario o inline
<AnimatePresence>
  {saveState === "saving" && <Spinner />}
  {saveState === "saved" && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      ✓ Guardado
    </motion.div>
  )}
</AnimatePresence>
```

## Reduced Motion

```typescript
// Hook para detectar preferencia
const prefersReducedMotion = useReducedMotion();

// Variantes condicionales
const variants = prefersReducedMotion
  ? { initial: {}, animate: {}, exit: {} }
  : standardVariants;

// En framer-motion v11+:
<MotionConfig reducedMotion="user">
  <App />
</MotionConfig>
```

## Performance Guidelines

1. **Usar `will-change` sparingly**: Solo en elementos que animarán inminentemente
2. **Prefer `transform` y `opacity`**: Son las únicas propiedades GPU-accelerated
3. **Virtualizar listas largas**: >50 items → usar react-virtuoso o similar
4. **Lazy mount modals**: No renderizar hasta que se abran
5. **Debounce resize handlers**: 100ms mínimo
6. **Profile en Chrome DevTools**: Mantener <16ms por frame

---

# 6. FLUJOS CRÍTICOS

## A) Registro / Onboarding

```
┌──────────────────────────────────────────────────────────────────┐
│                        FLUJO DE ONBOARDING                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   [Inicio]                                                       │
│      │                                                           │
│      ▼                                                           │
│   ┌─────────────────┐                                            │
│   │ 1. Datos básicos│  Nombre, email, teléfono, foto             │
│   │    (requerido)  │  Validación inline                         │
│   └────────┬────────┘                                            │
│            │                                                     │
│            ▼                                                     │
│   ┌─────────────────┐                                            │
│   │ 2. Licencia     │  Número, estado, fecha expiración          │
│   │    (requerido)  │  Verificación async (status: pendiente)    │
│   └────────┬────────┘                                            │
│            │                                                     │
│            ▼                                                     │
│   ┌─────────────────┐                                            │
│   │ 3. Zonas        │  Mapa interactivo o lista de áreas         │
│   │    (requerido)  │  Mínimo 1, máximo 10                       │
│   └────────┬────────┘                                            │
│            │                                                     │
│            ▼                                                     │
│   ┌─────────────────┐                                            │
│   │ 4. Especialidad │  Checkboxes: Compra, Venta, Alquiler,      │
│   │    (opcional)   │  Comercial, Lujo, Primera vivienda...      │
│   └────────┬────────┘                                            │
│            │                                                     │
│            ▼                                                     │
│   ┌─────────────────┐                                            │
│   │ 5. Disponibilid │  Horarios de contacto preferidos           │
│   │    (opcional)   │  Quiet hours                               │
│   └────────┬────────┘                                            │
│            │                                                     │
│            ▼                                                     │
│   [Dashboard con checklist de "Perfil 60% → 100%"]               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

Edge Cases:
- Licencia inválida: Mensaje claro, opción de reintentar
- Sesión interrumpida: Guardar progreso, retomar donde quedó
- Foto muy grande: Comprimir client-side antes de upload
- Zonas superpuestas: Warning no bloqueante
```

## B) Leads → Pipeline → Conversación → Cita → Cierre

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FLUJO DE LEADS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Lead Entrante]                                                            │
│       │                                                                     │
│       ├── Origen: Marketplace, Referido, Manual, Integración               │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────┐    ┌────────────┐    ┌───────────┐    ┌────────┐    ┌───────┐ │
│  │  NUEVO  │───▶│ CONTACTADO │───▶│ EN CHARLA │───▶│  CITA  │───▶│CERRADO│ │
│  └─────────┘    └────────────┘    └───────────┘    └────────┘    └───────┘ │
│       │               │                │               │             │      │
│       │               │                │               │             ├─ WON │
│       │               │                │               │             └─ LOST│
│       │               │                │               │                    │
│       ▼               ▼                ▼               ▼                    │
│  [Timeout 24h]   [Timeout 48h]   [Timeout 72h]   [No-show]                  │
│  → Reminder      → Reminder      → Reminder      → Reschedule              │
│                                                                             │
│  En cada transición:                                                        │
│  - Validar permisos (¿es mi lead o de mi equipo?)                          │
│  - Log en timeline                                                          │
│  - Trigger notificación si aplica                                          │
│  - Actualizar métricas en tiempo real                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Edge Cases:
- Lead duplicado: Merge con confirmación
- Lead sin datos de contacto: Marcar como "incompleto"
- Múltiples agentes asignados: Mostrar warning, resolver con team leader
- Lead inactivo >30 días: Sugerir archivar
```

## C) Chat Agente ↔ Usuario

```
┌─────────────────────────────────────────────────────────────────┐
│                      FLUJO DE CHAT                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Agente                                      Usuario      │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  Redactar mensaje                                       │   │
│  │       │                                                 │   │
│  │       ├── Texto libre                                   │   │
│  │       ├── Template rápido (keyboard shortcut: /t)       │   │
│  │       ├── Adjunto (drag & drop o selector)              │   │
│  │       └── Nota interna (solo visible para equipo)       │   │
│  │       │                                                 │   │
│  │       ▼                                                 │   │
│  │  [Enviar]                                               │   │
│  │       │                                                 │   │
│  │       ├── Optimistic: mostrar con ✓ (enviado)          │   │
│  │       ├── Server ACK: ✓✓ (entregado)                   │   │
│  │       └── Read receipt: ✓✓ azul (leído)                │   │
│  │                                                         │   │
│  │  Recibir mensaje                                        │   │
│  │       │                                                 │   │
│  │       ├── Notificación in-app (si pestaña activa)      │   │
│  │       ├── Badge en sidebar                              │   │
│  │       └── Push/email según preferencias                 │   │
│  │                                                         │   │
│  │  SLA Tracking                                           │   │
│  │       │                                                 │   │
│  │       ├── Timer visible: "2h sin respuesta"            │   │
│  │       ├── Escalation: highlight en inbox               │   │
│  │       └── Auto-reminder: notificación suave            │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Edge Cases:
- Mensaje muy largo: Truncar con "ver más"
- Adjunto fallido: Retry automático x3, luego manual
- Usuario bloqueado: No permitir enviar, mostrar estado
- Chat cerrado (lead archivado): Solo lectura, opción de reabrir
- Rate limiting: Feedback claro, sin perder el mensaje draft
```

## D) Calendario y Visitas

```
┌─────────────────────────────────────────────────────────────────┐
│                      FLUJO DE CITAS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Crear Cita]                                                   │
│       │                                                         │
│       ├── Seleccionar lead (o crear nuevo)                     │
│       ├── Seleccionar listing (o dirección manual)             │
│       ├── Fecha/hora (validar disponibilidad)                  │
│       ├── Tipo: Virtual / Presencial                           │
│       └── Notas opcionales                                     │
│       │                                                         │
│       ▼                                                         │
│  ┌──────────┐                                                   │
│  │ PENDIENTE│ ← Estado inicial                                  │
│  └────┬─────┘                                                   │
│       │                                                         │
│       ├──[Usuario confirma]───▶ CONFIRMADA                     │
│       │                              │                          │
│       │                              ├──[Completada]──▶ REALIZADA│
│       │                              │                          │
│       │                              ├──[No-show]──▶ NO_SHOW    │
│       │                              │                          │
│       │                              └──[Reprogramar]──▶ PENDING│
│       │                                                         │
│       └──[Usuario/Agente cancela]───▶ CANCELADA                │
│                                                                 │
│  Recordatorios automáticos:                                     │
│  - 24h antes: "Mañana tienes cita con [Cliente]"               │
│  - 1h antes: "En 1 hora: visita en [Dirección]"                │
│  - Post-cita: "¿Cómo fue la visita?" (feedback prompt)         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Edge Cases:
- Conflicto de horario: Warning antes de guardar
- Zona horaria diferente: Mostrar ambas zonas
- Cancelación tardía (<2h): Flag en historial
- Listing no disponible: Warning, permitir continuar con nota
```

## E) Listings

```
┌─────────────────────────────────────────────────────────────────┐
│                      FLUJO DE LISTINGS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Crear Listing]                                                │
│       │                                                         │
│       ├── Datos básicos (dirección, tipo, precio)              │
│       ├── Características (beds, baths, sqft, amenities)       │
│       ├── Media (fotos, videos, tour virtual)                  │
│       └── Descripción                                          │
│       │                                                         │
│       ▼                                                         │
│  ┌────────┐                                                     │
│  │ DRAFT  │ ← Puede editarse, no visible en marketplace        │
│  └───┬────┘                                                     │
│      │                                                          │
│      ├──[Publicar]───▶ ACTIVE ◄──────────────────┐             │
│      │                    │                       │             │
│      │                    ├──[Pausar]───▶ PAUSED ─┘             │
│      │                    │                                     │
│      │                    ├──[Vender/Alquilar]──▶ CLOSED        │
│      │                    │                                     │
│      │                    └──[Request Verificación]             │
│      │                             │                            │
│      │                             ▼                            │
│      │                    ┌─────────────────┐                   │
│      │                    │ PENDING_VERIFY  │                   │
│      │                    └────────┬────────┘                   │
│      │                             │                            │
│      │                    ┌────────┴────────┐                   │
│      │                    ▼                 ▼                   │
│      │               VERIFIED          REJECTED                 │
│      │               (badge)          (feedback)                │
│      │                                                          │
│      └──[Archivar]───▶ ARCHIVED (solo lectura)                 │
│                                                                 │
│  Feed de Actividad (por listing):                               │
│  - "15 views hoy (+5 vs ayer)"                                 │
│  - "3 saves esta semana"                                       │
│  - "Nuevo mensaje sobre este listing"                          │
│  - "Recomendación: baja el precio 5%"                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Edge Cases:
- Fotos muy pesadas: Compresión + progress bar
- Datos obligatorios faltantes: No permitir publicar
- Listing expirado (>90 días): Prompt de renovación
- Precio fuera de rango de zona: Warning informativo
```

## F) Créditos / Billing

```
┌─────────────────────────────────────────────────────────────────┐
│                      FLUJO DE CRÉDITOS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Vista Principal:                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Saldo Actual: 150 créditos     [+ Recargar]            │   │
│  │  ─────────────────────────────────────────────          │   │
│  │                                                         │   │
│  │  Consumo este mes:                                      │   │
│  │  ┌─────────────────────────────────────────┐            │   │
│  │  │ ████████████░░░░░░░░ 65/100 créditos    │            │   │
│  │  └─────────────────────────────────────────┘            │   │
│  │                                                         │   │
│  │  Historial (ledger):                                    │   │
│  │  ┌───────────┬──────────────────┬─────────┐            │   │
│  │  │ Fecha     │ Concepto         │ Monto   │            │   │
│  │  ├───────────┼──────────────────┼─────────┤            │   │
│  │  │ 28 Ene    │ Lead premium     │ -5      │            │   │
│  │  │ 27 Ene    │ Boost listing #3 │ -10     │            │   │
│  │  │ 25 Ene    │ Recarga          │ +100    │            │   │
│  │  └───────────┴──────────────────┴─────────┘            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Reglas de Consumo (configurables):                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ☑ Lead básico: 2 créditos                               │   │
│  │ ☑ Lead premium: 5 créditos                              │   │
│  │ ☑ Boost listing (24h): 10 créditos                      │   │
│  │ ☐ Featured listing (7d): 50 créditos [no habilitado]    │   │
│  │                                                         │   │
│  │ Límite diario: [50] créditos                            │   │
│  │ Alerta de saldo bajo: [< 20] créditos                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Flujo de Recarga (UI only, sin backend vendor):               │
│  [Seleccionar paquete] → [Confirmar] → [Procesando...] →       │
│  [Éxito + confetti] o [Error + retry]                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Edge Cases:
- Saldo insuficiente: Bloquear acción, sugerir recarga
- Recarga fallida: Reintentar, no cobrar dos veces
- Consumo disputado: Mostrar detalle, link a soporte
- Múltiples agentes en team: Wallet compartido o individual (configurable)
```

## G) Equipo

```
┌─────────────────────────────────────────────────────────────────┐
│                      FLUJO DE EQUIPO                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Roles disponibles:                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ OWNER        │ Todo. Solo 1 por equipo.                 │   │
│  │ ADMIN        │ Gestión team, no billing                 │   │
│  │ AGENT        │ Leads propios, listings propios          │   │
│  │ ASSISTANT    │ Solo lectura + notas                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Flujo de Invitación:                                           │
│  [Ingresar email] → [Seleccionar rol] → [Enviar] →             │
│  [Pendiente] → [Aceptado] o [Expirado 7d]                      │
│                                                                 │
│  Routing Rules (V1):                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ SI zona = [Centro] Y precio < 500k                      │   │
│  │ ENTONCES asignar a [Agente A]                           │   │
│  │ ─────────────────────────────────────────               │   │
│  │ SI tipo = [Comercial]                                   │   │
│  │ ENTONCES asignar a [Agente B, Agente C] (round-robin)   │   │
│  │ ─────────────────────────────────────────               │   │
│  │ DEFAULT: asignar a [Pool general]                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Pausar Agente:                                                 │
│  - No recibe nuevos leads                                       │
│  - Leads actuales se reasignan o quedan asignados              │
│  - Puede seguir trabajando leads existentes                    │
│                                                                 │
│  Reasignación:                                                  │
│  - Manual: Owner/Admin selecciona leads y nuevo agente         │
│  - Automática: Al pausar, opción de redistribuir               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Edge Cases:
- Último owner quiere irse: Debe transferir ownership primero
- Invitación a email ya en otro team: Error, contactar soporte
- Agente con leads pausado por mucho tiempo: Reminder a admin
- Conflicto de routing rules: Evaluar en orden, primera que matchea gana
```

---

# 7. DISEÑO DE LOOPS DE RETORNO

## Principios (Sin Dark Patterns)

1. **Valor real**: Cada notificación debe ofrecer algo útil
2. **Control total**: El usuario decide qué, cuándo y cómo
3. **Quiet hours**: Respeto absoluto al tiempo de descanso
4. **Frecuencia justa**: No más de X por día (configurable)
5. **Transparencia**: Explicar por qué se notifica

## Return Triggers

| # | Trigger | Señal | Valor para el Agente | UI Surface | Frecuencia | Anti-spam |
|---|---------|-------|---------------------|------------|------------|-----------|
| 1 | **Lead nuevo** | Lead asignado | Oportunidad de negocio | Push + Inbox badge + Banner | Inmediato | Agregar en batches si >3 en 5min |
| 2 | **Mensaje nuevo** | Usuario responde | Avanzar conversación | Push + Inbox badge | Inmediato | Max 1 push por conversación/15min |
| 3 | **Cita confirmada** | Usuario acepta | Certeza de agenda | Push + Calendar badge | Inmediato | - |
| 4 | **Cita cancelada** | Usuario cancela | Liberar tiempo | Push + Calendar badge | Inmediato | - |
| 5 | **Listing verificado** | Staff aprueba | Credibilidad, más leads | Push + Success modal | Al aprobar | Solo cuando es nuevo |
| 6 | **Listing boost de views** | Views > avg×2 | Listing atractivo | In-app notification | 1x/día | Solo si >50 views |
| 7 | **Lead sin respuesta** | >2h sin reply | Evitar perder lead | In-app warning | A las 2h, 6h, 24h | Max 3 por lead |
| 8 | **Tarea vence hoy** | Due date = today | Organización | Morning digest + Badge | 1x mañana | Agrupar todas las tareas |
| 9 | **Baja el precio (sugerencia)** | Listing >30 días sin leads | Acción para mejorar | In-app card | 1x/semana | Solo 1 sugerencia activa |
| 10 | **Perfil incompleto** | Completion <100% | Mejor visibilidad | Dashboard widget | Persistente | No notificar, solo mostrar |
| 11 | **Saldo bajo** | Balance <20 | Evitar bloqueo | Banner + Push | 1x al cruzar umbral | No repetir si no recarga |
| 12 | **Resumen semanal** | Domingo 9am | Reflexión, celebración | Email/In-app | 1x/semana | Opt-in |

## Notification Center In-App

```
┌─────────────────────────────────────────┐
│ 🔔 Notificaciones                 [✓ all] 
├─────────────────────────────────────────┤
│                                         │
│ ● Nuevo lead: María García        2 min │
│   Interesada en Casa Centro #45         │
│                                         │
│ ● Mensaje de Juan Pérez          15 min │
│   "Me gustaría agendar una visita..."   │
│                                         │
│ ○ Listing #23 verificado           1 hr │
│   Tu departamento ahora tiene badge ✓   │
│                                         │
│ ○ Resumen del día                  8 hr │
│   3 leads, 5 mensajes, 1 cita           │
│                                         │
├─────────────────────────────────────────┤
│ [Ver todas] [Marcar todas leídas]       │
└─────────────────────────────────────────┘

Estados: ● No leída  ○ Leída
Acciones: Click → navegar, Swipe → archivar
```

## Digest Diario/Semanal (In-App o Email)

```
┌─────────────────────────────────────────┐
│ 📊 Tu resumen de hoy - 28 Ene 2026      │
├─────────────────────────────────────────┤
│                                         │
│ 🎯 Lo más importante:                   │
│    • 2 leads nuevos esperan respuesta   │
│    • Cita con María mañana 10am         │
│    • Listing #45 tuvo 89 views (+45%)   │
│                                         │
│ 📈 Tus métricas:                        │
│    Tiempo respuesta: 45 min (meta: <1h) │
│    Leads respondidos: 8/8 (100% 🎉)     │
│    Citas completadas: 2/2               │
│                                         │
│ 💡 Siguiente paso:                      │
│    Responder a los 2 leads pendientes   │
│    [Ir al Inbox →]                      │
│                                         │
└─────────────────────────────────────────┘
```

## Controles de Usuario

```
┌─────────────────────────────────────────┐
│ ⚙️ Preferencias de notificaciones       │
├─────────────────────────────────────────┤
│                                         │
│ In-App:                                 │
│ ☑ Leads nuevos                          │
│ ☑ Mensajes nuevos                       │
│ ☑ Cambios de citas                      │
│ ☐ Sugerencias de optimización           │
│                                         │
│ Push:                                   │
│ ☑ Leads nuevos                          │
│ ☑ Mensajes nuevos                       │
│ ☐ Recordatorios de tareas               │
│                                         │
│ Email:                                  │
│ ☐ Cada notificación importante          │
│ ☑ Digest diario                         │
│ ☑ Resumen semanal                       │
│                                         │
│ Quiet Hours:                            │
│ ☑ Activar    De [21:00] a [08:00]       │
│   Excepto: ☑ Leads nuevos (siempre)     │
│                                         │
│ Límite diario: [20] notificaciones max  │
│                                         │
└─────────────────────────────────────────┘
```

---

# 8. DATA MODEL + STATE MACHINES

## TypeScript Interfaces

```typescript
// src/types/agents.ts

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
  profileCompletion: number; // 0-100
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
  geometry?: GeoJSON.Polygon; // Para polígonos custom
}

// ============ TEAM ============

export interface Team {
  id: string;
  name: string;
  logoUrl?: string;
  ownerId: string;
  members: TeamMember[];
  routingRules: RoutingRule[];
  settings: TeamSettings;
  createdAt: Date;
}

export interface TeamMember {
  agentId: string;
  role: TeamRole;
  joinedAt: Date;
  invitedBy: string;
}

export type TeamRole = 'owner' | 'admin' | 'agent' | 'assistant';

export interface RoutingRule {
  id: string;
  priority: number; // Lower = higher priority
  conditions: RoutingCondition[];
  assignTo: string[]; // Agent IDs
  strategy: 'round_robin' | 'least_busy' | 'specific';
  isActive: boolean;
}

export interface RoutingCondition {
  field: 'zone' | 'price' | 'type' | 'source';
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'in' | 'contains';
  value: string | number | string[];
}

export interface TeamSettings {
  sharedWallet: boolean;
  leadVisibility: 'own' | 'team' | 'all';
  notificationDefaults: NotificationPreferences;
}

// ============ LEADS ============

export interface Lead {
  id: string;
  // Contact info
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  // State
  stage: LeadStage;
  score?: number; // 0-100
  temperature: 'cold' | 'warm' | 'hot';
  // Assignment
  assignedTo: string; // Agent ID
  teamId?: string;
  // Context
  source: LeadSource;
  sourceDetails?: string; // e.g., listing ID, referrer name
  interestedIn: 'buy' | 'sell' | 'rent';
  propertyType?: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredZones?: string[];
  notes?: string;
  // Engagement
  lastContactedAt?: Date;
  lastActivityAt?: Date;
  nextFollowUpAt?: Date;
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  closeReason?: CloseReason;
}

export type LeadStage = 
  | 'new'
  | 'contacted'
  | 'engaged'
  | 'appointment_set'
  | 'met'
  | 'negotiating'
  | 'closed_won'
  | 'closed_lost'
  | 'archived';

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
  createdBy: string; // Agent or 'system'
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

// ============ CONVERSATIONS ============

export interface Conversation {
  id: string;
  leadId: string;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  status: ConversationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationParticipant {
  type: 'agent' | 'lead';
  id: string;
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
  agentId: string;
  listingId?: string;
  type: AppointmentType;
  status: AppointmentStatus;
  scheduledAt: Date;
  duration: number; // minutes
  location?: string;
  virtualLink?: string;
  notes?: string;
  reminders: AppointmentReminder[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  outcome?: AppointmentOutcome;
}

export type AppointmentType = 'showing' | 'consultation' | 'listing_presentation' | 'closing';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface AppointmentReminder {
  id: string;
  type: 'push' | 'email' | 'sms';
  scheduledFor: Date;
  sent: boolean;
}

export interface AppointmentOutcome {
  interested: boolean;
  feedback?: string;
  nextSteps?: string;
}

// ============ LISTINGS ============

export interface Listing {
  id: string;
  agentId: string;
  teamId?: string;
  // Property details
  address: Address;
  propertyType: PropertyType;
  listingType: 'sale' | 'rent';
  price: number;
  currency: string;
  // Characteristics
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  yearBuilt?: number;
  amenities: string[];
  description: string;
  // Media
  media: ListingMedia[];
  virtualTourUrl?: string;
  // Status
  status: ListingStatus;
  verificationStatus: VerificationStatus;
  // Activity
  viewCount: number;
  saveCount: number;
  inquiryCount: number;
  // Dates
  listedAt?: Date;
  expiresAt?: Date;
  soldAt?: Date;
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

export interface ListingActivityEvent {
  id: string;
  listingId: string;
  type: 'view' | 'save' | 'unsave' | 'inquiry' | 'share';
  userId?: string; // Anonymous if null
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// ============ CREDITS & BILLING ============

export interface CreditAccount {
  id: string;
  ownerId: string; // Agent or Team ID
  ownerType: 'agent' | 'team';
  balance: number;
  currency: 'credits';
  lowBalanceThreshold: number;
  dailyLimit?: number;
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
  balance: number; // Balance after transaction
  description: string;
  referenceType?: 'lead' | 'listing' | 'recharge' | 'refund';
  referenceId?: string;
  createdAt: Date;
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
  channels: NotificationChannel[];
  scheduledFor?: Date;
  sentAt?: Date;
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

export type NotificationChannel = 'in_app' | 'push' | 'email' | 'sms';

export interface NotificationPreferences {
  channels: {
    [K in NotificationType]?: NotificationChannel[];
  };
  quietHours?: {
    enabled: boolean;
    start: string; // "21:00"
    end: string;   // "08:00"
    timezone: string;
    exceptions?: NotificationType[];
  };
  dailyLimit?: number;
  digestEnabled: boolean;
  digestFrequency: 'daily' | 'weekly';
  digestTime: string; // "09:00"
}

// ============ TASKS ============

export interface Task {
  id: string;
  agentId: string;
  leadId?: string;
  listingId?: string;
  title: string;
  description?: string;
  dueAt?: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'cancelled';
  completedAt?: Date;
  createdAt: Date;
}

// ============ AUDIT ============

export interface AuditLog {
  id: string;
  actorId: string;
  actorType: 'agent' | 'system' | 'admin';
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
```

## State Machines

### Lead State Machine

```typescript
// src/lib/agents/machines/leadMachine.ts

import { createMachine, assign } from 'xstate';
import type { Lead, LeadStage } from '@/types/agents';

type LeadEvent =
  | { type: 'CONTACT' }
  | { type: 'ENGAGE' }
  | { type: 'SCHEDULE_APPOINTMENT' }
  | { type: 'COMPLETE_MEETING' }
  | { type: 'START_NEGOTIATION' }
  | { type: 'CLOSE_WON'; reason?: string }
  | { type: 'CLOSE_LOST'; reason: string }
  | { type: 'ARCHIVE' }
  | { type: 'REOPEN' };

type LeadContext = {
  lead: Lead;
  lastTransitionAt: Date;
};

export const leadMachine = createMachine({
  id: 'lead',
  initial: 'new',
  context: {} as LeadContext,
  states: {
    new: {
      on: {
        CONTACT: {
          target: 'contacted',
          actions: 'logTransition',
        },
        ARCHIVE: 'archived',
      },
      after: {
        // Auto-reminder si no se contacta en 24h
        86400000: { actions: 'sendStaleReminder' },
      },
    },
    contacted: {
      on: {
        ENGAGE: 'engaged',
        SCHEDULE_APPOINTMENT: 'appointment_set',
        CLOSE_LOST: {
          target: 'closed_lost',
          actions: 'setCloseReason',
        },
        ARCHIVE: 'archived',
      },
      after: {
        172800000: { actions: 'sendStaleReminder' }, // 48h
      },
    },
    engaged: {
      on: {
        SCHEDULE_APPOINTMENT: 'appointment_set',
        CLOSE_LOST: {
          target: 'closed_lost',
          actions: 'setCloseReason',
        },
        ARCHIVE: 'archived',
      },
    },
    appointment_set: {
      on: {
        COMPLETE_MEETING: 'met',
        CLOSE_LOST: {
          target: 'closed_lost',
          actions: 'setCloseReason',
        },
      },
    },
    met: {
      on: {
        START_NEGOTIATION: 'negotiating',
        SCHEDULE_APPOINTMENT: 'appointment_set', // Another appointment
        CLOSE_WON: {
          target: 'closed_won',
          actions: 'celebrate',
        },
        CLOSE_LOST: {
          target: 'closed_lost',
          actions: 'setCloseReason',
        },
      },
    },
    negotiating: {
      on: {
        CLOSE_WON: {
          target: 'closed_won',
          actions: 'celebrate',
        },
        CLOSE_LOST: {
          target: 'closed_lost',
          actions: 'setCloseReason',
        },
      },
    },
    closed_won: {
      type: 'final',
      entry: 'logClose',
    },
    closed_lost: {
      type: 'final',
      entry: 'logClose',
    },
    archived: {
      on: {
        REOPEN: 'new',
      },
    },
  },
});
```

### Appointment State Machine

```typescript
// src/lib/agents/machines/appointmentMachine.ts

import { createMachine } from 'xstate';
import type { Appointment, AppointmentStatus } from '@/types/agents';

type AppointmentEvent =
  | { type: 'CONFIRM' }
  | { type: 'CANCEL'; reason?: string }
  | { type: 'RESCHEDULE'; newTime: Date }
  | { type: 'COMPLETE'; outcome: Appointment['outcome'] }
  | { type: 'MARK_NO_SHOW' };

type AppointmentContext = {
  appointment: Appointment;
};

export const appointmentMachine = createMachine({
  id: 'appointment',
  initial: 'pending',
  context: {} as AppointmentContext,
  states: {
    pending: {
      on: {
        CONFIRM: {
          target: 'confirmed',
          actions: ['notifyParties', 'scheduleReminders'],
        },
        CANCEL: {
          target: 'cancelled',
          actions: 'notifyParties',
        },
        RESCHEDULE: {
          target: 'pending',
          actions: ['updateTime', 'notifyParties'],
        },
      },
      after: {
        // Si no se confirma en 24h antes de la cita, enviar reminder
        AUTO_REMINDER: { actions: 'sendConfirmationReminder' },
      },
    },
    confirmed: {
      on: {
        COMPLETE: {
          target: 'completed',
          actions: ['recordOutcome', 'requestFeedback'],
        },
        CANCEL: {
          target: 'cancelled',
          actions: 'notifyParties',
        },
        RESCHEDULE: {
          target: 'pending',
          actions: ['updateTime', 'notifyParties'],
        },
        MARK_NO_SHOW: {
          target: 'no_show',
          actions: 'logNoShow',
        },
      },
    },
    completed: {
      type: 'final',
      entry: 'updateLeadActivity',
    },
    cancelled: {
      type: 'final',
      entry: 'logCancellation',
    },
    no_show: {
      type: 'final',
      entry: 'updateLeadActivity',
    },
  },
});
```

---

# 9. LIBRERÍAS OSS RECOMENDADAS

## A) Data Grid / Tablas

| Librería | GitHub | Licencia | Stars | Última Actividad | TS | A11y | Tailwind | Recomendación |
|----------|--------|----------|-------|------------------|-----|------|----------|---------------|
| **TanStack Table** | tanstack/table | MIT | 25k+ | Activo (semanal) | ✅ Nativo | ✅ ARIA patterns | ✅ Headless | ⭐ **RECOMENDADA** |
| AG Grid (community) | ag-grid/ag-grid | MIT | 12k+ | Activo | ✅ | ✅ | Parcial | Features avanzadas detrás de pago |
| React Data Grid | adazzle/react-data-grid | MIT | 7k+ | Activo | ✅ | Básica | ❌ | Menos flexible |

**Decisión: TanStack Table v8**
- Headless (control total de UI)
- Virtualización via @tanstack/react-virtual
- Sorting, filtering, pagination, column resizing nativos
- Costo migración: Bajo (no hay tabla actual)

## B) Charts / Analytics

| Librería | GitHub | Licencia | Stars | TS | Bundle Size | Animaciones | Recomendación |
|----------|--------|----------|-------|-----|-------------|-------------|---------------|
| **Recharts** | recharts/recharts | MIT | 23k+ | ✅ | ~100kb | Básicas | ⭐ **RECOMENDADA** |
| Victory | FormidableLabs/victory | MIT | 11k+ | ✅ | ~150kb | Buenas | Ya lo usan, válido continuar |
| Tremor | tremorlabs/tremor | Apache-2.0 | 16k+ | ✅ | ~200kb | Buenas | Componentes completos, más opinionado |
| visx | airbnb/visx | MIT | 19k+ | ✅ | ~50kb (modular) | Limitadas | Low-level, más trabajo |

**Decisión: Continuar con Victory o migrar a Recharts**
- Victory ya está instalado → mantenerlo minimiza riesgo
- Si necesitan charts más simples y ligeros → Recharts
- Costo migración Victory→Recharts: ~2-3 días (reescribir componentes)

## C) Chat UI + Realtime

| Librería | GitHub | Licencia | Stars | TS | Virtualización | Recomendación |
|----------|--------|----------|-------|-----|----------------|---------------|
| **react-virtuoso** | petyosi/react-virtuoso | MIT | 5k+ | ✅ | ✅ Excelente | ⭐ **RECOMENDADA** |
| @chatscope/chat-ui-kit | chatscope/chat-ui-kit-react | MIT | 1.5k+ | ✅ | ❌ | UI completa pero pesada |
| stream-chat-react | GetStream/stream-chat-react | BSD | 1k+ | ✅ | ✅ | Requiere backend Stream (pago) |

**Decisión: Construir UI custom con react-virtuoso**
- Virtualización nativa para listas largas de mensajes
- Control total del diseño
- Integrar con estado real-time propio

## D) Calendario / Scheduling

| Librería | GitHub | Licencia | Stars | TS | Vistas | Drag & Drop | Recomendación |
|----------|--------|----------|-------|-----|--------|-------------|---------------|
| **react-big-calendar** | jquense/react-big-calendar | MIT | 8k+ | ✅ (types) | Mes/Semana/Día/Agenda | ✅ | ⭐ **RECOMENDADA** |
| FullCalendar | fullcalendar/fullcalendar | MIT | 18k+ | ✅ | Todas | ✅ | Premium features pagas |
| Schedule-X | schedule-x/schedule-x | MIT | 1k+ | ✅ | Mes/Semana/Día | ✅ | Nuevo, menos maduro |
| react-day-picker | gpbl/react-day-picker | MIT | 6k+ | ✅ | Solo picker | ❌ | No es calendario completo |

**Decisión: react-big-calendar**
- Gratis 100%
- Todas las vistas necesarias
- Drag & drop para reschedule
- Customizable con Tailwind

## E) Forms / Validation

| Librería | GitHub | Licencia | Stars | TS | Recomendación |
|----------|--------|----------|-------|-----|---------------|
| **react-hook-form** | react-hook-form/react-hook-form | MIT | 42k+ | ✅ | ⭐ **RECOMENDADA** (ya instalado) |
| **zod** | colinhacks/zod | MIT | 34k+ | ✅ Nativo | ⭐ **RECOMENDADA** (ya instalado) |
| Formik | jaredpalmer/formik | Apache-2.0 | 34k+ | ✅ | Más verbose |
| yup | jquense/yup | MIT | 23k+ | ✅ | Alternativa a Zod |

**Decisión: Mantener react-hook-form + zod**
- Ya instalados en el proyecto
- Mejor combo DX + performance
- @hookform/resolvers ya presente

## F) Notificaciones UI

| Librería | GitHub | Licencia | Stars | TS | Acciones | Stacking | Recomendación |
|----------|--------|----------|-------|-----|----------|----------|---------------|
| **Sonner** | emilkowalski/sonner | MIT | 9k+ | ✅ | ✅ | ✅ | ⭐ **RECOMENDADA** (ya instalado) |
| react-hot-toast | timolins/react-hot-toast | MIT | 10k+ | ✅ | Limitadas | ✅ | Más simple |
| notistack | iamhosseindhv/notistack | MIT | 4k+ | ✅ | ✅ | ✅ | Para MUI |

**Decisión: Mantener Sonner**
- Ya instalado
- API excelente
- Animaciones suaves nativas

**Para Notification Center (no solo toasts):**
Construir componente custom con:
- Lista virtualizada (react-virtuoso)
- Popover (Radix, ya disponible)
- Estado persistente en backend

## G) Micro-interactions / Motion

| Librería | GitHub | Licencia | Stars | TS | Uso | Recomendación |
|----------|--------|----------|-------|-----|-----|---------------|
| **framer-motion** | framer/motion | MIT | 24k+ | ✅ | Animaciones declarativas | ⭐ **MANTENER** |
| react-spring | pmndrs/react-spring | MIT | 28k+ | ✅ | Physics-based | Alternativa, no migrar |
| @use-gesture/react | pmndrs/use-gesture | MIT | 9k+ | ✅ | Gestures (drag, pinch) | ✅ Complemento |
| canvas-confetti | catdad/canvas-confetti | ISC | 10k+ | ✅ (types) | Confetti celebrations | ✅ Para milestones |
| lottie-react | Gamote/lottie-react | MIT | 800+ | ✅ | Lottie animations | Solo si hay assets Lottie |

**Decisión:**
- Mantener framer-motion como base
- Agregar @use-gesture para drag mejorado en kanban
- Agregar canvas-confetti para celebraciones puntuales

## H) Command Palette + Hotkeys

| Librería | GitHub | Licencia | Stars | TS | Recomendación |
|----------|--------|----------|-------|-----|---------------|
| **cmdk** | pacocoursey/cmdk | MIT | 10k+ | ✅ | ⭐ **RECOMENDADA** (ya en shadcn) |
| kbar | timc1/kbar | MIT | 5k+ | ✅ | Más features, más peso |
| react-hotkeys-hook | JohannesKlawornn/react-hotkeys-hook | MIT | 2.5k+ | ✅ | ✅ Para atajos globales |

**Decisión:**
- Usar cmdk (ya disponible via shadcn Command)
- Agregar react-hotkeys-hook para atajos globales (g+l, g+i, etc.)

## Resumen de Instalaciones Nuevas

```bash
# Nuevas dependencias
bun add @tanstack/react-table @tanstack/react-virtual
bun add react-big-calendar date-fns
bun add react-virtuoso
bun add @use-gesture/react
bun add canvas-confetti
bun add react-hotkeys-hook
bun add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Types si aplica
bun add -D @types/react-big-calendar @types/canvas-confetti
```

---

# 10. PLAN DE IMPLEMENTACIÓN

## Estructura de Carpetas

```
src/
├── pages/
│   └── agents/
│       ├── index.tsx              # Redirect to /overview
│       ├── overview.tsx           # Dashboard
│       ├── leads/
│       │   ├── index.tsx          # Pipeline + lista
│       │   └── [id].tsx           # Detalle de lead
│       ├── inbox/
│       │   ├── index.tsx          # Lista de conversaciones
│       │   └── [id].tsx           # Thread de chat
│       ├── calendar/
│       │   └── index.tsx          # Calendario
│       ├── listings/
│       │   ├── index.tsx          # Grid de listings
│       │   ├── [id].tsx           # Detalle
│       │   └── new.tsx            # Wizard crear
│       ├── credits/
│       │   └── index.tsx          # Saldo + ledger
│       ├── team/
│       │   └── index.tsx          # Miembros + roles
│       ├── reports/
│       │   └── index.tsx          # Dashboards
│       └── settings/
│           ├── index.tsx          # Overview settings
│           ├── profile.tsx
│           ├── notifications.tsx
│           └── zones.tsx
│
├── components/
│   └── agents/
│       ├── layout/
│       │   ├── AgentLayout.tsx    # Layout con sidebar
│       │   ├── AgentSidebar.tsx
│       │   ├── AgentTopbar.tsx
│       │   └── CommandPalette.tsx
│       ├── leads/
│       │   ├── LeadPipeline.tsx   # Kanban
│       │   ├── LeadCard.tsx
│       │   ├── LeadDetail.tsx
│       │   ├── LeadTimeline.tsx
│       │   └── LeadFilters.tsx
│       ├── inbox/
│       │   ├── ConversationList.tsx
│       │   ├── ChatThread.tsx
│       │   ├── MessageBubble.tsx
│       │   ├── MessageInput.tsx
│       │   └── TemplateSelector.tsx
│       ├── calendar/
│       │   ├── AgentCalendar.tsx
│       │   ├── AppointmentForm.tsx
│       │   └── AppointmentCard.tsx
│       ├── listings/
│       │   ├── ListingGrid.tsx
│       │   ├── ListingCard.tsx
│       │   ├── ListingDetail.tsx
│       │   ├── ListingForm.tsx
│       │   └── ActivityFeed.tsx
│       ├── credits/
│       │   ├── BalanceCard.tsx
│       │   ├── LedgerTable.tsx
│       │   └── RulesConfig.tsx
│       ├── team/
│       │   ├── MemberList.tsx
│       │   ├── InviteModal.tsx
│       │   └── RoutingRules.tsx
│       ├── reports/
│       │   ├── OverviewDashboard.tsx
│       │   ├── ResponseTimeChart.tsx
│       │   └── ConversionFunnel.tsx
│       ├── notifications/
│       │   ├── NotificationCenter.tsx
│       │   ├── NotificationItem.tsx
│       │   └── NotificationPrefs.tsx
│       └── shared/
│           ├── AgentAvatar.tsx
│           ├── StatusBadge.tsx
│           ├── EmptyState.tsx
│           ├── LoadingSkeleton.tsx
│           └── MicroConfirmation.tsx
│
├── lib/
│   └── agents/
│       ├── api/
│       │   ├── leads.ts           # API calls (mock for now)
│       │   ├── conversations.ts
│       │   ├── appointments.ts
│       │   ├── listings.ts
│       │   └── credits.ts
│       ├── hooks/
│       │   ├── useLeads.ts
│       │   ├── useConversations.ts
│       │   ├── useAppointments.ts
│       │   ├── useListings.ts
│       │   ├── useCredits.ts
│       │   ├── useNotifications.ts
│       │   └── useAgent.ts
│       ├── machines/
│       │   ├── leadMachine.ts
│       │   └── appointmentMachine.ts
│       ├── motion/
│       │   ├── tokens.ts          # Duration, easing, distance
│       │   ├── variants.ts        # Common animation variants
│       │   └── useReducedMotion.ts
│       ├── utils/
│       │   ├── formatters.ts
│       │   └── validators.ts
│       └── fixtures/
│           ├── agents.ts
│           ├── leads.ts
│           ├── conversations.ts
│           ├── appointments.ts
│           └── listings.ts
│
├── types/
│   └── agents.ts                  # Todas las interfaces
│
└── test/
    └── agents/
        ├── leads.test.ts
        └── appointments.test.ts
```

## Routing con Layout Anidado

```typescript
// src/App.tsx (adiciones)

import AgentLayout from '@/components/agents/layout/AgentLayout';

// Dentro de Routes:
<Route path="/agents" element={<AgentLayout />}>
  <Route index element={<Navigate to="overview" replace />} />
  <Route path="overview" element={<AgentOverview />} />
  <Route path="leads" element={<AgentLeads />} />
  <Route path="leads/:id" element={<LeadDetail />} />
  <Route path="inbox" element={<AgentInbox />} />
  <Route path="inbox/:id" element={<ChatThread />} />
  <Route path="calendar" element={<AgentCalendar />} />
  <Route path="listings" element={<AgentListings />} />
  <Route path="listings/new" element={<ListingWizard />} />
  <Route path="listings/:id" element={<ListingDetail />} />
  <Route path="credits" element={<AgentCredits />} />
  <Route path="team" element={<AgentTeam />} />
  <Route path="reports" element={<AgentReports />} />
  <Route path="settings" element={<AgentSettings />} />
  <Route path="settings/profile" element={<ProfileSettings />} />
  <Route path="settings/notifications" element={<NotificationSettings />} />
  <Route path="settings/zones" element={<ZoneSettings />} />
</Route>
```

## Guards Placeholder

```typescript
// src/lib/agents/hooks/useAgentAuth.ts

export function useAgentAuth() {
  // TODO: Implementar con backend real
  const agent = useMockAgent(); // Fixture
  
  return {
    agent,
    isAuthenticated: !!agent,
    isLoading: false,
    can: (permission: string) => {
      // Placeholder permission check
      return true;
    },
  };
}

// En AgentLayout:
const { isAuthenticated, isLoading } = useAgentAuth();

if (isLoading) return <LoadingScreen />;
if (!isAuthenticated) return <Navigate to="/login" />;

return <Outlet />;
```

## Mock Data + MSW Strategy

```typescript
// src/lib/agents/fixtures/leads.ts

export const mockLeads: Lead[] = [
  {
    id: 'lead-1',
    firstName: 'María',
    lastName: 'García',
    email: 'maria@example.com',
    phone: '+52 55 1234 5678',
    stage: 'engaged',
    score: 75,
    temperature: 'hot',
    assignedTo: 'agent-1',
    source: 'marketplace',
    interestedIn: 'buy',
    budgetMin: 200000,
    budgetMax: 350000,
    createdAt: new Date('2026-01-25'),
    updatedAt: new Date('2026-01-28'),
  },
  // ... más leads
];

// Para desarrollo más realista, agregar MSW:
// src/mocks/handlers.ts

import { http, HttpResponse } from 'msw';
import { mockLeads } from '@/lib/agents/fixtures/leads';

export const handlers = [
  http.get('/api/agents/leads', () => {
    return HttpResponse.json(mockLeads);
  }),
  
  http.patch('/api/agents/leads/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json();
    // Simular delay
    await new Promise(r => setTimeout(r, 300));
    return HttpResponse.json({ ...mockLeads.find(l => l.id === id), ...updates });
  }),
];
```

## Checklist de PR

### Para cada componente:

- [ ] **Empty state**: Diseño claro cuando no hay datos
- [ ] **Loading state**: Skeleton coherente con layout final
- [ ] **Error state**: Mensaje de error + acción de retry
- [ ] **A11y**: 
  - [ ] Labels en todos los inputs
  - [ ] ARIA roles donde aplique
  - [ ] Focus visible
  - [ ] Color contrast ≥4.5:1
- [ ] **Keyboard navigation**:
  - [ ] Tab order lógico
  - [ ] Enter/Space activan botones
  - [ ] Escape cierra modals/drawers
- [ ] **Reduced motion**:
  - [ ] useReducedMotion hook implementado
  - [ ] Fallback a transiciones instantáneas
- [ ] **Testing básico**:
  - [ ] Render sin crash
  - [ ] Estados principales renderean correctamente
  - [ ] Acciones principales disparan callbacks

---

# 11. REPORTING + MÉTRICAS + SCORE DEL AGENTE

## KPIs Visibles en Dashboard

| Métrica | Definición | Meta sugerida | Cómo mostrar |
|---------|------------|---------------|--------------|
| **Tiempo de respuesta** | Mediana de tiempo entre mensaje entrante y primera respuesta | <1 hora | Gauge: verde <1h, amarillo 1-4h, rojo >4h |
| **Tasa de respuesta** | % de leads con al menos 1 respuesta en <24h | >90% | Porcentaje con trend |
| **Leads activos** | Leads en stages no-finales | - | Número con breakdown por stage |
| **Citas esta semana** | Appointments scheduled | - | Número + calendar mini |
| **Tasa de no-show** | % citas con status no_show | <10% | Porcentaje inverso |
| **Conversión a cita** | % leads que llegan a appointment_set | - | Funnel chart |
| **Cierre (won)** | % leads que llegan a closed_won | - | Funnel chart |
| **Performance por listing** | Views/saves/inquiries por listing | - | Bar chart comparativo |
| **Performance por zona** | Leads y conversiones por zona | - | Mapa heat o tabla |

## Agent Health Score

**Objetivo**: Un número 0-100 que refleje la "salud" del agente, calculable y explicable.

### Componentes del Score

| Factor | Peso | Cálculo |
|--------|------|---------|
| **Responsividad** | 30% | 100 - (avg_response_time_hours * 10), min 0 |
| **Seguimiento** | 25% | % leads con actividad en últimos 7 días |
| **Conversión** | 25% | (leads_to_appointment / total_leads) * 100 |
| **Perfil** | 10% | profile_completion (0-100) |
| **Reviews** | 10% | avg_rating * 20 (si hay reviews) |

### Cómo mostrarlo

```
┌─────────────────────────────────────────┐
│ Tu Score de Agente                      │
│                                         │
│         ┌─────────────────┐             │
│         │      78         │             │
│         │    / 100        │             │
│         └─────────────────┘             │
│         [████████░░] Bueno              │
│                                         │
│ Desglose:                               │
│ • Responsividad: 85 ✓                   │
│ • Seguimiento: 70 ⚠️ Mejorable          │
│ • Conversión: 75                        │
│ • Perfil: 90 ✓                          │
│ • Reviews: 80                           │
│                                         │
│ 💡 Consejo: Responde a los 3 leads      │
│    sin actividad esta semana            │
│                                         │
└─────────────────────────────────────────┘
```

### Evitar frustración

- **No mostrar score en rojo nunca**: Usar colores neutros para scores bajos
- **Siempre dar una acción concreta**: "Haz X para subir Y puntos"
- **Trend positivo**: Mostrar "↑5 vs mes pasado" cuando mejora
- **Ocultar si no hay datos**: "Necesitas más actividad para calcular tu score"

---

# 12. RIESGOS Y DECISIONES ABIERTAS

## Riesgos Técnicos

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| **PII en chats** | Alto (legal, GDPR) | Encriptación E2E, políticas de retención, no loggear contenido |
| **Spam/fraude leads** | Medio | Rate limiting, verificación teléfono, honeypots |
| **Suplantación agente** | Alto | Verificación de licencia obligatoria, badges verificados |
| **Performance front con muchos leads** | Medio | Virtualización, paginación, lazy loading |
| **Sincronización real-time** | Medio | Optimistic updates + reconciliación, WebSockets con fallback polling |
| **Offline support** | Bajo (MVP) | Diferir a V2, solo mostrar estado offline |

## Riesgos de UX

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| **Notification fatigue** | Alto | Controles granulares, quiet hours, límites diarios |
| **Score frustrante** | Medio | Siempre positivo, acciones claras, no rankings públicos |
| **Onboarding largo** | Medio | Progressive disclosure, guardar progreso, skip opcional |
| **Mobile constraints** | Medio | Diseño mobile-first en componentes críticos (inbox, calendar) |

## Decisiones Abiertas

| Decisión | Opciones | Recomendación | Deadline |
|----------|----------|---------------|----------|
| **Charts: Victory vs Recharts** | Mantener Victory / Migrar | Mantener Victory (ya instalado) | Antes de MVP |
| **Real-time: WebSockets vs Polling** | WS nativo / Socket.io / Supabase Realtime | Depende de backend elegido | Pre-backend |
| **i18n desde MVP** | Sí / No | No en MVP, preparar estructura | V1 |
| **State management global** | Zustand / Jotai / React Query only | React Query + Zustand para UI state | Semana 1 |
| **Testing strategy** | Unit + Integration / E2E | Unit + Integration MVP, E2E en V1 | Semana 1 |

## Seguridad UX

- **Report/Block usuario**: Implementar desde MVP, visible pero no invasivo
- **Audit log**: Loggear todas las acciones sensibles (cambios de stage, mensajes, assignments)
- **Verificación 2FA**: Opcional MVP, obligatoria para admins en V1

---

# SIGUIENTE PASO RECOMENDADO (MAÑANA)

## Día 1: Foundation (8 horas)

1. **Instalar dependencias** (30 min)
   ```bash
   bun add @tanstack/react-table @tanstack/react-virtual react-big-calendar @dnd-kit/core @dnd-kit/sortable @use-gesture/react canvas-confetti react-hotkeys-hook xstate @xstate/react date-fns
   bun add -D @types/react-big-calendar
   ```

2. **Crear estructura de carpetas** (15 min)
   - Crear todos los directorios según plan

3. **Implementar types/agents.ts** (1 hora)
   - Copiar interfaces del Data Model

4. **Implementar motion tokens + variants** (1 hora)
   - src/lib/agents/motion/tokens.ts
   - src/lib/agents/motion/variants.ts

5. **AgentLayout + Sidebar + Topbar** (3 horas)
   - Layout responsive
   - Navegación funcional
   - Command palette básico

6. **Fixtures de datos mock** (1.5 horas)
   - leads, conversations, appointments, listings

7. **Routing completo con guards placeholder** (1 hora)
   - Todas las rutas definidas
   - Páginas placeholder

## Día 2: Core Components (8 horas)

1. **LeadPipeline (Kanban)** con dnd-kit (4 horas)
   - Drag & drop entre stages
   - Optimistic updates
   - Micro-feedback (confetti sutil al cerrar won)

2. **ConversationList + ChatThread básico** (4 horas)
   - Lista virtualizada
   - Mensajes con estados
   - Input con templates

## Día 3: Calendar + Listings + Polish (8 horas)

1. **AgentCalendar** con react-big-calendar (3 horas)
   - Vistas semana/mes
   - Crear/ver citas

2. **ListingGrid + ListingCard** (2 horas)
   - Grid responsive
   - Estados y badges

3. **NotificationCenter** (1.5 horas)
   - Popover con lista
   - Mark as read

4. **Testing básico + A11y check** (1.5 horas)
   - Smoke tests
   - Keyboard nav
   - Screen reader basics

---

**Confirmado vs Hipótesis aplicado a este documento:**

| Sección | Status |
|---------|--------|
| Zillow features core | ✅ Confirmado (docs públicos) |
| Zillow gamification | ❓ Hipótesis (no encontrado) |
| OSS libraries | ✅ Confirmado (GitHub, npm) |
| Motion tokens | ✅ Best practices (framer-motion docs) |
| Data model | ✅ Diseño propio (basado en patterns CRM) |
| State machines | ✅ Diseño propio (basado en workflows reales) |
| Agent Score | ❓ Propuesta (validar con usuarios) |
| Retention triggers | ✅ Basado en literatura de habit loops |

---

*Documento generado: 2026-01-29*
*Autor: Product Lead + Staff Frontend Engineer*
*Branch: Feature-Page-DashboardAgents-28-01-2026*
