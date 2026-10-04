import type { NextFunction, Request, Response } from "express";
import { JSON_BODY_LIMIT_LABEL } from "../config/http-limits.js";
import { AppError } from "../utils/errors.js";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    (error as { type?: string }).type === "entity.too.large"
  ) {
    return res.status(413).json({
      error: `La solicitud es demasiado grande (máximo ${JSON_BODY_LIMIT_LABEL} para datos JSON). Si es un plan nutricional, probá guardar por partes o contactá soporte.`,
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      details: error.details,
    });
  }

  console.error(error);

  return res.status(500).json({
    error: "Error interno del servidor",
  });
}
