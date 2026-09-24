import type { Metadata } from "next";
import { CalendarPlus, Wrench } from "lucide-react";
import Link from "next/link";
import AdminPanel from "@/components/admin/AdminPanel";
import { company } from "@/lib/company";

export const metadata: Metadata = {
  title: "Панель заявок — СТО Центр",
  description: "Внутренняя панель сервиса: заявки с сайта.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink">
        <div className="wrap flex h-16 items-center justify-between gap-3">
          <Link href="/" className="flex min-h-[44px] min-w-0 items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand text-ink">
              <Wrench className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-extrabold leading-tight text-white">
                {company.name}
              </span>
              <span className="block truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60">
                Панель заявок
              </span>
            </span>
          </Link>
          <Link
            href="/"
            className="btn btn-outline-light px-4 py-2.5 text-[13px]"
            prefetch={false}
          >
            <CalendarPlus className="size-4" aria-hidden="true" />К сайту
          </Link>
        </div>
      </header>
      <main>
        <AdminPanel />
      </main>
    </div>
  );
}
