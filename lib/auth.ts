/**
 * Доступ в панель заявок.
 *
 * Пароль берётся только из ADMIN_PASSWORD. В продакшене без заданной переменной
 * вход закрыт полностью: иначе на опубликованном сайте с известным паролем
 * по умолчанию кто угодно прочитал бы заявки клиентов (имя, телефон, авто).
 * Локально (`npm run dev`) работает демо-пароль, о нём интерфейс предупреждает.
 *
 * Сессия — httpOnly-cookie со сроком жизни и HMAC-подписью: подделать
 * значение без ADMIN_SECRET нельзя.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "sto_center_admin";
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12 часов

const DEFAULT_PASSWORD = "sto-centr";

function envPassword(): string | null {
  return process.env.ADMIN_PASSWORD?.trim() || null;
}

/** Пароль, который сейчас принимается. null — вход невозможен. */
function adminPassword(): string | null {
  const fromEnv = envPassword();
  if (fromEnv) return fromEnv;
  /* Прод не отдаёт заявки без явно заданного пароля */
  if (process.env.NODE_ENV === "production") return null;
  return DEFAULT_PASSWORD;
}

function secret(): string {
  return process.env.ADMIN_SECRET?.trim() || `sto-centr:${envPassword() ?? DEFAULT_PASSWORD}`;
}

/** Вход закрыт: пароль не задан и это продакшен */
export function adminLoginDisabled(): boolean {
  return adminPassword() === null;
}

/** Работает демо-пароль (только вне продакшена) */
export function usingDefaultPassword(): boolean {
  return envPassword() === null && adminPassword() !== null;
}

function sign(expiresAt: number): string {
  return createHmac("sha256", secret()).update(String(expiresAt)).digest("hex");
}

export function sessionToken(): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  return `${expiresAt}.${sign(expiresAt)}`;
}

export function verifyPassword(candidate: string): boolean {
  const expected = adminPassword();
  if (!expected) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const raw = store.get(ADMIN_COOKIE)?.value;
  if (!raw) return false;

  const [expiresRaw, signature] = raw.split(".");
  const expiresAt = Number(expiresRaw);
  if (!Number.isFinite(expiresAt) || !signature) return false;
  if (expiresAt < Date.now()) return false;

  const expected = sign(expiresAt);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
