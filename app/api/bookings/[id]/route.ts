import { NextResponse } from "next/server";
import { deleteBooking, updateBookingStatus } from "@/lib/bookings";
import { isAuthenticated } from "@/lib/auth";
import { BOOKING_STATUSES, type ApiError, type BookingStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const UNAUTHORISED = { ok: false as const, error: "Требуется вход в панель заявок." };

/** PATCH /api/bookings/:id — смена статуса заявки */
export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json<ApiError>(UNAUTHORISED, { status: 401 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiError>({ ok: false, error: "Некорректный запрос." }, { status: 400 });
  }

  const status = (body as Record<string, unknown> | null)?.status;
  if (typeof status !== "string" || !BOOKING_STATUSES.includes(status as BookingStatus)) {
    return NextResponse.json<ApiError>({ ok: false, error: "Неизвестный статус." }, { status: 400 });
  }

  try {
    const booking = await updateBookingStatus(id, status as BookingStatus);
    if (!booking) {
      return NextResponse.json<ApiError>({ ok: false, error: "Заявка не найдена." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, booking });
  } catch (e) {
    console.error("[bookings:PATCH]", e);
    return NextResponse.json<ApiError>(
      { ok: false, error: "Не удалось обновить заявку." },
      { status: 500 },
    );
  }
}

/** DELETE /api/bookings/:id — удаление заявки */
export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json<ApiError>(UNAUTHORISED, { status: 401 });
  }
  const { id } = await params;
  try {
    const removed = await deleteBooking(id);
    if (!removed) {
      return NextResponse.json<ApiError>({ ok: false, error: "Заявка не найдена." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[bookings:DELETE one]", e);
    return NextResponse.json<ApiError>({ ok: false, error: "Не удалось удалить." }, { status: 500 });
  }
}
