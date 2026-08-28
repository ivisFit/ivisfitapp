import { Router, raw } from "express";
import { uploadComprobantePago } from "../services/cloudinary.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/errors.js";

const MAX_FILE_SIZE = "5mb";
const ALLOWED_CONTENT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const comprobantesRouter = Router();

comprobantesRouter.post(
  "/",
  raw({ type: "*/*", limit: MAX_FILE_SIZE }),
  asyncHandler(async (req, res) => {
    const contentType = req.header("content-type")?.split(";")[0] ?? "";

    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      throw new AppError(
        415,
        "El comprobante debe ser PDF, JPG, PNG o WebP",
      );
    }

    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      throw new AppError(400, "Adjuntá un comprobante para continuar");
    }

    const filename =
      req.header("x-file-name")?.trim() || `comprobante-${Date.now()}`;

    const comprobante = await uploadComprobantePago({
      file: req.body,
      contentType,
      filename,
    });

    res.status(201).json(comprobante);
  }),
);
