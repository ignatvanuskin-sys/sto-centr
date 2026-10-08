import { CalendarPlus, Clock, MessageCircle, Phone } from "lucide-react";
import { primaryPhone, primaryWhatsApp, scheduleSummary } from "@/lib/company";
import { BookingButton } from "./booking/BookingContext";

/**
 * Финальный призыв перед контактами: единственная задача блока — открыть
 * форму записи. Пять шагов перечислены заранее, чтобы человек понимал,
 * сколько времени это займёт (меньше минуты).
 */

const FORM_STEPS = [
  "Что нужно сделать",
  "Автомобиль",
  "Когда удобно",
  "Контакты",
  "Подтверждение",
];

export default function BookingCta() {
  return (
    <section
      id="zapis"
      className="scroll-mt-24 border-t border-hair bg-ink py-16 sm:py-20 lg:py-28"
    >
      <div className="wrap">
        <div className="relative isolate overflow-hidden rounded-3xl border border-hair bg-steel p-6 sm:p-10 lg:p-14">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_85%_10%,rgba(255,106,26,0.24),transparent_60%)]"
          />

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14">
            <div>
              <p className="eyebrow text-brand">
                <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
                Онлайн-запись
              </p>
              <h2 className="section-title mt-4 text-white">
                Автомобиль требует внимания?
              </h2>
              <p className="lead mt-4 max-w-xl">
                Запишитесь заранее: мастер подтвердит удобное время, а вы
                приедете без ожидания в очереди. Запись занимает меньше минуты —
                пять коротких шагов.
              </p>

              <div className="mt-8 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
                <BookingButton className="btn btn-brand w-full px-6 xs:w-auto">
                  <CalendarPlus className="size-4" aria-hidden="true" />
                  Записаться на обслуживание
                </BookingButton>
                <a
                  href={primaryPhone.href}
                  className="btn btn-outline-light w-full px-6 xs:w-auto"
                >
                  <Phone className="size-4" aria-hidden="true" />
                  Позвонить
                </a>
                <a
                  href={primaryWhatsApp.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-light w-full px-6 xs:w-auto"
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  WhatsApp
                </a>
              </div>

              <p className="mt-5 inline-flex items-center gap-2 text-[13px] text-mist-2">
                <Clock className="size-3.5" aria-hidden="true" />
                {scheduleSummary}
              </p>
            </div>

            <ol className="grid gap-2">
              {FORM_STEPS.map((label, index) => (
                <li
                  key={label}
                  className="flex items-center gap-3.5 rounded-2xl border border-hair bg-ink/70 px-4 py-3"
                >
                  <span className="text-[13px] font-extrabold tabular-nums text-brand">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[15px] font-semibold text-white">{label}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
