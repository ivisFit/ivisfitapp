import type { NextFunction, Request, Response } from "express";
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
      error: "El comprobante no puede superar 5 MB",
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
