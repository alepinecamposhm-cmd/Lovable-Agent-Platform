# Agents Module Notes & Bugs

## Bug: build fallaba por `mockContacts` inexistente
- **Síntoma:** Al iniciar Vite aparecía `No matching export in "src/lib/agents/fixtures/index.ts" for import "mockContacts"` desde `src/mocks/handlers.ts`.
- **Causa:** El PDF especificaba contactos, pero faltaba el tipo `Contact` y el arreglo `mockContacts` en fixtures.
- **Resolución:** Se añadió la interfaz `Contact` en `src/types/agents.ts` y los datos `mockContacts` en `src/lib/agents/fixtures/index.ts`. Esto desbloquea MSW y permite levantar el dev server.
- **Validación:** `npm run dev` inicia sin error y los mocks de `/api/contacts` responden correctamente.

## Bugs encontrados y cómo resolverlos (lint)
- **Síntoma:** `npm run lint` devuelve 39 errores y 16 warnings; ejemplos: `@typescript-eslint/no-explicit-any` en múltiples stores, `react-hooks/rules-of-hooks` en `src/pages/agents/lead-detail.tsx` y `listing-detail.tsx`, `@typescript-eslint/no-empty-object-type` en componentes UI, `@typescript-eslint/no-require-imports` en `tailwind.config.ts`.
- **Causa probable:** Baseline del repo sin tipar completamente y algunos hooks declarados condicionalmente.
- **Estado/Fix:** No se corrigieron porque no bloquean ejecución actual ni las features nuevas de Equipos planificadas. Si se necesita, aplicar refactors de tipado y mover hooks fuera de condicionales; reemplazar `require` en `tailwind.config.ts` por import ESM. Validar con `npm run lint`.

## Bug: pantalla en blanco por fallo de MSW al iniciar
- **Síntoma:** `http://localhost:8080` cargaba en blanco; la app no montaba cuando `worker.start()` de MSW fallaba/suspendía.
- **Causa:** Render dependía de `enableMocking()`; si MSW fallaba, React nunca montaba y no había feedback.
- **Fix aplicado:**
  - `src/main.tsx`: render inmediato de `App`; `startMocks()` en background con try/catch; log de error y marca `window.__MSW_ERROR__`.
  - `src/App.tsx`: toast/banner dev-only cuando `__MSW_ERROR__` está definido.
  - Créditos ya tenía fallback de datos; sin cambios adicionales.
- **Validación:** `npm test` ✅, `npm run build` ✅; dev server `localhost:8080` muestra la app tras hard reload incluso si MSW falla. Para reproducir, deshabilitar SW y observar toast de “Mocks no disponibles”.

## Bug: Equipo se rompe por `mockTeamAgents` no definido (02/02/2026)
- **Síntoma:** Al abrir `/agents/team` se mostraba “Algo salió mal” y consola indicaba `mockTeamAgents is not defined`.
- **Causa:** Se refactorizó el layout unificado de Equipo y se usaba `mockTeamAgents` sin importarlo en `team.tsx`.
- **Fix aplicado:** Añadir `mockTeamAgents` al import desde `@/lib/agents/fixtures` en `src/pages/agents/team.tsx`.
- **Validación:** `npm test` ✅, `npm run build` ✅; `/agents/team` carga sin error y muestra la vista unificada.

## Bug: Tab Performance no cargaba (Teams)
- **Síntoma:** Al abrir la pestaña Performance en `/agents/team`, no renderizaba nada y la consola mostraba `mockAgentPerformanceSeries is not defined`.
- **Causa:** Falta de import del fixture `mockAgentPerformanceSeries` en `src/pages/agents/team.tsx`; el componente intentaba usar la serie temporal sin estar en el scope.
- **Fix aplicado:** Agregar `mockAgentPerformanceSeries` al import de fixtures en `team.tsx`.
- **Validación:** `npm test` ✅; en UI la pestaña Performance ahora muestra tabla filtrable y exporta CSV sin errores.

## Bug: build fallaba por JSX sin fragmento (listing-detail)
- **Síntoma:** `npm run build` fallaba con `Expected \")\" but found \"open\"` en `listing-detail.tsx` (línea 573) y detenía la build.
- **Causa:** El return del componente tenía `<motion.div>...</motion.div>` seguido de `<InsufficientCreditsDialog ... />` sin envolver ambos nodos; JSX inválido.
- **Fix aplicado:** Envolver el contenido y el diálogo en un fragmento `<>...</>` dentro del return.
- **Validación:** `npm run build` ✅ tras el cambio (advertencias de chunk size y browserslist pendientes pero no bloqueantes).

## Lint pendiente (02/02/2026)
- **Síntoma:** `npm run lint` sigue fallando con los mismos errores basales (any sin tipar, hooks condicionales, require en tailwind).
- **Causa:** Código previo al sprint; no relacionado con las nuevas features de Créditos.
- **Solución pendiente:** Refactor de tipado + mover hooks fuera de condicionales + ajustar `tailwind.config.ts` a ESM. No bloquea build ni tests; se dejó constancia para seguimiento.

## QA Sprint Créditos (02/02/2026)
- `npm run test`: ✅
- `npm run build`: ✅
- `npm run lint`: ❌ (mismo baseline de tipos/hooks/require pendiente).
  - Observación: se añadieron nuevas validaciones de consumo; lint sigue fallando por base histórica (any en stores, hooks condicionales, require en tailwind).

## Nuevo bug de build (02/02/2026)
- **Síntoma:** `npm run build` falla con `Unterminated regular expression` en `src/pages/agents/team.tsx:1621:22`.
- **Pasos:** ejecutar `npm run build`.
- **Causa probable:** JSX con texto que incluye llaves/quotes en la pestaña de recordatorios del Team; el parser de esbuild interpreta un cierre de tab como regex por caracteres especiales. Aún no corregido.
- **Estatus:** No bloquea las nuevas features de Créditos; pendiente de corrección en módulo Team. Se puede mitigar removiendo caracteres especiales en el copy o aislando el string en template literal.

## Bug: pantalla en blanco al cargar /agents/credits (02/02/2026)
- **Síntoma observable:** Al abrir `http://localhost:8080/agents/credits` la vista quedaba en blanco. En consola aparecía `Identifier 'useState' has already been declared` (runtime).
- **Pasos para reproducir:** Ejecutar `npm run dev` y navegar a `/agents/credits` en dev; revisar consola del navegador.
- **Causa raíz:** Import duplicado de `useState` en `src/components/agents/credits/BuyCreditsDialog.tsx` generaba redeclaración en el bundle (vite dev).
- **Solución aplicada:** Remover el segundo import redundante de `useState` en `BuyCreditsDialog.tsx`.
- **Archivos tocados:** `src/components/agents/credits/BuyCreditsDialog.tsx`.
- **Validación:** Recarga dura posterior muestra el módulo Créditos correctamente; playwright headless ya no reporta error, UI visible (ver screenshot del usuario).

---

## Sprint Reportes (04/02/2026) — Performance Reports + Overview KPIs + Agent Health Score

### Qué se implementó (solo Reportes según PDF)
- **Subnavegación + rutas**:
  - `/agents/reports` (Overview)
  - `/agents/reports/leads` (Lead Report)
  - `/agents/reports/team` (Team Report, solo líderes)
  - `/agents/reports/experience` y `/agents/reports/roi` ahora muestran subnav consistente
- **Periodo global**: selector `7d/30d/90d/All` persistido en `localStorage` (`agenthub_reports_period`).
- **Lead Report**: volumen por periodo + breakdown por `tipo/ZIP/rango` + **answer rate (<5m)**.
- **Team Report**: pipeline consolidado + tabla por agente/estado + answer rate por miembro; gating por rol (`owner/admin/broker`) con estado “restricted”.
- **Overview (Reports)**:
  - KPIs del PDF: answer rate <5m, conversión a cita, no-show, leads activos, tasa de cierre, % perfil completado (y tiempo medio 1a respuesta como apoyo).
  - “Desempeño por listing”: conteo de `inquiry` por listing en el periodo.
  - “Agent Health Score”: card + modal con breakdown transparente (sin frustración) y tips accionables.

### Tracking mínimo (Reportes)
- Endpoint: `POST /api/analytics` (best-effort) vía `src/lib/agents/reports/analytics.ts`.
- Eventos: `reports.view`, `reports.nav_click`, `reports.overview_view`, `reports.overview_period_changed`, `reports.lead_report_*`, `reports.team_report_*`, `reports.listing_performance_*`, `reports.score_detail_opened/closed`.

### Persistencia mínima
- `localStorage`:
  - `agenthub_reports_period`
  - `agenthub_reports_leads_breakdown` (Lead Report)

### Datos/fixtures (para Team Report realista)
- Se reasignaron algunos `mockLeads.assignedTo` a `agent-2` y `agent-3` para que el Team Report muestre múltiples agentes.
- **Riesgo**: en un navegador con `localStorage` ya poblado, puede no reflejarse hasta limpiar storage.
- **Cómo probar**: hard reload + (si hace falta) limpiar `localStorage` keys `agenthub_leads` y `agenthub_team_members`.

### Cambios cross-módulo (bloqueo directo: ENG-01 lint verde)
- **Motivo**: el sprint requería `npm run lint` ✅ (PR checklist en PDF) para no bloquear integración.
- **Archivos tocados (fuera de Reportes)**:
  - Tipado / `unknown` en stores y handlers: `src/lib/agents/*/store.ts`, `src/lib/audit/store.ts`, `src/mocks/handlers.ts`, `src/lib/credits/query.ts`.
  - Hooks condicionales: `src/pages/agents/lead-detail.tsx`, `src/pages/agents/listing-detail.tsx`.
  - Tailwind ESM: `tailwind.config.ts`.
  - UI types: `src/components/ui/command.tsx`, `src/components/ui/textarea.tsx`.
- **Riesgo**: cambios de tipado pueden ocultar errores de runtime si hay casts mal hechos; tailwind config ESM podría romper en entornos que esperen CJS.
- **Cómo testear**:
  - `npm run lint` (debe terminar sin errores)
  - `npm run test`
  - `npm run build`
  - Smoke manual: navegar a `/agents/reports`, `/agents/reports/leads`, `/agents/reports/team`
- **Rollback plan**: revertir los commits/patches de los archivos listados arriba (en orden: tailwind config + stores/handlers + pages).
