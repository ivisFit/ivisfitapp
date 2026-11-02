"use client";

import { useMemo, useState } from "react";
import type { ChallengeDay, ChallengeDayState } from "@/features/alumna/lib/rutina-day";
import { getTodayDateKey } from "@/features/alumna/lib/rutina-day";

const WEEKDAYS = [
  { key: "lun", short: "L", label: "Lunes" },
  { key: "mar", short: "M", label: "Martes" },
  { key: "mie", short: "M", label: "Miércoles" },
  { key: "jue", short: "J", label: "Jueves" },
  { key: "vie", short: "V", label: "Viernes" },
  { key: "sab", short: "S", label: "Sábado" },
  { key: "dom", short: "D", label: "Domingo" },
] as const;

type MonthCursor = {
  year: number;
  month: number;
};

type CalendarCell = {
  dateKey: string;
  dayNumber: number;
  inMonth: boolean;
};

type PlanMonthCalendarProps = {
  days: ChallengeDay[];
  onSelectDay: (day: ChallengeDay) => void;
};

function parseDateKey(dateKey: string): MonthCursor | null {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(dateKey);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) - 1 };
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function monthCursorFromDays(days: ChallengeDay[]): MonthCursor {
  const todayParsed = parseDateKey(getTodayDateKey());
  const planTouchesThisMonth = todayParsed
    ? days.some((day) => {
        const parsed = parseDateKey(day.dateKey);
        return (
          parsed?.year === todayParsed.year && parsed.month === todayParsed.month
        );
      })
    : false;

  if (todayParsed && (planTouchesThisMonth || days.length === 0)) {
    return todayParsed;
  }

  const anchor = days.find((day) => day.isToday)?.dateKey ?? days[0]?.dateKey;
  const parsed = anchor ? parseDateKey(anchor) : null;
  if (parsed) return parsed;

  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

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
      dateKey: formatDateKey(date.getFullYear(), date.getMonth(), date.getDate()),
      dayNumber: date.getDate(),
      inMonth: date.getMonth() === month,
    };
  });
}

function chipVariant(state: ChallengeDayState): "completed" | "missed" | "open" | "locked" {
  if (state === "completed") return "completed";
  if (state === "missed") return "missed";
  if (state === "locked") return "locked";
  return "open";
}

function stateLabel(state: ChallengeDayState): string {
  if (state === "completed") return "completo";
  if (state === "missed") return "no hecho";
  if (state === "locked") return "más adelante";
  return "pendiente";
}

export function PlanMonthCalendar({ days, onSelectDay }: PlanMonthCalendarProps) {
  const [cursor, setCursor] = useState(() => monthCursorFromDays(days));
  const todayKey = getTodayDateKey();
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString(
    "es-UY",
    { month: "long", year: "numeric" },
  );
  const cells = buildCalendarCells(cursor.year, cursor.month);
  const daysByDate = useMemo(() => {
    const map = new Map<string, ChallengeDay>();
    for (const day of days) map.set(day.dateKey, day);
    return map;
  }, [days]);

  function shiftMonth(delta: number) {
    setCursor((current) => {
      const next = new Date(current.year, current.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  return (
    <section className="plan-month" aria-label="Calendario del plan">
      <div className="plan-month__header">
        <button
          type="button"
          className="plan-month__nav"
          onClick={() => shiftMonth(-1)}
          aria-label="Mes anterior"
        >
          ‹
        </button>
        <h3 className="plan-month__title">{monthLabel}</h3>
        <button
          type="button"
          className="plan-month__nav"
          onClick={() => shiftMonth(1)}
          aria-label="Mes siguiente"
        >
          ›
        </button>
      </div>

      <div className="plan-month__weekdays" aria-hidden>
        {WEEKDAYS.map((weekday) => (
          <span key={weekday.key} className="plan-month__weekday" title={weekday.label}>
            {weekday.short}
          </span>
        ))}
      </div>

      <div className="plan-month__grid">
        {cells.map((cell) => {
          const planDay = daysByDate.get(cell.dateKey);
          const isToday = cell.dateKey === todayKey;
          const className = [
            "plan-month__day",
            cell.inMonth ? "" : "is-outside",
            isToday ? "is-today" : "",
            planDay ? "has-plan" : "is-empty",
            planDay ? `is-${planDay.state}` : "",
          ]
            .filter(Boolean)
            .join(" ");

          if (!planDay) {
            return (
              <div key={cell.dateKey} className={className}>
                <span className="plan-month__number">{cell.dayNumber}</span>
              </div>
            );
          }

          const locked = planDay.state === "locked";
          const variant = chipVariant(planDay.state);

          return (
            <button
              key={cell.dateKey}
              type="button"
              className={className}
              disabled={locked}
              onClick={() => onSelectDay(planDay)}
              aria-label={`${cell.dayNumber} de ${monthLabel}, ${planDay.title}, ${stateLabel(planDay.state)}${
                isToday ? ", hoy" : ""
              }`}
            >
              <span className="plan-month__number">{cell.dayNumber}</span>
              <span className={`plan-month__chip plan-month__chip--${variant}`}>
                {variant === "completed" ? (
                  <span className="plan-month__check" aria-hidden>
                    ✓
                  </span>
                ) : null}
                <span className="plan-month__chip-label">{planDay.title}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
