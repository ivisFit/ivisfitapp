# PWA performance — antes / después (local `next start`, Lighthouse mobile)

## Manifest

| Campo | Antes | Después (fase 2) |
|-------|-------|------------------|
| `start_url` | `/` | `/login` |
| `id` | `/` | `/login` |
| `scope` | `/` | `/` (sin cambio) |

## Service Worker precache

| Métrica | Antes optimización | Tras fase 1 | Tras app shell (fase 2) |
|--------|---------------------|-------------|-------------------------|
| Entradas en precache | 251 | 225 | **179** |
| Videos en precache | 4 | 0 | 0 |
| `/imgs/*` en precache | 22 | 0 | 0 |
| Chunks `(admin)` | muchos | algunos | **0** |
| Chunks `(alumna)` | — | — | **12** |
| Chunks `(auth)` | — | — | **6** |
| Chunks `(landing)` | — | — | **0** |
| Actualización SW | inmediata | `SKIP_WAITING` + banner | igual |

Filtro: [`lib/pwa-precache-filter.ts`](lib/pwa-precache-filter.ts) + `npm run build` → `node scripts/count-precache.mjs`.

## First Load JS (Next build)

| Ruta | Antes | Tras fase 2 |
|------|-------|-------------|
| Shared | 119 kB | 119 kB |
| `/login` | 162 kB | 162 kB |
| `/alumnas` | 165 kB | 173 kB (+ virtual list) |
| `/asistente` | 124 kB | 132 kB (+ virtual messages) |

## Imágenes landing

- Script: `npm run optimize:imgs` (genera `.webp` / `.avif` junto a JPG/PNG en `public/imgs/`).
- Runtime: [`src/lib/public-image.ts`](src/lib/public-image.ts) → `publicBackgroundStyle()` en cards/planes.

## Virtualización

- Lista alumnas: [`GestorAlumnasPanel.tsx`](src/features/profe/components/GestorAlumnasPanel.tsx)
- Chat landing: [`ChatbotPanel.tsx`](src/features/landing/components/Chatbot/ChatbotPanel.tsx)
- Asistente alumna: [`AsistentePage.tsx`](src/features/alumna/components/assistant/AsistentePage.tsx)

## Lighthouse (muestra `/login` — entorno local, baseline fase 1)

| Métrica | Valor |
|---------|-------|
| Performance | 37 |
| FCP | 1.7 s |
| LCP | 9.6 s |
| TTI | 14.0 s |
| TBT | 3,690 ms |
| CLS | 0.016 |

Re-auditar: `npm run lighthouse:mobile` con `LIGHTHOUSE_BASE_URL=http://localhost:3001`.

## Pendiente

- Migración MUI landing → Tailwind (no solicitada).
- Profe offline: rutas `(admin)` ya no están en precache; primera visita a `/panel` requiere red (runtime cache después).
