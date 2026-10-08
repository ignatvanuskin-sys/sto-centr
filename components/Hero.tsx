import Image from "next/image";
import {
  ArrowRight,
  CalendarPlus,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Star,
} from "lucide-react";
import {
  company,
  gisReviewsLink,
  heroPhoto,
  primaryPhone,
  primaryWhatsApp,
  scheduleSummary,
} from "@/lib/company";
import { BookingButton } from "./booking/BookingContext";
import OpenStatus from "./OpenStatus";

/**
 * Первый экран: единственное место на сайте, где фото занимает всю площадь.
 * Слева — позиционирование и две кнопки, справа — карточка с проверяемыми
 * данными из 2ГИС (рейтинг, график, адрес).
 */

interface HeroStat {
  icon: typeof Star;
  label: string;
  value: string;
  note: string;
  href?: string;
}

const stats: HeroStat[] = [
  {
    icon: Star,
    label: "Рейтинг в 2ГИС",
    value: `${company.rating.value} из 5`,
    note: `${company.rating.votes} оценок · ${company.rating.reviews} отзывов`,
    href: gisReviewsLink,
  },
  {
    icon: Clock,
    label: "График работы",
    value: "Пн–Сб",
    note: "Пн–Пт до 19:00 · Сб до 18:00",
  },
  {
    icon: MapPin,
    label: "Адрес",
    value: "Ул. Шанырак, 6а/с",
    note: `${company.address.city}, ${company.address.postalCode}`,
  },
];

export default function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden bg-ink">
      <Image
        src={heroPhoto.src}
        alt={heroPhoto.alt}
        fill
        priority
        sizes="100vw"
        quality={70}
        className="object-cover object-[50%_35%]"
      />
      {/* Затемнение: текст должен оставаться контрастным на любом кадре.
          На широком экране текст слева, поэтому справа кадр открыт сильнее —
          фотография реального сервиса видна, а не превращается в чёрный фон. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/80 to-ink lg:bg-gradient-to-r lg:from-ink lg:via-ink/85 lg:to-ink/45"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(70%_55%_at_12%_8%,rgba(255,106,26,0.22),transparent_62%)]"
      />

      <div className="wrap relative pb-14 pt-28 sm:pb-16 sm:pt-32 lg:pb-24 lg:pt-40">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-14">
          {/* min-w-0: иначе колонка не может сжаться уже min-content самой
              длинной кнопки и на 320px вылезает за вьюпорт */}
          <div className="min-w-0">
            <p className="eyebrow text-brand">
              <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
              {company.name} · {company.city}
            </p>

            <h1 className="h1-hero mt-5 max-w-2xl text-white">
              Автосервис, которому можно доверить свой автомобиль
            </h1>

            <p className="lead mt-5 max-w-xl">
              Ремонт стартеров и генераторов, бензиновых двигателей и ходовой
              части, компьютерная диагностика, развал-схождение и сварочные
              работы. Адрес, график и прайс — открытые данные из карточки
              сервиса в 2ГИС.
            </p>

            <div className="mt-8 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
              <BookingButton className="btn btn-brand w-full px-6 xs:w-auto">
                <CalendarPlus className="size-4" aria-hidden="true" />
                Записаться на обслуживание
              </BookingButton>
              <a
                href={primaryPhone.href}
                className="btn btn-outline-light w-full px-6 xs:w-auto"
              >
                <Phone className="size-4" aria-hidden="true" />
                Позвонить
              </a>
            </div>

            <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-mist-2">
              <a
                href={primaryWhatsApp.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-1.5 font-semibold text-mist underline decoration-mist/30 underline-offset-4 transition-colors hover:text-white"
              >
                <MessageCircle className="size-3.5" aria-hidden="true" />
                WhatsApp сервиса
              </a>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" aria-hidden="true" />
                {scheduleSummary}
              </span>
            </p>
          </div>

          {/* Карточка с данными 2ГИС */}
          <div className="w-full rounded-3xl border border-hair bg-ink-2/80 p-5 backdrop-blur-md sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow text-mist-2">Карточка сервиса</p>
              <span className="rounded-full border border-hair px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-mist-2">
                2ГИС
              </span>
            </div>

            <dl className="mt-5 flex flex-col">
              {stats.map(({ icon: Icon, label, value, note, href }) => {
                const body = (
                  <>
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-hair bg-white/5">
                      <Icon className="size-4.5 text-brand" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-mist-2">
                        {label}
                      </span>
                      <span className="mt-0.5 block text-[17px] font-extrabold leading-tight text-white">
                        {value}
                      </span>
                      <span className="mt-0.5 block text-[13px] leading-snug text-mist">
                        {note}
                      </span>
                    </span>
                  </>
                );

                return (
                  <div
                    key={label}
                    className="border-b border-hair py-3.5 first:pt-0 last:border-b-0 last:pb-0"
                  >
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3.5 transition-opacity hover:opacity-90"
                      >
                        {body}
                      </a>
                    ) : (
                      <div className="flex items-start gap-3.5">{body}</div>
                    )}
                  </div>
                );
              })}
            </dl>

            <p className="mt-4 flex items-center gap-2 border-t border-hair pt-4 text-[13px] font-semibold text-mist">
              <OpenStatus />
            </p>

            <a
              href="#zapis"
              className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-bold text-brand transition-colors hover:text-brand-2"
            >
              Записаться или посмотреть прайс
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
