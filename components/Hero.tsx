import Image from "next/image";
import { CalendarPlus, MapPin, Phone, Star } from "lucide-react";
import { BookingButton } from "./booking/BookingContext";
import { company, gisReviewsLink, heroPhoto, primaryPhone } from "@/lib/company";
import OpenStatus from "./OpenStatus";

export default function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden bg-ink">
      <Image
        src={heroPhoto.src}
        alt={heroPhoto.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-[50%_45%] opacity-55"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/70 to-ink lg:bg-gradient-to-r lg:from-ink lg:via-ink/85 lg:to-ink/35"
        aria-hidden="true"
      />

      {/* py-12 вместо py-14: на 320×568 первый экран был чуть выше вьюпорта */}
      <div className="wrap relative py-12 sm:py-20 lg:py-24">
        <div className="max-w-2xl lg:max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
            {company.rubrics[0]} · {company.city}
          </p>

          <h1 className="mt-5 text-[2rem] font-extrabold leading-[1.08] tracking-tight text-white xs:text-4xl sm:text-5xl lg:text-6xl">
            {company.name}
            <span className="mt-2 block text-[1.25rem] font-bold text-brand xs:text-2xl sm:text-3xl">
              автосервис в Кокшетау
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/75 sm:text-lg">
            Ремонт стартеров и генераторов, двигателя и ходовой части,
            компьютерная диагностика, развал-схождение и сварочные работы.
          </p>

          <div className="mt-7 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
            <BookingButton className="btn btn-primary w-full xs:w-auto">
              <CalendarPlus className="size-4.5" aria-hidden="true" />
              Записаться на сервис
            </BookingButton>
            <a
              href={primaryPhone.href}
              className="btn btn-outline-light w-full xs:w-auto"
            >
              <Phone className="size-4.5" aria-hidden="true" />
              Позвонить {primaryPhone.label}
            </a>
          </div>

          <dl className="mt-8 flex flex-col gap-3 text-sm text-white/70 xs:flex-row xs:flex-wrap xs:items-center xs:gap-x-6">
            <div className="flex items-center gap-2">
              <Star className="size-4 fill-brand text-brand" aria-hidden="true" />
              <dt className="sr-only">Рейтинг</dt>
              <dd>
                <a
                  href={gisReviewsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  /* Была 19px, потом 32px — теперь честные 44px под палец */
                  className="inline-flex min-h-[44px] items-center underline decoration-white/30 underline-offset-4 transition-colors hover:text-white"
                >
                  {company.rating.value} — {company.rating.votes} оценок в 2ГИС
                </a>
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-brand" aria-hidden="true" />
              <dt className="sr-only">Адрес</dt>
              <dd>{company.address.street}, {company.city}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="sr-only">Часы работы</dt>
              <dd>
                <OpenStatus />
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
