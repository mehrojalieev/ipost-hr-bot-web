import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/lib/guard";
import {
  getApplicationNotifyInfo,
  updateApplicationStatus,
} from "@/lib/store";
import { notifyCandidate, shouldNotify } from "@/lib/notify";
import { Application, Lang } from "@/lib/types";

export const runtime = "nodejs";

const VALID: Application["status"][] = [
  "new",
  "reviewing",
  "accepted",
  "rejected",
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { deny } = guard(req);
  if (deny) return deny;
  const { id } = await params;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const status = body?.status as Application["status"];
  if (!VALID.includes(status)) {
    return NextResponse.json({ error: "bad_status" }, { status: 400 });
  }

  const app = await updateApplicationStatus(id, status);
  if (!app) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Muhim qarorlarda nomzodga Telegram xabar yuboramiz (statusni buzmaydi)
  let notified = false;
  if (shouldNotify(status)) {
    const info = await getApplicationNotifyInfo(id);
    if (info?.telegramId) {
      notified = await notifyCandidate({
        telegramId: info.telegramId,
        status,
        lang: (info.lang === "ru" ? "ru" : "uz") as Lang,
        vacancyTitle: info.vacancyTitle,
        name: info.name,
      });
    }
  }

  return NextResponse.json({ application: app, notified });
}
