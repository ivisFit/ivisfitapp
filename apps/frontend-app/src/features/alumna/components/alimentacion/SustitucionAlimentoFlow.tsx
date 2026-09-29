"use client";

import { FormEvent, useState } from "react";
import { Button, Input } from "@/components";
import { apiFetch } from "@/lib/api";

type SustitucionResponse = {
  reply: string;
  escalated?: boolean;
  whatsappHref?: string;
};

type SustitucionAlimentoFlowProps = {
  title?: string;
  description?: string;
  onOpenAssistant?: () => void;
  assistantButtonLabel?: string;
};

export function SustitucionAlimentoFlow({
  title = "Hacer una sustitución",
  description = "Contame qué comiste y cuántos gramos, y te propongo alternativas alineadas a tu plan.",
  onOpenAssistant,
  assistantButtonLabel = "Consultar otra cosa",
}: SustitucionAlimentoFlowProps) {
  const [alimento, setAlimento] = useState("");
  const [gramos, setGramos] = useState(100);
  const [reply, setReply] = useState<string | null>(null);
  const [whatsappHref, setWhatsappHref] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    setReply(null);
    setWhatsappHref(undefined);

    try {
      const response = await apiFetch<SustitucionResponse>("/api/asistente/chat", {
        method: "POST",
        body: JSON.stringify({
          intent: "sustitucion",
          categoria: "alimentacion",
          sustitucion: {
            alimento: alimento.trim(),
            gramos,
          },
        }),
      });
      setReply(response.reply);
      setWhatsappHref(response.whatsappHref);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo obtener alternativas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="sustitucion-alimento-flow">
      <header className="sustitucion-alimento-flow__header">
        <h4>{title}</h4>
        <p>{description}</p>
      </header>

      <form className="sustitucion-alimento-flow__form" onSubmit={(event) => void handleSubmit(event)}>
        <Input
          label="Alimento a sustituir"
          name="sustitucion-alimento"
          value={alimento}
          onChange={(event) => setAlimento(event.target.value)}
          placeholder="Ej. pollo, arroz..."
          disabled={loading}
        />
        <Input
          label="Gramos"
          name="sustitucion-gramos"
          type="number"
          min={1}
          step="any"
          value={gramos}
          onChange={(event) => setGramos(Number(event.target.value) || 0)}
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !alimento.trim() || gramos <= 0}>
          {loading ? "Buscando alternativas..." : "Ver alternativas"}
        </Button>
      </form>

      {error ? <p className="auth-error">{error}</p> : null}

      {reply ? (
        <div className="sustitucion-alimento-flow__result" role="status">
          <p>{reply}</p>
          {whatsappHref ? (
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              Escribile a Ivis por WhatsApp
            </a>
          ) : null}
        </div>
      ) : null}

      {onOpenAssistant ? (
        <Button type="button" variant="ghost" onClick={onOpenAssistant}>
          {assistantButtonLabel}
        </Button>
      ) : null}
    </section>
  );
}

export const SUSTITUCION_KEYWORDS =
  /\b(sustitu(?:ción|cion|ir)|reemplaz(?:ar|o)|cambiar alimento)\b/i;
