import { company, gisLink, primaryPhone } from "@/lib/company";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-ink-2 py-10 text-white/70">
      <div className="wrap flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-base font-extrabold text-white">{company.name}</p>
          <p className="mt-1 text-sm">
            {company.tagline} · {company.address.city}
          </p>
          <p className="mt-1 text-sm">{company.address.street}</p>
        </div>

        {/* Ссылки в футере тоже должны попадаться пальцем: 20px-строки были
            слишком мелкими мишенями */}
        <div className="flex flex-col gap-1 text-sm">
          <a
            href={primaryPhone.href}
            className="inline-flex min-h-[44px] items-center font-semibold text-white transition-colors hover:text-brand"
          >
            {primaryPhone.label}
          </a>
          <a
            href={gisLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center transition-colors hover:text-white"
          >
            Карточка в 2ГИС
          </a>
          <details className="group">
            <summary className="inline-flex min-h-[44px] cursor-pointer list-none items-center transition-colors hover:text-white">
              Политика конфиденциальности
            </summary>
            <p className="mt-2 max-w-md pb-2 text-[13px] leading-relaxed text-white/70">
              Сайт не содержит форм обратной связи, счётчиков и иных сборщиков
              данных: персональные данные посетителей не собираются и не
              передаются третьим лицам. Сведения о компании, прайс-лист и
              фотографии взяты из открытой карточки организации в 2ГИС.
            </p>
          </details>
        </div>
      </div>

      <div className="wrap mt-8 border-t border-white/10 pt-6 text-[13px] text-white/60">
        © {year} {company.name}, {company.address.city}
      </div>
    </footer>
  );
}
