"use client";

import type { ReactNode } from "react";

type SelectionCardOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
  icon?: ReactNode;
};

type SelectionCardProps<T extends string> = {
  name: string;
  label: string;
  options: SelectionCardOption<T>[];
  value: T | "";
  onChange: (value: T) => void;
  error?: string;
};

export function SelectionCard<T extends string>({
  name,
  label,
  options,
  value,
  onChange,
  error,
}: SelectionCardProps<T>) {
  return (
    <fieldset className="nutricion-fieldset">
      {label ? (
        <legend className="nutricion-fieldset__legend">{label}</legend>
      ) : null}
      <div className="nutricion-selection-cards" role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const isSelected = value === option.value;
          const inputId = `${name}-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={inputId}
              className={`nutricion-selection-card${isSelected ? " nutricion-selection-card--active" : ""}`}
            >
              <input
                id={inputId}
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="nutricion-selection-card__input"
              />
              {option.icon ? (
                <span className="nutricion-selection-card__icon" aria-hidden="true">
                  {option.icon}
                </span>
              ) : null}
              <span className="nutricion-selection-card__content">
                <span className="nutricion-selection-card__label">{option.label}</span>
                {option.description ? (
                  <span className="nutricion-selection-card__description">
                    {option.description}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
      {error ? <p className="auth-error nutricion-field__error">{error}</p> : null}
    </fieldset>
  );
}
