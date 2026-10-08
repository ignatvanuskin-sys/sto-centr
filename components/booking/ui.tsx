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
        <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-white">
          {label}
          {required ? <span className="text-brand"> *</span> : null}
        </span>
        {hint ? <span className="text-[12px] text-mist-2">{hint}</span> : null}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

/** role="alert" — скринридер сообщает об ошибке сразу после попытки отправки */
export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="mt-2 text-[13px] font-semibold text-red-400">
      {children}
    </p>
  );
}

export function StepTitle({
  step,
  title,
  text,
}: {
  step: number;
  title: string;
  text: string;
}) {
  return (
    <header className="mb-6">
      <p className="text-[12px] font-extrabold tracking-[0.2em] text-brand">
        {String(step).padStart(2, "0")}
      </p>
      <h3 className="mt-2 text-[22px] font-extrabold leading-tight tracking-[-0.01em] text-white sm:text-[26px]">
        {title}
      </h3>
      <p className="mt-2 text-[14px] leading-relaxed text-mist">{text}</p>
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
          ? "border-brand bg-brand/12 text-white"
          : "border-hair bg-white/[0.03] text-white hover:border-white/25 hover:bg-white/[0.06]",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-hair py-2.5 last:border-b-0">
      <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.12em] text-mist-2">
        {label}
      </span>
      <span className="text-right text-[14px] font-semibold text-white">{value}</span>
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
