"use client";

import type { ChipOption } from "./chatbot-types";

type ChatbotChipsProps = {
  options: ChipOption[];
  selected?: string[];
  multi?: boolean;
  disabled?: boolean;
  onSelect: (value: string, label: string) => void;
};

export function ChatbotChips({
  options,
  selected = [],
  multi = false,
  disabled = false,
  onSelect,
}: ChatbotChipsProps) {
  return (
    <div className="chatbot-chips" role="group">
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            className={
              isSelected
                ? "chatbot-chips__chip chatbot-chips__chip--selected"
                : "chatbot-chips__chip"
            }
            disabled={disabled}
            onClick={() => onSelect(option.value, option.label)}
          >
            {option.label}
          </button>
        );
      })}
      {multi ? (
        <span className="chatbot-chips__hint">Elegí todas las que apliquen</span>
      ) : null}
    </div>
  );
}
