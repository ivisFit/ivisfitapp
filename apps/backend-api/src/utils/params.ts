import type { Request } from "express";
import { AppError } from "./errors.js";

export function getParamId(req: Request, key = "id"): string {
  const value = req.params[key];

  if (typeof value !== "string" || !value) {
    throw new AppError(400, `Parámetro ${key} inválido`);
  }

  return value;
}
