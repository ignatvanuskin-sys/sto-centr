import type { SVGProps } from "react";
import { company } from "@/lib/company";

/**
 * Логотип «СТО Центр» — знак-гайка с зевом ключа.
 *
 * Идея: шестигранник гайки (техничность, крепёж, ремонт) + прорезь, которая
 * одновременно читается как открытый зев гаечного ключа и как кириллическая
 * «С» — первая буква названия. Одна форма, три прочтения.
 *
 * Геометрия задана числами, а не нарисована «на глаз»: шестигранник описан
 * вокруг центра (32, 32) радиусом 31, прорезь — кольцо R=20.5 / r=10.5 с
 * раскрытием 60° вправо. Поэтому знак остаётся чистым в любом размере —
 * от favicon 16 px до печати.
 */

/** Правильный шестигранник: вершины слева и справа, плоские грани сверху и снизу */
const HEX = "M63 32 47.5 5.15 16.5 5.15 1 32 16.5 58.85 47.5 58.85Z";

/**
 * Зев ключа: внешняя дуга (300°), плоская губа, внутренняя дуга (300°) и
 * вторая губа. При `fillRule="evenodd"` вырезается из шестигранника, при
 * раздельной отрисовке заливается вторым цветом.
 */
const MOUTH = "M49.76 42.25A20.5 20.5 0 1 1 49.76 21.75L41.09 26.75A10.5 10.5 0 1 0 41.09 37.25Z";

export type LogoVariant = "brand" | "mono";

interface LogoMarkProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  /** brand — оранжевый знак со светлым зевом; mono — одноцветный, зев вырезан */
  variant?: LogoVariant;
  /** Подпись для скринридеров. Если не задана, знак считается декоративным. */
  title?: string;
}

export function LogoMark({
  variant = "brand",
  title,
  className,
  ...rest
}: LogoMarkProps) {
  const a11y = title
    ? ({ role: "img" as const, "aria-label": title } as const)
    : ({ "aria-hidden": true } as const);

  if (variant === "mono") {
    return (
      <svg
        viewBox="0 0 64 64"
        className={className}
        focusable="false"
        {...a11y}
        {...rest}
      >
        <path d={`${HEX} ${MOUTH}`} fillRule="evenodd" className="fill-current" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      focusable="false"
      {...a11y}
      {...rest}
    >
      {/* Тёмная подложка нужна только на светлых фонах — её включает вызывающий
          компонент через className, поэтому здесь только сам знак. */}
      <path d={HEX} className="fill-brand" />
      <path d={MOUTH} className="fill-white" />
    </svg>
  );
}

/**
 * Готовый логотип для шапки и подвала: знак + название + город.
 * Текст — живой HTML, а не картинка: он масштабируется, читается
 * скринридером и не зависит от загрузки шрифта.
 */
export function LogoLockup({
  className = "",
  subtitle = `${company.city} · Шанырак 6а/с`,
}: {
  className?: string;
  subtitle?: string | null;
}) {
  return (
    <span className={`flex min-w-0 items-center gap-3 ${className}`}>
      <LogoMark className="size-10 shrink-0" />
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-extrabold uppercase leading-tight tracking-[0.14em] text-white">
          {company.name}
        </span>
        {subtitle ? (
          <span className="block truncate text-[10px] font-bold uppercase tracking-[0.22em] text-mist-2">
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );
}
