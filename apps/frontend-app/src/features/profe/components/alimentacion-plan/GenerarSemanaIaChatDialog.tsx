"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { LoaderCircle, Send, ShieldCheck, Sparkles, X } from "lucide-react";
import { Button } from "@/components";
import "@/components/AppDialog.css";
import "./GenerarSemanaIaChatDialog.css";

const INSTRUCCION_MAX = 2000;

const GREETING =
  "Contame qué condiciones tiene que cumplir esta semana. Podés elegir sugerencias o escribirlas con tus palabras. Si no hace falta nada extra, generá directo.";

const SUGERENCIAS = [
  "Sin pescado",
  "Sin lácteos",
  "Meal prep: cocinar una vez para varios días",
  "Recetas de 15 minutos o menos",
  "Priorizar proteína",
  "Opciones económicas",
  "Más volumen de comida",
  "Variar más los desayunos",
];

type GenerarSemanaIaChatDialogProps = {
  open: boolean;
  generating: boolean;
  error?: string | null;
  onCancel: () => void;
  onGenerate: (instruccion: string) => Promise<void>;
};

export function GenerarSemanaIaChatDialog({
  open,
  generating,
  error,
  onCancel,
  onGenerate,
}: GenerarSemanaIaChatDialogProps) {
  const titleId = useId();
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [condiciones, setCondiciones] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const locked = generating || busy;
  const totalChars = condiciones.join("\n").length;

  useEffect(() => {
    if (!open) return;
    setCondiciones([]);
    setDraft("");
    setBusy(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (document.querySelectorAll(".app-dialog-backdrop").length > 1) return;
      event.preventDefault();
      if (!locked) onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, locked, onCancel]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [condiciones, generating, error]);

  function addCondicion(text: string): boolean {
    const clean = text.trim();
    if (!clean) return false;
    if (condiciones.some((c) => c.toLowerCase() === clean.toLowerCase())) return false;
    if (totalChars + clean.length + 1 > INSTRUCCION_MAX) return false;
    setCondiciones((current) => [...current, clean]);
    return true;
  }

  function removeCondicion(index: number) {
    if (locked) return;
    setCondiciones((current) => current.filter((_, i) => i !== index));
  }

  function handleSend(event?: FormEvent) {
    event?.preventDefault();
    if (locked) return;
    if (addCondicion(draft)) setDraft("");
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  async function handleGenerate() {
    if (locked) return;
    const final = [...condiciones];
    const pending = draft.trim();
    if (pending && !final.some((c) => c.toLowerCase() === pending.toLowerCase())) {
      final.push(pending);
    }
    setBusy(true);
    try {
      await onGenerate(final.join("\n").slice(0, INSTRUCCION_MAX));
    } finally {
      setBusy(false);
    }
  }

  if (!open || typeof document === "undefined") return null;

  const cantidad = condiciones.length + (draft.trim() ? 1 : 0);

  return createPortal(
    <div className="app-dialog-backdrop" role="presentation">
      <div
        className="app-dialog generar-semana-ia-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={locked}
      >
        <header className="generar-semana-ia-dialog__header">
          <div className="generar-semana-ia-dialog__icon" aria-hidden>
            <Sparkles size={20} />
          </div>
          <div>
            <p className="generar-semana-ia-dialog__kicker">IA nutricional</p>
            <h2 id={titleId} className="generar-semana-ia-dialog__title">
              Generar semana con IA
            </h2>
          </div>
        </header>

        <p className="generar-semana-ia-dialog__notice">
          <ShieldCheck size={15} aria-hidden />
          Alergias, alimentos evitados y restricciones de la alumna se aplican siempre.
        </p>

        <div
          ref={listRef}
          className="generar-semana-ia-dialog__messages"
          role="log"
          aria-live="polite"
        >
          <div className="generar-semana-ia-dialog__row generar-semana-ia-dialog__row--assistant">
            <span className="generar-semana-ia-dialog__avatar" aria-hidden>
              <Sparkles size={14} />
            </span>
            <div className="generar-semana-ia-dialog__bubble">
              <p>{GREETING}</p>
            </div>
          </div>

          {condiciones.map((condicion, index) => (
            <div
              key={`${index}-${condicion}`}
              className="generar-semana-ia-dialog__row generar-semana-ia-dialog__row--user"
            >
              <div className="generar-semana-ia-dialog__bubble">
                <p>{condicion}</p>
                <button
                  type="button"
                  className="generar-semana-ia-dialog__remove"
                  disabled={locked}
                  aria-label={`Quitar condición: ${condicion}`}
                  onClick={() => removeCondicion(index)}
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          ))}

          {generating ? (
            <div className="generar-semana-ia-dialog__row generar-semana-ia-dialog__row--assistant">
              <span className="generar-semana-ia-dialog__avatar" aria-hidden>
                <Sparkles size={14} />
              </span>
              <div className="generar-semana-ia-dialog__bubble generar-semana-ia-dialog__bubble--status">
                <LoaderCircle size={14} className="ap-spin" aria-hidden />
                <p>Armando la semana. Puede tardar un par de minutos…</p>
              </div>
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="generar-semana-ia-dialog__error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="generar-semana-ia-dialog__suggestions" aria-label="Sugerencias">
          {SUGERENCIAS.map((sugerencia) => {
            const usada = condiciones.some(
              (c) => c.toLowerCase() === sugerencia.toLowerCase(),
            );
            return (
              <button
                key={sugerencia}
                type="button"
                className="generar-semana-ia-dialog__chip"
                disabled={locked || usada}
                onClick={() => addCondicion(sugerencia)}
              >
                {sugerencia}
              </button>
            );
          })}
        </div>

        <form className="generar-semana-ia-dialog__composer" onSubmit={handleSend}>
          <textarea
            ref={inputRef}
            className="generar-semana-ia-dialog__input"
            rows={2}
            value={draft}
            maxLength={500}
            placeholder="Otra condición… (Enter para agregar)"
            disabled={locked}
            aria-label="Agregar condición"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="submit"
            className="generar-semana-ia-dialog__send"
            disabled={locked || !draft.trim()}
            aria-label="Agregar condición"
          >
            <Send size={16} />
          </button>
        </form>

        <div className="generar-semana-ia-dialog__actions">
          <span className="generar-semana-ia-dialog__count">
            {cantidad === 0
              ? "Sin condiciones extra"
              : `${cantidad} ${cantidad === 1 ? "condición" : "condiciones"}`}
          </span>
          <Button type="button" variant="ghost" disabled={locked} onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="button" disabled={locked} onClick={() => void handleGenerate()}>
            {generating ? (
              <LoaderCircle size={16} className="ap-spin" aria-hidden />
            ) : (
              <Sparkles size={16} aria-hidden />
            )}
            {generating ? "Generando…" : "Generar semana"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
