import { auth } from "@ivisfit/auth";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { getCorsAllowedOrigins } from "./config/cors.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { comprobantesRouter } from "./routes/comprobantes.routes.js";
import { chatbotPublicRouter } from "./routes/chatbot.public.routes.js";
import { landingPlanesPublicRouter } from "./routes/landing-planes.public.routes.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();
  const allowedOrigins = getCorsAllowedOrigins();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    }),
  );

  app.all("/api/auth/{*any}", toNodeHandler(auth));
  app.use("/api/comprobantes-pago", comprobantesRouter);
  app.use("/api/chatbot", chatbotPublicRouter);
  app.use("/api/landing-planes", landingPlanesPublicRouter);

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api", requireAuth, apiRouter);

  app.use(errorHandler);

  return app;
}
