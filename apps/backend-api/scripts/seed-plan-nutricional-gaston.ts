import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  Alimento,
  EvaluacionNutricional,
  PlanNutricional,
  Usuario,
  calculateMacrosObjetivo,
  connectDB,
} from "@ivisfit/database";
import mongoose from "mongoose";
import { planNutricionalService } from "../src/services/plan-nutricional.service.js";

const envPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.env",
);

dotenv.config({ path: envPath });

const ALUMNA_EMAIL = "gastonjaurena@gmail.com";
const SEED_TITULO = "Plan personalizado (seed test Gastón)";

type IngSeed = {
  nombre: string;
  cantidad: number;
  unidad: "g" | "ml" | "unidad";
};

const DIA_TIPO: {
  nombre: string;
  comidas: {
    nombre: string;
    horario: string;
    preparacion?: string;
    ingredientes: IngSeed[];
  }[];
} = {
  nombre: "Día tipo",
  comidas: [
    {
      nombre: "Desayuno",
      horario: "08:00",
      preparacion: "Cocinar avena con agua o leche; acompañar con huevo revuelto y banana.",
      ingredientes: [
        { nombre: "Avena arrollada", cantidad: 40, unidad: "g" },
        { nombre: "Huevo entero", cantidad: 2, unidad: "unidad" },
        { nombre: "Banana", cantidad: 120, unidad: "g" },
      ],
    },
    {
      nombre: "Almuerzo",
      horario: "13:00",
      preparacion: "Plancha de pollo con arroz y ensalada de hojas verdes con aceite de oliva.",
      ingredientes: [
        { nombre: "Pechuga de pollo", cantidad: 150, unidad: "g" },
        { nombre: "Arroz integral cocido", cantidad: 180, unidad: "g" },
        { nombre: "Lechuga", cantidad: 80, unidad: "g" },
        { nombre: "Aceite de oliva", cantidad: 10, unidad: "ml" },
      ],
    },
    {
      nombre: "Merienda",
      horario: "17:00",
      ingredientes: [
        { nombre: "Yogur natural descremado", cantidad: 170, unidad: "g" },
        { nombre: "Almendras", cantidad: 20, unidad: "g" },
      ],
    },
    {
      nombre: "Cena",
      horario: "21:00",
      preparacion: "Merluza al horno con batata y brócoli al vapor.",
      ingredientes: [
        { nombre: "Merluza", cantidad: 180, unidad: "g" },
        { nombre: "Batata cocida", cantidad: 200, unidad: "g" },
        { nombre: "Brócoli cocido", cantidad: 150, unidad: "g" },
      ],
    },
  ],
};

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

  if (!alumna.alturaCm || alumna.alturaCm <= 0) {
    alumna.alturaCm = 178;
  }
  if (!alumna.sexo) {
    alumna.sexo = "hombre";
  }
  if (!alumna.fechaNacimiento) {
    alumna.fechaNacimiento = new Date("1990-03-15T12:00:00.000Z");
  }
  await alumna.save();

  const evaluacionPayload = {
    alumnaId: alumna._id,
    edad: 35,
    sexo: "hombre" as const,
    estaturaCm: alumna.alturaCm,
    pesoActualKg: 82,
    pesoObjetivoKg: 78,
    fechaObjetivo: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
    nivelActividad: "moderado" as const,
    ocupacion: "activo" as const,
    objetivo: "recomposicion" as const,
    preferenciasAlimentarias: ["omnivoro" as const],
    restricciones: [] as const,
    alergias: [] as string[],
    alimentosFavoritos: ["Pechuga de pollo", "Avena arrollada"],
    alimentosEvitados: [] as string[],
    horariosDisponibles: ["manana" as const, "tarde" as const, "noche" as const],
    cantidadComidas: 4,
    presupuestoAproximado: "medio" as const,
    tiempoCocinaMinutos: 45,
    completada: true,
  };

  const evaluacion = await EvaluacionNutricional.findOneAndUpdate(
    { alumnaId: alumna._id },
    { $set: evaluacionPayload },
    { upsert: true, new: true },
  );

  const macrosObjetivo = calculateMacrosObjetivo(evaluacion.toObject());

  const alimentos = await Alimento.find({ activo: true }).lean();
  const byNombre = new Map(
    alimentos.map((item) => [item.nombre.toLowerCase(), item]),
  );

  function mapIngredientes(list: IngSeed[]) {
    return list.map((ing) => {
      const match = byNombre.get(ing.nombre.toLowerCase());
      return {
        nombre: ing.nombre,
        cantidad: ing.cantidad,
        unidad: ing.unidad,
        ...(match ? { alimentoId: String(match._id) } : {}),
      };
    });
  }

  const dias = [
    {
      ...DIA_TIPO,
      comidas: DIA_TIPO.comidas.map((comida) => ({
        ...comida,
        ingredientes: mapIngredientes(comida.ingredientes),
      })),
    },
    {
      nombre: "Día entrenamiento",
      comidas: DIA_TIPO.comidas.map((comida) => ({
        ...comida,
        nombre:
          comida.nombre === "Merienda" ? "Pre entreno" : comida.nombre,
        ingredientes: mapIngredientes(
          comida.nombre === "Merienda"
            ? [
                { nombre: "Banana", cantidad: 100, unidad: "g" },
                { nombre: "Proteína en polvo (whey)", cantidad: 30, unidad: "g" },
              ]
            : comida.ingredientes,
        ),
      })),
    },
  ];

  const removedDraft = await PlanNutricional.deleteMany({
    alumnaId: alumna._id,
    estado: "borrador",
  });
  if (removedDraft.deletedCount > 0) {
    console.log(`Eliminados ${removedDraft.deletedCount} borrador(es) previo(s).`);
  }

  const archived = await PlanNutricional.updateMany(
    { alumnaId: alumna._id, estado: "publicado" },
    { $set: { estado: "archivado" } },
  );
  if (archived.modifiedCount > 0) {
    console.log(`Archivados ${archived.modifiedCount} plan(es) publicado(s) anterior(es).`);
  }

  const plan = await planNutricionalService.create({
    alumnaId: String(alumna._id),
    evaluacionId: String(evaluacion._id),
    titulo: SEED_TITULO,
    observacionesProfe:
      "Plan de prueba cargado por seed. Ajustalo desde el panel de alimentación cuando quieras.",
    macrosObjetivo,
    dias,
    generadoPorIa: false,
  });

  plan.notificacionEnviada = true;
  await plan.save();

  const published = await planNutricionalService.publish(String(plan._id));

  console.log(
    `Listo: plan "${published.titulo}" publicado para ${alumna.nombre} (${ALUMNA_EMAIL}).`,
  );
  console.log(`Plan ID: ${published._id}`);
  console.log(
    `Macros objetivo: ${macrosObjetivo.kcal} kcal · P ${macrosObjetivo.proteinaG}g · C ${macrosObjetivo.carbohidratosG}g · G ${macrosObjetivo.grasasG}g`,
  );

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((error) => {
  console.error("Error al sembrar plan nutricional:", error);
  process.exit(1);
});
