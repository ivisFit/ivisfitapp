import {
  Medicion,
  Usuario,
  calculateAgeYears,
  calculateImc,
  calculateJacksonPollock3,
  calculateJacksonPollock7,
  calculateMasaMagra,
  calculateUsNavy,
  normalizePlieguesJP7,
  type CreateMedicionInput,
  type Sexo,
  type UpdateFotosProgresoInput,
} from "@ivisfit/database";
import { destroyCloudinaryAsset } from "./cloudinary.service.js";
import { AppError, assertFound } from "../utils/errors.js";

const MEDICION_FOTO_PUBLIC_ID_PREFIX = "ivisfit/mediciones";

const FOTO_SLOTS = [
  "frente",
  "espalda",
  "perfilIzquierdo",
  "perfilDerecho",
] as const;

type FotoSlot = (typeof FOTO_SLOTS)[number];

type StoredMedicionFoto = {
  url: string;
  publicId: string;
  nombreArchivo?: string;
  uploadedAt?: Date;
};

function assertFotosProgresoPublicIds(
  fotosProgreso?: CreateMedicionInput["fotosProgreso"],
) {
  if (!fotosProgreso) return;

  for (const imagen of Object.values(fotosProgreso)) {
    if (!imagen) continue;
    if (!imagen.publicId.startsWith(MEDICION_FOTO_PUBLIC_ID_PREFIX)) {
      throw new AppError(400, "La imagen de medición no es válida");
    }
  }
}

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

    const pliegues =
      data.metodoCalculo === "jp7" && data.pliegues
        ? normalizePlieguesJP7(data.pliegues)
        : data.pliegues;

    assertFotosProgresoPublicIds(data.fotosProgreso);

    return Medicion.create({
      alumnaId: data.alumnaId,
      metodoCalculo: data.metodoCalculo,
      fecha: fechaMedicion,
      pliegues,
      circunferencias: data.circunferencias,
      notas: data.notas,
      pesoCorporalKg: data.pesoCorporalKg,
      fotosProgreso: data.fotosProgreso,
      metricas,
    });
  },

  async updateFotos(id: string, data: UpdateFotosProgresoInput) {
    const medicion = await this.getById(id);

    if (medicion.metodoCalculo !== "jp3" && medicion.metodoCalculo !== "jp7") {
      throw new AppError(
        400,
        "Solo se pueden adjuntar fotos a mediciones de pliegues",
      );
    }

    const incoming = data.fotosProgreso;
    for (const imagen of Object.values(incoming)) {
      if (!imagen) continue;
      if (!imagen.publicId.startsWith(MEDICION_FOTO_PUBLIC_ID_PREFIX)) {
        throw new AppError(400, "La imagen de medición no es válida");
      }
    }

    const previousRaw =
      medicion.fotosProgreso &&
      typeof medicion.fotosProgreso === "object" &&
      "toObject" in medicion.fotosProgreso &&
      typeof medicion.fotosProgreso.toObject === "function"
        ? medicion.fotosProgreso.toObject()
        : (medicion.fotosProgreso ?? {});

    const next: Partial<Record<FotoSlot, StoredMedicionFoto>> = {};
    for (const slot of FOTO_SLOTS) {
      const existing = readStoredFoto(
        (previousRaw as Record<string, unknown>)[slot],
      );
      if (existing) next[slot] = existing;
    }

    const removedPublicIds: string[] = [];
    for (const slot of FOTO_SLOTS) {
      if (!Object.hasOwn(incoming, slot)) continue;
      const value = incoming[slot];
      const previous = next[slot];
      if (value == null) {
        if (previous?.publicId) removedPublicIds.push(previous.publicId);
        delete next[slot];
        continue;
      }
      if (previous?.publicId && previous.publicId !== value.publicId) {
        removedPublicIds.push(previous.publicId);
      }
      next[slot] = {
        url: value.url,
        publicId: value.publicId,
        nombreArchivo: value.nombreArchivo,
        uploadedAt: value.uploadedAt,
      };
    }

    const stillUsed = new Set(
      FOTO_SLOTS.map((slot) => next[slot]?.publicId).filter(
        (publicId): publicId is string => Boolean(publicId),
      ),
    );
    const toDestroy = removedPublicIds.filter((publicId) => !stillUsed.has(publicId));
    const hasAny = FOTO_SLOTS.some((slot) => next[slot]);

    const updated = assertFound(
      await Medicion.findByIdAndUpdate(
        medicion._id,
        hasAny
          ? { $set: { fotosProgreso: next } }
          : { $unset: { fotosProgreso: 1 } },
        { new: true },
      ),
      "Medición no encontrada",
    );

    for (const publicId of toDestroy) {
      try {
        await destroyCloudinaryAsset(publicId);
      } catch (error) {
        console.error("[updateFotos] destroy", { publicId, error });
      }
    }

    return updated;
  },
};

function readStoredFoto(value: unknown): StoredMedicionFoto | undefined {
  if (!value || typeof value !== "object") return undefined;
  const foto = value as StoredMedicionFoto;
  if (!foto.publicId || !foto.url) return undefined;
  return {
    url: foto.url,
    publicId: foto.publicId,
    nombreArchivo: foto.nombreArchivo,
    uploadedAt: foto.uploadedAt,
  };
}
