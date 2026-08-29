"use client";

import { useState } from "react";
import { X, TriangleAlert } from "lucide-react";
import {
  EMOJI_OPTIONS,
  EMPLOYMENT_OPTIONS,
  Lang,
  Vacancy,
  VacancyContent,
  VacancyInput,
} from "@/lib/types";
import { SheetShell } from "@/components/ui";

const emptyContent: VacancyContent = {
  title: "",
  department: "",
  employment: "To'liq stavka",
  salary: "",
  location: "",
  description: "",
  requirements: [],
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
  const [emoji, setEmoji] = useState(initial?.emoji || "💼");
  const [active, setActive] = useState(initial?.active ?? true);
  const [uz, setUz] = useState<VacancyContent>(initial?.uz || emptyContent);
  const [ru, setRu] = useState<VacancyContent>(
    initial?.ru || { ...emptyContent, employment: "" }
  );
  const [reqUz, setReqUz] = useState((initial?.uz.requirements || []).join("\n"));
  const [reqRu, setReqRu] = useState((initial?.ru.requirements || []).join("\n"));
  const [tab, setTab] = useState<Lang>("uz");
  const [error, setError] = useState("");

  const cur = tab === "uz" ? uz : ru;
  const setCur = tab === "uz" ? setUz : setRu;
  const reqText = tab === "uz" ? reqUz : reqRu;
  const setReqText = tab === "uz" ? setReqUz : setReqRu;

  function setField<K extends keyof VacancyContent>(
    key: K,
    value: VacancyContent[K]
  ) {
    setCur((c) => ({ ...c, [key]: value }));
  }

  function submit() {
    const uzData: VacancyContent = {
      ...uz,
      requirements: reqUz.split("\n").map((r) => r.trim()).filter(Boolean),
    };
    const ruData: VacancyContent = {
      ...ru,
      requirements: reqRu.split("\n").map((r) => r.trim()).filter(Boolean),
    };
    // UZ majburiy
    if (uzData.title.trim().length < 2)
      return fail("Lavozim nomini yozing (o'zbekcha)", "uz");
    if (!uzData.department.trim()) return fail("Bo'limni yozing (o'zbekcha)", "uz");
    if (!uzData.salary.trim()) return fail("Maoshni yozing (o'zbekcha)", "uz");
    if (!uzData.location.trim()) return fail("Manzilni yozing (o'zbekcha)", "uz");
    if (uzData.description.trim().length < 5)
      return fail("Ish tavsifini to'liqroq yozing (o'zbekcha)", "uz");
    setError("");
    onSubmit({ emoji, active, uz: uzData, ru: ruData });
  }

  function fail(msg: string, goTab: Lang) {
    setTab(goTab);
    setError(msg);
  }

  return (
    <SheetShell onClose={onClose}>
      {(close) => (
        <>
          {/* Header */}
          <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="font-semibold text-content">
              {initial ? "Vakansiyani tahrirlash" : "Yangi vakansiya"}
            </h2>
            <button
              onClick={close}
              aria-label="Yopish"
              className="h-8 w-8 grid place-items-center rounded-full text-[var(--text-muted)] hover:bg-cloud"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Emoji (umumiy) */}
            <div>
              <Label>Belgi (emoji)</Label>
              <select
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-16 rounded-xl border border-[var(--border)] bg-surface px-2 py-2 text-xl text-center focus:border-brand-500 outline-none"
              >
                {EMOJI_OPTIONS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>

            {/* Til tab */}
            <div className="flex gap-1 rounded-xl bg-cloud p-1">
              {(["uz", "ru"] as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setTab(l)}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                    tab === l
                      ? "bg-surface text-brand-600 shadow-sm"
                      : "text-[var(--text-muted)] hover:text-content"
                  }`}
                >
                  {l === "uz" ? "🇺🇿 O'zbekcha" : "🇷🇺 Ruscha"}
                </button>
              ))}
            </div>

            {tab === "ru" && (
              <p className="text-xs text-[var(--text-muted)] -mt-1">
                Ixtiyoriy — bo&apos;sh qolsa, o&apos;zbekcha matndan olinadi.
              </p>
            )}

            {/* Kontent (tanlangan til) */}
            <div>
              <Label>Lavozim nomi</Label>
              <input
                value={cur.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder={tab === "uz" ? "Call-operator" : "Оператор call-центра"}
                className={input}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Bo&apos;lim</Label>
                <input
                  value={cur.department}
                  onChange={(e) => setField("department", e.target.value)}
                  placeholder={tab === "uz" ? "Mijozlarga xizmat" : "Клиентский сервис"}
                  className={input}
                />
              </div>
              <div>
                <Label>Bandlik turi</Label>
                <input
                  value={cur.employment}
                  onChange={(e) => setField("employment", e.target.value)}
                  list={`emp-${tab}`}
                  placeholder={tab === "uz" ? "To'liq stavka" : "Полная ставка"}
                  className={input}
                />
                <datalist id={`emp-${tab}`}>
                  {EMPLOYMENT_OPTIONS.map((o) => (
                    <option key={o} value={o} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Maosh</Label>
                <input
                  value={cur.salary}
                  onChange={(e) => setField("salary", e.target.value)}
                  placeholder={tab === "uz" ? "4–6 mln so'm" : "4–6 млн сум"}
                  className={input}
                />
              </div>
              <div>
                <Label>Manzil</Label>
                <input
                  value={cur.location}
                  onChange={(e) => setField("location", e.target.value)}
                  placeholder={tab === "uz" ? "Toshkent, Chilonzor" : "Ташкент, Чиланзар"}
                  className={input}
                />
              </div>
            </div>

            <div>
              <Label>Ish tavsifi</Label>
              <textarea
                value={cur.description}
                onChange={(e) => setField("description", e.target.value)}
                rows={3}
                placeholder={
                  tab === "uz"
                    ? "Lavozim vazifalari haqida qisqacha…"
                    : "Кратко об обязанностях…"
                }
                className={`${input} resize-none`}
              />
            </div>

            <div>
              <Label>Talablar (har birini yangi qatordan)</Label>
              <textarea
                value={reqText}
                onChange={(e) => setReqText(e.target.value)}
                rows={4}
                placeholder={
                  tab === "uz"
                    ? "O'zbek va rus tilini bilish\nMuloqot ko'nikmasi\nMas'uliyat"
                    : "Знание узбекского и русского\nНавыки общения\nОтветственность"
                }
                className={`${input} resize-none`}
              />
            </div>

            {/* Active toggle (umumiy) */}
            <button
              type="button"
              onClick={() => setActive((v) => !v)}
              className="w-full flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3"
            >
              <span className="text-sm font-medium text-content">
                Faol (foydalanuvchilarga ko&apos;rinadi)
              </span>
              <span
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  active ? "bg-brand-500" : "bg-slate-300 dark:bg-slate-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow transition-all ${
                    active ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </span>
            </button>

            {error && (
              <p className="inline-flex items-center gap-1.5 text-sm text-rose-600 font-medium">
                <TriangleAlert size={15} /> {error}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-surface/95 backdrop-blur px-5 py-4 border-t border-[var(--border)] flex gap-2.5">
            <button
              onClick={close}
              className="flex-1 rounded-xl border border-[var(--border)] py-3 text-sm font-medium text-content hover:bg-cloud transition-colors"
            >
              Bekor
            </button>
            <button
              onClick={submit}
              disabled={saving}
              className="flex-1 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 active:scale-[0.99] transition"
            >
              {saving ? "Saqlanmoqda…" : initial ? "Saqlash" : "Qo'shish"}
            </button>
          </div>
        </>
      )}
    </SheetShell>
  );
}

const input =
  "w-full rounded-xl border border-[var(--border)] bg-surface px-3.5 py-2.5 text-sm text-content placeholder:text-slate-400 focus:border-brand-500 outline-none transition-colors";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block mb-1.5 text-xs font-semibold text-[var(--text-muted)]">
      {children}
    </label>
  );
}
