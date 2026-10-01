import type { CategoriaCompras } from "@/features/profe/lib/nutricion-labels";

export type CategoriasComprasPdf = {
  categoria: CategoriaCompras;
  items: { nombre: string; cantidades: string[] }[];
}[];

const MARGIN = 16;
const PAGE_HEIGHT = 297;
const BOTTOM = PAGE_HEIGHT - MARGIN;
const LINE = 6;

function ensureSpace(doc: import("jspdf").jsPDF, y: number, needed: number): number {
  if (y + needed <= BOTTOM) return y;
  doc.addPage();
  return MARGIN;
}

export async function descargarListaComprasPdf({
  titulo,
  subtitulo,
  categorias,
  nombreArchivo,
}: {
  titulo: string;
  subtitulo?: string;
  categorias: CategoriasComprasPdf;
  nombreArchivo: string;
}) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(titulo, MARGIN, y);
  y += LINE + 2;

  if (subtitulo) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(subtitulo, MARGIN, y);
    y += LINE;
  }

  const fecha = new Date().toLocaleDateString("es-UY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado el ${fecha}`, MARGIN, y);
  doc.setTextColor(0);
  y += LINE + 4;

  for (const { categoria, items } of categorias) {
    if (items.length === 0) continue;

    y = ensureSpace(doc, y, LINE + 2);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(categoria, MARGIN, y);
    y += LINE + 1;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    for (const item of items) {
      const cantidades = item.cantidades.join(" · ");
      const line = `${item.nombre} — ${cantidades}`;
      const wrapped = doc.splitTextToSize(line, 210 - MARGIN * 2) as string[];
      for (const part of wrapped) {
        y = ensureSpace(doc, y, LINE);
        doc.text(part, MARGIN + 2, y);
        y += LINE;
      }
    }
    y += 3;
  }

  doc.save(nombreArchivo);
}

export function nombreArchivoListaCompras(
  scope: "hoy" | "semana",
  numeroSemana?: number,
): string {
  if (scope === "hoy") {
    const d = new Date().toLocaleDateString("en-CA");
    return `compras-hoy-${d}.pdf`;
  }
  if (numeroSemana != null) {
    return `compras-semana-${numeroSemana}.pdf`;
  }
  return "compras-semanales.pdf";
}

export function titulosListaComprasPdf(
  scope: "hoy" | "semana",
  tieneSemanasGuardadas: boolean,
  numeroSemana?: number,
): { titulo: string; subtitulo?: string } {
  if (scope === "hoy") {
    return { titulo: "Compras de hoy" };
  }
  if (tieneSemanasGuardadas && numeroSemana != null) {
    return {
      titulo: "Compras semanales",
      subtitulo: `Semana ${numeroSemana}`,
    };
  }
  return {
    titulo: "Compras semanales",
    subtitulo: "Plan completo",
  };
}
