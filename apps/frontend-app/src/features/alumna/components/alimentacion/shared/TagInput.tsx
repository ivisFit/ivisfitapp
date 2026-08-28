"use client";

import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { filterAlimentosSugerencias } from "@/features/alumna/lib/alimentos-sugerencias";

type TagInputProps = {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  suggestions?: boolean;
  error?: string;
};

export function TagInput({
  label,
  value,
  onChange,
  placeholder = "Escribí y presioná Enter",
  suggestions = true,
  error,
}: TagInputProps) {
  const inputId = useId();
  const listId = `${inputId}-suggestions`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeSuggestion, setActiveSuggestion] = useState(-1);

  const filteredSuggestions = suggestions
    ? filterAlimentosSugerencias(query, value)
    : [];

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag) return;
    const exists = value.some(
      (item) => item.toLowerCase() === tag.toLowerCase(),
    );
    if (exists) {
      setQuery("");
      setActiveSuggestion(-1);
      return;
    }
    onChange([...value, tag]);
    setQuery("");
    setActiveSuggestion(-1);
  }

  function removeTag(index: number) {
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      if (activeSuggestion >= 0 && filteredSuggestions[activeSuggestion]) {
        addTag(filteredSuggestions[activeSuggestion]);
        return;
      }
      addTag(query);
      return;
    }

    if (event.key === "Backspace" && !query && value.length > 0) {
      removeTag(value.length - 1);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestion((prev) =>
        Math.min(prev + 1, filteredSuggestions.length - 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestion((prev) => Math.max(prev - 1, 0));
    }
  }

  return (
    <div className="nutricion-tag-input">
      <label className="field" htmlFor={inputId}>
        {label ? <span className="field__label">{label}</span> : null}
        <div
          className="nutricion-tag-input__control"
          onClick={() => inputRef.current?.focus()}
        >
          {value.map((tag, index) => (
            <span key={`${tag}-${index}`} className="nutricion-tag">
              {tag}
              <button
                type="button"
                className="nutricion-tag__remove"
                aria-label={`Quitar ${tag}`}
                onClick={() => removeTag(index)}
              >
                ×
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            className="nutricion-tag-input__field"
            value={query}
            placeholder={value.length === 0 ? placeholder : ""}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveSuggestion(-1);
            }}
            onKeyDown={handleKeyDown}
            onFocus={(event) => {
              event.currentTarget.scrollIntoView({
                block: "center",
                behavior: "smooth",
              });
            }}
            aria-autocomplete="list"
            aria-controls={filteredSuggestions.length > 0 ? listId : undefined}
            aria-expanded={filteredSuggestions.length > 0}
          />
        </div>
      </label>

      {filteredSuggestions.length > 0 ? (
        <ul id={listId} className="nutricion-tag-input__suggestions" role="listbox">
          {filteredSuggestions.map((suggestion, index) => (
            <li key={suggestion}>
              <button
                type="button"
                role="option"
                aria-selected={index === activeSuggestion}
                className={`nutricion-tag-input__suggestion${index === activeSuggestion ? " nutricion-tag-input__suggestion--active" : ""}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => addTag(suggestion)}
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {error ? <p className="auth-error nutricion-field__error">{error}</p> : null}
    </div>
  );
}
