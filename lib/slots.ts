/**
 * Дата и время записи — только внутри реального графика сервиса из 2ГИС:
 * Пн–Пт 09:00–19:00, Сб 09:00–18:00, Вс — выходной.
 *
 * Слоты — почасовые, последний заезд за час до закрытия (09:00–18:00 в будни,
 * 09:00–17:00 в субботу). График в 2ГИС задан часами открытия и закрытия, а
 * гранулярность записи — это уже решение сайта, поэтому она одинаковая и
 * предсказуемая. Точное время мастер подтверждает звонком (об этом есть
 * подпись в форме).
 *
 * Время сервиса — часовой пояс Кокшетау (Asia/Almaty, UTC+5): и на клиенте, и
 * на сервере «сегодня» считается по нему, календарные даты сравниваются
 * строками YYYY-MM-DD (никаких toISOString() — они ломаются восточнее UTC).
 */

import { schedule } from "./company";

export const SHOP_TIMEZONE = "Asia/Almaty";

/** Час в минутах: 09:00 → 540 */
const MINUTES_IN_DAY = 24 * 60;

/** Шаг записи — 1 час */
export const SLOT_STEP_MIN = 60;

/** Последний заезд — за час до закрытия */
const LAST_SLOT_BEFORE_CLOSE_MIN = 60;

/** Сколько минут нужно мастеру до визита (не записываем «через 10 минут») */
export const LEAD_TIME_MIN = 60;

/** Насколько вперёд открыта запись */
export const MAX_DAYS_AHEAD = 60;

export interface DayRule {
  /** Минуты от полуночи */
  open: number;
  close: number;
}

function toMinutes(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/* ───────────────────────── дни недели ───────────────────────── */

/** 0 = понедельник … 6 = воскресенье (порядок как в графике из 2ГИС) */
export function weekdayIndex(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  const jsDay = new Date(y, m - 1, d).getDay(); // 0 = воскресенье
  return (jsDay + 6) % 7;
}

export function ruleForIso(iso: string): DayRule | null {
  const item = schedule[weekdayIndex(iso)];
  if (!item || !item.from || !item.to) return null;
  return { open: toMinutes(item.from), close: toMinutes(item.to) };
}

export function isWorkday(iso: string): boolean {
  return ruleForIso(iso) !== null;
}

/* ───────────────────────── календарь ───────────────────────── */

export function isoOf(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return isoOf(new Date(y, m - 1, d + days));
}

export function diffDays(fromIso: string, toIso: string): number {
  const [y1, m1, d1] = fromIso.split("-").map(Number);
  const [y2, m2, d2] = toIso.split("-").map(Number);
  const a = Date.UTC(y1, m1 - 1, d1);
  const b = Date.UTC(y2, m2 - 1, d2);
  return Math.round((b - a) / 86_400_000);
}

/** «Сегодня» и текущее время по часам сервиса (Кокшетау). */
export function shopNow(now: Date = new Date()): { iso: string; minutes: number } {
  const dayFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: SHOP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const timeFmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: SHOP_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const iso = dayFmt.format(now);
  /* If a server runs with a trimmed ICU the timezone may fall back to UTC —
     the field is still numeric, so parsing stays safe. */
  const [h, m] = timeFmt.format(now).split(":").map(Number);
  const minutes = (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
  return { iso, minutes: minutes % MINUTES_IN_DAY };
}

/** Первый рабочий день, начиная с переданной даты (включительно). */
export function nextWorkdayIso(fromIso: string): string {
  let iso = fromIso;
  for (let i = 0; i < 14; i += 1) {
    if (isWorkday(iso)) return iso;
    iso = addDays(iso, 1);
  }
  return fromIso;
}

/** Можно ли вообще записаться на эту дату. */
export function isDateBookable(iso: string, todayIso: string): boolean {
  const delta = diffDays(todayIso, iso);
  return delta >= 0 && delta <= MAX_DAYS_AHEAD && isWorkday(iso);
}

/* ───────────────────────── слоты времени ───────────────────────── */

export interface SlotOption {
  time: string;
  available: boolean;
}

/**
 * Слоты на дату. Прошедшие слоты (с учётом запаса LEAD_TIME_MIN) недоступны —
 * это касается только сегодняшнего дня.
 */
export function slotsForIso(
  iso: string,
  now: { iso: string; minutes: number } = shopNow(),
): SlotOption[] {
  const rule = ruleForIso(iso);
  if (!rule) return [];
  if (diffDays(now.iso, iso) < 0) return [];

  const last = rule.close - LAST_SLOT_BEFORE_CLOSE_MIN;
  const slots: SlotOption[] = [];
  for (let minute = rule.open; minute <= last; minute += SLOT_STEP_MIN) {
    const isToday = iso === now.iso;
    const available = !isToday || minute >= now.minutes + LEAD_TIME_MIN;
    slots.push({ time: minutesToLabel(minute), available });
  }
  return slots;
}

export function firstFreeSlot(
  iso: string,
  now: { iso: string; minutes: number } = shopNow(),
): string | null {
  const slot = slotsForIso(iso, now).find((s) => s.available);
  return slot ? slot.time : null;
}

/* ───────────────────────── подписи дат ───────────────────────── */

const WEEKDAYS_LONG = [
  "понедельник",
  "вторник",
  "среда",
  "четверг",
  "пятница",
  "суббота",
  "воскресенье",
];

const MONTHS_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

export function formatIsoHuman(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${WEEKDAYS_LONG[weekdayIndex(iso)]}, ${d} ${MONTHS_GENITIVE[m - 1]}`;
}

export function formatIsoShort(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  const short = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"][weekdayIndex(iso)];
  return `${short}, ${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}`;
}

export const MONTHS_NOMINATIVE = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

export const WEEKDAYS_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

/**
 * Сетка месяца для календаря: массив недель по 7 элементов.
 * `null` — день вне месяца.
 */
export function monthMatrix(year: number, monthIndex: number): (string | null)[][] {
  const firstIso = isoOf(new Date(year, monthIndex, 1));
  const lead = weekdayIndex(firstIso); // сколько пустых клеток до 1-го числа
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const cells: (string | null)[] = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(isoOf(new Date(year, monthIndex, day)));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Быстрые варианты даты для записи: сегодня / завтра / через пару дней. */
export function quickDates(now: { iso: string; minutes: number } = shopNow()): {
  label: string;
  iso: string;
  available: boolean;
}[] {
  const build = (label: string, offset: number) => {
    const iso = addDays(now.iso, offset);
    return {
      label,
      iso,
      available: isDateBookable(iso, now.iso) && firstFreeSlot(iso, now) !== null,
    };
  };
  return [build("Сегодня", 0), build("Завтра", 1), build("Через 3 дня", 3)];
}
