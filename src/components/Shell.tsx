"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Briefcase, Inbox } from "lucide-react";

const TABS = [
  { href: "/", label: "Boshqaruv", Icon: LayoutGrid },
  { href: "/vacancies", label: "Vakansiyalar", Icon: Briefcase },
  { href: "/applications", label: "Arizalar", Icon: Inbox },
];

// iPOST logo — tezkor strelka motividan soddalashtirilgan belgi
function IpostMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 30" className={className} fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth="3.4" strokeLinecap="round">
        <line x1="6" y1="10" x2="40" y2="10" />
        <line x1="12" y1="15" x2="46" y2="15" opacity="0.85" />
        <line x1="6" y1="20" x2="40" y2="20" />
      </g>
      <path d="M41 4 L60 15 L41 26 Z" fill="currentColor" />
    </svg>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="min-h-dvh bg-[var(--bg)] flex flex-col">
      {/* Header — iPOST brend ko'k */}
      <header className="safe-top sticky top-0 z-20 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-600 text-white shadow-sm">
        <div className="mx-auto max-w-2xl px-4 min-h-14 py-2.5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-white/15 ring-1 ring-white/20 grid place-items-center text-white">
            <IpostMark className="h-4 w-8" />
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-extrabold tracking-tight">
              iPOST <span className="font-medium text-white/70">HR</span>
            </p>
            <p className="text-[11px] text-white/70 -mt-0.5">Boshqaruv paneli</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 pt-5 pb-28">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="safe-bottom fixed bottom-0 inset-x-0 z-20 bg-white/90 backdrop-blur border-t border-[var(--border)]">
        <div className="mx-auto max-w-2xl px-2 grid grid-cols-3">
          {TABS.map((t) => {
            const active = isActive(t.href);
            const { Icon } = t;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${
                  active ? "text-brand-600" : "text-[var(--text-muted)]"
                }`}
              >
                <span
                  className={`grid place-items-center h-8 w-14 rounded-full transition-colors ${
                    active ? "bg-brand-500/12" : ""
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
