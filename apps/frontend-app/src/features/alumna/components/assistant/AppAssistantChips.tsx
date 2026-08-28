"use client";

type ChipOption = {
  value: string;
  label: string;
};

type AppAssistantChipsProps = {
  options: ChipOption[];
  disabled?: boolean;
  onSelect: (value: string) => void;
};

export function AppAssistantChips({
  options,
  disabled = false,
  onSelect,
}: AppAssistantChipsProps) {
  return (
    <div className="app-assistant-chips" role="group" aria-label="Opciones del asistente">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="app-assistant-chips__chip"
          disabled={disabled}
          onClick={() => onSelect(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
