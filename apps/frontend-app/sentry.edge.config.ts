import * as Sentry from "@sentry/nextjs";
import { sentryBaseConfig } from "./sentry.shared.config";

Sentry.init(sentryBaseConfig);