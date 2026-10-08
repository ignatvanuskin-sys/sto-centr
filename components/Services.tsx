"use client";

import { useState } from "react";
import { ArrowUpRight, ListFilter } from "lucide-react";
import { allServices, formatPrice, priceUpdatedAt } from "@/lib/company";
import {
  priceDisclaimer,
  priceSourceNote,
  serviceCards,
} from "@/lib/content";
import { pricedServices } from "@/lib/price-search";
import { useBooking } from "./booking/BookingContext";
import PriceCatalog from "./PriceCatalog";

/**
 * Восемь основных работ вместо стены из 93 позиций. Полный прайс — в каталоге:
 * 93 строки на странице превращали блок услуг в справочник, который никто
 * не читает, а форма записи всё равно подставляла услугу из поиска.
 */
export default function Services() {
  const [catalogOpen, setCatalogOpen] = useState(false);
  const { open } = useBooking();

  return (
    <section
      id="uslugi"
      className="scroll-mt-24 border-t border-hair bg-ink py-16 sm:py-20 lg:py-28"
    >
      <div className="wrap">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-brand">
              <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
              Услуги и цены
            </p>
            <h2 className="section-title mt-4 text-white">
              Работы, с которыми приезжают чаще всего
            </h2>
            <p className="lead mt-4">
              Всего в прайсе сервиса {allServices.length} позиции — от осмотра
              автомобиля до капитального ремонта двигателя. Ниже восемь основных
              работ; остальное можно найти в полном прайсе.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCatalogOpen(true)}
            className="btn btn-outline-light w-full shrink-0 px-5 sm:w-auto"
          >
            <ListFilter className="size-4" aria-hidden="true" />
            Посмотреть весь прайс ({allServices.length})
          </button>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
          {serviceCards.map((card, index) => {
            const service = pricedServices.find((item) => item.name === card.name);
            return (
              <li
                key={card.name}
                className="card-steel card-steel-hover group relative flex flex-col p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[13px] font-extrabold tracking-[0.2em] text-brand">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="max-w-[60%] text-right text-[10px] font-bold uppercase leading-tight tracking-[0.12em] text-mist-2">
                    {service?.group}
                  </span>
                </div>

                <h3 className="mt-4 text-[17px] font-bold leading-snug text-white">
                  {card.name}
                </h3>
                <p className="mt-2.5 flex-1 text-[14px] leading-relaxed text-mist">
                  {card.blurb}
                </p>

                <div className="mt-5 flex items-end justify-between gap-3 border-t border-hair pt-4">
                  <span className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-mist-2">
                      {service?.price === null ? "Цена" : "Цена из прайса"}
                    </span>
                    <span className="mt-1 block text-[17px] font-extrabold leading-tight text-white">
                      {formatPrice(service?.price ?? null)}
                    </span>
                  </span>

                  <button
                    type="button"
                    onClick={() => open({ service: card.name })}
                    aria-label={`Записаться: ${card.name}`}
                    className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl border border-hair px-3.5 text-[13px] font-bold text-white transition-colors hover:border-brand hover:text-brand"
                  >
                    Записаться
                    <ArrowUpRight
                      className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-hair bg-steel p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <p className="text-[13px] leading-relaxed text-mist">
            <span className="font-bold text-white">{priceDisclaimer}</span>{" "}
            {priceSourceNote}
          </p>
          <button
            type="button"
            onClick={() => setCatalogOpen(true)}
            className="btn btn-outline-light w-full shrink-0 sm:w-auto"
          >
            Каталог цен
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <PriceCatalog open={catalogOpen} onClose={() => setCatalogOpen(false)} />
      <p className="sr-only">
        Прайс-лист обновлён {priceUpdatedAt}. Цены указаны в тенге.
      </p>
    </section>
  );
}
