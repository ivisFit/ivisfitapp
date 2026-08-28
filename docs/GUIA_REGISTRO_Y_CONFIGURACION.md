# Guía de registro de cuenta y configuración — IVIIS FIT

## 1. Cuentas de usuario

### Alumna
1. Ir a `/registro` y completar nombre, email, contraseña y sexo.
2. Tras registrarse, queda en estado **pendiente** hasta que la profe la admita.
3. Cuando es admitida, accede al panel en `/` (rutina, progreso, alimentación).

### Profesora
1. La cuenta profe se crea manualmente en la base de datos o por el equipo técnico.
2. Inicia sesión en `/login` y accede al panel profe (`/panel`, `/alumnas`, `/web-config`, etc.).

### Admisiones
- En `/alumnas` → pestaña **Admisiones**, la profe puede **admitir** o **rechazar** solicitudes.

---

## 2. Variables de entorno

### Backend (`apps/backend-api/.env`)
| Variable | Descripción |
|----------|-------------|
| `MONGODB_URI` | Conexión MongoDB |
| `BETTER_AUTH_SECRET` | Secret de 32+ caracteres |
| `BETTER_AUTH_URL` | URL pública del backend o del dominio de auth |
| `FRONTEND_URL` | URL del frontend (Netlify/Vercel) |
| `TRUSTED_ORIGINS` | Orígenes CORS separados por coma |
| `GEMINI_API_KEY` | API key de Google AI Studio (chatbot + nutrición) |
| `WHATSAPP_PHONE` | Teléfono WhatsApp sin `+` (ej. `59898390351`) |
| `WHATSAPP_COMMUNITY_URL` | Link al grupo WhatsApp de alumnas (opcional) |
| `RESEND_API_KEY` | Email transaccional (2FA, recuperación) |

### Frontend (`apps/frontend-app/.env.local`)
| Variable | Descripción |
|----------|-------------|
| `API_URL` | URL del backend (solo servidor; el proxy `/api` la usa). **No** exponerla como `NEXT_PUBLIC_*` |
| `NEXT_PUBLIC_FRONTEND_URL` | URL pública del frontend |
| `NEXT_PUBLIC_WHATSAPP_PHONE` | Mismo teléfono que en backend |
| `NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL` | Link al grupo de alumnas (opcional; el backend puede usar `WHATSAPP_COMMUNITY_URL`) |
| `MONGODB_URI` | Requerido para el CMS (guarda en `site_content`) |
| `BETTER_AUTH_SECRET` | Mismo secret que el backend |
| `BETTER_AUTH_URL` | URL pública usada por Better Auth |

---

## 3. Despliegue separado

### Backend — Render
1. Conectar el repo y usar `render.yaml` o crear servicio web Node.
2. Build: `npm ci --include=dev && npx turbo run build --filter=@ivisfit/backend-api`
3. Start: `npm run start -w @ivisfit/backend-api`
4. Configurar `MONGODB_URI`, auth y `TRUSTED_ORIGINS` con la URL de Netlify.

### Frontend — Netlify
1. Conectar el repo; Netlify detecta `netlify.toml`.
2. Variables: `API_URL` (backend Render, solo server), `NEXT_PUBLIC_FRONTEND_URL`, `MONGODB_URI`, auth.
3. El frontend llama al API en Render directamente (CORS + cookies cross-domain).

### Desarrollo local
```bash
npm run dev
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

---

## 4. Panel Web y CMS

1. Iniciar sesión como profe → **Web** en el sidebar (`/web-config`).
2. **Editor CMS**: clic en textos de la vista previa → **Publicar cambios**.
3. Rutas con **(borrador)** son planes inactivos; se pueden previsualizar en detalle.

### Troubleshooting CMS
- **No guarda**: verificar `MONGODB_URI` en el servicio frontend y sesión profe activa.
- **Error de sincronización**: el mensaje en el pie del editor indica si falló el sync a `landing_planes`.
- **Preview sin detalle**: elegir la ruta del plan en las pestañas del editor (incluye borradores).

---

## 5. Chatbot comercial (asistente de la web)

- Flotante en la landing; guarda leads en MongoDB.
- Resumen final con enlace WhatsApp precargado (`NEXT_PUBLIC_WHATSAPP_PHONE`).
- Leads visibles en **Web** → pestaña **Leads**.
- Descubre necesidades de la visitante, identifica barreras y recomienda el plan ideal.

---

## 6. Asistente de la app (alumna)

- Ruta `/asistente` (también FAB que lleva ahí). Solo alumnas **admitidas**.
- Acompaña: entrenamiento, alimentación, motivación, progreso, comunidad y derivación a Ivis.
- Menú con chips + chat libre con Gemini (`GEMINI_API_KEY`).
- Check-in diario del entrenamiento y escalamiento a WhatsApp ante dolor/lesión/embarazo/TCA/malestar emocional.
- Check-in de alimentación del día (chip “Alimentación de hoy”) vía `PUT /api/checkins-alimentacion`.
- Comunidad: contador de alumnas que entrenaron hoy + link de grupo (`WHATSAPP_COMMUNITY_URL` / `NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL`, opcional).

---

## 7. Coach de progreso

- Analiza la actividad de la alumna y genera **un** mensaje proactivo (no espera preguntas).
- Se evalúa al abrir **Mi rutina** (`GET /api/coach-insights`) o el **asistente** (bootstrap). Cooldown ~20 h entre insights nuevos.
- Se muestra como banner en `/rutina` y, si hay uno pendiente, como opener en `/asistente`.
- Señales: días sin entrenar, cumplimiento bajo, racha completa, nuevo récord de carga, alimentación baja / sin plan, medición pendiente, desafío semanal.
- El tono se adapta por perfil: motivación, organización, recordatorio o celebración (Gemini + fallbacks).
- Check-in diario de comidas en `/alimentacion` (Cumplí / Parcial / No pude) cuando hay plan publicado.
- No envía push, email ni WhatsApp por su cuenta (solo mensajes in-app).

### Ecosistema IA (resumen)

| Pieza | Rol |
|-------|-----|
| Asistente web (landing) | Descubrir necesidades y guiar a compra / WhatsApp |
| Asistente de la app | Acompañar día a día, responder dudas, check-ins, derivar a Ivis |
| Coach de progreso | Analizar comportamiento y generar acompañamiento proactivo |

---

## 8. Evaluación nutricional

- Ruta `/evaluacion-nutricional` (alumna admitida).
- Wizard paso a paso con tema oscuro de marca.
- El campo presupuesto fue removido del cuestionario; registros viejos conservan el dato si existía.

### Catálogo de alimentos (seed)

Para precargar el catálogo usado en planes nutricionales (idempotente: no duplica por nombre):

```bash
npm run seed:alimentos -w @ivisfit/backend-api
```

Requiere `MONGODB_URI` en `apps/backend-api/.env`.
