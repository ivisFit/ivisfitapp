"use client";

import {
  formatDateParam,
  getReunionDateKey,
  type Reunion,
} from "@/features/profe/types/reunion";

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

type CalendarCell = {
  date: Date;
  inMonth: boolean;
};

type AgendaCalendarioProps = {
  year: number;
  month: number;
  reuniones: Reunion[];
  selectedDate: string | null;
  onSelectDate: (dateKey: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

function buildCalendarCells(year: number, month: number): CalendarCell[] {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + index,
    );

    return {
      date,
      inMonth: date.getMonth() === month,
    };
  });
}

function groupReunionesByDay(reuniones: Reunion[]) {
  const map = new Map<string, Reunion[]>();

  for (const reunion of reuniones) {
    const key = getReunionDateKey(reunion.fecha);
    const current = map.get(key) ?? [];
    current.push(reunion);
    map.set(key, current);
  }

  return map;
}

export function AgendaCalendario({
  year,
  month,
  reuniones,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: AgendaCalendarioProps) {
  const cells = buildCalendarCells(year, month);
  const reunionesByDay = groupReunionesByDay(reuniones);
  const monthLabel = new Date(year, month, 1).toLocaleDateString("es-UY", {
    month: "long",
    year: "numeric",
  });
  const todayKey = formatDateParam(new Date());

  return (
    <section className="agenda-calendario" aria-label="Calendario de reuniones">
      <div className="agenda-calendario__header">
        <button
          type="button"
          className="agenda-calendario__nav"
          onClick={onPrevMonth}
          aria-label="Mes anterior"
        >
          ‹
        </button>
        <h3 className="agenda-calendario__title">{monthLabel}</h3>
        <button
          type="button"
          className="agenda-calendario__nav"
          onClick={onNextMonth}
          aria-label="Mes siguiente"
        >
          ›
        </button>
      </div>

      <div className="agenda-calendario__weekdays" aria-hidden>
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="agenda-calendario__weekday">
            {label}
          </span>
        ))}
      </div>

      <div className="agenda-calendario__grid">
        {cells.map((cell) => {
          const dateKey = formatDateParam(cell.date);
          const dayReuniones = reunionesByDay.get(dateKey) ?? [];
          const isSelected = selectedDate === dateKey;
          const isToday = todayKey === dateKey;

          return (
            <button
              key={dateKey}
              type="button"
              className={[
                "agenda-calendario__day",
                !cell.inMonth ? "is-outside" : "",
                dayReuniones.length > 0 ? "has-events" : "",
                isSelected ? "is-selected" : "",
                isToday ? "is-today" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelectDate(dateKey)}
              aria-pressed={isSelected}
              aria-label={`${cell.date.getDate()} de ${monthLabel}${
                dayReuniones.length > 0
                  ? `, ${dayReuniones.length} reunión${
                      dayReuniones.length === 1 ? "" : "es"
                    }`
                  : ""
              }`}
            >
              <span className="agenda-calendario__day-number">
                {cell.date.getDate()}
              </span>
              {dayReuniones.length > 0 ? (
                <span className="agenda-calendario__events">
                  {dayReuniones.slice(0, 2).map((reunion) => (
                    <span key={reunion.id} className="agenda-calendario__chip">
                      {reunion.hora} · {reunion.alumna?.nombre ?? "Alumna"}
                    </span>
                  ))}
                  {dayReuniones.length > 2 ? (
                    <span className="agenda-calendario__more">
                      +{dayReuniones.length - 2} más
                    </span>
                  ) : null}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
