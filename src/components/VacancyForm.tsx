"use client";

import { useState } from "react";
import {
  EMOJI_OPTIONS,
  EMPLOYMENT_OPTIONS,
  Vacancy,
  VacancyInput,
} from "@/lib/types";

const empty: VacancyInput = {
  title: "",
  emoji: "💼",
  department: "",
  employment: "To'liq stavka",
  salary: "",
  location: "",
  description: "",
  requirements: [],
  active: true,
};

export default function VacancyForm({
  initial,
  saving,
  onSubmit,
  onClose,
}: {
  initial?: Vacancy;
  saving: boolean;
  onSubmit: (data: VacancyInput) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<VacancyInput>(
    initial
      ? {
          title: initial.title,
          emoji: initial.emoji,
          department: initial.department,
          employment: initial.employment,
          salary: initial.salary,
          location: initial.location,
          description: initial.description,
          requirements: initial.requirements,
          active: initial.active,
        }
      : empty
  );
  const [reqText, setReqText] = useState(
    (initial?.requirements || []).join("\n")
  );
  const [error, setError] = useState("");

  function set<K extends keyof VacancyInput>(key: K, value: VacancyInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit() {
    const requirements = reqText
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);
    const data = { ...form, requirements };
    if (data.title.trim().length < 2) return setError("Lavozim nomini yozing");
    if (!data.department.trim()) return setError("Bo'limni yozing");
    if (!data.salary.trim()) return setError("Maoshni yozing");
    if (!data.location.trim()) return setError("Manzilni yozing");
    if (data.description.trim().length < 5)
      return setError("Ish tavsifini to'liqroq yozing");
    setError("");
    onSubmit(data);
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-ink-950/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl animate-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">
            {initial ? "Vakansiyani tahrirlash" : "Yangi vakansiya"}
          </h2>
          <button
            onClick={onClose}
            className="h-8 w-8 grid place-items-center rounded-full text-[var(--text-muted)] hover:bg-cloud"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Emoji + nomi */}
          <div>
            <Label>Lavozim nomi</Label>
            <div className="flex gap-2">
              <select
                value={form.emoji}
                onChange={(e) => set("emoji", e.target.value)}
                className="w-16 rounded-xl border border-[var(--border)] bg-white px-2 text-xl text-center focus:border-brand-500 outline-none"
              >
                {EMOJI_OPTIONS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Masalan: Call-operator"
                className={input}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Bo&apos;lim</Label>
              <input
                value={form.department}
                onChange={(e) => set("department", e.target.value)}
                placeholder="Mijozlarga xizmat"
                className={input}
              />
            </div>
            <div>
              <Label>Bandlik turi</Label>
              <select
                value={form.employment}
                onChange={(e) => set("employment", e.target.value)}
                className={input}
              >
                {EMPLOYMENT_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Maosh</Label>
              <input
                value={form.salary}
                onChange={(e) => set("salary", e.target.value)}
                placeholder="4–6 mln so'm"
                className={input}
              />
            </div>
            <div>
              <Label>Manzil</Label>
              <input
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Toshkent, Chilonzor"
                className={input}
              />
            </div>
          </div>

          <div>
            <Label>Ish tavsifi</Label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Lavozim vazifalari haqida qisqacha…"
              className={`${input} resize-none`}
            />
          </div>

          <div>
            <Label>Talablar (har birini yangi qatordan)</Label>
            <textarea
              value={reqText}
              onChange={(e) => setReqText(e.target.value)}
              rows={4}
              placeholder={"O'zbek va rus tilini bilish\nMuloqot ko'nikmasi\nMas'uliyat"}
              className={`${input} resize-none`}
            />
          </div>

          {/* Active toggle */}
          <button
            type="button"
            onClick={() => set("active", !form.active)}
            className="w-full flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3"
          >
            <span className="text-sm font-medium text-ink-800">
              Faol (foydalanuvchilarga ko&apos;rinadi)
            </span>
            <span
              className={`relative h-6 w-11 rounded-full transition-colors ${
                form.active ? "bg-brand-500" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  form.active ? "left-[22px]" : "left-0.5"
                }`}
              />
            </span>
          </button>

          {error && (
            <p className="text-sm text-rose-600 font-medium">⚠️ {error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur px-5 py-4 border-t border-[var(--border)] flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-[var(--border)] py-3 text-sm font-medium text-ink-800"
          >
            Bekor
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex-[2] rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white disabled:opacity-60 active:scale-[0.99] transition"
          >
            {saving ? "Saqlanmoqda…" : initial ? "Saqlash" : "Qo'shish"}
          </button>
        </div>
      </div>
    </div>
  );
}

const input =
  "w-full rounded-xl border border-[var(--border)] bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-slate-400 focus:border-brand-500 outline-none transition-colors";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block mb-1.5 text-xs font-semibold text-[var(--text-muted)]">
      {children}
    </label>
  );
}
