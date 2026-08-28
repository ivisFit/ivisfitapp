import { memo } from "react";
import type { PanelActivityItem } from "@/features/profe/types/panel";

type ActivityJewelProps = {
  tipo: PanelActivityItem["tipo"];
};

const JEWEL_CONFIG: Record<
  PanelActivityItem["tipo"],
  { symbol: string; modifier: string }
> = {
  rutina_completada: { symbol: "✓", modifier: "success" },
  admision: { symbol: "+", modifier: "admission" },
  registro_peso: { symbol: "⚖", modifier: "weight" },
};

export const ActivityJewel = memo(function ActivityJewel({ tipo }: ActivityJewelProps) {
  const config = JEWEL_CONFIG[tipo];

  return (
    <span
      className={`profe-dashboard__activity-jewel profe-dashboard__activity-jewel--${config.modifier}`}
      aria-hidden
    >
      <span className="profe-dashboard__activity-jewel-glow" />
      <span className="profe-dashboard__activity-jewel-icon">
        {config.symbol}
      </span>
    </span>
  );
});
