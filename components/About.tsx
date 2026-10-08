import Image from "next/image";
import { allServices, company, gisLink, photos, scheduleSummary } from "@/lib/company";
import { photosNote } from "@/lib/content";

/**
 * О сервисе: большая фотография из карточки 2ГИС + короткий текст и список
 * подтверждённых данных. Никаких «мы на рынке с 2005 года» — только адрес,
 * график, направления, марки, рейтинг, оплата и объём прайса.
 */

const aboutPhoto = photos[3]; // здание сервиса с надписью «СТО» на фасаде

export default function About() {
  return (
    <section
      id="o-servise"
      className="scroll-mt-24 border-t border-hair bg-ink py-16 sm:py-20 lg:py-28"
    >
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          <div className="order-2 lg:order-1">
            <figure className="overflow-hidden rounded-3xl border border-hair">
              <Image
                src={aboutPhoto.src}
                alt={aboutPhoto.alt}
                width={aboutPhoto.width}
                height={aboutPhoto.height}
                loading="lazy"
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="h-full w-full object-cover"
              />
            </figure>
            <figcaption className="mt-3 text-[12px] leading-relaxed text-mist-2">
              {photosNote}
            </figcaption>
          </div>

          <div className="order-1 lg:order-2">
            <p className="eyebrow text-brand">
              <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
              О сервисе
            </p>
            <h2 className="section-title mt-4 text-white">
              {company.name} — автосервис в {company.address.city}
            </h2>

            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-mist sm:text-base">
              <p>
                Сервис находится по адресу {company.address.street} —{" "}
                {company.building.toLowerCase()}. В карточке 2ГИС он отмечен в
                восьми рубриках: от ремонта стартеров и генераторов до
                металлообработки, развал-схождения и компьютерной диагностики.
              </p>
              <p>
                В прайс-листе {allServices.length} позиции в двух группах:
                «Услуги» и «Ремонт 4-цилиндровых двигателей». Принимаем оплату
                наличными и переводом с карты — других способов в карточке не
                указано.
              </p>
            </div>

            <dl className="mt-8 grid gap-x-8 gap-y-0 sm:grid-cols-2">
              <div className="border-b border-hair py-3.5">
                <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-mist-2">
                  Адрес
                </dt>
                <dd className="mt-1 text-[15px] font-semibold text-white">
                  {company.address.street}, {company.address.city}
                </dd>
              </div>
              <div className="border-b border-hair py-3.5">
                <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-mist-2">
                  Режим работы
                </dt>
                <dd className="mt-1 text-[15px] font-semibold text-white">
                  {scheduleSummary}
                </dd>
              </div>
              <div className="border-b border-hair py-3.5">
                <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-mist-2">
                  Направления
                </dt>
                <dd className="mt-1 text-[15px] font-semibold text-white">
                  {company.rubrics.length} рубрик в 2ГИС
                </dd>
              </div>
              <div className="border-b border-hair py-3.5">
                <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-mist-2">
                  Марки автомобилей
                </dt>
                <dd className="mt-1 text-[15px] font-semibold text-white">
                  {company.brands.length} марок в блоке «Авторемонт»
                </dd>
              </div>
              <div className="border-b border-hair py-3.5">
                <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-mist-2">
                  Рейтинг
                </dt>
                <dd className="mt-1 text-[15px] font-semibold text-white">
                  {company.rating.value} из 5 · {company.rating.votes} оценок
                </dd>
              </div>
              <div className="border-b border-hair py-3.5">
                <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-mist-2">
                  Оплата
                </dt>
                <dd className="mt-1 text-[15px] font-semibold text-white">
                  {company.payment.join(" · ")}
                </dd>
              </div>
            </dl>

            <ul className="mt-7 flex flex-wrap gap-2">
              {company.rubrics.map((rubric) => (
                <li
                  key={rubric}
                  className="rounded-full border border-hair bg-steel px-3 py-1.5 text-[12px] font-semibold text-mist"
                >
                  {rubric}
                </li>
              ))}
            </ul>

            <p className="mt-6 text-[13px] leading-relaxed text-mist-2">
              Обслуживаем марки: {company.brands.join(" · ")}. Список указан в
              блоке «Авторемонт» карточки{" "}
              <a
                href={gisLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-mist underline decoration-mist/30 underline-offset-4 transition-colors hover:text-white"
              >
                2ГИС
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
