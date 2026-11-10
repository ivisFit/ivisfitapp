# Backend API — IVIS Fit monorepo
# Build:  docker build -t ivisfit/ivisapp .
# Push:   docker push ivisfit/ivisapp:latest

FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat wget
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

FROM base AS builder
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc turbo.json ./
COPY apps/backend-api ./apps/backend-api
COPY packages ./packages
RUN pnpm install --frozen-lockfile
RUN pnpm exec turbo run build --filter=@ivisfit/backend-api
RUN pnpm deploy --filter=@ivisfit/backend-api --prod /deploy

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=4000

WORKDIR /app
COPY --from=builder /deploy ./

RUN addgroup -S ivisfit && adduser -S ivisfit -G ivisfit
USER ivisfit

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/health" || exit 1

CMD ["node", "dist/index.js"]
