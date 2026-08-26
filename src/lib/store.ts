// Mock ma'lumot ombori (xotirada). Keyinchalik Postgres + Prisma bilan almashtiriladi.
// Diqqat: Vercel serverless da xotira saqlanmaydi — bu faqat demo/mock uchun.
// Real saqlash uchun Postgres (Neon/Supabase) ulang.

import { Application, Message, Vacancy, VacancyInput, VacancyStat } from "./types";

// --- Vakansiyalar (bot bilan bir xil boshlang'ich data) ---
let vacancies: Vacancy[] = [
  {
    id: "call-operator",
    title: "Call-operator",
    emoji: "☎️",
    department: "Mijozlarga xizmat",
    employment: "To'liq stavka",
    salary: "4 000 000 – 6 000 000 so'm",
    location: "Toshkent, Chilonzor",
    description:
      "Mijozlar bilan telefon orqali ishlash, savollarga javob berish va murojaatlarni qayd etish.",
    requirements: [
      "O'zbek va rus tillarini yaxshi bilish",
      "Muloqot va tinglash qobiliyati",
      "Kompyuterda ishlash ko'nikmasi",
      "Mas'uliyat va bosiqlik",
    ],
    active: true,
    createdAt: "2026-08-20T09:00:00.000Z",
  },
  {
    id: "courier",
    title: "Kuryer",
    emoji: "🛵",
    department: "Yetkazib berish",
    employment: "To'liq / Yarim stavka",
    salary: "5 000 000 – 9 000 000 so'm",
    location: "Toshkent bo'ylab",
    description:
      "Buyurtmalarni mijozlarga o'z vaqtida va butun holatda yetkazib berish.",
    requirements: [
      "18 yoshdan katta",
      "Shahar yo'nalishlarini bilish",
      "O'z transporti bo'lishi (afzallik)",
      "Punktuallik va halollik",
    ],
    active: true,
    createdAt: "2026-08-21T09:00:00.000Z",
  },
  {
    id: "sales-manager",
    title: "Sotuv menejeri",
    emoji: "💼",
    department: "Savdo bo'limi",
    employment: "To'liq stavka",
    salary: "6 000 000 so'm + bonus",
    location: "Toshkent, Chilonzor",
    description:
      "Yangi mijozlarni jalb qilish, shartnomalar tuzish va savdo rejasini bajarish.",
    requirements: [
      "Savdo sohasida tajriba (afzallik)",
      "Natijaga yo'naltirilganlik",
      "Yaxshi muloqot ko'nikmalari",
      "CRM tizimlari bilan ishlash",
    ],
    active: true,
    createdAt: "2026-08-22T09:00:00.000Z",
  },
  {
    id: "smm",
    title: "SMM menejer",
    emoji: "📱",
    department: "Marketing",
    employment: "Masofaviy",
    salary: "5 000 000 – 8 000 000 so'm",
    location: "Toshkent / Masofaviy",
    description:
      "Ijtimoiy tarmoqlarni yuritish, kontent tayyorlash va auditoriyani oshirish.",
    requirements: [
      "Instagram, Telegram, TikTok bilan ishlash",
      "Kontent va dizaynga did",
      "Copywriting ko'nikmasi",
      "Portfolio (afzallik)",
    ],
    active: false,
    createdAt: "2026-08-19T09:00:00.000Z",
  },
];

// --- Arizalar (mock) ---
let applications: Application[] = [
  {
    id: "app-1",
    vacancyId: "call-operator",
    vacancyTitle: "Call-operator",
    name: "Dilnoza Karimova",
    phone: "+998 90 111 22 33",
    age: "23",
    experience: "1 yil call-markazda ishlaganman",
    hasResume: true,
    status: "new",
    telegramUser: "@dilnoza_k",
    createdAt: "2026-08-25T14:20:00.000Z",
  },
  {
    id: "app-2",
    vacancyId: "courier",
    vacancyTitle: "Kuryer",
    name: "Sardor Aliyev",
    phone: "+998 93 444 55 66",
    age: "27",
    experience: "2 yil kuryerlik, o'z mototsiklim bor",
    hasResume: false,
    status: "reviewing",
    telegramUser: "@sardor_a",
    createdAt: "2026-08-25T11:05:00.000Z",
  },
  {
    id: "app-3",
    vacancyId: "sales-manager",
    vacancyTitle: "Sotuv menejeri",
    name: "Malika Yusupova",
    phone: "+998 97 777 88 99",
    age: "25",
    experience: "3 yil savdo, CRM bilan ishlaganman",
    hasResume: true,
    status: "accepted",
    telegramUser: "@malika_y",
    createdAt: "2026-08-24T16:40:00.000Z",
  },
  {
    id: "app-4",
    vacancyId: "call-operator",
    vacancyTitle: "Call-operator",
    name: "Jasur Toshmatov",
    phone: "+998 91 222 33 44",
    age: "20",
    experience: "yo'q",
    hasResume: false,
    status: "new",
    telegramUser: "@jasur_t",
    createdAt: "2026-08-26T08:15:00.000Z",
  },
];

// --- Murojaatlar (nomzodlardan kelgan xabarlar, mock) ---
let messages: Message[] = [
  {
    id: "msg-1",
    name: "Dilnoza Karimova",
    telegramUser: "@dilnoza_k",
    topic: "Ariza holati",
    text: "Assalomu alaykum, Call-operator lavozimiga ariza qoldirgandim. Qachon javob bo'ladi?",
    status: "new",
    createdAt: "2026-08-26T09:10:00.000Z",
  },
  {
    id: "msg-2",
    name: "Bekzod Rahimov",
    telegramUser: "@bekzod_r",
    topic: "Ish vaqti",
    text: "Kuryer uchun ish vaqti nechchidan nechchigacha? Yarim stavka bormi?",
    status: "new",
    createdAt: "2026-08-26T08:30:00.000Z",
  },
  {
    id: "msg-3",
    name: "Nigora Islomova",
    telegramUser: "@nigora_i",
    topic: "Maosh",
    text: "Sotuv menejeri bonus tizimi qanday hisoblanadi?",
    status: "answered",
    createdAt: "2026-08-25T15:00:00.000Z",
  },
];

let idCounter = 100;
function newId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9Ѐ-ӿ]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || newId("vac")
  );
}

// ---------- Vakansiya CRUD ----------
export function listVacancies(): Vacancy[] {
  return [...vacancies].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getVacancy(id: string): Vacancy | undefined {
  return vacancies.find((v) => v.id === id);
}

export function createVacancy(input: VacancyInput): Vacancy {
  let id = slugify(input.title);
  if (vacancies.some((v) => v.id === id)) id = `${id}-${newId("v")}`;
  const vacancy: Vacancy = {
    ...input,
    id,
    createdAt: new Date().toISOString(),
  };
  vacancies.unshift(vacancy);
  return vacancy;
}

export function updateVacancy(
  id: string,
  input: VacancyInput
): Vacancy | undefined {
  const idx = vacancies.findIndex((v) => v.id === id);
  if (idx === -1) return undefined;
  vacancies[idx] = { ...vacancies[idx], ...input };
  return vacancies[idx];
}

export function deleteVacancy(id: string): boolean {
  const before = vacancies.length;
  vacancies = vacancies.filter((v) => v.id !== id);
  return vacancies.length < before;
}

// ---------- Arizalar ----------
export function listApplications(): Application[] {
  return [...applications].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export function updateApplicationStatus(
  id: string,
  status: Application["status"]
): Application | undefined {
  const app = applications.find((a) => a.id === id);
  if (!app) return undefined;
  app.status = status;
  return app;
}

// ---------- Murojaatlar ----------
export function listMessages(): Message[] {
  return [...messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function updateMessageStatus(
  id: string,
  status: Message["status"]
): Message | undefined {
  const m = messages.find((x) => x.id === id);
  if (!m) return undefined;
  m.status = status;
  return m;
}

// ---------- Vakansiya bo'yicha arizalar (analitika/filtr) ----------
export function getVacancyBreakdown(): VacancyStat[] {
  return vacancies
    .map((v) => ({
      vacancyId: v.id,
      title: v.title,
      emoji: v.emoji,
      active: v.active,
      count: applications.filter((a) => a.vacancyId === v.id).length,
    }))
    .sort((a, b) => b.count - a.count);
}

// ---------- Statistika (dashboard) ----------
export function getStats() {
  const active = vacancies.filter((v) => v.active).length;
  const newApps = applications.filter((a) => a.status === "new").length;
  const newMsgs = messages.filter((m) => m.status === "new").length;
  return {
    totalVacancies: vacancies.length,
    activeVacancies: active,
    totalApplications: applications.length,
    newApplications: newApps,
    totalMessages: messages.length,
    newMessages: newMsgs,
  };
}
