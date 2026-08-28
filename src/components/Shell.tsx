"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Briefcase, Inbox, MessageSquare } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { SHOW_MESSAGES } from "@/lib/features";

const ALL_TABS = [
  { href: "/", label: "Boshqaruv", Icon: LayoutGrid },
  { href: "/vacancies", label: "Vakansiyalar", Icon: Briefcase },
  { href: "/applications", label: "Arizalar", Icon: Inbox },
  { href: "/messages", label: "Murojaatlar", Icon: MessageSquare },
];
const TABS = ALL_TABS.filter((t) => SHOW_MESSAGES || t.href !== "/messages");

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="h-dvh bg-[var(--bg)] flex flex-col overflow-hidden">
      {/* Header — iPOST brend ko'k */}
      <header className="safe-top shrink-0 z-20 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-600 text-white shadow-sm">
        <div className="mx-auto max-w-2xl px-4 min-h-14 py-2.5 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ipost-mark-light.png"
            alt="iPOST"
            className="h-6 w-auto"
          />
          <div className="leading-tight">
            <p className="text-[15px] font-extrabold tracking-tight">
              iPOST <span className="font-medium text-white/70">JOBS</span>
            </p>
            <p className="text-[11px] text-white/70 -mt-0.5">HR boshqaruv paneli</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Content — faqat shu joy scroll bo'ladi */}
      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4 pt-5 pb-6">{children}</div>
      </main>

      {/* Bottom nav */}
      <nav className="safe-bottom shrink-0 z-20 bg-surface/95 backdrop-blur border-t border-[var(--border)]">
        <div
          className={`mx-auto max-w-2xl px-2 grid ${
            TABS.length === 4 ? "grid-cols-4" : "grid-cols-3"
          }`}
        >
          {TABS.map((t) => {
            const active = isActive(t.href);
            const { Icon } = t;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors hover:text-brand-600 dark:hover:text-brand-400 ${
                  active
                    ? "text-brand-600 dark:text-brand-400"
                    : "text-[var(--text-muted)]"
                }`}
              >
                <span
                  className={`grid place-items-center h-8 w-14 rounded-full transition-colors ${
                    active ? "bg-brand-500/12 dark:bg-brand-500/20" : ""
                  }`}
                >
                  <Icon size={20} strokeWidth={active ? 2.4 : 2} />
                </span>
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
