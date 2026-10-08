import { CalendarPlus } from "lucide-react";
import { processSteps } from "@/lib/content";
import { BookingButton } from "./booking/BookingContext";

/**
 * Как проходит запись. Шаги описывают именно работу сайта и порядок приёма
 * автомобиля — без обещаний сроков и гарантий, которых нет в источниках.
 */
export default function Process() {
  return (
    <section
      id="process"
      className="scroll-mt-24 border-t border-hair bg-ink py-16 sm:py-20 lg:py-28"
    >
      <div className="wrap">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-brand">
              <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
              Как это работает
            </p>
            <h2 className="section-title mt-4 text-white">
              Четыре шага от заявки до готового автомобиля
            </h2>
          </div>
          <BookingButton className="btn btn-brand w-full shrink-0 px-6 sm:w-auto">
            <CalendarPlus className="size-4" aria-hidden="true" />
            Записаться на обслуживание
          </BookingButton>
        </div>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
          {processSteps.map((step, index) => (
            <li key={step.title} className="relative flex flex-col">
              {/* Соединительная линия между шагами — только на широком экране */}
              {index < processSteps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute right-[-1rem] top-6 hidden h-px w-4 bg-hair lg:block"
                />
              ) : null}
              <span className="stat-number text-white/15">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-[17px] font-bold leading-snug text-white">
                {step.title}
              </h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-mist">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
