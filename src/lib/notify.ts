// Nomzodga Telegram orqali xabar yuborish (panel → bot tokeni orqali to'g'ridan-to'g'ri).
// Faqat muhim qarorlarda: reviewing / accepted / rejected.

import { ApplicationStatus, Lang } from "./types";

// Qaysi statuslarda xabar yuboriladi
const NOTIFY_STATUSES: ApplicationStatus[] = ["reviewing", "accepted", "rejected"];

export function shouldNotify(status: ApplicationStatus): boolean {
  return NOTIFY_STATUSES.includes(status);
}

function message(
  status: ApplicationStatus,
  lang: Lang,
  vacancyTitle: string,
  name: string
): string | null {
  const v = vacancyTitle;
  if (lang === "ru") {
    switch (status) {
      case "reviewing":
        return `👀 <b>Ваша заявка на рассмотрении</b>\n\nЗдравствуйте, ${name}! Ваша заявка на вакансию «${v}» принята и сейчас рассматривается. Мы сообщим вам о результате.`;
      case "accepted":
        return `🎉 <b>Поздравляем!</b>\n\n${name}, ваша заявка на вакансию «${v}» одобрена. HR-менеджер свяжется с вами в ближайшее время.`;
      case "rejected":
        return `🙏 <b>Спасибо за интерес</b>\n\n${name}, к сожалению, по вакансии «${v}» мы продолжим с другими кандидатами. Желаем успехов — будем рады видеть вас снова!`;
      default:
        return null;
    }
  }
  // O'zbekcha (default)
  switch (status) {
    case "reviewing":
      return `👀 <b>Arizangiz ko'rib chiqilmoqda</b>\n\nAssalomu alaykum, ${name}! «${v}» lavozimiga arizangiz qabul qilindi va hozir ko'rib chiqilmoqda. Natija haqida xabar beramiz.`;
    case "accepted":
      return `🎉 <b>Tabriklaymiz!</b>\n\n${name}, «${v}» lavozimiga arizangiz ma'qullandi. HR menejer tez orada siz bilan bog'lanadi.`;
    case "rejected":
      return `🙏 <b>E'tiboringiz uchun rahmat</b>\n\n${name}, afsuski «${v}» lavozimi bo'yicha bu safar boshqa nomzodlar bilan davom etamiz. Sizga omad tilaymiz — yana kutib qolamiz!`;
    default:
      return null;
  }
}

// Nomzodga xabar yuboradi. Muvaffaqiyatli bo'lsa true. Xato bo'lsa false (statusni buzmaydi).
export async function notifyCandidate(params: {
  telegramId: string;
  status: ApplicationStatus;
  lang: Lang;
  vacancyTitle: string;
  name: string;
}): Promise<boolean> {
  const token = process.env.BOT_TOKEN;
  if (!token) return false;
  if (!params.telegramId) return false;
  if (!shouldNotify(params.status)) return false;

  const text = message(params.status, params.lang, params.vacancyTitle, params.name);
  if (!text) return false;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: params.telegramId,
        text,
        parse_mode: "HTML",
      }),
    });
    const data = (await res.json()) as { ok: boolean };
    return data.ok === true;
  } catch (e) {
    console.error("Nomzodga xabar yuborishda xatolik:", e);
    return false;
  }
}
