import { BadgeCheck } from "lucide-react";
import { gisLink, company } from "@/lib/company";
import { whyUs } from "@/lib/content";

/**
 * Блок «Почему СТО Центр». Каждый пункт опирается на карточку 2ГИС:
 * количество рубрик, позиции прайса, рейтинг, марки, способы оплаты.
 * Никаких «20 лет опыта» и «гарантии на все работы» — этих данных нет.
 */
export default function WhyUs() {
  return (
    <section
      id="pochemu"
      className="scroll-mt-24 border-t border-hair bg-ink-2 py-16 sm:py-20 lg:py-28"
    >
      <div className="wrap">
        <div className="max-w-2xl">
          <p className="eyebrow text-brand">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
            Почему {company.name}
          </p>
          <h2 className="section-title mt-4 text-white">
            Только проверяемые факты, без обещаний
          </h2>
          <p className="lead mt-4">
            Всё, что ниже, можно сверить с открытой карточкой сервиса в 2ГИС:
            рубрики, прайс, рейтинг и способы оплаты. Если факта нет в карточке —
            его нет и на сайте.
          </p>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {whyUs.map((item) => (
            <li
              key={item.title}
              className="group flex flex-col rounded-2xl border border-hair bg-ink p-5 transition-colors hover:border-brand/40 lg:p-6"
            >
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-hair bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-mist">
                <BadgeCheck className="size-3.5 text-brand" aria-hidden="true" />
                {item.label}
              </span>
              <h3 className="mt-4 text-[17px] font-bold leading-snug text-white lg:text-[18px]">
                {item.title}
              </h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-mist">{item.text}</p>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-[13px] text-mist-2">
          Источник данных —{" "}
          <a
            href={gisLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-mist underline decoration-mist/30 underline-offset-4 transition-colors hover:text-white"
          >
            карточка «{company.name}» в 2ГИС
          </a>
          . Данные не дополнялись и не приукрашивались.
        </p>
      </div>
    </section>
  );
}
