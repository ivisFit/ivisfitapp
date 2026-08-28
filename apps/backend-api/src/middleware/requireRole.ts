import type { NextFunction, Request, Response } from "express";
import { resolveAppRole } from "@ivisfit/auth";
import { Usuario } from "@ivisfit/database";
import { AppError } from "../utils/errors.js";

type Rol = "profe" | "alumna";

export function requireRole(...roles: Rol[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const correo = req.session?.user?.email;
      const usuario = correo
        ? await Usuario.findOne({ correo }).select("rol")
        : null;
      const sessionRol = req.session?.user?.rol as Rol | undefined;
      const rol = resolveAppRole(usuario?.rol, sessionRol);

      if (!rol || !roles.includes(rol)) {
        return next(new AppError(403, "No tenés permiso para esta acción"));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
