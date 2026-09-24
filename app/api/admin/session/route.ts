import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE,
  adminLoginDisabled,
  isAuthenticated,
  sessionToken,
  usingDefaultPassword,
  verifyPassword,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET — есть ли доступ; заодно сообщаем состояние пароля */
export async function GET() {
  return NextResponse.json({
    ok: true,
    authenticated: await isAuthenticated(),
    defaultPasswordInUse: usingDefaultPassword(),
    loginDisabled: adminLoginDisabled(),
  });
}

/** POST — вход по паролю */
export async function POST(request: Request) {
  /* В продакшене без ADMIN_PASSWORD вход закрыт: панель не должна открываться
     известным паролем по умолчанию на опубликованном сайте. */
  if (adminLoginDisabled()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Вход в панель отключён: не задан ADMIN_PASSWORD. Добавьте свою переменную окружения ADMIN_PASSWORD и перезапустите сайт.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректный запрос." }, { status: 400 });
  }

  const password = (body as Record<string, unknown> | null)?.password;
  if (typeof password !== "string" || !verifyPassword(password)) {
    return NextResponse.json({ ok: false, error: "Неверный пароль." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}

/** DELETE — выход */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
