import { Router } from "express";
import {
  createUsuarioSchema,
  updateUsuarioSchema,
  approveHealthChangesSchema,
} from "@ivisfit/database";
import { usuariosController } from "../controllers/usuarios.controller.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const usuariosRouter = Router();

usuariosRouter.get("/", asyncHandler(usuariosController.list));
usuariosRouter.get("/:id/historial", asyncHandler(usuariosController.getHistorial));
usuariosRouter.get("/:id", asyncHandler(usuariosController.getById));
usuariosRouter.post(
  "/",
  validateBody(createUsuarioSchema),
  asyncHandler(usuariosController.create),
);
usuariosRouter.patch(
  "/:id",
  validateBody(updateUsuarioSchema),
  asyncHandler(usuariosController.update),
);
usuariosRouter.patch(
  "/:id/approve-health",
  validateBody(approveHealthChangesSchema),
  asyncHandler(usuariosController.approveHealthChanges),
);
usuariosRouter.patch(
  "/:id/reject-health",
  validateBody(approveHealthChangesSchema),
  asyncHandler(usuariosController.rejectHealthChanges),
);
usuariosRouter.delete("/:id", asyncHandler(usuariosController.remove));
