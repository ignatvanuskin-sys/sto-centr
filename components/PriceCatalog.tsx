"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import { formatPrice, priceUpdatedAt, serviceGroups } from "@/lib/company";
import { priceDisclaimer, priceSourceNote } from "@/lib/content";
import { pricedServices, searchPrice } from "@/lib/price-search";
import { useBooking } from "./booking/BookingContext";
import Portal from "./Portal";

/**
 * Каталог прайса: 93 позиции не вываливаются стеной на страницу, а
 * открываются по кнопке «Посмотреть весь прайс». Внутри — поиск по названию,
 * фильтр по группам и запись прямо из строки прайса.
 */

type GroupFilter = "all" | string;

const MAX_RESULTS = 60;

export default function PriceCatalog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<GroupFilter>("all");
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const { open: openBooking } = useBooking();

  const searching = query.trim().length >= 2;

  const results = useMemo(() => {
    const base = searching ? searchPrice(query) : pricedServices;
    if (group === "all") return base;
    return base.filter((service) => service.group === group);
  }, [query, group, searching]);

  const visible = results.slice(0, MAX_RESULTS);

  /* Пока каталог открыт: страница не прокручивается, Escape закрывает */
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const previousBody = document.body.style.overflow;
    const previousHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousBody;
      document.documentElement.style.overflow = previousHtml;
      document.removeEventListener("keydown", onKeyDown);
      restoreFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Portal>
    <div
      className="anim-backdrop fixed inset-0 z-[60] flex items-end justify-center bg-ink/80 sm:items-center sm:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Прайс-лист сервиса"
        tabIndex={-1}
        className="anim-panel flex h-[100dvh] w-full flex-col overflow-hidden border border-hair bg-ink-2 outline-none sm:h-auto sm:max-h-[88vh] sm:max-w-3xl sm:rounded-3xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-hair px-5 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <p className="eyebrow text-brand">Прайс-лист</p>
            <h2 className="mt-2 text-[21px] font-extrabold leading-tight text-white sm:text-2xl">
              Все работы и цены
            </h2>
            <p className="mt-1 text-[13px] text-mist">
              {pricedServices.length} позиций · прайс 2ГИС обновлён {priceUpdatedAt}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть прайс"
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-hair text-white transition-colors hover:bg-white/5"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="shrink-0 border-b border-hair px-5 py-4 sm:px-6">
          <label className="relative block">
            <span className="sr-only">Поиск по прайсу</span>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-mist-2"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск: диагностика, рейка, стартер, масло…"
              className="field field-dark pl-10"
            />
          </label>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setGroup("all")}
              aria-pressed={group === "all"}
              className={`min-h-[44px] rounded-xl border px-3.5 text-[13px] font-bold transition-colors ${
                group === "all"
                  ? "border-brand bg-brand text-ink"
                  : "border-hair bg-white/5 text-mist hover:text-white"
              }`}
            >
              Все ({pricedServices.length})
            </button>
            {serviceGroups.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setGroup(item.title)}
                aria-pressed={group === item.title}
                className={`min-h-[44px] rounded-xl border px-3.5 text-left text-[13px] font-bold transition-colors ${
                  group === item.title
                    ? "border-brand bg-brand text-ink"
                    : "border-hair bg-white/5 text-mist hover:text-white"
                }`}
              >
                {item.title} ({item.items.length})
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-3 sm:px-6">
          <p className="py-2 text-[12px] font-bold uppercase tracking-[0.14em] text-mist-2">
            {visible.length === 0
              ? "Ничего не найдено"
              : `Найдено: ${results.length}${results.length > MAX_RESULTS ? ` · показаны первые ${MAX_RESULTS}` : ""}`}
          </p>

          {visible.length === 0 ? (
            <p className="rounded-2xl border border-hair bg-white/5 p-4 text-[14px] leading-relaxed text-mist">
              Такой работы в прайсе нет. Опишите проблему в комментарии к заявке —
              мастер уточнит работы и стоимость после осмотра.
            </p>
          ) : (
            <ul>
              {visible.map((service) => (
                <li
                  key={`${service.group}-${service.name}`}
                  className="flex items-center gap-3 border-b border-hair last:border-b-0"
                >
                  <span className="min-w-0 flex-1 py-3">
                    <span className="block text-[15px] font-semibold leading-snug text-white">
                      {service.name}
                    </span>
                    {group === "all" && !searching ? (
                      <span className="mt-0.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-mist-2">
                        {service.group}
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-[15px] font-extrabold tabular-nums text-white">
                    {service.price === null ? (
                      <span className="text-[12px] font-semibold text-mist-2">по запросу</span>
                    ) : (
                      formatPrice(service.price)
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openBooking({ service: service.name });
                    }}
                    aria-label={`Записаться: ${service.name}`}
                    className="grid size-11 shrink-0 place-items-center rounded-xl border border-hair text-brand transition-colors hover:bg-white/5"
                  >
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="shrink-0 border-t border-hair bg-ink px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
          <p className="text-[12px] leading-relaxed text-mist-2">
            {priceDisclaimer} {priceSourceNote}
          </p>
          <button
            type="button"
            onClick={() => {
              onClose();
              openBooking();
            }}
            className="btn btn-brand mt-3 w-full"
          >
            Записаться на обслуживание
          </button>
        </div>
      </div>
    </div>
    </Portal>
  );
}
