import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  Ejercicio,
  Rutina,
  Usuario,
  connectDB,
  type Types,
} from "@ivisfit/database";

const envPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.env",
);

dotenv.config({ path: envPath });

const ALUMNA_EMAIL = "alumna.prueba@ivisfit.com";

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"] as const;

const EJERCICIOS_FALLBACK = [
  {
    nombre: "Sentadilla con barra",
    videoUrl: "https://www.youtube.com/watch?v=ultWZbUMPL8",
    descripcion: "Piernas — técnica básica",
  },
  {
    nombre: "Press de banca con mancuernas",
    videoUrl: "https://www.youtube.com/watch?v=VmB1G1K7v94",
    descripcion: "Pecho y tríceps",
  },
  {
    nombre: "Peso muerto rumano",
    videoUrl: "https://www.youtube.com/watch?v=2SHsk9AzIq4",
    descripcion: "Cadena posterior",
  },
  {
    nombre: "Remo con mancuerna",
    videoUrl: "https://www.youtube.com/watch?v=roCP6wCcXOE",
    descripcion: "Espalda",
  },
  {
    nombre: "Press militar con mancuernas",
    videoUrl: "https://www.youtube.com/watch?v=qEwKCR5JCog",
    descripcion: "Hombros",
  },
  {
    nombre: "Curl de bíceps con barra",
    videoUrl: "https://www.youtube.com/watch?v=kwG2ipFRgfo",
    descripcion: "Bíceps",
  },
  {
    nombre: "Extensión de tríceps en polea",
    videoUrl: "https://www.youtube.com/watch?v=2-LAMcpzODU",
    descripcion: "Tríceps",
  },
  {
    nombre: "Plancha frontal",
    videoUrl: "https://www.youtube.com/watch?v=ASdvN_XEl_c",
    descripcion: "Core",
  },
  {
    nombre: "Zancada caminando",
    videoUrl: "https://www.youtube.com/watch?v=L8fvypPrzzs",
    descripcion: "Piernas unilateral",
  },
  {
    nombre: "Hip thrust con barra",
    videoUrl: "https://www.youtube.com/watch?v=SEd7HmE02T4",
    descripcion: "Glúteos",
  },
] as const;

function mondayStartDate(reference = new Date()): Date {
  const date = new Date(reference);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(12, 0, 0, 0);
  return date;
}

type EjercicioRow = { _id: Types.ObjectId };

async function ensureCatalogEjercicios(): Promise<EjercicioRow[]> {
  const existing = await Ejercicio.find().sort({ nombre: 1 }).select("_id nombre");
  if (existing.length >= 8) {
    return existing.map((row) => ({ _id: row._id }));
  }

  for (const sample of EJERCICIOS_FALLBACK) {
    await Ejercicio.updateOne(
      { nombre: sample.nombre },
      {
        $setOnInsert: {
          nombre: sample.nombre,
          videoUrl: sample.videoUrl,
          descripcion: sample.descripcion,
        },
      },
      { upsert: true },
    );
  }

  const loaded = await Ejercicio.find().sort({ nombre: 1 }).select("_id");
  return loaded.map((row) => ({ _id: row._id }));
}

function prescribir(
  ejercicioId: Types.ObjectId,
  series: number,
  repeticiones: number,
  descansoSegundos: number,
) {
  return {
    ejercicioId,
    series,
    repeticiones,
    descansoSegundos,
    unidad: "repeticiones" as const,
    registro: "peso" as const,
  };
}

function buildSemanas(ejercicios: EjercicioRow[]) {
  let cursor = 0;
  const nextId = () => {
    const row = ejercicios[cursor % ejercicios.length];
    cursor += 1;
    return row._id;
  };

  const semanas = [];
  for (let numeroSemana = 1; numeroSemana <= 4; numeroSemana += 1) {
    const dias = DIAS_SEMANA.map((nombreDia, dayIndex) => {
      const ejerciciosDia = [];
      for (let slot = 0; slot < 6; slot += 1) {
        const series = slot % 2 === 0 ? 3 : 4;
        const repeticiones = dayIndex % 2 === 0 ? 12 : 10;
        ejerciciosDia.push(
          prescribir(nextId(), series, repeticiones, slot % 2 === 0 ? 60 : 75),
        );
      }
      return {
        nombreDia,
        comentario:
          numeroSemana === 1
            ? "Plan de prueba para la cuenta alumna.prueba@ivisfit.com"
            : undefined,
        ejercicios: ejerciciosDia,
      };
    });
    semanas.push({ numeroSemana, dias });
  }
  return semanas;
}

async function main() {
  await connectDB();

  const alumna = await Usuario.findOne({
    correo: ALUMNA_EMAIL.toLowerCase(),
    rol: "alumna",
  });

  if (!alumna) {
    console.error(`No se encontró alumna con correo ${ALUMNA_EMAIL}.`);
    process.exit(1);
  }

  alumna.modoPlan = "ambos";
  alumna.soloAlimentacion = false;
  await alumna.save();

  const existing = await Rutina.findOne({ alumnaId: alumna._id }).sort({
    createdAt: -1,
  });
  if (existing) {
    console.log(
      `Listo: ${alumna.nombre} ya tiene rutina "${existing.nombrePlan}". Modo plan: ambos.`,
    );
    process.exit(0);
  }

  const ejercicios = await ensureCatalogEjercicios();
  if (ejercicios.length === 0) {
    console.error("No hay ejercicios en el catálogo.");
    process.exit(1);
  }

  const rutina = await Rutina.create({
    alumnaId: alumna._id,
    nombrePlan: "Plan de prueba — 4 semanas",
    duracionSemanas: 4,
    startDate: mondayStartDate(),
    planTemplateSnapshot: {
      nombre: "Plan de prueba",
      duracionSemanas: 4,
      duracionLabel: "4 semanas",
      formato: "Gimnasio",
      inversion: "Incluido en membresía",
    },
    semanas: buildSemanas(ejercicios),
  });

  console.log(
    `Listo: rutina "${rutina.nombrePlan}" creada para ${alumna.nombre} (${ALUMNA_EMAIL}).`,
  );
  console.log("Modo plan actualizado a ambos (rutina + alimentación).");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
