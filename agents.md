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
- **Update (04/02/2026):** `npm run lint` ✅ (0 errors) tras eliminar `any` explícitos, mover hooks fuera de condicionales y migrar `tailwind.config.ts` a import ESM.

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
- **Update (04/02/2026):** Ya no repro en HEAD (`npm run build` ✅). Se normalizaron strings/escapes y tipos en `src/pages/agents/team.tsx`.

## Bug: pantalla en blanco al cargar /agents/credits (02/02/2026)
- **Síntoma observable:** Al abrir `http://localhost:8080/agents/credits` la vista quedaba en blanco. En consola aparecía `Identifier 'useState' has already been declared` (runtime).
- **Pasos para reproducir:** Ejecutar `npm run dev` y navegar a `/agents/credits` en dev; revisar consola del navegador.
- **Causa raíz:** Import duplicado de `useState` en `src/components/agents/credits/BuyCreditsDialog.tsx` generaba redeclaración en el bundle (vite dev).
- **Solución aplicada:** Remover el segundo import redundante de `useState` en `BuyCreditsDialog.tsx`.
- **Archivos tocados:** `src/components/agents/credits/BuyCreditsDialog.tsx`.
- **Validación:** Recarga dura posterior muestra el módulo Créditos correctamente; playwright headless ya no reporta error, UI visible (ver screenshot del usuario).

## Sprint Créditos (04/02/2026) — Cambios Cross-Módulo (por features nuevas de Créditos)

### 1) Trigger saldo bajo + CTA recarga (CRED-03)
- **Files changed:**
  - `src/components/agents/layout/AgentTopbar.tsx`
  - `src/lib/agents/notifications/triggers.ts`
- **Motivo:** Implementar notificación “Saldo bajo” en el centro de notificaciones con navegación directa a recarga (`/agents/credits?purchase=1`), y dedupe para evitar spam.
- **Referencia PDF:** “F) Flujo de Créditos/Billing — triggers: notificación ‘Saldo bajo (5 créditos restantes)’ en centro notifs” (pág. 23).
- **Riesgo:** Side-effects en topbar (trigger en re-renders / persistencia localStorage). Mitigación: dedupe por `agenthub_credit_low_last_notified` + no dispara si `creditError`.
- **Cómo probar:**
  - Abrir cualquier `/agents/*`, reducir saldo por consumos hasta cruzar threshold y revisar que aparece 1 notificación.
  - Click en notificación abre `/agents/credits?purchase=1`.
- **Rollback:** Revertir los cambios en topbar/triggers y eliminar la clave localStorage `agenthub_credit_low_last_notified`.

### 2) Rutas estables hacia recarga (CRED-02)
- **Files changed:**
  - `src/components/agents/listings/BoostDialog.tsx`
  - `src/pages/agents/leads.tsx`
  - `src/pages/agents/listing-detail.tsx`
  - `src/pages/agents/notifications.tsx`
- **Motivo:** Garantizar que CTAs/acciones que lleven a recargar créditos abran el modal de compra vía URL (`purchase=1`).
- **Referencia PDF:** “Sitemap y Rutas Principales — /agents/credits” (pág. 11) + “F) Flujo de Créditos/Billing” (págs. 22–23).
- **Riesgo:** Dependencia de query params si la página Créditos no los sincroniza. Mitigación: `src/pages/agents/credits.tsx` ahora sincroniza `tab=` y `purchase=1`.
- **Cómo probar:** Provocar “créditos insuficientes” en Leads/Listings/Notificaciones y confirmar que el CTA lleva a `/agents/credits?purchase=1` y abre el dialog.
- **Rollback:** Revertir rutas/links a `/agents/credits` sin query params.

### 3) Lint “en verde” (requisito de calidad del sprint)
- **Files changed (no funcional / tipado/hooks):**
  - `tailwind.config.ts` (require → import ESM)
  - Stores: `src/lib/agents/appointments/store.ts`, `src/lib/agents/cx/store.ts`, `src/lib/agents/integrations/store.ts`, `src/lib/agents/leads/store.ts`, `src/lib/agents/listings/store.ts`, `src/lib/agents/notifications/store.ts`, `src/lib/agents/tasks/store.ts`, `src/lib/agents/team/store.ts`
  - Pages: `src/pages/agents/lead-detail.tsx`, `src/pages/agents/listing-detail.tsx`, `src/pages/agents/listing-new.tsx`, `src/pages/agents/team.tsx`
  - UI: `src/components/ui/command.tsx`, `src/components/ui/textarea.tsx`
  - Tests/Types: `src/lib/audit/store.ts`, `src/lib/contacts/merge.test.ts`
- **Motivo:** El sprint requiere finalizar con `npm run lint` pasando; se eliminó `any` explícito, hooks condicionales y `require()` prohibidos.
- **Referencia PDF:** No aplica (calidad técnica / baseline).
- **Riesgo:** Bajo; cambios mayormente de tipos y orden de hooks.
- **Cómo probar:** `npm run lint`, `npm run test`, `npm run build`.
- **Rollback:** Revertir los cambios de tipado/hook-order; si hay regresión puntual, aislar por archivo.

### 4) MSW: Facturas/Recibos (invoice) + PDF binario (CRED-01)
- **Files changed:**
  - `src/mocks/handlers.ts`
  - `package.json`
  - `package-lock.json`
- **Motivo:** Al comprar créditos, el mock ahora genera y persiste una factura/recibo y expone `GET /api/credits/invoices/:id/pdf` devolviendo `application/pdf` (para descargas reales). Se añadió `pdf-lib` para generar el PDF.
- **Referencia PDF:** “F) Flujo de Créditos/Billing — Compra + recibo (PDF) + envío email + facturas” (págs. 22–23).
- **Riesgo:** Tamaño de bundle (pdf-lib) + manejo de bytes/headers en MSW. Mitigación: PDF minimal + descarga vía `Blob`.
- **Cómo probar:**
  - Ir a Créditos → comprar paquete → pestaña Facturas muestra el recibo.
  - “Descargar PDF” abre/descarga un `.pdf` válido.
- **Rollback:** Revertir handlers, eliminar endpoint PDF, y remover `pdf-lib` de dependencias (y volver a descarga `.txt` si fuera necesario).

### QA (04/02/2026)
- `npm run lint`: ✅ (0 errors; warnings react-refresh/exhaustive-deps permanecen)
- `npm run test`: ✅
- `npm run build`: ✅
