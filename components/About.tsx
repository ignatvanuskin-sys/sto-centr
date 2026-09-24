import { CreditCard, MapPin, Star, Wrench } from "lucide-react";
import { allServices, company, scheduleSummary } from "@/lib/company";

export default function About() {
  return (
    <section id="o-servise" className="scroll-mt-20 py-14 sm:py-20">
      <div className="wrap grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
        <div>
          <p className="eyebrow text-brand-ink">О сервисе</p>
          <h2 className="section-title mt-2 max-w-xl">
            Автосервис на улице Шанырак в Кокшетау
          </h2>

          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-muted sm:text-base">
            <p>
              {company.name} — сервис, который в 2ГИС отмечен в восьми рубриках:
              ремонт стартеров и генераторов, легковой автосервис, ремонт
              бензиновых двигателей, ремонт ходовой части, компьютерная
              диагностика, развал-схождение, сварочные работы и металлообработка.
            </p>
            <p>
              Сервис находится по адресу {company.address.street} —{" "}
              {company.building.toLowerCase()}. График работы:{" "}
              {scheduleSummary}. Принимаем оплату наличными и переводом с карты.
            </p>
            <p>
              В прайс-листе {allServices.length} позиции — от осмотра автомобиля,
              замены лампочки и мелкого ремонта до капитального ремонта двигателя
              и токарно-сварочных работ.
            </p>
          </div>

          <div className="mt-7">
            <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-ink">
              Направления работ
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {company.rubrics.map((rubric) => (
                <li
                  key={rubric}
                  className="rounded-full border border-line bg-paper px-3 py-1.5 text-[13px] font-semibold text-ink"
                >
                  {rubric}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-7">
            <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-ink">
              Обслуживаем марки
            </h3>
            <p className="mt-3 text-[13px] leading-relaxed text-muted">
              {company.brands.join(" · ")}
            </p>
          </div>
        </div>

        <ul className="grid gap-3 self-start xs:grid-cols-2 lg:grid-cols-1">
          <li className="card flex items-center gap-4 p-5">
            <Star className="size-6 shrink-0 fill-brand text-brand" aria-hidden="true" />
            <div>
              <p className="text-lg font-extrabold leading-tight">
                {company.rating.value} из 5
              </p>
              <p className="text-sm text-muted">
                {company.rating.votes} оценок в 2ГИС
              </p>
            </div>
          </li>
          <li className="card flex items-center gap-4 p-5">
            <Wrench className="size-6 shrink-0 text-brand-ink" aria-hidden="true" />
            <div>
              <p className="text-lg font-extrabold leading-tight">
                {allServices.length} позиции
              </p>
              <p className="text-sm text-muted">в прайс-листе сервиса</p>
            </div>
          </li>
          <li className="card flex items-center gap-4 p-5">
            <MapPin className="size-6 shrink-0 text-brand-ink" aria-hidden="true" />
            <div>
              <p className="text-lg font-extrabold leading-tight">
                Шанырак, 6а/с
              </p>
              <p className="text-sm text-muted">{company.address.city}, 020000</p>
            </div>
          </li>
          <li className="card flex items-center gap-4 p-5">
            <CreditCard className="size-6 shrink-0 text-brand-ink" aria-hidden="true" />
            <div>
              <p className="text-lg font-extrabold leading-tight">Оплата</p>
              <p className="text-sm text-muted">{company.payment.join(" · ")}</p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
