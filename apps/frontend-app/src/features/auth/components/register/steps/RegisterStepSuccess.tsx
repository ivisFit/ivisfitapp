import Link from "next/link";
import { AuthCard } from "@/components/layout/AuthCard";
import { publicRoutes } from "@/routes/paths";

export function RegisterStepSuccess() {
  return (
    <AuthCard
      variant="login"
      eyebrow="Registro"
      title={
        <>
          Esperando <em>aprobación</em>
        </>
      }
      subtitle="Tu registro quedó pendiente de admisión."
      footer={
        <Link href={publicRoutes.login}>Volver al inicio de sesión</Link>
      }
    >
      <p className="auth-hint">
        La profesora va a revisar tus datos y el comprobante de pago. Cuando te
        admita, vas a poder ingresar con el email y la contraseña que elegiste.
      </p>
    </AuthCard>
  );
}
