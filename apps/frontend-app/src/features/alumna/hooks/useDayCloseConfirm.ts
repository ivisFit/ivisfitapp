"use client";

import { useAppDialog } from "@/components/AppDialogProvider";

export function useDayCloseConfirm() {
  const { confirm } = useAppDialog();

  async function confirmSkip(dayLabel: string) {
    return confirm({
      title: "¿Marcamos este día como no hecho?",
      message: `«${dayLabel}» no suma XP ni racha. No reemplaza el entrenamiento de hoy: queda para otro momento y vas a poder deshacerlo unos segundos.`,
      tone: "warning",
      confirmLabel: "Marcar como no hecho",
      cancelLabel: "Seguir en el día",
    });
  }

  async function confirmIncomplete(dayLabel: string) {
    return confirm({
      title: "Todavía faltan ejercicios",
      message: `Si cerrás «${dayLabel}» ahora, no suma XP ni racha. Los ejercicios que ya marcaste se guardan. Vas a poder deshacerlo unos segundos.`,
      tone: "warning",
      confirmLabel: "Cerrar igual",
      cancelLabel: "Seguir entrenando",
    });
  }

  return { confirmSkip, confirmIncomplete };
}
