import { ExternalLink, Quote, Star } from "lucide-react";
import { company, gisReviewsLink, reviews } from "@/lib/company";
import { reviewsNote } from "@/lib/content";

/**
 * Отзывы и рейтинг. Цифры — из карточки 2ГИС, тексты не редактировались.
 * На телефоне карточки листаются горизонтально (CSS scroll-snap, без JS).
 */
export default function Reviews() {
  const stars = Math.round(company.rating.value);

  return (
    <section
      id="otzyvy"
      className="scroll-mt-24 border-t border-hair bg-ink-2 py-16 sm:py-20 lg:py-28"
    >
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-14">
          <div>
            <p className="eyebrow text-brand">
              <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
              Отзывы
            </p>
            <p className="mt-5 flex items-baseline gap-3">
              <span className="stat-number text-white">
                {String(company.rating.value).replace(".", ",")}
              </span>
              <span className="text-[15px] font-semibold text-mist-2">из 5</span>
            </p>
            <p className="mt-3 flex items-center gap-1.5" aria-hidden="true">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  className={`size-4 ${
                    index < stars ? "fill-brand text-brand" : "text-hair"
                  }`}
                />
              ))}
            </p>
            <p className="mt-3 text-[15px] text-mist">
              {company.rating.votes} оценок · {company.rating.reviews} отзывов в 2ГИС
            </p>

            <a
              href={gisReviewsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-light mt-6 w-full px-5 xs:w-auto"
            >
              Все отзывы в 2ГИС
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </div>

          <div className="min-w-0">
            <h2 className="section-title text-white">Что пишут клиенты</h2>
            <p className="lead mt-4 max-w-xl">{reviewsNote}</p>

            {/* На телефоне — горизонтальная лента со снапом, на десктопе — сетка */}
            <ul className="mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-x no-scrollbar pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0">
              {reviews.map((review) => (
                <li
                  key={review.author}
                  className="flex w-[85%] shrink-0 snap-center flex-col rounded-2xl border border-hair bg-ink p-5 sm:w-auto"
                >
                  <Quote className="size-5 shrink-0 text-brand" aria-hidden="true" />
                  <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-white/90">
                    {review.text}
                  </blockquote>
                  <p className="mt-4 border-t border-hair pt-3 text-[13px]">
                    <span className="font-bold text-white">{review.author}</span>
                    <span className="text-mist-2"> · {review.date}</span>
                  </p>
                </li>
              ))}
            </ul>

            <p className="mt-5 text-[13px] leading-relaxed text-mist-2">
              Часть отзывов в 2ГИС содержит претензии к ценам — мы не подбирали
              только положительные. Открытая лента доступна по ссылке слева.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
