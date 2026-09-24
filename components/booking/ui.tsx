"use client";

import type { ReactNode } from "react";

/** Общая обвязка шагов записи: подпись поля, подсказка, сообщение об ошибке. */

export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-ink">
          {label}
          {required ? <span className="text-brand-ink"> *</span> : null}
        </span>
        {hint ? <span className="text-[12px] text-muted">{hint}</span> : null}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

/** role="alert" — скринридер сообщает об ошибке сразу после попытки отправки */
export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="mt-2 text-[13px] font-semibold text-red-700">
      {children}
    </p>
  );
}

export function StepTitle({ title, text }: { title: string; text: string }) {
  return (
    <header className="mb-5">
      <h3 className="text-[19px] font-extrabold leading-tight tracking-[-0.01em] text-ink sm:text-xl">
        {title}
      </h3>
      <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{text}</p>
    </header>
  );
}

/** Крупная кнопка-вариант (услуга, канал связи, время) */
export function ChoiceButton({
  selected,
  onClick,
  children,
  className = "",
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "w-full border text-left transition-colors",
        selected
          ? "border-brand bg-brand-soft text-ink"
          : "border-line bg-white text-ink hover:border-ink/30",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-line py-2 last:border-b-0">
      <span className="shrink-0 text-[12px] font-bold uppercase tracking-[0.08em] text-muted">
        {label}
      </span>
      <span className="text-right text-[14px] font-semibold text-ink">{value}</span>
    </div>
  );
}

/**
 * Ловушка для ботов: люди этого поля не видят. Имя `hp_nickname` и явные
 * подсказки для менеджеров паролей нужны, чтобы автозаполнение настоящего
 * посетителя случайно не заполнило ловушку.
 */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div
      className="pointer-events-none absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden"
      aria-hidden="true"
    >
      <label>
        Служебное поле
        <input
          name="hp_nickname"
          tabIndex={-1}
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore="true"
          data-form-type="other"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  );
}
