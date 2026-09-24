"use client";

import { useState } from "react";
import { CalendarPlus, ChevronDown } from "lucide-react";
import { BookingButton } from "./booking/BookingContext";
import {
  allServices,
  featuredServices,
  formatPrice,
  priceUpdatedAt,
  primaryWhatsApp,
  serviceGroups,
} from "@/lib/company";

function whatsappFor(serviceName: string) {
  const text = `Здравствуйте! Интересует услуга: ${serviceName}. Подскажите стоимость и когда можно приехать.`;
  return `${primaryWhatsApp.href}?text=${encodeURIComponent(text)}`;
}

export default function Services() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="uslugi" className="scroll-mt-20 bg-paper py-14 sm:py-20">
      <div className="wrap">
        <p className="eyebrow text-brand-ink">Услуги и цены</p>
        <h2 className="section-title mt-2 max-w-2xl">
          Что делаем и сколько это стоит
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-base">
          Цены — из прайс-листа сервиса в 2ГИС (обновлён {priceUpdatedAt}). Всего{" "}
          {allServices.length} позиции: от осмотра автомобиля и мелкого ремонта
          до капитального ремонта двигателя. Точную стоимость для вашей машины
          уточняйте по телефону.
        </p>

        <ul className="mt-8 grid gap-3 xs:grid-cols-2 lg:grid-cols-4">
          {featuredServices.map((service) => (
            <li
              key={service.name}
              className="card flex flex-col p-4 transition-shadow hover:shadow-[0_10px_30px_-18px_rgba(12,15,19,0.45)]"
            >
              <h3 className="text-[15px] font-bold leading-snug">
                {service.name}
              </h3>
              <p className="mt-2 text-xl font-extrabold tracking-tight">
                {formatPrice(service.price)}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <BookingButton
                  service={service.name}
                  className="btn btn-primary w-full px-3 py-2.5 text-sm"
                >
                  <CalendarPlus className="size-4" aria-hidden="true" />
                  Записаться
                </BookingButton>
                <a
                  href={whatsappFor(service.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  /* min-h-11: ссылка была высотой 18px — мимо неё легко промахнуться */
                  className="inline-flex min-h-[44px] items-center justify-center text-[12px] font-semibold text-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink"
                >
                  Уточнить в WhatsApp
                </a>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            aria-controls="full-price"
            className="btn btn-dark w-full xs:w-auto"
          >
            {expanded
              ? "Свернуть прайс"
              : `Показать весь прайс (${allServices.length})`}
            <ChevronDown
              className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
        </div>

        {expanded && (
          <div id="full-price" className="mt-8 grid gap-4 lg:grid-cols-2">
            {serviceGroups.map((group) => (
              <div key={group.title} className="card p-5">
                <h3 className="text-base font-extrabold tracking-tight">
                  {group.title}
                  <span className="ml-2 text-sm font-semibold text-muted">
                    {group.items.length} позиций
                  </span>
                </h3>
                <ul className="mt-3">
                  {group.items.map((item) => (
                    <li key={item.name} className="price-row">
                      <span className="text-[15px] leading-snug text-ink">
                        {item.name}
                      </span>
                      <span className="shrink-0 text-[15px] font-bold tabular-nums">
                        {item.price === null ? "—" : formatPrice(item.price)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="text-sm text-muted lg:col-span-2">
              Прайс-лист обновлён {priceUpdatedAt}. Итоговая стоимость зависит от
              автомобиля и объёма работ — уточняйте по телефону{" "}
              <a
                href="tel:+77162293535"
                className="font-semibold text-ink underline decoration-brand decoration-2 underline-offset-4"
              >
                +7 (7162) 29-35-35
              </a>
              .
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
