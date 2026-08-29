import { VacancyContent, VacancyInput } from "./types";

type PartialContent = Partial<VacancyContent> | undefined;

interface RawVacancyInput {
  emoji?: string;
  active?: boolean;
  uz?: PartialContent;
  ru?: PartialContent;
}

// UZ majburiy (asosiy til). RU ixtiyoriy — bo'sh bo'lsa UZ'ga fallback qilinadi.
export function validate(b: RawVacancyInput): string | null {
  const uz = b.uz || {};
  if (!uz.title || uz.title.trim().length < 2) return "Lavozim nomi (UZ) kerak";
  if (!uz.department || !uz.department.trim()) return "Bo'lim (UZ) kerak";
  if (!uz.salary || !uz.salary.trim()) return "Maosh (UZ) kerak";
  if (!uz.location || !uz.location.trim()) return "Manzil (UZ) kerak";
  if (!uz.description || uz.description.trim().length < 5)
    return "Ish tavsifi (UZ) kerak";
  return null;
}

function normContent(c: PartialContent): VacancyContent {
  const o = c || {};
  return {
    title: (o.title || "").trim(),
    department: (o.department || "").trim(),
    employment: (o.employment || "To'liq stavka").trim(),
    salary: (o.salary || "").trim(),
    location: (o.location || "").trim(),
    description: (o.description || "").trim(),
    requirements: (o.requirements || []).map((r) => String(r).trim()).filter(Boolean),
  };
}

// RU maydonlari bo'sh bo'lsa — UZ qiymatiga tushadi (bot bo'sh ko'rsatmasligi uchun)
function withFallback(ru: VacancyContent, uz: VacancyContent): VacancyContent {
  return {
    title: ru.title || uz.title,
    department: ru.department || uz.department,
    employment: ru.employment || uz.employment,
    salary: ru.salary || uz.salary,
    location: ru.location || uz.location,
    description: ru.description || uz.description,
    requirements: ru.requirements.length ? ru.requirements : uz.requirements,
  };
}

export function normalize(b: RawVacancyInput): VacancyInput {
  const uz = normContent(b.uz);
  const ru = withFallback(normContent(b.ru), uz);
  return {
    emoji: b.emoji || "💼",
    active: b.active ?? true,
    uz,
    ru,
  };
}
