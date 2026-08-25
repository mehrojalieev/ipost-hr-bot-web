// Telegram Mini App initData ni tekshirish (HMAC-SHA256) va HR ruxsatini nazorat qilish.
// Hujjat: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app

import crypto from "crypto";

export interface TgUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}

export interface AuthResult {
  ok: boolean;
  user?: TgUser;
  reason?: string;
}

function hrIds(): number[] {
  return (process.env.HR_TELEGRAM_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => !Number.isNaN(n));
}

// initData imzosini bot token bilan tekshiradi
export function verifyInitData(initData: string): AuthResult {
  const botToken = process.env.BOT_TOKEN;
  if (!botToken) return { ok: false, reason: "server_no_token" };
  if (!initData) return { ok: false, reason: "no_init_data" };

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return { ok: false, reason: "no_hash" };

  // data_check_string — hash dan tashqari barcha kalitlar, alifbo tartibida
  const pairs: string[] = [];
  params.forEach((value, key) => {
    if (key !== "hash") pairs.push(`${key}=${value}`);
  });
  pairs.sort();
  const dataCheckString = pairs.join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const computed = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (computed !== hash) return { ok: false, reason: "bad_signature" };

  let user: TgUser | undefined;
  try {
    const userRaw = params.get("user");
    if (userRaw) user = JSON.parse(userRaw);
  } catch {
    return { ok: false, reason: "bad_user" };
  }
  if (!user) return { ok: false, reason: "no_user" };

  return { ok: true, user };
}

// initData ni tekshirib, foydalanuvchi HR ro'yxatida ekanini ham nazorat qiladi
export function authorize(initData: string): AuthResult {
  // Development bypass — brauzerda ochib ko'rish uchun (productionda o'chiring)
  if (process.env.NEXT_PUBLIC_DEV_BYPASS === "true") {
    return {
      ok: true,
      user: { id: 0, first_name: "Dev", username: "dev_admin" },
    };
  }

  const res = verifyInitData(initData);
  if (!res.ok || !res.user) return res;

  const allow = hrIds();
  // Ro'yxat bo'sh bo'lsa — hech kimga ruxsat yo'q (xavfsiz default)
  if (allow.length === 0) {
    return { ok: false, user: res.user, reason: "no_hr_configured" };
  }
  if (!allow.includes(res.user.id)) {
    return { ok: false, user: res.user, reason: "not_authorized" };
  }
  return { ok: true, user: res.user };
}
