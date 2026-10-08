"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Портал в `document.body` для модальных окон.
 *
 * Зачем: секции страницы обёрнуты в `Reveal`, а тот анимирует `translate`.
 * Любое значение `translate`/`transform` (даже нулевое) делает обёртку
 * containing block для `position: fixed` — модалка внутри такой секции
 * позиционируется от неё, а не от вьюпорта, и её `z-index` запирается в
 * stacking context обёртки (шапка сайта начинала рисоваться поверх лайтбокса).
 * Портал выносит окно прямо в `body`, где ни то, ни другое не мешает.
 */
export default function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  /* На сервере и до гидратации окон нет: они и так открываются по клику */
  if (!mounted) return null;

  return createPortal(children, document.body);
}
