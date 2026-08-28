"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components";
import type { BancoEjercicio } from "@/features/profe/hooks/useBancoEjercicios";

type EjercicioAutocompleteProps = {
  ejercicios: BancoEjercicio[];
  value: string;
  selectedId: string;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onSelect: (ejercicio: BancoEjercicio) => void;
  onChangeText?: (value: string) => void;
};

export function EjercicioAutocomplete({
  ejercicios,
  value,
  selectedId,
  placeholder = "Buscar ejercicio...",
  disabled,
  autoFocus,
  onSelect,
  onChangeText,
}: EjercicioAutocompleteProps) {
  const [open, setOpen] = useState(Boolean(autoFocus));
  const [query, setQuery] = useState(value);

  const resultados = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return ejercicios.slice(0, 12);
    }
    return ejercicios
      .filter(
        (ejercicio) =>
          ejercicio.nombre.toLowerCase().includes(normalized) ||
          ejercicio.descripcion.toLowerCase().includes(normalized),
      )
      .slice(0, 12);
  }, [ejercicios, query]);

  const selectedNombre =
    ejercicios.find((ejercicio) => ejercicio.id === selectedId)?.nombre ?? "";

  return (
    <div className="ejercicio-autocomplete">
      <Input
        label=""
        value={open ? query : selectedNombre || query}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        onChange={(event) => {
          const next = event.target.value;
          setQuery(next);
          onChangeText?.(next);
          setOpen(true);
        }}
        onFocus={() => {
          setQuery(selectedNombre || query);
          setOpen(true);
        }}
        onBlur={() => {
          setTimeout(() => setOpen(false), 150);
        }}
      />
      {open && resultados.length > 0 ? (
        <ul className="ejercicio-autocomplete__results" role="listbox">
          {resultados.map((ejercicio) => (
            <li key={ejercicio.id} role="option" aria-selected={ejercicio.id === selectedId}>
              <button
                type="button"
                className="ejercicio-autocomplete__result"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(ejercicio);
                  setQuery(ejercicio.nombre);
                  setOpen(false);
                }}
              >
                <span className="ejercicio-autocomplete__result-name">
                  {ejercicio.nombre}
                </span>
                {ejercicio.descripcion ? (
                  <span className="ejercicio-autocomplete__result-meta">
                    {ejercicio.descripcion}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
