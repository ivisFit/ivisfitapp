"use client";

import {
  Apple,
  ChefHat,
  Clock3,
  Cookie,
  Croissant,
  MoonStar,
  StickyNote,
  Utensils,
} from "lucide-react";
import type { ComidaPlan } from "@/features/alumna/types/plan-nutricional";

export type ComidaCardEstado = "hecha" | "ahora" | "mas-tarde";

const ESTADO_LABEL: Record<ComidaCardEstado, string> = {
  hecha: "Hecha",
  ahora: "Ahora",
  "mas-tarde": "Más tarde",
};

function getMealIcon(nombre: string) {
  const value = nombre.toLowerCase();
  if (value.includes("desayuno")) return Croissant;
  if (value.includes("almuerzo")) return Utensils;
  if (value.includes("merienda")) return Apple;
  if (value.includes("cena")) return MoonStar;
  if (value.includes("snack") || value.includes("colación") || value.includes("colacion")) {
    return Cookie;
  }
  return Utensils;
}

export function ComidaCard({
  comida,
  estado,
}: {
  comida: ComidaPlan;
  estado?: ComidaCardEstado;
}) {
  const Icon = getMealIcon(comida.nombre);

  return (
    <article
      className={`alimentacion-comida${estado ? ` alimentacion-comida--${estado}` : ""}`}
    >
      <header className="alimentacion-comida__header">
        <span className="alimentacion-comida__icon" aria-hidden>
          <Icon size={18} />
        </span>
        <div className="alimentacion-comida__title">
          {estado ? (
            <span className="alimentacion-comida__estado">{ESTADO_LABEL[estado]}</span>
          ) : null}
          <h3>{comida.nombre}</h3>
          {comida.horario ? (
            <span className="alimentacion-comida__horario">
              <Clock3 size={13} aria-hidden />
              {comida.horario}
            </span>
          ) : null}
        </div>
        {comida.macrosComida ? (
          <span className="alimentacion-comida__kcal">
            {comida.macrosComida.kcal} kcal
          </span>
        ) : null}
      </header>

      <ul className="alimentacion-comida__ingredientes">
        {comida.ingredientes.map((ingrediente, ingredienteIndex) => (
          <li key={`${ingrediente.nombre}-${ingredienteIndex}`}>
            <span className="alimentacion-comida__ingrediente-nombre">
              {ingrediente.nombre}
            </span>
            <span className="alimentacion-comida__ingrediente-cantidad">
              {ingrediente.cantidad}
              {ingrediente.unidad}
              {ingrediente.kcal !== undefined ? (
                <small>{ingrediente.kcal} kcal</small>
              ) : null}
            </span>
          </li>
        ))}
      </ul>

      {comida.preparacion ? (
        <p className="alimentacion-comida__callout alimentacion-comida__callout--prep">
          <ChefHat size={15} aria-hidden />
          <span>{comida.preparacion}</span>
        </p>
      ) : null}
      {comida.notas ? (
        <p className="alimentacion-comida__callout alimentacion-comida__callout--nota">
          <StickyNote size={15} aria-hidden />
          <span>{comida.notas}</span>
        </p>
      ) : null}
    </article>
  );
}
