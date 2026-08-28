"use client";

import { useState } from "react";
import { Button } from "@/components";
import { apiFetch } from "@/lib/api";
import type { NutricionChatResponse } from "@/features/alumna/types/plan-nutricional";
import { useAppAssistantContext } from "@/features/alumna/components/assistant/AppAssistantProvider";

type NutricionChatPanelProps = {
  rol: "alumna" | "profe";
  alumnaId?: string;
  planId?: string;
  title: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export function NutricionChatPanel({
  rol,
  alumnaId,
  planId,
  title,
}: NutricionChatPanelProps) {
  const assistant = useAppAssistantContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (rol === "alumna") {
    return (
      <section className="nutricion-chat-panel">
        <h4>{title}</h4>
        <p className="alumnas-panel__status">
          Preguntale a tu asistente sobre tu plan, sustituciones o dudas del día.
        </p>
        <Button type="button" onClick={() => assistant?.openAssistant()}>
          Abrir asistente
        </Button>
      </section>
    );
  }

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    const mensaje = input.trim();
    if (!mensaje || loading) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      text: mensaje,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<NutricionChatResponse>(
        "/api/plan-nutricional/chat",
        {
          method: "POST",
          body: JSON.stringify({
            mensaje,
            rol,
            alumnaId,
            planId,
          }),
        },
      );

      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          text: data.reply,
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo enviar el mensaje",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="nutricion-chat-panel">
      <h4>{title}</h4>
      <div className="nutricion-chat-panel__messages">
        {messages.length === 0 ? (
          <p className="alumnas-panel__status">
            Pedí un resumen, sugerencias o ayuda para ajustar el plan.
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`nutricion-chat-panel__message nutricion-chat-panel__message--${message.role}`}
            >
              {message.text}
            </div>
          ))
        )}
      </div>
      {error ? <p className="auth-error">{error}</p> : null}
      <form className="nutricion-chat-panel__form" onSubmit={(event) => void handleSend(event)}>
        <textarea
          className="nutricion-chat-panel__input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Escribí tu consulta..."
          rows={3}
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          {loading ? "Enviando..." : "Enviar"}
        </Button>
      </form>
    </section>
  );
}
