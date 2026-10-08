/**
 * Поиск по прайсу 2ГИС. Используется и в каталоге цен на странице,
 * и на шаге «что нужно сделать» в форме записи — правила поиска одни.
 */

import { allServices, serviceGroups, type Service } from "./company";

/** Строка услуги вместе с её группой прайса */
export interface PricedService extends Service {
  group: string;
}

/** Все 93 позиции прайса с названием группы */
export const pricedServices: PricedService[] = allServices.map((service) => ({
  ...service,
  group: serviceGroups.find((g) => g.items.includes(service))?.title ?? "",
}));

/** «Замена рейки» и «рейка» должны находиться по одному запросу */
export function normaliseText(value: string): string {
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

export function matchesQuery(
  name: string,
  query: string,
  groupTitle = "",
): boolean {
  const haystack = `${normaliseText(name)} ${normaliseText(groupTitle)}`;
  return normaliseText(query)
    .split(" ")
    .filter(Boolean)
    .every((token) => haystack.includes(stemOf(token)));
}

/** Поиск по всему прайсу. Пустой запрос возвращает пустой список. */
export function searchPrice(query: string): PricedService[] {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  return pricedServices.filter((service) =>
    matchesQuery(service.name, trimmed, service.group),
  );
}

/** Сколько позиций прайса в каждой группе — для подписей каталога. */
export const priceGroups = serviceGroups.map((group) => ({
  title: group.title,
  count: group.items.length,
}));
