import pino, { type Logger, type Level } from "pino";

const isDevelopment = process.env.NODE_ENV !== "production";

const transport = isDevelopment
  ? {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    }
  : undefined;

const logger: Logger = pino({
  level: (process.env.LOG_LEVEL as Level) || "info",
  transport,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    service: "ivisfit-frontend",
    environment: process.env.NODE_ENV || "development",
  },
});

export function createLogger(context: Record<string, unknown>) {
  return logger.child(context);
}

export { logger };

export const loggers = {
  api: logger.child({ module: "api" }),
  auth: logger.child({ module: "auth" }),
  database: logger.child({ module: "database" }),
  ui: logger.child({ module: "ui" }),
  payment: logger.child({ module: "payment" }),
} as const;