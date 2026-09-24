import { CalendarPlus, Wrench } from "lucide-react";
import { company, primaryPhone } from "@/lib/company";
import { BookingButton } from "./booking/BookingContext";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 backdrop-blur supports-[backdrop-filter]:bg-ink/85">
      <div className="wrap flex h-16 items-center justify-between gap-3">
        <a
          href="#top"
          className="flex min-h-[44px] min-w-0 items-center gap-2.5"
          aria-label={`${company.name} — на главную`}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand text-ink">
            <Wrench className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-extrabold leading-tight tracking-tight text-white">
              {company.name}
            </span>
            {/* На мобильном остаётся только название — как в макете «название + CTA» */}
            <span className="hidden truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60 sm:block">
              {company.tagline}
            </span>
          </span>
        </a>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href={primaryPhone.href}
            className="hidden min-h-[44px] items-center text-sm font-semibold text-white/75 transition-colors hover:text-white md:inline-flex"
          >
            {primaryPhone.label}
          </a>
          <BookingButton className="btn btn-primary px-4 py-2.5 text-sm">
            <CalendarPlus className="size-4" aria-hidden="true" />
            Записаться
          </BookingButton>
        </div>
      </div>
    </header>
  );
}
