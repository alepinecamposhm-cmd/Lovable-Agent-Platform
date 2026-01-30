# AGENT-PLATFORM-SPEC.md
# Portal de Agentes Inmobiliarios (Agent Oasis) — Especificación Canónica

Versión: 1.0  
Estado: Borrador canónico (Source of Truth)  
Última actualización: 2026-01-29  
Owner: Producto + Frontend (por definir nombres)  

Este documento define, con nivel de detalle accionable, el alcance, UX/UI, reglas, modelos de datos, analítica, seguridad y criterios de implementación del Portal de Agentes Inmobiliarios. Debe ser la referencia única para abrir issues, planificar sprints y revisar PRs.

---

## Tabla de contenidos

0. [Evidencia interna del repositorio (escaneo)](#0-evidencia-interna-del-repositorio-escaneo)  
1. [Resumen ejecutivo](#1-resumen-ejecutivo)  
2. [Objetivos y KPIs](#2-objetivos-y-kpis)  
3. [Alcance: MVP / V1 / No-alcance](#3-alcance-mvp--v1--no-alcance)  
4. [Principios de producto y UX](#4-principios-de-producto-y-ux)  
5. [Personas y Jobs-to-be-done](#5-personas-y-jobs-to-be-done)  
6. [Roles y permisos (RBAC)](#6-roles-y-permisos-rbac)  
7. [Arquitectura funcional (mapa de módulos)](#7-arquitectura-funcional-mapa-de-módulos)  
8. [Módulo: Leads Inbox](#8-módulo-leads-inbox)  
9. [Módulo: CRM / Pipeline](#9-módulo-crm--pipeline)  
10. [Módulo: Contactos (unificación + dedupe)](#10-módulo-contactos-unificación--dedupe)  
11. [Módulo: Actividades + Timeline + Tasks](#11-módulo-actividades--timeline--tasks)  
12. [Módulo: Propiedades / Matching](#12-módulo-propiedades--matching)  
13. [Sistema de Créditos](#13-sistema-de-créditos)  
14. [Flujos E2E críticos](#14-flujos-e2e-críticos)  
15. [UI/UX: Information Architecture + Navegación](#15-uiux-information-architecture--navegación)  
16. [Diseño de componentes (Design System operacional)](#16-diseño-de-componentes-design-system-operacional)  
17. [Microinteracciones (mínimo 30)](#17-microinteracciones-mínimo-30)  
18. [Estados del sistema (globales)](#18-estados-del-sistema-globales)  
19. [Datos y entidades (modelo conceptual)](#19-datos-y-entidades-modelo-conceptual)  
20. [Integraciones (presentes/futuras) + estrategia](#20-integraciones-presentesfuturas--estrategia)  
21. [Analítica y observabilidad](#21-analítica-y-observabilidad)  
22. [Seguridad, privacidad y auditoría](#22-seguridad-privacidad-y-auditoría)  
23. [Performance y escalabilidad](#23-performance-y-escalabilidad)  
24. [Riesgos y mitigaciones](#24-riesgos-y-mitigaciones)  
25. [Supuestos y decisiones pendientes (TODO priorizado)](#25-supuestos-y-decisiones-pendientes-todo-priorizado)  
26. [Glosario + Convenciones terminológicas](#26-glosario--convenciones-terminológicas)  

---

## 0. Evidencia interna del repositorio (escaneo)

Este documento NO asume implementación existente del Portal de Agentes. Antes de especificar, se revisó la evidencia disponible en el repo (archivos de referencia y extractos). Hallazgos:

1. Stack frontend: Vite + React + TypeScript + Tailwind CSS + shadcn-ui (configurado con `components.json`).
2. Routing: React Router. Rutas actuales documentadas: `/`, `/properties`, `/property/:id`, `*` (NotFound).
3. Alias de imports: `@/* -> src/*` (en `tsconfig*.json` y se menciona en `vite.config.ts`).
4. Gestión de dependencias: npm es lockfile canónico (existe `package-lock.json` según guía); hay `bun.lockb` pero no es canónico.
5. Scripts confirmados por guía interna: `npm run dev`, `build`, `build:dev`, `preview`, `lint`. No hay runner de tests configurado.
6. Vite corre en puerto `8080` (según guía interna).
7. UI primitives: `src/components/ui/*` (shadcn/Radix). `cn()` (clsx + tailwind-merge) en `src/lib/utils.ts`.
8. Tokens de tema: CSS variables (HSL) en `src/index.css`, consumidas por Tailwind (`tailwind.config.ts`).
9. Tailwind extendido con colores semánticos y custom: `onyx`, `graphite`, `porcelain`, `silver`, `champagne`, `emerald`. Animaciones definidas: `fade-in`, `scale-in`, `accordion-*`. Plugin: `tailwindcss-animate`.
10. Uso de `framer-motion` en componentes existentes (p. ej. páginas/feature de comparador e historial).
11. Uso de `Victory` para charts (p. ej. secciones de historial de precios).
12. Uso de `lucide-react` para iconografía.
13. Datos actuales del marketplace: fuente estática `src/data/properties.ts` (según guía interna).
14. Modelo de propiedad y eventos de timeline: `src/types/property.ts` + normalización `src/lib/propertyTimeline.ts`.
15. Proveedores de app: `QueryClientProvider` (TanStack Query) + providers de tooltip/toast (según guía interna).
16. Integración de desarrollo: `lovable-tagger` en modo dev (según guía interna).
17. No existe evidencia interna de rutas `/agents` ni de módulos de Portal de Agentes implementados actualmente (por definir/por implementar).
18. TS strictness: `tsconfig.app.json` con `strict: false`, `strictNullChecks: false` y varias reglas relajadas (impacto en calidad/seguridad de tipos; se aborda en Performance/Seguridad como decisión pendiente).

Implicación: el Portal de Agentes se diseñará como un conjunto nuevo de rutas y módulos dentro de la SPA existente, reutilizando primitives UI, estilos, patrones de routing, motion y data fetching ya presentes.

---

## 1. Resumen ejecutivo

### Problema
Los agentes pierden leads, responden tarde y no tienen un sistema unificado para:
- Inbox de mensajes con contexto.
- Pipeline con etapas y seguimiento.
- Agenda de citas/visitas.
- Registro de actividades y tareas.
- Control de créditos y consumo para monetización (boosts, verificación, etc.).

Esto produce baja conversión, mala experiencia para el usuario final y fricción operacional para equipos.

### Usuario
Agentes individuales y agencias/equipos pequeños que operan dentro del marketplace.

### Propuesta de valor
Un portal operativo (no decorativo) que permite:
- Responder y dar seguimiento en minutos, con SLA visible.
- Convertir leads en citas y cierres mediante un pipeline claro y tareas accionables.
- Medir desempeño con métricas útiles y explicables.
- Monetizar mediante un sistema de créditos transparente y antifraude.

---

## 2. Objetivos y KPIs

### 2.1 Objetivos de negocio
1. Aumentar conversión lead → cita y lead → cierre.
2. Reducir tiempo de respuesta inicial.
3. Crear base para monetización (créditos) sin degradar confianza.
4. Habilitar escalamiento a equipos (RBAC + routing) sin reescrituras.

### 2.2 Objetivos del usuario (agente)
1. Ver “qué cambió” desde la última visita: mensajes, leads, tareas, citas.
2. Ejecutar siguientes acciones en <30 segundos desde el dashboard.
3. Tener historial confiable (mensajes, tareas, cambios de etapa, notas).
4. Entender gasto/consumo de créditos y su impacto.

### 2.3 KPIs por etapa (definición + fórmula)

| Etapa | KPI | Definición | Fórmula | Frecuencia | Fuente |
|---|---|---|---|---|---|
| Activación | Perfil completo | % agentes con setup mínimo completado | agentes_con_setup_min / agentes_registrados | diaria | Portal |
| Activación | Primera respuesta | % agentes que responden ≥1 lead en 24h desde registro | agentes_con_1ra_respuesta_24h / agentes_registrados | diaria | Inbox |
| Engagement | Sesiones diarias | % agentes con ≥1 sesión/día | agentes_DAU / agentes_activos | diaria | Telemetría |
| Engagement | “Return triggers” consumidos | Leads/mensajes/tareas vistos en sesión | conteo_eventos_vistos_por_sesión | diaria | Eventos |
| Eficiencia | Tiempo de respuesta inicial (TTR) | Mediana de minutos a primer reply | median( first_reply_at - lead_created_at ) | diaria/sem | Inbox |
| Eficiencia | SLA incumplido | % leads nuevos sin respuesta en X horas | leads_sla_breached / leads_nuevos | diaria | SLA |
| Conversión | Lead → Cita | % leads que alcanzan etapa “Cita programada” | leads_con_cita / leads_nuevos | semanal | Pipeline |
| Conversión | Cita → Oferta | % citas con outcome “Oferta” | ofertas / citas_realizadas | mensual | Actividades |
| Retención | WAU/MAU | Sticky factor | WAU / MAU | semanal/mensual | Telemetría |
| Retención | Cohorte D7 / D30 | Retención por cohorte | usuarios_activos_DN / usuarios_iniciales | semanal | Telemetría |
| Monetización | ARPA créditos | Créditos consumidos por agente activo | créditos_consumidos / agentes_activos | semanal | Ledger |
| Monetización | Disputa de ledger | % transacciones disputadas | tx_disputadas / tx_totales | mensual | Auditoría |

Notas:
- Valores objetivo (targets) se definen en “Por definir” y se ajustan tras piloto.
- KPI “Tiempo de respuesta” se calcula por lead y por conversación (según canal).

---

## 3. Alcance: MVP / V1 / No-alcance

### 3.1 MVP (sí o sí)
1. Leads Inbox:
   - Lista de conversaciones/threads, filtros, estados (nuevo/en curso/cerrado).
   - Vista conversación (mensajes) con contexto del lead.
   - Notas internas y tareas desde el hilo.
   - Plantillas básicas (quick replies).
2. CRM / Pipeline:
   - Kanban + lista alternativa.
   - Etapas estándar; mover etapas con undo.
   - SLA y recordatorios.
3. Contactos:
   - Unificación lead/contacto.
   - Dedupe básico (email/teléfono) con sugerencias de merge.
4. Actividades + Timeline + Tasks:
   - Log de eventos (mensajes, llamadas manuales, cambios de etapa).
   - Tasks con due date, prioridad, estado y recordatorios in-app.
5. Sistema de Créditos (MVP operativo):
   - Saldo, ledger, consumo para al menos 2 “productos” (por ejemplo: verificación y boost).
   - Reglas de idempotencia + antifraude básicas.
   - UX de errores y soporte.
6. Navegación / IA:
   - `/agents/*` con layout propio (sidebar + topbar).
   - Command palette básico y atajos principales.
7. Analítica mínima:
   - Eventos críticos (lead recibido, mensaje enviado, etapa cambiada, cita creada, crédito consumido).

### 3.2 V1 (expansión)
- Equipo y roles (RBAC completo), invitaciones, reasignación, routing simple.
- Calendario con vistas semana/mes (si en MVP solo hay lista de tareas/citas).
- Reportes iniciales y “score” explicable.
- Integraciones (por definir): calendario externo, notificaciones push, etc.
- Automatizaciones: reglas de tareas sugeridas y follow-ups.

### 3.3 No-alcance (explícito)
- Selección de proveedor de backend/infra (AWS/Supabase/etc). Fuera de alcance: decisión técnica final.
- Integración completa con telefonía/SMS si implica licencias o servicios pagos (solo especificación UI/contratos).
- IA generativa en producción (solo espacio para futuro).
- MLS/IDX integraciones complejas (futuro).

---

## 4. Principios de producto y UX

1. Utilidad antes que ornamentación: la interacción debe acelerar decisiones.
2. “Qué cambió” primero: cada visita debe mostrar novedades relevantes.
3. Progreso visible: el agente debe sentir avance (etapas, tareas, SLA).
4. Feedback inmediato: acciones con confirmación <100ms (optimistic UI cuando aplique).
5. Reversibilidad: undo para acciones de alto riesgo (mover etapa, cerrar lead, consumir créditos si no ha ejecutado el “producto”).
6. Transparencia: créditos y consumo siempre explicables (ledger claro).
7. Accesibilidad y control: soporte `prefers-reduced-motion`, keyboard-first y estados visibles.
8. No dark patterns: notificaciones controlables, quiet hours, sin trampas de compra.
9. Consistencia: mismos patrones de list/detail, drawers, chips y estados en todo el portal.
10. Rendimiento como feature: listas grandes virtualizadas, filtros persistentes, cargas progresivas.
11. Datos confiables: dedupe y auditoría para evitar historial incoherente.
12. Colaboración segura: RBAC explícito; acciones registradas (audit log).
13. “Next best action”: el sistema sugiere, el agente decide.
14. Minimizar fricción: formularios cortos, defaults inteligentes, autoguardado visible.
15. Escalable por diseño: cada módulo define contratos y eventos desde el inicio.

---

## 5. Personas y Jobs-to-be-done

### Persona 1: Agente independiente (alto volumen)
- JTBD: “Cuando recibo leads, necesito responder rápido y dar seguimiento sin perder contexto para convertirlos en citas.”
- Dolor: se le pierden chats y olvidos de follow-up.

### Persona 2: Agente nuevo (bajo volumen, alta incertidumbre)
- JTBD: “Necesito una guía de pasos claros para no olvidar nada y aprender el proceso.”
- Dolor: no sabe qué hacer después de un primer contacto.

### Persona 3: Team lead / Broker (gestión de equipo)
- JTBD: “Necesito visibilidad y control: asignar leads, medir respuesta y redistribuir carga.”
- Dolor: falta de SLA y trazabilidad.

### Persona 4: Coordinador/Asistente
- JTBD: “Necesito agendar citas y hacer seguimiento por el agente con permisos limitados.”
- Dolor: acceso a datos sensibles y falta de estructura.

---

## 6. Roles y permisos (RBAC)

### 6.1 Roles (definición)
- Agent: gestiona sus leads, inbox, tareas, citas, créditos (si está habilitado).
- Team Lead: ve y gestiona leads del equipo, reasigna, define reglas simples.
- Broker/Admin Agencia: administra usuarios, permisos, créditos a nivel agencia, reportes.
- Assistant: puede crear citas/tareas y registrar actividades, pero no ver ciertos datos financieros.
- Finance/Billing: acceso a ledger y facturación (si aplica), sin acceso a conversaciones.
- Support (interno): acceso controlado y auditado para soporte.

### 6.2 Matriz de permisos por módulo (ejemplo MVP; V1 expande)

Leyenda: R=Read, W=Write, A=Admin

| Módulo | Agent | Assistant | Team Lead | Broker/Admin | Finance | Support |
|---|---:|---:|---:|---:|---:|---:|
| Leads Inbox | R/W | R/W (limitado) | R/W (equipo) | R/W/A | - | R (auditado) |
| CRM/Pipeline | R/W | R/W (limitado) | R/W/A (equipo) | R/W/A | - | R |
| Contactos | R/W | R/W (limitado) | R/W (equipo) | R/W/A | - | R |
| Activities/Tasks | R/W | R/W | R/W (equipo) | R/W/A | - | R |
| Propiedades/Matching | R/W (si aplica) | R (si aplica) | R/W | R/W/A | - | R |
| Créditos (saldo) | R | - | R | R/W/A | R/W/A | R (auditado) |
| Créditos (ledger) | R | - | R | R/W/A | R/W/A | R (auditado) |
| Configuración | R/W (propia) | - | R/W (equipo) | R/W/A | - | - |

Notas:
- “Support” siempre bajo auditoría (quién, cuándo, por qué se accedió).
- “Assistant” no puede ver datos financieros, ni exportar leads masivamente (antifuga).

---

## 7. Arquitectura funcional (mapa de módulos)

### 7.1 Mapa
- Overview (dashboard operativo): “inbox + tasks + SLA + cambios”.
- Leads Inbox (mensajería + thread list + contexto + notas).
- CRM/Pipeline (kanban + lista + etapas + SLA).
- Contactos (unificación + dedupe + historial).
- Actividades/Timeline/Tasks (log + tareas + recordatorios).
- Propiedades/Matching (futuro / parcial).
- Créditos (saldo + ledger + consumo + disputas).
- Reportes (V1).
- Equipo (V1).
- Settings (perfil, notificaciones, quiet hours, preferencias).

### 7.2 Convención de rutas (objetivo)
- `/agents/overview`
- `/agents/inbox`
- `/agents/pipeline`
- `/agents/contacts`
- `/agents/tasks`
- `/agents/properties` (si aplica)
- `/agents/credits`
- `/agents/team` (V1)
- `/agents/reports` (V1)
- `/agents/settings`

---

## 8. Módulo: Leads Inbox

### 8.1 Propósito
Centralizar conversaciones y acciones con leads para responder rápido, mantener contexto y registrar seguimiento (sin depender de herramientas externas).

### 8.2 Alcance
MVP:
- Thread list (conversaciones) + filtros + estados.
- Vista conversación.
- Acciones: enviar mensaje, crear tarea, cambiar etapa, agregar nota interna.
- SLA de respuesta inicial y “sin respuesta” visible.
- Plantillas rápidas.
- Adjuntos: “por definir” (MVP puede iniciar sin adjuntos).

V1:
- Read receipts (si el canal lo soporta).
- Asignación a agentes (equipo).
- Etiquetas y automatizaciones de follow-up.

### 8.3 UI principal
1. Vista Inbox (master-detail):
   - Izquierda: lista virtualizada de threads.
   - Derecha: conversación seleccionada con panel de contexto.
2. Panel de contexto (drawer derecho o columna):
   - Lead summary, etapa, SLA, tareas, datos de contacto.
3. Composer:
   - input multiline, shortcuts de plantillas, envío.
4. Action bar:
   - Crear tarea, cambiar etapa, marcar “cerrado”, asignar (V1).

### 8.4 Estados (loading/empty/error)
- Loading:
  - Skeleton para lista de threads y conversación.
  - Estados independientes: se puede cargar lista sin conversación y viceversa.
- Empty:
  - Inbox vacío: “No hay conversaciones aún” + CTA “Ver pipeline” o “Importar contactos” (si aplica).
  - Thread sin mensajes: mostrar “Lead creado, sin mensajes” + CTA “Enviar primer mensaje”.
- Error:
  - Error de red: banner no bloqueante arriba + retry.
  - Error de envío: mensaje queda en estado “failed” con reintentar y editar.

### 8.5 Reglas y validaciones
- Thread se crea cuando:
  - llega un lead con canal “in-app chat” o “mensaje de contacto”.
  - o cuando el agente inicia conversación desde un lead.
- Validación de mensaje:
  - no vacío, longitud máxima (por definir).
  - sanitización de contenido (prevención XSS en render).
- Notas internas:
  - visibles solo para roles con permiso.
  - no se envían al usuario final.
- SLA:
  - “SLA inicial” se mide desde `lead_created_at` a `first_agent_reply_at`.
  - si `first_agent_reply_at` no existe en X horas (por definir), se marca “SLA vencido”.
- Cierre de conversación:
  - “Cerrado” no elimina historial; solo oculta de “activos” por defecto.
  - Se puede reabrir.

### 8.6 Permisos
- Agent: R/W sobre sus threads.
- Team Lead/Broker: R sobre equipo; W para reasignar y cerrar en nombre del agente (V1).
- Assistant: R/W según configuración; sin exportación.

### 8.7 Eventos de analítica (mínimo)
- `inbox_thread_list_viewed`
- `inbox_thread_opened`
- `message_composed`
- `message_sent`
- `message_send_failed`
- `template_inserted`
- `note_added`
- `sla_breached_viewed`
- `lead_stage_changed_from_inbox`
- `task_created_from_inbox`

### 8.8 Edge cases
- Duplicado de threads (mismo lead): se resuelve por contacto (email/teléfono) y/o lead_id.
- Mensajes concurrentes: ordenación estable por timestamp + id.
- Reintento idempotente: `client_message_id` evita duplicados.
- Permisos insuficientes: ocultar composer y mostrar “No tienes permiso para responder”.
- Sesión expirada: bloqueo de composer, preservar borrador local.

### 8.9 Future enhancements
- Asistente de “next best action” (reglas).
- Resumen de conversación.
- Adjuntos y media (con política de tamaño y antivirus; futuro).
- Integración email/SMS (fuera de alcance MVP, especificación contractual en Integraciones).

---

## 9. Módulo: CRM / Pipeline

### 9.1 Propósito
Visualizar y operar el flujo de conversión: priorizar leads, moverlos por etapas, evitar olvidos con tareas y SLA.

### 9.2 Alcance
MVP:
- Kanban por etapas + vista lista.
- Mover etapa (drag/drop + menú).
- SLA y “sin próxima acción”.
- Filtros: etapa, asignado (si aplica), prioridad, fecha de creación.
- Quick actions: crear tarea, abrir inbox, marcar perdido.

V1:
- Reglas de routing (equipo).
- Campos personalizados (por definir).
- Automatizaciones (p. ej. crear tarea al entrar a etapa X).

### 9.3 Etapas (MVP, por definir ajustes)
- Nuevo
- Contactado
- Calificado
- Cita programada
- Cita realizada
- Negociación
- Cerrado (ganado)
- Cerrado (perdido)

Reglas:
- “Cerrado” no borra; requiere razón para “perdido” (catálogo por definir).
- “Cita programada” requiere al menos 1 cita asociada (si módulo citas está activo en MVP; si no, se crea actividad).

### 9.4 UI principal
- Kanban:
  - columnas por etapa con contador.
  - tarjetas con: nombre, SLA badge, última actividad, próxima tarea, propiedad asociada (si aplica).
- Vista lista:
  - tabla con filtros persistentes, orden por SLA y “overdue”.
- Panel detail (drawer):
  - resumen + CTA: abrir inbox, crear tarea, cambiar etapa, agregar nota.

### 9.5 Estados
- Loading: skeleton por columnas; placeholder de tarjetas.
- Empty: sin leads: CTA “Cómo obtener leads” (texto neutral) y “Importar” (si existe).
- Error: fallback con retry; mantener filtros.

### 9.6 Reglas y validaciones
- Mover etapa:
  - Se registra evento de auditoría.
  - Se propone “siguiente paso” obligatorio (task) al mover a ciertas etapas (por definir reglas).
  - Undo disponible 10s para movimientos.
- Next step:
  - Lead debe tener `next_task_due_at` o `next_action` (por definir forma) para considerarse “en control”.
  - Si no, aparece badge “Sin próxima acción”.
- Prioridad:
  - Derivada: SLA vencido > nuevo sin respuesta > tarea overdue > resto.
- Dedupe:
  - Pipeline se opera sobre Lead, pero Contacto unifica identidad (ver Contactos).

### 9.7 Permisos
- Agent: R/W sobre leads propios.
- Team Lead: R/W sobre leads del equipo; reasignar (V1).
- Broker: A para config de etapas y razones (V1).

### 9.8 Analítica
- `pipeline_viewed` (kanban/list)
- `lead_card_opened`
- `lead_stage_drag_started`
- `lead_stage_changed`
- `lead_stage_change_undone`
- `filter_applied`
- `sort_changed`
- `task_created_from_pipeline`
- `lead_marked_lost` (con reason)

### 9.9 Edge cases
- Drag/drop en móvil: fallback a menú “Cambiar etapa”.
- Concurrencia (dos usuarios cambian etapa): resolución por “last write wins” + aviso.
- Lead sin contacto: mostrar “Contacto incompleto” y CTA para completar.

### 9.10 Future enhancements
- SLA por etapa (no solo inicial).
- Predicción de probabilidad de cierre (futuro).
- Playbooks por etapa.

---

## 10. Módulo: Contactos (unificación + dedupe)

### 10.1 Propósito
Mantener identidad única de personas/organizaciones para evitar duplicados y preservar historial.

### 10.2 Alcance
MVP:
- Contacto unificado (vista perfil).
- Sugerencias de duplicado.
- Merge manual asistido.
- Vincular múltiples leads al mismo contacto.

V1:
- Matching probabilístico (fuzzy).
- Organizaciones (empresa) y relaciones (familia).

### 10.3 UI principal
- Lista de contactos (tabla).
- Vista contacto (perfil) con:
  - información básica.
  - timeline unificado (mensajes, actividades, cambios).
  - leads asociados.
  - propiedades asociadas (futuro).

### 10.4 Reglas de deduplicación (MVP)
- Exact match:
  - email igual (case-insensitive) o teléfono normalizado igual.
- Sugerencia (no auto-merge):
  - nombre similar + mismo dominio email o prefijo de teléfono.
- Merge:
  - conserva historial completo.
  - selecciona “registro maestro” para campos conflictivos.
  - genera `merge_audit_event`.

### 10.5 Validaciones
- Teléfono: normalización E.164 (por definir implementación).
- Email: validación formato.
- Campos sensibles: notas internas visibles por permisos.

### 10.6 Permisos
- Agent: ver/editar propios; merge solo si rol habilitado.
- Team Lead/Broker: merge a nivel equipo.

### 10.7 Analítica
- `contacts_list_viewed`
- `contact_opened`
- `dedupe_suggestion_shown`
- `contact_merge_started`
- `contact_merged`
- `contact_merge_canceled`

### 10.8 Edge cases
- Merge de contactos con threads diferentes: threads se re-asocian al contacto maestro.
- Conflicto de propietarios (owner_id): requiere regla (V1: bloquear o reasignar explícitamente).

### 10.9 Future enhancements
- Importaciones (CSV), enriquecimiento (no scope MVP).
- Segmentación y tags avanzados.

---

## 11. Módulo: Actividades + Timeline + Tasks

### 11.1 Propósito
Estandarizar seguimiento: todo lo que sucede queda registrado, y las tareas guían la ejecución diaria.

### 11.2 Alcance
MVP:
- Timeline por lead/contacto.
- Tasks: crear, completar, posponer, prioridad, due date.
- Recordatorios in-app (notification center).
- Actividades manuales: llamada, visita, nota.

V1:
- Tasks recurrentes.
- Integración calendario externo (por definir).
- Automatizaciones de tasks.

### 11.3 UI principal
- “Hoy” (overview): tareas hoy + overdue + citas hoy (si aplica).
- Lista de tareas (tabla + filtros).
- Timeline:
  - feed agrupado por fecha, con iconos por tipo.
  - expand/collapse para notas largas.

### 11.4 Estados
- Loading: skeleton feed.
- Empty: “Sin tareas” + CTA “Crear tarea” y “Ver pipeline”.
- Error: retry y fallback local.

### 11.5 Reglas
- Task:
  - campos mínimos: `title`, `due_at`, `status`, `priority`, `related_entity`.
  - completado registra `task_completed_at`.
- Posponer:
  - requiere nueva fecha, registra razón opcional.
- SLA:
  - tasks overdue resaltadas y priorizadas en overview.
- Actividad:
  - cada cambio de etapa crea actividad automática.
  - cada mensaje enviado/recibido crea actividad.

### 11.6 Permisos
- Assistant: puede crear y completar tasks asignadas; no edita ledger.
- Team lead: ver tasks del equipo (V1).

### 11.7 Analítica
- `tasks_viewed`
- `task_created`
- `task_completed`
- `task_snoozed`
- `timeline_viewed`
- `activity_added`

### 11.8 Edge cases
- Tasks en zona horaria: almacenar en UTC, mostrar en tz del usuario.
- Overdue masivo: UI debe soportar listas grandes (virtualización).

### 11.9 Future enhancements
- Templates de playbooks por etapa.
- Notificaciones push/email (configurable).

---

## 12. Módulo: Propiedades / Matching

### Estado: Parcial (MVP) / Futuro
No hay evidencia de que el portal de agentes ya gestione listings propios. El marketplace actual ya tiene entidades de propiedad y páginas de detalle. Este módulo define cómo se integraría al portal.

### 12.1 Propósito
Permitir al agente relacionar leads con propiedades, registrar interés, y (futuro) administrar publicaciones/actividad.

### 12.2 Alcance (propuesto)
MVP (mínimo):
- Mostrar “propiedad de interés” si el lead proviene de una propiedad específica.
- Link a PDP existente.
- Guardar “propiedades sugeridas” para un lead (lista).

V1:
- Listado de propiedades del agente.
- Estados (publicada, borrador, pendiente verificación).
- Actividad por propiedad (vistas/guardados/mensajes) si el backend lo emite.

### 12.3 UI
- Dentro de lead: panel “Propiedades” con:
  - propiedad consultada.
  - sugeridas/guardadas.
  - CTA “Enviar por mensaje” (envía link).
- Vista `/agents/properties` (V1): tabla de listings con filtros.

### 12.4 Reglas
- Relación lead ↔ propiedad: many-to-many.
- “Enviado” registra actividad.

### 12.5 Analítica
- `lead_property_link_clicked`
- `property_suggested_to_lead`
- `property_sent_in_message`

### 12.6 Decisiones pendientes
- Fuente de verdad de listings del agente (backend por definir).
- Definición de “actividad de propiedad” y su granularidad.

---

## 13. Sistema de Créditos

### 13.1 Propósito
Monetizar capacidades (boost, verificación, featured) con un sistema transparente, auditado e idempotente.

### 13.2 Conceptos
- Saldo: créditos disponibles (integer).
- Ledger: registro inmutable de transacciones (append-only).
- Producto de consumo: acción que consume créditos (p. ej. “verificación de propiedad”, “boost 7 días”).
- Reservas (hold): retener créditos temporalmente para ejecución posterior (opcional; V1).

### 13.3 Principios de diseño
1. Ledger es fuente de verdad: saldo se deriva (o se reconcilia) desde ledger.
2. Idempotencia: cada operación de consumo debe ser re-ejecutable sin duplicar cobros.
3. Transparencia UX: siempre mostrar “por qué se cobró” y “qué recibí”.
4. Antifraude: límites por ventana, señales de abuso, y revisiones.

### 13.4 Alcance MVP
- Vista créditos:
  - saldo actual.
  - ledger con filtros por tipo (recarga, consumo, ajuste, reverso).
- Consumo:
  - al menos 2 productos configurables por catálogo (por definir).
- Disputas:
  - mecanismo UI “Reportar problema” que crea ticket (interno) sin borrar tx.

### 13.5 Reglas y validaciones

#### 13.5.1 Tipos de transacción (ledger)
| Tipo | Signo | Ejemplo | Reversible | Nota |
|---|---:|---|---|---|
| `top_up` | + | Recarga manual / promo | Sí (ajuste) | Requiere comprobante si aplica |
| `consume` | - | Boost listing | Depende | Se revierte solo si no se ejecutó el producto |
| `refund` | + | Reembolso consumo | Sí | Debe apuntar a tx original |
| `adjustment` | +/- | Corrección | Sí | Requiere reason y actor |
| `expiration` | - | Vencimiento | No | Si hay expiración por política |

#### 13.5.2 Idempotencia
- Cada operación expone `idempotency_key` único por:
  - `actor_id + product_id + target_id + timestamp_bucket` (por definir)
- Si se reintenta con misma key, el backend retorna la tx existente.
- UI debe soportar retry sin duplicar.

#### 13.5.3 Antifraude (MVP)
- Límite de consumo por minuto (rate limit de acciones de crédito) — Por definir.
- Detección de “clics repetidos”: UI deshabilita CTA tras submit y muestra estado.
- Auditoría:
  - toda tx tiene `created_by_role`, `created_by_id`, `origin` (ui/api/admin).

#### 13.5.4 UX de errores
- Saldo insuficiente:
  - mensaje inline + CTA “Recargar” (si aplica) o “Contactar soporte”.
- Error de red:
  - tx queda “pendiente” en UI con reconciliación al refrescar.
- Conflicto:
  - “Tu saldo cambió” y recarga datos.

### 13.6 UI de Créditos (pantallas)
1. `/agents/credits`:
   - Card de saldo.
   - Tabla ledger (virtualizada) con filtros: rango fecha, tipo, producto, target.
   - Drawer de detalle tx:
     - id, fecha, producto, target, motivo, actor.
2. Surface de consumo:
   - Desde propiedades (V1) o desde acciones del portal:
     - botón “Verificar” o “Boost”.
   - Preconfirmación:
     - costo, duración, reglas, link a política.
   - Confirmación + undo si aplica.

### 13.7 Ejemplos de transacciones y escenarios

#### Escenario A: Consumir créditos para verificación
- Precondición: saldo >= costo_verificación
- Acción: agente pulsa “Solicitar verificación”
- Resultado:
  - Ledger: `consume -X` con `product=verification`, `target=property_id`
  - Estado de producto: “pendiente verificación” (si existe en backend)
- Undo:
  - permitido solo si backend no procesó la solicitud (por definir criterio).

#### Escenario B: Doble click / retry
- UI envía consume con `idempotency_key`.
- Backend responde 500 en primer intento, UI reintenta.
- Resultado esperado: una sola tx `consume`.

#### Escenario C: Saldo insuficiente
- UI muestra “Saldo insuficiente”.
- No se crea tx.
- Se registra evento `credit_insufficient_shown`.

#### Escenario D: Ajuste admin por disputa
- Admin crea `adjustment +X` con `reason=dispute_refund`.
- UI refleja en ledger con actor “Admin”.

### 13.8 Analítica
- `credits_page_viewed`
- `credit_ledger_filtered`
- `credit_product_cta_clicked`
- `credit_purchase_initiated` (si existe recarga)
- `credit_consumption_confirmed`
- `credit_consumption_failed`
- `credit_insufficient_shown`
- `credit_tx_detail_opened`
- `credit_dispute_started`

### 13.9 Future enhancements
- Reservas/holds para acciones asincrónicas.
- Suscripción (plan) con crédito mensual.
- Expiración y políticas de promo.

---

## 14. Flujos E2E críticos

Cada flujo incluye precondiciones, pasos, estados, errores y eventos.

### Flujo 1: Onboarding agente (activación)
Precondiciones:
- Usuario autenticado como agente (mecanismo de auth por definir).
Pasos:
1. Crear perfil mínimo (nombre, teléfono, zonas de atención).
2. Configurar notificaciones y quiet hours.
3. Definir objetivo (compra/renta/venta) y especialidades.
Estados:
- loading de guardado, autosave, confirmación.
Errores:
- validación teléfono/email; sesión expirada.
Eventos:
- `agent_onboarding_started`, `agent_profile_saved`, `quiet_hours_set`, `onboarding_completed`.

### Flujo 2: Lead entrante → primera respuesta (SLA)
Precondiciones:
- Lead creado en backend y visible en portal.
Pasos:
1. Inbox muestra badge “Nuevo” + SLA countdown.
2. Agente abre thread.
3. Redacta y envía primer mensaje (optimistic).
4. Sistema marca `first_agent_reply_at`.
Estados:
- sending, sent, failed->retry.
Errores:
- envío fallido; permisos insuficientes.
Eventos:
- `lead_received`, `inbox_thread_opened`, `message_sent`, `sla_first_reply_met`.

### Flujo 3: Conversación → crear tarea de follow-up
Precondiciones:
- Thread activo.
Pasos:
1. Agente agrega nota interna.
2. Crea task “Llamar mañana 10am”.
3. Task aparece en overview “Hoy” cuando corresponde.
Errores:
- due date inválida.
Eventos:
- `note_added`, `task_created_from_inbox`, `task_due_today_shown`.

### Flujo 4: Pipeline drag/drop → undo
Precondiciones:
- Lead en etapa “Nuevo”.
Pasos:
1. Agente arrastra tarjeta a “Contactado”.
2. UI aplica cambio (optimistic) y muestra toast con Undo 10s.
3. Si Undo, vuelve a etapa anterior y registra evento.
Errores:
- conflicto de concurrencia.
Eventos:
- `lead_stage_changed`, `lead_stage_change_undone`.

### Flujo 5: Dedupe → merge contactos
Precondiciones:
- Dos contactos con mismo email/teléfono.
Pasos:
1. Sistema muestra sugerencia.
2. Usuario inicia merge y elige campos del maestro.
3. Confirma; historial se combina.
Errores:
- conflicto de owner; permisos insuficientes.
Eventos:
- `dedupe_suggestion_shown`, `contact_merge_started`, `contact_merged`.

### Flujo 6: Consumir créditos para producto (verificación/boost)
Precondiciones:
- Catálogo de productos disponible; saldo suficiente.
Pasos:
1. Usuario hace CTA “Verificar”.
2. Modal muestra costo y condiciones.
3. Confirmar → consume idempotente.
4. UI refleja en ledger y estado del target.
Errores:
- saldo insuficiente; error transaccional.
Eventos:
- `credit_product_cta_clicked`, `credit_consumption_confirmed`, `credit_tx_created`.

### Flujo 7 (V1): Reasignación de lead (equipo)
Precondiciones:
- Team lead con permiso; lead asignado.
Pasos:
1. Abrir lead detail.
2. Cambiar asignado.
3. Notificar al nuevo agente.
Errores:
- permisos; lead bloqueado.
Eventos:
- `lead_reassigned`, `notification_sent`.

---

## 15. UI/UX: Information Architecture + Navegación

### 15.1 Sitemap (objetivo)
- `/agents/overview`
- `/agents/inbox`
- `/agents/pipeline`
- `/agents/contacts`
- `/agents/tasks`
- `/agents/credits`
- `/agents/settings`
- (V1) `/agents/team`, `/agents/reports`, `/agents/properties`

### 15.2 Patrones de layout
- Master-detail (inbox, contacts) en desktop.
- Drawer para detalle rápido (lead, task).
- En mobile: navegación por tabs/stack (list → detail) con back.

### 15.3 Command palette
- Atajos:
  - `Ctrl/Cmd+K` abre palette.
  - Acciones: buscar lead, crear tarea, ir a inbox.
- Accesibilidad: focus trap y navegación teclado.

### 15.4 Navegación principal
- Sidebar con módulos.
- Topbar con búsqueda global, notificaciones, perfil.

### 15.5 Navegación secundaria
- Tabs internos en detalle de lead: Resumen, Mensajes, Actividades, Tareas, Propiedades.

---

## 16. Diseño de componentes (Design System operacional)

### 16.1 Primitives existentes (evidencia)
- shadcn-ui + Radix (`components.json`).
- Tailwind tokens vía CSS variables.
- Animaciones base definidas en Tailwind config.

### 16.2 Componentes operacionales requeridos
- DataTable (virtualizada) con:
  - selección, filtros, columnas configurables.
- Kanban:
  - columnas, drag/drop, contador, empty column.
- ThreadList:
  - item con avatar, snippet, badges.
- MessageBubble:
  - estados (sending/sent/failed), timestamp, reintento.
- SLA Badge:
  - normal/por vencer/vencido.
- CreditBalanceCard + LedgerTable.
- NotificationCenter (drawer).
- EntityDrawer (lead/contact/task).

### 16.3 Convenciones de iconografía/estados
- Iconos: `lucide-react` (evidencia).
- Estados:
  - Éxito: verde/emerald.
  - Advertencia: champagne (si se usa como acento).
  - Error: destructive.
- Debe definirse mapping exacto en tokens (Por definir en `src/index.css`).

---

## 17. Microinteracciones (mínimo 30)

Formato: Interacción | Trigger | Feedback | Motion (duración/easing) | Undo/Confirmación

1. Hover de item inbox | hover | elevación + highlight | 120ms ease-out | n/a  
2. Nuevo mensaje entrante | websocket/event | highlight 1.2s + badge | 180ms + fade | n/a  
3. Envío mensaje (optimistic) | click send | bubble aparece “sending” | 120ms | reintentar  
4. Envío confirmado | ack | icono check | 120ms | n/a  
5. Envío fallido | timeout/error | estado “failed” + CTA retry | 160ms shake suave | retry  
6. Insertar plantilla | shortcut | inserta + tooltip “Plantilla aplicada” | 120ms | undo (ctrl+z en input)  
7. Crear tarea desde inbox | CTA | toast “Tarea creada” | 180ms | undo 10s (elimina task)  
8. Cambiar etapa desde inbox | selector | badge cambia + toast | 180ms | undo 10s  
9. Drag start kanban | drag | tarjeta escala 1.02 + sombra | 120ms | n/a  
10. Drop kanban | drop | snap + conf. toast | 180ms | undo 10s  
11. Columna vacía | sin items | empty state con CTA | fade-in 220ms | n/a  
12. Filtro aplicado | chip click | chip activo + contador | 120ms | clear  
13. Persistir filtros | navegación | “Filtros guardados” sutil | none (texto) | n/a  
14. Tabla loading | fetch | skeleton rows | shimmer 800ms | n/a  
15. Infinite scroll | near end | loader inline | 120ms | n/a  
16. Dedupe suggestion | detect | banner no bloqueante | slide 220ms | dismiss  
17. Merge preview | abrir | diff resaltado | 180ms | cancelar  
18. Merge confirm | confirmar | toast + audit | 180ms | undo no (solo admin ajuste)  
19. Task complete | click | check + tachado | 140ms | undo 10s  
20. Task snooze | click | fecha cambia + toast | 140ms | undo 10s  
21. SLA por vencer | timer | badge cambia color | 120ms | n/a  
22. SLA vencido | timer | badge + orden prioritario | 120ms | n/a  
23. Notification drawer | click bell | drawer slide | 220ms | close  
24. Mark notif read | click | fade out item | 140ms | undo 10s  
25. Credit CTA click | click | modal open | 180ms scale-in | cancelar  
26. Credit confirm | confirmar | botón loading + success | 180ms | si aplica undo condicionado  
27. Credit insufficient | saldo < costo | inline error + CTA | 140ms | n/a  
28. Ledger row expand | click | drawer detail | 220ms | close  
29. Autosave indicator | input blur | “Guardado” sutil | 120ms | n/a  
30. Error global banner | fetch fail | banner slide | 220ms | retry  
31. Session expired | 401 | modal + redirect | 220ms | reauth  
32. Reduced motion | prefers-reduced-motion | deshabilitar parallax/drag anim excesiva | n/a | n/a  
33. Keyboard nav list | arrow keys | focus ring visible | none | n/a  
34. Command palette open | Cmd+K | overlay + list | 180ms | esc close  
35. Clipboard copy | click | tooltip “Copiado” | 120ms | n/a  

Tokens recomendados (para implementación):
- Duraciones: 120/140/180/220/320ms.
- Easing: `cubic-bezier(0.2, 0.0, 0.0, 1.0)` para entradas; `cubic-bezier(0.4, 0.0, 0.2, 1.0)` para salidas.
- Distancia: 6–12px en slide.
- `prefers-reduced-motion`: reducir a fades simples o sin animación.

---

## 18. Estados del sistema (globales)

1. Offline:
   - banner “Sin conexión”, cola local de acciones críticas (por definir).
2. Maintenance:
   - página bloqueante con estado y reintento.
3. Permisos insuficientes (403):
   - UI oculta CTA + mensaje “No autorizado”.
4. Rate limit (429):
   - banner + backoff; deshabilitar CTA temporal.
5. Sesión expirada (401):
   - modal y redirect a login; preserva borradores localmente.
6. Error 5xx:
   - fallback con retry; logging.

---

## 19. Datos y entidades (modelo conceptual)

### 19.1 Entidades (mínimo)
- Agent
- Team / Agency
- Role / Permission
- Lead
- Contact
- Conversation
- Message
- Task
- ActivityEvent
- Appointment (si se habilita en MVP o V1)
- CreditAccount
- CreditLedgerEntry
- Notification
- AuditLog

### 19.2 Campos mínimos (ejemplo conceptual)
| Entidad | Campos mínimos |
|---|---|
| Lead | id, contact_id?, source, stage, owner_id, created_at, first_reply_at?, last_activity_at, next_task_due_at? |
| Contact | id, name?, phone?, email?, normalized_phone?, normalized_email?, created_at |
| Conversation | id, lead_id, status(open/closed), last_message_at |
| Message | id, conversation_id, direction(in/out), body, status(sending/sent/failed), created_at, client_message_id? |
| Task | id, title, due_at, status, priority, related_type, related_id, assigned_to |
| CreditLedgerEntry | id, account_id, type, amount, product_id?, target_id?, idempotency_key, created_at, created_by |
| AuditLog | id, actor, action, entity_type, entity_id, before/after, created_at |

### 19.3 Reglas de dedupe
- Email/teléfono normalizados como claves.
- Merge no destructivo (append-only para audit).

---

## 20. Integraciones (presentes/futuras) + estrategia

### Presentes (evidencia)
- TanStack Query como capa de data fetching.
- Toast/tooltip providers.
- Lovable tagger en dev.

### Futuras (por definir)
- Notificaciones push (web/app).
- Email/SMS (servicio externo; especificación contractual).
- Calendario externo (Google/Microsoft).
- Exportación CSV (con permisos y auditoría).
- Integración con módulo de propiedades del marketplace (actividad).

Estrategia:
- Definir contratos de API (REST o similar) por módulo, sin acoplar a proveedor de infra.
- Todo evento sensible pasa por auditoría.

---

## 21. Analítica y observabilidad

### 21.1 Taxonomía de eventos (tabla base)
| Evento | Cuándo | Props mínimas | PII | Dashboard |
|---|---|---|---|---|
| lead_received | lead creado | lead_id, source, agent_id | no | Inflow |
| inbox_thread_opened | abrir thread | thread_id, lead_id | no | Engagement |
| message_sent | enviar msg | thread_id, message_id, channel | body no | SLA |
| lead_stage_changed | cambia etapa | lead_id, from, to | no | Funnel |
| task_created | crea task | task_id, related | no | Productivity |
| credit_consumed | consume | ledger_id, product, amount | no | Monetización |
| credit_insufficient_shown | saldo insuf | product, balance | no | Monetización |
| contact_merged | merge | master_id, merged_id | no | Data quality |
| error_shown | error UI | code, module | no | Reliability |

Notas:
- No registrar contenido de mensajes (PII). Solo metadata.
- IDs deben ser internos; emails/teléfonos jamás como props.

### 21.2 Observabilidad técnica (por definir)
- Logs estructurados.
- Tracing de requests.
- Dashboards: errores por módulo, latencia, ratio retries.

---

## 22. Seguridad, privacidad y auditoría

1. PII:
   - Mensajes, teléfonos, emails: cifrado en tránsito.
   - Políticas de retención (por definir).
2. RBAC:
   - enforcement backend + UI.
3. Auditoría:
   - acciones sensibles: merge, reasignación, ajustes de crédito, exportación.
4. Prevención de fuga:
   - limitar exportaciones; watermarks (futuro).
5. Seguridad de sesión:
   - expiración, refresh, CSRF (por definir).
6. Acceso soporte:
   - “break-glass” con reason obligatorio y registro.

---

## 23. Performance y escalabilidad

1. Listas grandes:
   - virtualización en inbox, contactos, ledger.
2. Caching:
   - TanStack Query con invalidaciones por entidad.
3. Optimistic updates:
   - inbox, pipeline, tasks, créditos (con reconciliación).
4. Rendering:
   - evitar re-render masivo; memoización por row.
5. Tipos TS:
   - estado actual no estricto en app; riesgo de nulls (ver TODO).
6. Motion:
   - 60fps; evitar layout thrash; prefer transforms.

---

## 24. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Confusión por duplicados | historial inconsistente | dedupe + merge + audit |
| Abuso de créditos | pérdida financiera/confianza | idempotencia + rate limit + auditoría |
| Baja adopción | sin retención | overview “qué cambió” + tareas + SLA |
| Performance en tablas | frustración | virtualización + caching |
| Permisos mal definidos | fuga de datos | RBAC matriz + pruebas + auditoría |
| TS no estricto | bugs silenciosos | plan gradual de endurecimiento |

---

## 25. Supuestos y decisiones pendientes (TODO priorizado)

### P0 (bloqueantes MVP)
1. Definir auth y rol inicial de agente (mecanismo y claims).
2. Definir catálogo de productos de crédito MVP (al menos 2) y costos.
3. Definir SLA objetivo (X horas) y cómo se configura.
4. Definir contrato de API mínimo por módulo (endpoints y modelos).
5. Definir storage de borradores y manejo de sesión expirada.

### P1 (post-MVP)
1. Definir estrategia de calendario/citas (entidad Appointment vs activity).
2. Definir routing de equipo (V1) y reasignación.
3. Definir exportaciones y políticas de acceso.
4. Definir targets de KPIs y dashboards.

### P2 (futuro)
1. Integraciones email/SMS/push.
2. Actividad de propiedades (views/saves) y su evento.
3. Campos personalizados y automatizaciones.

---

## 26. Glosario + Convenciones terminológicas

### 26.1 Naming conventions (obligatorias)
- Lead: entidad operativa en pipeline (oportunidad en curso).
- Contacto: identidad unificada (persona) que puede tener múltiples leads.
- Conversación/Thread: canal de mensajes asociado a un lead.
- Mensaje: unidad de comunicación (in/out) dentro de conversación.
- Actividad: evento de negocio (mensaje, llamada, cambio etapa).
- Tarea (Task): acción futura con due date.
- Cita/Visita (Appointment): evento calendarizable (V1 si aplica).
- Crédito: unidad de valor para consumir productos.
- Ledger: registro inmutable de transacciones de crédito.
- Audit log: registro de acciones sensibles con before/after.

### 26.2 Estados estándar
- Loading / Empty / Error (por vista)
- Sending / Sent / Failed (mensajes)
- Open / Closed (conversaciones)
- Active / Snoozed / Done (tasks)

### 26.3 Glosario breve
- SLA: acuerdo de tiempo máximo para responder o actuar.
- Idempotencia: repetir la misma operación no debe duplicar efectos.
- Virtualización: renderizar solo filas visibles para performance.
- Optimistic UI: actualizar interfaz antes de confirmación, con reconciliación.

---
Fin del documento canónico.
