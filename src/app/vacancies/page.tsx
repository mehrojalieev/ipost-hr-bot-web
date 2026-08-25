"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Wallet,
  MapPin,
  Pencil,
  Trash2,
  Pause,
  Play,
  Briefcase,
} from "lucide-react";
import { api } from "@/lib/api";
import { Vacancy, VacancyInput } from "@/lib/types";
import VacancyForm from "@/components/VacancyForm";
import {
  ConfirmDialog,
  EmptyState,
  Spinner,
  Toast,
} from "@/components/ui";

export default function VacanciesPage() {
  const [items, setItems] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Vacancy | undefined>();
  const [toDelete, setToDelete] = useState<Vacancy | undefined>();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function load() {
    api
      .get<{ vacancies: Vacancy[] }>("/api/vacancies")
      .then((r) => setItems(r.vacancies))
      .catch(() => setToast({ msg: "Yuklashda xatolik", type: "error" }))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openNew() {
    setEditing(undefined);
    setFormOpen(true);
  }
  function openEdit(v: Vacancy) {
    setEditing(v);
    setFormOpen(true);
  }

  async function handleSubmit(data: VacancyInput) {
    setSaving(true);
    try {
      if (editing) {
        const r = await api.put<{ vacancy: Vacancy }>(
          `/api/vacancies/${editing.id}`,
          data
        );
        setItems((list) =>
          list.map((v) => (v.id === editing.id ? r.vacancy : v))
        );
        setToast({ msg: "Vakansiya yangilandi", type: "success" });
      } else {
        const r = await api.post<{ vacancy: Vacancy }>("/api/vacancies", data);
        setItems((list) => [r.vacancy, ...list]);
        setToast({ msg: "Vakansiya qo'shildi", type: "success" });
      }
      setFormOpen(false);
      setEditing(undefined);
    } catch {
      setToast({ msg: "Saqlashda xatolik", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    const id = toDelete.id;
    setToDelete(undefined);
    try {
      await api.del(`/api/vacancies/${id}`);
      setItems((list) => list.filter((v) => v.id !== id));
      setToast({ msg: "Vakansiya o'chirildi", type: "success" });
    } catch {
      setToast({ msg: "O'chirishda xatolik", type: "error" });
    }
  }

  async function toggleActive(v: Vacancy) {
    try {
      const r = await api.put<{ vacancy: Vacancy }>(`/api/vacancies/${v.id}`, {
        ...v,
        active: !v.active,
      });
      setItems((list) => list.map((x) => (x.id === v.id ? r.vacancy : x)));
    } catch {
      setToast({ msg: "Xatolik", type: "error" });
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-ink-900">Vakansiyalar</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {items.length} ta lavozim
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 text-white px-4 py-2.5 text-sm font-semibold active:scale-[0.97] transition"
        >
          <Plus size={17} strokeWidth={2.5} /> Qo&apos;shish
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={24} />}
          title="Vakansiyalar yo'q"
          subtitle="“+ Qo'shish” tugmasi bilan birinchi vakansiyani yarating."
        />
      ) : (
        <div className="space-y-3">
          {items.map((v) => (
            <div
              key={v.id}
              className="rounded-2xl bg-white border border-[var(--border)] p-4"
            >
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 shrink-0 rounded-xl bg-cloud grid place-items-center text-xl">
                  {v.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-ink-900 truncate">
                      {v.title}
                    </h3>
                    {!v.active && (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">
                        Nofaol
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {v.department} · {v.employment}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-ink-700">
                    <span className="inline-flex items-center gap-1">
                      <Wallet size={13} className="text-brand-600" /> {v.salary}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={13} className="text-[var(--text-muted)]" />{" "}
                      {v.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center gap-2">
                <button
                  onClick={() => toggleActive(v)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-700 rounded-lg px-2.5 py-1.5 hover:bg-cloud"
                >
                  {v.active ? (
                    <>
                      <Pause size={13} /> Nofaol qilish
                    </>
                  ) : (
                    <>
                      <Play size={13} /> Faollashtirish
                    </>
                  )}
                </button>
                <div className="ml-auto flex gap-1.5">
                  <button
                    onClick={() => openEdit(v)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 rounded-lg px-3 py-1.5 bg-brand-500/10"
                  >
                    <Pencil size={13} /> Tahrir
                  </button>
                  <button
                    onClick={() => setToDelete(v)}
                    aria-label="O'chirish"
                    className="inline-flex items-center text-xs font-semibold text-rose-600 rounded-lg px-3 py-1.5 bg-rose-500/10"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <VacancyForm
          initial={editing}
          saving={saving}
          onSubmit={handleSubmit}
          onClose={() => {
            setFormOpen(false);
            setEditing(undefined);
          }}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Vakansiyani o'chirish"
        message={`“${toDelete?.title}” butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi.`}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(undefined)}
      />

      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
