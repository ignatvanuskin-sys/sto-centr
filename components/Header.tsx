"use client";

import { useEffect, useState } from "react";
import { CalendarPlus, Menu, MessageCircle, Phone, X } from "lucide-react";
import {
  company,
  primaryPhone,
  primaryWhatsApp,
  scheduleSummary,
} from "@/lib/company";
import { useBooking } from "./booking/BookingContext";

const NAV = [
  { href: "#uslugi", label: "Услуги и цены" },
  { href: "#o-servise", label: "О сервисе" },
  { href: "#otzyvy", label: "Отзывы" },
  { href: "#foto", label: "Фото" },
  { href: "#kontakty", label: "Контакты" },
];

/**
 * Шапка сайта: на первом экране прозрачная (фото просвечивает), после
 * прокрутки — компактная тёмная с блюром и нижней линией.
 * На телефоне меню открывается полноэкранной панелью.
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { open } = useBooking();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Escape закрывает меню; пока меню открыто, страница не прокручивается */
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled || menuOpen
            ? "border-b border-white/10 bg-ink/85 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div
          className={`wrap flex items-center justify-between gap-4 transition-all duration-300 ${
            scrolled ? "h-16" : "h-20"
          }`}
        >
          <a
            href="#top"
            className="flex min-h-[44px] min-w-0 items-center gap-3"
            aria-label={`${company.name} — в начало страницы`}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand font-extrabold text-ink">
              СЦ
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-extrabold uppercase leading-tight tracking-[0.14em] text-white">
                {company.name}
              </span>
              <span className="block truncate text-[10px] font-bold uppercase tracking-[0.22em] text-mist-2">
                {company.city} · ул. Шанырак 6а/с
              </span>
            </span>
          </a>

          <nav aria-label="Основная навигация" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="relative inline-flex min-h-[44px] items-center rounded-lg px-3 text-[14px] font-semibold text-mist transition-colors hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href={primaryPhone.href}
              className="hidden min-h-[44px] items-center gap-2 px-1 text-[14px] font-bold text-white transition-colors hover:text-brand md:inline-flex"
            >
              <Phone className="size-4 text-brand" aria-hidden="true" />
              {primaryPhone.label}
            </a>
            <button
              type="button"
              onClick={() => open()}
              className="btn btn-brand hidden px-5 py-3 text-[14px] lg:inline-flex"
            >
              <CalendarPlus className="size-4" aria-hidden="true" />
              Записаться
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-label="Открыть меню"
              className="grid size-11 place-items-center rounded-xl border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10 lg:hidden"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Полноэкранное меню на телефоне и планшете */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden ${
          menuOpen ? "" : "pointer-events-none"
        }`}
        aria-hidden={!menuOpen}
      >
        <div
          className={`absolute inset-0 bg-ink transition-opacity duration-200 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMenuOpen(false)}
        />
        <div
          className={`absolute inset-0 flex flex-col overflow-y-auto overscroll-contain px-5 pb-[calc(1.5rem_+_env(safe-area-inset-bottom))] pt-5 transition-transform duration-300 ease-out ${
            menuOpen ? "translate-y-0" : "-translate-y-3 opacity-0"
          }`}
          inert={!menuOpen}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] font-extrabold uppercase tracking-[0.2em] text-mist-2">
              Меню
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Закрыть меню"
              className="grid size-11 place-items-center rounded-xl border border-white/15 bg-white/5 text-white"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Навигация по сайту" className="mt-6">
            <ul className="flex flex-col">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-[56px] items-center border-b border-hair text-[19px] font-bold text-white transition-colors hover:text-brand"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                open();
              }}
              className="btn btn-brand min-h-[52px] w-full"
            >
              <CalendarPlus className="size-4" aria-hidden="true" />
              Записаться на обслуживание
            </button>
            <a href={primaryPhone.href} className="btn btn-outline-light min-h-[52px] w-full">
              <Phone className="size-4" aria-hidden="true" />
              {primaryPhone.label}
            </a>
            <a
              href={primaryWhatsApp.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-light min-h-[52px] w-full"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              WhatsApp
            </a>
          </div>

          <p className="mt-5 text-[13px] leading-relaxed text-mist-2">{scheduleSummary}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-mist-2">
            {company.address.street}, {company.address.city}
          </p>
        </div>
      </div>
    </>
  );
}
