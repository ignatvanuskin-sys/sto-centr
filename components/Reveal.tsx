"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Мягкое появление блока при прокрутке.
 *
 * Важное: содержимое не прячется в HTML. Скрываем блок только после
 * монтирования и только если он ниже экрана — так страница остаётся читаемой
 * без JavaScript. При `prefers-reduced-motion: reduce` анимация не включается
 * (в globals.css для этого случая уже срезаны все длительности).
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  /** Задержка в миллисекундах — для лёгкого «каскада» соседних блоков */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (node.getBoundingClientRect().top < window.innerHeight) return;

    setHidden(true);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          /* Показываем и тогда, когда блок уже прошёл выше экрана: при быстром
             переходе по якорю содержимое не должно остаться невидимым. */
          if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight) {
            setHidden(false);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-700 ease-out ${
        hidden ? "translate-y-6 opacity-0" : "translate-y-0 opacity-100"
      } ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
