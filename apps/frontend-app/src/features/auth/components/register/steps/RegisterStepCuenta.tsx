import { Input, PasswordInput } from "@/components";
import type { RegisterFormData } from "@/features/auth/lib/register-form";

type RegisterStepCuentaProps = {
  formData: RegisterFormData;
  onChange: <K extends keyof RegisterFormData>(
    key: K,
    value: RegisterFormData[K],
  ) => void;
};

export function RegisterStepCuenta({
  formData,
  onChange,
}: RegisterStepCuentaProps) {
  return (
    <div className="register-stepper__fields">
      <Input
        label="Nombre y apellido"
        name="nombre"
        required
        autoComplete="name"
        value={formData.nombre}
        onChange={(e) => onChange("nombre", e.target.value)}
      />
      <Input
        label="Correo"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={formData.email}
        onChange={(e) => onChange("email", e.target.value)}
      />
      <PasswordInput
        label="Contraseña"
        name="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={formData.password}
        onChange={(e) => onChange("password", e.target.value)}
      />
      <PasswordInput
        label="Repetir contraseña"
        name="confirmPassword"
        autoComplete="new-password"
        required
        minLength={8}
        value={formData.confirmPassword}
        onChange={(e) => onChange("confirmPassword", e.target.value)}
      />
    </div>
  );
}
