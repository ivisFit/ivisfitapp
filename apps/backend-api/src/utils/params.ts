import type { Request } from "express";
import mongoose from "mongoose";
import { AppError } from "./errors.js";

const MONGO_OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/;

export function getParamId(req: Request, key = "id"): string {
  const value = req.params[key];

  if (typeof value !== "string" || !value) {
    throw new AppError(400, `Parámetro ${key} inválido`);
  }

  return value;
}

function extractMongoId(raw: unknown): string {
  if (raw == null) return "";

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    return MONGO_OBJECT_ID_RE.test(trimmed) ? trimmed : "";
  }

  if (typeof raw !== "object") return "";

  if (typeof (raw as { toHexString?: () => string }).toHexString === "function") {
    try {
      const hex = (raw as { toHexString: () => string }).toHexString();
      return MONGO_OBJECT_ID_RE.test(hex) ? hex : "";
    } catch {
      return "";
    }
  }

  if ("$oid" in raw && typeof (raw as { $oid: unknown }).$oid === "string") {
    const oid = (raw as { $oid: string }).$oid.trim();
    return MONGO_OBJECT_ID_RE.test(oid) ? oid : "";
  }

  const asString = String(raw);
  if (asString !== "[object Object]" && MONGO_OBJECT_ID_RE.test(asString)) {
    return asString;
  }

  return "";
}

export function serializeMongoId(...values: unknown[]): string {
  for (const value of values) {
    const id = extractMongoId(value);
    if (id) return id;
  }
  return "";
}

export function assertValidObjectId(id: string, label = "id"): string {
  if (!mongoose.isValidObjectId(id) || !MONGO_OBJECT_ID_RE.test(id)) {
    throw new AppError(400, `Parámetro ${label} inválido`);
  }

  return id;
}
