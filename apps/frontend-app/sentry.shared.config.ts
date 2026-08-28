import type { init } from "@sentry/nextjs";

type SentryInitOptions = NonNullable<Parameters<typeof init>[0]>;

const isDev = process.env.NODE_ENV === "development";
const hasDsn = Boolean(process.env.SENTRY_DSN);

export const sentryBaseConfig: SentryInitOptions = {
  dsn: process.env.SENTRY_DSN,
  enabled: hasDsn && !isDev,
  tracesSampleRate: isDev ? 0 : 1.0,
  debug: process.env.SENTRY_DEBUG === "true",
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
};
