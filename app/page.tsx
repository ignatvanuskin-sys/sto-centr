import About from "@/components/About";
import BookingCta from "@/components/BookingCta";
import BookingProvider from "@/components/booking/BookingProvider";
import Contacts from "@/components/Contacts";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MobileCta from "@/components/MobileCta";
import Process from "@/components/Process";
import Reveal from "@/components/Reveal";
import Reviews from "@/components/Reviews";
import Services from "@/components/Services";
import WhyUs from "@/components/WhyUs";

export default function Home() {
  return (
    /* BookingProvider держит форму записи: её открывает любая кнопка на странице */
    <BookingProvider>
      {/* Нижний отступ = высота мобильной панели действий + безопасная зона,
          чтобы подвал не уходил под кнопки. В calc() вокруг «+» обязательны
          пробелы — в Tailwind их даёт «_». */}
      <div className="pb-[calc(5.5rem_+_env(safe-area-inset-bottom))] sm:pb-0">
        <Header />
        <main>
          <Hero />
          {/* Блоки мягко проявляются при прокрутке; первый экран — сразу */}
          <Reveal>
            <Services />
          </Reveal>
          <Reveal>
            <WhyUs />
          </Reveal>
          <Reveal>
            <Process />
          </Reveal>
          <Reveal>
            <About />
          </Reveal>
          <Reveal>
            <Reviews />
          </Reveal>
          <Reveal>
            <Gallery />
          </Reveal>
          <Reveal>
            <BookingCta />
          </Reveal>
          <Reveal>
            <Contacts />
          </Reveal>
        </main>
        <Footer />
        <MobileCta />
      </div>
    </BookingProvider>
  );
}
