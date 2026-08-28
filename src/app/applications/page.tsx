"use client";

import { useEffect, useMemo, useState } from "react";
import { Inbox, X, Search, ChevronRight, ArrowUpDown } from "lucide-react";
import { api } from "@/lib/api";
import { Application, STATUS_LABELS } from "@/lib/types";
import {
  ConfirmDialog,
  EmptyState,
  Spinner,
  StatusBadge,
  Toast,
} from "@/components/ui";
import { ApplicationDetail } from "@/components/ApplicationDetail";
import { formatDate } from "@/lib/format";

type Filter = "all" | Application["status"];
type Sort = "new" | "old" | "status";
const PAGE = 20;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Barchasi" },
  { key: "new", label: STATUS_LABELS.new },
  { key: "reviewing", label: STATUS_LABELS.reviewing },
  { key: "accepted", label: STATUS_LABELS.accepted },
  { key: "rejected", label: STATUS_LABELS.rejected },
];

const STATUS_FILTER: Record<Application["status"], { on: string; off: string }> = {
  new: {
    on: "bg-brand-600 text-white border-brand-600",
    off: "text-brand-700 dark:text-brand-300 border-brand-500/30 hover:bg-brand-500/10",
  },
  reviewing: {
    on: "bg-amber-500 text-white border-amber-500",
    off: "text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/10",
  },
  accepted: {
    on: "bg-emerald-600 text-white border-emerald-600",
    off: "text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10",
  },
  rejected: {
    on: "bg-rose-600 text-white border-rose-600",
    off: "text-rose-700 dark:text-rose-300 border-rose-500/30 hover:bg-rose-500/10",
  },
};

const STATUS_ORDER: Record<Application["status"], number> = {
  new: 0,
  reviewing: 1,
  accepted: 2,
  rejected: 3,
};

interface ToastState {
  msg: string;
  type?: "success" | "error";
  action?: { label: string; onClick: () => void };
}

export default function ApplicationsPage() {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [vac, setVac] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("new");
  const [shown, setShown] = useState(PAGE);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [pending, setPending] = useState<{
    app: Application;
    status: Application["status"];
  } | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    api
      .get<{ applications: Application[] }>("/api/applications")
      .then((r) => {
        setItems(r.applications);
        // Kirganda ko'rilmagan (Yangi) arizalarga fokus
        if (r.applications.some((a) => a.status === "new")) setFilter("new");
      })
      .finally(() => setLoading(false));
  }, []);

  const vacancyOptions = useMemo(() => {
    const map = new Map<string, { id: string; title: string; count: number }>();
    for (const a of items) {
      const cur = map.get(a.vacancyId);
      if (cur) cur.count += 1;
      else map.set(a.vacancyId, { id: a.vacancyId, title: a.vacancyTitle, count: 1 });
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = items.filter(
      (a) =>
        (filter === "all" || a.status === filter) &&
        (vac === "all" || a.vacancyId === vac) &&
        (q === "" ||
          a.name.toLowerCase().includes(q) ||
          a.telegramUser.toLowerCase().includes(q))
    );
    list.sort((a, b) => {
      if (sort === "status") {
        const d = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        if (d !== 0) return d;
        return b.createdAt.localeCompare(a.createdAt);
      }
      return sort === "old"
        ? a.createdAt.localeCompare(b.createdAt)
        : b.createdAt.localeCompare(a.createdAt);
    });
    return list;
  }, [items, filter, vac, query, sort]);

  // Filtrlar o'zgarsa — pagination va ochiq oynani tiklaymiz
  useEffect(() => {
    setShown(PAGE);
  }, [filter, vac, query, sort]);

  // Ochiq indeks ro'yxatdan chiqib ketsa — moslаymiz (status o'zgargach avtomatik keyingisiga o'tadi)
  useEffect(() => {
    if (openIndex === null) return;
    if (filtered.length === 0) setOpenIndex(null);
    else if (openIndex >= filtered.length) setOpenIndex(filtered.length - 1);
  }, [filtered.length, openIndex]);

  const open =
    openIndex !== null && openIndex < filtered.length
      ? filtered[openIndex]
      : undefined;

  async function setStatus(app: Application, status: Application["status"]) {
    const prev = app.status;
    setItems((list) =>
      list.map((a) => (a.id === app.id ? { ...a, status } : a))
    );
    try {
      await api.patch(`/api/applications/${app.id}`, { status });
    } catch {
      setItems((list) =>
        list.map((a) => (a.id === app.id ? { ...a, status: prev } : a))
      );
      setToast({ msg: "Xatolik yuz berdi", type: "error" });
      return;
    }
    setToast({ msg: `Holat: ${STATUS_LABELS[status]}`, type: "success" });
  }

  function onStatusSelect(s: Application["status"]) {
    if (!open || open.status === s) return;
    setPending({ app: open, status: s });
  }

  const visible = filtered.slice(0, shown);

  return (
    <div className="animate-fade-up">
      <h1 className="text-xl font-bold text-content mb-1">Arizalar</h1>
      <p className="text-sm text-[var(--text-muted)] mb-4">{items.length} ta ariza</p>

      {/* Qidiruv + lavozim filtri */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ism bo'yicha qidirish…"
            className="w-full rounded-xl border border-[var(--border)] bg-surface pl-9 pr-3 py-2.5 text-sm text-content placeholder:text-[var(--text-muted)] focus:border-brand-500 outline-none"
          />
        </div>
        {vacancyOptions.length > 0 && (
          <select
            value={vac}
            onChange={(e) => setVac(e.target.value)}
            className="max-w-[42%] rounded-xl border border-[var(--border)] bg-surface px-3 py-2.5 text-sm text-content focus:border-brand-500 outline-none"
          >
            <option value="all">Barcha lavozimlar</option>
            {vacancyOptions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title} ({v.count})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Holat filtri — rangli chiplar */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {FILTERS.map((f) => {
          const count =
            f.key === "all"
              ? items.length
              : items.filter((a) => a.status === f.key).length;
          const active = filter === f.key;
          const c =
            f.key === "all"
              ? {
                  on: "bg-ink-900 dark:bg-brand-600 text-white border-ink-900 dark:border-brand-600",
                  off: "text-content border-[var(--border)] hover:border-brand-300",
                }
              : STATUS_FILTER[f.key];
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active ? c.on : `bg-surface ${c.off}`
              }`}
            >
              {f.label}
              {count > 0 && <span className="opacity-70"> · {count}</span>}
            </button>
          );
        })}
      </div>

      {/* Saralash + natija soni */}
      <div className="flex items-center justify-between mt-1 mb-3">
        <span className="text-xs text-[var(--text-muted)]">
          {filtered.length} ta ko&apos;rsatilmoqda
        </span>
        <label className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <ArrowUpDown size={14} />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-lg border border-[var(--border)] bg-surface px-2 py-1 text-content focus:border-brand-500 outline-none"
          >
            <option value="new">Yangilari birinchi</option>
            <option value="old">Eskilari birinchi</option>
            <option value="status">Holat bo&apos;yicha</option>
          </select>
        </label>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Inbox size={24} />}
          title={query ? "Hech narsa topilmadi" : "Bu bo'limda ariza yo'q"}
        />
      ) : (
        <>
          <div className="space-y-2.5">
            {visible.map((a, i) => (
              <button
                key={a.id}
                onClick={() => setOpenIndex(i)}
                className="w-full text-left flex items-center gap-3 rounded-2xl bg-surface border border-[var(--border)] p-3.5 hover:border-brand-200 hover:shadow-sm active:scale-[0.99] transition"
              >
                <div className="h-11 w-11 shrink-0 rounded-full bg-brand-500/12 grid place-items-center font-semibold text-brand-700 dark:text-brand-300">
                  {a.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-content truncate">
                    {a.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {a.vacancyTitle} · {formatDate(a.createdAt)}
                  </p>
                </div>
                <StatusBadge status={a.status} />
                <ChevronRight size={18} className="text-[var(--text-muted)] shrink-0" />
              </button>
            ))}
          </div>

          {filtered.length > shown && (
            <button
              onClick={() => setShown((s) => s + PAGE)}
              className="mt-4 w-full rounded-xl border border-[var(--border)] bg-surface py-3 text-sm font-semibold text-brand-700 dark:text-brand-300 hover:bg-cloud transition-colors"
            >
              Ko&apos;proq yuklash ({filtered.length - shown})
            </button>
          )}
        </>
      )}

      {open && (
        <ApplicationDetail
          app={open}
          pos={{ index: openIndex!, total: filtered.length }}
          onPrev={openIndex! > 0 ? () => setOpenIndex(openIndex! - 1) : undefined}
          onNext={
            openIndex! < filtered.length - 1
              ? () => setOpenIndex(openIndex! + 1)
              : undefined
          }
          onStatus={onStatusSelect}
          onClose={() => setOpenIndex(null)}
        />
      )}

      <ConfirmDialog
        open={!!pending}
        danger={pending?.status === "rejected"}
        title="Holatni o'zgartirish"
        message={
          pending
            ? `“${pending.app.name}” arizasini “${STATUS_LABELS[pending.status]}” holatiga o'tkazasizmi?`
            : ""
        }
        confirmLabel="Ha, o'zgartirish"
        onConfirm={() => {
          if (pending) setStatus(pending.app, pending.status);
          setPending(null);
        }}
        onCancel={() => setPending(null)}
      />

      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          action={toast.action}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
