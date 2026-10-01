import { Router, raw } from "express";
import { appAppearanceController } from "../controllers/app-appearance.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/errors.js";

const MAX_LOGIN_VIDEO_SIZE = "8mb";
const ALLOWED_LOGIN_VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);

export const appAppearanceRouter = Router();

appAppearanceRouter.get("/", asyncHandler(appAppearanceController.get));

appAppearanceRouter.post(
  "/login-video",
  raw({ type: "*/*", limit: MAX_LOGIN_VIDEO_SIZE }),
  asyncHandler(async (req, res) => {
    const contentType = req.header("content-type")?.split(";")[0] ?? "";

    if (!ALLOWED_LOGIN_VIDEO_TYPES.has(contentType)) {
      throw new AppError(415, "El video debe ser MP4 o WebM");
    }

    await appAppearanceController.uploadLoginVideo(req, res);
  }),
);

appAppearanceRouter.delete(
  "/login-video",
  asyncHandler(appAppearanceController.clearLoginVideo),
);
