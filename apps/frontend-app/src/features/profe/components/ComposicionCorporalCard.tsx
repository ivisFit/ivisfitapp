import Link from "next/link";
import { profeAlumnaPlieguesRoute } from "@/routes/paths";
import type { ComposicionCorporal } from "@/features/alumna/types/plan-nutricional";

function getImcCategoria(imc: number): string {
  if (imc < 18.5) return "Bajo peso";
  if (imc < 25) return "Peso normal";
  if (imc < 30) return "Sobrepeso";
  return "Obesidad";
}

function formatFecha(value?: string) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function ComposicionCorporalCard({
  alumnaId,
  composicion,
}: {
  alumnaId: string;
  composicion?: ComposicionCorporal;
}) {
  if (!composicion) {
    return (
      <section className="composicion-corporal-card">
        <h4>Composición corporal</h4>
        <p className="alumnas-panel__status">
          Todavía no hay mediciones registradas.{" "}
          <Link className="auth-link" href={profeAlumnaPlieguesRoute(alumnaId)}>
            Registrar medición
          </Link>
        </p>
      </section>
    );
  }

  const fecha = formatFecha(composicion.fechaMedicion);

  return (
    <section className="composicion-corporal-card">
      <h4>Composición corporal</h4>
      <div className="composicion-corporal-card__grid">
        {composicion.pesoKg ? (
          <div className="composicion-corporal-card__metric">
            <span>Peso</span>
            <strong>{composicion.pesoKg} kg</strong>
          </div>
        ) : null}
        {composicion.imc ? (
          <div className="composicion-corporal-card__metric">
            <span>IMC</span>
            <strong>
              {composicion.imc} · {getImcCategoria(composicion.imc)}
            </strong>
          </div>
        ) : null}
        {composicion.porcentajeGrasaCorporal != null ? (
          <div className="composicion-corporal-card__metric">
            <span>% graso</span>
            <strong>{composicion.porcentajeGrasaCorporal}%</strong>
          </div>
        ) : null}
        {composicion.masaMagra ? (
          <div className="composicion-corporal-card__metric">
            <span>Masa magra</span>
            <strong>{composicion.masaMagra} kg</strong>
          </div>
        ) : null}
      </div>
      <p className="composicion-corporal-card__meta">
        {fecha ? `Última medición: ${fecha}` : null}{" "}
        <Link className="auth-link" href={profeAlumnaPlieguesRoute(alumnaId)}>
          Ver pliegues
        </Link>
      </p>
    </section>
  );
}
