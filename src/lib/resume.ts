// Rezyume fayllari bilan ishlash: Telegram'dan yuklab olish va serverda saqlash.
// Fayllar public EMAS — faqat himoyalangan /api/resume/[id] orqali beriladi.

import { promises as fs } from "fs";
import path from "path";

// Loyiha ildizidagi uploads/ (public'dan tashqarida — internetdan ko'rinmaydi)
export const UPLOAD_DIR = path.join(process.cwd(), "uploads", "resumes");

function extFromMimeOrName(mime?: string | null, name?: string | null): string {
  if (name && name.includes(".")) {
    const e = name.split(".").pop();
    if (e && e.length <= 5) return "." + e.toLowerCase();
  }
  const map: Record<string, string> = {
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };
  return (mime && map[mime]) || ".bin";
}

interface DownloadResult {
  resumePath: string; // uploads/resumes/… (loyiha ildizidan nisbiy)
  resumeMime: string | null;
}

// Telegram file_id orqali faylni yuklab, diskka saqlaydi. Xato bo'lsa null qaytadi (ariza baribir saqlanadi).
export async function downloadTelegramFile(
  fileId: string,
  appId: string,
  meta: { mime?: string | null; name?: string | null }
): Promise<DownloadResult | null> {
  const token = process.env.BOT_TOKEN;
  if (!token || !fileId) return null;

  try {
    // 1) getFile — file_path olamiz
    const infoRes = await fetch(
      `https://api.telegram.org/bot${token}/getFile?file_id=${encodeURIComponent(fileId)}`
    );
    const info = (await infoRes.json()) as {
      ok: boolean;
      result?: { file_path?: string };
    };
    if (!info.ok || !info.result?.file_path) return null;

    // 2) faylni yuklab olamiz
    const fileRes = await fetch(
      `https://api.telegram.org/file/bot${token}/${info.result.file_path}`
    );
    if (!fileRes.ok) return null;
    const buf = Buffer.from(await fileRes.arrayBuffer());

    // 3) diskka yozamiz
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const ext = extFromMimeOrName(meta.mime, meta.name || info.result.file_path);
    const abs = path.join(UPLOAD_DIR, `${appId}${ext}`);
    await fs.writeFile(abs, buf);

    const rel = path.relative(process.cwd(), abs);
    return { resumePath: rel, resumeMime: meta.mime ?? null };
  } catch (e) {
    console.error("Rezyume yuklab olishda xatolik:", e);
    return null;
  }
}

// Saqlangan faylni o'qish (himoyalangan serve endpoint uchun)
export async function readResumeFile(
  relPath: string
): Promise<Buffer | null> {
  try {
    const abs = path.isAbsolute(relPath)
      ? relPath
      : path.join(process.cwd(), relPath);
    // Xavfsizlik: faqat UPLOAD_DIR ichidagi fayllar
    const resolved = path.resolve(abs);
    if (!resolved.startsWith(path.resolve(process.cwd(), "uploads"))) return null;
    return await fs.readFile(resolved);
  } catch {
    return null;
  }
}
