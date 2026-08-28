import { Input } from "@/components";
import type { RegisterFormData } from "@/features/auth/lib/register-form";

type RegisterStepContactoProps = {
  formData: RegisterFormData;
  onChange: <K extends keyof RegisterFormData>(
    key: K,
    value: RegisterFormData[K],
  ) => void;
};

export function RegisterStepContacto({
  formData,
  onChange,
}: RegisterStepContactoProps) {
  return (
    <div className="register-stepper__fields">
      <Input
        label="Cédula (sin puntos ni guión)"
        name="cedula"
        inputMode="numeric"
        pattern="\d+"
        required
        value={formData.cedula}
        onChange={(e) => onChange("cedula", e.target.value)}
      />
      <Input
        label="Teléfono"
        name="telefono"
        type="tel"
        autoComplete="tel"
        required
        value={formData.telefono}
        onChange={(e) => onChange("telefono", e.target.value)}
      />
      <Input
        label="Fecha de nacimiento"
        name="fechaNacimiento"
        type="date"
        required
        value={formData.fechaNacimiento}
        onChange={(e) => onChange("fechaNacimiento", e.target.value)}
      />
    </div>
  );
}
