"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { gisLink, photos } from "@/lib/company";

export default function Gallery() {
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const step = useCallback((delta: number) => {
    setActive((current) =>
      current === null
        ? current
        : (current + delta + photos.length) % photos.length,
    );
  }, []);

  useEffect(() => {
    if (active === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [active, close, step]);

  const current = active === null ? null : photos[active];

  return (
    <section id="foto" className="scroll-mt-20 bg-paper py-14 sm:py-20">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-brand-ink">Фото</p>
            <h2 className="section-title mt-2">Как выглядит сервис</h2>
          </div>
          <a
            href={gisLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center text-sm font-semibold text-muted underline decoration-line decoration-2 underline-offset-4 transition-colors hover:text-ink"
          >
            Все фото в 2ГИС
          </a>
        </div>

        <ul className="mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-x pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
          {photos.map((photo, index) => (
            <li
              key={photo.src}
              className="relative aspect-[4/3] w-[78%] shrink-0 snap-center overflow-hidden rounded-2xl border border-line bg-white sm:w-auto"
            >
              <button
                type="button"
                onClick={() => setActive(index)}
                className="group absolute inset-0"
                aria-label={`Открыть фото ${index + 1} из ${photos.length}: ${photo.alt}`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  /* Галерея далеко ниже первого экрана — грузим только по появлении */
                  loading="lazy"
                  sizes="(min-width: 640px) 33vw, 78vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                />
                <span
                  className="absolute inset-0 bg-ink/0 transition-colors group-hover:bg-ink/25"
                  aria-hidden="true"
                />
                <span
                  className="absolute bottom-3 right-3 grid size-8 place-items-center rounded-lg bg-ink/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                >
                  <Expand className="size-4" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {current && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-ink/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Просмотр фотографий"
          /* Клик по свободному полю вокруг кадра тоже закрывает просмотр */
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div className="flex items-center justify-between text-white/70">
            <span className="text-sm font-semibold">
              {(active ?? 0) + 1} / {photos.length}
            </span>
            <button
              type="button"
              onClick={close}
              className="grid size-11 place-items-center rounded-lg border border-white/20 transition-colors hover:bg-white/10"
              aria-label="Закрыть"
            >
              <X className="size-5" />
            </button>
          </div>

          <button
            type="button"
            className="relative my-4 flex-1 cursor-zoom-out"
            onClick={close}
            aria-label="Закрыть просмотр"
          >
            <Image
              src={current.src}
              alt={current.alt}
              fill
              /* sizes="100vw" заставлял телефон запрашивать 1920–3840px на кадр
                 шириной 390px: файл не успевал прийти и рамка оставалась пустой.
                 Ограничиваем реальным боксом лайтбокса (max-w-4xl ≈ 896px). */
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, 896px"
              quality={78}
              loading="eager"
              className="object-contain"
            />
          </button>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => step(-1)}
              className="btn btn-outline-light px-4 py-3"
              aria-label="Предыдущее фото"
            >
              <ChevronLeft className="size-5" />
            </button>
            <p className="line-clamp-2 text-center text-xs text-white/60 sm:text-sm">
              {current.alt}
            </p>
            <button
              type="button"
              onClick={() => step(1)}
              className="btn btn-outline-light px-4 py-3"
              aria-label="Следующее фото"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
