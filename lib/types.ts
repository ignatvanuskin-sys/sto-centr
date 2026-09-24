/**
 * Типы онлайн-записи «СТО Центр».
 *
 * Формы записи в исходном ТЗ не было (автосервис жил на звонках), поэтому
 * модель данных построена по реальному прайсу и графику из карточки 2ГИС:
 * услуга выбирается из прайса с ценой, дата и время — только в рабочие часы.
 */

export const BOOKING_STATUSES = [
  "NEW",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const STATUS_LABELS: Record<BookingStatus, string> = {
  NEW: "Новая",
  CONFIRMED: "Подтверждена",
  IN_PROGRESS: "В работе",
  COMPLETED: "Завершена",
  CANCELLED: "Отменена",
};

export const CONTACT_CHANNELS = ["Телефон", "WhatsApp", "Telegram"] as const;
export type ContactChannel = (typeof CONTACT_CHANNELS)[number];

export interface Booking {
  id: string;
  /** Код для клиента, например STO-2609-004 */
  code: string;
  name: string;
  phone: string;
  channel: ContactChannel;
  telegram?: string;
  /** Марка и модель, например «Mercedes-Benz E-Класс (W211)» */
  vehicleModel: string;
  vehicleYear: string;
  vin?: string;
  /** Услуга из прайса 2ГИС (или «Другое — опишу в комментарии») */
  service: string;
  /** Цена из прайса 2ГИС на момент заявки; null — в прайсе не указана */
  price: number | null;
  /** ISO-дата YYYY-MM-DD */
  date: string;
  /** HH:MM из доступных слотов */
  time: string;
  /** «Что беспокоит» от клиента */
  comment?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  /** Служебные строки (проверки, демо) — реальные заявки клиентов не помечаются */
  demo?: boolean;
}

export type BookingInput = Omit<
  Booking,
  "id" | "code" | "status" | "createdAt" | "updatedAt" | "demo"
>;

export interface ApiError {
  ok: false;
  error: string;
  fields?: Record<string, string>;
}

export interface CreateBookingResponse {
  ok: true;
  booking: Booking;
  /** Заявка не сохранилась в базе, но ушла в Telegram сервиса */
  deliveredViaTelegramOnly?: boolean;
}

export type StorageDriverName = "kv" | "file" | "memory";

export interface ListBookingsResponse {
  ok: true;
  bookings: Booking[];
  storage?: StorageDriverName;
}

/** Вариант «не знаю, что именно» — единственная строка вне прайса. */
export const SERVICE_OTHER = "Другое — опишу в комментарии";
