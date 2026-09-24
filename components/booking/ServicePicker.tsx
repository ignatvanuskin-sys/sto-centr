"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search, Sparkles } from "lucide-react";
import {
  allServices,
  featuredServices,
  formatPrice,
  priceUpdatedAt,
  serviceGroups,
  type Service,
} from "@/lib/company";
import { SERVICE_OTHER } from "@/lib/types";
import { ChoiceButton } from "./ui";

/**
 * Шаг 1 — выбор услуги из прайса 2ГИС вместе с ценой.
 * Услуг 93, поэтому по умолчанию показаны 8 основных, поиск ищет по всему
 * прайсу, а «показать весь прайс» раскрывает обе группы целиком.
 */

const MAX_RESULTS = 40;

/** Поиск по прайсу с учётом русских окончаний: «рейка» находит «замена рейки». */
function normaliseText(value: string): string {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stemOf(token: string): string {
  if (token.length >= 6) return token.slice(0, -2);
  if (token.length >= 5) return token.slice(0, -1);
  return token;
}

function matchesQuery(name: string, query: string, groupTitle: string): boolean {
  const haystack = `${normaliseText(name)} ${normaliseText(groupTitle)}`;
  return normaliseText(query)
    .split(" ")
    .filter(Boolean)
    .every((token) => haystack.includes(stemOf(token)));
}

function ServiceRow({
  service,
  groupTitle,
  selected,
  onSelect,
}: {
  service: Service;
  groupTitle?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <ChoiceButton selected={selected} onClick={onSelect} className="flex min-h-[52px] items-center gap-3 rounded-xl px-3.5 py-3">
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-snug">{service.name}</span>
        {groupTitle ? (
          <span className="mt-0.5 block text-[12px] text-muted">{groupTitle}</span>
        ) : null}
      </span>
      <span className="shrink-0 text-right text-[15px] font-extrabold tabular-nums">
        {service.price === null ? (
          <span className="text-[13px] font-semibold text-muted">цена по запросу</span>
        ) : (
          formatPrice(service.price)
        )}
      </span>
    </ChoiceButton>
  );
}

export default function ServicePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (name: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const found = useMemo(() => {
    if (query.trim().length < 2) return [];
    return allServices.filter((service) => {
      const group = serviceGroups.find((g) => g.items.includes(service))?.title ?? "";
      return matchesQuery(service.name, query, group);
    });
  }, [query]);

  const searching = query.trim().length >= 2;
  const visible = found.slice(0, MAX_RESULTS);
  const selectedService = allServices.find((s) => s.name === value);

  return (
    <div>
      <label className="relative block">
        <span className="sr-only">Поиск услуги в прайсе</span>
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск: диагностика, рейка, стартер, масло…"
          className="h-12 w-full rounded-xl border border-line bg-white pl-10 pr-3 text-[15px] text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-brand"
        />
      </label>

      {searching ? (
        <div className="mt-4">
          <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-muted">
            {visible.length === 0
              ? "Ничего не найдено"
              : `Найдено: ${found.length}${found.length > MAX_RESULTS ? ` (показаны первые ${MAX_RESULTS})` : ""}`}
          </p>
          {visible.length === 0 ? (
            <p className="mt-2 rounded-xl border border-line bg-white p-3.5 text-[14px] leading-relaxed text-muted">
              Такой услуги в прайсе нет. Выберите «{SERVICE_OTHER}» — мастер уточнит работы и
              стоимость после осмотра.
            </p>
          ) : (
            <div className="mt-2 flex flex-col gap-2">
              {visible.map((s) => (
                <ServiceRow
                  key={`${s.name}-search`}
                  service={s}
                  groupTitle={serviceGroups.find((g) => g.items.includes(s))?.title}
                  selected={value === s.name}
                  onSelect={() => onChange(s.name)}
                />
              ))}
            </div>
          )}
        </div>
      ) : showAll ? (
        <div className="mt-4 flex flex-col gap-5">
          {serviceGroups.map((group) => (
            <section key={group.title}>
              <h4 className="mb-2 flex items-baseline justify-between gap-2">
                <span className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-ink">
                  {group.title}
                </span>
                <span className="text-[12px] text-muted">{group.items.length} позиций</span>
              </h4>
              <div className="flex flex-col gap-1.5">
                {group.items.map((s) => (
                  <ServiceRow
                    key={`${group.title}-${s.name}`}
                    service={s}
                    selected={value === s.name}
                    onSelect={() => onChange(s.name)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.08em] text-muted">
            <Sparkles className="size-3.5 text-brand-ink" aria-hidden="true" />
            Чаще всего записывают
          </p>
          <div className="flex flex-col gap-2">
            {featuredServices.map((s) => (
              <ServiceRow
                key={s.name}
                service={s}
                selected={value === s.name}
                onSelect={() => onChange(s.name)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2">
        <ChoiceButton
          selected={value === SERVICE_OTHER}
          onClick={() => onChange(SERVICE_OTHER)}
          className="min-h-[52px] rounded-xl px-3.5 py-3"
        >
          <span className="text-[15px] font-semibold">{SERVICE_OTHER}</span>
          <span className="mt-0.5 block text-[12px] text-muted">
            Если не знаете, что нужно — мастер подскажет на месте
          </span>
        </ChoiceButton>

        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          aria-expanded={showAll}
          className="btn btn-outline w-full"
        >
          {showAll ? "Свернуть прайс" : `Показать весь прайс (${allServices.length})`}
          <ChevronDown
            className={`size-4 transition-transform ${showAll ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {selectedService ? (
        <p className="mt-3 text-[13px] leading-relaxed text-muted">
          Выбрано: <span className="font-bold text-ink">{selectedService.name}</span>
          {selectedService.price === null
            ? " — стоимость мастер подтвердит после осмотра."
            : ` — ${formatPrice(selectedService.price)} по прайсу.`}
        </p>
      ) : null}

      <p className="mt-2 text-[12px] leading-relaxed text-muted">
        Цены — из прайс-листа сервиса в 2ГИС (обновлён {priceUpdatedAt}). Итоговую стоимость мастер
        называет после осмотра автомобиля.
      </p>
    </div>
  );
}
