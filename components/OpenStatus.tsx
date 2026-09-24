"use client";

import { useEffect, useState } from "react";
import { schedule } from "@/lib/company";

/**
 * Статус «Открыто / Закрыто» по реальному графику из 2ГИС.
 * Время считается по часовому поясу Кокшетау (Asia/Almaty, UTC+5),
 * дата — календарные значения в этом же поясе (без toISOString()).
 */

const TIMEZONE = "Asia/Almaty";

const WEEKDAY_TO_INDEX: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

function toMinutes(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function getLocalParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const pickup = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const weekday = pickup("weekday").slice(0, 3);
  const hour = Number(pickup("hour"));
  const minute = Number(pickup("minute"));

  return {
    weekdayIndex: WEEKDAY_TO_INDEX[weekday] ?? 0,
    minutes: hour * 60 + minute,
  };
}

type Status = { open: boolean; text: string };

function getStatus(now: Date): Status {
  const { weekdayIndex, minutes } = getLocalParts(now);

  for (let offset = 0; offset < 8; offset += 1) {
    const index = (weekdayIndex + offset) % 7;
    const day = schedule[index];
    if (!day.from || !day.to) continue;

    const from = toMinutes(day.from);
    const to = toMinutes(day.to);

    if (offset === 0) {
      if (minutes >= from && minutes < to) {
        return { open: true, text: `Открыто до ${day.to}` };
      }
      if (minutes < from) {
        return { open: false, text: `Откроется сегодня в ${day.from}` };
      }
    } else if (offset === 1) {
      return { open: false, text: `Откроется завтра в ${day.from}` };
    } else {
      return { open: false, text: `Откроется в ${day.day.toLowerCase()} в ${day.from}` };
    }
  }

  return { open: false, text: "Сейчас закрыто" };
}

export default function OpenStatus({
  className = "",
}: {
  className?: string;
}) {
  // На сервере статус не считаем: он зависит от времени посетителя.
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    const update = () => setStatus(getStatus(new Date()));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!status) {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        <span className="size-2 rounded-full bg-white/40" aria-hidden="true" />
        Пн–Пт 09:00–19:00 · Сб 09:00–18:00
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`size-2 rounded-full ${status.open ? "bg-emerald-400" : "bg-brand"}`}
        aria-hidden="true"
      />
      {status.text}
    </span>
  );
}
