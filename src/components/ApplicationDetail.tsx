"use client";

import { useState } from "react";
import {
  Phone,
  Copy,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  MinusCircle,
  FileText,
  Loader2,
} from "lucide-react";
import { Application, STATUS_LABELS } from "@/lib/types";
import { openResume } from "@/lib/api";
import { SheetShell, StatusBadge } from "@/components/ui";
import { formatDate } from "@/lib/format";

const STATUS_FLOW: Application["status"][] = [
  "new",
  "reviewing",
  "accepted",
  "rejected",
];

const STATUS_BTN: Record<Application["status"], string> = {
  new: "bg-brand-600 text-white border-brand-600",
  reviewing: "bg-amber-500 text-white border-amber-500",
  accepted: "bg-emerald-600 text-white border-emerald-600",
  rejected: "bg-rose-600 text-white border-rose-600",
};

const STATUS_RING: Record<Application["status"], string> = {
  new: "ring-brand-500/30",
  reviewing: "ring-amber-500/30",
  accepted: "ring-emerald-500/30",
  rejected: "ring-rose-500/30",
};

export function ApplicationDetail({
  app,
  pos,
  onPrev,
  onNext,
  onStatus,
  onClose,
}: {
  app: Application;
  pos?: { index: number; total: number };
  onPrev?: () => void;
  onNext?: () => void;
  onStatus: (status: Application["status"]) => void;
  onClose: () => void;
}) {
  const [resumeState, setResumeState] = useState<
    "idle" | "loading" | "error" | "notfound"
  >("idle");

  async function handleResume() {
    setResumeState("loading");
    const r = await openResume(app.id);
    setResumeState(r === "ok" ? "idle" : r === "not_found" ? "notfound" : "error");
  }

  return (
    <SheetShell onClose={onClose}>
      {(close) => (
        <>
          <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur px-5 py-4 border-b border-[var(--border)] flex items-center justify-between gap-2">
            <h2 className="font-semibold text-content">Ariza tafsiloti</h2>
            <div className="flex items-center gap-1">
              {pos && (
                <>
                  <button
                    onClick={onPrev}
                    disabled={!onPrev}
                    aria-label="Oldingi"
                    className="h-8 w-8 grid place-items-center rounded-full text-[var(--text-muted)] hover:bg-cloud disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-xs font-medium text-[var(--text-muted)] tabular-nums w-11 text-center">
                    {pos.index + 1} / {pos.total}
                  </span>
                  <button
                    onClick={onNext}
                    disabled={!onNext}
                    aria-label="Keyingi"
                    className="h-8 w-8 grid place-items-center rounded-full text-[var(--text-muted)] hover:bg-cloud disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <span className="mx-1 h-5 w-px bg-[var(--border)]" />
                </>
              )}
              <button
                onClick={close}
                aria-label="Yopish"
                className="h-8 w-8 grid place-items-center rounded-full text-[var(--text-muted)] hover:bg-cloud"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-5">
            <div className="flex items-center gap-3">
              <div
                className={`h-14 w-14 rounded-2xl bg-brand-500/12 grid place-items-center text-xl font-bold text-brand-700 dark:text-brand-300 ring-2 ${STATUS_RING[app.status]}`}
              >
                {app.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-content text-lg">{app.name}</p>
                <StatusBadge status={app.status} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <Row label="Lavozim" value={app.vacancyTitle} />
              <Row label="Telefon" value={app.phone} copy />
              <Row label="Yosh" value={app.age} />
              <Row label="Telegram" value={app.telegramUser} />
              <Row
                label="Rezyume"
                value={
                  app.hasResume
                    ? app.resumeName || "Biriktirilgan"
                    : "Yo'q"
                }
                ok={app.hasResume}
              />
              <Row label="Sana" value={formatDate(app.createdAt)} />
            </div>

            {app.hasResume && (
              <div>
                <button
                  onClick={handleResume}
                  disabled={resumeState === "loading"}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-brand-500/30 bg-brand-500/10 text-brand-700 dark:text-brand-300 py-2.5 text-sm font-semibold hover:bg-brand-500/20 disabled:opacity-60 transition"
                >
                  {resumeState === "loading" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <FileText size={16} />
                  )}
                  Rezyumeni ochish
                </button>
                {resumeState === "notfound" && (
                  <p className="mt-1.5 text-xs text-amber-600 text-center">
                    Rezyume fayli topilmadi.
                  </p>
                )}
                {resumeState === "error" && (
                  <p className="mt-1.5 text-xs text-rose-600 text-center">
                    Ochishda xatolik. Qayta urinib ko&apos;ring.
                  </p>
                )}
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] mb-1.5">
                Ish tajribasi
              </p>
              <p className="rounded-xl bg-cloud p-3.5 text-sm text-content leading-relaxed">
                {app.experience || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] mb-2">
                Holatni o&apos;zgartirish
              </p>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_FLOW.map((s) => {
                  const active = app.status === s;
                  return (
                    <button
                      key={s}
                      onClick={() => onStatus(s)}
                      className={`rounded-xl py-2.5 text-sm font-semibold border transition ${
                        active
                          ? STATUS_BTN[s]
                          : "bg-surface border-[var(--border)] text-content hover:border-brand-300 hover:bg-brand-500/5"
                      }`}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  );
                })}
              </div>
            </div>

            <a
              href={`tel:${app.phone.replace(/\s/g, "")}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 text-white py-3 text-sm font-semibold hover:bg-brand-700 active:scale-[0.99] transition"
            >
              <Phone size={16} /> Qo&apos;ng&apos;iroq qilish
            </a>
          </div>
        </>
      )}
    </SheetShell>
  );
}

function Row({
  label,
  value,
  copy,
  ok,
}: {
  label: string;
  value: string;
  copy?: boolean;
  ok?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--border)] px-3.5 py-2.5">
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
      <span className="text-sm font-medium text-content flex items-center gap-2">
        {ok === true && <CheckCircle2 size={15} className="text-emerald-600" />}
        {ok === false && (
          <MinusCircle size={15} className="text-[var(--text-muted)]" />
        )}
        {value}
        {copy && (
          <button
            onClick={() => navigator.clipboard?.writeText(value)}
            aria-label="Nusxalash"
            className="text-brand-600"
          >
            <Copy size={14} />
          </button>
        )}
      </span>
    </div>
  );
}
