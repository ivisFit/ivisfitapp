import * as Sentry from "@sentry/nextjs";
import { sentryBaseConfig } from "./sentry.shared.config";

const isDev = process.env.NODE_ENV === "development";

Sentry.init({
  ...sentryBaseConfig,
  replaysOnErrorSampleRate: isDev ? 0 : 1.0,
  replaysSessionSampleRate: isDev ? 0 : 0.1,
  integrations: isDev
    ? []
    : [
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
});