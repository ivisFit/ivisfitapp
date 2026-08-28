"use client";

import { useCheckinAlimentacionHoy } from "@/features/alumna/hooks/useCheckinAlimentacionHoy";

export function CheckinAlimentacionCard() {
  const { checkin, loading, saving, error, save, options } =
    useCheckinAlimentacionHoy();

  if (loading) return null;

  return (
    <section className="checkin-alimentacion" aria-label="Check-in de alimentación">
      <h2 className="checkin-alimentacion__title">
        ¿Cómo te fue con la alimentación hoy?
      </h2>
      <div className="checkin-alimentacion__chips" role="group">
        {options.map((option) => {
          const selected = checkin?.estado === option.value;
          return (
            <button
              key={option.value}
              type="button"
              className={`checkin-alimentacion__chip${selected ? " checkin-alimentacion__chip--selected" : ""}`}
              disabled={saving}
              aria-pressed={selected}
              onClick={() => void save(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {error ? <p className="checkin-alimentacion__error">{error}</p> : null}
    </section>
  );
}
