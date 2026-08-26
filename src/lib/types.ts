// Umumiy tiplar — bot bilan bir xil struktura (keyin Postgres/Prisma ga ko'chiriladi).

export interface Vacancy {
  id: string;
  title: string;
  emoji: string;
  department: string;
  employment: string;
  salary: string;
  location: string;
  description: string;
  requirements: string[];
  active: boolean;
  createdAt: string;
}

export type VacancyInput = Omit<Vacancy, "id" | "createdAt">;

export interface Application {
  id: string;
  vacancyId: string;
  vacancyTitle: string;
  name: string;
  phone: string;
  age: string;
  experience: string;
  hasResume: boolean;
  status: "new" | "reviewing" | "accepted" | "rejected";
  telegramUser: string;
  createdAt: string;
}

export const STATUS_LABELS: Record<Application["status"], string> = {
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
  topic: string; // mavzu (masalan: "Ish vaqti", "Ariza holati")
  text: string;
  status: "new" | "answered";
  createdAt: string;
}

// Vakansiya bo'yicha arizalar statistikasi (filtr/analitika uchun)
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
