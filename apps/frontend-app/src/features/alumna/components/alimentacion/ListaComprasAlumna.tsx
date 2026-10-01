"use client";

import { useMemo, useState } from "react";
import { Download, ShoppingBasket } from "lucide-react";
import {
  descargarListaComprasPdf,
  nombreArchivoListaCompras,
  titulosListaComprasPdf,
} from "@/features/alumna/lib/descargar-lista-compras-pdf";
import type {
  DiaPlanNutricional,
  ListaComprasSemana,
} from "@/features/alumna/types/plan-nutricional";
import {
  buildListaCompras,
  categorizarListaCompras,
} from "@/features/profe/lib/nutricion-labels";

export function ListaComprasAlumna({
  dias,
  semanas,
  diaHoy,
}: {
  dias: DiaPlanNutricional[];
  semanas?: ListaComprasSemana[];
  diaHoy?: DiaPlanNutricional;
}) {
  const [weekIndex, setWeekIndex] = useState(0);
  const [scope, setScope] = useState<"hoy" | "semana">(diaHoy ? "hoy" : "semana");
  const [descargando, setDescargando] = useState(false);
  const guardadas = semanas ?? [];
  const semana = guardadas[weekIndex] ?? guardadas[0];
  const listaCompras = useMemo(
    () =>
      scope === "hoy" && diaHoy
        ? buildListaCompras([diaHoy])
        : guardadas.length > 0
          ? (semana?.items ?? [])
          : buildListaCompras(dias),
    [dias, guardadas, semana, scope, diaHoy],
  );
  const categorias = useMemo(() => categorizarListaCompras(listaCompras), [listaCompras]);

  const handleDescargarPdf = async () => {
    if (listaCompras.length === 0 || descargando) return;
    setDescargando(true);
    try {
      const numeroSemana = semana?.numeroSemana;
      const { titulo, subtitulo } = titulosListaComprasPdf(
        scope,
        guardadas.length > 0,
        numeroSemana,
      );
      await descargarListaComprasPdf({
        titulo,
        subtitulo,
        categorias,
        nombreArchivo: nombreArchivoListaCompras(scope, numeroSemana),
      });
    } finally {
      setDescargando(false);
    }
  };

  return (
    <section
      className="alimentacion-compras"
      aria-labelledby="alimentacion-compras-title"
    >
      <div className="alimentacion-section-heading alimentacion-section-heading--row">
        <div>
          <h2 id="alimentacion-compras-title">Lista de compras</h2>
          <p>
            {guardadas.length > 0
              ? "Elegí la semana de tu plan."
              : "Todo lo que necesitás para seguir tu plan."}
          </p>
        </div>
        {listaCompras.length > 0 ? (
          <span className="alimentacion-compras__count">
            <ShoppingBasket size={14} aria-hidden />
            {listaCompras.length}{" "}
            {listaCompras.length === 1 ? "ítem" : "ítems"}
          </span>
        ) : null}
      </div>

      {diaHoy ? (
        <div className="alimentacion-compras__weeks" role="tablist" aria-label="Alcance de la lista">
          {(["hoy", "semana"] as const).map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={scope === s}
              className={
                scope === s
                  ? "alimentacion-compras__week is-active"
                  : "alimentacion-compras__week"
              }
              onClick={() => setScope(s)}
            >
              {s === "hoy" ? "Compras de hoy" : "Compras semanales"}
            </button>
          ))}
        </div>
      ) : null}

      {guardadas.length > 0 && scope === "semana" ? (
        <div className="alimentacion-compras__weeks" role="tablist" aria-label="Semanas del plan">
          {guardadas.map((item, index) => (
            <button
              key={item.numeroSemana}
              type="button"
              role="tab"
              aria-selected={index === weekIndex}
              className={
                index === weekIndex
                  ? "alimentacion-compras__week is-active"
                  : "alimentacion-compras__week"
              }
              onClick={() => setWeekIndex(index)}
            >
              Semana {item.numeroSemana}
            </button>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        className="alimentacion-compras__download"
        disabled={listaCompras.length === 0 || descargando}
        onClick={() => void handleDescargarPdf()}
      >
        <Download size={18} aria-hidden />
        {descargando ? "Generando PDF…" : "Descargar PDF"}
      </button>

      {listaCompras.length === 0 ? (
        <p className="alimentacion-compras__empty">
          Sin ingredientes cargados todavía.
        </p>
      ) : (
        <div className="alimentacion-compras__categorias">
          {categorias.map(({ categoria, items }) => (
            <section key={categoria} className="alimentacion-compras__categoria">
              <h3 className="alimentacion-compras__categoria-title">{categoria}</h3>
              <ul className="alimentacion-compras__list">
                {items.map((item) => (
                  <li key={item.nombre}>
                    <strong>{item.nombre}</strong>
                    <span>{item.cantidades.join(" · ")}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
