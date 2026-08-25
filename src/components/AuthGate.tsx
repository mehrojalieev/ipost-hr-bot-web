"use client";

import { useEffect, useState } from "react";
import { getInitData, tg } from "@/lib/api";

interface AuthUser {
  id: number;
  first_name?: string;
  username?: string;
}

type State =
  | { status: "loading" }
  | { status: "ok"; user: AuthUser }
  | { status: "denied"; reason?: string };

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const webapp = tg();
    try {
      webapp?.ready();
      webapp?.expand();
      // Rang sozlamalari faqat Telegram 6.1+ da qo'llab-quvvatlanadi
      if (webapp?.isVersionAtLeast?.("6.1")) {
        webapp.setHeaderColor?.("#0d1b2a");
        webapp.setBackgroundColor?.("#f4f7f9");
      }
    } catch {
      /* brauzerda ochilganda tg mavjud emas */
    }

    fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: getInitData() }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.ok) {
          setState({ status: "ok", user: data.user });
        } else {
          setState({ status: "denied", reason: data.reason });
        }
      })
      .catch(() => setState({ status: "denied", reason: "network" }));
  }, []);

  if (state.status === "loading") {
    return (
      <div className="min-h-dvh grid place-items-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-11 w-11 rounded-full border-[3px] border-brand-500/25 border-t-brand-500 spin" />
          <p className="text-sm text-[var(--text-muted)]">Yuklanmoqda…</p>
        </div>
      </div>
    );
  }

  if (state.status === "denied") {
    return <Denied reason={state.reason} />;
  }

  return <>{children}</>;
}

function Denied({ reason }: { reason?: string }) {
  const messages: Record<string, string> = {
    not_authorized:
      "Sizning Telegram akkauntingiz HR ro'yxatida yo'q. Administratorga murojaat qiling.",
    no_hr_configured:
      "HR ro'yxati hali sozlanmagan. Administrator HR_TELEGRAM_IDS ni to'ldirishi kerak.",
    bad_signature: "Imzo tekshiruvidan o'tmadi. Panelni bot ichidan oching.",
    no_init_data:
      "Bu panel faqat Telegram bot ichidan ochilishi kerak.",
    network: "Serverga ulanib bo'lmadi. Qayta urinib ko'ring.",
  };
  const msg =
    (reason && messages[reason]) ||
    "Ruxsat yo'q. Panel faqat HR bo'limi uchun.";

  return (
    <div className="min-h-dvh grid place-items-center bg-[var(--bg)] px-6">
      <div className="max-w-sm w-full rounded-2xl bg-white border border-[var(--border)] shadow-sm p-7 text-center animate-fade-up">
        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-ink-900 grid place-items-center text-3xl">
          🔒
        </div>
        <h1 className="text-lg font-semibold text-ink-900">Kirish cheklangan</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
          {msg}
        </p>
      </div>
    </div>
  );
}
