/**
 * Валидация заявки — одна и та же на клиенте и на сервере.
 * Клиент показывает ошибку рядом с полем, сервер не принимает мусор.
 */

import { allServices, company } from "./company";
import { CONTACT_CHANNELS, SERVICE_OTHER, type BookingInput, type ContactChannel } from "./types";
import { isDateBookable, shopNow, slotsForIso } from "./slots";

export interface ValidationResult {
  ok: boolean;
  errors: Record<string, string>;
  value?: BookingInput;
}

const SERVICE_NAMES = new Set(allServices.map((s) => s.name));

/** Только цифры */
export function digitsOf(value: string): string {
  return value.replace(/\D+/g, "");
}

/** +7 700 706 22 20 — как принято в Казахстане */
export function formatPhone(raw: string): string {
  const digits = digitsOf(raw).slice(0, 11);
  if (!digits) return "";
  const local = digits.startsWith("7") || digits.startsWith("8") ? digits.slice(1) : digits;
  const parts = [
    "+7",
    local.slice(0, 3),
    local.slice(3, 6),
    local.slice(6, 8),
    local.slice(8, 10),
  ].filter(Boolean);
  return parts.join(" ");
}

/** Нормализованный вид для хранения: +7XXXXXXXXXX */
export function normalisePhone(raw: string): string {
  const digits = digitsOf(raw);
  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) {
    return `+7${digits.slice(1)}`;
  }
  if (digits.length === 10 && digits.startsWith("7")) return `+7${digits}`;
  if (digits.length === 10) return `+7${digits}`;
  return `+${digits}`;
}

/** Кириллица, которая выглядит как латиница: люди часто копируют VIN с русской раскладкой */
const CYRILLIC_TO_LATIN: Record<string, string> = {
  А: "A",
  В: "B",
  Е: "E",
  К: "K",
  М: "M",
  Н: "H",
  О: "O",
  Р: "P",
  С: "C",
  Т: "T",
  У: "Y",
  Х: "X",
};

/** VIN: 17 символов, без I/O/Q — принимаем 11–17, регистр и раскладка не важны */
export function normaliseVin(raw: string): string {
  return raw
    .toUpperCase()
    .split("")
    .map((char) => CYRILLIC_TO_LATIN[char] ?? char)
    .join("")
    .replace(/[^A-HJ-NPR-Z0-9]/g, "")
    .slice(0, 17);
}

export function isValidVin(vin: string): boolean {
  return /^[A-HJ-NPR-Z0-9]{11,17}$/.test(vin);
}

export function priceOf(service: string): number | null {
  return allServices.find((s) => s.name === service)?.price ?? null;
}

const CURRENT_YEAR = Number(shopNow().iso.slice(0, 4));
export const YEAR_OPTIONS: string[] = Array.from(
  { length: Math.max(0, CURRENT_YEAR + 1 - 1990) },
  (_, i) => String(CURRENT_YEAR + 1 - i),
);

export const VEHICLE_BRANDS: readonly string[] = company.brands;

/** Поля одного шага — чтобы форма могла проверять шаг отдельно */
export type StepIndex = 0 | 1 | 2 | 3 | 4;

export function validateStep(
  step: StepIndex,
  input: Partial<BookingInput>,
  now = shopNow(),
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (step === 0) {
    const service = (input.service ?? "").trim();
    if (!service) errors.service = "Выберите услугу — так мастер сразу поймёт объём работ.";
    else if (service !== SERVICE_OTHER && !SERVICE_NAMES.has(service)) {
      errors.service = "Такой услуги нет в прайсе сервиса. Выберите пункт из списка.";
    }
  }

  if (step === 1) {
    const model = (input.vehicleModel ?? "").trim();
    if (model.length < 2) errors.vehicleModel = "Укажите марку и модель, например Mercedes-Benz E-Класс.";
    else if (model.length > 60) errors.vehicleModel = "Слишком длинно — до 60 символов.";

    const year = (input.vehicleYear ?? "").trim();
    if (!year) errors.vehicleYear = "Укажите год выпуска.";
    else if (!/^\d{4}$/.test(year) || Number(year) < 1950 || Number(year) > CURRENT_YEAR + 1) {
      errors.vehicleYear = `Год — четыре цифры, от 1950 до ${CURRENT_YEAR + 1}.`;
    }

    const vin = (input.vin ?? "").trim();
    if (vin && !isValidVin(vin)) {
      errors.vin = "VIN — 11–17 символов (латиница и цифры, без I, O, Q). Поле можно оставить пустым.";
    }

    const comment = (input.comment ?? "").trim();
    if (comment.length > 500) errors.comment = "Опишите короче — до 500 символов.";
  }

  if (step === 2) {
    const date = (input.date ?? "").trim();
    if (!date) errors.date = "Выберите дату визита.";
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.date = "Некорректная дата.";
    else if (!isDateBookable(date, now.iso)) {
      errors.date = "В этот день сервис не работает. Выберите другую дату.";
    }
  }

  if (step === 3) {
    const time = (input.time ?? "").trim();
    const date = (input.date ?? "").trim();
    if (!time) errors.time = "Выберите время визита.";
    else if (!date) errors.time = "Сначала выберите дату.";
    else {
      const slot = slotsForIso(date, now).find((s) => s.time === time);
      if (!slot) errors.time = "Такого времени нет в графике сервиса.";
      else if (!slot.available) errors.time = "Это время уже прошло — выберите другое.";
    }
  }

  if (step === 4) {
    const name = (input.name ?? "").trim();
    if (name.length < 2) errors.name = "Как к вам обращаться?";
    else if (name.length > 80) errors.name = "Слишком длинно — до 80 символов.";

    const digits = digitsOf(input.phone ?? "");
    if (digits.length < 11) errors.phone = "Телефон в формате +7 700 000 00 00.";
    else if (!/^7\d{10}$/.test(digits.replace(/^8/, "7"))) {
      errors.phone = "Проверьте номер — нужны 11 цифр.";
    }

    const channel = input.channel as ContactChannel | undefined;
    if (!channel || !CONTACT_CHANNELS.includes(channel)) {
      errors.channel = "Выберите, как удобнее связаться.";
    }

    if (channel === "Telegram") {
      const tg = (input.telegram ?? "").trim().replace(/^@/, "");
      if (!tg) errors.telegram = "Укажите ник в Telegram, например @username.";
      else if (!/^[A-Za-z0-9_]{4,32}$/.test(tg)) {
        errors.telegram = "Ник — 4–32 символа: латиница, цифры и подчёркивание.";
      }
    }
  }

  return errors;
}

/** Полная проверка перед отправкой (используется и на сервере) */
export function validateBooking(
  payload: unknown,
  now = shopNow(),
): ValidationResult {
  if (typeof payload !== "object" || payload === null) {
    return { ok: false, errors: { form: "Некорректный запрос." } };
  }
  const raw = payload as Record<string, unknown>;
  const asString = (key: string): string =>
    typeof raw[key] === "string" ? (raw[key] as string).trim() : "";

  const draft: Partial<BookingInput> = {
    name: asString("name"),
    phone: asString("phone"),
    channel: (asString("channel") || "Телефон") as ContactChannel,
    telegram: asString("telegram").replace(/^@/, "") || undefined,
    vehicleModel: asString("vehicleModel"),
    vehicleYear: asString("vehicleYear"),
    vin: normaliseVin(asString("vin")) || undefined,
    service: asString("service"),
    date: asString("date"),
    time: asString("time"),
    comment: asString("comment") || undefined,
  };

  const errors = {
    ...validateStep(0, draft, now),
    ...validateStep(1, draft, now),
    ...validateStep(2, draft, now),
    ...validateStep(3, draft, now),
    ...validateStep(4, draft, now),
  };

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const value: BookingInput = {
    name: draft.name!.trim(),
    phone: normalisePhone(draft.phone!),
    channel: draft.channel!,
    telegram: draft.telegram,
    vehicleModel: draft.vehicleModel!.trim(),
    vehicleYear: draft.vehicleYear!.trim(),
    vin: draft.vin,
    service: draft.service!,
    price: priceOf(draft.service!),
    date: draft.date!,
    time: draft.time!,
    comment: draft.comment?.trim() || undefined,
  };

  return { ok: true, errors: {}, value };
}
