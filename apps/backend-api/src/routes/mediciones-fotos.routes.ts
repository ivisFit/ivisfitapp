import { Router, raw } from "express";
import { medicionesController } from "../controllers/mediciones.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/errors.js";
import { resolveImageContentType } from "../utils/image-content-type.js";

const MAX_MEDICION_FOTO_SIZE = "6mb";

export const medicionesFotosRouter = Router();

medicionesFotosRouter.post(
  "/",
  raw({ type: "*/*", limit: MAX_MEDICION_FOTO_SIZE }),
  requireAuth,
  asyncHandler(async (req, res) => {
    const filename =
      req.header("x-file-name")?.trim() || `medicion-foto-${Date.now()}`;
    const headerType = req.header("content-type") ?? "";
    const contentType = resolveImageContentType(headerType, filename);

    if (!contentType) {
      throw new AppError(
        415,
        "La foto debe ser JPG, PNG o WebP (no se admite HEIC u otros formatos)",
      );
    }

    req.headers["content-type"] = contentType;

    await medicionesController.uploadFoto(req, res);
  }),
);
