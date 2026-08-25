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
