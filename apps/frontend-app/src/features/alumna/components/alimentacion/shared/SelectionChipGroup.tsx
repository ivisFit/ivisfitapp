"use client";

type SelectionChipGroupProps<T extends string> = {
  label: string;
  options: { value: T; label: string }[];
  value: T[];
  onChange: (value: T[]) => void;
  multiple?: boolean;
  error?: string;
  hint?: string;
};

export function SelectionChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  multiple = true,
  error,
  hint,
}: SelectionChipGroupProps<T>) {
  function toggleOption(optionValue: T) {
    if (multiple) {
      if (value.includes(optionValue)) {
        onChange(value.filter((item) => item !== optionValue));
      } else {
        onChange([...value, optionValue]);
      }
      return;
    }

    onChange(value.includes(optionValue) ? [] : [optionValue]);
  }

  return (
    <fieldset className="nutricion-fieldset">
      {label ? (
        <legend className="nutricion-fieldset__legend">{label}</legend>
      ) : null}
      {hint ? <p className="nutricion-fieldset__hint">{hint}</p> : null}
      <div
        className="nutricion-chip-group"
        role={multiple ? "group" : "radiogroup"}
        aria-label={label}
      >
        {options.map((option) => {
          const isActive = value.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              className={`nutricion-chip${isActive ? " nutricion-chip--active" : ""}`}
              aria-pressed={isActive}
              onClick={() => toggleOption(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {error ? <p className="auth-error nutricion-field__error">{error}</p> : null}
    </fieldset>
  );
}
