/**
 * Хранилище заявок с переключаемым драйвером.
 *
 *  - `kv`    — Upstash Redis / Vercel KV по REST. Нужен на хостингах с
 *              временной файловой системой (Vercel, Netlify, serverless).
 *  - `file`  — JSON-файл в папке проекта. Подходит для локальной работы и для
 *              любого хостинга с постоянным диском (VPS, Docker, Railway).
 *  - `memory` — нет доступного диска и не настроен KV: запись работает,
 *              но живёт только внутри запущенного процесса. Интерфейс об этом
 *              честно предупреждает.
 *
 * Драйвер выбирается сам: если заданы KV_REST_API_URL + KV_REST_API_TOKEN
 * (или UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN) — используется KV.
 *
 * Дополнительно: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID — каждая новая заявка
 * уходит сообщением в Telegram сервиса, чтобы заявка не потерялась.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Booking, BookingInput, BookingStatus, StorageDriverName } from "./types";
import { STATUS_LABELS } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "bookings.json");
const KV_KEY = "sto-centr:bookings";

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TG_CHAT = process.env.TELEGRAM_CHAT_ID || "";

const usingKv = Boolean(KV_URL && KV_TOKEN);
export const telegramConfigured = Boolean(TG_TOKEN && TG_CHAT);

/** На serverless-хостингах папка проекта только для чтения. */
const isServerless = Boolean(process.env.VERCEL);

/** Запоминаем, что диск только для чтения, чтобы не пробовать снова каждый раз. */
let fileWritable = true;

/** Заявки в памяти — только для демо-режима. */
const memoryStore: Booking[] = [];
const memoryMode = isServerless && !usingKv;

export function storageDriver(): StorageDriverName {
  if (usingKv) return "kv";
  if (memoryMode || !fileWritable) return "memory";
  return "file";
}

export function isEphemeralStorage(): boolean {
  return storageDriver() === "memory";
}

/** Очередь записи: два одновременных запроса не перетирают друг друга. */
let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const next = queue.then(task, task);
  queue = next.catch(() => undefined);
  return next;
}

/* ───────────────────────────── KV ───────────────────────────── */

async function kvCommand<T>(command: unknown[]): Promise<T | null> {
  const res = await fetch(KV_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV недоступен: ${res.status}`);
  const data = (await res.json()) as { result?: T };
  return data.result ?? null;
}

/* ───────────────────────────── файл ───────────────────────────── */

async function readFileStore(): Promise<Booking[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    fileWritable = true;
    return Array.isArray(parsed) ? (parsed as Booking[]) : [];
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      fileWritable = true;
      return [];
    }
    if (
      err.code === "EROFS" ||
      err.code === "EACCES" ||
      err.code === "EPERM" ||
      err.code === "ENOTDIR"
    ) {
      fileWritable = false;
      return [];
    }
    /* Битый файл не должен ронять сайт: откладываем его и начинаем заново. */
    if (e instanceof SyntaxError) {
      await writeFile(`${DATA_FILE}.corrupt-${Date.now()}`, "", "utf8").catch(() => undefined);
      return [];
    }
    throw err;
  }
}

async function writeFileStore(bookings: Booking[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(bookings, null, 2), "utf8");
  fileWritable = true;
}

/* ─────────────────────────── общее ─────────────────────────── */

async function readAll(): Promise<Booking[]> {
  if (usingKv) {
    const raw = await kvCommand<string>(["GET", KV_KEY]);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Booking[]) : [];
    } catch {
      return [];
    }
  }
  if (memoryMode) return [...memoryStore];
  const fromFile = await readFileStore();
  return fileWritable ? fromFile : [...memoryStore];
}

async function writeAll(bookings: Booking[]): Promise<void> {
  if (usingKv) {
    await kvCommand(["SET", KV_KEY, JSON.stringify(bookings)]);
    return;
  }
  if (memoryMode || !fileWritable) {
    memoryStore.length = 0;
    memoryStore.push(...bookings);
    return;
  }
  try {
    await writeFileStore(bookings);
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === "EROFS" || err.code === "EACCES" || err.code === "EPERM") {
      /* Диск только для чтения — продолжаем в памяти, но заявку не теряем. */
      memoryStore.length = 0;
      memoryStore.push(...bookings);
      fileWritable = false;
      return;
    }
    throw e;
  }
}

/** Код заявки: STO-ГГММ-NNN, нумерация сбрасывается каждый месяц. */
function makeCode(existing: Booking[], date: string): string {
  const [y, m] = date.split("-");
  const prefix = `STO-${y.slice(2)}${m}-`;
  const max = existing
    .filter((b) => b.code.startsWith(prefix))
    .reduce((acc, b) => Math.max(acc, Number(b.code.slice(prefix.length)) || 0), 0);
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

/* ───────────────────── уведомление в Telegram ───────────────────── */

export function telegramMessage(b: Booking): string {
  return [
    "🔧 Новая заявка с сайта — СТО Центр",
    `№ ${b.code}`,
    "",
    `Услуга: ${b.service}${b.price ? ` (по прайсу ${b.price.toLocaleString("ru-RU")} ₸)` : ""}`,
    `Авто: ${b.vehicleModel}, ${b.vehicleYear}${b.vin ? `, VIN ${b.vin}` : ""}`,
    `Визит: ${b.date} в ${b.time}`,
    "",
    `Клиент: ${b.name}`,
    `Телефон: ${b.phone}`,
    `Связь: ${b.channel}${b.telegram ? ` (@${b.telegram})` : ""}`,
    b.comment ? `Комментарий: ${b.comment}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Уведомление не должно ломать заявку, поэтому ошибки глотаем. */
async function notifyTelegram(b: Booking): Promise<boolean> {
  if (!telegramConfigured) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TG_CHAT, text: telegramMessage(b) }),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

/* ─────────────────────────── публичный API ─────────────────────────── */

export function listBookings(): Promise<Booking[]> {
  return enqueue(async () => {
    const all = await readAll();
    return all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  });
}

export interface CreateResult {
  booking: Booking;
  /** Запись не сохранилась, но заявка ушла в Telegram сервиса */
  deliveredViaTelegramOnly: boolean;
}

export async function createBooking(
  input: BookingInput,
  options?: { demo?: boolean },
): Promise<CreateResult> {
  return enqueue(async () => {
    const all = await readAll();
    const now = new Date().toISOString();
    const booking: Booking = {
      id: `bk_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
      code: makeCode(all, input.date),
      ...input,
      status: "NEW",
      createdAt: now,
      updatedAt: now,
      ...(options?.demo ? { demo: true } : {}),
    };

    const notify = options?.demo ? Promise.resolve(false) : notifyTelegram(booking);

    try {
      all.push(booking);
      await writeAll(all);
      await notify;
      return { booking, deliveredViaTelegramOnly: false };
    } catch (e) {
      const delivered = await notify;
      if (delivered) return { booking, deliveredViaTelegramOnly: true };
      throw e;
    }
  });
}

export function updateBookingStatus(id: string, status: BookingStatus): Promise<Booking | null> {
  return enqueue(async () => {
    const all = await readAll();
    const idx = all.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], status, updatedAt: new Date().toISOString() };
    await writeAll(all);
    return all[idx];
  });
}

export function deleteBooking(id: string): Promise<boolean> {
  return enqueue(async () => {
    const all = await readAll();
    const next = all.filter((b) => b.id !== id);
    if (next.length === all.length) return false;
    await writeAll(next);
    return true;
  });
}

/** Удаляет строки, помеченные как демо/проверочные — реальные заявки не трогает. */
export function clearDemoBookings(): Promise<number> {
  return enqueue(async () => {
    const all = await readAll();
    const real = all.filter((b) => !b.demo);
    const removed = all.length - real.length;
    if (removed > 0) await writeAll(real);
    return removed;
  });
}

export { STATUS_LABELS };
