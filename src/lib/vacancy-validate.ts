import { VacancyInput } from "./types";

export function validate(b: Partial<VacancyInput>): string | null {
  if (!b.title || b.title.trim().length < 2) return "Lavozim nomi kerak";
  if (!b.department || !b.department.trim()) return "Bo'lim kerak";
  if (!b.salary || !b.salary.trim()) return "Maosh kerak";
  if (!b.location || !b.location.trim()) return "Manzil kerak";
  if (!b.description || b.description.trim().length < 5)
    return "Ish tavsifi kerak";
  return null;
}

export function normalize(b: Partial<VacancyInput>): VacancyInput {
  return {
    title: (b.title || "").trim(),
    emoji: b.emoji || "💼",
    department: (b.department || "").trim(),
    employment: b.employment || "To'liq stavka",
    salary: (b.salary || "").trim(),
    location: (b.location || "").trim(),
    description: (b.description || "").trim(),
    requirements: (b.requirements || []).map((r) => r.trim()).filter(Boolean),
    active: b.active ?? true,
  };
}
