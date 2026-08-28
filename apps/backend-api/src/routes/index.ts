import { Router } from "express";
import { requireRole } from "../middleware/requireRole.js";
import { requireAdmittedUser } from "../middleware/requireAdmittedUser.js";
import { meRouter } from "./me.routes.js";
import { admisionesRouter } from "./admisiones.routes.js";
import { ejerciciosRouter } from "./ejercicios.routes.js";
import { logsPesosRouter } from "./logs-pesos.routes.js";
import { rutinaProgresoRouter } from "./rutina-progreso.routes.js";
import { medicionesRouter } from "./mediciones.routes.js";
import { evaluacionNutricionalRouter } from "./evaluacion-nutricional.routes.js";
import { planNutricionalRouter } from "./plan-nutricional.routes.js";
import { panelRouter } from "./panel.routes.js";
import { landingPlanesRouter } from "./landing-planes.routes.js";
import { chatbotRouter } from "./chatbot.routes.js";
import { planTemplatesRouter } from "./plan-templates.routes.js";
import { rutinasRouter } from "./rutinas.routes.js";
import { usuariosRouter } from "./usuarios.routes.js";
import { alimentosRouter } from "./alimentos.routes.js";
import { tutorialesRouter } from "./tutoriales.routes.js";
import { asistenteRouter } from "./asistente.routes.js";
import { coachInsightsRouter } from "./coach-insights.routes.js";
import { checkinsAlimentacionRouter } from "./checkins-alimentacion.routes.js";
import { gamificacionRouter } from "./gamificacion.routes.js";
import { reunionesRouter } from "./reuniones.routes.js";
import { mensajesRouter } from "./mensajes.routes.js";
import { automatizacionesRouter } from "./automatizaciones.routes.js";

export const apiRouter = Router();

apiRouter.use("/me", meRouter);
apiRouter.use(requireAdmittedUser);

apiRouter.use("/admisiones", requireRole("profe"), admisionesRouter);
apiRouter.use("/usuarios", requireRole("profe"), usuariosRouter);
apiRouter.use("/ejercicios", ejerciciosRouter);
apiRouter.use("/panel", requireRole("profe"), panelRouter);
apiRouter.use("/plan-templates", requireRole("profe"), planTemplatesRouter);
apiRouter.use("/landing-planes", requireRole("profe"), landingPlanesRouter);
apiRouter.use("/chatbot/leads", requireRole("profe"), chatbotRouter);
apiRouter.use("/alimentos", requireRole("profe"), alimentosRouter);
apiRouter.use("/tutoriales", tutorialesRouter);
apiRouter.use("/coach-insights", coachInsightsRouter);
apiRouter.use(
  "/checkins-alimentacion",
  requireRole("alumna"),
  checkinsAlimentacionRouter,
);
apiRouter.use("/rutinas", rutinasRouter);
apiRouter.use("/logs-pesos", logsPesosRouter);
apiRouter.use("/rutina-progreso", rutinaProgresoRouter);
apiRouter.use("/mediciones", medicionesRouter);
apiRouter.use("/evaluacion-nutricional", evaluacionNutricionalRouter);
apiRouter.use("/plan-nutricional", planNutricionalRouter);
apiRouter.use("/asistente", requireRole("alumna"), asistenteRouter);
apiRouter.use("/gamificacion", requireRole("alumna"), gamificacionRouter);
apiRouter.use("/reuniones", reunionesRouter);
apiRouter.use("/mensajes", mensajesRouter);
apiRouter.use("/automatizaciones", automatizacionesRouter);
