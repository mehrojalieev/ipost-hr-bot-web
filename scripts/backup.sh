#!/usr/bin/env bash
# ============================================================
#  iPOST HR — DB va rezyume fayllar zaxira nusxasi (backup)
#  Har kuni ishlashi uchun cron'ga qo'ying (pastga qarang).
# ============================================================
set -euo pipefail

# --- Sozlamalar ---
DB_NAME="ipost_hr"
DB_USER="ipost"                       # DATABASE_URL dagi foydalanuvchi
BACKUP_DIR="/var/backups/ipost-hr"    # zaxiralar saqlanadigan joy
UPLOADS_DIR="/opt/ipost-hr/hr-admin-panel/uploads"  # rezyume fayllar
KEEP_DAYS=14                          # necha kunlik nusxa saqlansin

STAMP="$(date +%Y-%m-%d_%H%M)"
mkdir -p "$BACKUP_DIR"

# 1) Bazani dump qilish (gzip bilan)
pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_DIR/db_${STAMP}.sql.gz"

# 2) Rezyume fayllarni arxivlash (agar mavjud bo'lsa)
if [ -d "$UPLOADS_DIR" ]; then
  tar -czf "$BACKUP_DIR/uploads_${STAMP}.tar.gz" -C "$(dirname "$UPLOADS_DIR")" "$(basename "$UPLOADS_DIR")"
fi

# 3) Eski nusxalarni tozalash
find "$BACKUP_DIR" -type f -name "*.gz" -mtime +"$KEEP_DAYS" -delete

echo "[$(date)] Backup tayyor: $BACKUP_DIR (db_${STAMP}.sql.gz)"

# ------------------------------------------------------------
#  CRON (har kuni soat 02:00 da):
#    crontab -e
#    0 2 * * * /opt/ipost-hr/hr-admin-panel/scripts/backup.sh >> /var/log/ipost-hr-backup.log 2>&1
#
#  Tiklash (restore):
#    gunzip -c db_2026-08-29_0200.sql.gz | psql -U ipost ipost_hr
# ------------------------------------------------------------
