"use client";



import { FormEvent, useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";

import { Button } from "@/components/Button";

import { ChatbotAvatar } from "@/features/landing/components/Chatbot/ChatbotAvatar";

import { apiFetch } from "@/lib/api";



type Mensaje = {

  _id: string;

  alumnaId: string;

  autorRol: "profe" | "alumna";

  cuerpo: string;

  leidoAt?: string;

  createdAt: string;

};



type MensajesThreadProps = {

  alumnaId?: string;

  viewerRole: "profe" | "alumna";

  layout?: "panel" | "chat";

  initialDraft?: string;

  onThreadLoaded?: () => void;

};



function SendIcon() {

  return (

    <svg

      viewBox="0 0 24 24"

      fill="none"

      stroke="currentColor"

      strokeWidth="2.5"

      strokeLinecap="round"

      strokeLinejoin="round"

      aria-hidden

    >

      <path d="M22 2L11 13" />

      <path d="M22 2L15 22L11 13L2 9L22 2Z" />

    </svg>

  );

}



function formatMessageTime(value: string) {

  return new Date(value).toLocaleString("es-UY", {

    day: "2-digit",

    month: "short",

    hour: "2-digit",

    minute: "2-digit",

  });

}



export function MensajesThread({

  alumnaId,

  viewerRole,

  layout = "panel",

  initialDraft,

  onThreadLoaded,

}: MensajesThreadProps) {

  const isChat = layout === "chat";

  const [mensajes, setMensajes] = useState<Mensaje[]>([]);

  const [cuerpo, setCuerpo] = useState(initialDraft ?? "");

  const [loading, setLoading] = useState(true);

  const [sending, setSending] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);



  const load = useCallback(async () => {

    try {

      const query =

        viewerRole === "profe" && alumnaId

          ? `?alumnaId=${encodeURIComponent(alumnaId)}`

          : "";

      const data = await apiFetch<Mensaje[]>(`/api/mensajes${query}`);

      setMensajes(Array.isArray(data) ? data : []);

      setError(null);

      onThreadLoaded?.();

    } catch (err) {

      setError(err instanceof Error ? err.message : "No se pudieron cargar mensajes");

    } finally {

      setLoading(false);

    }

  }, [alumnaId, onThreadLoaded, viewerRole]);



  useEffect(() => {

    void load();

    const id = window.setInterval(() => void load(), 18000);

    return () => window.clearInterval(id);

  }, [load]);



  useEffect(() => {

    if (!initialDraft || !isChat) return;

    inputRef.current?.focus();

  }, [initialDraft, isChat]);



  useEffect(() => {

    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  }, [mensajes.length]);



  async function handleSend() {

    const text = cuerpo.trim();

    if (!text || sending) return;

    setSending(true);

    try {

      await apiFetch("/api/mensajes", {

        method: "POST",

        body: JSON.stringify({

          cuerpo: text,

          ...(viewerRole === "profe" && alumnaId ? { alumnaId } : {}),

        }),

      });

      setCuerpo("");

      await load();

      if (isChat) {

        inputRef.current?.focus();

      }

    } catch (err) {

      setError(err instanceof Error ? err.message : "No se pudo enviar");

    } finally {

      setSending(false);

    }

  }



  function handleComposerSubmit(event: FormEvent) {

    event.preventDefault();

    void handleSend();

  }



  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {

    if (event.key !== "Enter" || event.shiftKey) return;

    event.preventDefault();

    void handleSend();

  }



  const threadClassName = isChat

    ? "mensajes-thread mensajes-thread--chat"

    : "mensajes-thread";



  return (

    <section className={threadClassName}>

      <div className="mensajes-thread__list">

        {loading ? (

          <p className={isChat ? "mensajes-thread__loading" : "alumnas-panel__status"}>

            {isChat ? "Cargando conversación..." : "Cargando..."}

          </p>

        ) : null}

        {!loading && mensajes.length === 0 ? (

          <p className={isChat ? "mensajes-thread__empty" : "alumnas-panel__status"}>

            {isChat

              ? "Todavía no hay mensajes. Escribile a Ivis para empezar la conversación."

              : "Todavía no hay mensajes en este hilo."}

          </p>

        ) : null}

        {mensajes.map((mensaje) => {

          const isMine = mensaje.autorRol === viewerRole;



          if (isChat) {

            return (

              <div

                key={mensaje._id}

                className={

                  isMine

                    ? "mensajes-chat-message mensajes-chat-message--mine"

                    : "mensajes-chat-message mensajes-chat-message--theirs"

                }

              >

                {!isMine ? (

                  <div className="mensajes-chat-message__avatar" aria-hidden>

                    <ChatbotAvatar />

                  </div>

                ) : null}

                <div className="mensajes-chat-message__bubble">

                  {!isMine ? (

                    <span className="mensajes-chat-message__sender">Ivis</span>

                  ) : null}

                  <p>{mensaje.cuerpo}</p>

                  <time dateTime={mensaje.createdAt}>

                    {formatMessageTime(mensaje.createdAt)}

                  </time>

                </div>

              </div>

            );

          }



          return (

            <div

              key={mensaje._id}

              className={

                isMine

                  ? "mensajes-thread__bubble mensajes-thread__bubble--mine"

                  : "mensajes-thread__bubble"

              }

            >

              <p>{mensaje.cuerpo}</p>

              <time dateTime={mensaje.createdAt}>

                {formatMessageTime(mensaje.createdAt)}

              </time>

            </div>

          );

        })}

        <div ref={bottomRef} />

      </div>



      {error ? (

        <p className={isChat ? "mensajes-thread__error" : "auth-error"}>{error}</p>

      ) : null}



      {isChat ? (

        <form className="mensajes-thread__composer" onSubmit={handleComposerSubmit}>

          <div className="mensajes-thread__composer-form">

            <div className="mensajes-thread__composer-input-wrap">

              <textarea

                ref={inputRef}

                rows={1}

                maxLength={2000}

                value={cuerpo}

                onChange={(event) => setCuerpo(event.target.value)}

                onKeyDown={handleComposerKeyDown}

                placeholder="Escribí un mensaje..."

                aria-label="Mensaje para Ivis"

                disabled={sending}

              />

              <button

                type="submit"

                className="mensajes-thread__composer-submit"

                disabled={sending || !cuerpo.trim()}

                aria-label={sending ? "Enviando mensaje" : "Enviar mensaje"}

              >

                <SendIcon />

              </button>

            </div>

          </div>

        </form>

      ) : (

        <div className="mensajes-thread__composer">

          <label className="field" htmlFor="mensaje-cuerpo">

            <span className="field__label">Escribí un mensaje</span>

            <textarea

              id="mensaje-cuerpo"

              className="field__input field__textarea"

              rows={3}

              maxLength={2000}

              value={cuerpo}

              onChange={(event) => setCuerpo(event.target.value)}

            />

          </label>

          <Button

            type="button"

            onClick={() => void handleSend()}

            disabled={sending || !cuerpo.trim()}

          >

            {sending ? "Enviando..." : "Enviar"}

          </Button>

        </div>

      )}

    </section>

  );

}


