"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Check, ChevronDown, ChevronLeft, Loader2, MessageCircle, Phone, X } from "lucide-react";
import { company, formatPrice, primaryPhone, primaryWhatsApp } from "@/lib/company";
import { priceDisclaimer } from "@/lib/content";
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
import {
  formatIsoHuman,
  formatIsoShort,
  quickDates,
  shopNow,
  slotsForIso,
} from "@/lib/slots";
import Calendar from "./Calendar";
import ServicePicker from "./ServicePicker";
import { ChoiceButton, ErrorText, Field, Honeypot, StepTitle, SummaryRow } from "./ui";
import { useBooking } from "./BookingContext";

/**
 * Онлайн-запись: пять шагов — один вопрос на экран.
 *
 * 01 что нужно сделать → 02 автомобиль (не обязательно) → 03 когда удобно →
 * 04 контакты → 05 подтверждение. На телефоне панель занимает весь экран,
 * на десктопе — диалог по центру. Шаги автомобиля и даты можно заполнять
 * в любом порядке, но проверяется каждый шаг отдельно, поэтому ошибка
 * появляется рядом с полем, а не «где-то выше».
 */

const STEPS = [
  "Что нужно сделать?",
  "Ваш автомобиль",
  "Когда удобно?",
  "Контактные данные",
  "Подтверждение",
] as const;

const LAST_STEP = (STEPS.length - 1) as StepIndex;

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
  const [showCalendar, setShowCalendar] = useState(false);

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
  const quick = useMemo(() => quickDates(now), [now]);

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
    setShowCalendar(false);
    setForm({ ...EMPTY, service: presetService ?? "" });
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
  }, [isOpen, presetService]);

  /* Блокировка прокрутки страницы, Escape и возврат фокуса */
  useEffect(() => {
    if (!isOpen) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
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
    /* Следующий шаг начинается «с чистого листа»: ошибки прошлого шага не
       должны пугать на новом экране */
    setServerError(null);
    setStep((s) => Math.min(LAST_STEP, s + 1) as StepIndex);
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(0, s - 1) as StepIndex);
  }

  async function submit() {
    if (submitLock.current || submitting) return;

    const stepErrors = validateStep(LAST_STEP, form, now);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;

    /* Повторная проверка предыдущих шагов: пользователь мог вернуться назад */
    const all: Record<string, string> = {};
    for (const index of [0, 1, 2, 3] as StepIndex[]) {
      Object.assign(all, validateStep(index, form, now));
    }
    if (Object.keys(all).length > 0) {
      setErrors(all);
      if (all.service) setStep(0);
      else if (all.vehicleModel || all.vehicleYear || all.vin || all.comment) setStep(1);
      else if (all.date || all.time) setStep(2);
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

      /* Сервер ответил 200 без заявки: сработала скрытая проверка на ботов.
         Без этой ветки форма просто «зависала» без объяснения. */
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
  const progress = done ? LAST_STEP : step;
  const vehicleSummary = [form.vehicleModel, form.vehicleYear].filter(Boolean).join(", ");

  return (
    <div
      className="anim-backdrop fixed inset-0 z-[65] flex items-end justify-center bg-ink/85 sm:items-center sm:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Онлайн-запись в ${company.name}`}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="anim-panel relative flex max-h-[100dvh] w-full flex-col overflow-hidden border border-hair bg-ink-2 outline-none sm:max-h-[92vh] sm:max-w-3xl sm:rounded-3xl"
      >
        {/* Шапка: прогресс + закрытие */}
        <div className="shrink-0 border-b border-hair px-5 pt-5 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="eyebrow text-brand">Онлайн-запись</p>
              <p className="mt-2 truncate text-[14px] font-semibold text-white">
                {done ? "Готово" : STEPS[step]}
              </p>
              <p className="mt-0.5 text-[12px] text-mist-2">
                {done ? "Заявка отправлена мастеру" : `Шаг ${step + 1} из ${STEPS.length}`}
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Закрыть запись"
              className="grid size-11 shrink-0 place-items-center rounded-xl border border-hair text-white transition-colors hover:bg-white/5"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          {/* Полоса прогресса: пять отрезков по числу шагов */}
          <ol className="mt-4 flex gap-1.5 pb-5" aria-hidden="true">
            {STEPS.map((label, index) => (
              <li key={label} className="flex-1">
                <span
                  className={`block h-1 rounded-full transition-colors ${
                    index <= progress ? "bg-brand" : "bg-white/15"
                  }`}
                />
              </li>
            ))}
          </ol>
        </div>

        {/* Контент шага */}
        <div
          ref={contentRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-6"
        >
          {done ? (
            <div className="anim-step">
              <SuccessPanel booking={done} telegramOnly={telegramOnly} onClose={close} />
            </div>
          ) : (
            /* key по шагу: смена шага перезапускает анимацию появления */
            <div key={step} className="anim-step">
              <Honeypot value={trap} onChange={setTrap} />

              {step === 0 && (
                <section>
                  <StepTitle
                    step={1}
                    title="Что нужно сделать?"
                    text="Выберите работу из прайса сервиса — стоимость подставим оттуда, а мастер подтвердит её после осмотра."
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
                    step={2}
                    title="Ваш автомобиль"
                    text="Поля необязательные: если не помните год или VIN — пропустите шаг, мастер уточнит по телефону."
                  />

                  <div className="flex flex-col gap-5">
                    <div>
                      <Field label="Марка и модель" hint="не обязательно">
                        <input
                          list="sto-brands"
                          value={form.vehicleModel}
                          onChange={(e) => patch({ vehicleModel: e.target.value })}
                          placeholder="Например, Kia Rio"
                          autoComplete="off"
                          aria-invalid={errors.vehicleModel ? true : undefined}
                          className="field field-dark"
                        />
                      </Field>
                      <datalist id="sto-brands">
                        {VEHICLE_BRANDS.map((brand) => (
                          <option key={brand} value={brand} />
                        ))}
                      </datalist>
                      {errors.vehicleModel ? <ErrorText>{errors.vehicleModel}</ErrorText> : null}
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <Field label="Год выпуска" hint="не обязательно">
                          <select
                            value={form.vehicleYear}
                            onChange={(e) => patch({ vehicleYear: e.target.value })}
                            aria-invalid={errors.vehicleYear ? true : undefined}
                            className="field field-dark"
                          >
                            <option value="">Не указывать</option>
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
                            className="field field-dark uppercase"
                          />
                        </Field>
                        {errors.vin ? <ErrorText>{errors.vin}</ErrorText> : null}
                      </div>
                    </div>

                    <div>
                      <Field label="Что беспокоит?" hint={`${form.comment.length}/500`}>
                        <textarea
                          value={form.comment}
                          onChange={(e) => patch({ comment: e.target.value.slice(0, 500) })}
                          rows={3}
                          placeholder="Стук в подвеске на кочках, горит Check Engine…"
                          aria-invalid={errors.comment ? true : undefined}
                          className="field field-dark resize-y"
                        />
                      </Field>
                      {errors.comment ? <ErrorText>{errors.comment}</ErrorText> : null}
                    </div>
                  </div>

                  <p className="mt-5 text-[12px] leading-relaxed text-mist-2">
                    Шаг можно пропустить — нажмите «Далее».
                  </p>
                </section>
              )}

              {step === 2 && (
                <section>
                  <StepTitle
                    step={3}
                    title="Когда удобно?"
                    text="Запись идёт по графику сервиса: Пн–Пт 09:00–19:00, Сб 09:00–18:00. Воскресенье — выходной."
                  />

                  {/* Быстрый выбор дня: один тап вместо календаря */}
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {quick.map((q) => {
                      const selected = form.date === q.iso;
                      return (
                        <button
                          key={q.label}
                          type="button"
                          disabled={!q.available}
                          aria-pressed={selected}
                          onClick={() => {
                            patch({ date: q.iso, time: "" });
                            setShowCalendar(false);
                            setErrors((e) => ({ ...e, date: "", time: "" }));
                          }}
                          className={[
                            "min-h-[56px] rounded-xl border px-3 py-2 text-[13px] font-bold transition-colors",
                            selected
                              ? "border-brand bg-brand/12 text-white"
                              : q.available
                                ? "border-hair bg-white/[0.03] text-white hover:border-white/25"
                                : "cursor-not-allowed border-hair bg-white/[0.02] text-mist-2/60",
                          ].join(" ")}
                          title={q.available ? undefined : "В этот день записи нет"}
                        >
                          <span className="block">{q.label}</span>
                          <span className="mt-0.5 block text-[11px] font-semibold text-mist-2">
                            {formatIsoShort(q.iso)}
                          </span>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      aria-expanded={showCalendar}
                      onClick={() => setShowCalendar((v) => !v)}
                      className="flex min-h-[56px] items-center justify-center gap-1.5 rounded-xl border border-hair bg-white/[0.03] px-3 py-2 text-[13px] font-bold text-white transition-colors hover:border-white/25"
                    >
                      Другая дата
                      <ChevronDown
                        className={`size-4 transition-transform ${showCalendar ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  {/* Календарь раскрывается плавно и только по запросу */}
                  <div className="collapse-grid mt-3" data-open={showCalendar}>
                    {/* inert: свёрнутый календарь недоступен с клавиатуры */}
                    <div inert={!showCalendar}>
                      <div className="pt-1">
                        <Calendar
                          value={form.date}
                          onChange={(iso) => {
                            patch({ date: iso, time: "" });
                            setErrors((e) => ({ ...e, date: "", time: "" }));
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {errors.date ? <ErrorText>{errors.date}</ErrorText> : null}

                  {/* Время — на этом же экране, отдельный шаг не нужен */}
                  <div className="mt-7">
                    <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-white">
                      Время визита
                    </p>
                    {!form.date ? (
                      <p className="mt-2 rounded-xl border border-hair bg-white/[0.03] p-4 text-[14px] leading-relaxed text-mist">
                        Выберите день — свободное время появится здесь.
                      </p>
                    ) : slots.length === 0 ? (
                      <p className="mt-2 rounded-xl border border-hair bg-white/[0.03] p-4 text-[14px] leading-relaxed text-mist">
                        На {formatIsoHuman(form.date)} свободного времени не осталось. Выберите
                        другую дату.
                      </p>
                    ) : (
                      <>
                        <p className="mt-1.5 text-[13px] text-mist-2">
                          {formatIsoHuman(form.date)}
                        </p>
                        <div className="mt-3 grid grid-cols-3 gap-2 xs:grid-cols-4">
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
                                  "min-h-[48px] rounded-xl border text-[14px] font-bold tabular-nums transition-colors",
                                  selected
                                    ? "border-brand bg-brand text-ink"
                                    : slot.available
                                      ? "border-hair bg-white/[0.03] text-white hover:border-white/25"
                                      : "cursor-not-allowed border-hair bg-white/[0.02] text-mist-2/50",
                                ].join(" ")}
                                title={slot.available ? undefined : "Время уже прошло"}
                              >
                                {slot.time}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                    {errors.time ? <ErrorText>{errors.time}</ErrorText> : null}
                    <p className="mt-3 text-[12px] leading-relaxed text-mist-2">
                      Слоты по часам, последний заезд — за час до закрытия. Точное время мастер
                      подтвердит звонком. Не подошло ни одно время? Позвоните{" "}
                      <a
                        href={primaryPhone.href}
                        className="font-bold text-brand underline decoration-brand/40 underline-offset-2"
                      >
                        {primaryPhone.label}
                      </a>
                      , подберём вручную.
                    </p>
                  </div>
                </section>
              )}

              {step === 3 && (
                <section>
                  <StepTitle
                    step={4}
                    title="Контактные данные"
                    text="Мастер свяжется с вами и подтвердит время визита. Данные нужны только для связи по заявке."
                  />

                  <div className="flex flex-col gap-5">
                    <div>
                      <Field label="Имя" required>
                        <input
                          value={form.name}
                          onChange={(e) => patch({ name: e.target.value })}
                          placeholder="Как к вам обращаться"
                          autoComplete="name"
                          aria-invalid={errors.name ? true : undefined}
                          className="field field-dark"
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
                          className="field field-dark"
                        />
                      </Field>
                      {errors.phone ? <ErrorText>{errors.phone}</ErrorText> : null}
                    </div>

                    <div>
                      <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-white">
                        Удобный способ связи
                      </span>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {CONTACT_CHANNELS.map((channel) => (
                          <ChoiceButton
                            key={channel}
                            selected={form.channel === channel}
                            onClick={() => patch({ channel })}
                            className="min-h-[48px] rounded-xl px-2 py-3 text-center"
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
                            className="field field-dark"
                          />
                        </Field>
                        {errors.telegram ? <ErrorText>{errors.telegram}</ErrorText> : null}
                      </div>
                    ) : null}
                  </div>
                </section>
              )}

              {step === 4 && (
                <section>
                  <StepTitle
                    step={5}
                    title="Подтверждение"
                    text="Проверьте заявку перед отправкой. Время визита подтвердит мастер."
                  />

                  {/* Сводка — последнее, что видит клиент перед отправкой */}
                  <dl className="rounded-2xl border border-hair bg-white/[0.03] px-4 py-2">
                    <SummaryRow label="Услуга" value={form.service || "—"} />
                    <SummaryRow
                      label="Стоимость"
                      value={
                        price === null ? (
                          <span className="text-mist">уточнит мастер</span>
                        ) : (
                          `${formatPrice(price)} по прайсу`
                        )
                      }
                    />
                    <SummaryRow label="Авто" value={vehicleSummary || "не указано"} />
                    {form.vin ? <SummaryRow label="VIN" value={form.vin} /> : null}
                    <SummaryRow
                      label="Визит"
                      value={`${formatIsoHuman(form.date)}, ${form.time}`}
                    />
                    <SummaryRow label="Связь" value={`${form.channel} · ${form.phone || "—"}`} />
                    <SummaryRow label="Имя" value={form.name || "—"} />
                  </dl>

                  <p className="mt-4 text-[12px] leading-relaxed text-mist-2">
                    {priceDisclaimer}
                  </p>

                  {serverError ? (
                    <div
                      role="alert"
                      className="mt-5 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-[14px] leading-relaxed text-red-200"
                    >
                      <p className="font-bold">{serverError}</p>
                      <a
                        href={whatsappFallback(form)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-light mt-3 w-full"
                      >
                        <MessageCircle className="size-4" aria-hidden="true" />
                        Отправить заявку в WhatsApp
                      </a>
                    </div>
                  ) : null}
                </section>
              )}
            </div>
          )}
        </div>

        {/* Нижняя панель действий */}
        {!done ? (
          <div className="shrink-0 border-t border-hair bg-ink px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={step === 0 ? close : goBack}
                className="btn btn-outline-light min-h-[48px] shrink-0 px-4"
              >
                {step === 0 ? (
                  "Отмена"
                ) : (
                  <>
                    <ChevronLeft className="size-4" aria-hidden="true" />
                    Назад
                  </>
                )}
              </button>

              {step < LAST_STEP ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="btn btn-brand min-h-[48px] flex-1"
                >
                  Далее
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="btn btn-brand min-h-[48px] flex-1 disabled:cursor-wait disabled:opacity-70"
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
            <p className="mt-2 text-center text-[12px] leading-relaxed text-mist-2">
              {step < LAST_STEP
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
      <div className="flex items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand text-ink">
          <Check className="size-7" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-[22px] font-extrabold leading-tight text-white">
            Заявка принята
          </h3>
          <p className="mt-1 text-[13px] text-mist">
            Номер заявки — <span className="font-bold text-white">{booking.code}</span>
          </p>
        </div>
      </div>

      <dl className="mt-6 rounded-2xl border border-hair bg-white/[0.03] px-4 py-2">
        <SummaryRow label="Услуга" value={booking.service} />
        <SummaryRow
          label="Стоимость"
          value={
            booking.price === null || booking.price === undefined
              ? "уточнит мастер"
              : `${formatPrice(booking.price)} по прайсу`
          }
        />
        {booking.vehicleModel || booking.vehicleYear ? (
          <SummaryRow
            label="Авто"
            value={[booking.vehicleModel, booking.vehicleYear].filter(Boolean).join(", ")}
          />
        ) : null}
        <SummaryRow label="Визит" value={`${formatIsoHuman(booking.date)}, ${booking.time}`} />
        <SummaryRow label="Связь" value={`${booking.channel} · ${booking.phone}`} />
      </dl>

      <div className="mt-5 rounded-2xl border border-hair bg-white/[0.03] p-4">
        <p className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-white">
          Что дальше
        </p>
        <ol className="mt-2 flex flex-col gap-1.5 text-[14px] leading-relaxed text-mist">
          <li>1. Мастер позвонит или напишет, чтобы подтвердить время визита.</li>
          <li>2. Если планы изменились — сообщите нам, подберём другое время.</li>
          <li>
            3. Приезжайте по адресу {company.address.street}, {company.address.city}.
          </li>
        </ol>
        <p className="mt-3 text-[13px] leading-relaxed text-mist-2">
          Стоимость из прайса — предварительная: мастер подтвердит её после осмотра автомобиля.
        </p>
        {telegramOnly ? (
          <p className="mt-2 text-[13px] font-semibold text-brand">
            Заявка отправлена мастеру в Telegram — он свяжется с вами.
          </p>
        ) : null}
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <a href={primaryPhone.href} className="btn btn-brand min-h-[48px] flex-1">
          <Phone className="size-4" aria-hidden="true" />
          Позвонить
        </a>
        <a
          href={`${primaryWhatsApp.href}?text=${message}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-light min-h-[48px] flex-1"
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          Написать в WhatsApp
        </a>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-2 w-full py-3 text-[14px] font-semibold text-mist underline underline-offset-4 transition-colors hover:text-white"
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
    `Здравствуйте! Хочу записаться в ${company.name}.`,
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
