import type { NextFunction, Request, Response } from "express";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

function getClientIp(req: Request) {
  const forwarded = req.header("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? req.ip;
  }
  return req.ip ?? "unknown";
}

export function rateLimitChatbot(req: Request, res: Response, next: NextFunction) {
  const key = getClientIp(req);
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    next();
    return;
  }

  if (entry.count >= MAX_REQUESTS) {
    res.status(429).json({
      message: "Demasiadas solicitudes. Esperá un momento e intentá de nuevo.",
    });
    return;
  }

  entry.count += 1;
  next();
}
