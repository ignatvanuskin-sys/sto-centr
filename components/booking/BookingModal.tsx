"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Check, ChevronLeft, Loader2, MessageCircle, Phone, X } from "lucide-react";
import { company, formatPrice, primaryPhone, primaryWhatsApp } from "@/lib/company";
import { CONTACT_CHANNELS, type Booking, type ContactChannel } from "@/lib/types";
import {
  YEAR_OPTIONS,
  VEHICLE_BRANDS,
  formatPhone,
  normaliseVin,
  priceOf,
  validateStep,
  type StepIndex,
} from "@/lib/validation";
import { formatIsoHuman, shopNow, slotsForIso } from "@/lib/slots";
import Calendar from "./Calendar";
import ServicePicker from "./ServicePicker";
import { ChoiceButton, ErrorText, Field, Honeypot, StepTitle, SummaryRow } from "./ui";
import { useBooking } from "./BookingContext";

/**
 * Онлайн-запись: 5 шагов (услуга → авто → дата → время → контакты) и экран
 * подтверждения. На телефоне — полноэкранная панель, на десктопе — диалог.
 */

const STEPS = ["Услуга", "Автомобиль", "Дата", "Время", "Контакты"] as const;

interface FormState {
  service: string;
  vehicleModel: string;
  vehicleYear: string;
  vin: string;
  comment: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  channel: ContactChannel;
  telegram: string;
}

const EMPTY: FormState = {
  service: "",
  vehicleModel: "",
  vehicleYear: "",
  vin: "",
  comment: "",
  date: "",
  time: "",
  name: "",
  phone: "",
  channel: "Телефон",
  telegram: "",
};

export default function BookingModal() {
  const { isOpen, presetService, close } = useBooking();

  const [step, setStep] = useState<StepIndex>(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<Booking | null>(null);
  const [telegramOnly, setTelegramOnly] = useState(false);
  const [trap, setTrap] = useState("");

  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  /* Синхронный замок: `submitting` выставляет disabled только на следующем
     рендере, поэтому два быстрых тапа могли уйти двумя заявками. */
  const submitLock = useRef(false);

  /* Время сервиса (Кокшетау). Пересчитываем при каждом открытии формы,
     чтобы «сегодня» и занятые слоты не устарели на долго открытой вкладке. */
  const [now, setNow] = useState(() => shopNow());
  const slots = useMemo(() => (form.date ? slotsForIso(form.date, now) : []), [form.date, now]);

  /* Сброс состояния при открытии + подстановка услуги из карточки */
  useEffect(() => {
    if (!isOpen) return;
    setNow(shopNow());
    setStep(0);
    setErrors({});
    setServerError(null);
    setDone(null);
    setTelegramOnly(false);
    setSubmitting(false);
    setTrap("");
    submitLock.current = false;
    setForm({ ...EMPTY, service: presetService ?? "" });
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
  }, [isOpen, presetService]);

  /* Блокировка прокрутки страницы, Escape и возврат фокуса */
  useEffect(() => {
    if (!isOpen) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    /* Блокируем и body, и html: иначе полоса прокрутки страницы остаётся
       видимой и модалка не занимает всю ширину экрана. */
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.removeEventListener("keydown", onKeyDown);
      restoreFocusRef.current?.focus?.();
    };
  }, [isOpen, close]);

  /* Каждый шаг начинается сверху */
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [step, done]);

  if (!isOpen) return null;

  const patch = (part: Partial<FormState>) => setForm((f) => ({ ...f, ...part }));

  /* Фокус не должен уезжать на страницу под модалкой */
  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const nodes = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((node) => node.offsetParent !== null);
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function goNext() {
    const stepErrors = validateStep(step, form, now);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;
    setServerError(null);
    setStep((s) => Math.min(4, s + 1) as StepIndex);
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(0, s - 1) as StepIndex);
  }

  async function submit() {
    if (submitLock.current || submitting) return;

    const stepErrors = validateStep(4, form, now);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;

    /* Повторная проверка предыдущих шагов: пользователь мог вернуться назад */
    const all = {
      ...validateStep(0, form, now),
      ...validateStep(1, form, now),
      ...validateStep(2, form, now),
      ...validateStep(3, form, now),
    };
    if (Object.keys(all).length > 0) {
      setErrors(all);
      if (all.service) setStep(0);
      else if (all.vehicleModel || all.vehicleYear || all.vin) setStep(1);
      else if (all.date) setStep(2);
      else setStep(3);
      return;
    }

    submitLock.current = true;
    setSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: form.service,
          vehicleModel: form.vehicleModel,
          vehicleYear: form.vehicleYear,
          vin: form.vin || undefined,
          comment: form.comment || undefined,
          date: form.date,
          time: form.time,
          name: form.name,
          phone: form.phone,
          channel: form.channel,
          telegram: form.channel === "Telegram" ? form.telegram : undefined,
          /* Ловушка для ботов */
          hp_nickname: trap,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrors(data.fields ?? {});
        setServerError(
          data.error ??
            `Не удалось отправить заявку. Попробуйте ещё раз или позвоните: ${primaryPhone.label}.`,
        );
        setSubmitting(false);
        submitLock.current = false;
        return;
      }

      /* Сервер ответил 200 без заявки: сработала скрытая проверка на ботов
         (у человека такое бывает при автозаполнении). Без этой ветки форма
         просто «зависала» на последнем шаге без объяснения. */
      if (!data.booking) {
        setServerError(
          `Не удалось отправить заявку через сайт. Позвоните: ${primaryPhone.label} — или отправьте её в WhatsApp, мы всё оформим.`,
        );
        setSubmitting(false);
        submitLock.current = false;
        return;
      }

      setDone(data.booking as Booking);
      setTelegramOnly(Boolean(data.deliveredViaTelegramOnly));
      setSubmitting(false);
    } catch {
      setServerError(
        `Нет связи с сервером. Проверьте интернет или позвоните: ${primaryPhone.label} — мы примем запись по телефону.`,
      );
      setSubmitting(false);
      submitLock.current = false;
    }
  }

  const price = priceOf(form.service);
  const progress = done ? 5 : step;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/70 sm:items-center sm:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Онлайн-запись в СТО Центр"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="relative flex max-h-[100dvh] w-full flex-col overflow-hidden bg-paper outline-none sm:max-h-[92vh] sm:max-w-3xl sm:rounded-3xl"
      >
        {/* Шапка: прогресс + закрытие */}
        <div className="flex shrink-0 items-center justify-between gap-3 bg-ink px-4 py-3.5 pr-2 text-white sm:px-6">
          <div className="min-w-0">
            <p className="text-[15px] font-extrabold leading-tight">Онлайн-запись</p>
            <p className="mt-0.5 truncate text-[12px] text-white/70">
              {done ? "Готово" : `${STEPS[step]} · шаг ${step + 1} из 5`}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Закрыть запись"
            className="grid size-11 shrink-0 place-items-center rounded-xl text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* Полоса прогресса */}
        <div className="flex shrink-0 gap-1 bg-ink px-4 pb-3 sm:px-6" aria-hidden="true">
          {STEPS.map((label, index) => (
            <span
              key={label}
              className={`h-1 flex-1 rounded-full ${
                index <= progress ? "bg-brand" : "bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* Контент шага */}
        <div
          ref={contentRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-6"
        >
          {done ? (
            <SuccessPanel
              booking={done}
              telegramOnly={telegramOnly}
              onClose={close}
            />
          ) : (
            <>
              <Honeypot value={trap} onChange={setTrap} />

              {step === 0 && (
                <section>
                  <StepTitle
                    title="Что нужно сделать с автомобилем?"
                    text="Выберите услугу из прайса сервиса — стоимость подставим оттуда, а мастер подтвердит её после осмотра."
                  />
                  <ServicePicker
                    value={form.service}
                    onChange={(service) => {
                      patch({ service });
                      setErrors((e) => ({ ...e, service: "" }));
                    }}
                  />
                  {errors.service ? <ErrorText>{errors.service}</ErrorText> : null}
                </section>
              )}

              {step === 1 && (
                <section>
                  <StepTitle
                    title="Расскажите про автомобиль"
                    text="Марка, год и VIN помогают мастеру подготовиться и подобрать запчасти."
                  />
                  <div className="flex flex-col gap-5">
                    <div>
                      <Field label="Марка и модель" required>
                        <input
                          list="sto-brands"
                          value={form.vehicleModel}
                          onChange={(e) => patch({ vehicleModel: e.target.value })}
                          placeholder="Например, Kia Rio"
                          autoComplete="off"
                          aria-invalid={errors.vehicleModel ? true : undefined}
                          className="field"
                        />
                      </Field>
                      <datalist id="sto-brands">
                        {VEHICLE_BRANDS.map((brand) => (
                          <option key={brand} value={brand} />
                        ))}
                      </datalist>
                      {errors.vehicleModel ? <ErrorText>{errors.vehicleModel}</ErrorText> : null}
                    </div>

                    <div>
                      <Field label="Год выпуска" required>
                        <select
                          value={form.vehicleYear}
                          onChange={(e) => patch({ vehicleYear: e.target.value })}
                          aria-invalid={errors.vehicleYear ? true : undefined}
                          className="field"
                        >
                          <option value="">Выберите год</option>
                          {YEAR_OPTIONS.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </Field>
                      {errors.vehicleYear ? <ErrorText>{errors.vehicleYear}</ErrorText> : null}
                    </div>

                    <div>
                      <Field label="VIN" hint="не обязательно">
                        <input
                          value={form.vin}
                          onChange={(e) => patch({ vin: normaliseVin(e.target.value) })}
                          placeholder="17 символов, латиница"
                          maxLength={17}
                          autoCapitalize="characters"
                          autoComplete="off"
                          aria-invalid={errors.vin ? true : undefined}
                          className="field uppercase"
                        />
                      </Field>
                      {errors.vin ? <ErrorText>{errors.vin}</ErrorText> : null}
                    </div>

                    <div>
                      <Field label="Что беспокоит?" hint={`${form.comment.length}/500`}>
                        <textarea
                          value={form.comment}
                          onChange={(e) => patch({ comment: e.target.value.slice(0, 500) })}
                          rows={3}
                          placeholder="Стук в подвеске на кочках, горит Check Engine…"
                          aria-invalid={errors.comment ? true : undefined}
                          className="field resize-y"
                        />
                      </Field>
                      {errors.comment ? <ErrorText>{errors.comment}</ErrorText> : null}
                    </div>
                  </div>
                </section>
              )}

              {step === 2 && (
                <section>
                  <StepTitle
                    title="Когда удобно приехать?"
                    text="Запись идёт по графику сервиса: Пн–Пт 09:00–19:00, Сб 09:00–18:00. Воскресенье — выходной."
                  />
                  <Calendar
                    value={form.date}
                    onChange={(iso) => {
                      patch({ date: iso, time: "" });
                      setErrors((e) => ({ ...e, date: "" }));
                    }}
                  />
                  {errors.date ? <ErrorText>{errors.date}</ErrorText> : null}
                </section>
              )}

              {step === 3 && (
                <section>
                  <StepTitle
                    title="Выберите время визита"
                    text="Слоты — по часам, последний заезд за час до закрытия. Точное время мастер подтвердит звонком."
                  />
                  {!form.date ? (
                    <p className="rounded-xl border border-line bg-white p-4 text-[14px] text-muted">
                      Сначала выберите дату на предыдущем шаге.
                    </p>
                  ) : (
                    <>
                      <p className="mb-3 text-[13px] font-semibold text-ink">
                        {formatIsoHuman(form.date)}
                      </p>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {slots.map((slot) => {
                          const selected = form.time === slot.time;
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              aria-pressed={selected}
                              onClick={() => {
                                patch({ time: slot.time });
                                setErrors((e) => ({ ...e, time: "" }));
                              }}
                              className={[
                                "min-h-[44px] rounded-xl border text-[14px] font-bold tabular-nums transition-colors",
                                selected
                                  ? "border-brand bg-brand text-ink"
                                  : slot.available
                                    ? "border-line bg-white text-ink hover:border-ink/30"
                                    : "cursor-not-allowed border-line bg-white text-muted/40",
                              ].join(" ")}
                              title={slot.available ? undefined : "Время уже прошло"}
                            >
                              {slot.time}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-3 text-[12px] leading-relaxed text-muted">
                        Не нашли удобное время? Позвоните{" "}
                        <a
                          href={primaryPhone.href}
                          className="font-bold text-brand-ink underline decoration-brand/40 underline-offset-2"
                        >
                          {primaryPhone.label}
                        </a>
                        , подберём вручную.
                      </p>
                    </>
                  )}
                  {errors.time ? <ErrorText>{errors.time}</ErrorText> : null}
                </section>
              )}

              {step === 4 && (
                <section>
                  <StepTitle
                    title="Куда сообщить о подтверждении?"
                    text="Проверьте заявку и оставьте контакты — мастер свяжется, чтобы подтвердить время."
                  />

                  <dl className="mb-5 rounded-2xl border border-line bg-white px-4 py-2">
                    <SummaryRow label="Услуга" value={form.service || "—"} />
                    <SummaryRow
                      label="Стоимость"
                      value={
                        price === null ? (
                          <span className="text-muted">уточнит мастер</span>
                        ) : (
                          `${formatPrice(price)} по прайсу`
                        )
                      }
                    />
                    <SummaryRow
                      label="Авто"
                      value={`${form.vehicleModel}, ${form.vehicleYear}`}
                    />
                    {form.vin ? <SummaryRow label="VIN" value={form.vin} /> : null}
                    <SummaryRow
                      label="Визит"
                      value={`${formatIsoHuman(form.date)}, ${form.time}`}
                    />
                  </dl>

                  <div className="flex flex-col gap-5">
                    <div>
                      <Field label="Имя" required>
                        <input
                          value={form.name}
                          onChange={(e) => patch({ name: e.target.value })}
                          placeholder="Как к вам обращаться"
                          autoComplete="name"
                          aria-invalid={errors.name ? true : undefined}
                          className="field"
                        />
                      </Field>
                      {errors.name ? <ErrorText>{errors.name}</ErrorText> : null}
                    </div>

                    <div>
                      <Field label="Телефон" required>
                        <input
                          value={form.phone}
                          onChange={(e) => patch({ phone: formatPhone(e.target.value) })}
                          placeholder="+7 700 000 00 00"
                          inputMode="tel"
                          autoComplete="tel"
                          aria-invalid={errors.phone ? true : undefined}
                          className="field"
                        />
                      </Field>
                      {errors.phone ? <ErrorText>{errors.phone}</ErrorText> : null}
                    </div>

                    <div>
                      <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-ink">
                        Удобный способ связи
                      </span>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {CONTACT_CHANNELS.map((channel) => (
                          <ChoiceButton
                            key={channel}
                            selected={form.channel === channel}
                            onClick={() => patch({ channel })}
                            className="min-h-[46px] rounded-xl px-2 py-3 text-center"
                          >
                            <span className="text-[13px] font-bold">{channel}</span>
                          </ChoiceButton>
                        ))}
                      </div>
                      {errors.channel ? <ErrorText>{errors.channel}</ErrorText> : null}
                    </div>

                    {form.channel === "Telegram" ? (
                      <div>
                        <Field label="Ник в Telegram" required hint="@username">
                          <input
                            value={form.telegram}
                            onChange={(e) => patch({ telegram: e.target.value.replace(/^@/, "") })}
                            placeholder="username"
                            autoComplete="off"
                            autoCapitalize="none"
                            aria-invalid={errors.telegram ? true : undefined}
                            className="field"
                          />
                        </Field>
                        {errors.telegram ? <ErrorText>{errors.telegram}</ErrorText> : null}
                      </div>
                    ) : null}
                  </div>

                  {serverError ? (
                    <div
                      role="alert"
                      className="mt-5 rounded-2xl border border-red-300 bg-red-50 p-4 text-[14px] leading-relaxed text-red-800"
                    >
                      <p className="font-bold">{serverError}</p>
                      <a
                        href={whatsappFallback(form)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline mt-3 w-full"
                      >
                        <MessageCircle className="size-4" aria-hidden="true" />
                        Отправить заявку в WhatsApp
                      </a>
                    </div>
                  ) : null}
                </section>
              )}
            </>
          )}
        </div>

        {/* Нижняя панель действий */}
        {!done ? (
          <div className="shrink-0 border-t border-line bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={step === 0 ? close : goBack}
                className="btn btn-outline min-h-[46px] shrink-0 px-4"
              >
                {step === 0 ? "Отмена" : (
                  <>
                    <ChevronLeft className="size-4" aria-hidden="true" />
                    Назад
                  </>
                )}
              </button>

              {step < 4 ? (
                <button type="button" onClick={goNext} className="btn btn-primary min-h-[46px] flex-1">
                  Далее
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="btn btn-primary min-h-[46px] flex-1 disabled:cursor-wait disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      Отправляем…
                    </>
                  ) : (
                    "Отправить заявку"
                  )}
                </button>
              )}
            </div>
            <p className="mt-2 text-center text-[12px] leading-relaxed text-muted">
              {step < 4
                ? "Заявка ни к чему не обязывает — время подтвердит мастер."
                : "Нажимая кнопку, вы соглашаетесь на обработку контактов для связи по заявке."}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ─────────────────────────── экран подтверждения ─────────────────────────── */

function SuccessPanel({
  booking,
  telegramOnly,
  onClose,
}: {
  booking: Booking;
  telegramOnly: boolean;
  onClose: () => void;
}) {
  const message = encodeURIComponent(
    `Здравствуйте! Оставил заявку №${booking.code} на сайте: ${booking.service}, ${formatIsoHuman(
      booking.date,
    )} в ${booking.time}.`,
  );

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand text-ink">
          <Check className="size-6" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-[19px] font-extrabold leading-tight text-ink">Заявка принята</h3>
          <p className="mt-0.5 text-[13px] text-muted">
            Номер заявки — <span className="font-bold text-ink">{booking.code}</span>
          </p>
        </div>
      </div>

      <dl className="mt-5 rounded-2xl border border-line bg-white px-4 py-2">
        <SummaryRow label="Услуга" value={booking.service} />
        <SummaryRow
          label="Стоимость"
          value={
            booking.price === null || booking.price === undefined
              ? "уточнит мастер"
              : `${formatPrice(booking.price)} по прайсу`
          }
        />
        <SummaryRow label="Авто" value={`${booking.vehicleModel}, ${booking.vehicleYear}`} />
        <SummaryRow label="Визит" value={`${formatIsoHuman(booking.date)}, ${booking.time}`} />
        <SummaryRow label="Связь" value={`${booking.channel} · ${booking.phone}`} />
      </dl>

      <div className="mt-5 rounded-2xl border border-line bg-white p-4">
        <p className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-ink">
          Что дальше
        </p>
        <ol className="mt-2 flex flex-col gap-1.5 text-[14px] leading-relaxed text-muted">
          <li>1. Мастер позвонит или напишет, чтобы подтвердить время визита.</li>
          <li>2. Если планы изменились — сообщите нам, подберём другое время.</li>
          <li>
            3. Приезжайте по адресу {company.address.street}, {company.address.city}.
          </li>
        </ol>
        <p className="mt-3 text-[13px] leading-relaxed text-muted">
          Стоимость из прайса — предварительная: мастер подтвердит её после осмотра автомобиля.
        </p>
        {telegramOnly ? (
          <p className="mt-2 text-[13px] font-semibold text-brand-ink">
            Заявка отправлена мастеру в Telegram — он свяжется с вами.
          </p>
        ) : null}
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <a href={primaryPhone.href} className="btn btn-primary min-h-[46px] flex-1">
          <Phone className="size-4" aria-hidden="true" />
          Позвонить
        </a>
        <a
          href={`${primaryWhatsApp.href}?text=${message}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline min-h-[46px] flex-1"
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          Написать в WhatsApp
        </a>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-2 w-full py-3 text-[14px] font-semibold text-muted underline underline-offset-4 transition-colors hover:text-ink"
      >
        Вернуться на сайт
      </button>
    </div>
  );
}

/* ─────────────────────────── вспомогательное ─────────────────────────── */

/** Резервный путь: если API не ответил, заявку можно отправить в WhatsApp. */
function whatsappFallback(form: {
  service: string;
  vehicleModel: string;
  vehicleYear: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  comment: string;
}): string {
  const text = [
    "Здравствуйте! Хочу записаться в СТО Центр.",
    `Услуга: ${form.service || "нужна консультация"}`,
    form.vehicleModel ? `Авто: ${form.vehicleModel}, ${form.vehicleYear}` : "",
    form.date ? `Желаемая дата: ${formatIsoHuman(form.date)}${form.time ? `, ${form.time}` : ""}` : "",
    form.name ? `Имя: ${form.name}` : "",
    form.phone ? `Телефон: ${form.phone}` : "",
    form.comment ? `Комментарий: ${form.comment}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  return `${primaryWhatsApp.href}?text=${encodeURIComponent(text)}`;
}
