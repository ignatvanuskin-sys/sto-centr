import { ExternalLink, Quote, Star } from "lucide-react";
import { company, gisReviewsLink, reviews } from "@/lib/company";

export default function Reviews() {
  return (
    <section id="otzyvy" className="scroll-mt-20 bg-ink py-14 text-white sm:py-20">
      <div className="wrap grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div>
          <p className="eyebrow text-brand">Рейтинг</p>
          <p className="mt-3 flex items-baseline gap-2">
            <Star className="size-7 fill-brand text-brand" aria-hidden="true" />
            <span className="text-5xl font-extrabold tracking-tight">
              {company.rating.value}
            </span>
          </p>
          <p className="mt-2 text-white/70">
            {company.rating.votes} оценок в 2ГИС
          </p>
          <a
            href={gisReviewsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-light mt-6 min-h-[44px] w-full xs:w-auto"
          >
            Все отзывы в 2ГИС
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </div>

        <div>
          <h2 className="section-title">Что пишут клиенты</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-white/65 sm:text-base">
            Отзывы опубликованы в карточке сервиса в 2ГИС.
          </p>

          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {reviews.map((review) => (
              <li
                key={review.author}
                className="rounded-2xl border border-white/12 bg-white/5 p-5"
              >
                <Quote className="size-5 text-brand" aria-hidden="true" />
                <blockquote className="mt-3 text-[15px] leading-relaxed text-white/85">
                  {review.text}
                </blockquote>
                <p className="mt-4 border-t border-white/10 pt-3 text-sm">
                  <span className="font-bold">{review.author}</span>
                  <span className="text-white/50"> · {review.date}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
