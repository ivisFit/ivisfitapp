import { Router, raw } from "express";
import { meController } from "../controllers/me.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/errors.js";
import { resolveImageContentType } from "../utils/image-content-type.js";

const MAX_FOTO_PERFIL_SIZE = "2mb";

export const meFotoPerfilRouter = Router();

meFotoPerfilRouter.post(
  "/",
  raw({ type: "*/*", limit: MAX_FOTO_PERFIL_SIZE }),
  requireAuth,
  asyncHandler(async (req, res) => {
    const filename =
      req.header("x-file-name")?.trim() || `foto-perfil-${Date.now()}.jpg`;
    const headerType = req.header("content-type") ?? "";
    const contentType = resolveImageContentType(headerType, filename);

    if (!contentType) {
      throw new AppError(415, "La foto debe ser JPG, PNG o WebP");
    }

    req.headers["content-type"] = contentType;

    await meController.uploadFotoPerfil(req, res);
  }),
);
