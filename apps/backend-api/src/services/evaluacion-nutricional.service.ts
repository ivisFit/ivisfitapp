import {
  EvaluacionNutricional,
  Usuario,
  emitNotificacionProfe,
  notificacionEvaluacionCompletada,
  type CreateEvaluacionNutricionalInput,
} from "@ivisfit/database";
import { sendEvaluacionNutricionalProfeEmail } from "@ivisfit/mail";
import { getAppName, getAppUrl } from "../lib/email.js";
import { AppError, assertFound } from "../utils/errors.js";

const OBJETIVO_NUTRICIONAL_LABELS: Record<
  CreateEvaluacionNutricionalInput["objetivo"],
  string
> = {
  bajar_grasa: "Bajar grasa",
  ganar_masa: "Ganar masa muscular",
  recomposicion: "Recomposición corporal",
  mantener: "Mantener peso",
  rendimiento: "Mejorar rendimiento",
  salud: "Salud general",
};

function getProfeNotificationEmail(): string | null {
  const value = process.env.PROFE_NOTIFICATION_EMAIL?.trim();
  return value || null;
}

function canSendProfeNotificationEmail(): boolean {
  return Boolean(
    getProfeNotificationEmail() &&
      process.env.RESEND_API_KEY?.trim() &&
      process.env.RESEND_FROM_EMAIL?.trim(),
  );
}

export const evaluacionNutricionalService = {
  async getByAlumnaId(alumnaId: string) {
    const evaluacion = await EvaluacionNutricional.findOne({ alumnaId });
    return evaluacion;
  },

  async create(data: CreateEvaluacionNutricionalInput) {
    if (!data.alumnaId) {
      throw new AppError(400, "alumnaId es requerido");
    }

    const alumna = await Usuario.findById(data.alumnaId);
    assertFound(alumna, "Alumna no encontrada");

    const existing = await EvaluacionNutricional.findOne({
      alumnaId: data.alumnaId,
    });
    if (existing) {
      throw new AppError(
        409,
        "Ya completaste la evaluación nutricional inicial",
      );
    }

    const evaluacion = await EvaluacionNutricional.create({
      ...data,
      completada: true,
    });

    const objetivoLabel =
      OBJETIVO_NUTRICIONAL_LABELS[data.objetivo] ?? data.objetivo;

    await emitNotificacionProfe(
      notificacionEvaluacionCompletada(
        String(alumna._id),
        alumna.nombre,
        String(evaluacion._id),
        objetivoLabel,
      ),
    );

    if (!canSendProfeNotificationEmail()) {
      console.warn(
        "Evaluación guardada en la bandeja. El email a profe no se envió: configurá PROFE_NOTIFICATION_EMAIL y Resend.",
      );
      return evaluacion;
    }

    try {
      const to = getProfeNotificationEmail();
      if (!to) return evaluacion;

      await sendEvaluacionNutricionalProfeEmail({
        to,
        alumnaNombre: alumna.nombre,
        objetivoLabel,
        alumnaId: String(data.alumnaId),
        appName: getAppName(),
        appUrl: getAppUrl(),
      });
    } catch (error) {
      console.error("No se pudo notificar evaluación nutricional a profe:", error);
    }

    return evaluacion;
  },
};
