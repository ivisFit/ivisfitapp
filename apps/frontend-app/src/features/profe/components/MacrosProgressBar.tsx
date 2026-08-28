import type { MacrosObjetivo } from "@/features/alumna/types/plan-nutricional";

const ROWS: { key: keyof MacrosObjetivo; label: string; unidad: string }[] = [
  { key: "kcal", label: "Kcal", unidad: "" },
  { key: "proteinaG", label: "Proteína", unidad: "g" },
  { key: "carbohidratosG", label: "Carbos", unidad: "g" },
  { key: "grasasG", label: "Grasas", unidad: "g" },
];

export function MacrosProgressBar({
  objetivo,
  actual,
}: {
  objetivo: MacrosObjetivo;
  actual: MacrosObjetivo;
}) {
  return (
    <div className="macros-progress">
      {ROWS.map(({ key, label, unidad }) => {
        const target = objetivo[key] || 1;
        const value = actual[key];
        const pct = Math.min(100, Math.round((value / target) * 100));
        const isOver = value > target * 1.05;

        return (
          <div className="macros-progress__row" key={key}>
            <span>{label}</span>
            <div className="macros-progress__track">
              <div
                className={`macros-progress__fill${isOver ? " macros-progress__fill--over" : ""}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="macros-progress__value">
              {value}/{objetivo[key]}
              {unidad}
            </span>
          </div>
        );
      })}
    </div>
  );
}
