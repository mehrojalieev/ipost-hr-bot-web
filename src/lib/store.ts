// Ma'lumot ombori — real PostgreSQL (Prisma orqali). Bot va panel shu bazadan foydalanadi.
// Funksiya nomlari o'zgarmadi; endi async va bilingual (uz/ru).

import type {
  Application as PApplication,
  Message as PMessage,
  Prisma,
  Vacancy as PVacancy,
} from "@prisma/client";
import { prisma } from "./prisma";
import {
  Application,
  ApplicationStatus,
  Lang,
  Message,
  Vacancy,
  VacancyContent,
  VacancyInput,
  VacancyStat,
} from "./types";

// ---------- Prisma → API tiplariga aylantirish ----------
function asContent(v: Prisma.JsonValue): VacancyContent {
  const o = (v ?? {}) as Record<string, unknown>;
  return {
    title: String(o.title ?? ""),
    department: String(o.department ?? ""),
    employment: String(o.employment ?? ""),
    salary: String(o.salary ?? ""),
    location: String(o.location ?? ""),
    description: String(o.description ?? ""),
    requirements: Array.isArray(o.requirements)
      ? (o.requirements as unknown[]).map((x) => String(x))
      : [],
  };
}

function toVacancy(v: PVacancy): Vacancy {
  return {
    id: v.id,
    emoji: v.emoji,
    active: v.active,
    uz: asContent(v.uz),
    ru: asContent(v.ru),
    createdAt: v.createdAt.toISOString(),
  };
}

function toApplication(a: PApplication): Application {
  return {
    id: a.id,
    vacancyId: a.vacancyId,
    vacancyTitle: a.vacancyTitle,
    name: a.name,
    phone: a.phone,
    age: a.age,
    experience: a.experience,
    hasResume: a.hasResume,
    status: a.status,
    telegramUser: a.telegramUser,
    lang: (a.lang === "ru" ? "ru" : "uz") as Lang,
    resumeType: a.resumeType,
    resumeName: a.resumeName,
    createdAt: a.createdAt.toISOString(),
  };
}

function toMessage(m: PMessage): Message {
  return {
    id: m.id,
    name: m.name,
    telegramUser: m.telegramUser,
    topic: m.topic,
    text: m.text,
    status: m.status,
    createdAt: m.createdAt.toISOString(),
  };
}

function contentToJson(c: VacancyContent): Prisma.InputJsonValue {
  return {
    title: c.title,
    department: c.department,
    employment: c.employment,
    salary: c.salary,
    location: c.location,
    description: c.description,
    requirements: c.requirements,
  };
}

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9Ѐ-ӿ]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "vacancy"
  );
}

// ---------- Vakansiya CRUD ----------
export async function listVacancies(): Promise<Vacancy[]> {
  const rows = await prisma.vacancy.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(toVacancy);
}

// Faqat faol vakansiyalar (bot uchun)
export async function listActiveVacancies(): Promise<Vacancy[]> {
  const rows = await prisma.vacancy.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toVacancy);
}

export async function getVacancy(id: string): Promise<Vacancy | undefined> {
  const v = await prisma.vacancy.findUnique({ where: { id } });
  return v ? toVacancy(v) : undefined;
}

export async function createVacancy(input: VacancyInput): Promise<Vacancy> {
  const base = slugify(input.uz.title || input.ru.title);
  let id = base;
  for (let n = 2; await prisma.vacancy.findUnique({ where: { id } }); n++) {
    id = `${base}-${n}`;
  }
  const v = await prisma.vacancy.create({
    data: {
      id,
      emoji: input.emoji,
      active: input.active,
      uz: contentToJson(input.uz),
      ru: contentToJson(input.ru),
    },
  });
  return toVacancy(v);
}

export async function updateVacancy(
  id: string,
  input: VacancyInput
): Promise<Vacancy | undefined> {
  try {
    const v = await prisma.vacancy.update({
      where: { id },
      data: {
        emoji: input.emoji,
        active: input.active,
        uz: contentToJson(input.uz),
        ru: contentToJson(input.ru),
      },
    });
    return toVacancy(v);
  } catch {
    return undefined;
  }
}

export async function deleteVacancy(id: string): Promise<boolean> {
  try {
    await prisma.vacancy.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// ---------- Arizalar ----------
export async function listApplications(): Promise<Application[]> {
  const rows = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toApplication);
}

export async function getApplication(
  id: string
): Promise<Application | undefined> {
  const a = await prisma.application.findUnique({ where: { id } });
  return a ? toApplication(a) : undefined;
}

// Rezyume fayl ma'lumotini olish (himoyalangan endpoint uchun — path/mime kerak)
export async function getApplicationResumeMeta(id: string) {
  const a = await prisma.application.findUnique({
    where: { id },
    select: {
      resumePath: true,
      resumeMime: true,
      resumeName: true,
      resumeType: true,
      resumeFileId: true,
      hasResume: true,
    },
  });
  return a ?? undefined;
}

// Xabar yuborish uchun kerakli maydonlar (telegramId sensitive — clientga chiqmaydi)
export async function getApplicationNotifyInfo(id: string) {
  return prisma.application.findUnique({
    where: { id },
    select: { telegramId: true, lang: true, vacancyTitle: true, name: true },
  });
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
): Promise<Application | undefined> {
  try {
    const a = await prisma.application.update({
      where: { id },
      data: { status },
    });
    return toApplication(a);
  } catch {
    return undefined;
  }
}

export interface NewApplicationInput {
  vacancyId: string;
  vacancyTitle: string;
  name: string;
  phone: string;
  age?: string;
  experience?: string;
  telegramId?: string;
  telegramUser?: string;
  lang?: Lang;
  resumeFileId?: string | null;
  resumeType?: string | null;
  resumeName?: string | null;
  resumeMime?: string | null;
  resumePath?: string | null;
}

export async function createApplication(
  input: NewApplicationInput
): Promise<Application> {
  const a = await prisma.application.create({
    data: {
      vacancyId: input.vacancyId,
      vacancyTitle: input.vacancyTitle,
      name: input.name,
      phone: input.phone,
      age: input.age ?? "",
      experience: input.experience ?? "",
      telegramId: input.telegramId ?? "",
      telegramUser: input.telegramUser ?? "",
      lang: input.lang ?? "uz",
      hasResume: Boolean(input.resumeFileId || input.resumePath),
      resumeFileId: input.resumeFileId ?? null,
      resumeType: input.resumeType ?? null,
      resumeName: input.resumeName ?? null,
      resumeMime: input.resumeMime ?? null,
      resumePath: input.resumePath ?? null,
    },
  });
  return toApplication(a);
}

// Rezyume yuklab olingach — path/mime'ni yozib qo'yish
export async function setApplicationResume(
  id: string,
  data: { resumePath: string; resumeMime?: string | null; resumeName?: string | null }
): Promise<void> {
  await prisma.application.update({
    where: { id },
    data: {
      resumePath: data.resumePath,
      resumeMime: data.resumeMime ?? undefined,
      resumeName: data.resumeName ?? undefined,
      hasResume: true,
    },
  });
}

// ---------- Murojaatlar ----------
export async function listMessages(): Promise<Message[]> {
  const rows = await prisma.message.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(toMessage);
}

export async function updateMessageStatus(
  id: string,
  status: Message["status"]
): Promise<Message | undefined> {
  try {
    const m = await prisma.message.update({ where: { id }, data: { status } });
    return toMessage(m);
  } catch {
    return undefined;
  }
}

// ---------- Vakansiya bo'yicha arizalar (analitika/filtr) ----------
export async function getVacancyBreakdown(): Promise<VacancyStat[]> {
  const [vacancies, grouped] = await Promise.all([
    prisma.vacancy.findMany(),
    prisma.application.groupBy({ by: ["vacancyId"], _count: { _all: true } }),
  ]);
  const counts = new Map(grouped.map((g) => [g.vacancyId, g._count._all]));
  return vacancies
    .map((v) => ({
      vacancyId: v.id,
      title: asContent(v.uz).title,
      emoji: v.emoji,
      active: v.active,
      count: counts.get(v.id) ?? 0,
    }))
    .sort((a, b) => b.count - a.count);
}

// ---------- Statistika (dashboard) ----------
export async function getStats() {
  const [
    totalVacancies,
    activeVacancies,
    totalApplications,
    newApplications,
    totalMessages,
    newMessages,
  ] = await Promise.all([
    prisma.vacancy.count(),
    prisma.vacancy.count({ where: { active: true } }),
    prisma.application.count(),
    prisma.application.count({ where: { status: "new" } }),
    prisma.message.count(),
    prisma.message.count({ where: { status: "new" } }),
  ]);
  return {
    totalVacancies,
    activeVacancies,
    totalApplications,
    newApplications,
    totalMessages,
    newMessages,
  };
}
