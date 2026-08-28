import type { NextFunction, Request, Response } from "express";
import { getUsuarioForSession, resolveEstadoAdmision } from "../services/me.service.js";
import { AppError } from "../utils/errors.js";

export async function requireAdmittedUser(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const usuario = await getUsuarioForSession(req);

    if (
      usuario.rol === "alumna" &&
      resolveEstadoAdmision(usuario) !== "admitida"
    ) {
      return next(
        new AppError(
          403,
          "Tu solicitud todavía no fue admitida por la profesora",
        ),
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}
