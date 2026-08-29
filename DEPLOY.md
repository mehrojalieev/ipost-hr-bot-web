# iPOST HR — Serverga o'rnatish qo'llanmasi (DEPLOY)

Bu tizim **2 ta ilova + 1 ta baza** dan iborat, hammasi **bitta serverda** ishlaydi:

| Nomi | Bu nima | Porti |
|------|---------|-------|
| **hr-admin-panel** | Next.js — HR paneli **va** backend (API, baza, rezyume, xabar yuborish) birga | 3005 |
| **hr-telegram-bot** | Telegram bot (nomzodlar uchun) | 4747 (health) |
| **PostgreSQL** | Ma'lumotlar bazasi `ipost_hr` | 5432 |

> ⚠️ Alohida "backend" loyihasi **yo'q** — Next.js panel backendni o'z ichiga oladi.

---

## 0. Serverga qo'yiladigan dasturlar (bir marta)

Ubuntu/Debian misolida:

```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL 16
sudo apt-get install -y postgresql postgresql-contrib

# pm2 (jarayonlarni doimiy ishlatuvchi)
sudo npm install -g pm2

# git
sudo apt-get install -y git
```

> **Windows server** bo'lsa: Node.js 20, PostgreSQL 16, Git ni o'rnatgichlar orqali qo'ying; `pm2` o'sha xol  ishlaydi (`pm2 startup` o'rniga `pm2-startup` paketi). Qolgan qadamlar bir xil.

---

## 1. Kodni olish (git clone)

Ikkala repo **yonma-yon** turishi kerak:

```bash
sudo mkdir -p /opt/ipost-hr && sudo chown $USER /opt/ipost-hr
cd /opt/ipost-hr
git clone <PANEL_REPO_URL> hr-admin-panel
git clone <BOT_REPO_URL>   hr-telegram-bot
```

Natija:
```
/opt/ipost-hr/hr-admin-panel
/opt/ipost-hr/hr-telegram-bot
```

---

## 2. Ma'lumotlar bazasini yaratish

```bash
sudo -u postgres psql
```
psql ichida:
```sql
CREATE USER ipost WITH PASSWORD 'KUCHLI_PAROL_KIRITING';
CREATE DATABASE ipost_hr OWNER ipost;
\q
```

---

## 3. Maxfiy kalitlar (.env)

Har ikkala loyihada `.env.production.example` ni `.env` deb nusxalab, to'ldiring:

```bash
cd /opt/ipost-hr/hr-admin-panel && cp .env.production.example .env
cd /opt/ipost-hr/hr-telegram-bot && cp .env.production.example .env
```

**Muhim qoidalar:**
- `BOT_API_KEY` — ikkala `.env` da **AYNAN BIR XIL** bo'lsin. Yaratish: `openssl rand -hex 32`
- `BOT_TOKEN` — ikkalasida ham bir xil (bitta bot).
- Panelda `NEXT_PUBLIC_DEV_BYPASS=false` — **majburiy** (aks holda panel hammaga ochiq).
- `DATABASE_URL` — 2-qadamdagi parol bilan mos.

---

## 4. Panelni tayyorlash (baza + build)

```bash
cd /opt/ipost-hr/hr-admin-panel
npm ci
npm run db:migrate     # bazadagi jadvallarni yaratadi (prisma migrate deploy)
npm run db:seed        # boshlang'ich vakansiyalar (ixtiyoriy — bir marta)
npm run build          # ishlab chiqarish uchun build
```

## 5. Botni tayyorlash

```bash
cd /opt/ipost-hr/hr-telegram-bot
npm ci
npm run build
```

---

## 6. Ikkalasini ishga tushirish (pm2)

```bash
cd /opt/ipost-hr/hr-admin-panel
pm2 start ecosystem.config.js
pm2 save
pm2 startup     # chiqqan buyruqni nusxalab bajaring — server yonganda avto-start
```

Holatini ko'rish:
```bash
pm2 status
pm2 logs ipost-hr-panel
pm2 logs ipost-hr-bot
```

---

## 7. Tashqaridan HTTPS ulanish (Telegram WebView uchun)

Telegram Mini App (panel) **HTTPS** talab qiladi. **Tavsiya: Cloudflare Tunnel** — domen/statik IP kerak emas, bepul, sertifikat avtomatik.

```bash
# cloudflared o'rnatish (Ubuntu)
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cf.deb
sudo dpkg -i cf.deb

# Cloudflare hisobiga ulanib, doimiy tunnel yaratish (bir marta):
cloudflared tunnel login
cloudflared tunnel create ipost-hr
# Domenni panelga bog'lash (masalan hr.ipost.uz):
cloudflared tunnel route dns ipost-hr hr.ipost.uz
```
`~/.cloudflared/config.yml`:
```yaml
tunnel: ipost-hr
credentials-file: /root/.cloudflared/<TUNNEL_ID>.json
ingress:
  - hostname: hr.ipost.uz
    service: http://localhost:3005
  - service: http_status:404
```
Xizmat sifatida (doimiy) ishga tushirish:
```bash
sudo cloudflared service install
```

So'ng:
1. Botning `.env` sida `ADMIN_PANEL_URL=https://hr.ipost.uz` qiling → `pm2 restart ipost-hr-bot`.
2. Panelning `.env` sini o'zgartirмang (ichki `localhost:3005` da qoladi).

> **Muqobil:** kompaniya domeni + nginx + Let's Encrypt bilan ham bo'ladi (murakkabroq). Cloudflare Tunnel MVP uchun eng oson va xavfsiz.

---

## 8. Kunlik zaxira nusxa (backup)

```bash
chmod +x /opt/ipost-hr/hr-admin-panel/scripts/backup.sh
crontab -e
# quyidagini qo'shing (har kuni 02:00):
0 2 * * * /opt/ipost-hr/hr-admin-panel/scripts/backup.sh >> /var/log/ipost-hr-backup.log 2>&1
```

---

## 9. Kod yangilanganda (keyingi deploylar)

```bash
cd /opt/ipost-hr/hr-admin-panel && git pull && npm ci && npm run db:migrate && npm run build && pm2 restart ipost-hr-panel
cd /opt/ipost-hr/hr-telegram-bot && git pull && npm ci && npm run build && pm2 restart ipost-hr-bot
```

---

## ⚠️ Xavfsizlik yakuniy tekshiruvi (deploydan oldin)

- [ ] `NEXT_PUBLIC_DEV_BYPASS=false` (panel)
- [ ] `BOT_API_KEY` — kuchli tasodifiy, ikkala `.env` da bir xil, dev qiymati (`...change-me`) EMAS
- [ ] `HR_TELEGRAM_IDS` — faqat haqiqiy HR ID lari
- [ ] `.env` fayllari Git'ga tushmaган (`.gitignore` da bor)
- [ ] Postgres paroli kuchli, `localhost` ga cheklangan
- [ ] Backup cron ishlayapti (birinchi kuni tekshiring)
- [ ] Bot tokeni chatlarda oshkor bo'lган bo'lsa — @BotFather → /revoke → yangilash

---

## Serverdagi xodim uchun eng qisqa ro'yxat

1. Node 20 + PostgreSQL 16 + pm2 + git o'rnatish
2. 2 reponi `/opt/ipost-hr/` ga clone qilish
3. Baza + user yaratish
4. Ikkala `.env` ni to'ldirish (kalitlar bizdan)
5. Panel: `npm ci → db:migrate → db:seed → build`
6. Bot: `npm ci → build`
7. `pm2 start ecosystem.config.js → pm2 save → pm2 startup`
8. Cloudflare Tunnel (HTTPS) → `ADMIN_PANEL_URL` yangilash
9. Backup cron
