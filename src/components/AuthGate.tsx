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
  | { status: "denied"; reason?: string; myId?: number };

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const webapp = tg();
    const myId = webapp?.initDataUnsafe?.user?.id;
    try {
      webapp?.ready();
      webapp?.expand();
      // Rang sozlamalari faqat Telegram 6.1+ da qo'llab-quvvatlanadi
      if (webapp?.isVersionAtLeast?.("6.1")) {
        webapp.setHeaderColor?.("#1f3ce6");
        webapp.setBackgroundColor?.("#f1f5fb");
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
          setState({
            status: "denied",
            reason: data.reason,
            myId: data.user?.id ?? myId,
          });
        }
      })
      .catch(() => setState({ status: "denied", reason: "network", myId }));
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
    return <Denied reason={state.reason} myId={state.myId} />;
  }

  return <>{children}</>;
}

function Denied({ reason, myId }: { reason?: string; myId?: number }) {
  const messages: Record<string, string> = {
    not_authorized:
      "Telegram akkauntingiz HR ro'yxatida yo'q. Quyidagi ID'ni administratorga bering.",
    no_hr_configured:
      "HR ro'yxati hali sozlanmagan. Vercel'da HR_TELEGRAM_IDS ga quyidagi ID'ni qo'shing.",
    server_no_token:
      "Server sozlamasi to'liq emas: Vercel'da BOT_TOKEN o'rnatilmagan.",
    bad_signature:
      "Imzo tekshiruvidan o'tmadi. Vercel'dagi BOT_TOKEN bot tokeni bilan bir xil ekanini tekshiring.",
    no_init_data: "Bu panel faqat Telegram bot ichidan ochilishi kerak.",
    no_user: "Foydalanuvchi ma'lumoti topilmadi. Panelni bot ichidan oching.",
    network: "Serverga ulanib bo'lmadi. Qayta urinib ko'ring.",
  };
  const msg =
    (reason && messages[reason]) || "Ruxsat yo'q. Panel faqat HR bo'limi uchun.";

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

        {typeof myId === "number" && myId > 0 && (
          <div className="mt-5 rounded-xl bg-cloud p-4">
            <p className="text-xs text-[var(--text-muted)]">Sizning Telegram ID</p>
            <p className="mt-1 text-xl font-bold text-brand-700 tracking-wide select-all">
              {myId}
            </p>
            <p className="mt-2 text-[11px] leading-snug text-[var(--text-muted)]">
              Vercel → Settings → Environment Variables →{" "}
              <span className="font-semibold">HR_TELEGRAM_IDS</span> ga qo&apos;shing,
              so&apos;ng qayta deploy qiling.
            </p>
          </div>
        )}

        {reason && (
          <p className="mt-4 text-[10px] text-slate-400">Sabab: {reason}</p>
        )}
      </div>
    </div>
  );
}
