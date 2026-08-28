# Backend API — IVIS Fit monorepo
# Build:  docker build -t ivisfit/ivisapp .
# Push:   docker push ivisfit/ivisapp:latest

FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS deps
COPY package.json package-lock.json turbo.json ./
COPY apps/backend-api/package.json ./apps/backend-api/
COPY packages/auth/package.json ./packages/auth/
COPY packages/database/package.json ./packages/database/
COPY packages/mail/package.json ./packages/mail/
COPY packages/typescript-config ./packages/typescript-config/
RUN npm ci --include=dev

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json turbo.json ./
COPY apps/backend-api ./apps/backend-api
COPY packages ./packages
RUN npx turbo run build --filter=@ivisfit/backend-api

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=4000

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend-api/package.json ./apps/backend-api/
COPY packages/auth/package.json ./packages/auth/
COPY packages/database/package.json ./packages/database/
COPY packages/mail/package.json ./packages/mail/
COPY packages/typescript-config ./packages/typescript-config/

RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/apps/backend-api/dist ./apps/backend-api/dist
COPY --from=builder /app/packages/auth/dist ./packages/auth/dist
COPY --from=builder /app/packages/auth/index.d.ts ./packages/auth/index.d.ts
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/mail/dist ./packages/mail/dist

WORKDIR /app/apps/backend-api

RUN addgroup -S ivisfit && adduser -S ivisfit -G ivisfit
USER ivisfit

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/health" || exit 1

CMD ["node", "dist/index.js"]
