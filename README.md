# agent-oasis-main — Guía operativa para desarrollo

## Tabla de contenidos

1. [Qué es](#qué-es)
2. [Source of Truth](#source-of-truth)
3. [Quickstart](#quickstart)
4. [Scripts](#scripts)
5. [Variables de entorno](#variables-de-entorno)
6. [Estructura del repo](#estructura-del-repo)
7. [Convenciones](#convenciones)
8. [Git workflow](#git-workflow)
9. [Deploy](#deploy)
10. [Troubleshooting común](#troubleshooting-común)

---

## Qué es

Este repositorio contiene una SPA (Vite + React + TypeScript) para un marketplace inmobiliario.

El Portal de Agentes se implementa dentro de la misma aplicación bajo rutas `/agents/*`, reutilizando:
- Design system (shadcn-ui + Tailwind)
- Patrones de routing (React Router)
- Infraestructura de data fetching/caching (TanStack Query)

---

## Source of Truth

El documento canónico del Portal de Agentes es:

- [`/AGENT-PLATFORM-SPEC.md`](./AGENT-PLATFORM-SPEC.md)

Reglas de uso:
- Todo PR que toque `/agents/*` debe referenciar secciones específicas de la SPEC.
- Todo issue de producto/UX debe mapear a un módulo y a eventos/KPIs definidos en la SPEC.
- Si una decisión no está respaldada por evidencia interna, se marca como “Supuesto” o “Por definir” en la SPEC.

---

## Quickstart

### Prerrequisitos

- Node.js (recomendado: instalar con `nvm`)
- npm (lockfile canónico: `package-lock.json`)
- Git

Nota: puede existir `bun.lockb`, pero npm es el flujo canónico del repo.

### Instalar dependencias

```sh
npm ci
Ejecutar en desarrollo (Vite)
sh
Copiar código
npm run dev
Vite corre en el puerto 8080 según configuración documentada del repo.

Build de producción
sh
Copiar código
npm run build
Build en modo desarrollo (si existe comportamiento por modo)
sh
Copiar código
npm run build:dev
Preview del build
sh
Copiar código
npm run preview
Scripts
La documentación interna del repo menciona estos scripts:

Script	Comando	Nota
Dev	npm run dev	Vite en 8080
Build	npm run build	Producción
Build dev	npm run build:dev	Útil si hay diferencias por modo
Preview	npm run preview	Servir build local
Lint	npm run lint	Para un archivo: npx eslint src/pages/Properties.tsx

Tests:

No hay evidencia interna de runner de tests configurado en package.json.

TODO: definir estrategia (unit + e2e) y añadir scripts asociados.

Variables de entorno
No hay evidencia interna suficiente para listar variables .env existentes.

Plantilla sugerida (crear .env.example cuando aplique):

env
Copiar código
# API (si aplica)
VITE_API_BASE_URL=

# Observabilidad (si aplica)
VITE_SENTRY_DSN=

# Feature flags (si aplica)
VITE_FEATURE_AGENTS_PORTAL=
Reglas:

No commitear .env.

Commitear .env.example con valores vacíos.

Documentar cada variable nueva aquí y en el apartado de Deploy.

Estructura del repo
Entrypoints (documentado)
index.html → src/main.tsx → src/App.tsx

Routing actual (documentado)
/ → src/pages/Index.tsx

/properties → src/pages/Properties.tsx

/property/:id → src/pages/PropertyDetailPage.tsx

* → src/pages/NotFound.tsx

Datos actuales del marketplace (documentado)
src/data/properties.ts (fuente estática actual)

src/types/property.ts (tipos de Property y timelineEvents)

src/lib/propertyTimeline.ts (normalización y sort de timelineEvents)

UI / design system (documentado)
src/components/ui/* (primitives shadcn-ui/Radix)

src/lib/utils.ts expone cn() (clsx + tailwind-merge)

src/index.css define tokens (CSS variables HSL)

tailwind.config.ts consume tokens y añade colores/animaciones

Providers (documentado)
src/App.tsx envuelve con:

QueryClientProvider (TanStack Query)

providers de tooltip/toast

Convenciones
Stack (no cambiar)
React + TypeScript + Vite

React Router para rutas

Tailwind + shadcn-ui/Radix para UI

TanStack Query para data fetching/caching

framer-motion para motion (ya usado en el repo)

Victory para charts (ya usado en el repo)

lucide-react para iconografía

Alias de imports
@/* apunta a src/* (ver tsconfig*.json).

Rutas del Portal de Agentes (por implementar)
Convención objetivo:

/agents/overview

/agents/inbox

/agents/pipeline

/agents/contacts

/agents/tasks

/agents/credits

/agents/settings

Regla:

El Portal de Agentes vive bajo un layout propio (sidebar + topbar) para no mezclar IA con el sitio público.

Naming (terminología canónica)
Ver glosario en la SPEC. Resumen:

Lead = oportunidad operativa en pipeline

Contacto = identidad unificada (persona/organización)

Conversación/Thread = canal de mensajes asociado a un Lead

Tarea (Task) = acción futura con due date

Créditos = unidad de consumo; ledger inmutable

TypeScript
Evidencia: tsconfig.app.json tiene strict: false.

Reglas operativas:

Evitar any en nuevos módulos /agents/*.

Preferir tipos explícitos en src/types/agents.ts (o equivalente).

TODO: proponer plan incremental para endurecer tipos sin romper el repo.

UI states obligatorios por vista
Toda pantalla nueva debe manejar:

Loading (skeleton)

Empty

Error (retry)

Permisos insuficientes (403)

Sesión expirada (401)

Git workflow
Convención recomendada:

main: estable

feature/<slug>: features

fix/<slug>: correcciones

chore/<slug>: mantenimiento

Commits:

feat: ...

fix: ...

refactor: ...

chore: ...

Pull Requests (mínimo):

Referencia a sección específica de /AGENT-PLATFORM-SPEC.md.

Checklist de estados UI (loading/empty/error) y A11y (keyboard nav).

Evidencia visual (capturas) si hay cambios de UI.

No introducir nuevas dependencias sin justificar (y sin romper licencias).

Deploy
No hay un pipeline de deploy documentado en el repo.

Evidencia: documentación interna menciona publicación vía Lovable si el repo está vinculado.

TODO:

Definir entorno de deployment (Vercel/Netlify/otro) y documentar:

build command

output

variables de entorno

previews por PR

Troubleshooting común
Vite no levanta o puerto ocupado
Confirmar puerto configurado (esperado: 8080).

Liberar el puerto o ajustar config (solo si es necesario y documentarlo).

Alias @/ no resuelve
Verificar tsconfig.json y vite.config.ts (alias hacia src/).

Reiniciar servidor dev tras cambios.

Lint falla
Ejecutar npm run lint.

Para un archivo: npx eslint src/pages/Properties.tsx.

Dependencias inconsistentes
Usar npm ci para instalación reproducible.

Confirmar que package-lock.json es el lockfile canónico.

No hay tests
Es esperado: actualmente no existe runner de tests configurado.

TODO: decidir estrategia (unit con Vitest + e2e con Playwright/Cypress) y añadir scripts.

Fin del README.

makefile
Copiar código
::contentReference[oaicite:0]{index=0}