import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/telegram";

// Mini App ochilganda: initData ni tekshirib, kirish ruxsatini qaytaradi.
export async function POST(req: NextRequest) {
  let initData = "";
  try {
    const body = await req.json();
    initData = body?.initData || "";
  } catch {
    /* bo'sh */
  }
  const auth = authorize(initData);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, reason: auth.reason, user: auth.user ?? null },
      { status: 401 }
    );
  }
  return NextResponse.json({ ok: true, user: auth.user });
}
