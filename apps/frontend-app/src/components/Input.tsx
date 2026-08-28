import type { InputHTMLAttributes } from "react";
import "./Input.css";
import { InfoTooltip } from "./InfoTooltip";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  tooltip?: string;
}

export function Input({ label, tooltip, id, className = "", ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className={`field ${className}`.trim()} htmlFor={inputId}>
      {label ? (
        <span className="field__label-row">
          <span className="field__label">{label}</span>
          {tooltip ? <InfoTooltip text={tooltip} /> : null}
        </span>
      ) : null}
      <input id={inputId} className="field__input" {...props} />
    </label>
  );
}
