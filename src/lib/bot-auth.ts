import { NextRequest, NextResponse } from "next/server";

// Bot → panel public API himoyasi.
// Bot har so'rovga "x-api-key" header qo'shadi; u BOT_API_KEY bilan mos kelishi kerak.
// Doimiy vaqtli (timing-safe) taqqoslash.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export function botGuard(req: NextRequest): NextResponse | null {
  const expected = process.env.BOT_API_KEY || "";
  if (!expected) {
    return NextResponse.json(
      { error: "server_no_bot_key" },
      { status: 500 }
    );
  }
  const got = req.headers.get("x-api-key") || "";
  if (!got || !safeEqual(got, expected)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null; // ruxsat berildi
}
