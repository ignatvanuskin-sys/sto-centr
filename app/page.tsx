import About from "@/components/About";
import BookingProvider from "@/components/booking/BookingProvider";
import Contacts from "@/components/Contacts";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MobileCta from "@/components/MobileCta";
import Reviews from "@/components/Reviews";
import Services from "@/components/Services";

export default function Home() {
  return (
    /* BookingProvider держит форму записи: её открывает любая кнопка на странице */
    <BookingProvider>
      {/* Нижний отступ = высота фиксированной панели (67px) + запас, чтобы
          раскрытая политика конфиденциальности и подвал не уходили под неё */}
      <div className="pb-[calc(7rem+env(safe-area-inset-bottom))] sm:pb-0">
        <Header />
        <main>
          <Hero />
          <Services />
          <About />
          <Reviews />
          <Gallery />
          <Contacts />
        </main>
        <Footer />
        <MobileCta />
      </div>
    </BookingProvider>
  );
}
