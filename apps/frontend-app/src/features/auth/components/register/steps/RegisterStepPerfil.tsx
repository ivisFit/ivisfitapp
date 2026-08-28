import { Input } from "@/components";
import type { RegisterFormData } from "@/features/auth/lib/register-form";

type RegisterStepPerfilProps = {
  formData: RegisterFormData;
  onChange: <K extends keyof RegisterFormData>(
    key: K,
    value: RegisterFormData[K],
  ) => void;
};

export function RegisterStepPerfil({
  formData,
  onChange,
}: RegisterStepPerfilProps) {
  return (
    <div className="register-stepper__fields">
      <label className="field" htmlFor="sexo">
        <span className="field__label">Sexo</span>
        <select
          id="sexo"
          name="sexo"
          className="field__input"
          required
          value={formData.sexo}
          onChange={(e) =>
            onChange(
              "sexo",
              e.target.value === "hombre" || e.target.value === "mujer"
                ? e.target.value
                : "",
            )
          }
        >
          <option value="">Seleccionar</option>
          <option value="mujer">Mujer</option>
          <option value="hombre">Hombre</option>
        </select>
      </label>
      <Input
        label="Altura (cm)"
        name="alturaCm"
        type="number"
        inputMode="decimal"
        min={1}
        step={0.1}
        required
        value={formData.alturaCm}
        onChange={(e) => onChange("alturaCm", e.target.value)}
      />
      <Input
        label="Servicio médico (mutualista)"
        name="mutualista"
        required
        value={formData.mutualista}
        onChange={(e) => onChange("mutualista", e.target.value)}
      />
      <Input
        label="Cobertura de emergencia médica"
        name="coberturaEmergenciaMedica"
        required
        value={formData.coberturaEmergenciaMedica}
        onChange={(e) => onChange("coberturaEmergenciaMedica", e.target.value)}
      />
    </div>
  );
}
