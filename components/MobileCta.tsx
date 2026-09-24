import { CalendarPlus, Phone } from "lucide-react";
import { primaryPhone } from "@/lib/company";
import { BookingButton } from "./booking/BookingContext";

/** Нижняя фиксированная панель действий — только на мобильных. */
export default function MobileCta() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 backdrop-blur sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-2 gap-2 p-3">
        <BookingButton className="btn btn-primary py-3 text-[15px]">
          <CalendarPlus className="size-4" aria-hidden="true" />
          Записаться
        </BookingButton>
        <a href={primaryPhone.href} className="btn btn-outline-light py-3 text-[15px]">
          <Phone className="size-4" aria-hidden="true" />
          Позвонить
        </a>
      </div>
    </div>
  );
}
