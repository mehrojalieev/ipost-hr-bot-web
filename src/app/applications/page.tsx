"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Phone,
  Copy,
  Inbox,
  X,
  Search,
  ChevronRight,
  CheckCircle2,
  MinusCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { Application, STATUS_LABELS } from "@/lib/types";
import {
  ConfirmDialog,
  EmptyState,
  SheetShell,
  Spinner,
  StatusBadge,
  Toast,
} from "@/components/ui";
import { formatDate } from "@/lib/format";

type Filter = "all" | Application["status"];

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Barchasi" },
  { key: "new", label: STATUS_LABELS.new },
  { key: "reviewing", label: STATUS_LABELS.reviewing },
  { key: "accepted", label: STATUS_LABELS.accepted },
  { key: "rejected", label: STATUS_LABELS.rejected },
];

// Filter chip ranglari — status badge bilan bir xil
const STATUS_FILTER: Record<Application["status"], { on: string; off: string }> = {
  new: {
    on: "bg-brand-600 text-white border-brand-600",
    off: "text-brand-700 border-brand-500/30 hover:bg-brand-500/10",
  },
  reviewing: {
    on: "bg-amber-500 text-white border-amber-500",
    off: "text-amber-700 border-amber-500/30 hover:bg-amber-500/10",
  },
  accepted: {
    on: "bg-emerald-600 text-white border-emerald-600",
    off: "text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/10",
  },
  rejected: {
    on: "bg-rose-600 text-white border-rose-600",
    off: "text-rose-700 border-rose-500/30 hover:bg-rose-500/10",
  },
};

const STATUS_FLOW: Application["status"][] = [
  "new",
  "reviewing",
  "accepted",
  "rejected",
];

// Sheet ichidagi holat tugmasi ranglari
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

export default function ApplicationsPage() {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [vac, setVac] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Application | undefined>();
  const [pendingStatus, setPendingStatus] = useState<Application["status"] | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ applications: Application[] }>("/api/applications")
      .then((r) => setItems(r.applications))
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
    return items.filter(
      (a) =>
        (filter === "all" || a.status === filter) &&
        (vac === "all" || a.vacancyId === vac) &&
        (q === "" ||
          a.name.toLowerCase().includes(q) ||
          a.telegramUser.toLowerCase().includes(q))
    );
  }, [items, filter, vac, query]);

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
      <h1 className="text-xl font-bold text-content mb-1">Arizalar</h1>
      <p className="text-sm text-[var(--text-muted)] mb-4">
        {items.length} ta ariza
      </p>

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
                  on: "bg-ink-900 text-white border-ink-900",
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

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={<Inbox size={24} />}
            title={query ? "Hech narsa topilmadi" : "Bu bo'limda ariza yo'q"}
          />
        </div>
      ) : (
        <div className="space-y-2.5 mt-3">
          {filtered.map((a) => (
            <button
              key={a.id}
              onClick={() => setOpen(a)}
              className="w-full text-left flex items-center gap-3 rounded-2xl bg-surface border border-[var(--border)] p-3.5 hover:border-brand-200 hover:shadow-sm active:scale-[0.99] transition"
            >
              <div
                className={`h-11 w-11 shrink-0 rounded-full bg-brand-500/12 grid place-items-center font-semibold text-brand-700 ring-2 ${
                  STATUS_RING[a.status]
                }`}
              >
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
              <ChevronRight
                size={18}
                className="text-[var(--text-muted)] shrink-0"
              />
            </button>
          ))}
        </div>
      )}

      {/* Detail sheet */}
      {open && (
        <ApplicationSheet
          app={open}
          onClose={() => setOpen(undefined)}
          onStatus={(s) => {
            if (open.status !== s) setPendingStatus(s);
          }}
        />
      )}

      <ConfirmDialog
        open={!!open && !!pendingStatus}
        danger={pendingStatus === "rejected"}
        title="Holatni o'zgartirish"
        message={
          open && pendingStatus
            ? `“${open.name}” arizasini “${STATUS_LABELS[pendingStatus]}” holatiga o'tkazasizmi?`
            : ""
        }
        confirmLabel="Ha, o'zgartirish"
        onConfirm={() => {
          if (open && pendingStatus) changeStatus(open, pendingStatus);
          setPendingStatus(null);
        }}
        onCancel={() => setPendingStatus(null)}
      />

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
    <SheetShell onClose={onClose}>
      {(close) => (
        <>
          <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="font-semibold text-content">Ariza tafsiloti</h2>
            <button
              onClick={close}
              aria-label="Yopish"
              className="h-8 w-8 grid place-items-center rounded-full text-[var(--text-muted)] hover:bg-cloud"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 space-y-5">
            <div className="flex items-center gap-3">
              <div
                className={`h-14 w-14 rounded-2xl bg-brand-500/12 grid place-items-center text-xl font-bold text-brand-700 ring-2 ${STATUS_RING[app.status]}`}
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
                value={app.hasResume ? "Biriktirilgan" : "Yo'q"}
                ok={app.hasResume}
              />
              <Row label="Sana" value={formatDate(app.createdAt)} />
            </div>

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
        {ok === false && <MinusCircle size={15} className="text-[var(--text-muted)]" />}
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
