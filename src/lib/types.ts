// Umumiy tiplar — bot bilan bir xil struktura (bilingual). Manba: PostgreSQL (Prisma).

export type Lang = "uz" | "ru";

// Bitta til uchun vakansiya kontenti
export interface VacancyContent {
  title: string;
  department: string;
  employment: string;
  salary: string;
  location: string;
  description: string;
  requirements: string[];
}

// Vakansiya — 2 tilli
export interface Vacancy {
  id: string;
  emoji: string;
  active: boolean;
  uz: VacancyContent;
  ru: VacancyContent;
  createdAt: string;
}

export type VacancyInput = Omit<Vacancy, "id" | "createdAt">;

export type ApplicationStatus = "new" | "reviewing" | "accepted" | "rejected";

export interface Application {
  id: string;
  vacancyId: string;
  vacancyTitle: string;
  name: string;
  phone: string;
  age: string;
  experience: string;
  hasResume: boolean;
  status: ApplicationStatus;
  telegramUser: string;
  lang: Lang;
  // Rezyume metadatasi (UI uchun; fayl yo'li/mime backendda qoladi)
  resumeType?: string | null;
  resumeName?: string | null;
  createdAt: string;
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: "Yangi",
  reviewing: "Ko'rilmoqda",
  accepted: "Qabul qilindi",
  rejected: "Rad etildi",
};

// Nomzod/xodim tomonidan yuborilgan murojaat/xabar
export interface Message {
  id: string;
  name: string;
  telegramUser: string;
  topic: string;
  text: string;
  status: "new" | "answered";
  createdAt: string;
}

// Vakansiya bo'yicha arizalar statistikasi (o'zbekcha nom bilan ko'rsatiladi)
export interface VacancyStat {
  vacancyId: string;
  title: string;
  emoji: string;
  count: number;
  active: boolean;
}

export const EMPLOYMENT_OPTIONS = [
  "To'liq stavka",
  "Yarim stavka",
  "To'liq / Yarim stavka",
  "Masofaviy",
  "Amaliyot (stajirovka)",
];

export const EMOJI_OPTIONS = [
  "☎️", "🛵", "💼", "📱", "🧑‍💻", "🎨", "📊", "🛠", "🏬", "🚚", "🧾", "🤝",
];
