"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, ExternalLink, X } from "lucide-react";
import { gisLink, photos } from "@/lib/company";
import { photosNote } from "@/lib/content";
import Portal from "./Portal";

/**
 * Галерея: bento-сетка на десктопе, горизонтальная свайп-лента на телефоне,
 * полноэкранный просмотр по клику (стрелки, Escape, свайп).
 *
 * Фотографии — только реальные кадры из карточки 2ГИС, без стока.
 */

type Photo = (typeof photos)[number];

interface BentoCell {
  photo: Photo;
  span: string;
}

/** 1 большая (2×2), 4 обычных, 1 широкая и 1 вытянутая — 3 ряда по 4 клетки */
const bento: BentoCell[] = [
  { photo: photos[0], span: "lg:col-span-2 lg:row-span-2" },
  { photo: photos[1], span: "" },
  { photo: photos[3], span: "" },
  { photo: photos[2], span: "" },
  { photo: photos[4], span: "" },
  { photo: photos[5], span: "lg:col-span-2" },
  { photo: photos[6], span: "lg:col-span-2" },
];

export default function Gallery() {
  const [active, setActive] = useState<number | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setActive(null), []);
  const step = useCallback((delta: number) => {
    setActive((current) =>
      current === null
        ? current
        : (current + delta + photos.length) % photos.length,
    );
  }, []);

  const openAt = useCallback((index: number, trigger: HTMLElement) => {
    restoreFocusRef.current = trigger;
    setActive(index);
  }, []);

  useEffect(() => {
    if (active === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };

    document.addEventListener("keydown", onKeyDown);
    const previousBody = document.body.style.overflow;
    const previousHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousBody;
      document.documentElement.style.overflow = previousHtml;
      restoreFocusRef.current?.focus?.();
    };
  }, [active, close, step]);

  const current = active === null ? null : photos[active];

  return (
    <section
      id="foto"
      className="scroll-mt-24 border-t border-hair bg-ink py-16 sm:py-20 lg:py-28"
    >
      <div className="wrap">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-brand">
              <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
              Фотографии
            </p>
            <h2 className="section-title mt-4 text-white">Как выглядит сервис</h2>
            <p className="lead mt-4">{photosNote}</p>
          </div>
          <a
            href={gisLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] shrink-0 items-center gap-2 text-[14px] font-bold text-mist transition-colors hover:text-white"
          >
            Все фото в 2ГИС
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </div>

        <ul className="mt-9 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-x no-scrollbar pb-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:pb-0 lg:mt-12 lg:auto-rows-[10.5rem] lg:grid-cols-4">
          {bento.map(({ photo, span }) => (
            <li
              key={photo.src}
              className={`relative aspect-[4/3] w-[78%] shrink-0 snap-center overflow-hidden rounded-2xl border border-hair bg-steel sm:w-auto lg:aspect-auto ${span}`}
            >
              <button
                type="button"
                onClick={(event) => openAt(photos.indexOf(photo), event.currentTarget)}
                className="group absolute inset-0"
                aria-label={`Открыть фото: ${photo.alt}`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  loading="lazy"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 78vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/0 to-ink/0 opacity-70 transition-opacity group-hover:opacity-95"
                />
                <span
                  aria-hidden="true"
                  className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-xl border border-white/20 bg-ink/70 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
                >
                  <Expand className="size-4" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {current ? (
        /* Портал: иначе translate у обёртки Reveal ломает fixed и z-index */
        <Portal>
        <div
          className="anim-backdrop fixed inset-0 z-[70] flex flex-col bg-ink/95"
          role="dialog"
          aria-modal="true"
          aria-label="Просмотр фотографий сервиса"
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            const start = touchStartX.current;
            const end = event.changedTouches[0]?.clientX ?? null;
            touchStartX.current = null;
            if (start === null || end === null) return;
            const delta = end - start;
            /* Свайп: порог 48px, чтобы случайное касание не листало галерею */
            if (Math.abs(delta) > 48) step(delta < 0 ? 1 : -1);
          }}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <span className="text-[13px] font-bold tabular-nums text-mist">
              {(active ?? 0) + 1} / {photos.length}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Закрыть просмотр"
              className="grid size-11 place-items-center rounded-xl border border-hair text-white transition-colors hover:bg-white/10"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div
            ref={panelRef}
            tabIndex={-1}
            className="anim-zoom relative mx-4 min-h-0 flex-1 outline-none sm:mx-6"
          >
            <Image
              key={current.src}
              src={current.src}
              alt={current.alt}
              fill
              /* Ограничиваем реальным боксом лайтбокса: sizes="100vw" заставлял
                 телефон запрашивать 1920–3840px на кадр шириной 390px */
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 88vw, 1100px"
              quality={80}
              className="object-contain"
            />
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6">
            <button
              type="button"
              onClick={() => step(-1)}
              className="btn btn-outline-light size-11 shrink-0 p-0"
              aria-label="Предыдущее фото"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <p className="line-clamp-2 min-w-0 text-center text-[12px] leading-snug text-mist sm:text-[13px]">
              {current.alt}
            </p>
            <button
              type="button"
              onClick={() => step(1)}
              className="btn btn-outline-light size-11 shrink-0 p-0"
              aria-label="Следующее фото"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
           </div>
         </div>
         </Portal>
       ) : null}
     </section>
   );
 }
