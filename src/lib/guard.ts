import { NextRequest, NextResponse } from "next/server";
import { authorize, AuthResult } from "./telegram";

// Har bir himoyalangan API uchun: initData ni header dan olib, ruxsatni tekshiradi.
export function guard(req: NextRequest): { auth: AuthResult; deny?: NextResponse } {
  const initData = req.headers.get("x-telegram-init-data") || "";
  const auth = authorize(initData);
  if (!auth.ok) {
    return {
      auth,
      deny: NextResponse.json(
        { error: "unauthorized", reason: auth.reason },
        { status: 401 }
      ),
    };
  }
  return { auth };
}
