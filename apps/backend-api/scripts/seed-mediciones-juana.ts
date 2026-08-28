import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  calculateAgeYears,
  calculateJacksonPollock3,
  calculateJacksonPollock7,
  calculateUsNavy,
  connectDB,
  Medicion,
  Usuario,
} from "@ivisfit/database";

const envPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.env",
);

dotenv.config({ path: envPath });

const SAMPLE_MEDICIONES = [
  {
    metodoCalculo: "jp3" as const,
    daysAgo: 84,
    pliegues: { tricipital: 22, suprailiaco: 20, muslo: 18 },
    notas: "Control inicial JP3",
  },
  {
    metodoCalculo: "jp3" as const,
    daysAgo: 56,
    pliegues: { tricipital: 21, suprailiaco: 19, muslo: 17 },
    notas: "Seguimiento JP3 mes 2",
  },
  {
    metodoCalculo: "jp7" as const,
    daysAgo: 28,
    pliegues: {
      pectoral: 12,
      axilarMedia: 11,
      tricipital: 18,
      subescapular: 16,
      abdominal: 20,
      suprailiaco: 17,
      muslo: 15,
    },
    notas: "Seguimiento JP7",
  },
  {
    metodoCalculo: "us-navy" as const,
    daysAgo: 7,
    circunferencias: { cuelloCm: 32, cinturaCm: 72, caderaCm: 98 },
    notas: "Control US Navy",
  },
];

const SEED_NOTAS = SAMPLE_MEDICIONES.map((sample) => sample.notas);

function dateDaysAgo(days: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

function sameCalendarDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

async function main() {
  await connectDB();

  const juana = await Usuario.findOne({
    nombre: /^Juana$/i,
    rol: "alumna",
  });

  if (!juana) {
    console.error('No se encontró una alumna con nombre "Juana".');
    process.exit(1);
  }

  let profileUpdated = false;
  if (!juana.sexo) {
    juana.sexo = "mujer";
    profileUpdated = true;
  }
  if (!juana.fechaNacimiento) {
    juana.fechaNacimiento = new Date("1995-06-15T12:00:00.000Z");
    profileUpdated = true;
  }
  if (!juana.alturaCm || juana.alturaCm <= 0) {
    juana.alturaCm = 165;
    profileUpdated = true;
  }
  if (profileUpdated) {
    await juana.save();
    console.log("Perfil de Juana actualizado (sexo, fecha nacimiento, altura).");
  }

  const removed = await Medicion.deleteMany({
    alumnaId: juana._id,
    notas: { $in: SEED_NOTAS },
  });
  if (removed.deletedCount > 0) {
    console.log(`Eliminadas ${removed.deletedCount} medición(es) previas del seed.`);
  }

  let inserted = 0;

  for (const sample of SAMPLE_MEDICIONES) {
    const fecha = dateDaysAgo(sample.daysAgo);
    const existing = await Medicion.findOne({
      alumnaId: juana._id,
      notas: sample.notas,
    });

    if (existing && sameCalendarDay(existing.fecha, fecha)) {
      console.log(`Omitida (ya existe): ${sample.notas}`);
      continue;
    }

    let porcentajeGrasaCorporal: number;

    if (sample.metodoCalculo === "jp3") {
      const edad = calculateAgeYears(juana.fechaNacimiento!, fecha);
      porcentajeGrasaCorporal = calculateJacksonPollock3(
        "mujer",
        edad,
        sample.pliegues!,
      ).porcentajeGrasaCorporal;
    } else if (sample.metodoCalculo === "jp7") {
      const edad = calculateAgeYears(juana.fechaNacimiento!, fecha);
      porcentajeGrasaCorporal = calculateJacksonPollock7(
        "mujer",
        edad,
        sample.pliegues!,
      ).porcentajeGrasaCorporal;
    } else {
      porcentajeGrasaCorporal = calculateUsNavy(
        "mujer",
        juana.alturaCm!,
        sample.circunferencias!,
      ).porcentajeGrasaCorporal;
    }

    await Medicion.create({
      alumnaId: juana._id,
      metodoCalculo: sample.metodoCalculo,
      fecha,
      pliegues: sample.pliegues,
      circunferencias: sample.circunferencias,
      metricas: {
        porcentajeGrasaCorporal,
        masaMagra: null,
      },
      notas: sample.notas,
    });

    inserted += 1;
    console.log(
      `Insertada: ${sample.notas} (${fecha.toISOString().slice(0, 10)}) — ${porcentajeGrasaCorporal}% grasa`,
    );
  }

  if (inserted === 0) {
    console.log("Las mediciones de ejemplo para Juana ya estaban cargadas.");
  } else {
    console.log(`Listo: ${inserted} medición(es) creada(s) para ${juana.nombre}.`);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error("Error al sembrar mediciones:", error);
  process.exit(1);
});
