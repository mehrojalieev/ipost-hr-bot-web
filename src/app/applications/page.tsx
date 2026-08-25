"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Application, STATUS_LABELS } from "@/lib/types";
import { EmptyState, Spinner, StatusBadge, Toast } from "@/components/ui";
import { formatDate } from "@/lib/format";

type Filter = "all" | Application["status"];

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Barchasi" },
  { key: "new", label: "Yangi" },
  { key: "reviewing", label: "Ko'rilmoqda" },
  { key: "accepted", label: "Qabul" },
  { key: "rejected", label: "Rad" },
];

const STATUS_FLOW: Application["status"][] = [
  "new",
  "reviewing",
  "accepted",
  "rejected",
];

export default function ApplicationsPage() {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<Application | undefined>();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ applications: Application[] }>("/api/applications")
      .then((r) => setItems(r.applications))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((a) => a.status === filter)),
    [items, filter]
  );

  async function changeStatus(app: Application, status: Application["status"]) {
    try {
      await api.patch(`/api/applications/${app.id}`, { status });
      setItems((list) =>
        list.map((a) => (a.id === app.id ? { ...a, status } : a))
      );
      setOpen((o) => (o && o.id === app.id ? { ...o, status } : o));
      setToast(`Holat: ${STATUS_LABELS[status]}`);
    } catch {
      setToast("Xatolik yuz berdi");
    }
  }

  return (
    <div className="animate-fade-up">
      <h1 className="text-xl font-bold text-ink-900 mb-1">Arizalar</h1>
      <p className="text-sm text-[var(--text-muted)] mb-4">
        {items.length} ta ariza
      </p>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {FILTERS.map((f) => {
          const count =
            f.key === "all"
              ? items.length
              : items.filter((a) => a.status === f.key).length;
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-ink-900 text-white"
                  : "bg-white border border-[var(--border)] text-ink-700"
              }`}
            >
              {f.label} {count > 0 && <span className="opacity-70">· {count}</span>}
            </button>
          );
        })}
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon="📭" title="Bu bo'limda ariza yo'q" />
        </div>
      ) : (
        <div className="space-y-2.5 mt-3">
          {filtered.map((a) => (
            <button
              key={a.id}
              onClick={() => setOpen(a)}
              className="w-full text-left flex items-center gap-3 rounded-2xl bg-white border border-[var(--border)] p-3.5 active:scale-[0.99] transition"
            >
              <div className="h-11 w-11 shrink-0 rounded-full bg-brand-500/12 grid place-items-center font-semibold text-brand-700">
                {a.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900 truncate">
                  {a.name}
                </p>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {a.vacancyTitle}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={a.status} />
                <span className="text-[10px] text-slate-400">
                  {formatDate(a.createdAt)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail sheet */}
      {open && (
        <ApplicationSheet
          app={open}
          onClose={() => setOpen(undefined)}
          onStatus={(s) => changeStatus(open, s)}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function ApplicationSheet({
  app,
  onClose,
  onStatus,
}: {
  app: Application;
  onClose: () => void;
  onStatus: (s: Application["status"]) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-ink-950/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl animate-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">Ariza tafsiloti</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 grid place-items-center rounded-full text-[var(--text-muted)] hover:bg-cloud"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-brand-500/12 grid place-items-center text-xl font-bold text-brand-700">
              {app.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-ink-900 text-lg">{app.name}</p>
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
              value={app.hasResume ? "Biriktirilgan ✅" : "Yo'q"}
            />
            <Row label="Sana" value={formatDate(app.createdAt)} />
          </div>

          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)] mb-1.5">
              Ish tajribasi
            </p>
            <p className="rounded-xl bg-cloud p-3.5 text-sm text-ink-800 leading-relaxed">
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
                    className={`rounded-xl py-2.5 text-sm font-semibold transition ${
                      active
                        ? "bg-ink-900 text-white"
                        : "bg-white border border-[var(--border)] text-ink-700"
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
            className="block text-center rounded-xl bg-brand-600 text-white py-3 text-sm font-semibold active:scale-[0.99] transition"
          >
            📞 Qo&apos;ng&apos;iroq qilish
          </a>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  copy,
}: {
  label: string;
  value: string;
  copy?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--border)] px-3.5 py-2.5">
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
      <span className="text-sm font-medium text-ink-900 flex items-center gap-2">
        {value}
        {copy && (
          <button
            onClick={() => navigator.clipboard?.writeText(value)}
            className="text-brand-600 text-xs"
          >
            ⧉
          </button>
        )}
      </span>
    </div>
  );
}
