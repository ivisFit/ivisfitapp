import type { RegisterFormData } from "@/features/auth/lib/register-form";

type RegisterStepSaludProps = {
  formData: RegisterFormData;
  onChange: <K extends keyof RegisterFormData>(
    key: K,
    value: RegisterFormData[K],
  ) => void;
};

export function RegisterStepSalud({
  formData,
  onChange,
}: RegisterStepSaludProps) {
  return (
    <div className="register-stepper__fields">
      <label className="field" htmlFor="lesionesPatologias">
        <span className="field__label">Lesiones - patologías</span>
        <textarea
          id="lesionesPatologias"
          className="field__input field__textarea"
          name="lesionesPatologias"
          required
          rows={3}
          placeholder="Si no tenés ninguna, escribí 'ninguna'"
          value={formData.lesionesPatologias}
          onChange={(e) => onChange("lesionesPatologias", e.target.value)}
        />
      </label>
      <label className="field" htmlFor="alergias">
        <span className="field__label">Alergias</span>
        <textarea
          id="alergias"
          className="field__input field__textarea"
          name="alergias"
          required
          rows={3}
          placeholder="Si no tenés ninguna, escribí 'ninguna'"
          value={formData.alergias}
          onChange={(e) => onChange("alergias", e.target.value)}
        />
      </label>
    </div>
  );
}
