"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import BookingModal from "./BookingModal";
import { BookingContext, type OpenOptions } from "./BookingContext";

/** Точка монтирования записи: форма живёт рядом со страницей и открывается из любого блока. */
export default function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [presetService, setPresetService] = useState<string | undefined>(undefined);

  const open = useCallback((options?: OpenOptions) => {
    setPresetService(options?.service);
    setIsOpen(true);
  }, []);

  /* Закрытие сбрасывает и услугу: иначе при открытии из нижней панели в форме
     оставалась позиция, выбранная в прошлый раз из карточки услуги. */
  const close = useCallback(() => {
    setIsOpen(false);
    setPresetService(undefined);
  }, []);

  const value = useMemo(
    () => ({ isOpen, presetService, open, close }),
    [isOpen, presetService, open, close],
  );

  return (
    <BookingContext.Provider value={value}>
      {children}
      <BookingModal />
    </BookingContext.Provider>
  );
}

export { BookingButton, useBooking } from "./BookingContext";
