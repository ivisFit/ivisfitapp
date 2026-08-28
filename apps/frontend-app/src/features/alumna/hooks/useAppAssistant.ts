"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";

export type AppAssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  escalated?: boolean;
};

export type AsistenteCategoria =
  | "entrenamiento"
  | "alimentacion"
  | "motivacion"
  | "progreso"
  | "comunidad"
  | "general";

export type ChipSet =
  | "main"
  | "entrenamiento"
  | "alimentacion"
  | "motivacion"
  | "progreso"
  | "checkin"
  | "checkin_alimentacion"
  | "motivo"
  | "none";

type HistorialMensaje = {
  role: "user" | "assistant";
  content: string;
  escalated?: boolean;
};

type AsistenteBootstrap = {
  historial: HistorialMensaje[];
  fechaHoy: string;
  checkinPendiente: boolean;
  comunidadHoy: number;
  whatsappIvisHref: string;
  whatsappComunidadHref: string;
  insightPendiente?: { id: string; mensaje: string };
  nombre?: string;
  logrosResumen?: string;
  cumplimientoResumen?: string;
};

type AsistenteChatResponse = {
  reply: string;
  escalated: boolean;
  whatsappHref?: string;
  fechaHoy?: string;
};

type AsistenteCheckinResponse = {
  reply: string;
  escalated: boolean;
  needsMotivo: boolean;
  whatsappHref?: string;
  fechaHoy?: string;
};

function getTodayDateKeyUy(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Montevideo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function createMessage(
  role: AppAssistantMessage["role"],
  content: string,
  escalated = false,
): AppAssistantMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
    escalated,
  };
}

function buildGreeting(nombre?: string): string {
  const name = nombre?.trim().split(/\s+/)[0];
  const withName = [
    `¡Hola, ${name}! 😊
¿Cómo estás hoy?
¿En qué te puedo ayudar?`,
    `¡Hola, ${name}! 👋
¿Cómo va tu día?
¿En qué te doy una mano?`,
    `¡Buenas, ${name}! 🌱
¿Con qué te acompaño hoy?`,
  ];
  const withoutName = [
    `¡Hola! 😊
¿Cómo estás hoy?
¿En qué te puedo ayudar?`,
    `¡Hola! 👋
¿Cómo va tu día?
¿En qué te doy una mano?`,
    `¡Buenas! 🌱
¿Con qué te acompaño hoy?`,
  ];
  const pool = name ? withName : withoutName;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function useAppAssistant() {
  const [messages, setMessages] = useState<AppAssistantMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [whatsappHref, setWhatsappHref] = useState<string | undefined>();
  const [whatsappCtaLabel, setWhatsappCtaLabel] = useState("Abrir WhatsApp");
  const [chipSet, setChipSet] = useState<ChipSet>("main");
  const [categoria, setCategoria] = useState<AsistenteCategoria | undefined>();
  const [comunidadHoy, setComunidadHoy] = useState(0);
  const [whatsappIvisHref, setWhatsappIvisHref] = useState<string | undefined>();
  const [whatsappComunidadHref, setWhatsappComunidadHref] = useState<string | undefined>();
  const [logrosResumen, setLogrosResumen] = useState<string | undefined>();
  const [cumplimientoResumen, setCumplimientoResumen] = useState<string | undefined>();
  const [bootstrapped, setBootstrapped] = useState(false);
  const loadedRef = useRef(false);
  const sessionDateKeyRef = useRef<string | null>(null);

  const applyBootstrap = useCallback((data: AsistenteBootstrap) => {
    sessionDateKeyRef.current = data.fechaHoy ?? getTodayDateKeyUy();
    setComunidadHoy(data.comunidadHoy);
    setWhatsappIvisHref(data.whatsappIvisHref);
    setWhatsappComunidadHref(data.whatsappComunidadHref);
    setLogrosResumen(data.logrosResumen);
    setCumplimientoResumen(data.cumplimientoResumen);

    const historialMessages = data.historial.map((m) =>
      createMessage(m.role, m.content, m.escalated),
    );

    if (historialMessages.length === 0) {
      const opener: AppAssistantMessage[] = [
        createMessage("assistant", buildGreeting(data.nombre)),
      ];
      if (data.insightPendiente) {
        opener.push(
          createMessage(
            "assistant",
            `Tengo algo para contarte… ${data.insightPendiente.mensaje}`,
          ),
        );
        void apiFetch(`/api/coach-insights/${data.insightPendiente.id}/leido`, {
          method: "PATCH",
        }).catch(() => undefined);
      }
      if (data.checkinPendiente) {
        opener.push(
          createMessage("assistant", "¿Cómo estuvo tu entrenamiento hoy?"),
        );
      }
      setMessages(opener);
      setChipSet(data.checkinPendiente ? "checkin" : "main");
    } else {
      const withCheckin = [...historialMessages];
      if (data.checkinPendiente) {
        withCheckin.push(
          createMessage("assistant", "¿Cómo estuvo tu entrenamiento hoy?"),
        );
      }
      setMessages(withCheckin);
      setChipSet(data.checkinPendiente ? "checkin" : "main");
    }

    setBootstrapped(true);
  }, []);

  const loadBootstrap = useCallback(async (force = false) => {
    if (loadedRef.current && !force) return;
    loadedRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<AsistenteBootstrap>("/api/asistente/bootstrap");
      applyBootstrap(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el asistente");
      setMessages([createMessage("assistant", buildGreeting())]);
      setChipSet("main");
      sessionDateKeyRef.current = getTodayDateKeyUy();
      setBootstrapped(true);
    } finally {
      setLoading(false);
    }
  }, [applyBootstrap]);

  const ensureFreshDay = useCallback(async () => {
    const today = getTodayDateKeyUy();
    if (sessionDateKeyRef.current === today) return;
    loadedRef.current = false;
    await loadBootstrap(true);
  }, [loadBootstrap]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void ensureFreshDay();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [ensureFreshDay]);

  const showMainMenu = useCallback(() => {
    setCategoria(undefined);
    setChipSet("main");
    setWhatsappHref(undefined);
    setWhatsappCtaLabel("Abrir WhatsApp");
  }, []);

  const selectCategoria = useCallback(
    (cat: AsistenteCategoria) => {
      setCategoria(cat);
      setWhatsappHref(undefined);
      setWhatsappCtaLabel("Abrir WhatsApp");

      if (cat === "comunidad") {
        const countLine =
          comunidadHoy > 0
            ? `Hoy entrenaron ${comunidadHoy} chica${comunidadHoy === 1 ? "" : "s"}.`
            : "La comunidad está activa todos los días.";
        setMessages((prev) => [
          ...prev,
          createMessage("user", "👭 Comunidad"),
          createMessage(
            "assistant",
            `${countLine}\n\n¿Querés entrar al grupo de WhatsApp?`,
          ),
        ]);
        setWhatsappHref(whatsappComunidadHref);
        setWhatsappCtaLabel("Entrar al grupo de WhatsApp");
        setChipSet("none");
        return;
      }

      setChipSet(cat === "general" ? "main" : cat);
    },
    [comunidadHoy, whatsappComunidadHref],
  );

  const speakWithIvis = useCallback(() => {
    setMessages((prev) => [
      ...prev,
      createMessage("user", "🙋 Hablar con Ivis"),
      createMessage(
        "assistant",
        "Dale, escribile a Ivis por WhatsApp y lo ven juntas. Estoy acá si después necesitás algo más.",
      ),
    ]);
    setWhatsappHref(whatsappIvisHref);
    setWhatsappCtaLabel("Escribile a Ivis por WhatsApp");
    setChipSet("none");
  }, [whatsappIvisHref]);

  const sendMessage = useCallback(
    async (text: string, nextCategoria?: AsistenteCategoria) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      await ensureFreshDay();

      const activeCategoria = nextCategoria ?? categoria;
      if (nextCategoria) setCategoria(nextCategoria);

      setMessages((prev) => [...prev, createMessage("user", trimmed)]);
      setLoading(true);
      setError(null);
      setChipSet("none");

      try {
        const response = await apiFetch<AsistenteChatResponse>("/api/asistente/chat", {
          method: "POST",
          body: JSON.stringify({
            mensaje: trimmed,
            ...(activeCategoria ? { categoria: activeCategoria } : {}),
          }),
        });

        setMessages((prev) => [
          ...prev,
          createMessage("assistant", response.reply, response.escalated),
        ]);
        if (response.fechaHoy) {
          sessionDateKeyRef.current = response.fechaHoy;
        }
        setWhatsappHref(response.whatsappHref);
        if (response.whatsappHref) {
          setWhatsappCtaLabel(
            response.escalated
              ? "Escribile a Ivis por WhatsApp"
              : "Abrir WhatsApp",
          );
        } else {
          setWhatsappCtaLabel("Abrir WhatsApp");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo enviar el mensaje");
        setChipSet("main");
      } finally {
        setLoading(false);
      }
    },
    [loading, categoria, ensureFreshDay],
  );

  const sendCheckin = useCallback(
    async (
      rating: "excelente" | "bien" | "mas_o_menos" | "no_entrene",
      motivo?: "sin_tiempo" | "sin_ganas" | "dolor" | "mucho_trabajo" | "olvido",
    ) => {
      if (loading) return;
      await ensureFreshDay();
      setLoading(true);
      setError(null);
      setChipSet("none");

      const labels: Record<typeof rating, string> = {
        excelente: "😊 Excelente",
        bien: "🙂 Bien",
        mas_o_menos: "😐 Más o menos",
        no_entrene: "😞 No entrené",
      };
      const motivoLabels: Record<NonNullable<typeof motivo>, string> = {
        sin_tiempo: "No tuve tiempo",
        sin_ganas: "No tenía ganas",
        dolor: "Dolor",
        mucho_trabajo: "Mucho trabajo",
        olvido: "Olvido",
      };

      setMessages((prev) => [
        ...prev,
        createMessage(
          "user",
          motivo ? motivoLabels[motivo] : labels[rating],
        ),
      ]);

      try {
        const response = await apiFetch<AsistenteCheckinResponse>("/api/asistente/checkin", {
          method: "POST",
          body: JSON.stringify({ rating, ...(motivo ? { motivo } : {}) }),
        });

        setMessages((prev) => [
          ...prev,
          createMessage("assistant", response.reply, response.escalated),
        ]);
        if (response.fechaHoy) {
          sessionDateKeyRef.current = response.fechaHoy;
        }
        setWhatsappHref(response.whatsappHref);
        setWhatsappCtaLabel(
          response.escalated
            ? "Escribile a Ivis por WhatsApp"
            : "Abrir WhatsApp",
        );
        setChipSet(response.needsMotivo ? "motivo" : "main");
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo guardar el check-in");
        setChipSet("checkin");
      } finally {
        setLoading(false);
      }
    },
    [loading, ensureFreshDay],
  );

  const sendCheckinAlimentacion = useCallback(
    async (estado: "cumpli" | "parcial" | "no_pude") => {
      if (loading) return;
      await ensureFreshDay();
      setLoading(true);
      setError(null);
      setChipSet("none");

      const labels = {
        cumpli: "Cumplí con la alimentación",
        parcial: "Parcial con la alimentación",
        no_pude: "No pude con la alimentación",
      } as const;

      setMessages((prev) => [...prev, createMessage("user", labels[estado])]);

      try {
        await apiFetch("/api/checkins-alimentacion", {
          method: "PUT",
          body: JSON.stringify({ estado }),
        });

        const replies = {
          cumpli: "¡Buenísimo! Anotado: hoy cumpliste con la alimentación. 🍎",
          parcial:
            "Listo, quedó registrado como parcial. Mañana podemos simplificar un poco el plan si querés.",
          no_pude:
            "Gracias por marcarlo. Sin culpa: mañana podemos ver juntos cómo hacerlo más simple.",
        } as const;

        setMessages((prev) => [
          ...prev,
          createMessage("assistant", replies[estado]),
        ]);
        setChipSet("alimentacion");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudo guardar el check-in",
        );
        setChipSet("checkin_alimentacion");
      } finally {
        setLoading(false);
      }
    },
    [loading, ensureFreshDay],
  );

  const openCheckinAlimentacion = useCallback(() => {
    setMessages((prev) => [
      ...prev,
      createMessage("user", "Alimentación de hoy"),
      createMessage("assistant", "¿Cómo te fue con la alimentación hoy?"),
    ]);
    setChipSet("checkin_alimentacion");
  }, []);

  const askProgress = useCallback(async () => {
    const parts = [
      cumplimientoResumen ? `Cumplimiento: ${cumplimientoResumen}.` : null,
      logrosResumen ? `Logros: ${logrosResumen}.` : null,
    ].filter(Boolean);

    if (parts.length === 0) {
      await sendMessage(
        "Contame cómo vengo con mi progreso y mi constancia.",
        "progreso",
      );
      return;
    }

    setMessages((prev) => [
      ...prev,
      createMessage("user", "📈 Mi progreso"),
      createMessage(
        "assistant",
        `${parts.join(" ")}\n\n¿Querés que profundicemos en entrenamiento o alimentación?`,
      ),
    ]);
    setCategoria("progreso");
    setChipSet("progreso");
  }, [cumplimientoResumen, logrosResumen, sendMessage]);

  return {
    messages,
    loading,
    error,
    whatsappHref,
    whatsappCtaLabel,
    chipSet,
    categoria,
    bootstrapped,
    comunidadHoy,
    loadBootstrap,
    showMainMenu,
    selectCategoria,
    speakWithIvis,
    sendMessage,
    sendCheckin,
    sendCheckinAlimentacion,
    openCheckinAlimentacion,
    askProgress,
  };
}
