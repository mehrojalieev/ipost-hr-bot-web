import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/lib/guard";
import {
  getApplicationResumeMeta,
  setApplicationResume,
} from "@/lib/store";
import { downloadTelegramFile, readResumeFile } from "@/lib/resume";

// HR rezyumeni ochadi. Faqat HR (Telegram initData) ko'ra oladi. Fayl inline beriladi.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function contentType(mime?: string | null): string {
  return mime && mime.length > 0 ? mime : "application/octet-stream";
}

function safeName(name?: string | null, id?: string): string {
  const base = (name && name.trim()) || `rezyume-${id ?? "fayl"}`;
  // Sarlavhaga xavfli belgilarni olib tashlaymiz
  return base.replace(/[\r\n"]/g, "").slice(0, 120);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { deny } = guard(req);
  if (deny) return deny;

  const { id } = await params;
  const meta = await getApplicationResumeMeta(id);
  if (!meta || !meta.hasResume) {
    return NextResponse.json({ error: "no_resume" }, { status: 404 });
  }

  let relPath = meta.resumePath;

  // Fayl hali yuklab olinmagan bo'lsa — Telegram'dan hozir olamiz (zaxira yo'l)
  if (!relPath && meta.resumeFileId) {
    const dl = await downloadTelegramFile(meta.resumeFileId, id, {
      mime: meta.resumeMime,
      name: meta.resumeName,
    });
    if (dl) {
      await setApplicationResume(id, {
        resumePath: dl.resumePath,
        resumeMime: dl.resumeMime,
        resumeName: meta.resumeName,
      });
      relPath = dl.resumePath;
    }
  }

  if (!relPath) {
    return NextResponse.json({ error: "file_unavailable" }, { status: 404 });
  }

  const buf = await readResumeFile(relPath);
  if (!buf) {
    return NextResponse.json({ error: "file_unavailable" }, { status: 404 });
  }

  const filename = safeName(meta.resumeName, id);
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": contentType(meta.resumeMime),
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
