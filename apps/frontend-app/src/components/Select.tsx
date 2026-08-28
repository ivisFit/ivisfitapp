import type { SelectHTMLAttributes } from "react";
import "./Input.css";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

export function Select({ label, id, className = "", children, ...props }: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <label className={`field ${className}`.trim()} htmlFor={selectId}>
      <span className="field__label">{label}</span>
      <select id={selectId} className="field__input" {...props}>
        {children}
      </select>
    </label>
  );
}
