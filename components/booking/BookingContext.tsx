"use client";

import {
  createContext,
  useContext,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

/**
 * Контекст онлайн-записи. Вынесен отдельно от провайдера и от модалки, чтобы
 * у них не было циклических импортов: модалка читает контекст, провайдер
 * рендерит модалку.
 */

export interface OpenOptions {
  /** Услуга, выбранная на карточке в разделе «Услуги и цены» */
  service?: string;
}

export interface BookingContextValue {
  isOpen: boolean;
  presetService?: string;
  open: (options?: OpenOptions) => void;
  close: () => void;
}

export const BookingContext = createContext<BookingContextValue | null>(null);

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking нужно вызывать внутри BookingProvider");
  return ctx;
}

/** Кнопка записи: услугу передаём, когда запись начинают с конкретной позиции. */
export function BookingButton({
  service,
  className = "btn btn-primary",
  children,
  ...rest
}: {
  service?: string;
  className?: string;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "className" | "children">) {
  const { open } = useBooking();
  return (
    <button
      type="button"
      onClick={() => open(service ? { service } : undefined)}
      className={className}
      {...rest}
    >
      {children}
    </button>
  );
}
