"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Loader2, LogOut, MessageCircle, Phone, RefreshCw, Trash2 } from "lucide-react";
import { company, formatPrice, primaryWhatsApp } from "@/lib/company";
import { formatIsoHuman } from "@/lib/slots";
import {
  BOOKING_STATUSES,
  STATUS_LABELS,
  type Booking,
  type BookingStatus,
  type StorageDriverName,
} from "@/lib/types";

/**
 * Панель заявок: список обращений с сайта, статусы и быстрые действия.
 * Доступ — по паролю (ADMIN_PASSWORD), сессия в httpOnly-cookie.
 */

const STATUS_TONE: Record<BookingStatus, string> = {
  NEW: "border-brand bg-brand-soft text-ink",
  CONFIRMED: "border-emerald-300 bg-emerald-50 text-emerald-800",
  IN_PROGRESS: "border-amber-300 bg-amber-50 text-amber-800",
  COMPLETED: "border-line bg-white text-muted",
  CANCELLED: "border-red-200 bg-red-50 text-red-700",
};

const FILTERS: { id: "all" | BookingStatus; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "NEW", label: "Новые" },
  { id: "CONFIRMED", label: "Подтверждённые" },
  { id: "IN_PROGRESS", label: "В работе" },
  { id: "COMPLETED", label: "Завершённые" },
  { id: "CANCELLED", label: "Отменённые" },
];

export default function AdminPanel() {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [defaultPassword, setDefaultPassword] = useState(false);
  const [loginDisabled, setLoginDisabled] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [storage, setStorage] = useState<StorageDriverName | null>(null);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | BookingStatus>("NEW");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const res = await fetch("/api/bookings", { cache: "no-store" });
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Ошибка загрузки");
      setBookings(data.bookings as Booking[]);
      setStorage((data.storage as StorageDriverName) ?? null);
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Не удалось загрузить заявки.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/session", { cache: "no-store" });
        const data = await res.json();
        setDefaultPassword(Boolean(data.defaultPasswordInUse));
        setLoginDisabled(Boolean(data.loginDisabled));
        setAuthed(Boolean(data.authenticated));
        if (data.authenticated) await load();
      } catch {
        setAuthed(false);
      } finally {
        setChecking(false);
      }
    })();
  }, [load]);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setLoggingIn(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setLoginError(data.error ?? "Неверный пароль.");
        return;
      }
      setPassword("");
      setAuthed(true);
      await load();
    } catch {
      setLoginError("Нет связи с сервером.");
    } finally {
      setLoggingIn(false);
    }
  }

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthed(false);
    setBookings([]);
  }

  async function setStatus(booking: Booking, status: BookingStatus) {
    setBusyId(booking.id);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Не удалось обновить статус");
      setBookings((list) => list.map((b) => (b.id === booking.id ? (data.booking as Booking) : b)));
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Ошибка обновления.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(booking: Booking) {
    if (!window.confirm(`Удалить заявку ${booking.code}? Действие необратимо.`)) return;
    setBusyId(booking.id);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Не удалось удалить заявку");
      setBookings((list) => list.filter((b) => b.id !== booking.id));
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Ошибка удаления.");
    } finally {
      setBusyId(null);
    }
  }

  async function clearDemo() {
    if (!window.confirm("Удалить все проверочные заявки? Реальные обращения останутся.")) return;
    setLoading(true);
    try {
      await fetch("/api/bookings?demo=1", { method: "DELETE" });
      await load();
    } finally {
      setLoading(false);
    }
  }

  /* ───────────────────────── вход ───────────────────────── */

  if (checking) {
    return (
      <div className="wrap flex min-h-[60vh] items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted" aria-hidden="true" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="wrap flex min-h-[60vh] items-center justify-center py-16">
        <form onSubmit={signIn} className="card w-full max-w-sm p-6">
          <h1 className="text-xl font-extrabold text-ink">Панель заявок</h1>
          <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
            Введите пароль администратора, чтобы увидеть обращения с сайта.
          </p>
          {loginDisabled ? (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-red-300 bg-red-50 p-3 text-[13px] leading-relaxed text-red-800"
            >
              Вход отключён: на этом сайте не задан <b>ADMIN_PASSWORD</b>. Без своего пароля панель
              с заявками клиентов не открывается — так заявки не утекут, даже если адрес панели
              кто-то узнает. Добавьте переменную окружения <b>ADMIN_PASSWORD</b> и перезапустите
              сайт (см. <b>.env.example</b>).
            </p>
          ) : null}

          <label className="mt-5 block">
            <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-ink">
              Пароль
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loginDisabled}
              aria-invalid={loginError ? true : undefined}
              className="field mt-2"
            />
          </label>
          {loginError ? (
            <p role="alert" className="mt-2 text-[13px] font-semibold text-red-700">
              {loginError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loggingIn || loginDisabled}
            className="btn btn-primary mt-4 w-full disabled:opacity-70"
          >
            {loggingIn ? "Проверяем…" : "Войти"}
          </button>
          {defaultPassword ? (
            <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-[13px] leading-relaxed text-amber-900">
              Используется пароль по умолчанию. Задайте <b>ADMIN_PASSWORD</b> в переменных окружения
              перед публикацией сайта — иначе заявки клиентов сможет открыть любой.
            </p>
          ) : null}
        </form>
      </div>
    );
  }

  const visible = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
  const newCount = bookings.filter((b) => b.status === "NEW").length;

  /* ───────────────────────── список ───────────────────────── */

  return (
    <div className="wrap py-8 sm:py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-ink">Заявки с сайта</h1>
          <p className="mt-1 text-[14px] text-muted">
            {bookings.length} всего · {newCount} новых
            {storage ? ` · хранилище: ${storage === "file" ? "файл" : storage === "kv" ? "KV" : "в памяти"}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={load} className="btn btn-outline" disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            Обновить
          </button>
          <button type="button" onClick={signOut} className="btn btn-outline">
            <LogOut className="size-4" aria-hidden="true" />
            Выйти
          </button>
        </div>
      </header>

      {storage === "memory" ? (
        <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-[13px] leading-relaxed text-amber-900">
          Заявки хранятся в памяти процесса и исчезнут при перезапуске. Для боевого сайта настройте
          KV (KV_REST_API_URL + KV_REST_API_TOKEN) или Telegram-доставку.
        </p>
      ) : null}

      {defaultPassword ? (
        <p className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-[13px] leading-relaxed text-amber-900">
          Пароль по умолчанию: задайте <b>ADMIN_PASSWORD</b> в переменных окружения.
        </p>
      ) : null}

      {listError ? (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-[13px] font-semibold text-red-700">
          {listError}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = f.id === "all" ? bookings.length : bookings.filter((b) => b.status === f.id).length;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={[
                "min-h-[44px] rounded-xl border px-3.5 text-[13px] font-bold transition-colors",
                filter === f.id
                  ? "border-brand bg-brand-soft text-ink"
                  : "border-line bg-white text-ink hover:border-ink/30",
              ].join(" ")}
            >
              {f.label} ({count})
            </button>
          );
        })}
        {bookings.some((b) => b.demo) ? (
          <button
            type="button"
            onClick={clearDemo}
            className="min-h-[44px] rounded-xl border border-line bg-white px-3.5 text-[13px] font-bold text-muted transition-colors hover:border-red-300 hover:text-red-700"
          >
            Удалить проверочные
          </button>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-line bg-white p-6 text-center text-[14px] text-muted">
          {bookings.length === 0
            ? "Заявок пока нет. Они появятся здесь сразу после отправки формы на сайте."
            : "В этом статусе заявок нет."}
        </p>
      ) : (
        <ul className="mt-5 flex flex-col gap-3">
          {visible.map((b) => (
            <li key={b.id} className="card p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[13px] font-bold text-ink">{b.code}</span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[12px] font-bold ${STATUS_TONE[b.status]}`}
                    >
                      {STATUS_LABELS[b.status]}
                    </span>
                    {b.demo ? (
                      <span className="rounded-full border border-line bg-white px-2.5 py-0.5 text-[12px] text-muted">
                        проверочная
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 text-[13px] text-muted">
                    Создана {new Date(b.createdAt).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="sr-only" htmlFor={`status-${b.id}`}>
                    Статус заявки {b.code}
                  </label>
                  <select
                    id={`status-${b.id}`}
                    value={b.status}
                    onChange={(e) => setStatus(b, e.target.value as BookingStatus)}
                    disabled={busyId === b.id}
                    className="field max-w-[190px] py-2 text-[14px]"
                  >
                    {BOOKING_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => remove(b)}
                    disabled={busyId === b.id}
                    aria-label={`Удалить заявку ${b.code}`}
                    className="grid size-11 place-items-center rounded-xl border border-line text-muted transition-colors hover:border-red-300 hover:text-red-700"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <dl className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                <Row label="Клиент" value={`${b.name} · ${b.phone}`} />
                <Row label="Связь" value={`${b.channel}${b.telegram ? ` (@${b.telegram})` : ""}`} />
                <Row label="Авто" value={`${b.vehicleModel}, ${b.vehicleYear}${b.vin ? ` · VIN ${b.vin}` : ""}`} />
                <Row label="Визит" value={`${formatIsoHuman(b.date)}, ${b.time}`} />
                <Row
                  label="Услуга"
                  value={`${b.service}${b.price !== null && b.price !== undefined ? ` · ${formatPrice(b.price)}` : ""}`}
                />
                {b.comment ? <Row label="Комментарий" value={b.comment} /> : null}
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                <a href={`tel:${b.phone}`} className="btn btn-primary min-h-[44px] px-4 py-2.5 text-[14px]">
                  <Phone className="size-4" aria-hidden="true" />
                  Позвонить
                </a>
                <a
                  href={`${primaryWhatsApp.href}?text=${encodeURIComponent(
                    `Здравствуйте, ${b.name}! Подтверждаю запись №${b.code} в СТО Центр: ${b.service}, ${formatIsoHuman(b.date)} в ${b.time}.`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline min-h-[44px] px-4 py-2.5 text-[14px]"
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  Подтвердить в WhatsApp
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-[13px] leading-relaxed text-muted">
        {company.name} · {company.address.street}, {company.address.city} · {company.phones[0].label}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-[14px]">
      <dt className="w-28 shrink-0 text-[12px] font-bold uppercase tracking-[0.06em] text-muted">
        {label}
      </dt>
      <dd className="min-w-0 font-semibold text-ink">{value}</dd>
    </div>
  );
}
