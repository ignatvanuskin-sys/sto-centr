import { NextResponse } from "next/server";
import { createBooking, clearDemoBookings, listBookings, storageDriver } from "@/lib/bookings";
import { validateBooking } from "@/lib/validation";
import { isAuthenticated } from "@/lib/auth";
import { company } from "@/lib/company";
import type { ApiError, CreateBookingResponse, ListBookingsResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UNAUTHORISED = { ok: false as const, error: "Требуется вход в панель заявок." };
const PHONE_HINT = company.phones[0].label;

/** GET /api/bookings — список заявок (панель, нужен вход) */
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json<ApiError>(UNAUTHORISED, { status: 401 });
  }
  try {
    const bookings = await listBookings();
    return NextResponse.json<ListBookingsResponse>({
      ok: true,
      bookings,
      storage: storageDriver(),
    });
  } catch (e) {
    console.error("[bookings:GET]", e);
    return NextResponse.json<ApiError>(
      { ok: false, error: "Не удалось прочитать список заявок." },
      { status: 500 },
    );
  }
}

/** POST /api/bookings — заявка с сайта */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json<ApiError>({ ok: false, error: "Некорректный запрос." }, { status: 400 });
  }

  /*
   * Ловушка для ботов: скрытое поле hp_nickname люди не видят и не заполняют.
   * Отвечаем 200, чтобы бот не понял отказа, но заявку не создаём. Имя поля
   * выбрано так, чтобы автозаполнение браузера не подставляло туда значения
   * (для настоящих посетителей это выглядело бы как «зависла отправка»),
   * поэтому флаг silent позволяет клиенту показать понятный текст.
   */
  if (typeof payload === "object" && payload !== null) {
    const trap = (payload as Record<string, unknown>).hp_nickname;
    if (typeof trap === "string" && trap.length > 0) {
      return NextResponse.json({ ok: true, booking: null, silent: true }, { status: 200 });
    }
  }

  const { ok, errors, value } = validateBooking(payload);
  if (!ok || !value) {
    return NextResponse.json<ApiError>(
      { ok: false, error: "Проверьте выделенные поля.", fields: errors },
      { status: 400 },
    );
  }

  const wantsDemo =
    typeof payload === "object" &&
    payload !== null &&
    (payload as Record<string, unknown>).demo === true;

  try {
    const { booking, deliveredViaTelegramOnly } = await createBooking(value, { demo: wantsDemo });
    return NextResponse.json<CreateBookingResponse>(
      { ok: true, booking, deliveredViaTelegramOnly },
      { status: 201 },
    );
  } catch (e) {
    console.error("[bookings:POST]", e);
    return NextResponse.json<ApiError>(
      {
        ok: false,
        error: `Не удалось сохранить заявку. Попробуйте ещё раз или позвоните: ${PHONE_HINT}.`,
      },
      { status: 500 },
    );
  }
}

/** DELETE /api/bookings?demo=1 — удаление только проверочных записей */
export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json<ApiError>(UNAUTHORISED, { status: 401 });
  }
  const url = new URL(request.url);
  if (url.searchParams.get("demo") !== "1") {
    return NextResponse.json<ApiError>(
      { ok: false, error: "Массовое удаление доступно только для проверочных заявок." },
      { status: 400 },
    );
  }
  try {
    const removed = await clearDemoBookings();
    return NextResponse.json({ ok: true, removed });
  } catch (e) {
    console.error("[bookings:DELETE]", e);
    return NextResponse.json<ApiError>(
      { ok: false, error: "Не удалось очистить проверочные заявки." },
      { status: 500 },
    );
  }
}
