"use client";

import { CalendarPlus, MessageCircle, Phone } from "lucide-react";
import { primaryPhone, primaryWhatsApp } from "@/lib/company";
import { useBooking } from "./booking/BookingContext";

/**
 * Нижняя фиксированная панель — только на телефоне. Три действия, которые
 * нужны клиенту на ходу: позвонить, написать в WhatsApp, записаться.
 * Высота панели учтена отступом у страницы (app/page.tsx), а снизу добавлена
 * безопасная зона — панель не залезает на жест iPhone и не закрывает футер.
 */
export default function MobileCta() {
  const { open } = useBooking();

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-hair bg-ink/95 backdrop-blur-md sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-3 gap-2 p-2">
        <a
          href={primaryPhone.href}
          className="flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/5 px-1 text-white transition-colors active:bg-white/10"
        >
          <Phone className="size-4.5 text-brand" aria-hidden="true" />
          <span className="text-[11px] font-bold leading-none">Позвонить</span>
        </a>
        <a
          href={primaryWhatsApp.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/5 px-1 text-white transition-colors active:bg-white/10"
        >
          <MessageCircle className="size-4.5 text-brand" aria-hidden="true" />
          <span className="text-[11px] font-bold leading-none">WhatsApp</span>
        </a>
        <button
          type="button"
          onClick={() => open()}
          className="flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl bg-brand px-1 font-bold text-ink transition-colors active:bg-brand-2"
        >
          <CalendarPlus className="size-4.5" aria-hidden="true" />
          <span className="text-[11px] font-bold leading-none">Записаться</span>
        </button>
      </div>
    </div>
  );
}
