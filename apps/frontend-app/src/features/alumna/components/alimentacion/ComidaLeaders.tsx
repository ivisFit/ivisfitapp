import type { ComidaPlan } from "@/features/alumna/types/plan-nutricional";

export function ComidaLeaders({ comida }: { comida: ComidaPlan }) {
  if (comida.ingredientes.length === 0) return null;

  return (
    <ul className="comida-leaders">
      {comida.ingredientes.map((ingrediente, index) => (
        <li key={`${ingrediente.nombre}-${index}`}>
          <span className="comida-leaders__name">{ingrediente.nombre}</span>
          <span className="comida-leaders__dots" aria-hidden />
          <span className="comida-leaders__qty">
            {ingrediente.cantidad} {ingrediente.unidad}
            {ingrediente.kcal !== undefined ? (
              <small>{ingrediente.kcal} kcal</small>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function ComidaNotas({ comida }: { comida: ComidaPlan }) {
  if (!comida.preparacion && !comida.notas) return null;

  return (
    <div className="comida-notas">
      {comida.preparacion ? (
        <div className="comida-plato__note">
          <span>Preparación</span>
          <p>{comida.preparacion}</p>
        </div>
      ) : null}
      {comida.notas ? (
        <div className="comida-plato__note">
          <span>Nota</span>
          <p>{comida.notas}</p>
        </div>
      ) : null}
    </div>
  );
}
