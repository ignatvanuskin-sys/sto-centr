import {
  Clock,
  CreditCard,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
} from "lucide-react";
import {
  company,
  gisLink,
  primaryPhone,
  primaryWhatsApp,
  routeLink,
  schedule,
  scheduleLabel,
} from "@/lib/company";
import OpenStatus from "./OpenStatus";

/**
 * Финальный блок: адрес, телефоны, WhatsApp, график и карта с маршрутом.
 * Координаты и ссылки — реальные, из карточки 2ГИС.
 */

const mapSrc =
  "https://www.openstreetmap.org/export/embed.html?bbox=69.40000%2C53.28600%2C69.43000%2C53.29800&layer=mapnik&marker=53.291885%2C69.414982";

export default function Contacts() {
  return (
    <section
      id="kontakty"
      className="scroll-mt-24 border-t border-hair bg-ink-2 py-16 sm:py-20 lg:py-28"
    >
      <div className="wrap">
        <div className="max-w-3xl">
          <p className="eyebrow text-brand">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
            Контакты
          </p>
          <h2 className="section-title mt-4 text-white">
            {company.name}, {company.address.city}
          </h2>
          <p className="mt-4 text-[17px] font-semibold text-mist sm:text-xl">
            {company.address.street} · {company.building.toLowerCase()}
          </p>
          <p className="mt-4">
            <OpenStatus className="text-[14px] font-semibold text-white" />
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
          <div className="min-w-0">
            <div className="flex flex-col gap-3 xs:flex-row xs:flex-wrap">
              <a href={primaryPhone.href} className="btn btn-brand w-full px-6 xs:w-auto">
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
              <a
                href={routeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-light w-full px-6 xs:w-auto"
              >
                <Navigation className="size-4" aria-hidden="true" />
                Построить маршрут
              </a>
            </div>

            <dl className="mt-8 flex flex-col">
              <div className="flex gap-4 border-b border-hair py-5">
                <MapPin className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-mist-2">
                    Адрес
                  </dt>
                  <dd className="mt-1 text-[15px] font-semibold text-white">
                    {company.address.street}, {company.address.city},{" "}
                    {company.address.postalCode}
                  </dd>
                  <dd className="mt-2 flex flex-wrap items-center gap-3">
                    <a
                      href={gisLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] items-center text-[13px] font-bold text-brand underline decoration-brand/40 underline-offset-4 transition-colors hover:decoration-brand"
                    >
                      Открыть в 2ГИС
                    </a>
                    <span className="text-[12px] tabular-nums text-mist-2">
                      {company.geo.lat}, {company.geo.lon}
                    </span>
                  </dd>
                </div>
              </div>

              <div className="flex gap-4 border-b border-hair py-5">
                <Phone className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-mist-2">
                    Телефоны
                  </dt>
                  <dd className="mt-1 flex flex-col">
                    {company.phones.map((phone) => (
                      <a
                        key={phone.href}
                        href={phone.href}
                        className="inline-flex min-h-[44px] items-center text-[15px] font-semibold text-white transition-colors hover:text-brand"
                      >
                        {phone.label}
                      </a>
                    ))}
                  </dd>
                </div>
              </div>

              <div className="flex gap-4 border-b border-hair py-5">
                <MessageCircle
                  className="mt-0.5 size-5 shrink-0 text-brand"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-mist-2">
                    WhatsApp
                  </dt>
                  <dd className="mt-1 flex flex-col">
                    {company.whatsapp.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[44px] items-center text-[15px] font-semibold text-white transition-colors hover:text-brand"
                      >
                        {item.label}
                      </a>
                    ))}
                  </dd>
                </div>
              </div>

              <div className="flex gap-4 border-b border-hair py-5">
                <Clock className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-mist-2">
                    График работы
                  </dt>
                  <dd className="mt-2 max-w-sm">
                    <ul>
                      {schedule.map((item) => (
                        <li
                          key={item.short}
                          className="flex items-baseline justify-between gap-4 border-b border-hair py-1.5 text-[14px] last:border-0"
                        >
                          <span className="text-mist">{item.short}</span>
                          <span className="font-semibold tabular-nums text-white">
                            {scheduleLabel(item)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </div>

              <div className="flex gap-4 py-5">
                <CreditCard className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-mist-2">
                    Оплата
                  </dt>
                  <dd className="mt-1 text-[15px] font-semibold text-white">
                    {company.payment.join(" · ")}
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <div className="overflow-hidden rounded-3xl border border-hair bg-steel">
              <iframe
                title={`Карта: ${company.name}, ${company.address.street}, ${company.address.city}`}
                src={mapSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block h-72 w-full border-0 sm:h-96 lg:h-[26rem]"
              />
            </div>
            <p className="text-[12px] leading-relaxed text-mist-2">
              Карта показывает координаты из карточки 2ГИС. Точное расположение
              ворот и въезда на территорию удобнее смотреть в 2ГИС — там есть
              фотографии двора.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={routeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-brand w-full sm:flex-1"
              >
                <Navigation className="size-4" aria-hidden="true" />
                Построить маршрут
              </a>
              <a
                href={gisLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-light w-full sm:flex-1"
              >
                Открыть в 2ГИС
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
