# Baraka HR — Boshqaruv paneli (Telegram Mini App)

HR bo'limi uchun **vakansiya va arizalarni boshqarish** paneli. Telegram bot ichida
Mini App sifatida ochiladi va **faqat HR** kira oladi (Telegram ID ro'yxati bo'yicha).

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4
**Dizayn:** Baraka brend — navy + teal, mobil-birinchi.

---

## Imkoniyatlar

- 📊 **Boshqaruv** — statistika (faol vakansiyalar, yangi arizalar) + so'nggi arizalar
- 💼 **Vakansiyalar** — qo'shish / tahrirlash / o'chirish / faol-nofaol qilish
- 📥 **Arizalar** — ro'yxat, holat bo'yicha filtr, tafsilot, holatni o'zgartirish, qo'ng'iroq
- 🔒 **Himoya** — Telegram `initData` HMAC imzosi tekshiriladi + HR ID ro'yxati

---

## Ishga tushirish (lokal)

```bash
npm install
cp .env.example .env.local   # va qiymatlarni to'ldiring
npm run dev                   # http://localhost:3005
```

Brauzerda ko'rish uchun `.env.local` da `NEXT_PUBLIC_DEV_BYPASS=true` — bu Telegram
tekshiruvini o'tkazib yuboradi. **Productionda albatta `false` qiling.**

### Muhit o'zgaruvchilari (.env)

| Nomi | Tavsif |
|---|---|
| `BOT_TOKEN` | Bot tokeni (Mini App imzosini tekshirish uchun — bot bilan bir xil) |
| `HR_TELEGRAM_IDS` | HR Telegram ID lari, vergul bilan. Faqat shular kira oladi. |
| `NEXT_PUBLIC_DEV_BYPASS` | `true` bo'lsa tekshiruv o'chadi (faqat lokal ishlab chiqish uchun) |

> O'z Telegram ID ingizni bilish: [@userinfobot](https://t.me/userinfobot) ga yozing.

---

## Vercel'ga deploy

1. Loyihani GitHub'ga push qiling.
2. Vercel'da **Import** qiling.
3. Environment Variables: `BOT_TOKEN`, `HR_TELEGRAM_IDS`, `NEXT_PUBLIC_DEV_BYPASS=false`.
4. Deploy → `https://sizning-panel.vercel.app` manzilini oling.

## Botga ulash (Mini App)

1. [@BotFather](https://t.me/BotFather) → `/setmenubutton` (yoki bot sozlamalari) →
   Web App URL sifatida Vercel manzilini kiriting.
2. Endi HR bot menyusidagi tugmani bosganda panel bot ichida ochiladi.

---

## ⚠️ Mock-data eslatmasi

Hozir ma'lumot **xotirada** (`src/lib/store.ts`) — demo/ko'rish uchun. Vercel
serverless da bu **saqlanmaydi**. Real saqlash uchun keyingi qadam:

- **Postgres** (Neon yoki Supabase — bepul) + Prisma
- `src/lib/store.ts` funksiyalarini DB so'rovlariga almashtirish (API va UI o'zgarmaydi)
- Bot ham shu bazadan vakansiyalarni o'qiydi (yagona manba)
