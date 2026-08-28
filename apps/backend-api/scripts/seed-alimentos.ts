import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Alimento, connectDB, type CreateAlimentoInput } from "@ivisfit/database";

const envPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.env",
);

dotenv.config({ path: envPath });

const g100 = (kcal: number, p: number, c: number, g: number) => ({
  porcionReferencia: { cantidad: 100, unidad: "g" as const },
  macrosPorPorcion: { kcal, proteinaG: p, carbohidratosG: c, grasasG: g },
  activo: true as const,
});

const ALIMENTOS_BASE: CreateAlimentoInput[] = [
  // —— Proteínas ——
  { nombre: "Pechuga de pollo", categoria: "proteina", ...g100(165, 31, 0, 3.6), notas: "Cocida sin piel" },
  { nombre: "Muslo de pollo sin piel", categoria: "proteina", ...g100(179, 26, 0, 8.2), notas: "Cocido" },
  { nombre: "Pollo entero cocido", categoria: "proteina", ...g100(215, 27, 0, 11) },
  { nombre: "Carne vacuna magra", categoria: "proteina", ...g100(187, 26, 0, 8.7) },
  { nombre: "Carne picada magra", categoria: "proteina", ...g100(176, 25, 0, 8) },
  { nombre: "Nalga vacuna", categoria: "proteina", ...g100(170, 28, 0, 5.5) },
  { nombre: "Bife de chorizo magro", categoria: "proteina", ...g100(210, 26, 0, 11) },
  { nombre: "Cerdo magro (lomo)", categoria: "proteina", ...g100(165, 28, 0, 5.5) },
  { nombre: "Jamón cocido", categoria: "proteina", ...g100(110, 18, 1.5, 3.5) },
  { nombre: "Pavo (pechuga)", categoria: "proteina", ...g100(135, 30, 0, 1) },
  { nombre: "Merluza", categoria: "proteina", ...g100(90, 18.6, 0, 1.3) },
  { nombre: "Atún al natural", categoria: "proteina", ...g100(116, 26, 0, 1), notas: "Escurrido" },
  { nombre: "Salmón", categoria: "proteina", ...g100(208, 20, 0, 13) },
  { nombre: "Caballa", categoria: "proteina", ...g100(205, 19, 0, 14) },
  { nombre: "Sardinas en agua", categoria: "proteina", ...g100(140, 21, 0, 6) },
  { nombre: "Camarones", categoria: "proteina", ...g100(99, 24, 0.2, 0.3) },
  { nombre: "Calamar", categoria: "proteina", ...g100(92, 16, 3, 1.4) },
  { nombre: "Huevo entero", categoria: "proteina", porcionReferencia: { cantidad: 1, unidad: "unidad" }, macrosPorPorcion: { kcal: 78, proteinaG: 6.3, carbohidratosG: 0.6, grasasG: 5.3 }, activo: true },
  { nombre: "Clara de huevo", categoria: "proteina", ...g100(52, 11, 0.7, 0.2) },
  { nombre: "Yema de huevo", categoria: "proteina", porcionReferencia: { cantidad: 1, unidad: "unidad" }, macrosPorPorcion: { kcal: 55, proteinaG: 2.7, carbohidratosG: 0.6, grasasG: 4.5 }, activo: true },
  { nombre: "Tofu firme", categoria: "proteina", ...g100(76, 8, 1.9, 4.8) },
  { nombre: "Tempeh", categoria: "proteina", ...g100(193, 19, 9, 11) },
  { nombre: "Seitán", categoria: "proteina", ...g100(120, 25, 4, 1.5) },
  { nombre: "Ricotta light", categoria: "proteina", ...g100(110, 11, 4, 5) },
  { nombre: "Proteína en polvo (whey)", categoria: "proteina", porcionReferencia: { cantidad: 30, unidad: "g" }, macrosPorPorcion: { kcal: 120, proteinaG: 24, carbohidratosG: 3, grasasG: 1.5 }, activo: true },
  { nombre: "Proteína vegetal en polvo", categoria: "proteina", porcionReferencia: { cantidad: 30, unidad: "g" }, macrosPorPorcion: { kcal: 110, proteinaG: 22, carbohidratosG: 3, grasasG: 1.5 }, activo: true },

  // —— Carbohidratos ——
  { nombre: "Arroz blanco cocido", categoria: "carbohidrato", ...g100(130, 2.7, 28, 0.3) },
  { nombre: "Arroz integral cocido", categoria: "carbohidrato", ...g100(123, 2.7, 26, 1) },
  { nombre: "Arroz yamaní cocido", categoria: "carbohidrato", ...g100(120, 2.5, 25, 1) },
  { nombre: "Avena arrollada", categoria: "carbohidrato", porcionReferencia: { cantidad: 40, unidad: "g" }, macrosPorPorcion: { kcal: 150, proteinaG: 5.3, carbohidratosG: 27, grasasG: 2.7 }, notas: "Seca, sin cocinar", activo: true },
  { nombre: "Avena instantánea", categoria: "carbohidrato", porcionReferencia: { cantidad: 40, unidad: "g" }, macrosPorPorcion: { kcal: 148, proteinaG: 5, carbohidratosG: 26, grasasG: 2.5 }, activo: true },
  { nombre: "Pan integral", categoria: "carbohidrato", porcionReferencia: { cantidad: 30, unidad: "g" }, macrosPorPorcion: { kcal: 75, proteinaG: 3.6, carbohidratosG: 12.6, grasasG: 1.2 }, notas: "1 rebanada aprox.", activo: true },
  { nombre: "Pan francés", categoria: "carbohidrato", porcionReferencia: { cantidad: 50, unidad: "g" }, macrosPorPorcion: { kcal: 135, proteinaG: 4.5, carbohidratosG: 27, grasasG: 1 }, activo: true },
  { nombre: "Pan lactal blanco", categoria: "carbohidrato", porcionReferencia: { cantidad: 25, unidad: "g" }, macrosPorPorcion: { kcal: 66, proteinaG: 2.2, carbohidratosG: 12, grasasG: 0.8 }, activo: true },
  { nombre: "Pan lactal integral", categoria: "carbohidrato", porcionReferencia: { cantidad: 25, unidad: "g" }, macrosPorPorcion: { kcal: 62, proteinaG: 2.5, carbohidratosG: 11, grasasG: 0.9 }, activo: true },
  { nombre: "Wrap de trigo", categoria: "carbohidrato", porcionReferencia: { cantidad: 1, unidad: "unidad" }, macrosPorPorcion: { kcal: 150, proteinaG: 4.5, carbohidratosG: 26, grasasG: 3 }, activo: true },
  { nombre: "Tortilla de maíz", categoria: "carbohidrato", porcionReferencia: { cantidad: 1, unidad: "unidad" }, macrosPorPorcion: { kcal: 52, proteinaG: 1.4, carbohidratosG: 11, grasasG: 0.7 }, activo: true },
  { nombre: "Papa cocida", categoria: "carbohidrato", ...g100(87, 1.9, 20, 0.1) },
  { nombre: "Papa al horno", categoria: "carbohidrato", ...g100(93, 2, 21, 0.1) },
  { nombre: "Batata cocida", categoria: "carbohidrato", ...g100(86, 1.6, 20, 0.1) },
  { nombre: "Fideos cocidos", categoria: "carbohidrato", ...g100(158, 5.8, 31, 0.9) },
  { nombre: "Fideos integrales cocidos", categoria: "carbohidrato", ...g100(145, 6, 28, 1.2) },
  { nombre: "Ñoquis cocidos", categoria: "carbohidrato", ...g100(133, 3.5, 28, 0.5) },
  { nombre: "Quinoa cocida", categoria: "carbohidrato", ...g100(120, 4.4, 21, 1.9) },
  { nombre: "Cuscús cocido", categoria: "carbohidrato", ...g100(112, 3.8, 23, 0.2) },
  { nombre: "Polenta cocida", categoria: "carbohidrato", ...g100(85, 1.8, 18, 0.3) },
  { nombre: "Maíz en grano", categoria: "carbohidrato", ...g100(96, 3.4, 21, 1.5) },
  { nombre: "Granola", categoria: "carbohidrato", porcionReferencia: { cantidad: 40, unidad: "g" }, macrosPorPorcion: { kcal: 180, proteinaG: 4, carbohidratosG: 26, grasasG: 7 }, activo: true },
  { nombre: "Granola light", categoria: "carbohidrato", porcionReferencia: { cantidad: 40, unidad: "g" }, macrosPorPorcion: { kcal: 140, proteinaG: 4, carbohidratosG: 24, grasasG: 3.5 }, activo: true },
  { nombre: "Galletas de arroz", categoria: "carbohidrato", porcionReferencia: { cantidad: 1, unidad: "unidad" }, macrosPorPorcion: { kcal: 35, proteinaG: 0.7, carbohidratosG: 7.3, grasasG: 0.3 }, activo: true },
  { nombre: "Tapioca (fécula)", categoria: "carbohidrato", porcionReferencia: { cantidad: 30, unidad: "g" }, macrosPorPorcion: { kcal: 108, proteinaG: 0, carbohidratosG: 27, grasasG: 0 }, activo: true },
  { nombre: "Harina de avena", categoria: "carbohidrato", porcionReferencia: { cantidad: 40, unidad: "g" }, macrosPorPorcion: { kcal: 150, proteinaG: 5.5, carbohidratosG: 26, grasasG: 2.8 }, activo: true },

  // —— Legumbres ——
  { nombre: "Lentejas cocidas", categoria: "legumbre", ...g100(116, 9, 20, 0.4) },
  { nombre: "Garbanzos cocidos", categoria: "legumbre", ...g100(164, 8.9, 27, 2.6) },
  { nombre: "Porotos negros cocidos", categoria: "legumbre", ...g100(132, 8.9, 24, 0.5) },
  { nombre: "Porotos colorados cocidos", categoria: "legumbre", ...g100(127, 8.7, 23, 0.5) },
  { nombre: "Porotos blancos cocidos", categoria: "legumbre", ...g100(139, 9.7, 25, 0.5) },
  { nombre: "Arvejas cocidas", categoria: "legumbre", ...g100(84, 5.4, 14, 0.4) },
  { nombre: "Soja texturizada hidratada", categoria: "legumbre", ...g100(120, 16, 8, 1.5) },
  { nombre: "Hummus", categoria: "legumbre", porcionReferencia: { cantidad: 50, unidad: "g" }, macrosPorPorcion: { kcal: 83, proteinaG: 4, carbohidratosG: 7, grasasG: 4.8 }, activo: true },
  { nombre: "Edamame", categoria: "legumbre", ...g100(122, 11, 10, 5) },

  // —— Grasas ——
  { nombre: "Palta", categoria: "grasa", ...g100(160, 2, 8.5, 14.7) },
  { nombre: "Aceite de oliva", categoria: "grasa", porcionReferencia: { cantidad: 10, unidad: "ml" }, macrosPorPorcion: { kcal: 88, proteinaG: 0, carbohidratosG: 0, grasasG: 10 }, activo: true },
  { nombre: "Aceite de girasol", categoria: "grasa", porcionReferencia: { cantidad: 10, unidad: "ml" }, macrosPorPorcion: { kcal: 88, proteinaG: 0, carbohidratosG: 0, grasasG: 10 }, activo: true },
  { nombre: "Aceite de coco", categoria: "grasa", porcionReferencia: { cantidad: 10, unidad: "ml" }, macrosPorPorcion: { kcal: 86, proteinaG: 0, carbohidratosG: 0, grasasG: 10 }, activo: true },
  { nombre: "Aceitunas verdes", categoria: "grasa", porcionReferencia: { cantidad: 30, unidad: "g" }, macrosPorPorcion: { kcal: 45, proteinaG: 0.3, carbohidratosG: 1, grasasG: 4.5 }, activo: true },
  { nombre: "Aceitunas negras", categoria: "grasa", porcionReferencia: { cantidad: 30, unidad: "g" }, macrosPorPorcion: { kcal: 50, proteinaG: 0.3, carbohidratosG: 1.5, grasasG: 5 }, activo: true },
  { nombre: "Almendras", categoria: "grasa", porcionReferencia: { cantidad: 30, unidad: "g" }, macrosPorPorcion: { kcal: 174, proteinaG: 6.4, carbohidratosG: 6.1, grasasG: 15 }, activo: true },
  { nombre: "Nueces", categoria: "grasa", porcionReferencia: { cantidad: 30, unidad: "g" }, macrosPorPorcion: { kcal: 196, proteinaG: 4.6, carbohidratosG: 4.1, grasasG: 19.6 }, activo: true },
  { nombre: "Castañas de cajú", categoria: "grasa", porcionReferencia: { cantidad: 30, unidad: "g" }, macrosPorPorcion: { kcal: 166, proteinaG: 5.5, carbohidratosG: 9, grasasG: 13 }, activo: true },
  { nombre: "Pistachos", categoria: "grasa", porcionReferencia: { cantidad: 30, unidad: "g" }, macrosPorPorcion: { kcal: 168, proteinaG: 6, carbohidratosG: 8.5, grasasG: 13.5 }, activo: true },
  { nombre: "Maní tostado", categoria: "grasa", porcionReferencia: { cantidad: 30, unidad: "g" }, macrosPorPorcion: { kcal: 170, proteinaG: 7.5, carbohidratosG: 5, grasasG: 14 }, activo: true },
  { nombre: "Manteca de maní", categoria: "grasa", porcionReferencia: { cantidad: 15, unidad: "g" }, macrosPorPorcion: { kcal: 94, proteinaG: 3.6, carbohidratosG: 3.2, grasasG: 8.1 }, activo: true },
  { nombre: "Manteca de almendras", categoria: "grasa", porcionReferencia: { cantidad: 15, unidad: "g" }, macrosPorPorcion: { kcal: 98, proteinaG: 3.4, carbohidratosG: 3, grasasG: 8.8 }, activo: true },
  { nombre: "Semillas de chía", categoria: "grasa", porcionReferencia: { cantidad: 15, unidad: "g" }, macrosPorPorcion: { kcal: 73, proteinaG: 2.5, carbohidratosG: 6.3, grasasG: 4.6 }, activo: true },
  { nombre: "Semillas de lino", categoria: "grasa", porcionReferencia: { cantidad: 15, unidad: "g" }, macrosPorPorcion: { kcal: 80, proteinaG: 2.7, carbohidratosG: 4.3, grasasG: 6.3 }, activo: true },
  { nombre: "Semillas de girasol", categoria: "grasa", porcionReferencia: { cantidad: 20, unidad: "g" }, macrosPorPorcion: { kcal: 117, proteinaG: 4, carbohidratosG: 4, grasasG: 10 }, activo: true },
  { nombre: "Semillas de zapallo", categoria: "grasa", porcionReferencia: { cantidad: 20, unidad: "g" }, macrosPorPorcion: { kcal: 112, proteinaG: 6, carbohidratosG: 3, grasasG: 9 }, activo: true },
  { nombre: "Coco rallado sin azúcar", categoria: "grasa", porcionReferencia: { cantidad: 15, unidad: "g" }, macrosPorPorcion: { kcal: 100, proteinaG: 1, carbohidratosG: 3.5, grasasG: 9.5 }, activo: true },

  // —— Verduras ——
  { nombre: "Brócoli cocido", categoria: "verdura", ...g100(35, 2.4, 7, 0.4) },
  { nombre: "Coliflor cocida", categoria: "verdura", ...g100(25, 2, 5, 0.3) },
  { nombre: "Espinaca cruda", categoria: "verdura", ...g100(23, 2.9, 3.6, 0.4) },
  { nombre: "Espinaca cocida", categoria: "verdura", ...g100(23, 3, 3.8, 0.3) },
  { nombre: "Acelga cocida", categoria: "verdura", ...g100(20, 1.9, 4, 0.1) },
  { nombre: "Zanahoria", categoria: "verdura", ...g100(41, 0.9, 9.6, 0.2) },
  { nombre: "Lechuga", categoria: "verdura", ...g100(15, 1.4, 2.9, 0.2) },
  { nombre: "Rúcula", categoria: "verdura", ...g100(25, 2.6, 3.7, 0.7) },
  { nombre: "Tomate", categoria: "verdura", ...g100(18, 0.9, 3.9, 0.2) },
  { nombre: "Tomate cherry", categoria: "verdura", ...g100(18, 0.9, 3.9, 0.2) },
  { nombre: "Pepino", categoria: "verdura", ...g100(15, 0.7, 3.6, 0.1) },
  { nombre: "Cebolla", categoria: "verdura", ...g100(40, 1.1, 9.3, 0.1) },
  { nombre: "Cebolla de verdeo", categoria: "verdura", ...g100(32, 1.8, 7, 0.2) },
  { nombre: "Morrón rojo", categoria: "verdura", ...g100(31, 1, 6, 0.3) },
  { nombre: "Morrón verde", categoria: "verdura", ...g100(20, 0.9, 4.6, 0.2) },
  { nombre: "Berenjena", categoria: "verdura", ...g100(25, 1, 6, 0.2) },
  { nombre: "Calabacín", categoria: "verdura", ...g100(17, 1.2, 3.1, 0.3) },
  { nombre: "Zapallo", categoria: "verdura", ...g100(26, 1, 6.5, 0.1) },
  { nombre: "Zapallito", categoria: "verdura", ...g100(17, 1.2, 3.4, 0.2) },
  { nombre: "Repollo", categoria: "verdura", ...g100(25, 1.3, 5.8, 0.1) },
  { nombre: "Chauchas cocidas", categoria: "verdura", ...g100(35, 1.9, 7.9, 0.3) },
  { nombre: "Apio", categoria: "verdura", ...g100(16, 0.7, 3, 0.2) },
  { nombre: "Remolacha cocida", categoria: "verdura", ...g100(44, 1.7, 10, 0.2) },
  { nombre: "Champiñones", categoria: "verdura", ...g100(22, 3.1, 3.3, 0.3) },
  { nombre: "Espárragos", categoria: "verdura", ...g100(20, 2.2, 3.9, 0.1) },
  { nombre: "Radicheta", categoria: "verdura", ...g100(17, 1.2, 3.4, 0.2) },
  { nombre: "Boniato (batata)", categoria: "verdura", ...g100(86, 1.6, 20, 0.1), notas: "Cocido; también usable como carbo" },

  // —— Frutas ——
  { nombre: "Banana", categoria: "fruta", porcionReferencia: { cantidad: 1, unidad: "unidad" }, macrosPorPorcion: { kcal: 105, proteinaG: 1.3, carbohidratosG: 27, grasasG: 0.4 }, activo: true },
  { nombre: "Manzana", categoria: "fruta", porcionReferencia: { cantidad: 1, unidad: "unidad" }, macrosPorPorcion: { kcal: 95, proteinaG: 0.5, carbohidratosG: 25, grasasG: 0.3 }, activo: true },
  { nombre: "Pera", categoria: "fruta", porcionReferencia: { cantidad: 1, unidad: "unidad" }, macrosPorPorcion: { kcal: 100, proteinaG: 0.6, carbohidratosG: 27, grasasG: 0.2 }, activo: true },
  { nombre: "Naranja", categoria: "fruta", porcionReferencia: { cantidad: 1, unidad: "unidad" }, macrosPorPorcion: { kcal: 62, proteinaG: 1.2, carbohidratosG: 15.4, grasasG: 0.2 }, activo: true },
  { nombre: "Mandarina", categoria: "fruta", porcionReferencia: { cantidad: 1, unidad: "unidad" }, macrosPorPorcion: { kcal: 47, proteinaG: 0.7, carbohidratosG: 12, grasasG: 0.3 }, activo: true },
  { nombre: "Pomelo", categoria: "fruta", porcionReferencia: { cantidad: 1, unidad: "unidad" }, macrosPorPorcion: { kcal: 52, proteinaG: 1, carbohidratosG: 13, grasasG: 0.2 }, activo: true },
  { nombre: "Frutilla", categoria: "fruta", ...g100(32, 0.7, 7.7, 0.3) },
  { nombre: "Arándanos", categoria: "fruta", ...g100(57, 0.7, 14.5, 0.3) },
  { nombre: "Frambuesa", categoria: "fruta", ...g100(52, 1.2, 12, 0.7) },
  { nombre: "Durazno", categoria: "fruta", porcionReferencia: { cantidad: 1, unidad: "unidad" }, macrosPorPorcion: { kcal: 60, proteinaG: 1, carbohidratosG: 15, grasasG: 0.3 }, activo: true },
  { nombre: "Kiwi", categoria: "fruta", porcionReferencia: { cantidad: 1, unidad: "unidad" }, macrosPorPorcion: { kcal: 42, proteinaG: 0.8, carbohidratosG: 10, grasasG: 0.4 }, activo: true },
  { nombre: "Uva", categoria: "fruta", ...g100(69, 0.7, 18, 0.2) },
  { nombre: "Sandía", categoria: "fruta", ...g100(30, 0.6, 7.6, 0.2) },
  { nombre: "Melón", categoria: "fruta", ...g100(34, 0.8, 8, 0.2) },
  { nombre: "Ananá", categoria: "fruta", ...g100(50, 0.5, 13, 0.1) },
  { nombre: "Mango", categoria: "fruta", ...g100(60, 0.8, 15, 0.4) },
  { nombre: "Ciruela", categoria: "fruta", porcionReferencia: { cantidad: 1, unidad: "unidad" }, macrosPorPorcion: { kcal: 30, proteinaG: 0.5, carbohidratosG: 7.5, grasasG: 0.2 }, activo: true },
  { nombre: "Limón (jugo)", categoria: "fruta", porcionReferencia: { cantidad: 30, unidad: "ml" }, macrosPorPorcion: { kcal: 7, proteinaG: 0.1, carbohidratosG: 2.2, grasasG: 0 }, activo: true },

  // —— Lácteos ——
  { nombre: "Yogur natural descremado", categoria: "lacteo", ...g100(56, 5.7, 7.7, 0.2) },
  { nombre: "Yogur natural entero", categoria: "lacteo", ...g100(61, 3.5, 4.7, 3.3) },
  { nombre: "Yogur griego", categoria: "lacteo", ...g100(97, 9, 3.6, 5) },
  { nombre: "Yogur griego light", categoria: "lacteo", ...g100(73, 10, 4, 1.5) },
  { nombre: "Kéfir", categoria: "lacteo", ...g100(64, 3.3, 4.5, 3.5) },
  { nombre: "Leche descremada", categoria: "lacteo", porcionReferencia: { cantidad: 200, unidad: "ml" }, macrosPorPorcion: { kcal: 70, proteinaG: 6.8, carbohidratosG: 9.6, grasasG: 0.4 }, activo: true },
  { nombre: "Leche semidescremada", categoria: "lacteo", porcionReferencia: { cantidad: 200, unidad: "ml" }, macrosPorPorcion: { kcal: 94, proteinaG: 6.8, carbohidratosG: 9.6, grasasG: 3 }, activo: true },
  { nombre: "Leche entera", categoria: "lacteo", porcionReferencia: { cantidad: 200, unidad: "ml" }, macrosPorPorcion: { kcal: 122, proteinaG: 6.4, carbohidratosG: 9.4, grasasG: 6.4 }, activo: true },
  { nombre: "Leche de almendras sin azúcar", categoria: "lacteo", porcionReferencia: { cantidad: 200, unidad: "ml" }, macrosPorPorcion: { kcal: 30, proteinaG: 1, carbohidratosG: 1, grasasG: 2.5 }, activo: true },
  { nombre: "Leche de soja sin azúcar", categoria: "lacteo", porcionReferencia: { cantidad: 200, unidad: "ml" }, macrosPorPorcion: { kcal: 70, proteinaG: 6, carbohidratosG: 3, grasasG: 3.5 }, activo: true },
  { nombre: "Queso fresco light", categoria: "lacteo", porcionReferencia: { cantidad: 30, unidad: "g" }, macrosPorPorcion: { kcal: 60, proteinaG: 6.6, carbohidratosG: 1, grasasG: 3.3 }, activo: true },
  { nombre: "Queso cottage", categoria: "lacteo", ...g100(98, 11, 3.4, 4.3) },
  { nombre: "Mozzarella light", categoria: "lacteo", porcionReferencia: { cantidad: 30, unidad: "g" }, macrosPorPorcion: { kcal: 60, proteinaG: 7.5, carbohidratosG: 1, grasasG: 3 }, activo: true },
  { nombre: "Queso rallado", categoria: "lacteo", porcionReferencia: { cantidad: 20, unidad: "g" }, macrosPorPorcion: { kcal: 80, proteinaG: 6, carbohidratosG: 0.5, grasasG: 6 }, activo: true },
  { nombre: "Queso port salut light", categoria: "lacteo", porcionReferencia: { cantidad: 30, unidad: "g" }, macrosPorPorcion: { kcal: 70, proteinaG: 7, carbohidratosG: 1, grasasG: 4 }, activo: true },
  { nombre: "Crema de leche light", categoria: "lacteo", porcionReferencia: { cantidad: 30, unidad: "ml" }, macrosPorPorcion: { kcal: 45, proteinaG: 0.8, carbohidratosG: 1.5, grasasG: 4 }, activo: true },

  // —— Condimentos ——
  { nombre: "Sal", categoria: "condimento", porcionReferencia: { cantidad: 1, unidad: "g" }, macrosPorPorcion: { kcal: 0, proteinaG: 0, carbohidratosG: 0, grasasG: 0 }, activo: true },
  { nombre: "Pimienta negra", categoria: "condimento", porcionReferencia: { cantidad: 1, unidad: "g" }, macrosPorPorcion: { kcal: 2.5, proteinaG: 0.1, carbohidratosG: 0.6, grasasG: 0 }, activo: true },
  { nombre: "Ajo", categoria: "condimento", porcionReferencia: { cantidad: 5, unidad: "g" }, macrosPorPorcion: { kcal: 7, proteinaG: 0.3, carbohidratosG: 1.7, grasasG: 0 }, activo: true },
  { nombre: "Orégano seco", categoria: "condimento", porcionReferencia: { cantidad: 1, unidad: "g" }, macrosPorPorcion: { kcal: 2.7, proteinaG: 0.1, carbohidratosG: 0.7, grasasG: 0 }, activo: true },
  { nombre: "Perejil", categoria: "condimento", porcionReferencia: { cantidad: 5, unidad: "g" }, macrosPorPorcion: { kcal: 2, proteinaG: 0.1, carbohidratosG: 0.3, grasasG: 0 }, activo: true },
  { nombre: "Cilantro", categoria: "condimento", porcionReferencia: { cantidad: 5, unidad: "g" }, macrosPorPorcion: { kcal: 1, proteinaG: 0.1, carbohidratosG: 0.2, grasasG: 0 }, activo: true },
  { nombre: "Canela", categoria: "condimento", porcionReferencia: { cantidad: 1, unidad: "g" }, macrosPorPorcion: { kcal: 2.6, proteinaG: 0, carbohidratosG: 0.8, grasasG: 0 }, activo: true },
  { nombre: "Cúrcuma", categoria: "condimento", porcionReferencia: { cantidad: 1, unidad: "g" }, macrosPorPorcion: { kcal: 3.5, proteinaG: 0.1, carbohidratosG: 0.7, grasasG: 0.1 }, activo: true },
  { nombre: "Vinagre", categoria: "condimento", porcionReferencia: { cantidad: 10, unidad: "ml" }, macrosPorPorcion: { kcal: 2, proteinaG: 0, carbohidratosG: 0.1, grasasG: 0 }, activo: true },
  { nombre: "Vinagre de manzana", categoria: "condimento", porcionReferencia: { cantidad: 10, unidad: "ml" }, macrosPorPorcion: { kcal: 2, proteinaG: 0, carbohidratosG: 0.1, grasasG: 0 }, activo: true },
  { nombre: "Mostaza", categoria: "condimento", porcionReferencia: { cantidad: 10, unidad: "g" }, macrosPorPorcion: { kcal: 8, proteinaG: 0.5, carbohidratosG: 0.6, grasasG: 0.4 }, activo: true },
  { nombre: "Ketchup light", categoria: "condimento", porcionReferencia: { cantidad: 15, unidad: "g" }, macrosPorPorcion: { kcal: 12, proteinaG: 0.2, carbohidratosG: 2.8, grasasG: 0 }, activo: true },
  { nombre: "Salsa de soja", categoria: "condimento", porcionReferencia: { cantidad: 10, unidad: "ml" }, macrosPorPorcion: { kcal: 6, proteinaG: 1, carbohidratosG: 0.6, grasasG: 0 }, activo: true },
  { nombre: "Miel", categoria: "condimento", porcionReferencia: { cantidad: 10, unidad: "g" }, macrosPorPorcion: { kcal: 30, proteinaG: 0, carbohidratosG: 8.2, grasasG: 0 }, activo: true },
  { nombre: "Stevia (endulzante)", categoria: "condimento", porcionReferencia: { cantidad: 1, unidad: "g" }, macrosPorPorcion: { kcal: 0, proteinaG: 0, carbohidratosG: 0, grasasG: 0 }, activo: true },
  { nombre: "Mayonesa light", categoria: "condimento", porcionReferencia: { cantidad: 15, unidad: "g" }, macrosPorPorcion: { kcal: 40, proteinaG: 0.2, carbohidratosG: 1.5, grasasG: 3.5 }, activo: true },

  // —— Bebidas ——
  { nombre: "Agua", categoria: "bebida", porcionReferencia: { cantidad: 250, unidad: "ml" }, macrosPorPorcion: { kcal: 0, proteinaG: 0, carbohidratosG: 0, grasasG: 0 }, activo: true },
  { nombre: "Café negro", categoria: "bebida", porcionReferencia: { cantidad: 200, unidad: "ml" }, macrosPorPorcion: { kcal: 2, proteinaG: 0.3, carbohidratosG: 0, grasasG: 0 }, activo: true },
  { nombre: "Infusión de hierbas", categoria: "bebida", porcionReferencia: { cantidad: 200, unidad: "ml" }, macrosPorPorcion: { kcal: 0, proteinaG: 0, carbohidratosG: 0, grasasG: 0 }, activo: true },
  { nombre: "Té negro", categoria: "bebida", porcionReferencia: { cantidad: 200, unidad: "ml" }, macrosPorPorcion: { kcal: 2, proteinaG: 0, carbohidratosG: 0.5, grasasG: 0 }, activo: true },
  { nombre: "Té verde", categoria: "bebida", porcionReferencia: { cantidad: 200, unidad: "ml" }, macrosPorPorcion: { kcal: 2, proteinaG: 0, carbohidratosG: 0, grasasG: 0 }, activo: true },
  { nombre: "Mate cocido", categoria: "bebida", porcionReferencia: { cantidad: 200, unidad: "ml" }, macrosPorPorcion: { kcal: 4, proteinaG: 0.2, carbohidratosG: 0.8, grasasG: 0 }, activo: true },
  { nombre: "Gaseosa zero", categoria: "bebida", porcionReferencia: { cantidad: 250, unidad: "ml" }, macrosPorPorcion: { kcal: 1, proteinaG: 0, carbohidratosG: 0, grasasG: 0 }, activo: true },
  { nombre: "Agua saborizada sin azúcar", categoria: "bebida", porcionReferencia: { cantidad: 250, unidad: "ml" }, macrosPorPorcion: { kcal: 2, proteinaG: 0, carbohidratosG: 0.5, grasasG: 0 }, activo: true },
  { nombre: "Jugo de naranja natural", categoria: "bebida", porcionReferencia: { cantidad: 200, unidad: "ml" }, macrosPorPorcion: { kcal: 90, proteinaG: 1.4, carbohidratosG: 21, grasasG: 0.4 }, activo: true },
  { nombre: "Bebida vegetal de avena", categoria: "bebida", porcionReferencia: { cantidad: 200, unidad: "ml" }, macrosPorPorcion: { kcal: 80, proteinaG: 1.5, carbohidratosG: 14, grasasG: 2 }, activo: true },

  // —— Otro ——
  { nombre: "Cacao amargo en polvo", categoria: "otro", porcionReferencia: { cantidad: 10, unidad: "g" }, macrosPorPorcion: { kcal: 23, proteinaG: 2, carbohidratosG: 2.5, grasasG: 1.4 }, activo: true },
  { nombre: "Chocolate 70%", categoria: "otro", porcionReferencia: { cantidad: 20, unidad: "g" }, macrosPorPorcion: { kcal: 110, proteinaG: 1.6, carbohidratosG: 9, grasasG: 8 }, activo: true },
  { nombre: "Barrita de cereal", categoria: "otro", porcionReferencia: { cantidad: 1, unidad: "unidad" }, macrosPorPorcion: { kcal: 95, proteinaG: 2, carbohidratosG: 16, grasasG: 2.5 }, activo: true },
  { nombre: "Gelatina light", categoria: "otro", porcionReferencia: { cantidad: 100, unidad: "g" }, macrosPorPorcion: { kcal: 10, proteinaG: 1.5, carbohidratosG: 0.5, grasasG: 0 }, activo: true },
  { nombre: "Gelatina común", categoria: "otro", porcionReferencia: { cantidad: 100, unidad: "g" }, macrosPorPorcion: { kcal: 60, proteinaG: 1.5, carbohidratosG: 14, grasasG: 0 }, activo: true },
  { nombre: "Caldo en polvo (cubito)", categoria: "otro", porcionReferencia: { cantidad: 5, unidad: "g" }, macrosPorPorcion: { kcal: 8, proteinaG: 0.5, carbohidratosG: 1, grasasG: 0.2 }, activo: true },
  { nombre: "Harina común", categoria: "otro", porcionReferencia: { cantidad: 30, unidad: "g" }, macrosPorPorcion: { kcal: 109, proteinaG: 3, carbohidratosG: 23, grasasG: 0.3 }, activo: true },
  { nombre: "Harina integral", categoria: "otro", porcionReferencia: { cantidad: 30, unidad: "g" }, macrosPorPorcion: { kcal: 102, proteinaG: 4, carbohidratosG: 20, grasasG: 0.7 }, activo: true },
  { nombre: "Polvo para hornear", categoria: "otro", porcionReferencia: { cantidad: 5, unidad: "g" }, macrosPorPorcion: { kcal: 5, proteinaG: 0, carbohidratosG: 1.2, grasasG: 0 }, activo: true },
];

async function main() {
  await connectDB();

  let inserted = 0;
  let skipped = 0;

  for (const alimento of ALIMENTOS_BASE) {
    const existing = await Alimento.findOne({ nombre: alimento.nombre });
    if (existing) {
      skipped += 1;
      continue;
    }

    await Alimento.create(alimento);
    inserted += 1;
    console.log(`Insertado: ${alimento.nombre}`);
  }

  console.log(
    `Listo: ${inserted} creado(s), ${skipped} ya existían. Catálogo seed: ${ALIMENTOS_BASE.length} alimentos.`,
  );

  process.exit(0);
}

main().catch((error) => {
  console.error("Error al sembrar alimentos:", error);
  process.exit(1);
});
