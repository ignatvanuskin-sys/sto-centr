import { CalendarPlus, Clock, CreditCard, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { BookingButton } from "./booking/BookingContext";
import {
  company,
  gisLink,
  primaryPhone,
  primaryWhatsApp,
  routeLink,
  schedule,
  scheduleLabel,
} from "@/lib/company";

const mapSrc =
  "https://www.openstreetmap.org/export/embed.html?bbox=69.40000%2C53.28600%2C69.43000%2C53.29800&layer=mapnik&marker=53.291885%2C69.414982";

export default function Contacts() {
  return (
    <section id="kontakty" className="scroll-mt-20 bg-ink py-14 text-white sm:py-20">
      <div className="wrap">
        <p className="eyebrow text-brand">Контакты</p>
        <h2 className="section-title mt-2">Как нас найти</h2>

        <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="min-w-0">
            <ul className="space-y-6">
              <li className="flex gap-4">
                <MapPin className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                <div>
                  <p className="font-bold">{company.address.street}</p>
                  <p className="text-sm text-white/65">
                    {company.address.city}, {company.address.postalCode}
                  </p>
                  <p className="mt-1 text-sm text-white/65">{company.building}</p>
                  <a
                    href={gisLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex min-h-[44px] items-center text-sm font-semibold text-brand underline decoration-brand/40 underline-offset-4 hover:decoration-brand"
                  >
                    Открыть в 2ГИС
                  </a>
                </div>
              </li>

              <li className="flex gap-4">
                <Phone className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                <div>
                  <p className="font-bold">Телефоны</p>
                  <ul className="mt-1 space-y-1">
                    {company.phones.map((phone) => (
                      <li key={phone.href}>
                        <a
                          href={phone.href}
                          /* 44px по высоте: по этим ссылкам звонят пальцем */
                          className="inline-flex min-h-[44px] items-center text-sm text-white/75 transition-colors hover:text-white"
                        >
                          {phone.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>

              <li className="flex gap-4">
                <MessageCircle className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                <div>
                  <p className="font-bold">WhatsApp</p>
                  <ul className="mt-1 space-y-1">
                    {company.whatsapp.map((item) => (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[44px] items-center text-sm text-white/75 transition-colors hover:text-white"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>

              <li className="flex gap-4">
                <Clock className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                <div>
                  <p className="font-bold">График работы</p>
                  <ul className="mt-2 max-w-xs">
                    {schedule.map((item) => (
                      <li
                        key={item.short}
                        className="flex items-baseline justify-between gap-4 border-b border-white/10 py-1.5 text-sm last:border-0"
                      >
                        <span className="text-white/65">{item.short}</span>
                        <span className="font-semibold tabular-nums">
                          {scheduleLabel(item)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>

              <li className="flex gap-4">
                <CreditCard className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                <div>
                  <p className="font-bold">Оплата</p>
                  <p className="text-sm text-white/65">
                    {company.payment.join(" · ")}
                  </p>
                </div>
              </li>
            </ul>

            <div className="mt-8 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
              <BookingButton className="btn btn-primary w-full xs:w-auto">
                <CalendarPlus className="size-4" aria-hidden="true" />
                Записаться на сервис
              </BookingButton>
              <a href={primaryPhone.href} className="btn btn-outline-light w-full xs:w-auto">
                <Phone className="size-4" aria-hidden="true" />
                Позвонить
              </a>
              <a
                href={primaryWhatsApp.href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-light w-full xs:w-auto"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                Написать
              </a>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <div className="w-full overflow-hidden rounded-2xl border border-white/12 bg-ink-2">
              <iframe
                title={`Карта: ${company.name}, ${company.address.street}, ${company.address.city}`}
                src={mapSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block h-64 w-full border-0 sm:h-80 lg:h-[22rem]"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={routeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary w-full sm:flex-1"
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
