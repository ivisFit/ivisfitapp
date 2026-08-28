"use client";

import { useEffect, useState } from "react";
import { SuccessModal } from "@/components/SuccessModal";
import { consumeAlumnaCreatedNotice } from "@/lib/alumna-created-notice";

interface AlumnaCreatedNoticeProps {
  onAcknowledged?: () => void;
}

export function AlumnaCreatedNotice({ onAcknowledged }: AlumnaCreatedNoticeProps) {
  const [open, setOpen] = useState(false);
  const [createdName, setCreatedName] = useState("");

  useEffect(() => {
    const name = consumeAlumnaCreatedNotice();
    if (!name) return;
    setCreatedName(name);
    setOpen(true);
  }, []);

  function handleConfirm() {
    setOpen(false);
    onAcknowledged?.();
  }

  return (
    <SuccessModal
      open={open}
      title="Alumna registrada"
      message={`"${createdName}" fue creada correctamente. Ya puede iniciar sesión con su email y contraseña.`}
      onConfirm={handleConfirm}
    />
  );
}
