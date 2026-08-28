# IVIS Fit (monorepo)

Plataforma de coaching fitness personalizado: landing + panel de la profesora + app de la alumna.

## Apps

- `apps/frontend-app` — Next.js (landing CMS, auth, alumna, profe)
- `apps/backend-api` — Express + MongoDB

## Arranque

```bash
npm install
npm run dev
```

Frontend: `http://localhost:3000`  
API: `http://localhost:4000`

## Roles y rutas principales

**Públicas:** `/`, `/[slug]`, `/login`, `/registro`, recuperar/restablecer password

**Alumna (admitida):**

- `/rutina`, `/alimentacion`, `/progreso`, `/asistente`
- `/mensajes`, `/biblioteca`, `/logros`, `/mi-perfil`, `/reunion`, `/ajustes`
- Onboarding: `/bienvenida`, `/tutoriales`

**Profesora:**

- `/panel`, `/alumnas`, `/alumnas/[id]`, `/rutinas`, `/catalogo`
- `/agenda`, `/web-config`, `/automatizaciones`, `/ajustes`

## Auth

Login real con Better Auth (email/password + 2FA opcional). No hay login demo por substring del email.

## Scheduler

En **producción** conviene `SCHEDULER_ENABLED=true` en la API: sin eso, los recordatorios por email, insights de inactividad, resumen semanal y recalc de membresía **no corren**, aunque la alumna los tenga activados en perfil. Ver `apps/backend-api/.env.example`.

## Nota

La carpeta `landing/IvisFit/WebIvisFit` es **legacy**. La web viva es Next en `apps/frontend-app`.
