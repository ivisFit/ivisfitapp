import { useId } from "react";
import { Info } from "lucide-react";
import "./InfoTooltip.css";

type InfoTooltipProps = {
  text: string;
  label?: string;
};

export function InfoTooltip({ text, label = "Más información" }: InfoTooltipProps) {
  const id = useId();
  const bubbleId = `info-tooltip-${id}`;

  return (
    <span className="info-tooltip">
      <button
        type="button"
        className="info-tooltip__trigger"
        aria-label={label}
        aria-describedby={bubbleId}
      >
        <Info size={16} aria-hidden="true" />
      </button>
      <span className="info-tooltip__bubble" id={bubbleId} role="tooltip">
        {text}
      </span>
    </span>
  );
}
