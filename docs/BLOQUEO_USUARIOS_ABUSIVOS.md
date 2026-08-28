# Bloqueo de usuarios abusivos — Estado actual y propuesta

## Estado actual (julio 2026)

### Rate limiting por IP
| Capa | Archivo | Límite |
|------|---------|--------|
| Middleware Next | `apps/frontend-app/src/middleware.ts` | Auth: 10 req / 15 min; API: 60 req / min |
| Backend chatbot | `apps/backend-api/src/middleware/rateLimitChatbot.ts` | 30 req / min |

**Limitación:** implementación in-memory (`Map`). Se reinicia al redeploy y no se comparte entre instancias.

### Control de acceso
- `estadoAdmision`: `pendiente` | `admitida` | `rechazada` (no es un ban).
- No existe `isBlocked`, lista negra de IPs ni suspensión de cuenta.

### Chatbot / leads
- Sin límite por `sessionId` ni bloqueo tras abuso repetido.
- Leads se guardan por IP implícitamente vía rate limit global.

---

## Riesgos identificados

1. Spam en chatbot comercial (múltiples sesiones desde la misma IP).
2. Fuerza bruta en login (mitigado parcialmente por rate limit de auth).
3. Usuario admitido con comportamiento abusivo sin mecanismo de revocación rápida.

---

## Propuesta mínima (recomendada)

### Fase A — Bajo costo
1. **Campo en usuario:** `isBlocked: boolean`, `blockedReason?: string`, `blockedAt?: Date`.
2. **Middleware backend:** rechazar requests de usuarios bloqueados (403).
3. **UI profe:** acción "Bloquear cuenta" en ficha de alumna (junto a admisión).
4. **Chatbot:** tras 50 turnos/hora por IP, responder 429 con mensaje amigable.

### Fase B — Producción seria
1. **Rate limit distribuido:** Upstash Redis o similar para auth, API y chatbot.
2. **Blocklist IP:** colección `blocked_ips` con TTL opcional.
3. **Alertas:** Sentry o log estructurado cuando un IP supera umbrales.

---

## Comparativa de opciones

| Opción | Costo | Robustez | Esfuerzo |
|--------|-------|----------|----------|
| In-memory actual | Gratis | Baja | Ya implementado |
| `isBlocked` en usuario | Gratis | Media | ~0.5 día |
| Redis rate limit | ~$0–10/mes | Alta | ~1 día |
| WAF / Cloudflare | Variable | Muy alta | Config externa |

---

## Recomendación

Implementar **Fase A** antes del lanzamiento público amplio. Reservar Redis para cuando haya más de una instancia del backend o picos de tráfico en el chatbot.
