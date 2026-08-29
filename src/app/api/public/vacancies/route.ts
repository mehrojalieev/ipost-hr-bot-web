import { NextRequest, NextResponse } from "next/server";
import { botGuard } from "@/lib/bot-auth";
import { listActiveVacancies } from "@/lib/store";

// Bot uchun — faqat FAOL vakansiyalar (2 tilli). x-api-key bilan himoyalangan.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const deny = botGuard(req);
  if (deny) return deny;

  const vacancies = await listActiveVacancies();
  return NextResponse.json({ vacancies });
}
