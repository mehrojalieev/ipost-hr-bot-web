import { NextRequest, NextResponse } from "next/server";
import { botGuard } from "@/lib/bot-auth";
import {
  createApplication,
  getVacancy,
  setApplicationResume,
} from "@/lib/store";
import { downloadTelegramFile } from "@/lib/resume";
import { Lang } from "@/lib/types";

// Bot → panel: yangi ariza. x-api-key bilan himoyalangan.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  vacancyId?: string;
  name?: string;
  phone?: string;
  age?: string;
  experience?: string;
  telegramId?: string | number;
  telegramUser?: string;
  lang?: string;
  resumeFileId?: string;
  resumeType?: string;
  resumeName?: string;
  resumeMime?: string;
}

export async function POST(req: NextRequest) {
  const deny = botGuard(req);
  if (deny) return deny;

  let b: Body;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  // Validatsiya
  if (!b.vacancyId) return NextResponse.json({ error: "no_vacancy" }, { status: 400 });
  if (!b.name || b.name.trim().length < 2)
    return NextResponse.json({ error: "bad_name" }, { status: 400 });
  if (!b.phone || !b.phone.trim())
    return NextResponse.json({ error: "no_phone" }, { status: 400 });

  const vacancy = await getVacancy(b.vacancyId);
  if (!vacancy) return NextResponse.json({ error: "vacancy_not_found" }, { status: 404 });

  const lang: Lang = b.lang === "ru" ? "ru" : "uz";
  const vacancyTitle = vacancy[lang].title || vacancy.uz.title;

  // Arizani yaratamiz (rezyume metadatasi bilan)
  const app = await createApplication({
    vacancyId: vacancy.id,
    vacancyTitle,
    name: b.name.trim(),
    phone: b.phone.trim(),
    age: b.age?.trim(),
    experience: b.experience?.trim(),
    telegramId: b.telegramId != null ? String(b.telegramId) : "",
    telegramUser: b.telegramUser?.trim(),
    lang,
    resumeFileId: b.resumeFileId ?? null,
    resumeType: b.resumeType ?? null,
    resumeName: b.resumeName ?? null,
    resumeMime: b.resumeMime ?? null,
  });

  // Rezyume faylini Telegram'dan yuklab olamiz (best-effort — muvaffaqiyatsiz bo'lsa ham ariza saqlanadi)
  if (b.resumeFileId) {
    const dl = await downloadTelegramFile(b.resumeFileId, app.id, {
      mime: b.resumeMime,
      name: b.resumeName,
    });
    if (dl) {
      await setApplicationResume(app.id, {
        resumePath: dl.resumePath,
        resumeMime: dl.resumeMime,
        resumeName: b.resumeName ?? null,
      });
    }
  }

  return NextResponse.json({ ok: true, id: app.id }, { status: 201 });
}
