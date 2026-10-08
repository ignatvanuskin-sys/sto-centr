import { company, gisLink, primaryPhone, primaryWhatsApp, scheduleSummary } from "@/lib/company";
import { LogoLockup } from "./Logo";

const NAV = [
  { href: "#uslugi", label: "Услуги и цены" },
  { href: "#pochemu", label: "Почему мы" },
  { href: "#process", label: "Как проходит запись" },
  { href: "#o-servise", label: "О сервисе" },
  { href: "#otzyvy", label: "Отзывы" },
  { href: "#foto", label: "Фото сервиса" },
  { href: "#zapis", label: "Онлайн-запись" },
  { href: "#kontakty", label: "Контакты" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hair bg-ink pt-14">
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr] lg:gap-12">
          <div>
            <LogoLockup subtitle={company.city} />
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-mist">
              {company.tagline}. Ремонт стартеров и генераторов, двигателей и
              ходовой части, компьютерная диагностика, развал-схождение,
              сварочные работы.
            </p>
            <p className="mt-4 text-[13px] text-mist-2">
              {company.address.street}, {company.address.city},{" "}
              {company.address.postalCode}
            </p>
          </div>

          <nav aria-label="Разделы сайта">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-mist-2">
              Разделы
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 lg:grid-cols-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="inline-flex min-h-[44px] items-center text-[14px] font-semibold text-mist transition-colors hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-mist-2">
              Связь и данные
            </p>
            <ul className="mt-3">
              <li>
                <a
                  href={primaryPhone.href}
                  className="inline-flex min-h-[44px] items-center text-[14px] font-bold text-white transition-colors hover:text-brand"
                >
                  {primaryPhone.label}
                </a>
              </li>
              <li>
                <a
                  href={primaryWhatsApp.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center text-[14px] font-semibold text-mist transition-colors hover:text-white"
                >
                  WhatsApp {primaryWhatsApp.label}
                </a>
              </li>
              <li>
                <a
                  href={gisLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center text-[14px] font-semibold text-mist transition-colors hover:text-white"
                >
                  Карточка в 2ГИС
                </a>
              </li>
            </ul>
            <p className="mt-2 text-[13px] leading-relaxed text-mist-2">{scheduleSummary}</p>
          </div>
        </div>

        <div className="mt-10 border-t border-hair py-6">
          <details className="group">
            <summary className="inline-flex min-h-[44px] cursor-pointer list-none items-center gap-2 text-[13px] font-semibold text-mist transition-colors hover:text-white">
              Как сайт обращается с данными
            </summary>
            <p className="mt-1 max-w-3xl pb-2 text-[13px] leading-relaxed text-mist-2">
              При отправке заявки сайт сохраняет имя, телефон, выбранный канал
              связи, услугу, дату и время визита, а также — если вы их указали —
              модель автомобиля, год, VIN и комментарий. Эти данные нужны только
              для связи по записи и доступны мастеру сервиса в панели заявок
              (при настройке — сообщением в Telegram). Третьим лицам они не
              передаются, аналитических счётчиков и рекламных пикселей на сайте
              нет. Сведения о компании, прайс-лист, рейтинг, отзывы и фотографии
              взяты из открытой карточки организации в 2ГИС.
            </p>
          </details>
        </div>
      </div>

      <div className="border-t border-hair">
        <div className="wrap flex flex-col gap-2 py-6 text-[13px] text-mist-2 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {company.name}, {company.address.city}
          </p>
          <p>Цены в прайсе — из 2ГИС. Итоговую стоимость мастер называет после осмотра.</p>
        </div>
      </div>
    </footer>
  );
}
