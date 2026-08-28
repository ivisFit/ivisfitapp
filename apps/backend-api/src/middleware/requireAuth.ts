import { auth } from "@ivisfit/auth";
import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors.js";

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return next(new AppError(401, "No autenticado"));
    }

    req.session = session;
    next();
  } catch (error) {
    next(error);
  }
}
