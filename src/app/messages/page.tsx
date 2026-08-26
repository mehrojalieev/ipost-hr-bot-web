"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquare, Check, Send } from "lucide-react";
import { api } from "@/lib/api";
import { Message } from "@/lib/types";
import { EmptyState, Spinner, Toast } from "@/components/ui";
import { formatDate } from "@/lib/format";

type Filter = "all" | "new" | "answered";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Barchasi" },
  { key: "new", label: "Yangi" },
  { key: "answered", label: "Javob berilgan" },
];

export default function MessagesPage() {
  const [items, setItems] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ messages: Message[] }>("/api/messages")
      .then((r) => setItems(r.messages))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((m) => m.status === filter)),
    [items, filter]
  );

  async function markAnswered(m: Message) {
    const next = m.status === "answered" ? "new" : "answered";
    try {
      await api.patch(`/api/messages/${m.id}`, { status: next });
      setItems((list) =>
        list.map((x) => (x.id === m.id ? { ...x, status: next } : x))
      );
      setToast(next === "answered" ? "Javob berilgan deb belgilandi" : "Yangi deb belgilandi");
    } catch {
      setToast("Xatolik yuz berdi");
    }
  }

  return (
    <div className="animate-fade-up">
      <h1 className="text-xl font-bold text-ink-900 mb-1">Murojaatlar</h1>
      <p className="text-sm text-[var(--text-muted)] mb-4">
        Nomzodlardan kelgan xabarlar · {items.length} ta
      </p>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {FILTERS.map((f) => {
          const count =
            f.key === "all"
              ? items.length
              : items.filter((m) => m.status === f.key).length;
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-ink-900 text-white"
                  : "bg-white border border-[var(--border)] text-ink-700 hover:border-brand-300 hover:text-brand-700"
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
          <EmptyState
            icon={<MessageSquare size={24} />}
            title="Murojaatlar yo'q"
          />
        </div>
      ) : (
        <div className="space-y-2.5 mt-3">
          {filtered.map((m) => (
            <div
              key={m.id}
              className={`rounded-2xl border p-4 transition hover:shadow-sm ${
                m.status === "new"
                  ? "bg-white border-brand-500/30 hover:border-brand-400"
                  : "bg-white/70 border-[var(--border)] hover:border-brand-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-brand-500/12 grid place-items-center font-semibold text-brand-700">
                  {m.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink-900 truncate">
                      {m.name}
                    </p>
                    {m.status === "new" && (
                      <span className="h-2 w-2 rounded-full bg-brand-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {m.telegramUser} · {formatDate(m.createdAt)}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-cloud px-2.5 py-0.5 text-[11px] font-medium text-ink-700">
                  {m.topic}
                </span>
              </div>

              <p className="mt-3 text-sm text-ink-800 leading-relaxed">
                {m.text}
              </p>

              <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center gap-2">
                <button
                  onClick={() => markAnswered(m)}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors ${
                    m.status === "answered"
                      ? "text-[var(--text-muted)] bg-cloud hover:bg-slate-200"
                      : "text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20"
                  }`}
                >
                  <Check size={13} />
                  {m.status === "answered" ? "Javob berilgan" : "Javob berildi deb belgilash"}
                </button>
                <a
                  href={`https://t.me/${m.telegramUser.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 rounded-lg px-3 py-1.5 bg-brand-500/10 hover:bg-brand-500/20 transition-colors"
                >
                  <Send size={13} /> Javob yozish
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
