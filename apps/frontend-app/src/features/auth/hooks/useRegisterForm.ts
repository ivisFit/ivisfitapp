"use client";

import { useCallback, useState } from "react";
import {
  INITIAL_REGISTER_FORM,
  type RegisterFormData,
  type RegisterStep,
  type UploadedComprobante,
  validateComprobanteFile,
  validateRegisterStep,
} from "@/features/auth/lib/register-form";
import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

export function useRegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>(INITIAL_REGISTER_FORM);
  const [currentStep, setCurrentStep] = useState<RegisterStep>(1);
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateField = useCallback(
    <K extends keyof RegisterFormData>(key: K, value: RegisterFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
      setError(null);
    },
    [],
  );

  const handleComprobanteChange = useCallback((file: File | null) => {
    setError(null);

    if (!file) {
      setComprobante(null);
      return;
    }

    const validationError = validateComprobanteFile(file);
    if (validationError) {
      setComprobante(null);
      setError(validationError);
      return;
    }

    setComprobante(file);
  }, []);

  const nextStep = useCallback(() => {
    const validationError = validateRegisterStep(currentStep, formData, comprobante);
    if (validationError) {
      setError(validationError);
      return false;
    }

    setError(null);
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as RegisterStep);
    }
    return true;
  }, [comprobante, currentStep, formData]);

  const prevStep = useCallback(() => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as RegisterStep);
    }
  }, [currentStep]);

  const uploadComprobante = useCallback(async (): Promise<UploadedComprobante> => {
    if (!comprobante) {
      throw new Error("Adjuntá el comprobante de pago para continuar");
    }

    return apiFetch<UploadedComprobante>("/api/comprobantes-pago", {
      method: "POST",
      body: comprobante,
      headers: {
        "Content-Type": comprobante.type,
        "X-File-Name": comprobante.name,
      },
    });
  }, [comprobante]);

  const submit = useCallback(async () => {
    const validationError = validateRegisterStep(5, formData, comprobante);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const uploadedComprobante = await uploadComprobante();
      const result = await authClient.signUp.email({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        name: formData.nombre.trim(),
        rol: "alumna",
        telefono: formData.telefono.trim(),
        mutualista: formData.mutualista.trim(),
        sexo: formData.sexo,
        alturaCm: formData.alturaCm.trim(),
        fechaNacimiento: formData.fechaNacimiento,
        coberturaEmergenciaMedica: formData.coberturaEmergenciaMedica.trim(),
        lesionesPatologias: formData.lesionesPatologias.trim(),
        alergias: formData.alergias.trim(),
        cedula: formData.cedula.trim(),
        metodoComprobante: "adjunto",
        comprobantePagoUrl: uploadedComprobante.url,
        comprobantePagoPublicId: uploadedComprobante.publicId,
        comprobantePagoNombreArchivo: uploadedComprobante.nombreArchivo,
        comprobantePagoFormato: uploadedComprobante.formato,
        comprobantePagoBytes: uploadedComprobante.bytes?.toString(),
      });

      if (result.error) {
        setError(result.error.message ?? "Error al enviar la solicitud");
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo conectar con el servidor. ¿Está corriendo el backend?",
      );
    } finally {
      setSubmitting(false);
    }
  }, [comprobante, formData, uploadComprobante]);

  return {
    formData,
    currentStep,
    comprobante,
    submitting,
    error,
    success,
    updateField,
    handleComprobanteChange,
    nextStep,
    prevStep,
    submit,
    setError,
  };
}
