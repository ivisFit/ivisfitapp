"use client";

import { useState } from "react";
import { Input } from "@/components";
import { useAlimentosBusqueda } from "@/features/profe/hooks/useAlimentos";
import type { Alimento } from "@/features/profe/types/alimento";

type AlimentoAutocompleteProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSelect: (alimento: Alimento) => void;
  disabled?: boolean;
  label?: string;
  name?: string;
};

export function AlimentoAutocomplete({
  value,
  onChangeText,
  onSelect,
  disabled,
  label = "Alimento",
  name,
}: AlimentoAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const { resultados } = useAlimentosBusqueda(open ? value : "");

  return (
    <div className="alimento-autocomplete">
      <Input
        label={label}
        name={name}
        value={value}
        placeholder="Buscar alimento..."
        disabled={disabled}
        onChange={(event) => {
          onChangeText(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setTimeout(() => setOpen(false), 150);
        }}
      />
      {open && resultados.length > 0 ? (
        <ul className="alimento-autocomplete__results">
          {resultados.map((alimento) => (
            <li key={alimento.id}>
              <button
                type="button"
                className="alimento-autocomplete__result"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(alimento);
                  setOpen(false);
                }}
              >
                <span>{alimento.nombre}</span>
                <span>
                  {alimento.macrosPorPorcion.kcal} kcal /{" "}
                  {alimento.porcionReferencia.cantidad}
                  {alimento.porcionReferencia.unidad}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
