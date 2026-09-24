"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { scheduleLabel, schedule } from "@/lib/company";
import {
  MONTHS_NOMINATIVE,
  WEEKDAYS_SHORT,
  firstFreeSlot,
  formatIsoHuman,
  isDateBookable,
  monthMatrix,
  quickDates,
  shopNow,
  weekdayIndex,
} from "@/lib/slots";

/**
 * Календарь записи, который знает реальный график сервиса из 2ГИС:
 * воскресенья и прошедшие дни недоступны, вперёд — 60 дней.
 */

export default function Calendar({
  value,
  onChange,
}: {
  value: string;
  onChange: (iso: string) => void;
}) {
  const now = useMemo(() => shopNow(), []);
  const quick = useMemo(() => quickDates(now), [now]);

  const [cursor, setCursor] = useState(() => {
    const base = value || now.iso;
    const [y, m] = base.split("-").map(Number);
    return { year: y, month: m - 1 };
  });

  const weeks = useMemo(() => monthMatrix(cursor.year, cursor.month), [cursor]);

  const canGoBack = useMemo(() => {
    const prevMonthEnd = new Date(cursor.year, cursor.month, 0);
    const [y, m, d] = now.iso.split("-").map(Number);
    return prevMonthEnd.getTime() >= new Date(y, m - 1, d).getTime();
  }, [cursor, now.iso]);

  const canGoForward = useMemo(() => {
    const nextMonthStart = new Date(cursor.year, cursor.month + 1, 1);
    const [y, m, d] = now.iso.split("-").map(Number);
    const limit = new Date(y, m - 1, d + 60);
    return nextMonthStart.getTime() <= limit.getTime();
  }, [cursor, now.iso]);

  const shiftMonth = (delta: number) => {
    setCursor((c) => {
      const next = new Date(c.year, c.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  return (
    <div>
      {/* Быстрые варианты: сегодня / завтра / через 3 дня */}
      <div className="mb-4 flex flex-wrap gap-2">
        {quick.map((q) => {
          const selected = value === q.iso;
          return (
            <button
              key={q.label}
              type="button"
              disabled={!q.available}
              aria-pressed={selected}
              onClick={() => onChange(q.iso)}
              className={[
                "min-h-[44px] rounded-xl border px-3.5 text-[13px] font-bold transition-colors",
                selected
                  ? "border-brand bg-brand-soft text-ink"
                  : q.available
                    ? "border-line bg-white text-ink hover:border-ink/30"
                    : "cursor-not-allowed border-line bg-white text-muted/50",
              ].join(" ")}
              title={q.available ? undefined : "В этот день записи нет"}
            >
              {q.label}
            </button>
          );
        })}
      </div>

      {/* На 320px календарю не хватает ширины: уменьшаем внутренние отступы */}
      <div className="rounded-2xl border border-line bg-white p-2 xs:p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            disabled={!canGoBack}
            aria-label="Предыдущий месяц"
            className="grid size-11 place-items-center rounded-xl border border-line text-ink transition-colors hover:border-ink/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <p className="text-[15px] font-extrabold text-ink">
            {MONTHS_NOMINATIVE[cursor.month]} {cursor.year}
          </p>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            disabled={!canGoForward}
            aria-label="Следующий месяц"
            className="grid size-11 place-items-center rounded-xl border border-line text-ink transition-colors hover:border-ink/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS_SHORT.map((day) => (
            <span
              key={day}
              className="py-1 text-center text-[12px] font-bold uppercase tracking-[0.06em] text-muted"
            >
              {day}
            </span>
          ))}
        </div>

        <div
          className="mt-1 grid grid-cols-7 gap-0.5 xs:gap-1"
          role="grid"
          aria-label="Выбор даты визита"
        >
          {weeks.flat().map((iso, index) => {
            if (!iso) return <span key={`empty-${index}`} aria-hidden="true" />;
            const available = isDateBookable(iso, now.iso);
            const selected = value === iso;
            const isToday = iso === now.iso;
            const isSunday = weekdayIndex(iso) === 6;
            return (
              <button
                key={iso}
                type="button"
                role="gridcell"
                disabled={!available}
                aria-selected={selected}
                aria-label={`${formatIsoHuman(iso)}${available ? "" : " — записи нет"}`}
                onClick={() => onChange(iso)}
                className={[
                  "grid h-11 min-w-0 place-items-center rounded-lg text-[14px] font-semibold tabular-nums transition-colors",
                  selected
                    ? "bg-brand text-ink"
                    : available
                      ? "text-ink hover:bg-brand-soft"
                      : isSunday
                        ? "cursor-not-allowed text-muted/40"
                        : "cursor-not-allowed text-muted/50",
                  isToday && !selected ? "ring-1 ring-inset ring-ink/25" : "",
                ].join(" ")}
              >
                {Number(iso.slice(8))}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-muted">
        {value ? (
          <>
            Выбрано: <span className="font-bold text-ink">{formatIsoHuman(value)}</span>
            {firstFreeSlot(value, now) ? `, ближайшее время — ${firstFreeSlot(value, now)}.` : "."}
          </>
        ) : (
          "Выберите день визита."
        )}
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-muted">
        График сервиса: {schedule.map((s) => `${s.short} ${scheduleLabel(s)}`).join(", ")}. Запись
        открыта на 60 дней вперёд.
      </p>
    </div>
  );
}
