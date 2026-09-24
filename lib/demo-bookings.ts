/**
 * Примеры заявок для показа панели, когда реальных обращений ещё нет.
 *
 * Это витрина интерфейса, а не данные клиентов: строки не сохраняются в
 * хранилище, помечены значком «пример» и показываются только при пустом
 * списке — вместе с честной подписью, что реальных заявок пока нет.
 * Удаляются сами, как только появляется первая настоящая заявка.
 */

import type { Booking } from "./types";

function iso(daysFromToday: number): string {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysFromToday);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function createdAt(daysAgo: number, hour: number): string {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo, hour, 12);
  return date.toISOString();
}

export const demoBookings: Booking[] = [
  {
    id: "demo-1",
    code: "STO-0001",
    name: "Айдос",
    phone: "+7 702 114 55 07",
    channel: "WhatsApp",
    vehicleModel: "Mercedes-Benz E-Класс (W211)",
    vehicleYear: "2008",
    vin: "WDB2110611A123456",
    service: "Замена рулевой рейки, гидравлической",
    price: 12000,
    date: iso(1),
    time: "10:00",
    comment: "Стук в рулевой на кочках, подтекает рейка",
    status: "NEW",
    createdAt: createdAt(0, 9),
    updatedAt: createdAt(0, 9),
    demo: true,
  },
  {
    id: "demo-2",
    code: "STO-0002",
    name: "Марина",
    phone: "+7 701 439 31 03",
    channel: "Телефон",
    vehicleModel: "Toyota Camry",
    vehicleYear: "2014",
    service: "Компьютерная диагностика",
    price: 2500,
    date: iso(0),
    time: "15:00",
    comment: "Горит Check Engine, утром плохо заводится",
    status: "CONFIRMED",
    createdAt: createdAt(1, 17),
    updatedAt: createdAt(0, 10),
    demo: true,
  },
  {
    id: "demo-3",
    code: "STO-0003",
    name: "Сергей",
    phone: "+7 705 220 88 14",
    channel: "Telegram",
    telegram: "sergey_kz",
    vehicleModel: "Kia Rio",
    vehicleYear: "2016",
    service: "Замена тормозных колодок, передние",
    price: 2000,
    date: iso(2),
    time: "09:00",
    comment: "Скрип при торможении",
    status: "IN_PROGRESS",
    createdAt: createdAt(2, 12),
    updatedAt: createdAt(0, 8),
    demo: true,
  },
  {
    id: "demo-4",
    code: "STO-0004",
    name: "Динара",
    phone: "+7 747 601 22 90",
    channel: "WhatsApp",
    vehicleModel: "Hyundai Accent",
    vehicleYear: "2012",
    service: "Развал-схождения, легковые/бусики/джипы",
    price: 3000,
    date: iso(-2),
    time: "11:00",
    comment: "Тянет вправо после замены стоек",
    status: "COMPLETED",
    createdAt: createdAt(4, 16),
    updatedAt: createdAt(2, 19),
    demo: true,
  },
  {
    id: "demo-5",
    code: "STO-0005",
    name: "Ерлан",
    phone: "+7 700 355 17 40",
    channel: "Телефон",
    vehicleModel: "Volkswagen Passat B6",
    vehicleYear: "2009",
    service: "Замена ремня ГРМ",
    price: 5000,
    date: iso(3),
    time: "12:00",
    status: "NEW",
    createdAt: createdAt(0, 11),
    updatedAt: createdAt(0, 11),
    demo: true,
  },
];
