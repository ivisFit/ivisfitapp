import {
  Medicion,
  Usuario,
  calculateAgeYears,
  calculateImc,
  calculateJacksonPollock3,
  calculateJacksonPollock7,
  calculateMasaMagra,
  calculateUsNavy,
  type CreateMedicionInput,
  type Sexo,
} from "@ivisfit/database";
import { AppError, assertFound } from "../utils/errors.js";

export const medicionesService = {
  async list(alumnaId?: string, metodoCalculo?: string) {
    const filter: Record<string, unknown> = {};
    if (alumnaId) filter.alumnaId = alumnaId;
    if (metodoCalculo) filter.metodoCalculo = metodoCalculo;
    return Medicion.find(filter).sort({ fecha: -1 });
  },

  async getUltimaByAlumna(alumnaId: string) {
    return Medicion.findOne({ alumnaId }).sort({ fecha: -1 });
  },

  async getComposicionResumen(alumnaId: string) {
    const [medicion, alumna] = await Promise.all([
      Medicion.findOne({ alumnaId }).sort({ fecha: -1 }),
      Usuario.findById(alumnaId).select("alturaCm"),
    ]);

    if (!medicion) return null;

    const pesoKg = medicion.pesoCorporalKg ?? undefined;

    return {
      pesoKg,
      imc: pesoKg && alumna?.alturaCm ? calculateImc(pesoKg, alumna.alturaCm) : undefined,
      porcentajeGrasaCorporal: medicion.metricas?.porcentajeGrasaCorporal ?? undefined,
      masaMagra: medicion.metricas?.masaMagra ?? undefined,
      fechaMedicion: medicion.fecha?.toISOString(),
    };
  },

  async getById(id: string) {
    const medicion = await Medicion.findById(id);
    return assertFound(medicion, "Medición no encontrada");
  },

  async create(
    data: CreateMedicionInput,
    options?: { asAlumnaSelfService?: boolean },
  ) {
    if (!data.alumnaId) {
      throw new AppError(400, "alumnaId es requerido");
    }

    const alumna = await Usuario.findById(data.alumnaId);
    assertFound(alumna, "Alumna no encontrada");

    if (options?.asAlumnaSelfService) {
      if (!alumna.circunferenciasHabilitadas) {
        throw new AppError(
          403,
          "La medición de circunferencias no está habilitada para tu cuenta",
        );
      }
      if (data.metodoCalculo !== "us-navy") {
        throw new AppError(400, "Solo podés registrar mediciones por circunferencias");
      }
    }

    if (!alumna.sexo || (alumna.sexo !== "hombre" && alumna.sexo !== "mujer")) {
      throw new AppError(
        400,
        "La alumna debe tener sexo registrado para calcular la grasa corporal",
      );
    }

    const sexo = alumna.sexo as Sexo;
    const fechaMedicion = data.fecha ?? new Date();
    let porcentajeGrasaCorporal: number;

    try {
      if (data.metodoCalculo === "jp3") {
        if (!alumna.fechaNacimiento) {
          throw new AppError(
            400,
            "La alumna debe tener fecha de nacimiento registrada para calcular la grasa corporal",
          );
        }
        if (!data.pliegues) {
          throw new AppError(400, "Los pliegues son requeridos para el método JP3");
        }
        const edad = calculateAgeYears(alumna.fechaNacimiento, fechaMedicion);
        porcentajeGrasaCorporal = calculateJacksonPollock3(
          sexo,
          edad,
          data.pliegues,
        ).porcentajeGrasaCorporal;
      } else if (data.metodoCalculo === "jp7") {
        if (!alumna.fechaNacimiento) {
          throw new AppError(
            400,
            "La alumna debe tener fecha de nacimiento registrada para calcular la grasa corporal",
          );
        }
        if (!data.pliegues) {
          throw new AppError(400, "Los pliegues son requeridos para el método JP7");
        }
        const edad = calculateAgeYears(alumna.fechaNacimiento, fechaMedicion);
        porcentajeGrasaCorporal = calculateJacksonPollock7(
          sexo,
          edad,
          data.pliegues,
        ).porcentajeGrasaCorporal;
      } else if (data.metodoCalculo === "us-navy") {
        if (!alumna.alturaCm || alumna.alturaCm <= 0) {
          throw new AppError(
            400,
            "La alumna debe tener altura registrada en su perfil para el método US Navy",
          );
        }
        if (!data.circunferencias) {
          throw new AppError(
            400,
            "Las circunferencias son requeridas para el método US Navy",
          );
        }
        porcentajeGrasaCorporal = calculateUsNavy(
          sexo,
          alumna.alturaCm,
          data.circunferencias,
        ).porcentajeGrasaCorporal;
      } else {
        throw new AppError(400, "Método de cálculo no válido");
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        400,
        error instanceof Error ? error.message : "Datos de medición inválidos",
      );
    }

    const metricas = {
      porcentajeGrasaCorporal,
      masaMagra: data.pesoCorporalKg
        ? calculateMasaMagra(data.pesoCorporalKg, porcentajeGrasaCorporal)
        : null,
    };

    return Medicion.create({
      alumnaId: data.alumnaId,
      metodoCalculo: data.metodoCalculo,
      fecha: fechaMedicion,
      pliegues: data.pliegues,
      circunferencias: data.circunferencias,
      notas: data.notas,
      pesoCorporalKg: data.pesoCorporalKg,
      metricas,
    });
  },
};
